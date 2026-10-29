'use strict';
// Run after the static build. Validate the output crawlers receive, not templates.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const articles = require('../content/articles.cjs');
const root = path.join(__dirname,'../dist');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]));
assert.equal(new Set(urls.map(u=>u.href)).size,urls.length,'Duplicate sitemap URL');
const titles = new Set();
for (const url of urls) {
  const file = url.pathname==='/' ? 'index.html' : url.pathname.slice(1)+'index.html';
  const html = read(file);
  assert.ok(html.includes(`<link rel="canonical" href="${url.href}">`),`Canonical: ${file}`);
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html),`Indexable: ${file}`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title),`Unique title: ${file}`); titles.add(title);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`One H1: ${file}`);
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  for(const match of html.matchAll(/href="(\/[^"?#]*)(#[^"]*)?"/g)) {
    const target=path.join(root,match[1].endsWith('/') ? match[1]+'index.html' : match[1]);
    assert.ok(fs.existsSync(target),`Broken internal link ${match[1]} on ${file}`);
    if(match[2] && target.endsWith('.html')) assert.ok(fs.readFileSync(target,'utf8').includes(`id="${match[2].slice(1)}"`),`Broken fragment ${match[0]}`);
  }
}
for(const article of articles){
  const html=read(`blog/${article.slug}/index.html`);
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const schema=schemas.find(s=>s && s['@type']==='BlogPosting');
  assert.ok(schema,`BlogPosting schema missing: ${article.slug}`);
  assert.equal(schema.dateModified,article.updated);
  assert.ok(html.includes(`datetime="${article.updated}"`));
  assert.ok(sitemap.includes(`/blog/${article.slug}/</loc><lastmod>${article.updated}</lastmod>`));
  if(article.sections){
    assert.ok(!html.includes('For this specific question'),'Detailed guide still contains boilerplate');
    for(let i=0;i<article.sections.length;i++) assert.ok(html.includes(`id="section-${i+1}"`));
    assert.ok(html.includes('id="questions"'));
  }
}
const feed=read('feed.xml');
for(const item of [...feed.matchAll(/<pubDate>(.*?)<\/pubDate>/g)]) assert.ok(Number.isFinite(Date.parse(item[1])));
assert.ok(!sitemap.includes('payment-success') && !sitemap.includes('ChatToPaper.html'));
console.log(`SEO output verified: ${urls.length} canonical pages, internal links, structured data, dates and ${articles.filter(a=>a.sections).length} detailed guides.`);
