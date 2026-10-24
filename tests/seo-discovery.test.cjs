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
  assert.match(api,/PDF_COUNTER_FUNCTION_URL/);
  assert.match(api,/PDF_COUNTER_SECRET/);
  assert.match(api,/x-counter-secret/);
});

test('approved logo assets are wired across branding',()=>{
  const home=fs.readFileSync('src/index.html','utf8');
  const build=fs.readFileSync('build.cjs','utf8');
  for(const asset of ['logo-icon-original-20261023.png','logo-wordmark-original-20261023.png']){
    assert.ok(fs.existsSync('assets/'+asset),asset+' missing');
    assert.match(build,new RegExp(asset.replace('.','\\.')));
  }
  assert.match(home,/logo-wordmark-original-20261023\.png/);
  assert.match(home,/logo-icon-original-20261023\.png/);
  assert.match(build,/brand-image/);
  assert.match(build,/manifest\.webmanifest/);
});
