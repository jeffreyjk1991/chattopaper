'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const zlib=require('node:zlib');
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');

const root=path.resolve(__dirname,'..','dist');
function crc32(buf){
  let crc=0xffffffff;
  for(const byte of buf){
    crc^=byte;
    for(let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
}
function makeZip(entries){
  const local=[],central=[]; let offset=0;
  for(const source of entries){
    const name=Buffer.from(source.name), content=Buffer.from(source.content);
    const compressed=zlib.deflateRawSync(content), crc=crc32(content);
    const header=Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50,0); header.writeUInt16LE(20,4); header.writeUInt16LE(0,6); header.writeUInt16LE(8,8);
    header.writeUInt32LE(crc,14); header.writeUInt32LE(compressed.length,18); header.writeUInt32LE(content.length,22); header.writeUInt16LE(name.length,26);
    const entry=Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50,0); entry.writeUInt16LE(20,4); entry.writeUInt16LE(20,6); entry.writeUInt16LE(0,8); entry.writeUInt16LE(8,10);
    entry.writeUInt32LE(crc,16); entry.writeUInt32LE(compressed.length,20); entry.writeUInt32LE(content.length,24); entry.writeUInt16LE(name.length,28); entry.writeUInt32LE(offset,42);
    local.push(header,name,compressed); central.push(entry,name); offset+=header.length+name.length+compressed.length;
  }
  const dir=Buffer.concat(central), end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0); end.writeUInt16LE(entries.length,8); end.writeUInt16LE(entries.length,10); end.writeUInt32LE(dir.length,12); end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,dir,end]);
}

const JPEG=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAACAAIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6pooooA//2Q==','base64');
const fixtureSource=fs.readFileSync(path.join(__dirname,'importer-regression.test.cjs'),'utf8');
const appleMatch=fixtureSource.match(/const APPLE_DB_FIXTURE = gunzipSync\(Buffer\.from\('([^']+)'/);
assert.ok(appleMatch,'Apple Messages DB fixture missing');
const APPLE_DB=zlib.gunzipSync(Buffer.from(appleMatch[1],'base64'));

async function assertPdfDownload(page,expectedTitle){
  await page.waitForFunction(()=>!document.querySelector('#download-open')?.disabled,null,{timeout:20000});
  const downloadPromise=page.waitForEvent('download',{timeout:30000});
  await page.locator('#download-open').click();
  const download=await downloadPromise;
  const saved=await download.path();
  assert.ok(saved,'browser download path missing');
  const bytes=fs.readFileSync(saved);
  assert.equal(bytes.subarray(0,5).toString('ascii'),'%PDF-');
  assert.ok(bytes.length>1000,'downloaded PDF unexpectedly small');
  const pdf=await PDFDocument.load(bytes,{updateMetadata:false});
  assert.equal(pdf.getCreator(),'ChatToPaper');
  assert.equal(pdf.getProducer(),'ChatToPaper — processed locally');
  assert.ok(pdf.getPageCount()>=1);
  if(expectedTitle)assert.equal(pdf.getTitle(),expectedTitle);
}

async function runPlatformCase(context,base,fixture){
  const page=await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.locator('#file-input').setInputFiles(fixture.files);
  if(fixture.choiceTitle){
    await page.waitForFunction(()=>!document.querySelector('#conversation-choice')?.hidden,null,{timeout:15000});
    const option=page.locator('#conversation-select option').filter({hasText:fixture.choiceTitle});
    assert.equal(await option.count(),1,'expected conversation choice missing: '+fixture.choiceTitle);
    await page.locator('#conversation-select').selectOption(await option.getAttribute('value'));
    await page.locator('#conversation-open').click();
  }
  await waitText(page,'#message-count',String(fixture.messages));
  await page.locator('.customize-panel').evaluate(el=>{if(!el.open)el.open=true;});
  await page.locator('#document-title').fill(fixture.pdfTitle);
  await page.waitForFunction(()=>Number(document.querySelector('#page-count')?.textContent)>0,null,{timeout:20000});
  assert.match(await page.locator('#file-meta').innerText(),fixture.platformLabel);
  const transcript=await page.locator('#preview-transcript').innerText();
  for(const expected of fixture.texts)assert.ok(transcript.includes(expected),'preview missing '+expected);
  if(fixture.photos!==undefined)await waitText(page,'#photo-count',String(fixture.photos));
  await assertPdfDownload(page,fixture.pdfTitle);
  await page.waitForURL(base+'/',{timeout:10000});
  assert.deepEqual(errors,[],'page errors for '+fixture.name+': '+errors.join('; '));
  await page.close();
}

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
function server(){
  return http.createServer((req,res)=>{
    let pathname=new URL(req.url,'http://127.0.0.1').pathname;
    try{pathname=decodeURIComponent(pathname);}catch(_){}
    let file=path.join(root,pathname.replace(/^\/+/,'')); 
    if(pathname.endsWith('/')) file=path.join(file,'index.html');
    if(!path.extname(file) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
    if(!fs.existsSync(file) || !fs.statSync(file).isFile()){res.writeHead(404);res.end('not found');return;}
    const ext=path.extname(file);
    res.writeHead(200,{'content-type':types[ext]||'application/octet-stream','cache-control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
}
async function waitText(page,selector,expected){
  await page.waitForFunction(({selector,expected})=>document.querySelector(selector)?.textContent.trim()===expected,{selector,expected},{timeout:15000});
}
async function main(){
  assert.ok(fs.existsSync(path.join(root,'index.html')),'dist/index.html must exist');
  const srv=server();
  await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));
  const port=srv.address().port, base=`http://127.0.0.1:${port}`;
  const browser=await chromium.launch(process.env.PLAYWRIGHT_USE_SYSTEM_CHROME==='true'?{headless:true,channel:'chrome'}:{headless:true});
  try{
    const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}});
    const page=await context.newPage();
    const pageErrors=[]; page.on('pageerror',e=>pageErrors.push(String(e)));
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    assert.equal((await page.locator('a.brand').first().textContent()).trim(),'ChatToPaper');
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://chattopaper.com/');
    assert.match(await page.locator('body').innerText(),/Free for a limited time/);
    assert.equal((await page.locator('body').innerText()).includes('Chatto'+'Paper'),false);

    const chat='[10/23/2026, 9:00 AM] Alex: Hello Jamie\n[10/23/2026, 9:01 AM] Jamie: Hi Alex\n[10/23/2026, 9:02 AM] Alex: This is the third message';
    const zip=makeZip([{name:'_chat.txt',content:chat}]);
    await page.locator('#file-input').setInputFiles({name:'WhatsApp Chat.zip',mimeType:'application/zip',buffer:zip});
    await waitText(page,'#message-count','3');
    await page.waitForFunction(()=>Number(document.querySelector('#page-count')?.textContent)>0,null,{timeout:15000});
    assert.ok(await page.locator('#preview-canvas').evaluate(el=>el.width>0 && el.height>0));
    assert.match(await page.locator('#download-open').innerText(),/Download PDF — Free/);
    assert.equal(await page.locator('#inline-download-wrap').isHidden(),true);
    const pagesBefore=context.pages().length;
    const downloadPromise=page.waitForEvent('download',{timeout:30000});
    await page.locator('#download-open').click();
    const download=await downloadPromise;
    const saved=await download.path();
    assert.ok(saved,'browser download path missing');
    const pdfBytes=fs.readFileSync(saved);
    assert.equal(pdfBytes.subarray(0,5).toString('ascii'),'%PDF-');
    assert.ok(pdfBytes.length>1000,'downloaded PDF unexpectedly small');
    const pdf=await PDFDocument.load(pdfBytes,{updateMetadata:false});
    assert.equal(pdf.getCreator(),'ChatToPaper');
    assert.equal(pdf.getProducer(),'ChatToPaper — processed locally');
    assert.ok(pdf.getPageCount()>=1);
    assert.equal(context.pages().length,pagesBefore,'free launch unexpectedly opened a checkout tab');
    await page.waitForURL(base+'/',{timeout:10000});
    assert.equal(await page.locator('#download-dialog').isVisible(),false,'free launch unexpectedly showed the old confirmation popup');
    assert.deepEqual(pageErrors,[],'desktop page errors: '+pageErrors.join('; '));


    // Every supported non-WhatsApp format must complete browser -> preview -> PDF.
    const telegramFull=JSON.stringify({chats:{list:[
      {id:10,name:'Other Telegram Chat',messages:[{id:1,type:'message',date:'2026-10-28T09:00:00',from:'Other',text:'Skip me'}]},
      {id:20,name:'Telegram QA',messages:[
        {id:2,type:'message',date:'2026-10-28T10:15:00',from:'Alex',text:'Telegram hello',photo:'photos/tg.jpg'},
        {id:3,type:'message',date:'2026-10-28T10:16:00',from:'Jamie',text:'Telegram reply'}
      ]}
    ]}});
    const telegramZip=makeZip([{name:'result.json',content:telegramFull},{name:'photos/tg.jpg',content:JPEG}]);

    const instagramThread=JSON.stringify({title:'Instagram QA',participants:[{name:'Alex'},{name:'Jamie'}],messages:[
      {sender_name:'Jamie',timestamp_ms:1793181660000,content:'Instagram reply'},
      {sender_name:'Alex',timestamp_ms:1793181600000,content:'Instagram hello',photos:[{uri:'your_instagram_activity/messages/inbox/instagram_qa/photos/ig.jpg'}]}
    ]});
    const instagramZip=makeZip([
      {name:'your_instagram_activity/messages/inbox/instagram_qa/message_1.json',content:instagramThread},
      {name:'your_instagram_activity/messages/inbox/instagram_qa/photos/ig.jpg',content:JPEG}
    ]);

    const messengerA=JSON.stringify({title:'Other Messenger',participants:[{name:'A'},{name:'B'}],messages:[
      {sender_name:'B',timestamp_ms:1793181660000,content:'Other thread'},
      {sender_name:'A',timestamp_ms:1793181600000,content:'Not selected'}
    ]});
    const messengerB=JSON.stringify({title:'Messenger QA',participants:[{name:'Alex'},{name:'Jamie'}],messages:[
      {sender_name:'Jamie',timestamp_ms:1793181720000,content:'Messenger second'},
      {sender_name:'Alex',timestamp_ms:1793181660000,content:'Messenger first'}
    ]});
    const messengerZip=makeZip([
      {name:'messages/inbox/other/message_1.json',content:messengerA},
      {name:'messages/inbox/messenger_qa/message_1.json',content:messengerB}
    ]);

    const smsXml='<?xml version="1.0"?><smses count="3"><sms address="+15550001" date="1793376000000" type="1" body="SMS hello" contact_name="Jamie"/><sms address="+15550001" date="1793376060000" type="2" body="SMS reply" contact_name="Jamie"/><sms address="+15550002" date="1793376120000" type="1" body="Other SMS" contact_name="Taylor"/></smses>';

    const platformContext=await browser.newContext({acceptDownloads:true,viewport:{width:1280,height:900}});
    await runPlatformCase(platformContext,base,{
      name:'Telegram',platformLabel:/Telegram/,pdfTitle:'Telegram QA PDF',messages:2,photos:1,texts:['Telegram hello','Telegram reply'],choiceTitle:'Telegram QA',
      files:{name:'telegram-export.zip',mimeType:'application/zip',buffer:telegramZip}
    });
    await runPlatformCase(platformContext,base,{
      name:'Instagram',platformLabel:/Instagram \/ Messenger/,pdfTitle:'Instagram QA PDF',messages:2,photos:1,texts:['Instagram hello','Instagram reply'],
      files:{name:'instagram-export.zip',mimeType:'application/zip',buffer:instagramZip}
    });
    await runPlatformCase(platformContext,base,{
      name:'Messenger',platformLabel:/Instagram \/ Messenger/,pdfTitle:'Messenger QA PDF',messages:2,photos:0,texts:['Messenger first','Messenger second'],choiceTitle:'Messenger QA',
      files:{name:'facebook-export.zip',mimeType:'application/zip',buffer:messengerZip}
    });
    await runPlatformCase(platformContext,base,{
      name:'iMessage',platformLabel:/iMessage/,pdfTitle:'iMessage QA PDF',messages:2,photos:0,texts:['Hello from Jamie'],
      files:{name:'chat.db',mimeType:'application/octet-stream',buffer:APPLE_DB}
    });
    await runPlatformCase(platformContext,base,{
      name:'SMS',platformLabel:/SMS/,pdfTitle:'SMS QA PDF',messages:2,photos:0,texts:['SMS hello','SMS reply'],choiceTitle:'Jamie',
      files:{name:'sms-backup.xml',mimeType:'application/xml',buffer:Buffer.from(smsXml)}
    });
    await platformContext.close();

    await page.locator('#file-input').setInputFiles({name:'broken.zip',mimeType:'application/zip',buffer:Buffer.from('broken zip')});
    await page.waitForFunction(()=>!document.querySelector('#import-error')?.hidden && document.querySelector('#import-error')?.textContent.trim().length>0,null,{timeout:10000});
    assert.match(await page.locator('#import-error').innerText(),/zip|archive/i);
    await page.locator('#file-input').setInputFiles({name:'WhatsApp Chat.zip',mimeType:'application/zip',buffer:zip});
    await waitText(page,'#message-count','3');
    await context.close();

    const mobile=await browser.newContext({acceptDownloads:true,viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const m=await mobile.newPage();
    const mobileErrors=[];m.on('pageerror',e=>mobileErrors.push(String(e)));
    await m.goto(base+'/',{waitUntil:'domcontentloaded'});
    await m.locator('#file-input').setInputFiles({name:'WhatsApp Chat.txt',mimeType:'text/plain',buffer:Buffer.from(chat)});
    await waitText(m,'#message-count','3');
    assert.match(await m.locator('#download-open').innerText(),/Download PDF — Free/);
    const box=await m.locator('#download-open').boundingBox();
    assert.ok(box && box.width>40 && box.height>=40,'mobile download button is not comfortably tappable');
    assert.deepEqual(mobileErrors,[],'mobile page errors: '+mobileErrors.join('; '));
    await mobile.close();

    const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
    const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
    const llms=fs.readFileSync(path.join(root,'llms.txt'),'utf8');
    assert.match(sitemap,/https:\/\/chattopaper\.com\//);
    assert.doesNotMatch(sitemap,/chattopaper\.vercel\.app/);
    assert.match(robots,/OAI-SearchBot/);
    assert.match(llms,/ChatToPaper/);
    assert.doesNotMatch(llms,new RegExp('Chatto'+'Paper'));

    console.log('E2E PASS: WhatsApp, Telegram, Instagram, Messenger, iMessage and SMS -> preview -> real PDF download; recovery, mobile, branding and SEO assets.');
  } finally {
    await browser.close().catch(()=>{});
    await new Promise(resolve=>srv.close(resolve));
  }
}
main().catch(err=>{console.error(err);process.exit(1);});
