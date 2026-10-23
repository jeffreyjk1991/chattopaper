'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {deflateRawSync}=require('node:zlib');

const JPEG=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8Q/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxB//9k=','base64');

class FakeContext{
  measureText(value){return {width:String(value??'').length*5.7};}
  setTransform(){} fillRect(){} beginPath(){} moveTo(){} lineTo(){} quadraticCurveTo(){} closePath(){} fill(){} stroke(){}
  fillText(){} save(){} clip(){} drawImage(){} restore(){}
}
class FakeCanvas{
  constructor(){this.width=0;this.height=0;this.ctx=new FakeContext();}
  getContext(kind){return kind==='2d'?this.ctx:null;}
  toBlob(cb){cb(new Blob([JPEG],{type:'image/jpeg'}));}
}
global.document={
  fonts:{ready:Promise.resolve(),load:async()=>[]},
  createElement(tag){if(tag==='canvas')return new FakeCanvas(); throw new Error('unexpected element '+tag);}
};
global.PDFLib=require('pdf-lib');

const Import=require('../src/importer.js');
const ChatDocument=require('../src/document.js');

function zip(entries){
  const local=[],central=[];let offset=0;
  for(const source of entries){
    const name=Buffer.from(source.name),content=Buffer.from(source.content||'');
    const compressed=deflateRawSync(content),crc=Import.crc32(content);
    const header=Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0,6);header.writeUInt16LE(8,8);
    header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(content.length,22);header.writeUInt16LE(name.length,26);
    const entry=Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0,8);entry.writeUInt16LE(8,10);
    entry.writeUInt32LE(crc,16);entry.writeUInt32LE(compressed.length,20);entry.writeUInt32LE(content.length,24);entry.writeUInt16LE(name.length,28);entry.writeUInt32LE(offset,42);
    local.push(header,name,compressed);central.push(entry,name);offset+=header.length+name.length+compressed.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);
  end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,directory,end]);
}
function file(name,content){
  const b=Buffer.from(content);
  return {name,size:b.length,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};
}

test('ZIP -> parse -> layout -> real PDF export completes',async()=>{
  const chat='[10/23/26, 9:00 AM] Alex: First message\n[10/23/26, 9:01 AM] Jamie: Second message\nwith a second line\n[10/23/26, 9:02 AM] Alex: Third message';
  const source=await Import.readFiles([file('WhatsApp Chat.zip',zip([{name:'_chat.txt',content:chat}]))]);
  assert.equal(source.chatFileName,'_chat.txt');
  const parsed=Import.parse(source.text);
  assert.equal(parsed.stats.userMessages,3);
  const linked=Import.linkMedia(parsed.messages,source.media);
  assert.equal(linked.messages.length,3);

  const doc=await ChatDocument.createDocument(linked.messages,{
    title:'ChatToPaper full-flow QA',
    style:'bubbles',paper:'a4',includePhotos:true,showTimestamps:true,primarySender:'Alex',maxPages:20
  });
  assert.equal(doc.stats.messageCount,3);
  assert.ok(doc.pages.length>=1);

  let progress=0;
  const blob=await ChatDocument.exportPDF(doc,(page,total)=>{progress=page/total;});
  assert.equal(blob.type,'application/pdf');
  assert.ok(blob.size>500);
  assert.equal(progress,1);

  const pdf=await global.PDFLib.PDFDocument.load(new Uint8Array(await blob.arrayBuffer()));
  assert.equal(pdf.getTitle(),'ChatToPaper full-flow QA');
  assert.equal(pdf.getCreator(),'ChatToPaper');
  assert.equal(pdf.getProducer(),'ChatToPaper — processed locally');
  assert.equal(pdf.getPageCount(),doc.pages.length);
});

test('free launch UI bypasses checkout and points to custom domain',()=>{
  const fs=require('node:fs');
  const home=fs.readFileSync('src/index.html','utf8');
  const app=fs.readFileSync('src/app.js','utf8');
  const build=fs.readFileSync('build.cjs','utf8');
  assert.match(home,/https:\/\/chattopaper\.com\//);
  assert.doesNotMatch(home,/https:\/\/chattopaper\.vercel\.app/);
  assert.match(home,/Free for a limited time/);
  assert.match(home,/Download PDF — Free/);
  assert.match(app,/if\(freeLaunchMode\) state\.paymentUnlocked=true/);
  assert.match(app,/if\(freeLaunchMode\) state\.paymentUnlocked=true;\s*if\(!state\.paymentUnlocked\)\{beginStripePayment\(\);return;\}/);
  assert.match(build,/process\.env\.FREE_LAUNCH/);
});
