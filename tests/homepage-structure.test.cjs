'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('src/index.html', 'utf8');
const app = fs.readFileSync('src/app.js', 'utf8');

test('minimal homepage keeps converter-critical controls', () => {
  const ids = [...app.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]).filter(id => id !== 'confirm-dates');
  for (const id of new Set(ids)) assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
});

test('homepage is intentionally minimal', () => {
  assert.match(html, /Free WhatsApp to PDF Converter/);
  assert.match(html, /Customize PDF/);
  assert.doesNotMatch(html, /BIG FEELINGS\. SMALL PRICE\./);
  assert.doesNotMatch(html, /LESS FUSS\. MORE FOREVER\./);
  assert.doesNotMatch(html, /Keep the words\./);
  const sections = (html.match(/<section\b/g) || []).length;
  assert.ok(sections <= 6, `expected <= 6 sections, found ${sections}`);
});
test('homepage uses approved ChatToPaper wordmark',()=>{
  assert.match(html,/class="brand brand-image"/);
  assert.match(html,/\/assets\/logo-wordmark-original-20261023\.png/);
  assert.match(html,/\/assets\/logo-icon-original-20261023\.png/);
});
