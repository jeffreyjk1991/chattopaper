'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('src/app.js','utf8');
const home=fs.readFileSync('src/index.html','utf8');

test('free launch bypasses Stripe before PDF creation',()=>{
  assert.match(app,/const freeLaunchMode = Boolean\(window\.CHATTOPAPER_FREE_LAUNCH\)/);
  assert.match(app,/if\(freeLaunchMode\) state\.paymentUnlocked=true/);
  assert.match(home,/Download PDF — Free/);
  assert.match(home,/<s>99¢<\/s>/);
});

test('build controls free launch from Vercel environment',()=>{
  const build=fs.readFileSync('build.cjs','utf8');
  assert.match(build,/process\.env\.FREE_LAUNCH/);
  assert.match(build,/__FREE_LAUNCH__/);
});
