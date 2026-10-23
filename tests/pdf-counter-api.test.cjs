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

test('GET reads production counter without incrementing',async()=>{
  const calls=[];
  global.fetch=async(url,opts)=>{calls.push([url,opts]);return {ok:true,status:200,json:async()=>({value:2})};};
  delete require.cache[require.resolve('../api/pdf-count.js')];
  const handler=require('../api/pdf-count.js');
  const res=makeRes();
  await handler({method:'GET',query:{},headers:{}},res);
  assert.equal(res.statusCode,200);
  assert.deepEqual(JSON.parse(res.body),{count:2});
  assert.match(calls[0][0],/generated-v2-20261023/);
  assert.match(calls[0][0],/readOnly=true/);
  assert.match(calls[0][0],/startNumber=2/);
});

test('POST increments production counter and enforces first-party origin',async()=>{
  let calls=0;
  global.fetch=async()=>{calls++;return {ok:true,status:200,json:async()=>({value:3})};};
  delete require.cache[require.resolve('../api/pdf-count.js')];
  const handler=require('../api/pdf-count.js');

  const bad=makeRes();
  await handler({method:'POST',query:{},headers:{origin:'https://example.com'}},bad);
  assert.equal(bad.statusCode,403);
  assert.equal(calls,0);

  const good=makeRes();
  await handler({method:'POST',query:{},headers:{origin:'https://chattopaper.com'}},good);
  assert.equal(good.statusCode,200);
  assert.deepEqual(JSON.parse(good.body),{count:3});
  assert.equal(calls,1);
});

test('QA mode uses an isolated counter key',async()=>{
  let seen='';
  global.fetch=async(url)=>{seen=url;return {ok:true,status:200,json:async()=>({value:7})};};
  delete require.cache[require.resolve('../api/pdf-count.js')];
  const handler=require('../api/pdf-count.js');
  const res=makeRes();
  await handler({method:'POST',query:{qa:'1'},headers:{}},res);
  assert.equal(res.statusCode,200);
  assert.match(seen,/qa-generated-v2-20261023/);
  assert.doesNotMatch(seen,/\/generated-v2-20261023\?/);
});
