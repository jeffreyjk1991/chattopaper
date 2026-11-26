/* Counts successful real recap generations without transmitting chat data. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WrappedCounter=api})(globalThis,function(){
'use strict';
function begin(options={}){
 let id=null,started=false;
 const production=options.production??['chattopaper.com','www.chattopaper.com'].includes(globalThis.location?.hostname);
 const makeId=options.makeId||(()=>globalThis.crypto.randomUUID());
 const send=options.send||((payload)=>fetch('/api/wrapped-count',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),keepalive:true,credentials:'same-origin'}));
 const schedule=options.schedule||((fn)=>setTimeout(fn,1500));
 return {record(platform){
  if(started||!production)return false;
  try{id=makeId()}catch(_){return false}
  if(!id)return false;started=true;
  const payload={eventId:id,platform};
  function attempt(retry){Promise.resolve().then(()=>send(payload)).then(r=>{if(!r?.ok)throw Error('counter failed')}).catch(()=>{if(retry)schedule(()=>attempt(false))})}
  attempt(true);return true;
 }};
}
return {begin};
});
