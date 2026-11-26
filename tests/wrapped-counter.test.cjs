'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Counter=require('../src/wrapped-counter.js');
const uuid='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('one event per generated recap with only UUID and platform; retry keeps same UUID',async()=>{
 const calls=[],queue=[];const event=Counter.begin({production:true,makeId:()=>uuid,send:async(p)=>{calls.push({...p});return {ok:calls.length>1}},schedule:f=>queue.push(f)});
 assert.equal(event.record('meta'),true);assert.equal(event.record('meta'),false);await tick();assert.equal(queue.length,1);queue[0]();await tick();assert.deepEqual(calls,[{eventId:uuid,platform:'meta'},{eventId:uuid,platform:'meta'}]);assert.equal(event.record('meta'),false);
});
test('preview environment never records events',async()=>{const event=Counter.begin({production:false,send:()=>assert.fail('preview sent an event')});assert.equal(event.record('whatsapp'),false)});
test('wrapped API rejects foreign origins and invalid input, deduplicates with SQL, and returns aggregate count',async()=>{
 const rows=new Set(),calls=[];globalThis.__chattopaperWrappedEventPool={query:async(sql,values)=>{calls.push({sql,values});if(sql.startsWith('INSERT')){rows.add(values[0]);return {rows:[]}}return {rows:[{total:String(rows.size)}]}}};
 process.env.DATABASE_URL='test-placeholder';const handler=require('../api/wrapped-count.js');
 async function request(method,body,origin='https://chattopaper.com'){const res={setHeader(){},end(s){this.body=JSON.parse(s)}};await handler({method,body,headers:{origin}},res);return {status:res.statusCode,body:res.body}}
 assert.equal((await request('POST',{eventId:uuid,platform:'meta'},'https://example.org')).status,403);
 assert.equal((await request('POST',{eventId:uuid,platform:'secret text'})).status,400);
 assert.equal(calls.length,0);
 assert.equal((await request('POST',{eventId:uuid,platform:'meta',chatText:'not stored'})).status,200);
 assert.equal((await request('POST',{eventId:uuid,platform:'meta'})).status,200);
 assert.equal((await request('GET')).body.count,1);
 assert.deepEqual(calls[0].values,[uuid,'meta']);assert.match(calls[0].sql,/ON CONFLICT \(event_id\) DO NOTHING/);
});
