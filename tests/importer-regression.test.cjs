'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {deflateRawSync} = require('node:zlib');
const Import = require('../src/importer.js');
const Structured = require('../src/structured-importer.js');

function zip(entries, options = {}) {
  const local = [], central = [];
  let offset = 0;
  for (const source of entries) {
    const name = Buffer.from(source.name), content = Buffer.from(source.content || '');
    const compressed = source.stored ? content : deflateRawSync(content);
    const crc = Import.crc32(content), method = source.stored ? 0 : 8;
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(0, 6);
    header.writeUInt16LE(method, 8); header.writeUInt32LE(crc, 14); header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(content.length, 22); header.writeUInt16LE(name.length, 26);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(0, 8);
    entry.writeUInt16LE(method, 10); entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(source.declaredSize ?? content.length, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
    local.push(header, name, compressed); central.push(entry, name); offset += header.length + name.length + compressed.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  const result = Buffer.concat([...local, directory, end]);
  return options.trailing ? Buffer.concat([result, Buffer.from(options.trailing)]) : result;
}
function file(name, content) {
  const b = Buffer.from(content);
  return {name, size:b.length, arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};
}

async function load(name, archive) {
  const source = await Import.readFiles([file(name, archive)]);
  const parsed = Import.parse(source.text);
  return {source, parsed, linked: Import.linkMedia(parsed.messages, source.media)};
}

test('iPhone ZIP extracts messages and a photo', async () => {
  const text='[10/22/26, 9:00 AM] A: Hello\n[10/22/26, 9:01 AM] B: <attached: photo.jpg>\nCaption';
  const {parsed, linked}=await load('iphone.zip',zip([{name:'_chat.txt',content:text},{name:'photo.jpg',content:'jpeg'}]));
  assert.equal(parsed.stats.userMessages,2); assert.equal(linked.matchedPhotos,1);
});

test('Android ZIP extracts messages and a photo', async () => {
  const text='22/10/2026, 09:00 - A: Hello\n22/10/2026, 09:01 - B: IMG-1.jpg (file attached)\nCaption';
  const {parsed, linked}=await load('android.zip',zip([{name:'WhatsApp Chat with A.txt',content:text},{name:'IMG-1.jpg',content:'jpeg'}]));
  assert.equal(parsed.stats.userMessages,2); assert.equal(linked.matchedPhotos,1);
});

test('_chat.txt is preferred over attached text documents, even when notes contain date-like lines', async () => {
  const chat='[10/22/26, 9:00 AM] A: One\n[10/22/26, 9:01 AM] B: Two';
  const notes='10/22/26, 9:00 AM - this is an attached note, not a WhatsApp sender line';
  const {source, parsed}=await load('with-notes.zip',zip([{name:'_chat.txt',content:chat},{name:'notes.txt',content:notes}]));
  assert.equal(source.chatFileName,'_chat.txt'); assert.equal(parsed.stats.userMessages,2);
});

test('large unsupported media metadata does not block reading the conversation', async () => {
  const chat='[10/22/26, 9:00 AM] A: Hello';
  const archive=zip([{name:'_chat.txt',content:chat},{name:'video.mp4',content:'tiny',declaredSize:80*1024*1024}]);
  const {parsed}=await load('video-heavy.zip',archive);
  assert.equal(parsed.stats.userMessages,1);
});

test('harmless trailing provider metadata after EOCD does not invalidate the ZIP', async () => {
  const chat='[10/22/26, 9:00 AM] A: Hello';
  const {parsed}=await load('provider.zip',zip([{name:'_chat.txt',content:chat}],{trailing:'provider-metadata'}));
  assert.equal(parsed.stats.userMessages,1);
});

test('damaged ZIPs still fail clearly', async () => {
  await assert.rejects(Import.readFiles([file('broken.zip','not-a-zip')]), error => error.code==='INVALID_ZIP');
});

test('Telegram JSON export is detected and converted into normalized messages', async () => {
  const json=JSON.stringify({
    name:'Family Chat',
    type:'personal_chat',
    messages:[
      {id:1,type:'message',date:'2026-10-28T09:15:00',from:'Alex',text:'Morning'},
      {id:2,type:'message',date:'2026-10-28T09:16:00',from:'Jamie',text:[{type:'plain','text':'Coffee?'}]}
    ]
  });
  const source=await Structured.readFiles([file('result.json',json)]);
  assert.equal(source.platform,'telegram');
  assert.equal(source.conversationTitle,'Family Chat');
  assert.equal(source.parsed.stats.userMessages,2);
  assert.deepEqual(source.parsed.participants,['Alex','Jamie']);
  assert.equal(source.parsed.messages[1].text,'Coffee?');
});

test('Telegram full export asks for a conversation only after upload', async () => {
  const json=JSON.stringify({
    chats:{list:[
      {id:10,name:'Chat A',messages:[{id:1,type:'message',date:'2026-10-28T09:15:00',from:'A',text:'One'}]},
      {id:20,name:'Chat B',messages:[{id:2,type:'message',date:'2026-10-28T10:15:00',from:'B',text:'Two'}]}
    ]}
  });
  const first=await Structured.readFiles([file('result.json',json)]);
  assert.equal(first.needsConversation,true);
  assert.equal(first.choices.length,2);
  const selected=await Structured.readFiles([file('result.json',json)],{conversationId:first.choices[1].id});
  assert.equal(selected.conversationTitle,'Chat B');
  assert.equal(selected.parsed.messages[0].text,'Two');
});

test('Meta message archive is detected and photo references can be matched', async () => {
  const messageJson=JSON.stringify({
    title:'Taylor',
    participants:[{name:'Alex'},{name:'Taylor'}],
    messages:[
      {sender_name:'Taylor',timestamp_ms:1793181600000,content:'Photo',photos:[{uri:'your_instagram_activity/messages/inbox/taylor/photos/photo.jpg'}]},
      {sender_name:'Alex',timestamp_ms:1793181540000,content:'Hello'}
    ]
  });
  const archive=zip([
    {name:'your_instagram_activity/messages/inbox/taylor/message_1.json',content:messageJson},
    {name:'your_instagram_activity/messages/inbox/taylor/photos/photo.jpg',content:'jpeg'}
  ]);
  const source=await Structured.readFiles([file('instagram.zip',archive)]);
  assert.equal(source.platform,'meta');
  assert.equal(source.conversationTitle,'Taylor');
  const linked=Import.linkMedia(source.parsed.messages,source.media);
  assert.equal(source.parsed.stats.userMessages,2);
  assert.equal(linked.matchedPhotos,1);
});
