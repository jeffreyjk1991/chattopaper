/* Local SMS Backup & Restore XML reader for ChatToPaper. */
(function(root,factory){
  'use strict';
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChatSmsImport=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const pad=n=>String(n).padStart(2,'0');
  function decodeEntity(value){
    return String(value||'').replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos);/gi,(m,k)=>{
      const key=k.toLowerCase();
      if(key==='amp')return '&';if(key==='lt')return '<';if(key==='gt')return '>';if(key==='quot')return '"';if(key==='apos')return "'";
      const n=key.startsWith('#x')?parseInt(key.slice(2),16):parseInt(key.slice(1),10);
      return Number.isFinite(n)?String.fromCodePoint(n):m;
    });
  }
  function attrs(tag){
    const out={};const re=/([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;let m;
    while((m=re.exec(tag)))out[m[1]]=decodeEntity(m[3]??m[4]??'');
    return out;
  }
  function dateFromMs(value){
    const ms=Number(value);if(!Number.isFinite(ms))return null;const d=new Date(ms);if(!Number.isFinite(d.getTime()))return null;
    return {timestamp:d.getTime(),dateKey:`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`,timeLabel:`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,rawTimestamp:d.toISOString()};
  }
  function summarize(messages){
    const participants=Array.from(new Set(messages.map(m=>m.sender).filter(Boolean))),dates=messages.map(m=>m.dateKey).filter(Boolean).sort();
    return {messages,participants,dateOrder:'YMD',ambiguousDates:false,warnings:[],platform:'sms',stats:{messages:messages.length,userMessages:messages.length,systemMessages:0,photosReferenced:0,omittedMedia:0,unsupportedMedia:0,invalidDates:messages.filter(m=>m.invalidTimestamp).length,preservedLeadingLines:0,validDatedMessages:messages.filter(m=>!m.invalidTimestamp).length,firstDate:dates[0]||null,lastDate:dates[dates.length-1]||null,sourceLines:messages.length}};
  }
  function parseXml(text){
    if(!/<smses\b/i.test(text)||!/<sms\b/i.test(text))return [];
    const groups=new Map();const re=/<sms\b[^>]*\/?\s*>/gi;let m,index=0;
    while((m=re.exec(text))){
      const a=attrs(m[0]),body=a.body||'';if(!body)continue;
      const address=a.address||'Unknown number',title=a.contact_name&&a.contact_name!=='(Unknown)'?a.contact_name:address;
      if(!groups.has(address))groups.set(address,{id:`sms:${encodeURIComponent(address)}`,title,platform:'sms',messages:[]});
      const date=dateFromMs(a.date),sent=String(a.type)==='2';
      groups.get(address).messages.push({id:`sms-${++index}`,sender:sent?'You':title,text:body,timestamp:date?date.timestamp:null,rawTimestamp:date?date.rawTimestamp:'',dateKey:date?date.dateKey:null,timeLabel:date?date.timeLabel:'',isSystem:false,invalidTimestamp:!date,attachment:null});
    }
    for(const g of groups.values())g.messages.sort((a,b)=>(a.timestamp??Number.MAX_SAFE_INTEGER)-(b.timestamp??Number.MAX_SAFE_INTEGER));
    return [...groups.values()];
  }
  async function readFiles(fileList,options){
    options=options||{};const files=Array.from(fileList||[]),xmls=files.filter(f=>/\.xml$/i.test(String(f.name||'')));
    if(xmls.length!==1)return null;const file=xmls[0];if(file.size>100*1024*1024){const e=new Error('Please choose an SMS XML backup under 100 MB.');e.code='UPLOAD_TOO_LARGE';throw e;}
    const text=new TextDecoder('utf-8').decode(new Uint8Array(await file.arrayBuffer()));const choices=parseXml(text);if(!choices.length)return null;
    if(choices.length>1&&!options.conversationId)return {needsConversation:true,fileName:file.name,choices:choices.map(c=>({id:c.id,title:c.title,platform:'sms',messageCount:c.messages.length}))};
    const selected=choices.find(c=>c.id===options.conversationId)||choices[0];
    return {text:'',parsed:summarize(selected.messages),platform:'sms',conversationTitle:selected.title,fileName:file.name,chatFileName:file.name,media:new Map(),warnings:['SMS XML backups are read locally in your browser. MMS attachments are not imported in this version.']};
  }
  return Object.freeze({readFiles,parseXml});
});