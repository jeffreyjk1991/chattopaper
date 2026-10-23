/* ChattoPaper — private WhatsApp import, with a bundled ZIP compatibility fallback.
 *
 * ChatImport.parse(text, {dateOrder: 'auto'|'DMY'|'MDY'}) returns:
 *   {messages, participants, dateOrder, ambiguousDates, warnings, stats}.
 * Message timestamps are UTC-based numbers representing the exported LOCAL
 * clock. They must not be converted to another timezone. dateKey is YYYY-MM-DD.
 * Undated content is preserved with timestamp/dateKey null and invalidTimestamp.
 *
 * ChatImport.readFiles(File[][, {onProgress}]) returns Promise<{
 *   text, fileName, chatFileName, media: Map<normalized basename,
 *   {name, blob, type, ambiguous?, unsupported?}>, warnings
 * }>.
 * Object URLs are deliberately not created; the UI owns their lifetime.
 * ChatImport.linkMedia(messages, media) returns a new messages array plus counts;
 * matched attachments have status:'matched' and .media containing the Blob.
 */
(function (root, factory) {
  'use strict';
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChatImport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const MB = 1024 * 1024;
  const LIMITS = Object.freeze({
    uploadBytes: 100 * MB,
    zipUploadBytes: 300 * MB,
    expandedBytes: 250 * MB,
    entryBytes: 40 * MB,
    chatBytes: 20 * MB,
    entries: 5000,
    messages: 20000,
  });
  const PHOTO_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
  const PHOTO_TYPES = {jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif'};
  const CONTROLS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g;
  const DATE_TOKEN = '(\\d{1,4}[/.\\-]\\d{1,2}[/.\\-]\\d{1,4})';
  const TIME_TOKEN = '(\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s*[ap]\\.?\\s*m\\.?)?)';
  const IOS_HEADER = new RegExp('^\\s*\\[' + DATE_TOKEN + ',?\\s+' + TIME_TOKEN + '\\]\\s*(.*)$', 'i');
  const ANDROID_HEADER = new RegExp('^\\s*' + DATE_TOKEN + '(?:,\\s*|\\s+)' + TIME_TOKEN + '\\s+[-–]\\s(.*)$', 'i');
  const pad = value => String(value).padStart(2, '0');

  class ImportError extends Error {
    constructor(code, message) { super(message); this.name = 'ImportError'; this.code = code; }
  }
  function fail(code, message) { throw new ImportError(code, message); }
  function basename(name) { return String(name).replace(/\\/g, '/').split('/').pop(); }
  function normalizeFilename(name) {
    // Case-sensitive matching avoids attaching a different photo on filesystems
    // where IMG.jpg and img.jpg are separate files.
    return basename(String(name).replace(CONTROLS, '').trim()).normalize('NFC');
  }
  function photoType(name) { return PHOTO_TYPES[basename(name).split('.').pop().toLowerCase()] || 'application/octet-stream'; }
  function detectHeader(line) {
    const clean = line.replace(CONTROLS, '');
    const match = IOS_HEADER.exec(clean) || ANDROID_HEADER.exec(clean);
    if (!match) return null;
    // Locate the body in the original line so directional controls in Arabic,
    // Hebrew or quoted text survive. Only header recognition uses cleaned text.
    const bodyStart = clean.length - match[3].length;
    let sourceOffset = 0, cleanOffset = 0;
    while (sourceOffset < line.length && cleanOffset < bodyStart) {
      const code = line.charCodeAt(sourceOffset++);
      if (code !== 0x200e && code !== 0x200f && code !== 0xfeff && !(code >= 0x202a && code <= 0x202e) && !(code >= 0x2066 && code <= 0x2069)) cleanOffset++;
    }
    return {date: match[1], time: match[2].trim(), body: line.slice(sourceOffset), rawTimestamp: match[1] + ', ' + match[2].trim()};
  }
  function dateParts(token) { return token.split(/[/.\-]/).map(Number); }
  function inferOrder(headers, requested) {
    if (requested === 'DMY' || requested === 'MDY') return {order: requested, ambiguous: false, mixed: false};
    let dmy = false, mdy = false, ambiguous = false;
    for (const header of headers) {
      const parts = dateParts(header.date);
      if (header.date.split(/[/.\-]/)[0].length === 4) continue;
      if (parts[0] > 12 && parts[1] <= 12) dmy = true;
      else if (parts[1] > 12 && parts[0] <= 12) mdy = true;
      else if (parts[0] <= 12 && parts[1] <= 12 && parts[0] !== parts[1]) ambiguous = true;
    }
    return {order: dmy && !mdy ? 'DMY' : 'MDY', ambiguous: (!dmy && !mdy && ambiguous) || (dmy && mdy), mixed: dmy && mdy};
  }
  function parseTimestamp(dateToken, timeToken, order) {
    const rawParts = dateToken.split(/[/.\-]/);
    const [a, b, c] = rawParts.map(Number);
    let year, month, day;
    if (rawParts[0].length === 4) { year = a; month = b; day = c; }
    else {
      if (![2, 4].includes(rawParts[2].length)) return null;
      year = rawParts[2].length === 2 ? 2000 + c : c;
      month = order === 'DMY' ? b : a;
      day = order === 'DMY' ? a : b;
    }
    if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return null;
    const time = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?\s*m\.?)?$/i.exec(timeToken);
    if (!time) return null;
    let hour = Number(time[1]);
    const minute = Number(time[2]), second = Number(time[3] || 0);
    if (minute > 59 || second > 59) return null;
    if (time[4]) {
      if (hour < 1 || hour > 12) return null;
      hour = hour % 12 + (/^p/i.test(time[4]) ? 12 : 0);
    } else if (hour > 23) return null;
    const timestamp = Date.UTC(year, month - 1, day, hour, minute, second);
    const date = new Date(timestamp);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
    return {timestamp, dateKey: `${year}-${pad(month)}-${pad(day)}`};
  }
  function extractAttachment(text) {
    let match = /<(?:attached|adjunto):\s*([^>\r\n]+)>/i.exec(text);
    if (!match) match = /^([^\r\n]+?\.[a-z0-9]{2,10})\s*\((?:file attached|attached)\)(?:\s*$|(?=\r?\n))/im.exec(text);
    if (match) {
      const name = match[1].trim();
      const kind = PHOTO_EXT.test(name) ? 'photo' : 'unsupported';
      const caption = (text.slice(0, match.index) + text.slice(match.index + match[0].length)).replace(/^\n|\n$/g, '').trim();
      return {text: caption.replace(CONTROLS, '').trim() ? caption : '', attachment: {name, kind, label: kind === 'photo' ? name : `Attachment: ${name}`}};
    }
    match = /^[\s\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]*<?((?:media|image|photo|video|audio|sticker|document|gif|contact card) omitted)>?\s*(?:$|\n)/i.exec(text);
    if (match) return {text: text.slice(match[0].length), attachment: {name: null, kind: 'omitted', label: match[1]}};
    return {text, attachment: null};
  }
  function parse(text, options) {
    options = options || {};
    if (typeof text !== 'string') fail('INVALID_TEXT', 'Choose the original WhatsApp .txt export or a ZIP containing it.');
    if (!text.trim()) fail('EMPTY_CHAT', 'This chat file is empty. Export a conversation from WhatsApp and try again.');
    if (text.length > LIMITS.chatBytes) fail('CHAT_TOO_LARGE', 'This text export is too large. Please use a chat file under 20 MB.');
    if (text.includes('\u0000')) fail('BINARY_TEXT', 'This does not look like a text export. Select the original WhatsApp .txt or .zip file.');
    const lines = text.replace(/^\ufeff/, '').replace(/\r\n?/g, '\n').split('\n');
    // A trailing newline belongs to the text file, not an extra message.
    if (lines[lines.length - 1] === '') lines.pop();
    const headers = lines.map(detectHeader).filter(Boolean);
    if (!headers.length) fail('NO_MESSAGES', 'No WhatsApp message dates were found. Please export the chat from WhatsApp, then choose its .txt or .zip file.');
    if (headers.length > LIMITS.messages) fail('TOO_MANY_MESSAGES', 'This export contains over 20,000 messages. Please use a smaller export.');
    const inference = inferOrder(headers, String(options.dateOrder || 'auto').toUpperCase());
    const warnings = [];
    if (inference.mixed) warnings.push('This file contains conflicting date formats. Check the date order. Unreadable dates are kept as undated entries.');
    else if (inference.ambiguous) warnings.push('Dates such as 04/05 can mean April 5 or May 4. Month/day is selected; confirm the date order before downloading.');
    let current = null, leading = [], invalidDates = 0, preservedLeadingLines = 0;
    const messages = [];
    function save() {
      if (!current) return;
      const extracted = extractAttachment(current.text);
      current.text = extracted.text;
      current.attachment = extracted.attachment;
      messages.push(current);
    }
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex], header = detectHeader(line);
      if (!header) {
        if (current) current.text += '\n' + line;
        else leading.push(line);
        continue;
      }
      if (!current && leading.length && leading.join('\n').trim()) {
        preservedLeadingLines = leading.length;
        messages.push({id: 'm0', sender: null, text: leading.join('\n'), timestamp: null, rawTimestamp: '', dateKey: null, timeLabel: '', isSystem: true, invalidTimestamp: true, attachment: null});
        leading = [];
      }
      save();
      const parsedTime = parseTimestamp(header.date, header.time, inference.order);
      if (!parsedTime) invalidDates++;
      // Sender delimiters require colon-space. Colons inside ordinary text remain.
      const split = /^([^\n]+?):\s([\s\S]*)$/.exec(header.body);
      const sender = split ? split[1].replace(CONTROLS, '').trim() : null;
      current = {
        id: 'm' + (messages.length + 1),
        sender,
        text: split ? split[2] : header.body,
        timestamp: parsedTime ? parsedTime.timestamp : null,
        rawTimestamp: header.rawTimestamp,
        dateKey: parsedTime ? parsedTime.dateKey : null,
        timeLabel: header.time,
        isSystem: !split,
        invalidTimestamp: !parsedTime,
        attachment: null,
      };
    }
    save();
    if (invalidDates) warnings.push(`${invalidDates} ${invalidDates === 1 ? 'entry has an unreadable date and is' : 'entries have unreadable dates and are'} preserved in the document. Check the date order.`);
    if (preservedLeadingLines) warnings.push(`${preservedLeadingLines} ${preservedLeadingLines === 1 ? 'line before the first message was' : 'lines before the first message were'} preserved as an undated note.`);
    const participants = Array.from(new Set(messages.filter(m => m.sender).map(m => m.sender)));
    const datedMessages = messages.filter(m => m.timestamp !== null);
    const dateKeys = datedMessages.map(m => m.dateKey).sort();
    return {
      messages, participants, dateOrder: inference.order, ambiguousDates: inference.ambiguous, warnings,
      stats: {
        messages: messages.length,
        userMessages: messages.filter(m => !m.isSystem).length,
        systemMessages: messages.filter(m => m.isSystem).length,
        photosReferenced: messages.filter(m => m.attachment && m.attachment.kind === 'photo').length,
        omittedMedia: messages.filter(m => m.attachment && m.attachment.kind === 'omitted').length,
        unsupportedMedia: messages.filter(m => m.attachment && m.attachment.kind === 'unsupported').length,
        invalidDates, preservedLeadingLines, validDatedMessages: datedMessages.length,
        firstDate: dateKeys[0] || null, lastDate: dateKeys[dateKeys.length - 1] || null,
        sourceLines: lines.length,
      },
    };
  }

  function linkMedia(messages, media) {
    media = media || new Map();
    let matchedPhotos = 0, missingPhotos = 0, unsupportedMedia = 0, omittedMedia = 0;
    const linked = messages.map(message => {
      if (!message.attachment) return {...message};
      const attachment = {...message.attachment};
      if (attachment.kind === 'photo') {
        const found = media.get(normalizeFilename(attachment.name));
        if (found && !found.ambiguous && !found.unsupported && found.blob) {
          attachment.media = found; attachment.status = 'matched'; matchedPhotos++;
        } else { attachment.status = 'missing'; missingPhotos++; }
      } else if (attachment.kind === 'omitted') { attachment.status = 'omitted'; omittedMedia++; }
      else { attachment.status = 'unsupported'; unsupportedMedia++; }
      return {...message, attachment};
    });
    const warnings = [];
    if (missingPhotos) warnings.push(`${missingPhotos} referenced ${missingPhotos === 1 ? 'photo is' : 'photos are'} missing or ambiguous. Re-export with media to include them; placeholders preserve their positions.`);
    if (unsupportedMedia) warnings.push(`${unsupportedMedia} ${unsupportedMedia === 1 ? 'attachment is not a supported photo. Its filename and position' : 'attachments are not supported photos. Their filenames and positions'} will be preserved.`);
    if (omittedMedia) warnings.push(`${omittedMedia} media ${omittedMedia === 1 ? 'item was' : 'items were'} omitted by WhatsApp. This website cannot recover omitted media.`);
    return {messages: linked, matchedPhotos, missingPhotos, unsupportedMedia, omittedMedia, warnings};
  }

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const value of bytes) crc = crcTable[(crc ^ value) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function decodeFilename(bytes, utf8) {
    try { return new TextDecoder('utf-8', {fatal: true}).decode(bytes); }
    catch (_) {
      if (utf8) fail('INVALID_FILENAME', 'This ZIP contains a damaged filename. Re-export the conversation and try again.');
      return new TextDecoder('windows-1252').decode(bytes);
    }
  }
  function inspectZip(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let end = -1;
    // Accept a valid EOCD even when a file provider appends harmless trailing
    // bytes after the ZIP comment. Some mobile/cloud providers do this while
    // the archive remains readable by normal ZIP tools.
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557 - 4096); i--) {
      if (view.getUint32(i, true) !== 0x06054b50) continue;
      const declaredEnd = i + 22 + view.getUint16(i + 20, true);
      if (declaredEnd <= bytes.length) { end = i; break; }
    }
    if (end === -1) fail('INVALID_ZIP', 'This ZIP is incomplete or damaged. Export the conversation again and select the new file.');
    const count = view.getUint16(end + 10, true), directorySize = view.getUint32(end + 12, true), directoryStart = view.getUint32(end + 16, true);
    if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true) || view.getUint16(end + 8, true) !== count) fail('MULTIPART_ZIP', 'Split ZIP archives are not supported. Select a single WhatsApp export ZIP.');
    if (count === 0xffff || directorySize === 0xffffffff || directoryStart === 0xffffffff) fail('ZIP64', 'This archive uses ZIP64. Use a smaller standard ZIP export.');
    if (count > LIMITS.entries) fail('TOO_MANY_FILES', 'This ZIP contains more than 5,000 files. Please use a smaller export.');
    if (directoryStart + directorySize > end) fail('INVALID_ZIP', 'The ZIP directory is damaged. Please select a new export.');
    const entries = [];
    let offset = directoryStart;
    for (let i = 0; i < count; i++) {
      if (offset + 46 > directoryStart + directorySize || view.getUint32(offset, true) !== 0x02014b50) fail('INVALID_ZIP', 'The ZIP directory is damaged. Please select a new export.');
      const flags = view.getUint16(offset + 8, true), method = view.getUint16(offset + 10, true);
      const crc = view.getUint32(offset + 16, true), compressedSize = view.getUint32(offset + 20, true), size = view.getUint32(offset + 24, true);
      const nameLength = view.getUint16(offset + 28, true), extraLength = view.getUint16(offset + 30, true), commentLength = view.getUint16(offset + 32, true);
      const localOffset = view.getUint32(offset + 42, true);
      if (flags & 1 || flags & 64) fail('ENCRYPTED_ZIP', 'Password-protected ZIP files are not supported. Choose the unencrypted WhatsApp export.');
      if ([compressedSize, size, localOffset].includes(0xffffffff)) fail('ZIP64', 'This archive uses ZIP64. Use a smaller standard ZIP export.');
      if (view.getUint16(offset + 34, true)) fail('MULTIPART_ZIP', 'Split ZIP archives are not supported.');
      if (offset + 46 + nameLength + extraLength + commentLength > directoryStart + directorySize) fail('INVALID_ZIP', 'A ZIP filename is damaged. Please select a new export.');
      const name = decodeFilename(bytes.subarray(offset + 46, offset + 46 + nameLength), Boolean(flags & 0x800));
      if (localOffset + 30 > directoryStart || view.getUint32(localOffset, true) !== 0x04034b50) fail('INVALID_ZIP', 'A file inside this ZIP is damaged. Please select a new export.');
      if (view.getUint16(localOffset + 8, true) !== method || (view.getUint16(localOffset + 6, true) & 1)) fail('INVALID_ZIP', 'The ZIP contains inconsistent file metadata. Please export the conversation again.');
      const localNameLength = view.getUint16(localOffset + 26, true), localExtraLength = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      if (start + compressedSize > directoryStart) fail('INVALID_ZIP', 'A file inside the ZIP is incomplete. Please export it again.');
      const localName = decodeFilename(bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength), Boolean(flags & 0x800));
      if (localName !== name) fail('INVALID_ZIP', 'The ZIP contains inconsistent filenames. Please export the conversation again.');
      if (!name.endsWith('/') && !/(^|\/)__MACOSX\//.test(name) && basename(name) !== '.DS_Store') entries.push({name, size, compressedSize, method, crc, start});
      offset += 46 + nameLength + extraLength + commentLength;
    }
    if (offset !== directoryStart + directorySize) fail('INVALID_ZIP', 'The ZIP contains an unsupported directory layout. Please use the original WhatsApp export.');
    return entries;
  }
  async function extractZipEntry(bytes, entry) {
    if (entry.method !== 0 && entry.method !== 8) fail('ZIP_COMPRESSION', 'This ZIP uses an unsupported compression method. Use a standard WhatsApp ZIP export.');
    const compressed = bytes.subarray(entry.start, entry.start + entry.compressedSize);
    let output;
    if (entry.method === 0) output = compressed.slice();
    else {
      const chunks = [];
      let length = 0;
      function collect(chunk) {
        length += chunk.byteLength;
        if (length > entry.size || length > LIMITS.entryBytes) {
          fail('ZIP_SIZE_MISMATCH', 'A compressed file exceeds its declared size. Please use the original WhatsApp export.');
        }
        chunks.push(chunk);
      }
      let nativeInflater;
      // Some browsers expose DecompressionStream but reject deflate-raw. Test
      // the actual format, not just the presence of the API.
      try {
        if (typeof root.DecompressionStream === 'function' && typeof Blob.prototype.stream === 'function') {
          nativeInflater = new root.DecompressionStream('deflate-raw');
        }
      } catch (_) { /* The bundled inflater below handles this browser. */ }
      if (nativeInflater) {
        const reader = new Blob([compressed]).stream().pipeThrough(nativeInflater).getReader();
        try {
          while (true) {
            const result = await reader.read();
            if (result.done) break;
            collect(result.value);
          }
        } catch (error) {
          try { await reader.cancel(); } catch (_) {}
          if (error instanceof ImportError) throw error;
          fail('INVALID_ZIP', 'A compressed file in this ZIP is damaged. Please export the conversation again.');
        }
      } else {
        const Inflate = root.pako && root.pako.Inflate;
        if (typeof Inflate !== 'function') {
          fail('BROWSER_ZIP', 'The ZIP compatibility component is unavailable. Reopen the complete ChattoPaper HTML file, or select the unzipped conversation .txt and photos together.');
        }
        try {
          // Output is collected in bounded blocks so a forged expanded-size
          // header cannot make the fallback allocate an entire ZIP bomb.
          const inflater = new Inflate({raw: true, chunkSize: 64 * 1024});
          inflater.onData = collect;
          const inputChunkSize = 64 * 1024;
          for (let start = 0; start < compressed.length; start += inputChunkSize) {
            const end = Math.min(start + inputChunkSize, compressed.length);
            // Do not force Z_FINISH: a valid stream must reach its natural end.
            // This catches truncated streams even if they emitted all text.
            if (!inflater.push(compressed.subarray(start, end), false) || inflater.err) {
              fail('INVALID_ZIP', 'A compressed file in this ZIP is damaged. Please export the conversation again.');
            }
            if (inflater.ended && (end < compressed.length || inflater.strm.avail_in !== 0)) {
              fail('INVALID_ZIP', 'A compressed file in this ZIP contains unexpected trailing data. Please export the conversation again.');
            }
            if (end < compressed.length) await new Promise(resolve => setTimeout(resolve, 0));
          }
          if (!inflater.ended || inflater.err) {
            fail('INVALID_ZIP', 'A compressed file in this ZIP is incomplete. Please export the conversation again.');
          }
        } catch (error) {
          if (error instanceof ImportError) throw error;
          fail('INVALID_ZIP', 'A compressed file in this ZIP is damaged. Please export the conversation again.');
        }
      }
      output = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
    }
    if (output.byteLength !== entry.size || crc32(output) !== entry.crc) fail('ZIP_CHECKSUM', 'A file in this ZIP failed its integrity check. Please select a fresh export.');
    return output;
  }
  function decodeText(bytes) {
    if (bytes.byteLength > LIMITS.chatBytes) fail('CHAT_TOO_LARGE', 'The conversation text exceeds 20 MB. Please use a smaller export.');
    try {
      if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le', {fatal: true}).decode(bytes);
      if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be', {fatal: true}).decode(bytes);
      return new TextDecoder('utf-8', {fatal: true}).decode(bytes);
    } catch (_) { fail('TEXT_ENCODING', 'This chat is not a readable Unicode text file. Choose the original WhatsApp .txt export.'); }
  }
  async function readFileBuffer(file) {
    if (file && typeof file.arrayBuffer === 'function') {
      try { return await file.arrayBuffer(); }
      catch (_) { /* Fall through to FileReader for mobile/cloud file providers. */ }
    }
    if (typeof FileReader === 'function' && file instanceof Blob) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new ImportError('FILE_READ', 'This browser could not read the selected file. Save the WhatsApp export to your device and choose it again.'));
        reader.onabort = () => reject(new ImportError('FILE_READ', 'Reading the selected file was interrupted. Choose it again.'));
        reader.readAsArrayBuffer(file);
      });
    }
    fail('FILE_READ', 'This browser could not read the selected file. Save the WhatsApp export locally and choose it again.');
  }
  function headerCount(text) {
    return text.replace(/\r\n?|\n/g, '\n').split('\n').reduce((count, line) => count + (detectHeader(line) ? 1 : 0), 0);
  }
  function addMedia(map, item, warnings) {
    const key = normalizeFilename(item.name);
    if (!key) return;
    if (map.has(key)) {
      map.set(key, {...map.get(key), ambiguous: true});
      warnings.push(`More than one file is named “${key}”. It will not be attached automatically.`);
    } else map.set(key, item);
  }
  async function readFiles(fileList, options) {
    options = options || {};
    const files = Array.from(fileList || []);
    if (!files.length) fail('NO_FILES', 'Choose a WhatsApp ZIP, or its .txt file together with photos.');
    if (files.length > LIMITS.entries) fail('TOO_MANY_FILES', 'Please select no more than 5,000 files at a time.');
    const zipFiles = files.filter(file => /\.zip$/i.test(file.name));
    const textFiles = files.filter(file => /\.txt$/i.test(file.name));
    if (zipFiles.length > 1 || (zipFiles.length && textFiles.length)) fail('MULTIPLE_CHATS', 'Choose one conversation at a time: one ZIP, or one .txt file with its photos.');
    if (textFiles.length > 1) fail('MULTIPLE_CHATS', 'Choose one conversation .txt file at a time.');
    if (!zipFiles.length && !textFiles.length) fail('NO_CHAT_FILE', 'Include the conversation .txt file, or select the original WhatsApp ZIP.');
    const selectedBytes = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
    const uploadLimit = zipFiles.length ? LIMITS.zipUploadBytes : LIMITS.uploadBytes;
    if (selectedBytes > uploadLimit) fail('UPLOAD_TOO_LARGE', `Please select ${zipFiles.length ? 'a ZIP under 300 MB' : 'files totaling 100 MB or less'}. For very large chats, export a smaller date/media set.`);
    const warnings = [], media = new Map();
    let text, fileName, chatFileName;
    function progress(done, total, name) { if (typeof options.onProgress === 'function') options.onProgress({done, total, name}); }
    if (zipFiles.length) {
      const zipFile = zipFiles[0];
      fileName = zipFile.name;
      const bytes = new Uint8Array(await readFileBuffer(zipFile));
      const entries = inspectZip(bytes);
      const candidates = entries.filter(entry => /\.txt$/i.test(entry.name));
      const primary = candidates.filter(entry => /^_chat\.txt$/i.test(basename(entry.name)));
      const decodedCandidates = new Map();
      let chat = null;
      if (primary.length === 1) {
        // iPhone exports conventionally use _chat.txt. Prefer it even when the
        // conversation contains attached .txt documents.
        chat = primary[0];
      } else if (candidates.length === 1) {
        chat = candidates[0];
      } else if (candidates.length > 1) {
        const scored = [];
        for (const candidate of candidates) {
          if (candidate.size > LIMITS.chatBytes) continue;
          let decoded;
          try { decoded = decodeText(await extractZipEntry(bytes, candidate)); }
          catch (error) { if (error.code === 'TEXT_ENCODING') continue; throw error; }
          decodedCandidates.set(candidate.name, decoded);
          scored.push({candidate, score: headerCount(decoded)});
        }
        scored.sort((a, b) => b.score - a.score);
        if (scored[0]?.score > 0 && (!scored[1] || scored[1].score === 0 || scored[0].score >= scored[1].score * 3)) chat = scored[0].candidate;
      }
      if (!chat) fail(candidates.length ? 'MULTIPLE_CHATS' : 'NO_CHAT_FILE', candidates.length ? 'This ZIP contains more than one possible conversation text file. Unzip it and choose the WhatsApp chat .txt file with its photos.' : 'No .txt conversation was found in this ZIP. Export a chat from WhatsApp and try again.');
      if (chat.size > LIMITS.chatBytes) fail('CHAT_TOO_LARGE', 'The conversation text exceeds 20 MB. Please use a smaller export.');
      chatFileName = basename(chat.name);
      text = decodedCandidates.has(chat.name) ? decodedCandidates.get(chat.name) : decodeText(await extractZipEntry(bytes, chat));
      const photoEntries = entries.filter(entry => PHOTO_EXT.test(entry.name));
      let extractedBytes = chat.size;
      for (let i = 0; i < photoEntries.length; i++) {
        const entry = photoEntries[i];
        progress(i + 1, photoEntries.length, basename(entry.name));
        if (entry.size > LIMITS.entryBytes) {
          warnings.push(`“${basename(entry.name)}” is larger than 40 MB, so it was left as a placeholder instead of failing the whole conversation.`);
          continue;
        }
        if (extractedBytes + entry.size > LIMITS.expandedBytes) {
          warnings.push('The photos in this export exceed the 250 MB safe extraction limit. Remaining large media were left as placeholders.');
          break;
        }
        const type = photoType(entry.name);
        const content = await extractZipEntry(bytes, entry);
        extractedBytes += content.byteLength;
        addMedia(media, {name: basename(entry.name), blob: new Blob([content], {type}), type}, warnings);
      }
    } else {
      const textFile = textFiles[0];
      fileName = chatFileName = textFile.name;
      text = decodeText(new Uint8Array(await readFileBuffer(textFile)));
    }
    const looseMedia = files.filter(file => PHOTO_EXT.test(file.name));
    for (const file of looseMedia) {
      if (file.size > LIMITS.entryBytes) fail('ENTRY_TOO_LARGE', 'A selected photo is larger than 40 MB. Please choose a smaller photo.');
      addMedia(media, {name: file.name, blob: file, type: photoType(file.name)}, warnings);
    }
    return {text, fileName, chatFileName, media, warnings};
  }

  return Object.freeze({parse, readFiles, linkMedia, normalizeFilename, ImportError, LIMITS,
    // Exported to make archive protections independently testable.
    inspectZip, extractZipEntry, crc32, readFileBuffer});
});