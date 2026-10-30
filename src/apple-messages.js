/* Local Apple Messages (iMessage/SMS) SQLite reader for ChatToPaper. */
(function(root,factory){
  'use strict';
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChatAppleMessages=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const MAX_DB_BYTES=300*1024*1024;
  const td8=new TextDecoder('utf-8');
  const pad=n=>String(n).padStart(2,'0');

  function fail(code,message){const e=new Error(message);e.code=code;throw e;}
  function toNumber(value){return typeof value==='bigint'?Number(value):Number(value||0);}
  function isOne(value){return value===1||value===1n||value===true;}
  function bytesEqualAscii(bytes,offset,text){for(let i=0;i<text.length;i++)if(bytes[offset+i]!==text.charCodeAt(i))return false;return true;}
  function readU16(bytes,o){return (bytes[o]<<8)|bytes[o+1];}
  function readU32(bytes,o){return ((bytes[o]*0x1000000)+((bytes[o+1]<<16)|(bytes[o+2]<<8)|bytes[o+3]))>>>0;}
  function readVarint(bytes,offset){
    let value=0n,i=0;
    for(;i<8;i++){
      const b=bytes[offset+i];if(b===undefined)fail('INVALID_DB','The Apple Messages database is truncated.');
      value=(value<<7n)|BigInt(b&0x7f);
      if((b&0x80)===0)return {value,bytes:i+1};
    }
    const b=bytes[offset+8];if(b===undefined)fail('INVALID_DB','The Apple Messages database is truncated.');
    value=(value<<8n)|BigInt(b);return {value,bytes:9};
  }
  function signedBigInt(bytes,offset,length){
    let v=0n;for(let i=0;i<length;i++)v=(v<<8n)|BigInt(bytes[offset+i]);
    const bits=BigInt(length*8);if(v&(1n<<(bits-1n)))v-=1n<<bits;return v;
  }
  function serialLength(type){
    if(type===0)return 0;if(type===1)return 1;if(type===2)return 2;if(type===3)return 3;if(type===4)return 4;if(type===5)return 6;if(type===6||type===7)return 8;if(type===8||type===9)return 0;
    if(type>=12)return type%2===0?(type-12)/2:(type-13)/2;return 0;
  }
  function textDecoderFor(enc){try{return new TextDecoder(enc===2?'utf-16le':enc===3?'utf-16be':'utf-8');}catch(_){return td8;}}

  function createReader(bytes){
    if(!(bytes instanceof Uint8Array))bytes=new Uint8Array(bytes);
    if(bytes.byteLength<100||!bytesEqualAscii(bytes,0,'SQLite format 3\0'))fail('NOT_APPLE_DB','This is not a SQLite Messages database.');
    let pageSize=readU16(bytes,16);if(pageSize===1)pageSize=65536;
    if(pageSize<512||pageSize>65536||(pageSize&(pageSize-1)))fail('INVALID_DB','The Apple Messages database uses an unsupported page size.');
    const reserved=bytes[20]||0,usable=pageSize-reserved,encoding=readU32(bytes,56)||1,decoder=textDecoderFor(encoding);
    const pageCount=Math.floor(bytes.byteLength/pageSize);
    function pageOffset(pageNo){if(pageNo<1||pageNo>pageCount)fail('INVALID_DB','The Apple Messages database references an invalid page.');return (pageNo-1)*pageSize;}
    function localPayloadLength(payloadSize){
      if(payloadSize<=usable-35)return payloadSize;
      const min=Math.floor(((usable-12)*32)/255)-23;
      let local=min+((payloadSize-min)%(usable-4));
      if(local>usable-35)local=min;return local;
    }
    function readPayload(cellOffset,payloadSize){
      const local=localPayloadLength(payloadSize),out=new Uint8Array(payloadSize);
      out.set(bytes.subarray(cellOffset,cellOffset+local),0);
      if(local===payloadSize)return out;
      let pos=local,overflow=readU32(bytes,cellOffset+local),guard=0;
      while(overflow&&pos<payloadSize){
        if(++guard>pageCount)fail('INVALID_DB','The Apple Messages database overflow chain is invalid.');
        const po=pageOffset(overflow),next=readU32(bytes,po),take=Math.min(usable-4,payloadSize-pos);
        out.set(bytes.subarray(po+4,po+4+take),pos);pos+=take;overflow=next;
      }
      if(pos<payloadSize)fail('INVALID_DB','The Apple Messages database has a truncated record.');
      return out;
    }
    function parseRecord(payload){
      const header=readVarint(payload,0),headerSize=Number(header.value);let p=header.bytes;const serials=[];
      while(p<headerSize){const s=readVarint(payload,p);serials.push(Number(s.value));p+=s.bytes;}
      let dataOffset=headerSize;const values=[];
      for(const type of serials){
        const len=serialLength(type);let value=null;
        if(type>=1&&type<=6)value=signedBigInt(payload,dataOffset,len);
        else if(type===7){const dv=new DataView(payload.buffer,payload.byteOffset+dataOffset,8);value=dv.getFloat64(0,false);}
        else if(type===8)value=0n;else if(type===9)value=1n;
        else if(type>=12&&type%2===0)value=payload.slice(dataOffset,dataOffset+len);
        else if(type>=13&&type%2===1)value=decoder.decode(payload.subarray(dataOffset,dataOffset+len));
        values.push(value);dataOffset+=len;
      }
      return values;
    }
    function scanTable(rootPage,onRow){
      const stack=[rootPage],seen=new Set();
      while(stack.length){
        const pageNo=stack.pop();if(seen.has(pageNo))continue;seen.add(pageNo);
        if(seen.size>pageCount)fail('INVALID_DB','The Apple Messages database page tree is invalid.');
        const po=pageOffset(pageNo),h=po+(pageNo===1?100:0),type=bytes[h],cells=readU16(bytes,h+3);
        if(type===0x05){
          const right=readU32(bytes,h+8);if(right)stack.push(right);
          for(let i=cells-1;i>=0;i--){const ptr=readU16(bytes,h+12+i*2);const child=readU32(bytes,po+ptr);if(child)stack.push(child);}
        }else if(type===0x0d){
          for(let i=0;i<cells;i++){
            const ptr=readU16(bytes,h+8+i*2),co=po+ptr;
            const ps=readVarint(bytes,co),rid=readVarint(bytes,co+ps.bytes),payloadSize=Number(ps.value);
            const payload=readPayload(co+ps.bytes+rid.bytes,payloadSize);
            onRow(rid.value,parseRecord(payload));
          }
        }else fail('INVALID_DB','The Apple Messages database contains an unsupported SQLite page type.');
      }
    }
    const schema=new Map();
    scanTable(1,(rowid,values)=>{
      if(values[0]==='table'&&typeof values[1]==='string'&&values[3]!=null)schema.set(values[1],{name:values[1],rootPage:toNumber(values[3]),sql:typeof values[4]==='string'?values[4]:''});
    });
    function splitColumns(sql){
      const start=sql.indexOf('('),end=sql.lastIndexOf(')');if(start<0||end<=start)return [];
      const body=sql.slice(start+1,end);const parts=[];let cur='',depth=0,quote=null;
      for(let i=0;i<body.length;i++){
        const ch=body[i];
        if(quote){cur+=ch;if(ch===quote){if(body[i+1]===quote){cur+=body[++i];}else quote=null;}continue;}
        if(ch==='"'||ch==="'"||ch==='\x60'){quote=ch;cur+=ch;continue;}
        if(ch==='['){const j=body.indexOf(']',i);if(j>=0){cur+=body.slice(i,j+1);i=j;continue;}}
        if(ch==='('){depth++;cur+=ch;continue;}if(ch===')'){depth--;cur+=ch;continue;}
        if(ch===','&&depth===0){parts.push(cur.trim());cur='';}else cur+=ch;
      }
      if(cur.trim())parts.push(cur.trim());
      return parts.map(part=>{
        if(/^(CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY)\b/i.test(part))return null;
        const m=/^\s*(?:"([^"]+)"|'([^']+)'|\x60([^\x60]+)\x60|\[([^\]]+)\]|([^\s]+))/.exec(part);
        return m?(m[1]||m[2]||m[3]||m[4]||m[5]):null;
      }).filter(Boolean);
    }
    function scanNamedTable(name,onRow){
      const meta=schema.get(name);if(!meta)return false;const cols=splitColumns(meta.sql);
      scanTable(meta.rootPage,(rowid,values)=>{const row={_rowid:rowid};for(let i=0;i<cols.length;i++)row[cols[i]]=values[i]??null;onRow(row);});return true;
    }
    return {schema,scanNamedTable};
  }

  function appleDate(value){
    if(value==null)return null;let ms;
    if(typeof value==='bigint')ms=value>1000000000000n?Number(value/1000000n)+978307200000:Number(value)*1000+978307200000;
    else {const n=Number(value);ms=Math.abs(n)>1e12?n/1e6+978307200000:n*1000+978307200000;}
    const d=new Date(ms);if(!Number.isFinite(d.getTime()))return null;
    return {timestamp:d.getTime(),dateKey:`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`,timeLabel:`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,rawTimestamp:d.toISOString()};
  }
  function readTypedLength(blob,index){
    const head=blob[index++];if(head===undefined)return null;
    if(head<=0x7f)return {length:head,next:index};
    const widths={0x81:2,0x82:4,0x83:8},w=widths[head];if(!w||index+w>blob.length)return null;
    let n=0n;for(let i=0;i<w;i++)n|=BigInt(blob[index+i])<<BigInt(i*8);return {length:Number(n),next:index+w};
  }
  function decodeAttributedBody(blob){
    if(!(blob instanceof Uint8Array)||!blob.length)return '';
    const marker='NSString';
    for(let i=0;i<=blob.length-marker.length;i++){
      let ok=true;for(let j=0;j<marker.length;j++)if(blob[i+j]!==marker.charCodeAt(j)){ok=false;break;}if(!ok)continue;
      const end=Math.min(blob.length,i+marker.length+32);
      for(let p=i+marker.length;p<end;p++){
        if(blob[p]!==0x2b&&blob[p]!==0x2a)continue;
        const l=readTypedLength(blob,p+1);if(!l||l.length<0||l.length>5*1024*1024||l.next+l.length>blob.length)continue;
        const text=td8.decode(blob.subarray(l.next,l.next+l.length)).replace(/\u0000/g,'').trim();
        if(text)return text;
      }
    }
    return '';
  }
  function summarize(messages,platform,warnings){
    const participants=Array.from(new Set(messages.filter(m=>m.sender).map(m=>m.sender))),dated=messages.filter(m=>m.timestamp!==null),dates=dated.map(m=>m.dateKey).filter(Boolean).sort();
    return {messages,participants,dateOrder:'YMD',ambiguousDates:false,warnings:warnings||[],platform,stats:{messages:messages.length,userMessages:messages.filter(m=>!m.isSystem).length,systemMessages:messages.filter(m=>m.isSystem).length,photosReferenced:0,omittedMedia:0,unsupportedMedia:0,invalidDates:messages.filter(m=>m.invalidTimestamp).length,preservedLeadingLines:0,validDatedMessages:dated.length,firstDate:dates[0]||null,lastDate:dates[dates.length-1]||null,sourceLines:messages.length}};
  }
  function titleForChat(row){return String(row.display_name||row.chat_identifier||row.guid||'Apple Messages conversation');}
  function platformForChat(row){const s=String(row.service_name||row.guid||'').toLowerCase();return s.includes('sms')?'sms':'imessage';}
  async function readFiles(fileList,options){
    options=options||{};const files=Array.from(fileList||[]);const dbs=files.filter(f=>/(^|\/)(chat|sms)\.db$/i.test(String(f.name||''))||/\.db$/i.test(String(f.name||'')));
    if(dbs.length!==1)return null;const file=dbs[0];if(file.size>MAX_DB_BYTES)fail('UPLOAD_TOO_LARGE','Please choose an Apple Messages database under 300 MB.');
    const bytes=new Uint8Array(await file.arrayBuffer());let reader;try{reader=createReader(bytes);}catch(e){if(e.code==='NOT_APPLE_DB')return null;throw e;}
    for(const required of ['chat','message','chat_message_join'])if(!reader.schema.has(required))return null;
    const chats=new Map();reader.scanNamedTable('chat',row=>chats.set(String(row._rowid),row));
    const counts=new Map(),latest=new Map();reader.scanNamedTable('chat_message_join',row=>{const id=String(row.chat_id);counts.set(id,(counts.get(id)||0)+1);const mid=toNumber(row.message_id);if(mid>(latest.get(id)||0))latest.set(id,mid);});
    let choices=[...chats.entries()].filter(([id])=>(counts.get(id)||0)>0).map(([id,row])=>({id:`apple:${id}`,title:titleForChat(row),platform:platformForChat(row),messageCount:counts.get(id)||0,latest:latest.get(id)||0}));
    choices.sort((a,b)=>b.latest-a.latest);
    if(choices.length>1&&!options.conversationId)return {needsConversation:true,fileName:file.name,choices:choices.map(({latest,...c})=>c)};
    const selectedId=String((options.conversationId||choices[0]?.id||'').replace(/^apple:/,''));if(!selectedId||!chats.has(selectedId))fail('NO_CONVERSATION','No readable Apple Messages conversation was found.');
    const target=new Set();reader.scanNamedTable('chat_message_join',row=>{if(String(row.chat_id)===selectedId)target.add(String(row.message_id));});
    const handles=new Map();reader.scanNamedTable('handle',row=>handles.set(String(row._rowid),String(row.id||'Contact')));
    const messages=[];let decodedBodies=0,missingBodies=0;
    reader.scanNamedTable('message',row=>{
      if(!target.has(String(row._rowid)))return;
      if(toNumber(row.associated_message_type)!==0)return;
      const date=appleDate(row.date);let text=typeof row.text==='string'?row.text:'';
      if(!text&&row.attributedBody instanceof Uint8Array){text=decodeAttributedBody(row.attributedBody);if(text)decodedBodies++;else missingBodies++;}
      if(!text)return;
      const sender=isOne(row.is_from_me)?'You':(handles.get(String(row.handle_id))||'Contact');
      messages.push({id:`apple-${row._rowid}`,sender,text,timestamp:date?date.timestamp:null,rawTimestamp:date?date.rawTimestamp:'',dateKey:date?date.dateKey:null,timeLabel:date?date.timeLabel:'',isSystem:false,invalidTimestamp:!date,attachment:null});
    });
    messages.sort((a,b)=>(a.timestamp??Number.MAX_SAFE_INTEGER)-(b.timestamp??Number.MAX_SAFE_INTEGER));
    if(messages.length>20000)fail('TOO_MANY_MESSAGES','This conversation contains over 20,000 readable messages. Choose a smaller conversation or export a shorter range.');
    const chat=chats.get(selectedId),platform=platformForChat(chat),warnings=['Apple Messages databases are read locally in your browser. Attachments are not imported from chat.db in this version.'];
    if(missingBodies)warnings.push(`${missingBodies} message${missingBodies===1?'':'s'} stored only in an Apple rich-text body could not be decoded and were skipped.`);
    if(decodedBodies)warnings.push(`${decodedBodies} Apple rich-text message${decodedBodies===1?' was':'s were'} decoded from attributedBody.`);
    return {text:'',parsed:summarize(messages,platform,warnings),platform,conversationTitle:titleForChat(chat),fileName:file.name,chatFileName:file.name,media:new Map(),warnings};
  }
  return Object.freeze({readFiles,createReader,decodeAttributedBody,appleDate});
});