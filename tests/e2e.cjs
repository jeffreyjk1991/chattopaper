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
    const pagesBefore=context.pages().length;
    await page.locator('#download-open').click();
    await page.locator('#download-dialog').waitFor({state:'visible'});
    assert.match(await page.locator('#download-status').innerText(),/no checkout required/i);

    const downloadPromise=page.waitForEvent('download',{timeout:30000});
    await page.locator('#download-confirm').click();
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
    assert.deepEqual(pageErrors,[],'desktop page errors: '+pageErrors.join('; '));

    await page.locator('#download-return').click();
    await page.locator('#clear-file').click();
    await page.locator('#file-input').setInputFiles({name:'broken.zip',mimeType:'application/zip',buffer:Buffer.from('broken zip')});
    await page.waitForFunction(()=>document.querySelector('#message-count')?.textContent.trim()==='—',null,{timeout:10000});
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

    console.log('E2E PASS: desktop ZIP -> preview -> free PDF, recovery, mobile TXT, branding, SEO assets.');
  } finally {
    await browser.close().catch(()=>{});
    await new Promise(resolve=>srv.close(resolve));
  }
}
main().catch(err=>{console.error(err);process.exit(1);});
