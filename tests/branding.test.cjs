'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const oldBrand=['Chatto','Paper'].join('');
const newBrand='ChatToPaper';
const textExt=new Set(['.js','.cjs','.mjs','.json','.md','.html','.css','.svg','.txt','.xml','.webmanifest']);

function filesUnder(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules','dist','.vercel'].includes(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) out.push(...filesUnder(full));
    else if(textExt.has(path.extname(entry.name)) || entry.name==='README') out.push(full);
  }
  return out;
}

test('all product branding uses ChatToPaper capitalization',()=>{
  const offenders=[];
  for(const file of filesUnder('.')){
    const body=fs.readFileSync(file,'utf8');
    if(body.includes(oldBrand)) offenders.push(file);
  }
  assert.deepEqual(offenders,[],`old brand spelling remains in: ${offenders.join(', ')}`);
  const home=fs.readFileSync('src/index.html','utf8');
  assert.match(home,new RegExp(newBrand));
  const doc=fs.readFileSync('src/document.js','utf8');
  assert.match(doc,/setCreator\('ChatToPaper'\)/);
  assert.match(doc,/setProducer\('ChatToPaper — processed locally'\)/);
});
