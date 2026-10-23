'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const build = fs.readFileSync('build.cjs','utf8');
const home = fs.readFileSync('src/index.html','utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json','utf8'));

test('AI search crawlers and sitemap stay enabled', () => {
  for (const bot of ['OAI-SearchBot','ChatGPT-User','GPTBot','Googlebot','Bingbot']) assert.match(build,new RegExp(bot));
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
