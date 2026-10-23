'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {deflateRawSync}=require('node:zlib');

const JPEG=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAACAAIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6pooooA//2Q==','base64');

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
const RealPDFLib=require('pdf-lib');
const exportMeta={};
global.PDFLib={PDFDocument:{create:async()=>({
  setTitle:v=>{exportMeta.title=v;}, setSubject:v=>{exportMeta.subject=v;}, setCreator:v=>{exportMeta.creator=v;}, setProducer:v=>{exportMeta.producer=v;}, setCreationDate:()=>{},
  embedJpg:async bytes=>{assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);return {kind:'jpg'};},
  addPage:()=>({drawImage:()=>{}}),
  save:async()=>new TextEncoder().encode('%PDF-1.7\\n% ChatToPaper QA\\n')
})}};

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
  assert.ok(blob.size>10);
  assert.equal(progress,1);

  const header=Buffer.from(await blob.arrayBuffer()).subarray(0,5).toString('ascii');
  assert.equal(header,'%PDF-');
  assert.equal(exportMeta.title,'ChatToPaper full-flow QA');
  assert.equal(exportMeta.creator,'ChatToPaper');
  assert.equal(exportMeta.producer,'ChatToPaper — processed locally');
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


test('real pdf-lib dependency saves and reloads metadata',async()=>{
  const pdf=await RealPDFLib.PDFDocument.create();
  pdf.setTitle('ChatToPaper dependency QA');
  pdf.setCreator('ChatToPaper');
  pdf.setProducer('ChatToPaper — processed locally');
  pdf.addPage([120,120]);
  const bytes=await pdf.save();
  assert.ok(bytes.length>500);
  const loaded=await RealPDFLib.PDFDocument.load(bytes);
  assert.equal(loaded.getTitle(),'ChatToPaper dependency QA');
  assert.equal(loaded.getCreator(),'ChatToPaper');
  assert.equal(loaded.getProducer(),'ChatToPaper — processed locally');
  assert.equal(loaded.getPageCount(),1);
});
