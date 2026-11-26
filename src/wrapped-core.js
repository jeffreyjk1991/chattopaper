/* Private, export-based chat statistics. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChatWrapped=api})(globalThis,function(){
'use strict';
const valid=m=>!m.isSystem&&m.sender&&Number.isFinite(m.timestamp)&&/^\d{4}-\d{2}-\d{2}$/.test(m.dateKey||'');
const rank=m=>[...m].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0])));
const add=(m,k)=>m.set(k,(m.get(k)||0)+1);
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
function emojis(s){return segmenter?[...segmenter.segment(s)].map(x=>x.segment).filter(x=>/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u.test(x)):s.match(/(?:\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}\uFE0F?\p{Emoji_Modifier}?(?:\u200D\p{Extended_Pictographic}\uFE0F?\p{Emoji_Modifier}?)*)/gu)||[]}
function years(messages){return [...new Set(messages.filter(valid).map(m=>m.dateKey.slice(0,4)))].sort().reverse()}
function analyze(messages,year){
const rows=messages.filter(m=>valid(m)&&(year==='all'||m.dateKey.slice(0,4)===String(year)));
const people=new Map(),night=new Map(),days=new Map(),hours=new Map(),emoji=new Map();let attachments=0;
for(const m of rows){add(people,m.sender);add(days,m.dateKey);const h=new Date(m.timestamp).getUTCHours();add(hours,h);if(h<5)add(night,m.sender);if(m.attachment)attachments++;for(const e of emojis(m.text||''))add(emoji,e)}
const active=[...days.keys()].sort();let streak=0,run=0,prev=null;for(const day of active){const t=Date.parse(day+'T00:00:00Z');run=prev!==null&&t-prev===86400000?run+1:1;streak=Math.max(streak,run);prev=t}
const participants=rank(people),quiet=participants.length>1?[...participants].sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0]))[0]:null;
return {total:rows.length,participants,quiet,night:rank(night)[0]||null,emoji:rank(emoji)[0]||null,day:rank(days)[0]||null,hour:rank(hours)[0]||null,activeDays:active.length,first:active[0]||null,last:active[active.length-1]||null,streak,attachments,excluded:messages.filter(m=>!valid(m)).length};
}
return {years,analyze,aliasMap:s=>new Map(s.participants.map(([name],i)=>[name,'Member '+(i+1)]))};
});
