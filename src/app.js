/* ChattoPaper application. Chat files stay in memory; localStorage is used only for short-lived payment handoff metadata. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = {
    source: null, parsed: null, linked: null, messages: [], mediaURLs: new Map(),
    active: false, sample: true, doc: null, page: 0, revision: 0, importRevision: 0,
    dirty: false, importing: false, rendering: false, exporting: false,
    dateConfirmed: true, timer: null, toastTimer: null, downloadURL: null,
    previewRevision: 0, sampleSource: null, uiWarnings: [], paymentUnlocked: false, paymentRef: null, paymentSessionId: null, downloadName: null
  };
  const formatNumber = n => new Intl.NumberFormat('en').format(n || 0);
  const stripePaymentLink = window.CHATTOPAPER_STRIPE_PAYMENT_LINK || '';
  const stripeTestMode = Boolean(window.CHATTOPAPER_STRIPE_TEST_MODE);
  const PAYMENT_PENDING_KEY = 'chattopaper.payment.pending.v2';
  const PAYMENT_SUCCESS_KEY = 'chattopaper.payment.success.v2';
  const PAYMENT_CHANNEL = 'chattopaper-payments-v2';
  const shortDate = key => key ? new Intl.DateTimeFormat('en', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(key+'T12:00:00Z')) : 'Unknown date';
  const icon = name => { const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('class','icon'); const use=document.createElementNS('http://www.w3.org/2000/svg','use'); use.setAttribute('href','#i-'+name);svg.append(use);return svg; };
  const txt = (tag, value, className) => {const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;};
  function track(name, data={}) { try { if(typeof window.va==='function') window.va('event', {name, data}); } catch(_){} }
  function toast(message, error=false) {
    clearTimeout(state.toastTimer);$('toast').textContent=message;$('toast').classList.toggle('error',error);$('toast').hidden=false;
    state.toastTimer=setTimeout(()=>{$('toast').hidden=true;},5000);
  }
  function setError(message) { $('import-error').textContent=message||'';$('import-error').hidden=!message; }
  function releaseURL(url) {
    if(typeof url==='string'&&url.startsWith('blob:')){
      try{URL.revokeObjectURL(url);}catch(_){/* Some embedded browsers do not expose Blob URL methods. */}
    }
  }
  function releaseMediaURLs(urls) {for(const url of urls.values())releaseURL(url);urls.clear();}
  function revokeMedia() {
    releaseMediaURLs(state.mediaURLs);
    if(state.downloadURL){releaseURL(state.downloadURL);state.downloadURL=null;}
    state.downloadName=null;
    $('download-ready-link').hidden=true;$('download-ready-link').removeAttribute('href');
  }
  function blobAsDataURL(blob) {
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result));
      reader.onerror=()=>reject(new Error('This browser could not read the selected file. Choose it again from your device.'));
      reader.onabort=()=>reject(new Error('Reading the selected file was interrupted. Please choose it again.'));
      reader.readAsDataURL(blob);
    });
  }
  async function localBlobURL(blob) {
    try{if(typeof URL.createObjectURL==='function')return URL.createObjectURL(blob);}catch(_){/* Use FileReader in restricted webviews. */}
    return blobAsDataURL(blob);
  }
  function clearPaymentHandoff() {
    state.paymentUnlocked=false;state.paymentRef=null;state.paymentSessionId=null;
    try{localStorage.removeItem(PAYMENT_PENDING_KEY);localStorage.removeItem(PAYMENT_SUCCESS_KEY);}catch(_){}
  }
  function readStoredPaymentSuccess() {
    try {
      const raw=localStorage.getItem(PAYMENT_SUCCESS_KEY);
      if(!raw)return null;
      const value=JSON.parse(raw);
      if(!value||Date.now()-Number(value.ts||0)>15*60*1000)return null;
      return value;
    } catch(_){ return null; }
  }
  function updatePickerState() {
    for(const id of ['file-input','replace-file-input'])$(id).disabled=state.importing;
    $('dropzone').setAttribute('aria-busy',String(state.importing));
  }
  function disposeDoc() {if(state.doc)ChatDocument.dispose(state.doc);state.doc=null;}
  function dataImageBlob(url) {
    const parts=url.split(','),binary=atob(parts[1]),bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return new Blob([bytes],{type:'image/jpeg'});
  }
  function makeSampleSource() {
    const text = [
      '[14/06/2026, 9:40:00 AM] Messages and calls are end-to-end encrypted.',
      '[14/06/2026, 9:41:00 AM] Emma: We should go back here someday.',
      '[14/06/2026, 9:42:00 AM] Emma: <attached: 00000003-PHOTO-2026-06-14-09-42-00.jpg>',
      'The little town by the sea. My favorite place with my favorite person.',
      '[14/06/2026, 9:43:00 AM] Alex: Same place. Same person. Always. ♡',
      '[14/06/2026, 9:44:00 AM] Emma: And the same tiny café with the very good coffee.',
      '[14/06/2026, 9:45:00 AM] Alex: I remember. You ordered in Italian and I just pointed at a pastry.',
      '[14/06/2026, 9:46:00 AM] Emma: A very convincing point, though.',
      '[15/06/2026, 7:12:00 PM] Alex: Things for our next little adventure:\n1. Take the slow train\n2. Stay for sunset\n3. Remember to take a photo together',
      '[15/06/2026, 7:14:00 PM] Emma: 4. No rushing anywhere.',
      '[15/06/2026, 7:15:00 PM] Alex: That is the most important one.',
      '[16/06/2026, 8:01:00 AM] Emma: Made it home. Already miss the sea.',
      '[16/06/2026, 8:03:00 AM] Alex: We’ll make more memories. I promise.',
      '[16/06/2026, 8:04:00 AM] Emma: Keeping this conversation forever. ♡'
    ].join('\n');
    const name='00000003-PHOTO-2026-06-14-09-42-00.jpg';
    return {text,fileName:'Emma & Alex · sample chat',chatFileName:'Emma & Alex.txt',media:new Map([[name,{name,blob:dataImageBlob(window.CHATTOPAPER_SAMPLE_IMAGE),type:'image/jpeg',previewURL:window.CHATTOPAPER_SAMPLE_IMAGE}]]),warnings:[]};
  }
  function prepareSource(source, dateOrder) {
    const parsed=ChatImport.parse(source.text,{dateOrder});
    const linked=ChatImport.linkMedia(parsed.messages,source.media);
    return {parsed,linked};
  }
  async function prepareMedia(linked) {
    const urls=new Map(),messages=[];
    try{
      for(const message of linked.messages){
        if(!message.attachment?.media){messages.push(message);continue;}
        const attachment={...message.attachment},key=ChatImport.normalizeFilename(attachment.name);
        if(!urls.has(key)){
          const supplied=attachment.media.previewURL;
          // Some mobile file providers omit or generalize the File MIME type.
          // The importer has already identified a supported photo extension.
          const mediaBlob=attachment.media.blob.type===attachment.media.type?attachment.media.blob:attachment.media.blob.slice(0,attachment.media.blob.size,attachment.media.type);
          const url=typeof supplied==='string'&&/^data:image\/(?:jpeg|png|webp|gif|avif);base64,/i.test(supplied)?supplied:await localBlobURL(mediaBlob);
          urls.set(key,url);
        }
        attachment.url=urls.get(key);messages.push({...message,attachment});
      }
      return {urls,messages};
    }catch(error){releaseMediaURLs(urls);throw error;}
  }
  function assignExistingMedia(linked) {
    return linked.messages.map(message=>message.attachment?.media?{...message,attachment:{...message.attachment,url:state.mediaURLs.get(ChatImport.normalizeFilename(message.attachment.name))}}:message);
  }
  function resetSettings() {
    $('date-order').value='auto';$('include-photos').checked=true;$('show-timestamps').checked=true;$('include-system').checked=false;
    $('paper-size').value='a4';$('text-size').value='1';
    document.querySelector('input[name="layout"][value="bubbles"]').checked=true;
  }
  function updateDates(reset) {
    const stats=state.parsed?.stats;
    const first=stats?.firstDate||'',last=stats?.lastDate||'';
    for(const id of ['date-from','date-to']) {
      $(id).min=first;$(id).max=last;$(id).disabled=!state.active||!first;
    }
    if(reset){$('date-from').value=state.active?first:'';$('date-to').value=state.active?last:'';}
    $('date-description').textContent=state.active&&first ? `${shortDate(first)} – ${shortDate(last)} · dates are inclusive` : 'Your chat’s date range will appear here.';
    $('date-order-field').hidden=!state.active||state.sample;
    $('date-order-description').textContent=`Interpreted as ${state.parsed?.dateOrder==='DMY'?'day / month / year':'month / day / year'}. Original clock times are kept.`;
  }
  function updateParticipants() {
    const select=$('primary-sender');select.replaceChildren();
    const people=state.parsed?.participants||[];
    for(const name of people){const opt=document.createElement('option');opt.value=name;opt.textContent=name;select.append(opt);}
    if(!people.length){const opt=txt('option','No named senders');opt.value='';select.append(opt);}
    select.value=people[1]||people[0]||'';
  }
  async function setSource(source, {sample=false,active=true,token=state.importRevision}={}) {
    const prepared=prepareSource(source,'auto');
    const media=await prepareMedia(prepared.linked);
    if(token!==state.importRevision){releaseMediaURLs(media.urls);return false;}
    clearTimeout(state.timer);state.revision++;disposeDoc();revokeMedia();resetSettings();
    if(active&&!sample)clearPaymentHandoff();
    state.source=source;state.parsed=prepared.parsed;state.linked=prepared.linked;
    state.mediaURLs=media.urls;state.messages=media.messages;state.active=active;state.sample=sample;state.page=0;
    state.dateConfirmed=!prepared.parsed.ambiguousDates;state.uiWarnings=[];
    const fileTitle=(source.chatFileName||source.fileName).replace(/\.(txt|zip)$/i,'').replace(/^WhatsApp Chat (?:with |[-–] )/i,'');
    $('document-title').value=sample?'Our little adventures':(/^_?chat$/i.test(fileTitle)?prepared.parsed.participants.slice(0,3).join(' & '):fileTitle).slice(0,100)||'A conversation worth keeping';
    $('dropzone').hidden=active;$('imported-file').hidden=!active;
    $('file-name').textContent=source.fileName;$('file-name').title=source.fileName;
    $('file-meta').textContent=`${formatNumber(prepared.parsed.stats.userMessages)} messages · ${formatNumber(prepared.linked.matchedPhotos)} ${prepared.linked.matchedPhotos===1?'photo':'photos'} matched`;
    document.querySelectorAll('.sample-prompt').forEach(el=>{el.hidden=active&&sample;});
    $('step-customize').classList.toggle('current',active);$('step-download').classList.remove('current');
    $('preview-tag').textContent=sample?'Sample':'Your chat';
    $('import-status').textContent=active?(sample?'Sample loaded. Make it yours, then try a download.':'Your conversation was read locally. Check the preview and dates below.') : '';
    updateParticipants();updateDates(true);setError('');renderWarnings();scheduleRender(0);return true;
  }
  async function importFiles(files) {
    if(!files.length)return;
    const token=++state.importRevision;state.importing=true;updatePickerState();updateDownloadEnabled();setError('');
    $('import-status').textContent='Reading your export on this device…';
    try {
      const source=await ChatImport.readFiles(files,{onProgress:({done,total})=>{
        if(token===state.importRevision)$('import-status').textContent=`Reading photos locally: ${done} of ${total}…`;
      }});
      if(token!==state.importRevision)return;
      const committed=await setSource(source,{active:true,sample:false,token});
      if(committed){track('chat_imported');toast('Your conversation is ready to preview.');}
    } catch(error) {
      if(token===state.importRevision){setError(error.message||'This export could not be read. Please try the original WhatsApp export.');$('import-status').textContent='';}
    } finally {
      if(token===state.importRevision){state.importing=false;updatePickerState();updateDownloadEnabled();}
    }
  }
  async function useSample(scroll=true) {
    const token=++state.importRevision;state.importing=false;updatePickerState();
    try{
      if(!state.sampleSource)state.sampleSource=makeSampleSource();
      const committed=await setSource(state.sampleSource,{sample:true,active:true,token});
      if(committed&&scroll)$('converter').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    }catch(error){setError('The sample could not be opened. You can still choose your own conversation. '+error.message);}
  }
  async function clearConversation() {
    const token=++state.importRevision;state.importing=false;$('file-input').value='';$('replace-file-input').value='';updatePickerState();
    // Clear private data immediately, independently of the optional sample.
    clearTimeout(state.timer);state.revision++;disposeDoc();revokeMedia();clearPaymentHandoff();state.source=null;state.parsed=null;state.linked=null;state.messages=[];state.active=false;state.uiWarnings=[];state.dateConfirmed=true;state.page=0;state.rendering=false;state.dirty=false;
    resetSettings();$('document-title').value='';$('file-name').textContent='';$('file-name').removeAttribute('title');$('file-meta').textContent='';updateDates(true);updateParticipants();renderWarnings();setError('');
    $('preview-transcript').textContent='';$('preview-canvas').width=1;$('preview-canvas').height=1;$('preview-loading').hidden=true;
    $('step-customize').classList.remove('current');$('step-download').classList.remove('current');$('preview-tag').textContent='No chat';
    document.querySelectorAll('.sample-prompt').forEach(el=>{el.hidden=false;});
    emptyPreview('Ready for your conversation.','Choose a ZIP or TXT with photos to get started.');
    $('dropzone').hidden=false;$('imported-file').hidden=true;$('import-status').textContent='Your conversation has been cleared.';updateDownloadEnabled();
    try{if(!state.sampleSource)state.sampleSource=makeSampleSource();}catch(_){}
    emptyPreview('Your preview appears here.','Upload a WhatsApp export or try a sample.');
    if(token===state.importRevision){toast('Your conversation has been cleared.');$('file-input').focus({preventScroll:true});}
  }
  function reparseDateOrder() {
    if(!state.source)return;
    try {
      const prepared=prepareSource(state.source,$('date-order').value);
      state.parsed=prepared.parsed;state.linked=prepared.linked;state.messages=assignExistingMedia(prepared.linked);
      state.dateConfirmed=!prepared.parsed.ambiguousDates;updateDates(true);setError('');scheduleRender(0);
    }catch(error){setError(error.message);}
  }
  function getOptions() {
    return {title:$('document-title').value.trim()||'A conversation worth keeping',style:document.querySelector('input[name="layout"]:checked').value,
      paper:$('paper-size').value,includePhotos:$('include-photos').checked,showTimestamps:$('show-timestamps').checked,
      includeSystem:$('include-system').checked,primarySender:$('primary-sender').value,fontScale:Number($('text-size').value),maxPages:300};
  }
  function selectedMessages() {
    const from=$('date-from').value,to=$('date-to').value;
    if(from&&to&&from>to)throw new Error('The start date is after the end date. Choose a valid date range.');
    return state.messages.filter(m=>!m.dateKey||((!from||m.dateKey>=from)&&(!to||m.dateKey<=to)));
  }
  function allWarnings() {
    const base=[...(state.source?.warnings||[]).map(w=>'In the original export: '+w),...(state.parsed?.warnings||[]),...(state.doc?.warnings||[]),...state.uiWarnings];
    const stats=state.doc?.stats;
    if(stats?.missingPhotoCount)base.push(`${stats.missingPhotoCount} ${stats.missingPhotoCount===1?'photo in this PDF is':'photos in this PDF are'} missing or unreadable. Labeled placeholders keep their positions.`);
    if(stats?.unsupportedMediaCount)base.push(`${stats.unsupportedMediaCount} unsupported ${stats.unsupportedMediaCount===1?'attachment in this PDF is':'attachments in this PDF are'} shown as filename placeholders.`);
    if(stats?.omittedMediaCount)base.push(`${stats.omittedMediaCount} media ${stats.omittedMediaCount===1?'item in this selection was':'items in this selection were'} omitted by WhatsApp. Placeholders keep their positions.`);
    if(state.active&&!state.sample&&state.parsed?.stats.systemMessages&&!$('include-system').checked){
      const hidden=state.messages.filter(m=>m.isSystem&&!m.invalidTimestamp).length;
      if(hidden)base.push(`${hidden} WhatsApp system ${hidden===1?'notice in the original export is':'notices in the original export are'} hidden. Include them under Finishing touches if needed.`);
    }
    return [...new Set(base)];
  }
  function renderWarnings() {
    const box=$('import-warnings');box.replaceChildren();const warnings=allWarnings();
    if(state.active&&warnings.length){const ul=document.createElement('ul');warnings.forEach(w=>ul.append(txt('li',w)));box.append(ul);}
    if(state.active&&state.parsed?.ambiguousDates){
      const label=document.createElement('label');label.className='date-confirm';
      const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=state.dateConfirmed;checkbox.id='confirm-dates';
      checkbox.addEventListener('change',()=>{state.dateConfirmed=checkbox.checked;updateDownloadEnabled();});
      label.append(checkbox,txt('span','I checked the preview and confirm this date order.'));box.append(label);
    }
    box.hidden=!state.active||!box.childNodes.length;
  }
  function updateDownloadEnabled() {
    const button=$('download-open');button.disabled=!state.active||!state.doc||state.rendering||state.dirty||state.importing||state.exporting;
    button.replaceChildren(document.createTextNode(state.active&&!state.dateConfirmed?'Confirm dates':'Pay & download PDF'),icon('arrow'));
    $('expand-preview').disabled=!state.doc||state.rendering||state.dirty;
  }
  function scheduleRender(delay=160) {
    setError('');
    state.dirty=true;state.revision++;clearTimeout(state.timer);updateDownloadEnabled();
    state.timer=setTimeout(renderDocument,delay);
  }
  function emptyPreview(title,detail) {
    disposeDoc();$('preview-canvas').hidden=true;$('empty-preview').hidden=false;
    $('empty-preview').querySelector('h3').textContent=title;$('empty-preview').querySelector('p').textContent=detail;
    $('message-count').textContent='0';$('photo-count').textContent='0';$('page-count').textContent='0';
    $('page-counter').textContent='No pages';$('prev-page').disabled=true;$('next-page').disabled=true;
    $('preview-note').textContent='Adjust your settings to continue.';
  }
  async function renderDocument() {
    const revision=state.revision;state.dirty=false;state.rendering=true;state.uiWarnings=[];
    $('preview-loading').hidden=false;updateDownloadEnabled();
    let doc;
    try {
      const selected=selectedMessages();const options=getOptions();
      const displayed=selected.filter(m=>options.includeSystem||!m.isSystem||m.invalidTimestamp);
      if(!displayed.length){emptyPreview('No messages in this range','Choose different dates or include system notices.');return;}
      const undated=selected.filter(m=>!m.dateKey).length;
      if(undated)state.uiWarnings.push(`${undated} undated ${undated===1?'entry is':'entries are'} kept in the document because a date filter cannot safely place them.`);
      doc=await ChatDocument.createDocument(selected,options);
      if(revision!==state.revision){ChatDocument.dispose(doc);return;}
      disposeDoc();state.doc=doc;state.page=Math.min(state.page,doc.pages.length-1);
      $('empty-preview').hidden=true;$('preview-canvas').hidden=false;
      $('preview-canvas').style.aspectRatio=`${doc.width} / ${doc.height}`;
      $('message-count').textContent=formatNumber(doc.stats.messageCount);$('photo-count').textContent=formatNumber(doc.stats.photoCount);$('page-count').textContent=formatNumber(doc.pages.length);
      await renderCurrentPage();
    }catch(error){
      if(revision===state.revision){emptyPreview('Let’s adjust a little.',error.message||'This preview could not be built.');setError(error.message||'Please try a smaller date range.');}
      if(doc&&doc!==state.doc)ChatDocument.dispose(doc);
    }finally{
      if(revision===state.revision){state.rendering=false;$('preview-loading').hidden=true;renderWarnings();updateDownloadEnabled();}
    }
  }
  async function renderCurrentPage() {
    const doc=state.doc;if(!doc)return;
    const page=state.page,revision=++state.previewRevision;
    // Render off-screen first so a slower previous page cannot overwrite the current one.
    const buffer=document.createElement('canvas');
    await ChatDocument.renderPage(doc,page,buffer,{scale:1.7});
    if(revision!==state.previewRevision||doc!==state.doc){buffer.width=buffer.height=1;return;}
    const canvas=$('preview-canvas');canvas.width=buffer.width;canvas.height=buffer.height;canvas.getContext('2d').drawImage(buffer,0,0);buffer.width=buffer.height=1;
    canvas.setAttribute('aria-label',`Page ${page+1} of ${doc.pages.length}: ${doc.options.title}. ${doc.stats.messageCount} messages and ${doc.stats.photoCount} photos in the document.`);
    const pageText=`Page ${page+1} of ${doc.pages.length}`;$('page-counter').textContent=pageText;$('large-page-counter').textContent=pageText;
    for(const id of ['prev-page','large-prev'])$(id).disabled=page<=0;
    for(const id of ['next-page','large-next'])$(id).disabled=page>=doc.pages.length-1;
    $('preview-note').textContent=state.sample?'Sample chat · made for a little exploring.':'Exactly how your PDF will look.';
    $('preview-transcript').textContent=doc.pages[page].commands.filter(command=>command.type==='text').map(command=>command.text).join('\n');
    if($('large-preview-dialog').open)await renderLargePage();
  }
  async function renderLargePage() {
    if(!state.doc)return;
    const canvas=$('large-canvas');await ChatDocument.renderPage(state.doc,state.page,canvas,{scale:2});
    canvas.setAttribute('aria-label',`Enlarged page ${state.page+1} of ${state.doc.pages.length}: ${state.doc.options.title}`);
  }
  async function movePage(delta) {
    if(!state.doc||state.rendering)return;
    state.page=Math.max(0,Math.min(state.doc.pages.length-1,state.page+delta));
    try{await renderCurrentPage();}catch(error){toast(error.message,true);}
  }
  function openDialog(id) {
    const dialog=$(id);if(!dialog.open)dialog.showModal();
  }
  function openDownload() {
    if(!state.doc||state.dirty||state.rendering||!state.active)return;
    if(!state.dateConfirmed){$('import-warnings').scrollIntoView({behavior:'smooth',block:'center'});$('confirm-dates')?.focus({preventScroll:true});toast('Choose the date order or confirm the dates in your preview.');return;}
    $('download-title').textContent=state.doc.options.title;
    $('download-summary').replaceChildren();
    for(const [value,label] of [[state.doc.stats.messageCount,'messages'],[state.doc.stats.photoCount,'photos'],[state.doc.pages.length,'pages']]){
      const span=document.createElement('span');span.append(txt('strong',formatNumber(value)),document.createTextNode(label));$('download-summary').append(span);
    }
    const warnings=allWarnings();const box=$('download-alerts');box.replaceChildren();
    if(warnings.length){const ul=document.createElement('ul');warnings.forEach(w=>ul.append(txt('li',w)));box.append(ul);}
    box.hidden=!warnings.length;
    $('download-status').textContent=state.paymentUnlocked?'Payment confirmed for this browser session. Your PDF is ready to create.':(stripeTestMode?'Stripe test mode: complete checkout in the new tab, then return here.':'Pay securely with Stripe to unlock this PDF.');
    $('download-ready-link').hidden=true;
    $('download-progress').hidden=true;$('download-confirm').disabled=false;
    $('download-confirm').replaceChildren(document.createTextNode(state.paymentUnlocked?'Download PDF':(stripeTestMode?'Test pay 99¢ with Stripe':'Pay 99¢ with Stripe')),icon(state.paymentUnlocked?'download':'arrow'));
    $('step-download').classList.add('current');openDialog('download-dialog');
  }
  function beginStripePayment() {
    if(!stripePaymentLink){toast('Stripe checkout is not configured yet.',true);return;}
    if(!state.paymentRef){
      try{state.paymentRef=crypto.randomUUID().replace(/-/g,'');}
      catch(_){state.paymentRef=String(Date.now())+Math.random().toString(36).slice(2);}
    }
    try{localStorage.setItem(PAYMENT_PENDING_KEY,JSON.stringify({paymentRef:state.paymentRef,ts:Date.now()}));localStorage.removeItem(PAYMENT_SUCCESS_KEY);}catch(_){}
    const joiner=stripePaymentLink.includes('?')?'&':'?';
    const url=stripePaymentLink+joiner+'client_reference_id='+encodeURIComponent(state.paymentRef);
    track('stripe_checkout_opened',{mode:stripeTestMode?'test':'live'});
    const anchor=document.createElement('a');anchor.href=url;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.hidden=true;
    document.body.append(anchor);anchor.click();anchor.remove();
    $('download-status').textContent='Stripe Checkout opened in a new tab. After payment, this tab will prepare your PDF automatically.';
  }
  function validStripeSession(sessionId) { return /^cs_(?:test|live)_[A-Za-z0-9_]+$/.test(String(sessionId||'')); }
  function paymentMatchesCurrentChat(paymentRef) {
    if(!state.paymentRef||!paymentRef)return true;
    return String(paymentRef)===String(state.paymentRef);
  }
  async function unlockPayment(sessionId,paymentRef) {
    if(!validStripeSession(sessionId)||!paymentMatchesCurrentChat(paymentRef))return;
    if(state.paymentUnlocked&&state.paymentSessionId===sessionId)return;
    state.paymentUnlocked=true;state.paymentSessionId=sessionId;
    try{localStorage.removeItem(PAYMENT_PENDING_KEY);localStorage.removeItem(PAYMENT_SUCCESS_KEY);}catch(_){}
    if(!$('download-dialog').open)openDownload();
    $('download-status').textContent='Payment complete. Preparing your PDF now…';
    $('download-confirm').replaceChildren(document.createTextNode('Preparing PDF…'));
    $('download-confirm').disabled=true;
    track('payment_returned',{mode:stripeTestMode?'test':'live'});
    toast(stripeTestMode?'Stripe test payment completed. Preparing your PDF.':'Payment completed. Preparing your PDF.');
    await createPDF({attemptSave:false});
  }
  function savePreparedPDF() {
    if(!state.downloadURL)return false;
    const anchor=document.createElement('a');anchor.href=state.downloadURL;anchor.download=state.downloadName||'ChattoPaper conversation.pdf';
    document.body.append(anchor);anchor.click();anchor.remove();return true;
  }
  async function createPDF({attemptSave=true}={}) {
    if(state.exporting||!state.doc||!state.dateConfirmed)return;
    if(state.downloadURL){if(attemptSave)savePreparedPDF();return;}
    const doc=state.doc;state.exporting=true;
    const dialog=$('download-dialog');const button=$('download-confirm');const close=dialog.querySelector('.dialog-close');
    button.disabled=true;close.disabled=true;$('download-return').disabled=true;$('download-progress').hidden=false;$('download-progress').value=0;
    button.replaceChildren(document.createTextNode('Making your PDF…'));updateDownloadEnabled();
    try {
      const blob=await ChatDocument.exportPDF(doc,(page,total)=>{
        $('download-progress').value=page/total;$('download-status').textContent=`Preparing page ${page} of ${total}. Keep this tab open.`;
      });
      if(state.downloadURL)releaseURL(state.downloadURL);
      state.downloadURL=await localBlobURL(blob);
      const name=doc.options.title.replace(/[<>:"/\\|?*\x00-\x1F]/g,'').replace(/\s+/g,' ').trim().slice(0,80)||'My conversation';
      state.downloadName=name+'.pdf';
      $('download-ready-link').href=state.downloadURL;$('download-ready-link').download=state.downloadName;$('download-ready-link').hidden=false;
      const mb=blob.size/1024/1024;
      $('download-status').textContent=`Payment complete. Your ${doc.pages.length}-page PDF is ready (${mb<1?Math.round(blob.size/1024)+' KB':mb.toFixed(1)+' MB'}). Tap “Save PDF” below.`;
      track('pdf_ready',{pages:doc.pages.length,bytes:blob.size});
      button.replaceChildren(document.createTextNode('Save PDF'),icon('download'));
      if(attemptSave){savePreparedPDF();track('pdf_downloaded',{pages:doc.pages.length,bytes:blob.size});}
      else toast('Your PDF is ready to save.');
    }catch(error){
      $('download-status').textContent=error.message||'The PDF could not be generated. Try a smaller date range.';
      button.replaceChildren(document.createTextNode('Try download again'),icon('download'));toast('The PDF could not finish. Please try again.',true);
    }finally{state.exporting=false;button.disabled=false;close.disabled=false;$('download-return').disabled=false;updateDownloadEnabled();}
  }
  async function downloadPDF() {
    if(!state.paymentUnlocked){beginStripePayment();return;}
    if(state.downloadURL){if(savePreparedPDF())track('pdf_downloaded',{prepared:true});return;}
    await createPDF({attemptSave:true});
  }
  function chooseGuide(which,focus=false) {
    for(const name of ['iphone','android']){
      const tab=$(name+'-tab');tab.setAttribute('aria-selected',String(name===which));tab.tabIndex=name===which?0:-1;$(name+'-guide').hidden=name!==which;
    }
    if(focus)$(which+'-tab').focus();
  }
  function bindEvents() {
    $('clear-file').addEventListener('click',clearConversation);
    // The actual, rendered native inputs receive the user's click/tap/key.
    // No synthetic .click(), hidden inputs, popup or activation delay is used.
    for(const id of ['file-input','replace-file-input']){
      $(id).addEventListener('change',async e=>{const input=e.currentTarget;const files=Array.from(input.files||[]);if(!files.length)return;try{await importFiles(files);}finally{input.value='';}});
      $(id).addEventListener('cancel',()=>{if(!state.importing)$('import-status').textContent=state.active?'No new file selected. Your current conversation is unchanged.':'No file selected. Choose a ZIP, or a TXT and its photos.';});
    }
    for(const type of ['dragenter','dragover'])$('dropzone').addEventListener(type,e=>{e.preventDefault();$('dropzone').classList.add('dragover');});
    for(const type of ['dragleave','drop'])$('dropzone').addEventListener(type,e=>{e.preventDefault();$('dropzone').classList.remove('dragover');});
    $('dropzone').addEventListener('drop',e=>importFiles(Array.from(e.dataTransfer.files)));
    window.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault();});
    window.addEventListener('drop',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault();});
    document.querySelectorAll('[data-action=sample]').forEach(button=>button.addEventListener('click',()=>useSample()));
    $('document-title').addEventListener('input',()=>scheduleRender(220));
    for(const id of ['date-from','date-to','include-photos','show-timestamps','include-system','paper-size','primary-sender','text-size'])$(id).addEventListener('change',()=>{state.page=0;scheduleRender();});
    document.querySelectorAll('input[name=layout]').forEach(input=>input.addEventListener('change',()=>{state.page=0;scheduleRender();}));
    $('date-order').addEventListener('change',reparseDateOrder);
    $('all-dates').addEventListener('click',()=>{updateDates(true);state.page=0;scheduleRender(0);});
    $('prev-page').addEventListener('click',()=>movePage(-1));$('next-page').addEventListener('click',()=>movePage(1));
    $('large-prev').addEventListener('click',()=>movePage(-1));$('large-next').addEventListener('click',()=>movePage(1));
    $('expand-preview').addEventListener('click',async()=>{if(!state.doc)return;openDialog('large-preview-dialog');try{await renderLargePage();}catch(error){toast(error.message,true);}});
    $('download-open').addEventListener('click',openDownload);$('download-confirm').addEventListener('click',downloadPDF);
    $('download-return').addEventListener('click',()=>$('download-dialog').close());
    $('download-dialog').addEventListener('cancel',event=>{if(state.exporting)event.preventDefault();});
    document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>openDialog(button.dataset.dialog)));
    document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{
      if(e.target!==dialog||state.exporting)return;
      const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();
    }));
    document.querySelectorAll('[data-guide]').forEach(button=>{
      button.addEventListener('click',()=>chooseGuide(button.dataset.guide));
      button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const which=e.key==='Home'?'iphone':e.key==='End'?'android':button.dataset.guide==='iphone'?'android':'iphone';chooseGuide(which,true);}});
    });
    // A persisted page keeps its object URLs for browser Back. Closing a tab
    // releases its memory; explicit clearing/replacement revokes URLs above.
    window.addEventListener('message',event=>{if(event.origin===location.origin&&event.data?.type==='chattopaper-stripe-success')unlockPayment(event.data.sessionId,event.data.paymentRef);});
    window.addEventListener('storage',event=>{if(event.key===PAYMENT_SUCCESS_KEY&&event.newValue){try{const data=JSON.parse(event.newValue);unlockPayment(data.sessionId,data.paymentRef);}catch(_){}}});
    if(typeof BroadcastChannel==='function'){
      const payments=new BroadcastChannel(PAYMENT_CHANNEL);
      payments.addEventListener('message',event=>{if(event.data?.type==='success')unlockPayment(event.data.sessionId,event.data.paymentRef);});
    }
    const checkReturnedPayment=()=>{const data=readStoredPaymentSuccess();if(data)unlockPayment(data.sessionId,data.paymentRef);};
    window.addEventListener('focus',checkReturnedPayment);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkReturnedPayment();});
    window.addEventListener('pagehide',event=>{if(!event.persisted){disposeDoc();revokeMedia();}});
  }
  async function initialize() {
    try {
      // Core controls become live before any sample, image, font or preview
      // work. A sample failure must never prevent importing a real file.
      bindEvents();updatePickerState();$('runtime-status').hidden=true;
      const params=new URLSearchParams(location.search);
      const returnedSession=params.get('session_id');
      if(params.get('stripe')==='success'&&returnedSession){
        // Backward-compatible handling for older Stripe redirects still cached by Stripe.
        let paymentRef=null;try{paymentRef=JSON.parse(localStorage.getItem(PAYMENT_PENDING_KEY)||'null')?.paymentRef||null;}catch(_){}
        const payload={type:'chattopaper-stripe-success',sessionId:returnedSession,paymentRef,ts:Date.now()};
        try{localStorage.setItem(PAYMENT_SUCCESS_KEY,JSON.stringify(payload));}catch(_){}
        try{if(typeof BroadcastChannel==='function'){const channel=new BroadcastChannel(PAYMENT_CHANNEL);channel.postMessage({type:'success',...payload});channel.close();}}catch(_){}
        location.replace('/payment-success/?session_id='+encodeURIComponent(returnedSession));return;
      }
      const storedSuccess=readStoredPaymentSuccess();if(storedSuccess)unlockPayment(storedSuccess.sessionId,storedSuccess.paymentRef);
      document.documentElement.dataset.appReady='true';
    }catch(error){
      $('runtime-status').hidden=false;$('runtime-status').querySelector('p').textContent='This viewer could not start the converter. Open the downloaded HTML in a full browser with JavaScript enabled. '+error.message;
      return;
    }
    try {
      state.sampleSource=makeSampleSource();
      emptyPreview('Your preview appears here.','Upload a WhatsApp export or try a sample.');
      updateDownloadEnabled();
    }catch(error){
      if(!state.active&&!state.importing){emptyPreview('Ready for your conversation.','Choose a ZIP or TXT with photos to get started.');setError('The sample preview could not load. File selection is still available. '+error.message);}
    }
  }
  initialize();
})();