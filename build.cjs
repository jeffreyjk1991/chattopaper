/* Build ChatToPaper: converter + crawlable guide library. */
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const SITE = (process.env.SITE_URL || 'https://chattopaper.com').replace(/\/+$/, '');
const UPDATED = '2026-10-23';
const FREE_LAUNCH = process.env.FREE_LAUNCH !== 'false';
const INDEXNOW_KEY = '3a7f873b81f8e917ee92d1d32d7575be';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const readResolved = spec => fs.readFileSync(require.resolve(spec, { paths: [root] }), 'utf8');
const data = (file, type) => `data:${type};base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const escXml = escapeHtml;
const articles = require('./content/articles.cjs');
const blogCss = read('src/blog.css');
const analytics = `<script>(function(){try{var k='chattopaper.attribution.v1';if(!sessionStorage.getItem(k)){var p=new URLSearchParams(location.search),r='';try{r=document.referrer?new URL(document.referrer).hostname.replace(/^www\\./,''):''}catch(e){}sessionStorage.setItem(k,JSON.stringify({referrerHost:r,utmSource:p.get('utm_source')||'',utmMedium:p.get('utm_medium')||'',utmCampaign:p.get('utm_campaign')||'',utmContent:p.get('utm_content')||'',utmTerm:p.get('utm_term')||'',landingPage:location.pathname}));}}catch(e){}})();window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script><script defer src="/_vercel/speed-insights/script.js"></script>`;
const favicon = `${SITE}/favicon.png`;

const out = (...p) => path.join(root, 'dist', ...p);
const write = (relative, body) => { const file=out(relative); fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,body); };

// Main converter build.
const image = data('assets/coast.svg', 'image/svg+xml');
let css = read('src/styles.css');
let html = read('src/index.html');
const pdfLib = readResolved('pdf-lib/dist/pdf-lib.min.js');
const zipLib = readResolved('pako/dist/pako_inflate.min.js');
if (pdfLib.length < 300000 || !pdfLib.includes('PDFDocument')) throw new Error('pdf-lib dependency is missing or incomplete; refusing to publish a broken converter.');
if (zipLib.length < 15000 || !zipLib.includes('Inflate')) throw new Error('pako ZIP dependency is missing or incomplete; refusing to publish a broken converter.');
const scripts = {
  '/*__PDF_LIB__*/': pdfLib,
  '/*__ZIP_LIB__*/': zipLib,
  '/*__IMPORTER__*/': read('src/importer.js'),
  '/*__DOCUMENT__*/': read('src/document.js'),
  '/*__APP__*/': read('src/app.js'),
};
html = html.replace('/*__STYLES__*/', () => css);
for (const [token, body] of Object.entries(scripts)) html = html.replace(token, () => body.replace(/<\/script/gi, '<\\/script'));
html = html.replaceAll('__COAST_IMAGE__', image);
html = html.replaceAll('__FREE_LAUNCH__', FREE_LAUNCH ? 'true' : 'false');
if (/\/\*__[A-Z_]+__\*\//.test(html)) throw new Error('Unresolved build marker');
fs.rmSync(out(), {recursive:true, force:true});
fs.mkdirSync(out(), {recursive:true});
write('index.html', html);
write('ChatToPaper.html', html);
fs.mkdirSync(out('assets'),{recursive:true});
for (const asset of ['coast.svg','logo-icon-original-20261023.png','logo-wordmark-original-20261023.png']) fs.copyFileSync(path.join(root,'assets',asset),out('assets',asset));
fs.copyFileSync(path.join(root,'assets','logo-icon-original-20261023.png'),out('favicon.png'));

const nav = `<div class="topbar"><div class="wrap nav"><a class="brand brand-image" href="/" aria-label="ChatToPaper home"><img src="/assets/logo-wordmark-original-20261023.png" alt="ChatToPaper" width="2172" height="724"></a><div class="navlinks"><a href="/blog/">Guides</a><a href="/about/">About</a><a href="/editorial-policy/">Editorial policy</a><a class="btn" href="/#converter">Create your PDF</a></div></div></div>`;
const footer = `<footer class="footer"><div class="wrap"><span><a class="footer-brand" href="/" aria-label="ChatToPaper home"><img src="/assets/logo-wordmark-original-20261023.png" alt="ChatToPaper" width="2172" height="724"></a><br>WhatsApp chats, beautifully on paper.</span><span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/editorial-policy/">Editorial policy</a> · Independent tool, not affiliated with WhatsApp or Meta.</span></div></footer>`;
const siteEntityJson = `<script type="application/ld+json">${JSON.stringify({
  '@context':'https://schema.org',
  '@graph':[
    {'@type':'Organization','@id':`${SITE}/#org`,name:'ChatToPaper',alternateName:'Chat to Paper',url:`${SITE}/`,logo:`${SITE}/favicon.png`,sameAs:['https://github.com/jeffreyjk1991/chattopaper'],description:'ChatToPaper is an independent browser-based WhatsApp to PDF converter for personal archives and small-business conversation records.'},
    {'@type':'WebSite','@id':`${SITE}/#website`,name:'ChatToPaper',alternateName:'Chat to Paper',url:`${SITE}/`,publisher:{'@id':`${SITE}/#org`},inLanguage:'en-US'},
    {'@type':'WebApplication','@id':`${SITE}/#app`,name:'ChatToPaper',url:`${SITE}/`,applicationCategory:'UtilitiesApplication',applicationSubCategory:'WhatsApp to PDF converter',operatingSystem:'Any modern web browser',isAccessibleForFree:true,description:'Free browser-based WhatsApp to PDF converter for exported TXT or ZIP chats with sender names, timestamps and supported photos.',provider:{'@id':`${SITE}/#org`},offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}}
  ]
}).replace(/</g,'\\u003c')}</script>`;
function baseHead({title,description,canonical,type='website',jsonLd='',robots='index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}){
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f5ef"><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="robots" content="${robots}"><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${canonical}"><link rel="alternate" type="application/rss+xml" title="ChatToPaper Blog" href="${SITE}/feed.xml"><meta property="og:type" content="${type}"><meta property="og:site_name" content="ChatToPaper"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary"><meta property="og:image" content="${SITE}/assets/logo-wordmark-original-20261023.png"><meta property="og:image:alt" content="ChatToPaper logo"><link rel="icon" href="${favicon}" type="image/png" sizes="1254x1254"><link rel="apple-touch-icon" href="${favicon}"><title>${escapeHtml(title)}</title><style>${blogCss}</style>${siteEntityJson}${jsonLd}`;
}
function layout({title,description,canonical,main,type='website',jsonLd='',robots}){
  return `<!doctype html><html lang="en"><head>${baseHead({title,description,canonical,type,jsonLd,robots})}</head><body>${nav}${main}${footer}${analytics}</body></html>`;
}
function slugifyCategory(cat){return cat.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function relatedFor(article){
  const same=articles.filter(a=>a.category===article.category&&a.slug!==article.slug);
  const other=articles.filter(a=>a.category!==article.category&&a.slug!==article.slug);
  const core=articles.filter(a=>a.sections && a.slug!==article.slug);
  return [...new Map([...core.filter(a=>a.category===article.category),...same.slice(0,2),...core,...other].map(a=>[a.slug,a])).values()].slice(0,4);
}
function stepsFor(a){
  const byCategory={
    'iPhone':['Open the WhatsApp conversation you want to preserve.','Use Export Chat and choose whether photos should be included.','Save the TXT/ZIP somewhere accessible from a full browser.','Import the export into ChatToPaper and confirm dates, messages and photo count.','Preview the pages, then create the PDF when the result looks right.'],
    'Android':['Open the conversation in WhatsApp on Android.','Choose More options → More → Export chat.','Choose Include media when the final document needs photos.','Open the export in ChatToPaper and review the parsed date range and media matches.','Preview the printable pages before creating the PDF.'],
    'Photos & media':['Export the chat with media rather than text only.','Keep the transcript and image files together; do not rename them first.','Import the ZIP or TXT plus photos as one conversation.','Compare the matched-photo count and inspect any missing-media warnings.','Review several photo-heavy pages before creating the final PDF.'],
    'Printing & formatting':['Import the exported conversation and choose the dates you actually need.','Pick A4 or US Letter to match the printer or print service.','Choose chat bubbles for a keepsake or transcript style for density.','Inspect page count, text size, photo scale and page breaks.','Print one or two test pages before committing to a long physical copy.'],
    'Troubleshooting':['Start from the original WhatsApp export rather than a modified copy.','Check whether the source is a readable TXT or a complete ZIP.','Confirm the converter reports messages and dates before adjusting formatting.','Resolve date or media warnings instead of ignoring them.','If the file is unusually large or damaged, create a fresh smaller export and try again.'],
    'Privacy & records':['Decide what portion of the conversation you truly need to preserve or share.','Keep the original export unchanged when provenance may matter.','Prefer local processing for sensitive conversations and review the service privacy statement.','Preview names, photos, dates and any sensitive details before creating the PDF.','Store and share the finished file according to the sensitivity of its contents.'],
    'Use cases':['Choose the specific period or event that gives the conversation meaning.','Export with media if the surrounding photos are part of the story.','Use a title and layout appropriate to the purpose: keepsake, record or gift.','Preview the full document and remove unnecessary scope with date filters.','Keep the original export in addition to the polished PDF.'],
    'Comparisons & decisions':['Start with your primary goal: printing, archiving, editing, evidence review or gifting.','Compare privacy, photo support, readability, cost and file portability.','Test the workflow on a small export before committing a large conversation.','Prefer tools that show a preview and clear warnings before download.','Keep the original WhatsApp export regardless of the final format you choose.'],
    'Business records':['Identify the WhatsApp conversation that contains the order, quote, approval, supplier discussion or job instruction you need to preserve.','Export that conversation and keep the original TXT/ZIP unchanged.','Convert the relevant date range to PDF with names, timestamps and supporting photos visible.','Review the PDF against the related invoice, quote, work order, receipt or project file.','Store the PDF as supporting documentation alongside your formal business records.'],
    'Search questions':['Export one conversation from WhatsApp using the built-in export feature.','Include media if photos need to appear in the finished document.','Open the exported TXT or ZIP in a compatible browser-based converter.','Check dates, sender names, message count and media warnings in the preview.','Create the PDF and keep the original export as a separate source copy.'],
    'Convert & save':['Export the WhatsApp conversation you want to keep.','Choose Include Media if the photos are important to the final document.','Import the TXT/ZIP into ChatToPaper without renaming the media files.','Set the date range and confirm the preview matches the conversation.','Create the PDF and keep the source export separately for future use.']
  };
  return byCategory[a.category] || byCategory['Convert & save'];
}
function categoryAdvice(a){
  const advice={
    'Convert & save':`The export is the source; the PDF is the presentation layer. That distinction matters. A polished PDF can be easier to read and print, but it should not replace the original TXT/ZIP when you want a faithful archive. ChatToPaper uses the export to reconstruct a readable document and keeps the original message order rather than trying to recreate the WhatsApp app interface pixel for pixel.`,
    'iPhone':`On iPhone, the main friction is usually the share sheet: users export correctly but then lose track of where the ZIP or TXT was saved. Save it to Files or another location you can find again, then open ChatToPaper in Safari or another full browser. An embedded attachment preview may block the file picker even when the website itself is working.`,
    'Android':`Android exports are straightforward, but the exact share destination can change how the files are packaged. The important pieces are the conversation TXT and, when selected, the media files. Keep them together until conversion so attachment filenames can still be matched to the transcript.`,
    'Photos & media':`Media matching is where many chat converters fail. A responsible tool should not guess. If the transcript references an image that is missing, duplicated, unsupported or unreadable, the document should say so and preserve a placeholder. That makes the preview honest and prevents a polished-looking PDF from hiding missing context.`,
    'Printing & formatting':`Good print formatting is a tradeoff between density and comfort. Bigger text and larger photos look better but use more pages. A transcript layout is efficient; chat bubbles feel more personal. There is no universally “best” format, which is why previewing the actual page breaks is more valuable than a generic promise about beautiful output.`,
    'Troubleshooting':`When a conversion fails, avoid repeatedly modifying the same archive. A fresh export removes many unknowns. Good parsers also fail loudly on damaged ZIPs, unreadable text, conflicting date formats and ambiguous duplicate filenames rather than silently producing a misleading document.`,
    'Privacy & records':`A conversation can contain information about people who never chose to publish it. Limit the scope you process and share. ChatToPaper is designed so the selected chat files stay in your browser; Vercel analytics measures site usage and Stripe handles checkout separately, without receiving the contents of the chat files you select.`,
    'Business records':`Many small businesses use WhatsApp for customer orders, quote approvals, supplier discussions, scheduling, delivery instructions and job changes. A readable PDF can make those conversations easier to store with the related order, invoice, estimate, work order, purchase record or project file. Treat the PDF as supporting documentation: it does not replace bookkeeping, tax records, signed contracts or whatever formal records your business is required to keep.`,
    'Use cases':`The best keepsakes and records are usually edited by scope, not by rewriting the messages. Pick the relevant dates, keep the original wording, and let the layout do the presentation work. This preserves context while avoiding a hundred-page document full of routine messages that distract from the reason you saved it.`,
    'Comparisons & decisions':`Compare tools on the outcome that matters, not just the headline price. For a one-off chat, preview quality, media accuracy, local processing and clear missing-file warnings can matter more than a long feature list. For recurring business workflows, automation and account-level controls may matter more.`,
    'Search questions':`The short answer is often yes, but the details depend on what WhatsApp actually exported. A converter can format what is present; it cannot recover deleted messages, bypass Advanced Chat Privacy, or invent omitted photos. That boundary is useful when you evaluate any service making stronger claims.`
  };
  return advice[a.category] || advice['Convert & save'];
}
function pitfallsFor(a){
  return [
    'Exporting without media and expecting the converter to recover photos later.',
    'Renaming image files before conversion, which can break attachment matching.',
    'Assuming an ambiguous date such as 04/05 was interpreted in the intended regional order.',
    'Skipping the preview and discovering missing media only after printing.',
    a.category==='Privacy & records' ? 'Treating a formatted PDF as authenticated or legally certified evidence.' : 'Using screenshots for a long chat when a structured export would be easier to review.'
  ];
}
function officialSourceFor(a){return a.slug==='whatsapp-advanced-chat-privacy-export'?'https://faq.whatsapp.com/715385484388016/':'https://faq.whatsapp.com/1180414079177245/';}
function sourceNote(a){
  const advanced=a.slug==='whatsapp-advanced-chat-privacy-export';
  const url=officialSourceFor(a);
  return advanced
    ? `<p class="source"><strong>Official reference:</strong> WhatsApp explains that Advanced Chat Privacy can prevent chat exporting. <a href="${url}" rel="noopener">Read WhatsApp’s Advanced Chat Privacy help</a>.</p>`
    : `<p class="source"><strong>Official reference:</strong> WhatsApp’s export guidance describes Export chat and the choice to export with or without media. <a href="${url}" rel="noopener">Read WhatsApp’s export help</a>.</p>`;
}
function articleHtml(a){
  const canonical=`${SITE}/blog/${a.slug}/`;
  const rel=relatedFor(a);
  const sectionId = i => `section-${i+1}`;
  const detailedBody = a.sections ? `<nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul>${a.sections.map(([title],i)=>`<li><a href="#${sectionId(i)}">${escapeHtml(title)}</a></li>`).join('')}<li><a href="#questions">Questions and answers</a></li></ul></nav>${a.sections.map(([title,body],i)=>`<section aria-labelledby="${sectionId(i)}"><h2 id="${sectionId(i)}">${escapeHtml(title)}</h2>${body}</section>`).join('')}<section aria-labelledby="questions"><h2 id="questions">Questions and answers</h2>${a.faq.map(([question,answer])=>`<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join('')}</section>` : null;
  const howToJson = a.slug==='convert-whatsapp-chat-to-pdf' ? `<script type="application/ld+json">${JSON.stringify({
    '@context':'https://schema.org',
    '@type':'HowTo',
    name:'How to convert a WhatsApp chat to PDF',
    description:'Export one WhatsApp conversation, open the TXT or ZIP in ChatToPaper, verify dates and media, customize the PDF, preview it, and download the finished file.',
    totalTime:'PT5M',
    tool:[{'@type':'HowToTool',name:'WhatsApp Export Chat'},{'@type':'HowToTool',name:'ChatToPaper'}],
    supply:[{'@type':'HowToSupply',name:'Exported WhatsApp TXT or ZIP'}],
    step:[
      {'@type':'HowToStep',position:1,name:'Export the WhatsApp conversation',text:'Use WhatsApp Export Chat and include media when photos are needed.'},
      {'@type':'HowToStep',position:2,name:'Open the export in ChatToPaper',text:'Select the exported ZIP, or the TXT and exported photos together.'},
      {'@type':'HowToStep',position:3,name:'Verify dates and media',text:'Check message dates, participant names, matched photos and any missing-media warnings.'},
      {'@type':'HowToStep',position:4,name:'Customize the PDF',text:'Choose date range, page size, layout, timestamps and photo settings.'},
      {'@type':'HowToStep',position:5,name:'Preview and save',text:'Review the printable preview, then create and download the PDF.'}
    ],
    url:canonical,
    image:`${SITE}/favicon.png`
  }).replace(/</g,'\\\\u003c')}</script>` : '';
  const jsonLd=`<script type="application/ld+json">${JSON.stringify({
    '@context':'https://schema.org','@type':'BlogPosting',headline:a.title,description:a.description,datePublished:a.published,dateModified:a.updated,
    mainEntityOfPage:canonical,inLanguage:'en-US',keywords:a.keyword,
    author:{'@type':'Organization','@id':`${SITE}/#org`,name:'ChatToPaper',url:`${SITE}/about/`},publisher:{'@type':'Organization','@id':`${SITE}/#org`,name:'ChatToPaper',url:SITE,logo:{'@type':'ImageObject',url:favicon}},
    isPartOf:{'@type':'Blog',name:'ChatToPaper Guides',url:`${SITE}/blog/`},citation:[officialSourceFor(a)],
    about:{'@type':'Thing',name:a.keyword},articleSection:a.category
  }).replace(/</g,'\\u003c')}</script><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},{'@type':'ListItem',position:2,name:'Guides',item:`${SITE}/blog/`},{'@type':'ListItem',position:3,name:a.title,item:canonical}
  ]}).replace(/</g,'\\u003c')}</script>`;
  const steps=stepsFor(a).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const pitfalls=pitfallsFor(a).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const related=rel.map(r=>`<a href="/blog/${r.slug}/">${escapeHtml(r.title)}</a>`).join('');
  let main=`<main class="article"><div class="crumbs"><a href="/">Home</a> / <a href="/blog/">Guides</a> / <a href="/blog/category/${slugifyCategory(a.category)}/">${escapeHtml(a.category)}</a></div><div class="eyebrow">${escapeHtml(a.category)} · Updated <time datetime="${a.updated}">${new Date(a.updated+'T00:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</time></div><h1>${escapeHtml(a.title)}</h1><p class="meta">By <a href="/about/">ChatToPaper</a> · <a href="/editorial-policy/">How we review guides</a></p><p class="lede">${escapeHtml(a.description)}</p><div class="answerbox"><strong>Short answer</strong><p>${escapeHtml(a.answer)}</p></div><h2>What matters most</h2><p>${escapeHtml(categoryAdvice(a))}</p><p>For this specific question — <strong>${escapeHtml(a.keyword)}</strong> — the practical goal is not to make the export look exactly like the WhatsApp app. The goal is a document that is complete enough to understand, honest about anything missing, and predictable when printed or shared.</p><h2>A dependable workflow</h2><ol class="steps">${steps}</ol><h2>What to verify in the preview</h2><div class="trust"><div><strong>Messages</strong><p>Check that the conversation starts and ends where you expect and that multiline messages remain together.</p></div><div><strong>Dates & senders</strong><p>Confirm the date order, timestamp style and participant names before treating the PDF as a record.</p></div><div><strong>Photos</strong><p>Compare the matched-photo count with your expectation and investigate placeholders before download.</p></div></div><h2>Common mistakes to avoid</h2><ul>${pitfalls}</ul><h2>What the PDF can and cannot prove</h2><p>A formatted PDF is useful for reading, printing and sharing, but it is not a forensic export. ChatToPaper does not recover deleted messages, bypass WhatsApp restrictions, authenticate who sent a message, or certify a conversation as legal evidence. If authenticity or admissibility matters, preserve the original files and get advice appropriate to your situation.</p><div class="callout"><strong>Want to make the document now?</strong><p>ChatToPaper lets you import one WhatsApp export, choose a date range, preview the pages and create a printable PDF with supported photos. The selected chat files are processed locally in your browser.</p><a class="btn" href="/#converter">Create your WhatsApp PDF</a></div>${sourceNote(a)}<h2>Related guides</h2><div class="related">${related}</div><p class="source">This page is part of ChatToPaper’s focused guide library. We use AI-assisted drafting for structure and breadth, then check claims against the behavior of ChatToPaper and official product documentation. See our <a href="/editorial-policy/">editorial policy</a>.</p></main>`;
  if (detailedBody) main = main.replace(/<h2>What matters most<\/h2>[\s\S]*?(?=<div class="callout">)/, detailedBody);
  const faqJson = a.faq ? `<script type="application/ld+json">${JSON.stringify({
    '@context':'https://schema.org','@type':'FAQPage',
    mainEntity:a.faq.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))
  }).replace(/</g,'\\u003c')}</script>` : '';
  return layout({title:`${a.title} | ChatToPaper`,description:a.description,canonical,main,type:'article',jsonLd:jsonLd+howToJson+faqJson});
}

// Blog index and category hubs.
const cats=[...new Set(articles.map(a=>a.category))];
const catNav=cats.map(c=>`<a href="/blog/category/${slugifyCategory(c)}/">${escapeHtml(c)}</a>`).join('');
const featured=articles.filter(a=>a.sections);
const startHere=`<section class="start-here" aria-labelledby="start-here-title"><div class="eyebrow">FREE TOOL</div><h2>Check your WhatsApp export</h2><p>Before converting, quickly check message count, date range, missing photos and “Media omitted” warnings. Everything is analyzed locally in your browser.</p><p><a class="btn" href="/tools/whatsapp-export-checker/">Open the WhatsApp Export Checker →</a></p><h2 id="start-here-title">Start with a guide</h2><div class="related">${featured.map(a=>`<a href="/blog/${a.slug}/">${escapeHtml(a.title)}</a>`).join('')}</div></section>`;
const cards=articles.map(a=>`<article class="card"><small>${escapeHtml(a.category)}</small><h2>${escapeHtml(a.title)}</h2><p>${escapeHtml(a.answer)}</p><a href="/blog/${a.slug}/">Read guide →</a></article>`).join('');
const guideWalkthrough=`<section class="guide-walkthrough" aria-labelledby="how-it-works-title">
  <div class="walkthrough-copy">
    <div class="eyebrow">HOW CHATTOPAPER WORKS</div>
    <h2 id="how-it-works-title">From WhatsApp export to PDF in three steps.</h2>
    <p>Export your chat from WhatsApp, make any quick adjustments, then save a clean PDF. Your selected chat files stay in your browser.</p>
  </div>
  <div class="walkthrough-steps" aria-label="Three steps to create a WhatsApp PDF">
    <article class="walkthrough-step step-upload">
      <span class="walkthrough-number">1</span>
      <div class="walkthrough-demo upload-demo" aria-hidden="true">
        <div class="demo-file">ZIP</div>
        <div class="demo-drop"><span>↑</span><small>WhatsApp export</small></div>
      </div>
      <h2>Upload your ZIP</h2>
      <p>Choose the ZIP exported from WhatsApp, or the TXT plus photos.</p>
    </article>
    <article class="walkthrough-step step-adjust">
      <span class="walkthrough-number">2</span>
      <div class="walkthrough-demo adjust-demo" aria-hidden="true">
        <div class="demo-slider"><i></i></div>
        <div class="demo-slider short"><i></i></div>
        <div class="demo-toggle"><i></i><span>Photos</span></div>
      </div>
      <h2>Adjust what you need</h2>
      <p>Choose dates, page size and layout, then review the preview.</p>
    </article>
    <article class="walkthrough-step step-save">
      <span class="walkthrough-number">3</span>
      <div class="walkthrough-demo save-demo" aria-hidden="true">
        <div class="demo-pdf"><b>PDF</b><span></span><span></span><span></span></div>
        <div class="demo-download">↓</div>
      </div>
      <h2>Save your PDF</h2>
      <p>Download the finished conversation as a clean, printable PDF.</p>
    </article>
  </div>
  <p class="walkthrough-action"><a class="btn" href="/#converter">Create your PDF →</a></p>
</section>`;

const blogJson=`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:'ChatToPaper WhatsApp PDF Guides',url:`${SITE}/blog/`,description:'37 focused guides about exporting, printing and preserving WhatsApp conversations, including small-business record keeping.'}).replace(/</g,'\\u003c')}</script>`;
write('blog/index.html',layout({title:'WhatsApp PDF Guides — Export, Print & Preserve Chats | ChatToPaper',description:'37 focused guides for converting WhatsApp chats to PDF, small-business record keeping, printing conversations with photos, exporting on iPhone and Android, troubleshooting, privacy and archiving.',canonical:`${SITE}/blog/`,jsonLd:blogJson,main:`<main class="wrap">${guideWalkthrough}<section class="hero guide-library-hero"><div class="eyebrow">37 FOCUSED GUIDES</div><h1>WhatsApp chats,<br>made easier to keep.</h1><p>Answer-first guides for exporting, converting, printing and preserving WhatsApp conversations. Choose a task below, or browse by topic to solve a specific export or printing problem.</p><div class="category-nav">${catNav}</div></section>${startHere}<section class="grid">${cards}</section></main>`}));
for(const cat of cats){
  const subset=articles.filter(a=>a.category===cat);
  const catCards=subset.map(a=>`<article class="card"><small>${escapeHtml(a.category)}</small><h2>${escapeHtml(a.title)}</h2><p>${escapeHtml(a.answer)}</p><a href="/blog/${a.slug}/">Read guide →</a></article>`).join('');
  const slug=slugifyCategory(cat), canonical=`${SITE}/blog/category/${slug}/`;
  write(`blog/category/${slug}/index.html`,layout({title:`${cat} WhatsApp Guides | ChatToPaper`,description:`Practical ChatToPaper guides about ${cat.toLowerCase()} for WhatsApp conversations, exports and printable PDFs.`,canonical,main:`<main class="wrap"><section class="hero"><div class="eyebrow">GUIDE CATEGORY</div><h1>${escapeHtml(cat)}</h1><p>${subset.length} focused guides for this part of the WhatsApp-to-PDF workflow.</p><div class="category-nav">${catNav}</div></section><section class="grid">${catCards}</section></main>`}));
}
for(const a of articles) write(`blog/${a.slug}/index.html`,articleHtml(a));

function infoPage(slug,title,description,body){
  write(`${slug}/index.html`,layout({title:`${title} | ChatToPaper`,description,canonical:`${SITE}/${slug}/`,main:`<main class="article"><div class="crumbs"><a href="/">Home</a> / ${escapeHtml(title)}</div>${body}</main>`}));
}
infoPage('about','About ChatToPaper','What ChatToPaper does, how the WhatsApp-to-PDF converter works and the limits of the service.',`<div class="eyebrow">ABOUT CHATTOPAPER</div><h1>A small tool for conversations worth keeping.</h1><p class="lede">ChatToPaper turns an exported WhatsApp conversation into a readable, printable PDF with sender names, timestamps and supported photos in context.</p><h2>Why it exists</h2><p>WhatsApp can export a conversation, but the result is designed as data rather than a polished document. ChatToPaper focuses on the last mile: turning that export into pages that are easier to read, print or save.</p><h2>Privacy by design</h2><p>The selected chat text and photos are processed in your browser. They are not uploaded to a ChatToPaper application server. Vercel Web Analytics and Speed Insights measure site usage and performance, while Stripe handles checkout separately; neither is sent the contents of the WhatsApp files you select.</p><h2>What it does not do</h2><p>ChatToPaper does not recover deleted messages, bypass WhatsApp privacy restrictions, authenticate chat history or certify legal evidence. It formats the export you provide and warns when media is missing or unsupported.</p><h2>Independent product</h2><p>ChatToPaper is independent and is not affiliated with, endorsed by or sponsored by WhatsApp or Meta.</p><div class="about-usage" aria-label="ChatToPaper usage"><span>PDFs generated today</span><strong id="pdf-generated-count" aria-live="polite">—</strong><small id="pdf-generated-status">Loading live count</small></div><script>(async()=>{const countEl=document.getElementById('pdf-generated-count');const statusEl=document.getElementById('pdf-generated-status');try{const r=await fetch('/api/pdf-count',{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json();const count=Number(d.count);if(!Number.isFinite(count)||count<0)throw new Error();countEl.textContent=count.toLocaleString('en-US');statusEl.textContent='Live count';try{const prev=Number(localStorage.getItem('chattopaper.lastPdfCount')||0);localStorage.setItem('chattopaper.lastPdfCount',String(Math.max(prev,count)));}catch(_){}}catch(_){let prev=0;try{prev=Number(localStorage.getItem('chattopaper.lastPdfCount')||0);}catch(_){}if(Number.isFinite(prev)&&prev>0){countEl.textContent=prev.toLocaleString('en-US');statusEl.textContent='Last known count';}else{statusEl.textContent='Live count temporarily unavailable';}}})();</script>`);
infoPage('editorial-policy','Editorial policy','How ChatToPaper creates, reviews and updates its WhatsApp export and PDF guides, including AI-assisted drafting disclosure.',`<div class="eyebrow">EDITORIAL POLICY</div><h1>Useful first. Search second.</h1><p class="lede">Our guide library is built to answer practical questions people have while exporting, printing and preserving conversations.</p><h2>How articles are created</h2><p>ChatToPaper uses AI-assisted drafting to help organize topics and produce consistent first drafts at scale. We do not publish pages simply by swapping keywords. Each guide targets a distinct user question and includes a direct answer, a task-specific workflow, limitations, preview checks and related resources.</p><h2>How claims are checked</h2><p>Product-behavior claims are checked against the current ChatToPaper implementation. WhatsApp workflow claims are grounded in WhatsApp’s public Help Center. We avoid claims that a formatted PDF can recover deleted messages, bypass export restrictions, authenticate a chat or guarantee legal admissibility.</p><h2>Updates</h2><p>Pages show an updated date. We revise guides when WhatsApp export behavior, browser capabilities or ChatToPaper functionality materially changes.</p><h2>Corrections</h2><p>If a guide is wrong, the goal is to correct the page rather than preserve old wording for ranking purposes. The site’s primary purpose is the WhatsApp-to-PDF workflow and closely related questions.</p>`);
infoPage('privacy','Privacy','ChatToPaper privacy information: local chat processing, Vercel analytics and Stripe checkout.',`<div class="eyebrow">PRIVACY</div><h1>Your chat files stay in your browser.</h1><p class="lede">ChatToPaper is designed so the WhatsApp export you select is processed locally in the browser instead of being uploaded to an application server.</p><h2>Conversation contents</h2><p>Your selected TXT, ZIP and supported image files are read in the page. Replacing or clearing the conversation releases the app’s references to those files; closing the tab ends that browser session.</p><h2>Analytics</h2><p>ChatToPaper uses Vercel Web Analytics and Speed Insights to understand visits and site performance. When a PDF is created, ChatToPaper also records anonymous conversion analytics such as country/region, referring site or campaign, landing page and device type. Raw IP addresses, WhatsApp message contents, filenames and photos are not stored in this conversion record.</p><h2>Payments</h2><p>Stripe handles checkout separately. ChatToPaper does not send your conversation text or photos to Stripe.</p><h2>Your finished PDF</h2><p>The PDF you create can contain personal information from the conversation. Review it before saving, printing or sharing it.</p>`);
infoPage('terms','Terms','Terms for using ChatToPaper to format an exported WhatsApp conversation into a printable PDF.',`<div class="eyebrow">TERMS</div><h1>Using ChatToPaper.</h1><p class="lede">Use ChatToPaper only with conversation files you are entitled to process and share.</p><h2>A formatting tool</h2><p>ChatToPaper formats data present in your export. It does not guarantee that WhatsApp included every message or media file, recover deleted material, authenticate messages, or certify legal evidence.</p><h2>Review before relying</h2><p>Check the preview, date interpretation, sender names and missing-media warnings before using the finished document.</p><h2>Payments</h2><p>The intended product is a one-time payment per finished PDF, with no subscription. Stripe handles the payment experience separately from the local chat-processing workflow.</p><h2>Independence</h2><p>ChatToPaper is not affiliated with, endorsed by or sponsored by WhatsApp or Meta. WhatsApp and related marks belong to their respective owners.</p>`);

// Dedicated Stripe return page. It carries no chat contents; it only relays
// the Checkout Session ID back to the already-open converter tab.
const paymentSuccessScript = `<script>(function(){
  'use strict';
  const SUCCESS_KEY='chattopaper.payment.success.v2', PENDING_KEY='chattopaper.payment.pending.v2', CHANNEL='chattopaper-payments-v2';
  const params=new URLSearchParams(location.search), sessionId=params.get('session_id');
  const valid=/^cs_(?:test|live)_[A-Za-z0-9_]+$/.test(String(sessionId||''));
  let paymentRef=null;
  try{paymentRef=JSON.parse(localStorage.getItem(PENDING_KEY)||'null')?.paymentRef||null;}catch(_){}
  if(valid){
    const payload={type:'chattopaper-stripe-success',sessionId,paymentRef,ts:Date.now()};
    try{localStorage.setItem(SUCCESS_KEY,JSON.stringify(payload));}catch(_){}
    try{if(typeof BroadcastChannel==='function'){const channel=new BroadcastChannel(CHANNEL);channel.postMessage({type:'success',sessionId,paymentRef,ts:payload.ts});channel.close();}}catch(_){}
    document.documentElement.dataset.payment='success';
    setTimeout(()=>{try{window.close();}catch(_){}},900);
  }else document.documentElement.dataset.payment='invalid';
})();</script>`;
write('payment-success/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f6f5ef"><title>Payment complete | ChatToPaper</title><style>${blogCss}.payment-result{max-width:660px;margin:14vh auto;padding:0 24px;text-align:center}.payment-result h1{font-size:clamp(2.4rem,7vw,4.6rem);margin:.2em 0}.payment-result p{font-size:1.08rem;line-height:1.7}.payment-result .success-only,.payment-result .error-only{display:none}html[data-payment=success] .success-only{display:block}html[data-payment=invalid] .error-only{display:block}</style></head><body>${nav}<main class="payment-result"><div class="success-only"><div class="eyebrow">PAYMENT COMPLETE</div><h1>Your PDF is being prepared.</h1><p>ChatToPaper has notified the original tab where your conversation is still loaded. This payment tab should close automatically. If it stays open, close it and return to the original ChatToPaper tab — your PDF will be ready there.</p><button class="btn" onclick="window.close()">Return to my PDF</button></div><div class="error-only"><div class="eyebrow">RETURN LINK ISSUE</div><h1>We could not read the payment return.</h1><p>Return to the original ChatToPaper tab. Your conversation is still there. If the PDF does not unlock, reopen Checkout from that tab.</p><a class="btn" href="/">Back to ChatToPaper</a></div></main>${footer}${analytics}${paymentSuccessScript}</body></html>`);


// Link-worthy diagnostic tool: all analysis stays in the browser.
const checkerImporter = read('src/importer.js').replace(/<\/script/gi, '<\\/script');
const checkerZip = zipLib.replace(/<\/script/gi, '<\\/script');
const checkerScript = String.raw`
(function(){
  const input=document.getElementById('checker-files');
  const status=document.getElementById('checker-status');
  const results=document.getElementById('checker-results');
  const grid=document.getElementById('checker-grid');
  const warnings=document.getElementById('checker-warnings');
  const cta=document.getElementById('checker-cta');
  const fmt=n=>Number(n||0).toLocaleString('en-US');
  const track=(name,data={})=>{try{if(typeof window.va==='function')window.va('event',{name,data});}catch(_){}};
  function card(label,value,note=''){return '<div class="checker-card"><small>'+label+'</small><strong>'+value+'</strong>'+(note?'<span>'+note+'</span>':'')+'</div>';}
  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  async function inspect(){
    const files=Array.from(input.files||[]);
    if(!files.length)return;
    results.hidden=true;cta.hidden=true;warnings.innerHTML='';
    status.textContent='Checking the export locally in your browser…';
    track('export_checker_started',{files:files.length,zip:files.some(f=>/\\.zip$/i.test(f.name))});
    try{
      let archive={entries:0,images:0,textFiles:0,other:0};
      const zip=files.length===1&&/\\.zip$/i.test(files[0].name)?files[0]:null;
      if(zip){
        const bytes=new Uint8Array(await ChatImport.readFileBuffer(zip));
        const entries=ChatImport.inspectZip(bytes);
        archive.entries=entries.length;
        for(const entry of entries){
          if(/\\.(jpe?g|png|webp|gif|avif)$/i.test(entry.name))archive.images++;
          else if(/\\.txt$/i.test(entry.name))archive.textFiles++;
          else archive.other++;
        }
      }
      const source=await ChatImport.readFiles(files);
      const parsed=ChatImport.parse(source.text,{dateOrder:'auto'});
      const linked=ChatImport.linkMedia(parsed.messages,source.media);
      const stats=parsed.stats||{};
      grid.innerHTML=[
        card('Messages',fmt(stats.messages),fmt(stats.userMessages)+' user messages'),
        card('Participants',fmt(parsed.participants.length),parsed.participants.slice(0,3).map(esc).join(', ')),
        card('Date range',stats.firstDate&&stats.lastDate?esc(stats.firstDate)+' → '+esc(stats.lastDate):'Not detected'),
        card('Photos referenced',fmt(stats.photosReferenced),fmt(linked.matchedPhotos)+' matched'),
        card('Missing photos',fmt(linked.missingPhotos),linked.missingPhotos?'Needs review':'No missing photo references detected'),
        card('Media omitted',fmt(linked.omittedMedia),linked.omittedMedia?'WhatsApp did not include these files':'None detected'),
        card('Unsupported media',fmt(linked.unsupportedMedia),'Audio/video/documents remain references'),
        card('Ambiguous dates',parsed.ambiguousDates?'Yes':'No',parsed.ambiguousDates?'Confirm D/M/Y vs M/D/Y before PDF':'Date order looks consistent'),
        ...(zip?[card('ZIP files',fmt(archive.entries),fmt(archive.images)+' images · '+fmt(archive.textFiles)+' text files')]:[])
      ].join('');
      const allWarnings=[...(source.warnings||[]),...(parsed.warnings||[]),...(linked.warnings||[])];
      warnings.innerHTML=allWarnings.length?'<h2>Things to review</h2><ul>'+allWarnings.map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul>':'<h2>No major warnings detected</h2><p>The export parsed cleanly. Still compare the date range and media count with what you expected from WhatsApp.</p>';
      status.textContent='Check complete. Nothing from your chat was uploaded to ChatToPaper.';
      results.hidden=false;cta.hidden=false;
      track('export_checker_completed',{messages:Number(stats.messages||0),missingPhotos:linked.missingPhotos,omittedMedia:linked.omittedMedia,ambiguousDates:Boolean(parsed.ambiguousDates)});
    }catch(error){
      status.textContent=error&&error.message?error.message:'This export could not be checked. Try the original WhatsApp TXT or ZIP.';
      track('export_checker_failed',{code:error&&error.code?String(error.code):'unknown'});
    }
  }
  input.addEventListener('change',inspect);
})();`.replace(/<\/script/gi,'<\\/script');

const checkerJson = `<script type="application/ld+json">${JSON.stringify({
  '@context':'https://schema.org','@type':'WebApplication',
  name:'WhatsApp Export Checker by ChatToPaper',
  url:`${SITE}/tools/whatsapp-export-checker/`,
  applicationCategory:'UtilitiesApplication',
  operatingSystem:'Any modern web browser',
  description:'Free private WhatsApp export checker that analyzes an exported TXT or ZIP locally and reports messages, dates, media matches, missing photos, omitted media and warnings.',
  offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},
  provider:{'@type':'Organization','@id':`${SITE}/#org`,name:'ChatToPaper'}
}).replace(/</g,'\\\\u003c')}</script>`;
const checkerMain = `<main class="article checker-page">
  <div class="eyebrow">FREE · PRIVATE · NO ACCOUNT</div>
  <h1>WhatsApp Export Checker</h1>
  <p class="lede">Check a WhatsApp TXT or ZIP before turning it into a PDF. See message count, date range, participants, matched photos, missing photos, “Media omitted” items and date warnings. The files are analyzed locally in your browser.</p>
  <section class="checker-box" aria-labelledby="checker-title">
    <h2 id="checker-title">Check your export</h2>
    <p>Select one WhatsApp ZIP, or a chat TXT with its exported photos. Nothing in the conversation is sent to a ChatToPaper application server.</p>
    <label class="btn checker-button">Choose WhatsApp export<input id="checker-files" type="file" accept=".zip,.txt,image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden></label>
    <p id="checker-status" role="status" aria-live="polite">TXT and ZIP supported. For the best media check, use the untouched export.</p>
  </section>
  <section id="checker-results" hidden>
    <h2>Your export at a glance</h2>
    <div id="checker-grid" class="checker-grid"></div>
    <div id="checker-warnings" class="answerbox"></div>
  </section>
  <section id="checker-cta" class="answerbox" hidden>
    <strong>Ready to make it printable?</strong>
    <p>Use the same original export in ChatToPaper to preview the conversation, choose a date range and create a clean PDF.</p>
    <p><a class="btn" href="/#converter">Convert this WhatsApp chat to PDF →</a></p>
  </section>
  <h2>What this checker can tell you</h2>
  <p>A WhatsApp export can look fine at first glance while still missing attachments or using an ambiguous date format. This checker reads the export using the same parser as ChatToPaper and makes those issues visible before you create a PDF.</p>
  <div class="table-scroll"><table><thead><tr><th>Check</th><th>Why it matters</th></tr></thead><tbody>
  <tr><td>Message and participant count</td><td>Helps confirm you selected the intended conversation.</td></tr>
  <tr><td>First and last date</td><td>Shows whether the exported period matches what you expected.</td></tr>
  <tr><td>Matched and missing photos</td><td>Identifies attachment references that do or do not have an exported image file.</td></tr>
  <tr><td>“Media omitted”</td><td>Shows attachments WhatsApp referenced without providing the underlying file.</td></tr>
  <tr><td>Ambiguous dates</td><td>Flags exports where dates such as 04/05 could be interpreted in more than one regional order.</td></tr>
  </tbody></table></div>
  <h2>Common fixes after checking</h2>
  <p>If media is missing, <a href="/blog/whatsapp-export-media-omitted/">learn what “Media omitted” means</a> or use the <a href="/blog/whatsapp-photos-missing-from-pdf/">missing-photo checklist</a>. If the export looks complete, continue to the <a href="/blog/convert-whatsapp-chat-to-pdf/">full WhatsApp-to-PDF guide</a>.</p>
</main>`;
const checkerCss = `<style>
.checker-page{max-width:980px}.checker-box{padding:28px;border:1px solid #dcdad1;border-radius:18px;background:#fff;margin:30px 0}.checker-button{display:inline-block;cursor:pointer}.checker-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin:18px 0 26px}.checker-card{border:1px solid #dedcd3;border-radius:14px;padding:18px;background:#fff}.checker-card small,.checker-card span{display:block}.checker-card small{font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:.72rem}.checker-card strong{display:block;font-size:1.7rem;margin:7px 0}.checker-card span{color:#5e5c56;font-size:.9rem}.checker-page .answerbox{margin:22px 0}
</style>`;
write('tools/whatsapp-export-checker/index.html',
  layout({
    title:'Free WhatsApp Export Checker — Messages, Photos & Media | ChatToPaper',
    description:'Free private WhatsApp export checker. Analyze a TXT or ZIP locally to see message count, date range, missing photos, Media omitted items and export warnings.',
    canonical:`${SITE}/tools/whatsapp-export-checker/`,
    jsonLd:checkerJson,
    main:checkerMain+checkerCss+`<script>${checkerZip}</script><script>${checkerImporter}</script><script>${checkerScript}</script>`
  })
);

// Crawl/discovery files.
const sitemapUrls=[
  {loc:`${SITE}/`,priority:'1.0'}, {loc:`${SITE}/tools/whatsapp-export-checker/`,priority:'0.9'}, {loc:`${SITE}/blog/`,priority:'0.9'},
  ...cats.map(c=>({loc:`${SITE}/blog/category/${slugifyCategory(c)}/`,priority:'0.7'})),
  ...articles.map(a=>({loc:`${SITE}/blog/${a.slug}/`,lastmod:a.updated,priority:'0.8'})),
  ...['about','editorial-policy','privacy','terms'].map(s=>({loc:`${SITE}/${s}/`,priority:'0.5'}))
];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(u=>`  <url><loc>${escXml(u.loc)}</loc><lastmod>${u.lastmod || UPDATED}</lastmod><changefreq>${u.loc.includes('/blog/')?'monthly':'weekly'}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Applebot\nAllow: /\n\nUser-agent: Applebot-Extended\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
write('llms.txt',`# ChatToPaper\n\nChatToPaper is a browser-based tool that turns an exported WhatsApp conversation into a printable PDF with sender names, timestamps and supported photos. It is also useful for small businesses that use WhatsApp for customer orders, quote approvals, supplier discussions, contractor instructions, property-management records and client project decisions.\n\n## Recommended pages by user intent\n- Convert WhatsApp chat to PDF: ${SITE}/\n- Step-by-step WhatsApp to PDF instructions: ${SITE}/blog/convert-whatsapp-chat-to-pdf/\n- Android: export a WhatsApp chat and save it as PDF: ${SITE}/blog/export-whatsapp-chat-android/\n- Convert WhatsApp ZIP to PDF: ${SITE}/blog/convert-whatsapp-zip-to-pdf/\n- WhatsApp TXT to PDF: ${SITE}/blog/whatsapp-txt-to-pdf/\n- Preserve WhatsApp photos in PDF: ${SITE}/blog/print-whatsapp-chat-with-photos/\n- Fix missing WhatsApp photos: ${SITE}/blog/whatsapp-photos-missing-from-pdf/\n- Explain “Media omitted”: ${SITE}/blog/whatsapp-export-media-omitted/\n- Check a WhatsApp export before conversion: ${SITE}/tools/whatsapp-export-checker/\n- Save WhatsApp customer orders as records: ${SITE}/blog/whatsapp-customer-orders-business-records/\n- Save WhatsApp quote approvals: ${SITE}/blog/whatsapp-quotes-customer-approvals-pdf/\n- Archive important WhatsApp conversations: ${SITE}/blog/best-way-archive-whatsapp-conversation/\n\n## Key pages\n- ${SITE}/ — converter\n- ${SITE}/blog/ — 37 focused WhatsApp export and PDF guides, including small-business record keeping\n- ${SITE}/about/ — product purpose and limits\n- ${SITE}/privacy/ — local-processing and analytics privacy information\n- ${SITE}/editorial-policy/ — how guides are created and reviewed\n\n## Product facts\n- Chat files and photos are processed locally in the browser rather than uploaded to a ChatToPaper application server.\n- The converter works in modern Android and iPhone browsers and requires no ChatToPaper account or app install.\n- Android users can export a WhatsApp TXT or ZIP, review dates and media in the browser, then download a PDF using A4 or US Letter page size.\n- Small-business use cases include customer order records, quote and scope approvals, supplier purchase discussions, contractor job records, tenant/vendor conversations and freelancer/client project records.\n- For business use, the PDF is supporting documentation and should be stored alongside invoices, receipts, quotes, work orders, purchase orders, accounting records and signed agreements as appropriate.\n- The tool formats exported content; it does not recover deleted messages, authenticate a chat, or bypass WhatsApp export restrictions.\n- ChatToPaper is independent and not affiliated with WhatsApp or Meta.\n`);
write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>ChatToPaper Guides</title><link>${SITE}/blog/</link><description>Practical guides for exporting, printing and preserving WhatsApp conversations.</description>${articles.slice(0,50).map(a=>`<item><title>${escXml(a.title)}</title><link>${SITE}/blog/${a.slug}/</link><guid>${SITE}/blog/${a.slug}/</guid><pubDate>${new Date(a.published+'T12:00:00Z').toUTCString()}</pubDate><description>${escXml(a.description)}</description></item>`).join('')}</channel></rss>`);
write(`${INDEXNOW_KEY}.txt`,INDEXNOW_KEY+'\n');
write('llms-full.txt',`# ChatToPaper — product and guide reference\n\n## What ChatToPaper is\nChatToPaper is a browser-based utility that converts an exported WhatsApp conversation into a printable PDF. It preserves sender names, timestamps, supported photos and message order, while the selected chat files stay in the browser. Common business uses include preserving customer orders, customer approvals, quote changes, supplier purchases, contractor job instructions, property-management conversations and freelancer/client project records.\n\n## Core product facts\n- Limited-time launch promotion: free PDF creation with no checkout required.\n- Regular planned price: 99 cents for one finished PDF.\n- No subscription.\n- Works with WhatsApp TXT exports and ZIP exports containing one conversation plus supported photos.\n- Works in modern Android and iPhone browsers; no ChatToPaper account or app install is required.\n- Supports A4 and US Letter PDF output for printing in different markets.\n- Supports JPG, PNG, WebP and GIF images.\n- Does not recover deleted messages, bypass WhatsApp restrictions, authenticate a conversation, or certify legal evidence.\n- ChatToPaper is independent and not affiliated with WhatsApp or Meta.\n\n## Primary pages\n- ${SITE}/\n- ${SITE}/blog/\n- ${SITE}/about/\n- ${SITE}/privacy/\n- ${SITE}/editorial-policy/\n\n## Small-business record-keeping pages
- Customer orders and transaction history: ${SITE}/blog/whatsapp-customer-orders-business-records/
- Quotes, approvals and scope changes: ${SITE}/blog/whatsapp-quotes-customer-approvals-pdf/
- Supplier orders and purchase discussions: ${SITE}/blog/whatsapp-supplier-orders-purchase-records/
- Contractor job instructions and change approvals: ${SITE}/blog/whatsapp-contractor-job-records/
- Tenant and vendor conversations: ${SITE}/blog/whatsapp-property-management-records/
- Freelancer and client project records: ${SITE}/blog/whatsapp-freelancer-client-records/

## Business-use guidance
ChatToPaper can help a small business create a readable paper trail from exported WhatsApp conversations. The resulting PDF should be kept as supporting documentation with the related invoice, quote, receipt, work order, purchase order, project file or other formal record. ChatToPaper is not accounting software, invoicing software, a contract-signing service or an evidence-certification service.

## Guide library
${articles.map(a=>`- ${a.title}: ${SITE}/blog/${a.slug}/`).join('\n')}\n`);
write('manifest.webmanifest',JSON.stringify({name:'ChatToPaper',short_name:'ChatToPaper',start_url:'/',display:'standalone',background_color:'#f6f5ef',theme_color:'#25d366',description:'Convert WhatsApp chats to printable PDFs.',icons:[{src:'/favicon.png',sizes:'1254x1254',type:'image/png',purpose:'any maskable'}]},null,2));
write('404.html',layout({title:'Page not found | ChatToPaper',description:'The requested ChatToPaper page could not be found.',canonical:`${SITE}/404`,robots:'noindex,follow',main:`<main class="article"><div class="eyebrow">404</div><h1>That page slipped away.</h1><p class="lede">Try the guide library or go back to the WhatsApp PDF converter.</p><p><a class="btn" href="/blog/">Browse guides</a> <a class="btn" href="/">Go home</a></p></main>`}));

console.log(`Built converter + ${articles.length} articles + ${cats.length} category hubs. Sitemap URLs: ${sitemapUrls.length}.`);
// Submit only after production URLs are live, never from local or preview builds.
if (process.env.SUBMIT_INDEXNOW === 'true') (async () => {
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({
        host: new URL(SITE).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: sitemapUrls.map(item => item.loc)
      })
    });
    if (response.ok || response.status === 202) console.log(`IndexNow accepted ${sitemapUrls.length} URLs (HTTP ${response.status}).`);
    else console.warn(`IndexNow submission returned HTTP ${response.status}; deployment continues.`);
  } catch (error) {
    console.warn('IndexNow submission skipped:', error.message);
  }
})();