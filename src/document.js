/* ChattoPaper document engine. Local-only, no network requests.
 * API: await createDocument(messages, options), await renderPage(doc, page, canvas,
 * {scale}), await exportPDF(doc, progress). Preview and PDF use one layout.
 * Direct PDFs contain high-resolution page images to retain browser-rendered
 * Unicode, emoji and photographs; their text is not selectable/searchable.
 */
(function (root, factory) {
  'use strict';
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChatDocument = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const PAPERS = { a4: { width: 595.28, height: 841.89 }, letter: { width: 612, height: 792 } };
  const COLORS = { ink: '#243c32', body: '#34443c', muted: '#7c827a', line: '#dfE4dc', sage: '#edf3e9', stone: '#f5f4ef', white: '#ffffff' };
  const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, "Helvetica Neue", sans-serif';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const nextFrame = () => new Promise(resolve => setTimeout(resolve, 0));
  let segmenter;
  try { segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' }); } catch (_) {}

  function graphemes(text) {
    return segmenter ? Array.from(segmenter.segment(text), item => item.segment) : Array.from(text);
  }
  function font(size, weight, family) { return (weight || '400') + ' ' + size + 'px ' + (family || FONT); }
  function direction(text) {
    for (const ch of String(text)) {
      if (/[\u0590-\u08ff\ufb1d-\ufefc]/.test(ch)) return 'rtl';
      if (/[A-Za-z\u00c0-\u02ff\u0370-\u058f\u0900-\uffff]/.test(ch)) return 'ltr';
    }
    return 'ltr';
  }
  function createCanvas() {
    if (!root.document) throw new Error('Document preview requires a browser.');
    return root.document.createElement('canvas');
  }
  function measureContext() {
    const ctx = createCanvas().getContext('2d');
    if (!ctx) throw new Error('Your browser does not support document rendering.');
    return ctx;
  }

  // Preserve hard line breaks and split long unbroken strings by grapheme so
  // a family emoji or combining character is never split across lines.
  function wrapText(ctx, value, maxWidth, textFont) {
    ctx.font = textFont;
    const out = [];
    String(value == null ? '' : value).replace(/\r\n?/g, '\n').split('\n').forEach(paragraph => {
      if (!paragraph) { out.push(''); return; }
      const tokens = paragraph.match(/\S+|\s+/gu) || [''];
      let line = '';
      for (const token of tokens) {
        if (ctx.measureText(line + token).width <= maxWidth) { line += token; continue; }
        if (/^\s+$/u.test(token)) {
          if (line) { out.push(line); line = ''; }
          continue;
        }
        if (line) { out.push(line); line = ''; }
        if (ctx.measureText(token).width <= maxWidth) { line = token; continue; }
        for (const unit of graphemes(token)) {
          if (line && ctx.measureText(line + unit).width > maxWidth) { out.push(line); line = ''; }
          line += unit;
        }
      }
      if (line || !out.length) out.push(line);
    });
    return out;
  }
  function shortText(ctx, value, width, textFont) {
    ctx.font = textFont;
    const text = String(value || '');
    if (ctx.measureText(text).width <= width) return text;
    const chars = graphemes(text);
    while (chars.length && ctx.measureText(chars.join('') + '…').width > width) chars.pop();
    return chars.join('') + '…';
  }
  function niceDate(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key || ''))) return 'Date not available';
    const date = new Date(key + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime())) return 'Date not available';
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  }
  function dateRange(messages) {
    const keys = messages.map(m => m.dateKey).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k || '')).sort();
    if (!keys.length) return 'Dates as recorded in your export';
    return niceDate(keys[0]) + (keys[0] === keys[keys.length - 1] ? '' : ' – ' + niceDate(keys[keys.length - 1]));
  }
  function timeLabel(message) {
    if (message.timeLabel) return String(message.timeLabel);
    const raw = String(message.rawTimestamp || '');
    const time = raw.match(/\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?m\.?)?/i);
    if (time) return time[0];
    return '';
  }
  function safeURL(value) {
    // Keeping the document fully local also prevents a media reference from
    // leaking that a private conversation was opened.
    return typeof value === 'string' && /^(blob:|data:image\/(?:jpeg|jpg|png|webp|gif|bmp|avif);)/i.test(value);
  }
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      if (!safeURL(url)) { reject(new Error('Only local image files are supported.')); return; }
      const img = new Image();
      const timer = setTimeout(() => { img.src = ''; reject(new Error('This image could not be decoded.')); }, 15000);
      img.onload = () => {
        clearTimeout(timer);
        if (!img.naturalWidth || !img.naturalHeight) { reject(new Error('This image is empty.')); return; }
        resolve(img);
      };
      img.onerror = () => { clearTimeout(timer); reject(new Error('This image format is not supported by your browser.')); };
      img.src = url;
    });
  }
  function textCommand(text, x, y, size, color, extras) {
    return Object.assign({ type: 'text', text: String(text || ''), x, y, size, color: color || COLORS.body, weight: '400', family: FONT, direction: direction(text) }, extras || {});
  }
  function addWarning(doc, warning) { if (!doc.warnings.includes(warning)) doc.warnings.push(warning); }

  async function createDocument(inputMessages, requestedOptions) {
    if (!Array.isArray(inputMessages)) throw new Error('No conversation was supplied.');
    // Wait for the embedded typefaces before measuring, so the preview and the
    // downloaded page cannot disagree after a late font load.
    if (root.document && root.document.fonts && typeof root.document.fonts.load === 'function') {
      try {        await root.document.fonts.ready;
      } catch (_) { /* Native fallback fonts remain usable when a font cannot load. */ }
    }
    const options = Object.assign({ title: 'A conversation worth keeping', style: 'bubbles', paper: 'a4', includePhotos: true, includeSystem: false, showTimestamps: true, primarySender: '', fontScale: 1, maxPages: 400 }, requestedOptions || {});
    options.paper = options.paper === 'letter' ? 'letter' : 'a4';
    options.style = options.style === 'classic' ? 'classic' : 'bubbles';
    options.fontScale = Math.max(0.85, Math.min(1.3, Number(options.fontScale) || 1));
    options.title = String(options.title || 'A conversation worth keeping').slice(0, 200);
    options.maxPages = Math.max(1, Math.min(500, Number(options.maxPages) || 400));
    // Undated leading text and malformed timestamps are retained even when the
    // optional WhatsApp system notices are hidden.
    const messages = inputMessages.filter(message => options.includeSystem || !message.isSystem || message.invalidTimestamp);
    if (!messages.length) throw new Error('There are no messages in this date range.');
    if (messages.length > 50000) throw new Error('Choose a shorter date range with fewer than 50,000 messages.');
    const dimensions = PAPERS[options.paper];
    const doc = {
      width: dimensions.width, height: dimensions.height, pages: [], options,
      warnings: [], images: {},
      stats: { messageCount: messages.length, photoCount: 0, missingPhotoCount: 0, unsupportedMediaCount: 0, omittedMediaCount: 0, pageCount: 0 },
      range: dateRange(messages),
      _cache: new Map()
    };
    // Resolve dimensions without retaining every full-size decoded photograph.
    const uniquePhotos = new Map();
    for (const message of messages) {
      if (!options.includePhotos || !message.attachment || message.attachment.kind !== 'photo') continue;
      const attachment = message.attachment;
      if (safeURL(attachment.url)) uniquePhotos.set(attachment.url, attachment.name || 'Photo');
    }
    const tasks = Array.from(uniquePhotos.entries());
    let photoTask = 0;
    await Promise.all(Array.from({ length: Math.min(3, tasks.length) }, async () => {
      while (photoTask < tasks.length) {
        const [url, name] = tasks[photoTask++];
        try {
          const image = await loadImage(url);
          if (image.naturalWidth * image.naturalHeight > 100000000) throw new Error('The image dimensions are too large.');
          doc.images[url] = { url, name, width: image.naturalWidth, height: image.naturalHeight };
          image.src = '';
        } catch (_) {
          addWarning(doc, 'Could not display “' + name + '”. Its position is marked in the document.');
        }
      }
    }));
    const ctx = measureContext();
    const margin = 45;
    const contentWidth = doc.width - margin * 2;
    const bubbleMax = options.style === 'classic' ? contentWidth : contentWidth * 0.84;
    const padX = options.style === 'classic' ? 0 : 13;
    const padY = options.style === 'classic' ? 7 : 10;
    const innerWidth = bubbleMax - padX * 2;
    const bodySize = 10.5 * options.fontScale;
    const lineHeight = 15.3 * options.fontScale;
    const senderSize = 9.2 * options.fontScale;
    const timeSize = 8 * options.fontScale;
    const bottom = doc.height - 48;
    let page, y, lastDate, pendingDay = null;

    function newPage() {
      if (doc.pages.length >= options.maxPages) throw new Error('This range produces more than ' + options.maxPages + ' pages. Choose a shorter date range.');
      page = { commands: [], messageIds: [] };
      doc.pages.push(page);
      if (doc.pages.length === 1) {
        page.commands.push(textCommand('CONVERSATION ARCHIVE', margin, 40, 7.5, COLORS.muted, { weight: '600' }));
        const titleLines = wrapText(ctx, options.title, contentWidth, font(25, '400', SERIF));
        let titleY = 72;
        for (const line of titleLines) {
          page.commands.push(textCommand(line, margin, titleY, 25, COLORS.ink, { family: SERIF }));
          titleY += 30;
        }
        page.commands.push(textCommand(doc.range, margin, titleY - 5, 8.7, COLORS.muted));
        page.commands.push({ type: 'line', x: margin, y: titleY + 9, x2: doc.width - margin, y2: titleY + 9, color: COLORS.line, width: 0.7 });
        y = titleY + 26;
      } else {
        page.commands.push(textCommand(shortText(ctx, options.title, contentWidth - 95, font(9, '400', SERIF)), margin, 31, 9, COLORS.ink, { family: SERIF }));
        page.commands.push(textCommand('CONTINUED', doc.width - margin, 31, 7, COLORS.muted, { align: 'right' }));
        page.commands.push({ type: 'line', x: margin, y: 42, x2: doc.width - margin, y2: 42, color: COLORS.line, width: 0.7 });
        y = 59;
      }
    }
    function ensure(height) {
      if (y + height <= bottom) return;
      const moveDay = pendingDay;
      if (moveDay && moveDay.page === page) page.commands.splice(moveDay.index, 1);
      pendingDay = null;
      newPage();
      if (moveDay) drawDayLabel(moveDay.key);
    }
    function drawDayLabel(key) {
      const label = niceDate(key);
      pendingDay = { key, page, index: page.commands.length };
      page.commands.push(textCommand(label, doc.width / 2, y + 10, 8, COLORS.muted, { align: 'center' }));
      y += 27;
    }
    function dayLabel(key) {
      ensure(46);
      drawDayLabel(key);
    }
    function placeholder(message) {
      const attachment = message.attachment;
      if (!attachment) return null;
      if (attachment.kind === 'photo') {
        if (!options.includePhotos) return 'Photo excluded from this document' + (attachment.name ? ': ' + attachment.name : '');
        if (!doc.images[attachment.url]) {
          doc.stats.missingPhotoCount++;
          return 'Photo not available in this export' + (attachment.name ? ': ' + attachment.name : '');
        }
      }
      if (attachment.kind === 'unsupported') {
        doc.stats.unsupportedMediaCount++;
        return attachment.label || 'Media attachment not supported' + (attachment.name ? ': ' + attachment.name : '');
      }
      if (attachment.kind === 'omitted') {
        doc.stats.omittedMediaCount++;
        return attachment.label || 'Media omitted from the WhatsApp export';
      }
      return null;
    }

    newPage();
    for (let i = 0; i < messages.length; i++) {
      if (i % 40 === 0) await nextFrame();
      const message = messages[i];
      const key = message.dateKey || '';
      if (key !== lastDate) { dayLabel(key); lastDate = key; }
      const isSystem = !!message.isSystem;
      const sender = String(isSystem ? (message.invalidTimestamp ? 'Undated note' : 'System message') : (message.sender || 'Unknown sender'));
      const right = options.style === 'bubbles' && !isSystem && sender === options.primarySender;
      const stamp = options.showTimestamps ? timeLabel(message) : '';
      let bodyText = String(message.text || '');
      if (!message.dateKey && message.rawTimestamp) bodyText += (bodyText ? '\n' : '') + 'Original timestamp: ' + String(message.rawTimestamp);
      const placeholderText = placeholder(message);
      const bodyLines = bodyText ? wrapText(ctx, bodyText, innerWidth, font(bodySize)) : [];
      let placeholderLines = placeholderText ? wrapText(ctx, placeholderText, innerWidth - 16, font(9 * options.fontScale)) : [];
      // Extremely long filenames/attachment notes use the normal paginated text
      // flow instead of becoming an indivisible oversized placeholder panel.
      if (placeholderLines.length > 12) {
        bodyLines.unshift(...wrapText(ctx, placeholderText + (bodyText ? '\n' : ''), innerWidth, font(bodySize)));
        placeholderLines = [];
      }
      const photo = options.includePhotos && message.attachment && message.attachment.kind === 'photo' ? doc.images[message.attachment.url] : null;
      let photoWidth = 0, photoHeight = 0;
      if (photo) {
        const ratio = Math.min(1, (innerWidth - 2) / photo.width, 240 / photo.height);
        photoWidth = photo.width * ratio; photoHeight = photo.height * ratio;
        // Small image files should remain legible without turning into a huge,
        // low-resolution full-page photo.
        if (photoWidth < 160 && photoHeight < 160) {
          const grow = Math.min(2, 160 / Math.max(photoWidth, photoHeight));
          photoWidth *= grow; photoHeight *= grow;
        }
        doc.stats.photoCount++;
      }
      ctx.font = font(bodySize);
      let maxTextWidth = 0;
      for (const line of bodyLines) maxTextWidth = Math.max(maxTextWidth, ctx.measureText(line).width);
      ctx.font = font(senderSize, '600');
      // Sender names are wrapped, never shortened, in the actual document.
      const timestampWidth = stamp ? (ctx.measureText(stamp).width + 20) : 0;
      const senderLines = wrapText(ctx, sender, Math.max(90, innerWidth - timestampWidth), font(senderSize, '600'));
      const senderWidth = Math.max(...senderLines.map(line => { ctx.font = font(senderSize, '600'); return ctx.measureText(line).width; }), 0);
      const bubbleWidth = options.style === 'classic' ? contentWidth : Math.min(bubbleMax, Math.max(135, maxTextWidth + padX * 2, senderWidth + timestampWidth + padX * 2, photoWidth + padX * 2, placeholderLines.length ? bubbleMax : 0));
      const x = right ? doc.width - margin - bubbleWidth : margin;
      const senderHeight = senderLines.length * (senderSize + 3) + 7;
      if (senderHeight > doc.height - 160) throw new Error('A sender name is too long to fit on a page. Check the original export for a malformed message header.');
      const photoHeightWithGap = photo ? photoHeight + 9 : 0;
      const placeholderHeight = placeholderLines.length ? placeholderLines.length * 12.5 * options.fontScale + 18 : 0;
      let bodyPosition = 0;
      let mediaPending = !!photo || placeholderLines.length > 0;
      let continuation = false;
      let once = false;

      while (!once || bodyPosition < bodyLines.length || mediaPending) {
        once = true;
        const continuedSenderHeight = senderHeight + (continuation ? 1 : 0);
        const mediaHeight = mediaPending ? photoHeightWithGap + placeholderHeight : 0;
        // Keep a photo with at least its first two caption lines where possible.
        const minLines = Math.min(2, bodyLines.length - bodyPosition);
        const minimum = padY * 2 + continuedSenderHeight + mediaHeight + minLines * lineHeight;
        if (minimum > bottom - 86) throw new Error('A message header is too long to fit on a page. Check the original export for a malformed sender name.');
        ensure(minimum + 8);
        let remaining = bottom - y - padY * 2 - continuedSenderHeight - mediaHeight;
        let linesHere = Math.min(bodyLines.length - bodyPosition, Math.max(0, Math.floor(remaining / lineHeight)));
        if (bodyPosition < bodyLines.length && linesHere === 0) {
          newPage();
          remaining = bottom - y - padY * 2 - continuedSenderHeight - mediaHeight;
          linesHere = Math.min(bodyLines.length - bodyPosition, Math.max(1, Math.floor(remaining / lineHeight)));
        }
        const boxHeight = padY * 2 + continuedSenderHeight + mediaHeight + linesHere * lineHeight;
        pendingDay = null;
        if (options.style === 'bubbles') {
          page.commands.push({ type: 'rect', x, y, width: bubbleWidth, height: Math.max(36, boxHeight), radius: 9, color: isSystem ? '#f8f8f5' : (right ? COLORS.sage : COLORS.stone) });
        } else {
          page.commands.push({ type: 'line', x, y: y + boxHeight + 5, x2: x + bubbleWidth, y2: y + boxHeight + 5, color: COLORS.line, width: 0.45 });
        }
        page.messageIds.push(message.id != null ? message.id : i);
        let contentY = y + padY + senderSize;
        const contentX = x + padX;
        for (const senderLine of senderLines) {
          const isRTL = direction(senderLine) === 'rtl';
          page.commands.push(textCommand(senderLine, isRTL ? x + bubbleWidth - padX - timestampWidth : contentX, contentY, senderSize, isSystem ? COLORS.muted : COLORS.ink, { weight: '600', align: isRTL ? 'right' : 'left' }));
          contentY += senderSize + 3;
        }
        if (stamp) page.commands.push(textCommand(stamp, x + bubbleWidth - padX, y + padY + senderSize, timeSize, COLORS.muted, { align: 'right' }));
        contentY = y + padY + continuedSenderHeight;
        if (mediaPending && photo) {
          page.commands.push({ type: 'image', url: photo.url, name: photo.name, x: contentX, y: contentY, width: photoWidth, height: photoHeight });
          contentY += photoHeightWithGap;
        }
        if (mediaPending && placeholderLines.length) {
          page.commands.push({ type: 'rect', x: contentX, y: contentY, width: bubbleWidth - padX * 2, height: placeholderHeight - 6, radius: 3, color: '#e9ebe5' });
          let placeY = contentY + 13;
          for (const placeholderLine of placeholderLines) {
            page.commands.push(textCommand(placeholderLine, contentX + 8, placeY, 9 * options.fontScale, '#666e64'));
            placeY += 12.5 * options.fontScale;
          }
          contentY += placeholderHeight;
        }
        for (let n = 0; n < linesHere; n++) {
          const line = bodyLines[bodyPosition++];
          const isRTL = direction(line) === 'rtl';
          page.commands.push(textCommand(line, isRTL ? x + bubbleWidth - padX : contentX, contentY + bodySize, bodySize, isSystem ? COLORS.muted : COLORS.body, { align: isRTL ? 'right' : 'left' }));
          contentY += lineHeight;
        }
        mediaPending = false;
        y += Math.max(36, boxHeight) + (options.style === 'classic' ? 14 : 9);
        continuation = true;
        if (bodyPosition < bodyLines.length) newPage();
      }
    }
    doc.stats.pageCount = doc.pages.length;
    for (let index = 0; index < doc.pages.length; index++) {
      const commands = doc.pages[index].commands;
      commands.push({ type: 'line', x: margin, y: doc.height - 32, x2: doc.width - margin, y2: doc.height - 32, color: COLORS.line, width: 0.5 });
      commands.push(textCommand(shortText(ctx, options.title, contentWidth - 100, font(7)), margin, doc.height - 19, 7, COLORS.muted));
      commands.push(textCommand('Page ' + (index + 1) + ' of ' + doc.pages.length, doc.width - margin, doc.height - 19, 7, COLORS.muted, { align: 'right' }));
    }
    return doc;
  }

  async function cachedImage(doc, url) {
    if (doc._cache.has(url)) {
      const cached = doc._cache.get(url);
      doc._cache.delete(url); doc._cache.set(url, cached);
      return cached;
    }
    const image = await loadImage(url);
    doc._cache.set(url, image);
    while (doc._cache.size > 6) {
      const key = doc._cache.keys().next().value;
      doc._cache.delete(key);
    }
    return image;
  }
  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius || 0, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  async function renderPage(doc, index, canvas, settings) {
    if (!doc || !doc.pages[index]) throw new Error('This document page does not exist.');
    const scale = Math.max(0.25, Math.min(4, Number(settings && settings.scale) || 1.5));
    const commands = doc.pages[index].commands;
    // Finish image loading before sizing/painting the shared canvas. This avoids
    // a partially painted preview while the local decoder is still working.
    const photos = new Map();
    for (const command of commands) {
      if (command.type !== 'image' || photos.has(command.url)) continue;
      try { photos.set(command.url, await cachedImage(doc, command.url)); }
      catch (_) { photos.set(command.url, null); addWarning(doc, 'A photo could not be rendered: ' + command.name); }
    }
    canvas.width = Math.round(doc.width * scale);
    canvas.height = Math.round(doc.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser cannot render this document.');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = COLORS.white; ctx.fillRect(0, 0, doc.width, doc.height);
    for (const command of commands) {
      if (command.type === 'rect') {
        ctx.fillStyle = command.color;
        roundRect(ctx, command.x, command.y, command.width, command.height, command.radius); ctx.fill();
      } else if (command.type === 'line') {
        ctx.beginPath(); ctx.strokeStyle = command.color; ctx.lineWidth = command.width || 0.6;
        ctx.moveTo(command.x, command.y); ctx.lineTo(command.x2, command.y2); ctx.stroke();
      } else if (command.type === 'text') {
        ctx.font = font(command.size, command.weight, command.family);
        ctx.fillStyle = command.color; ctx.textAlign = command.align || 'left';
        ctx.direction = command.direction || 'ltr'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(command.text, command.x, command.y);
      } else if (command.type === 'image') {
        const photo = photos.get(command.url);
        if (photo && photo.naturalWidth) {
          ctx.save(); roundRect(ctx, command.x, command.y, command.width, command.height, 4); ctx.clip();
          ctx.drawImage(photo, command.x, command.y, command.width, command.height); ctx.restore();
        } else {
          ctx.fillStyle = '#e9ebe5'; ctx.fillRect(command.x, command.y, command.width, command.height);
          ctx.font = font(9); ctx.fillStyle = COLORS.muted; ctx.textAlign = 'left'; ctx.direction = 'ltr';
          ctx.fillText('Photo not available', command.x + 10, command.y + 20);
        }
      }
    }
    return canvas;
  }
  function canvasBlob(canvas) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The browser could not create the PDF page.')), 'image/jpeg', 0.95));
  }
  async function exportPDF(doc, onProgress) {
    if (!root.PDFLib || !root.PDFLib.PDFDocument) throw new Error('The PDF component is missing. Reopen the complete ChattoPaper website file.');
    if (!doc || !doc.pages.length) throw new Error('Create a preview before downloading your PDF.');
    const pdf = await root.PDFLib.PDFDocument.create();
    pdf.setTitle(doc.options.title); pdf.setSubject('Printable WhatsApp conversation');
    pdf.setCreator('ChattoPaper'); pdf.setProducer('ChattoPaper — processed locally');
    pdf.setCreationDate(new Date());
    const canvas = createCanvas();
    for (let index = 0; index < doc.pages.length; index++) {
      await renderPage(doc, index, canvas, { scale: 2.5 });
      const blob = await canvasBlob(canvas);
      const embedded = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const page = pdf.addPage([doc.width, doc.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: doc.width, height: doc.height });
      if (typeof onProgress === 'function') onProgress(index + 1, doc.pages.length);
      await nextFrame();
    }
    canvas.width = 1; canvas.height = 1;
    const bytes = await pdf.save({ useObjectStreams: true });
    return new Blob([bytes], { type: 'application/pdf' });
  }
  function dispose(doc) {
    if (!doc || !doc._cache) return;
    for (const image of doc._cache.values()) image.src = '';
    doc._cache.clear();
  }
  return { createDocument, renderPage, exportPDF, dispose, PAPERS, _wrapText: wrapText, _direction: direction };
});