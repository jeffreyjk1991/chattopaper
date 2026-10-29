'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const pg=require('pg');

function makeRes(){
  return {
    statusCode:0,headers:{},body:'',
    setHeader(k,v){this.headers[String(k).toLowerCase()]=v;},
    end(v=''){this.body=v;}
  };
}

function loadHandler(queryImpl){
  process.env.DATABASE_URL='postgresql://test:test@localhost/test';
  delete globalThis.__chattopaperPdfEventPool;
  const original=pg.Pool.prototype.query;
  pg.Pool.prototype.query=queryImpl;
  delete require.cache[require.resolve('../api/pdf-count.js')];
  const handler=require('../api/pdf-count.js');
  return {handler,restore(){pg.Pool.prototype.query=original;delete globalThis.__chattopaperPdfEventPool;}};
}

test('GET reads live count directly from Neon table',async()=>{
  const calls=[];
  const {handler,restore}=loadHandler(async(sql,params)=>{calls.push([sql,params]);return {rows:[{total:'7'}]};});
  try{
    const res=makeRes();
    await handler({method:'GET',headers:{}},res);
    assert.equal(res.statusCode,200);
    assert.deepEqual(JSON.parse(res.body),{count:7});
    assert.match(calls[0][0],/count\(\*\).*pdf_generation_events/i);
  }finally{restore();}
});

test('POST stores coarse attribution and device with the conversion event',async()=>{
  const calls=[];
  const {handler,restore}=loadHandler(async(sql,params)=>{
    calls.push([sql,params]);
    if(/INSERT INTO/i.test(sql)) return {rows:[]};
    return {rows:[{total:'8'}]};
  });
  try{
    const res=makeRes();
    await handler({
      method:'POST',
      headers:{
        origin:'https://chattopaper.com',
        'user-agent':'Mozilla/5.0 (iPhone; Mobile)',
        'x-vercel-ip-country':'US',
        'x-vercel-ip-country-region':'MI'
      },
      body:{
        eventId:'9f9f2b7c-6b31-4d88-9a9d-4be94ca66f10',
        referrerHost:'google.com',
        utmSource:'google',
        utmMedium:'organic',
        utmCampaign:'whatsapp-pdf',
        landingPage:'/blog/convert-whatsapp-chat-to-pdf/'
      }
    },res);
    assert.equal(res.statusCode,200);
    assert.deepEqual(JSON.parse(res.body),{count:8});
    const insert=calls.find(([sql])=>/INSERT INTO/i.test(sql));
    assert.ok(insert);
    assert.match(insert[0],/country,region,referrer_host,utm_source,utm_medium,utm_campaign,landing_page,device_type/);
    assert.deepEqual(insert[1],[
      '9f9f2b7c-6b31-4d88-9a9d-4be94ca66f10',
      'US','MI','google.com','google','organic','whatsapp-pdf',
      '/blog/convert-whatsapp-chat-to-pdf/','mobile'
    ]);
  }finally{restore();}
});

test('POST rejects foreign origin and invalid event IDs before SQL insert',async()=>{
  let queries=0;
  const {handler,restore}=loadHandler(async()=>{queries++;return {rows:[{total:'1'}]};});
  try{
    const foreign=makeRes();
    await handler({method:'POST',headers:{origin:'https://example.com'},body:{eventId:'9f9f2b7c-6b31-4d88-9a9d-4be94ca66f10'}},foreign);
    assert.equal(foreign.statusCode,403);

    const invalid=makeRes();
    await handler({method:'POST',headers:{origin:'https://chattopaper.com'},body:{eventId:'bad'}},invalid);
    assert.equal(invalid.statusCode,400);
    assert.equal(queries,0);
  }finally{restore();}
});

test('PDF event endpoint never stores raw client IP headers',()=>{
  const fs=require('node:fs');
  const api=fs.readFileSync('api/pdf-count.js','utf8');
  assert.doesNotMatch(api,/x-forwarded-for|x-real-ip|x-vercel-forwarded-for/);
});
