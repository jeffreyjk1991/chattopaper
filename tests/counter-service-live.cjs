'use strict';
const assert=require('node:assert/strict');

const base='https://counterapi.com/api/chattopaper.com/pdf/qa-generated-v2-20261023';

async function read(){
  const r=await fetch(base+'?startNumber=0&readOnly=true',{cache:'no-store'});
  assert.equal(r.ok,true,'CounterAPI read failed: '+r.status);
  const d=await r.json();
  assert.ok(Number.isFinite(Number(d.value)),'CounterAPI read returned no numeric value');
  return Number(d.value);
}

async function main(){
  const before=await read();
  const hit=await fetch(base+'?startNumber=0',{cache:'no-store'});
  assert.equal(hit.ok,true,'CounterAPI increment failed: '+hit.status);
  const hitData=await hit.json();
  assert.equal(Number(hitData.value),before+1,'CounterAPI increment response did not advance by one');
  const after=await read();
  assert.equal(after,before+1,'CounterAPI read-after-write did not persist');
  console.log('CounterAPI live smoke PASS:',before,'->',after);
}
main().catch(err=>{console.error(err);process.exit(1);});
