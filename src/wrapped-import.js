/* Dispatch supported exports without changing the PDF converter. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WrappedImport=api})(globalThis,function(){
'use strict';
async function readFiles(files,options={},deps=globalThis){
 const list=Array.from(files||[]);if(list.length!==1)throw Error('Choose one chat export file: TXT, ZIP, JSON, DB or XML.');
 const name=String(list[0].name||'');
 if(!/\.(txt|zip|json|db|xml)$/i.test(name))throw Error('Unsupported file. Choose a TXT, ZIP, JSON, chat.db, sms.db or SMS XML export.');
 const readers=[deps.ChatAppleMessages,deps.ChatSmsImport,deps.ChatStructuredImport];
 for(const reader of readers){if(!reader)throw Error('A chat importer is unavailable. Refresh the page and try again.');const result=await reader.readFiles(list,options);if(result){if(result.platform==='meta'&&result.parsed){result.parsed={...result.parsed,messages:result.parsed.messages.filter(m=>!/-p\d+$/.test(m.id))}}if(result.parsed?.messages?.length>200000)throw Error('This conversation contains over 200,000 readable messages. Choose a smaller conversation.');return result}}
 if(/\.(txt|zip)$/i.test(name)){const result=await deps.ChatImport.readFiles(list,options);return {...result,platform:'whatsapp'}}
 throw Error('No supported chat was found. Use Telegram JSON, Instagram or Messenger message JSON, Apple Messages chat.db or sms.db, SMS Backup & Restore XML, or WhatsApp TXT/ZIP.');
}
function label(platform,hint){if(platform==='meta')return hint==='instagram'?'Instagram':hint==='messenger'?'Messenger':'Instagram / Messenger';return ({whatsapp:'WhatsApp',telegram:'Telegram',imessage:'iMessage',sms:'SMS'})[platform]||'Chat'}
function clock(platform){return ['meta','imessage','sms'].includes(platform)?'UTC':'export time'}
return {readFiles,label,clock};
});
