'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const build = fs.readFileSync('build.cjs','utf8');
const home = fs.readFileSync('src/index.html','utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json','utf8'));

test('AI search crawlers and sitemap stay enabled', () => {
  for (const bot of ['OAI-SearchBot','ChatGPT-User','GPTBot','Googlebot','Bingbot','Google-Extended','PerplexityBot']) assert.match(build,new RegExp(bot));
  assert.match(build,/sitemap\.xml/);
  assert.match(build,/llms-full\.txt/);
});

test('IndexNow ownership key is published', () => {
  assert.match(build,/INDEXNOW_KEY/);
  assert.match(build,/3a7f873b81f8e917ee92d1d32d7575be/);
});

test('homepage exposes product entity data', () => {
  assert.match(home,/"@type":"WebApplication"/);
  assert.match(home,/"featureList"/);
  assert.match(home,/"@type":"Organization"/);
});

test('canonical path style is consistent', () => {
  assert.equal(vercel.trailingSlash,true);
});


test('utility pages stay out of the index', () => {
  assert.match(build,/robots:'noindex,follow'/);
  const cfg=JSON.parse(fs.readFileSync('vercel.json','utf8'));
  const map=new Map(cfg.headers.map(h=>[h.source,h.headers]));
  assert.ok(map.has('/ChatToPaper.html'));
  assert.ok(map.has('/payment-success/(.*)'));
});


test('production metadata uses chattopaper.com and free launch offer', () => {
  const home=fs.readFileSync('src/index.html','utf8');
  assert.match(home,/https:\/\/chattopaper\.com\//);
  assert.doesNotMatch(home,/https:\/\/chattopaper\.vercel\.app/);
  assert.match(home,/"price":"0"/);
  assert.match(home,/CHATTOPAPER_FREE_LAUNCH = __FREE_LAUNCH__/);
  assert.match(home,/Free for a limited time/);
});


test('about page reads the live PDF usage count through first-party API',()=>{
  const build=fs.readFileSync('build.cjs','utf8');
  const home=fs.readFileSync('src/index.html','utf8');
  assert.match(build,/PDFs generated today/);
  assert.match(build,/fetch\('\/api\/pdf-count'/);
  assert.match(build,/pdf-generated-count/);
  assert.doesNotMatch(home,/PDFs generated since tracking started/);
  const api=fs.readFileSync('api/pdf-count.js','utf8');
  assert.match(api,/DATABASE_URL/);
  assert.match(api,/pdf_generation_events/);
  assert.match(api,/referrer_host/);
  assert.match(api,/device_type/);
  assert.doesNotMatch(api,/x-forwarded-for|x-real-ip/);
});

test('approved logo assets are wired across branding',()=>{
  const home=fs.readFileSync('src/index.html','utf8');
  const build=fs.readFileSync('build.cjs','utf8');
  for(const asset of ['logo-icon-original-20261023.png','logo-wordmark-original-20261023.png']){
    assert.ok(fs.existsSync('assets/'+asset),asset+' missing');
    assert.match(build,new RegExp(asset.replace('.','\\.')));
  }
  assert.match(home,/logo-wordmark-original-20261023\.png/);
  assert.match(home,/favicon\.png/);
  assert.match(build,/brand-image/);
  assert.match(build,/manifest\.webmanifest/);
  assert.match(build,/favicon\.png/);
});


test('export checker is crawlable and included in discovery files',()=>{
  const build=fs.readFileSync('build.cjs','utf8');
  assert.match(build,/WhatsApp Export Checker/);
  assert.match(build,/tools\/whatsapp-export-checker/);
  assert.match(build,/export_checker_completed/);
});


test('search snippets emphasize chat-to-PDF, privacy and Android intent',()=>{
  const home=fs.readFileSync('src/index.html','utf8');
  const articles=fs.readFileSync('content/articles.cjs','utf8');
  const detailed=fs.readFileSync('content/detailed-guides.cjs','utf8');
  const build=fs.readFileSync('build.cjs','utf8');
  assert.match(home,/<title>Free WhatsApp Chat to PDF Converter \| Private, No Upload<\/title>/);
  assert.match(home,/no account or app install/i);
  assert.match(home,/your chat is not uploaded/i);
  assert.match(articles,/How to Export a WhatsApp Chat on Android & Save as PDF/);
  assert.match(articles,/export whatsapp chat android pdf/);
  assert.match(detailed,/modern Android browser/);
  assert.match(detailed,/A4 is common in many countries/);
  assert.match(build,/Android: export a WhatsApp chat and save it as PDF/);
  assert.match(build,/no ChatToPaper account or app install/);
});
