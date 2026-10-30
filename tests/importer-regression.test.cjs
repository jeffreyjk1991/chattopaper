'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {deflateRawSync, gunzipSync} = require('node:zlib');
const Import = require('../src/importer.js');
const Structured = require('../src/structured-importer.js');
const AppleMessages = require('../src/apple-messages.js');
const SmsImport = require('../src/sms-importer.js');

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

const APPLE_DB_FIXTURE = gunzipSync(Buffer.from('H4sIAEDm5GoC/+2bT2/bNhTAKcdJZGyZ10PhFUEBXgrEaLY27bwdggF1EnXN5iWo4yG9CYzE2MxkUyOppu5l6HrcfV+hp932BXrbbR9gxwE77rBPsKd/jpxIyXYpWuD9YNEkH/n475HUM+CDxz1hOD2WaswMvU8+JJZFHlBKCFnMnpx69uRY5GoWySfPv1+JKy7/TZq/fPDK/gMiCIIgCIK8QV6c1Jdbd+5YLxcMOwq4N2LGHXOt2ZC7J1JMLmQsbved7sChg+5Wz6EXxHQtyRI+3d0bOF86fdp3Hjp9Z2/bOUhK07X+/uHuTpvu79Edp+eAqu3uwXZ3x1mnuaLy2pn0vyjwGbzB5Cp2nIfdb3sDerf90+7Ccmt11fpZJIPNSmdf9bmBzRobRtCbgfNksE4Nf2ayqOJhwLySNtap5uqp8Ljr8YnhKis/YhM/KA4MykVHJ9zLFXoymhg1zVLMGCWOIsP9LelP6VZvf2udPuVKCzkpa9NMw8v6kmv1klbmU25hgFwpqcr0FOczTbmKM/9cls8DAZ3khXyhL+YWFYP8WEyEHlWK+VgaXlVVyTFYX2XN0EwrZNApNq1sk0VGuvESV1UPQciqh1Scm3MiPdWGj/MtU1UITKdMNGLQcx/U6ygwurJyan+XNwGv96dMlfbyNG5Fnk6GivnVU6S8ESxrmdRj3oi7cV/BjCE+htHo6oJKyvGEQW8zI0yaZ4bBGhnYH7y6j9yPwkB4zFyykL6QV8xEWGkJiVHPi6FGvHxV+02aEVduutnL5EMlo9A1wgT5nkxzmGdgZ1eq1SMwNlcbZiJdLfeF4omeqv3wLBQqPvfK5IkwbaNUnp+sV/Q0L6ZlpMqPR6a19ES8ZrN7o3AClUjLm2r/uFBbbl2/br0Us4srfhYuXE9zR7g206Bwks0N9+xInBUPlQy5MgKMMz2Ds8sNLFoci9npnm+52IzzCwKsupjOVQdyCJdkmne2jQr2FTBtXOb7sMk1zEJmS2kFX+jYHM/0th9bS60bN6wfkjlIy6ZhbW4eMi1rs4HNXzfFa6Id++ZW8y8CHwRBEARBEARBEARB3mk+suq3yM3bG51OZ+Pe/U87n30uvkl/cEn9/9cEPgiCIAiCIAiCIAiCvK18Ya1sxt+3bsZhK/frN29vFt39Mtf/KzYWif9fax6S5isIEARBEARBEARBEAT5P+zVOtdWbWJD1LbBM7eX4ojdsIuQLCCz9PjeI0GPmPdd7qO/t//r71//9oQcWp1rH9ukcU6ffZW+jUc8CCSN/zpFE3+/oPj1wQtCUv//T9L8BwIEQRAEQRAEQRAEQd5VVmr1hrVUy39KeN+qNxpLuf//L1s2n30AUAAA','base64'));

test('Apple chat.db imports an iMessage conversation locally', async () => {
  const source=await AppleMessages.readFiles([file('chat.db',APPLE_DB_FIXTURE)]);
  assert.equal(source.platform,'imessage');
  assert.equal(source.conversationTitle,'Jamie');
  assert.equal(source.parsed.stats.userMessages,2);
  assert.equal(source.parsed.messages[0].text,'Hello from Jamie');
  assert.equal(source.parsed.messages[1].sender,'You');
});

test('SMS Backup & Restore XML is grouped into selectable conversations', async () => {
  const xml='<?xml version="1.0"?><smses count="3"><sms address="+15550001" date="1793376000000" type="1" body="Hello &amp; welcome" contact_name="Jamie"/><sms address="+15550001" date="1793376060000" type="2" body="Hi back" contact_name="Jamie"/><sms address="+15550002" date="1793376120000" type="1" body="Other thread" contact_name="Taylor"/></smses>';
  const first=await SmsImport.readFiles([file('sms-backup.xml',xml)]);
  assert.equal(first.needsConversation,true);
  assert.equal(first.choices.length,2);
  const chosen=await SmsImport.readFiles([file('sms-backup.xml',xml)],{conversationId:first.choices.find(x=>x.title==='Jamie').id});
  assert.equal(chosen.platform,'sms');
  assert.equal(chosen.parsed.stats.userMessages,2);
  assert.equal(chosen.parsed.messages[0].text,'Hello & welcome');
  assert.equal(chosen.parsed.messages[1].sender,'You');
});
