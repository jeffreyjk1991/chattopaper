/* ChatToPaper structured chat import for Telegram and Meta JSON exports.
 * Keeps the existing WhatsApp importer isolated and untouched.
 */
(function(root,factory){
  'use strict';
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChatStructuredImport=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const BaseImport=root.ChatImport||(typeof require==='function'?require('./importer.js'):null);
  if(!BaseImport)throw new Error('ChatImport is required before the structured importer.');
  const PHOTO_EXT=/\.(jpe?g|png|webp|gif|avif)$/i;
  const PHOTO_TYPES={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',avif:'image/avif'};
  const pad=n=>String(n).padStart(2,'0');
  const basename=name=>String(name||'').replace(/\\/g,'/').split('/').pop();
  const normalize=name=>BaseImport.normalizeFilename(name);
  const photoType=name=>PHOTO_TYPES[basename(name).split('.').pop().toLowerCase()]||'application/octet-stream';

  function fail(code,message){
    const ErrorType=root.ChatImport&&BaseImport.ImportError;
    if(ErrorType)throw new ErrorType(code,message);
    const error=new Error(message);error.code=code;throw error;
  }
  function safeJson(text){
    try{return JSON.parse(String(text||'').replace(/^\ufeff/,''));}
    catch(_){fail('INVALID_JSON','This JSON export could not be read. Use the original Telegram, Instagram or Messenger export.');}
  }
  function decode(bytes){
    if(bytes.byteLength>BaseImport.LIMITS.chatBytes)fail('CHAT_TOO_LARGE','A conversation JSON file exceeds 20 MB. Export a smaller conversation or date range.');
    try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
    catch(_){fail('TEXT_ENCODING','This JSON export is not valid UTF-8. Use the original export without editing it.');}
  }
  function telegramText(value){
    if(typeof value==='string')return value;
    if(Array.isArray(value))return value.map(item=>typeof item==='string'?item:(item&&typeof item.text==='string'?item.text:'')).join('');
    return '';
  }
  function fromLocalDate(value){
    const m=/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(value||''));
    if(!m)return null;
    const [year,month,day,hour,minute,second]=m.slice(1).map(Number);
    const timestamp=Date.UTC(year,month-1,day,hour,minute,second||0);
    return {timestamp,dateKey:`${year}-${pad(month)}-${pad(day)}`,timeLabel:`${pad(hour)}:${pad(minute)}`,rawTimestamp:String(value)};
  }
  function fromEpochMs(value){
    const ms=Number(value);
    if(!Number.isFinite(ms))return null;
    const d=new Date(ms);
    if(!Number.isFinite(d.getTime()))return null;
    return {
      timestamp:d.getTime(),
      dateKey:`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`,
      timeLabel:`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
      rawTimestamp:d.toISOString()
    };
  }
  function attachment(path,label){
    if(!path)return null;
    const name=basename(path);
    return PHOTO_EXT.test(name)
      ? {name,kind:'photo',label:name,sourcePath:String(path)}
      : {name,kind:'unsupported',label:label||`Attachment: ${name}`,sourcePath:String(path)};
  }
  function makeMessage(id,sender,text,date,isSystem,att){
    return {
      id:String(id),
      sender:sender?String(sender):null,
      text:String(text||''),
      timestamp:date?date.timestamp:null,
      rawTimestamp:date?date.rawTimestamp:'',
      dateKey:date?date.dateKey:null,
      timeLabel:date?date.timeLabel:'',
      isSystem:Boolean(isSystem),
      invalidTimestamp:!date,
      attachment:att||null
    };
  }
  function summarize(messages,platform,warnings){
    if(messages.length>BaseImport.LIMITS.messages)fail('TOO_MANY_MESSAGES','This conversation contains over 20,000 messages. Export a smaller conversation or date range.');
    const participants=Array.from(new Set(messages.filter(m=>m.sender).map(m=>m.sender)));
    const dated=messages.filter(m=>m.timestamp!==null);
    const dates=dated.map(m=>m.dateKey).filter(Boolean).sort();
    const invalidDates=messages.filter(m=>m.invalidTimestamp).length;
    return {
      messages,participants,dateOrder:'YMD',ambiguousDates:false,warnings:warnings||[],platform,
      stats:{
        messages:messages.length,
        userMessages:messages.filter(m=>!m.isSystem).length,
        systemMessages:messages.filter(m=>m.isSystem).length,
        photosReferenced:messages.filter(m=>m.attachment&&m.attachment.kind==='photo').length,
        omittedMedia:0,
        unsupportedMedia:messages.filter(m=>m.attachment&&m.attachment.kind==='unsupported').length,
        invalidDates,preservedLeadingLines:0,validDatedMessages:dated.length,
        firstDate:dates[0]||null,lastDate:dates[dates.length-1]||null,sourceLines:messages.length
      }
    };
  }
  function telegramConversation(raw,id,title){
    const messages=[];
    for(const item of raw.messages||[]){
      const date=fromLocalDate(item.date)||(item.date_unixtime?fromEpochMs(Number(item.date_unixtime)*1000):null);
      const sender=item.from||item.actor||item.author||null;
      const isSystem=item.type&&item.type!=='message';
      const text=telegramText(item.text);
      const path=item.photo||item.file||item.thumbnail||null;
      messages.push(makeMessage(`tg-${id}-${item.id||messages.length+1}`,sender,text,date,isSystem,attachment(path)));
    }
    return {id:`telegram:${id}`,title:title||raw.name||'Telegram conversation',platform:'telegram',messages};
  }
  function telegramChoices(json){
    if(Array.isArray(json&&json.messages))return [telegramConversation(json,'root',json.name)];
    const list=json&&json.chats&&Array.isArray(json.chats.list)?json.chats.list:[];
    return list.filter(chat=>Array.isArray(chat.messages)).map((chat,index)=>telegramConversation(chat,chat.id||index,chat.name||`Telegram chat ${index+1}`));
  }
  function metaText(value){
    return typeof value==='string'?value:'';
  }
  function metaConversation(raw,id,title,threadPath){
    const messages=[];
    const ordered=Array.isArray(raw.messages)?raw.messages.slice().reverse():[];
    for(const item of ordered){
      const date=fromEpochMs(item.timestamp_ms);
      const sender=item.sender_name||null;
      const photos=Array.isArray(item.photos)?item.photos:[];
      const videos=Array.isArray(item.videos)?item.videos:[];
      const audio=Array.isArray(item.audio_files)?item.audio_files:[];
      const files=Array.isArray(item.files)?item.files:[];
      const primary=photos[0]?.uri||videos[0]?.uri||audio[0]?.uri||files[0]?.uri||null;
      messages.push(makeMessage(`meta-${id}-${item.timestamp_ms||messages.length+1}-0`,sender,metaText(item.content),date,false,attachment(primary)));
      for(let i=1;i<photos.length;i++){
        messages.push(makeMessage(`meta-${id}-${item.timestamp_ms||messages.length+1}-p${i}`,sender,'',date,false,attachment(photos[i].uri)));
      }
    }
    return {id:`meta:${id}`,title:title||raw.title||'Meta conversation',platform:'meta',threadPath:threadPath||raw.thread_path||'',messages};
  }
  function isMetaMessageJson(path,obj){
    return /(^|\/)messages\/(inbox|archived_threads|filtered_threads)\/.+\/message_\d+\.json$/i.test(path)
      && obj&&Array.isArray(obj.messages)&&Array.isArray(obj.participants);
  }
  function mergeMeta(parts,id,path){
    const ordered=parts.slice().sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true}));
    const first=ordered[0].json;
    const raw={title:first.title,thread_path:first.thread_path||path,messages:[],participants:first.participants||[]};
    for(const part of ordered)raw.messages.push(...(part.json.messages||[]));
    raw.messages.sort((a,b)=>Number(b.timestamp_ms||0)-Number(a.timestamp_ms||0));
    return metaConversation(raw,id,raw.title,path);
  }
  function choicesFromDirect(json){
    const telegram=telegramChoices(json);
    if(telegram.length)return telegram;
    if(json&&Array.isArray(json.messages)&&Array.isArray(json.participants))return [metaConversation(json,'direct',json.title,json.thread_path)];
    return [];
  }
  async function extractMedia(bytes,entries,selected,options){
    const warnings=[],media=new Map();
    const wanted=new Set(selected.messages.filter(m=>m.attachment&&m.attachment.kind==='photo'&&m.attachment.name).map(m=>normalize(m.attachment.name)));
    if(!wanted.size)return {media,warnings};
    const candidates=entries.filter(entry=>PHOTO_EXT.test(entry.name)&&wanted.has(normalize(entry.name)));
    let extracted=0;
    for(let i=0;i<candidates.length;i++){
      const entry=candidates[i];
      if(selected.platform==='meta'&&selected.threadPath&&!String(entry.name).startsWith(selected.threadPath+'/'))continue;
      if(entry.size>BaseImport.LIMITS.entryBytes){warnings.push(`“${basename(entry.name)}” is larger than 40 MB and was left as a placeholder.`);continue;}
      if(extracted+entry.size>BaseImport.LIMITS.expandedBytes){warnings.push('Photos exceeded the safe extraction limit; remaining media were left as placeholders.');break;}
      if(typeof options.onProgress==='function')options.onProgress({done:i+1,total:candidates.length,name:basename(entry.name)});
      const content=await BaseImport.extractZipEntry(bytes,entry);
      extracted+=content.byteLength;
      const name=basename(entry.name),key=normalize(name);
      const item={name,blob:new Blob([content],{type:photoType(name)}),type:photoType(name)};
      if(media.has(key))media.set(key,{...media.get(key),ambiguous:true});
      else media.set(key,item);
    }
    return {media,warnings};
  }

  async function readFiles(fileList,options){
    options=options||{};
    const files=Array.from(fileList||[]);
    if(!files.length)return null;
    const zipFiles=files.filter(file=>/\.zip$/i.test(file.name));
    const jsonFiles=files.filter(file=>/\.json$/i.test(file.name));
    if(!zipFiles.length&&!jsonFiles.length)return null;
    if(zipFiles.length>1||jsonFiles.length>1||(zipFiles.length&&jsonFiles.length))return null;

    let choices=[],fileName='',bytes=null,entries=[];
    if(zipFiles.length){
      const file=zipFiles[0];
      if(file.size>BaseImport.LIMITS.zipUploadBytes)fail('UPLOAD_TOO_LARGE','Please select an export ZIP under 300 MB.');
      fileName=file.name;
      bytes=new Uint8Array(await BaseImport.readFileBuffer(file));
      entries=BaseImport.inspectZip(bytes);

      const telegramEntry=entries.find(entry=>/(^|\/)result\.json$/i.test(entry.name));
      if(telegramEntry&&telegramEntry.size<=BaseImport.LIMITS.chatBytes){
        const json=safeJson(decode(await BaseImport.extractZipEntry(bytes,telegramEntry)));
        choices.push(...telegramChoices(json));
      }

      const metaEntries=entries.filter(entry=>/(^|\/)messages\/(inbox|archived_threads|filtered_threads)\/.+\/message_\d+\.json$/i.test(entry.name)&&entry.size<=BaseImport.LIMITS.chatBytes);
      if(metaEntries.length){
        const grouped=new Map();
        for(const entry of metaEntries){
          const json=safeJson(decode(await BaseImport.extractZipEntry(bytes,entry)));
          if(!isMetaMessageJson(entry.name,json))continue;
          const path=entry.name.replace(/\/message_\d+\.json$/i,'');
          if(!grouped.has(path))grouped.set(path,[]);
          grouped.get(path).push({path:entry.name,json});
        }
        for(const [path,parts] of grouped)choices.push(mergeMeta(parts,path,path));
      }
    }else{
      const file=jsonFiles[0];
      if(file.size>BaseImport.LIMITS.chatBytes)fail('CHAT_TOO_LARGE','This JSON export exceeds 20 MB. Export a smaller conversation.');
      fileName=file.name;
      const json=safeJson(decode(new Uint8Array(await BaseImport.readFileBuffer(file))));
      choices=choicesFromDirect(json);
    }
    if(!choices.length)return null;

    if(choices.length>1&&!options.conversationId){
      return {needsConversation:true,fileName,choices:choices.map(c=>({id:c.id,title:c.title,platform:c.platform,messageCount:c.messages.length}))};
    }
    const selected=choices.find(c=>c.id===options.conversationId)||choices[0];
    const extraWarnings=[];
    if(selected.platform==='meta')extraWarnings.push('Meta message exports store absolute timestamps. ChatToPaper displays those exported times in UTC so it does not guess your original device timezone.');
    const parsed=summarize(selected.messages,selected.platform,extraWarnings);
    let media=new Map(),warnings=[];
    if(bytes){
      const extracted=await extractMedia(bytes,entries,selected,options);
      media=extracted.media;warnings=extracted.warnings;
    }else{
      for(const file of files.filter(file=>PHOTO_EXT.test(file.name))){
        const key=normalize(file.name);
        media.set(key,{name:file.name,blob:file,type:photoType(file.name)});
      }
    }
    return {
      text:'',parsed,platform:selected.platform,
      conversationTitle:selected.title,
      fileName,chatFileName:selected.title+'.json',
      media,warnings
    };
  }

  return Object.freeze({readFiles,telegramChoices,choicesFromDirect});
});