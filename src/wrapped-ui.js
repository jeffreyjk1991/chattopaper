/* No chat text, names or calculated metrics are transmitted. */
(function(){
'use strict';
const $=id=>document.getElementById(id),file=$('wrap-file'),order=$('wrap-order'),year=$('wrap-year'),anon=$('wrap-anon'),style=$('wrap-style'),format=$('wrap-format'),status=$('wrap-status'),canvas=$('wrap-canvas'),download=$('wrap-download'),share=$('wrap-share'),ctx=canvas.getContext('2d');
let raw=null,parsed=null,stats=null,demo=true,blob=null,version=0,loadId=0,loading=false;
const N=n=>Number(n).toLocaleString('en-US'),logo=new Image();logo.src='/favicon.png';
const example={total:48291,participants:[['Alex',18351],['Sam',15000],['Jordan',12000],['Chris',2940]],quiet:['Chris',2940],night:['Sam',812],emoji:['💀',2481],day:['2026-07-18',610],hour:[21,3900],activeDays:301,streak:48,attachments:690,first:'2026-01-01',last:'2026-11-25',excluded:0};
const setStatus=s=>status.textContent=s;
const steps=Array.from(document.querySelectorAll('.steps .step'));
const setStep=i=>steps.forEach((step,n)=>{step.classList.toggle('current',n===i);if(n===i)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current')});
const fileName=$('wrap-file-name');
setStep(0);
function track(name){try{window.va?.('event',{name})}catch(_){}}
function text(s,x,y,size,color,max,weight=700){
ctx.fillStyle=color;const font=()=>ctx.font=weight+' '+size+'px system-ui, -apple-system, Arial, sans-serif';font();let t=String(s);
while(max&&size>26&&ctx.measureText(t).width>max){size-=2;font()}
if(max&&ctx.measureText(t).width>max){const a=Array.from(t);while(a.length&&ctx.measureText(a.join('')+'…').width>max)a.pop();t=a.join('')+'…'}ctx.fillText(t,x,y);
}
function round(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill()}
function render(){
const s=demo?example:stats;if(!s?.total)return;
const aliases=ChatWrapped.aliasMap(s),name=x=>demo||!anon.checked?x:aliases.get(x)||'Member';
const period=demo?'2026':year.value==='all'?'ALL TIME':year.value,h=format.value==='story'?1920:1350,offset=h===1920?240:0;
canvas.width=1080;canvas.height=h;
const bg=ctx.createLinearGradient(0,0,1080,h);bg.addColorStop(0,'#19152c');bg.addColorStop(.52,'#271b43');bg.addColorStop(1,'#101c30');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,h);
ctx.globalAlpha=.13;ctx.fillStyle='#bcf96b';ctx.beginPath();ctx.arc(1020,50,230,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a78bfa';ctx.beginPath();ctx.arc(10,h-30,230,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
const fg='#f8f7ff',muted='#cfbff3',green='#c8fb71',x=64,top=offset;
text((demo?'SAMPLE · ':'')+period+' CHAT WRAPPED',x,100+top,32,muted,950,650);
text(style.value==='leaderboard'?'The group chat hall of fame':style.value==='activity'?'When the chat came alive':'Your chat had a year.',x,184+top,60,fg,950);
function tile(label,value,detail,tx,ty){round(tx,ty,460,212,28,'#392b54');text(label,tx+28,ty+49,28,muted,404,600);text(value,tx+28,ty+119,53,fg,404);text(detail,tx+28,ty+171,28,muted,404,500)}
if(style.value==='leaderboard'){
text(N(s.total)+' messages',x,272+top,55,green,950);text('Most active members in this export',x,323+top,30,muted,950,500);
s.participants.slice(0,5).forEach(([who,n],i)=>{const yy=365+top+i*128;round(x,yy,952,110,25,'#392b54');text('#'+(i+1),x+25,yy+58,33,green,70);text(name(who),x+112,yy+48,37,fg,570);round(x+112,yy+70,560,14,7,'#201b35');round(x+112,yy+70,Math.max(12,560*n/s.participants[0][1]),14,7,green);text(N(n),x+700,yy+56,32,fg,220)});
}else if(style.value==='activity'){
text(N(s.activeDays),x,295+top,99,green,950);text('days with at least one message',x,350+top,35,fg,950,500);
tile('Busiest day',s.day?.[0]||'—',s.day?N(s.day[1])+' messages':'No data',x,410+top);
tile('Longest streak',N(s.streak)+' days','Consecutive active days',556,410+top);
tile('Peak hour',s.hour?String(s.hour[0]).padStart(2,'0')+':00':'—',s.hour?N(s.hour[1])+' messages':'No data',x,642+top);
tile('Media references',N(s.attachments),'Attachments or omitted media',556,642+top);
}else{
text(N(s.total),x,305+top,108,green,950);text('messages in this export',x,360+top,35,fg,950,500);
const lead=s.participants[0];
tile('Biggest yapper',name(lead[0]),Math.round(lead[1]/s.total*100)+'% of messages',x,416+top);
tile('The quiet one',s.quiet?name(s.quiet[0]):'—',s.quiet?N(s.quiet[1])+' messages':'Only one sender',556,416+top);
tile('Night owl',s.night?name(s.night[0]):'—',s.night?N(s.night[1])+' texts · 00:00–04:59':'No late-night texts',x,650+top);
tile('Top emoji',s.emoji?s.emoji[0]:'—',s.emoji?N(s.emoji[1])+' uses':'No emoji in export',556,650+top);
}
text(N(s.participants.length)+' members · '+s.first+' to '+s.last,x,h-195,28,muted,950,500);ctx.fillStyle='#69577e';ctx.fillRect(x,h-170,952,2);
if(logo.complete&&logo.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(x+31,h-106,31,0,Math.PI*2);ctx.clip();ctx.drawImage(logo,x,h-137,62,62);ctx.restore()}
text('ChatToPaper',x+78,h-107,39,fg,875);text('Make yours free at chattopaper.com/whatsapp-wrapped/',x+78,h-68,28,green,865,600);
const token=++version;blob=null;download.disabled=share.disabled=true;canvas.toBlob(b=>{if(token!==version)return;if(b){blob=b;download.disabled=share.disabled=false}else setStatus('Image creation failed. Try another browser.')},'image/png');
}
function clear(){version++;blob=null;download.disabled=share.disabled=true;canvas.width=1080;canvas.height=1350;ctx.fillStyle='#19152c';ctx.fillRect(0,0,1080,1350);text('Choose an export to begin',60,130,48,'#fff',950)}
function show(){if(!parsed)return;stats=ChatWrapped.analyze(parsed.messages,year.value);demo=false;if(!stats.total){clear();$('wrap-result').textContent='No messages for this period';setStatus('Choose another year or check date order.');return}
$('wrap-result').textContent=N(stats.total)+' messages · '+stats.participants.length+' members · '+stats.first+' to '+stats.last;
if(parsed.ambiguousDates)$('wrap-advanced').open=true;setStep(1);
setStatus((parsed.ambiguousDates?'Date order ambiguous: confirm month/day or day/month. ':'')+(stats.excluded?N(stats.excluded)+' system or undated entries excluded. ':'')+'Ready. Review names before sharing. Results cover the export only.');render()}
function parse(){if(!raw)return;try{parsed=ChatImport.parse(raw,{dateOrder:order.value});const ys=ChatWrapped.years(parsed.messages);if(!ys.length)throw Error('No dated participant messages. Check the export and date order.');const previous=year.value;year.replaceChildren();for(const v of [...ys,'all'])year.append(new Option(v==='all'?'All time':v,v));const current=String(new Date().getFullYear());year.value=ys.includes(previous)||previous==='all'?previous:ys.includes(current)?current:ys[0];year.disabled=false;show()}catch(e){parsed=null;stats=null;year.disabled=true;clear();$('wrap-result').textContent='No report generated.';setStatus(e.message||'This chat could not be parsed.')}}
file.addEventListener('change',async()=>{if(!file.files.length)return;fileName.textContent=file.files[0].name;setStep(0);const id=++loadId;loading=true;raw=null;parsed=null;stats=null;demo=false;year.disabled=true;clear();$('wrap-result').textContent='Reading export…';setStatus('Reading your chat locally…');try{const source=await ChatImport.readFiles([file.files[0]]);if(id!==loadId)return;raw=source.text;loading=false;parse();if(stats?.total)track('wrapped_generated')}catch(e){if(id!==loadId)return;loading=false;setStatus(e.message||'Could not read the export.');$('wrap-result').textContent='No report generated.'}});
order.addEventListener('change',()=>{if(!loading)parse()});year.addEventListener('change',show);for(const c of [anon,style,format])c.addEventListener('change',render);
$('wrap-sample').addEventListener('click',()=>{loadId++;loading=false;raw=null;parsed=null;stats=null;file.value='';fileName.textContent='';setStep(0);demo=true;year.disabled=true;year.replaceChildren(new Option('2026','2026'));$('wrap-result').textContent='Illustrative sample · not actual chat data';setStatus('Sample only. Choose your export for real statistics.');render()});
function save(b){const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=(demo?'sample-':'')+'chattopaper-wrapped-'+(demo?'2026':year.value)+'-'+style.value+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
download.addEventListener('click',()=>{if(blob){save(blob);if(!demo){setStep(2);track('wrapped_downloaded')}}});
share.addEventListener('click',async()=>{if(!blob)return;const image=blob;try{const f=new File([image],'chattopaper-wrapped.png',{type:'image/png'});if(navigator.canShare?.({files:[f]})){await navigator.share({files:[f],title:'My Chat Wrapped by ChatToPaper'});if(!demo){setStep(2);track('wrapped_shared')}}else{save(image);if(!demo){setStep(2);track('wrapped_downloaded')}setStatus('Image downloaded. Share it in WhatsApp, Instagram or any app.')}}catch(e){if(e.name!=='AbortError'){save(image);setStatus('Native sharing unavailable. Image downloaded instead.')}}});
logo.addEventListener('load',()=>{if(demo||stats?.total)render()});render();
})();
