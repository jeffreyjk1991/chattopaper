'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');

function makeRes(){
  return {
    statusCode:0,headers:{},body:'',
    setHeader(k,v){this.headers[String(k).toLowerCase()]=v;},
    end(v=''){this.body=v;}
  };
}
function loadHandler(){
  process.env.PDF_COUNTER_FUNCTION_URL='https://counter.internal.test/';
  process.env.PDF_COUNTER_SECRET='test-secret';
  delete require.cache[require.resolve('../api/pdf-count.js')];
  return require('../api/pdf-count.js');
}

test('GET proxies count through private Neon Function',async()=>{
  const calls=[];
  global.fetch=async(url,opts)=>{calls.push([url,opts]);return {ok:true,status:200,json:async()=>({count:2})};};
  const handler=loadHandler();
  const res=makeRes();
  await handler({method:'GET',headers:{}},res);
  assert.equal(res.statusCode,200);
  assert.deepEqual(JSON.parse(res.body),{count:2});
  assert.equal(calls[0][0],'https://counter.internal.test/');
  assert.equal(calls[0][1].method,'GET');
  assert.equal(calls[0][1].headers['x-counter-secret'],'test-secret');
});

test('POST validates origin and forwards event id to Neon Function',async()=>{
  const calls=[];
  global.fetch=async(url,opts)=>{calls.push([url,opts]);return {ok:true,status:200,json:async()=>({count:3})};};
  const handler=loadHandler();

  const bad=makeRes();
  await handler({method:'POST',headers:{origin:'https://example.com'},body:{eventId:'9f9f2b7c-6b31-4d88-9a9d-4be94ca66f10'}},bad);
  assert.equal(bad.statusCode,403);
  assert.equal(calls.length,0);

  const good=makeRes();
  await handler({method:'POST',headers:{origin:'https://chattopaper.com'},body:{eventId:'9f9f2b7c-6b31-4d88-9a9d-4be94ca66f10'}},good);
  assert.equal(good.statusCode,200);
  assert.deepEqual(JSON.parse(good.body),{count:3});
  assert.equal(calls.length,1);
  assert.equal(calls[0][1].headers['x-counter-secret'],'test-secret');
  assert.deepEqual(JSON.parse(calls[0][1].body),{eventId:'9f9f2b7c-6b31-4d88-9a9d-4be94ca66f10'});
});

test('invalid UUID is rejected before backend call',async()=>{
  let calls=0;
  global.fetch=async()=>{calls++;return {ok:true,status:200,json:async()=>({count:9})};};
  const handler=loadHandler();
  const res=makeRes();
  await handler({method:'POST',headers:{origin:'https://chattopaper.com'},body:{eventId:'bad'}},res);
  assert.equal(res.statusCode,400);
  assert.equal(calls,0);
});
