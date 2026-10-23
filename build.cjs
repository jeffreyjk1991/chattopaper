/* Build ChattoPaper: converter + crawlable guide library. */
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const SITE = 'https://chattopaper.vercel.app';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const readResolved = spec => fs.readFileSync(require.resolve(spec, { paths: [root] }), 'utf8');
const data = (file, type) => `data:${type};base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const escXml = escapeHtml;
const articles = require('./content/articles.cjs');
const blogCss = read('src/blog.css');
const analytics = `<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script><script defer src="/_vercel/speed-insights/script.js"></script>`;
const favicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23274339'/%3E%3Cpath d='M20 17h24v30H20z' fill='%23f6f5ef'/%3E%3Cpath d='M26 26h12m-12 6h12m-12 6h7' stroke='%23274339' stroke-width='3'/%3E%3C/svg%3E`;

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
if (/\/\*__[A-Z_]+__\*\//.test(html)) throw new Error('Unresolved build marker');
fs.rmSync(out(), {recursive:true, force:true});
fs.mkdirSync(out(), {recursive:true});
write('index.html', html);
write('ChattoPaper.html', html);
fs.mkdirSync(out('assets'),{recursive:true});
fs.copyFileSync(path.join(root,'assets','coast.svg'),out('assets','coast.svg'));

const nav = `<div class="topbar"><div class="wrap nav"><a class="brand" href="/">ChattoPaper.</a><div class="navlinks"><a href="/blog/">Guides</a><a href="/about/">About</a><a href="/editorial-policy/">Editorial policy</a><a class="btn" href="/#converter">Create your PDF</a></div></div></div>`;
const footer = `<footer class="footer"><div class="wrap"><span>ChattoPaper — WhatsApp chats, beautifully on paper.</span><span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/editorial-policy/">Editorial policy</a> · Independent tool, not affiliated with WhatsApp or Meta.</span></div></footer>`;
function baseHead({title,description,canonical,type='website',jsonLd=''}){
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f5ef"><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${canonical}"><link rel="alternate" type="application/rss+xml" title="ChattoPaper Blog" href="${SITE}/feed.xml"><meta property="og:type" content="${type}"><meta property="og:site_name" content="ChattoPaper"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary"><link rel="icon" href="${favicon}"><title>${escapeHtml(title)}</title><style>${blogCss}</style>${jsonLd}`;
}
function layout({title,description,canonical,main,type='website',jsonLd=''}){
  return `<!doctype html><html lang="en"><head>${baseHead({title,description,canonical,type,jsonLd})}</head><body>${nav}${main}${footer}${analytics}</body></html>`;
}
function slugifyCategory(cat){return cat.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function relatedFor(article){
  const same=articles.filter(a=>a.category===article.category&&a.slug!==article.slug);
  const other=articles.filter(a=>a.category!==article.category&&a.slug!==article.slug);
  return [...same,...other].slice(0,4);
}
function stepsFor(a){
  const byCategory={
    'iPhone':['Open the WhatsApp conversation you want to preserve.','Use Export Chat and choose whether photos should be included.','Save the TXT/ZIP somewhere accessible from a full browser.','Import the export into ChattoPaper and confirm dates, messages and photo count.','Preview the pages, then create the PDF when the result looks right.'],
    'Android':['Open the conversation in WhatsApp on Android.','Choose More options → More → Export chat.','Choose Include media when the final document needs photos.','Open the export in ChattoPaper and review the parsed date range and media matches.','Preview the printable pages before creating the PDF.'],
    'Photos & media':['Export the chat with media rather than text only.','Keep the transcript and image files together; do not rename them first.','Import the ZIP or TXT plus photos as one conversation.','Compare the matched-photo count and inspect any missing-media warnings.','Review several photo-heavy pages before creating the final PDF.'],
    'Printing & formatting':['Import the exported conversation and choose the dates you actually need.','Pick A4 or US Letter to match the printer or print service.','Choose chat bubbles for a keepsake or transcript style for density.','Inspect page count, text size, photo scale and page breaks.','Print one or two test pages before committing to a long physical copy.'],
    'Troubleshooting':['Start from the original WhatsApp export rather than a modified copy.','Check whether the source is a readable TXT or a complete ZIP.','Confirm the converter reports messages and dates before adjusting formatting.','Resolve date or media warnings instead of ignoring them.','If the file is unusually large or damaged, create a fresh smaller export and try again.'],
    'Privacy & records':['Decide what portion of the conversation you truly need to preserve or share.','Keep the original export unchanged when provenance may matter.','Prefer local processing for sensitive conversations and review the service privacy statement.','Preview names, photos, dates and any sensitive details before creating the PDF.','Store and share the finished file according to the sensitivity of its contents.'],
    'Use cases':['Choose the specific period or event that gives the conversation meaning.','Export with media if the surrounding photos are part of the story.','Use a title and layout appropriate to the purpose: keepsake, record or gift.','Preview the full document and remove unnecessary scope with date filters.','Keep the original export in addition to the polished PDF.'],
    'Comparisons & decisions':['Start with your primary goal: printing, archiving, editing, evidence review or gifting.','Compare privacy, photo support, readability, cost and file portability.','Test the workflow on a small export before committing a large conversation.','Prefer tools that show a preview and clear warnings before download.','Keep the original WhatsApp export regardless of the final format you choose.'],
    'Search questions':['Export one conversation from WhatsApp using the built-in export feature.','Include media if photos need to appear in the finished document.','Open the exported TXT or ZIP in a compatible browser-based converter.','Check dates, sender names, message count and media warnings in the preview.','Create the PDF and keep the original export as a separate source copy.'],
    'Convert & save':['Export the WhatsApp conversation you want to keep.','Choose Include Media if the photos are important to the final document.','Import the TXT/ZIP into ChattoPaper without renaming the media files.','Set the date range and confirm the preview matches the conversation.','Create the PDF and keep the source export separately for future use.']
  };
  return byCategory[a.category] || byCategory['Convert & save'];
}
function categoryAdvice(a){
  const advice={
    'Convert & save':`The export is the source; the PDF is the presentation layer. That distinction matters. A polished PDF can be easier to read and print, but it should not replace the original TXT/ZIP when you want a faithful archive. ChattoPaper uses the export to reconstruct a readable document and keeps the original message order rather than trying to recreate the WhatsApp app interface pixel for pixel.`,
    'iPhone':`On iPhone, the main friction is usually the share sheet: users export correctly but then lose track of where the ZIP or TXT was saved. Save it to Files or another location you can find again, then open ChattoPaper in Safari or another full browser. An embedded attachment preview may block the file picker even when the website itself is working.`,
    'Android':`Android exports are straightforward, but the exact share destination can change how the files are packaged. The important pieces are the conversation TXT and, when selected, the media files. Keep them together until conversion so attachment filenames can still be matched to the transcript.`,
    'Photos & media':`Media matching is where many chat converters fail. A responsible tool should not guess. If the transcript references an image that is missing, duplicated, unsupported or unreadable, the document should say so and preserve a placeholder. That makes the preview honest and prevents a polished-looking PDF from hiding missing context.`,
    'Printing & formatting':`Good print formatting is a tradeoff between density and comfort. Bigger text and larger photos look better but use more pages. A transcript layout is efficient; chat bubbles feel more personal. There is no universally “best” format, which is why previewing the actual page breaks is more valuable than a generic promise about beautiful output.`,
    'Troubleshooting':`When a conversion fails, avoid repeatedly modifying the same archive. A fresh export removes many unknowns. Good parsers also fail loudly on damaged ZIPs, unreadable text, conflicting date formats and ambiguous duplicate filenames rather than silently producing a misleading document.`,
    'Privacy & records':`A conversation can contain information about people who never chose to publish it. Limit the scope you process and share. ChattoPaper is designed so the selected chat files stay in your browser; Vercel analytics measures site usage and Stripe handles checkout separately, without receiving the contents of the chat files you select.`,
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
function sourceNote(a){
  const advanced=a.slug==='whatsapp-advanced-chat-privacy-export';
  return advanced
    ? `<p class="source"><strong>Official reference:</strong> WhatsApp explains that Advanced Chat Privacy can prevent chat exporting. <a href="https://faq.whatsapp.com/715385484388016/" rel="noopener">Read WhatsApp’s Advanced Chat Privacy help</a>.</p>`
    : `<p class="source"><strong>Official reference:</strong> WhatsApp’s export guidance describes Export chat and the choice to export with or without media. <a href="https://faq.whatsapp.com/1180414079177245/" rel="noopener">Read WhatsApp’s export help</a>.</p>`;
}
function articleHtml(a){
  const canonical=`${SITE}/blog/${a.slug}/`;
  const rel=relatedFor(a);
  const jsonLd=`<script type="application/ld+json">${JSON.stringify({
    '@context':'https://schema.org','@type':'BlogPosting',headline:a.title,description:a.description,datePublished:a.published,dateModified:a.updated,
    mainEntityOfPage:canonical,author:{'@type':'Organization',name:'ChattoPaper'},publisher:{'@type':'Organization',name:'ChattoPaper'},
    about:a.keyword,articleSection:a.category
  }).replace(/</g,'\\u003c')}</script><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},{'@type':'ListItem',position:2,name:'Guides',item:`${SITE}/blog/`},{'@type':'ListItem',position:3,name:a.title,item:canonical}
  ]}).replace(/</g,'\\u003c')}</script>`;
  const steps=stepsFor(a).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const pitfalls=pitfallsFor(a).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const related=rel.map(r=>`<a href="/blog/${r.slug}/">${escapeHtml(r.title)}</a>`).join('');
  const main=`<main class="article"><div class="crumbs"><a href="/">Home</a> / <a href="/blog/">Guides</a> / ${escapeHtml(a.category)}</div><div class="eyebrow">${escapeHtml(a.category)} · Updated October 22, 2026</div><h1>${escapeHtml(a.title)}</h1><p class="lede">${escapeHtml(a.description)}</p><div class="answerbox"><strong>Short answer</strong><p>${escapeHtml(a.answer)}</p></div><h2>What matters most</h2><p>${escapeHtml(categoryAdvice(a))}</p><p>For this specific question — <strong>${escapeHtml(a.keyword)}</strong> — the practical goal is not to make the export look exactly like the WhatsApp app. The goal is a document that is complete enough to understand, honest about anything missing, and predictable when printed or shared.</p><h2>A dependable workflow</h2><ol class="steps">${steps}</ol><h2>What to verify in the preview</h2><div class="trust"><div><strong>Messages</strong><p>Check that the conversation starts and ends where you expect and that multiline messages remain together.</p></div><div><strong>Dates & senders</strong><p>Confirm the date order, timestamp style and participant names before treating the PDF as a record.</p></div><div><strong>Photos</strong><p>Compare the matched-photo count with your expectation and investigate placeholders before download.</p></div></div><h2>Common mistakes to avoid</h2><ul>${pitfalls}</ul><h2>What the PDF can and cannot prove</h2><p>A formatted PDF is useful for reading, printing and sharing, but it is not a forensic export. ChattoPaper does not recover deleted messages, bypass WhatsApp restrictions, authenticate who sent a message, or certify a conversation as legal evidence. If authenticity or admissibility matters, preserve the original files and get advice appropriate to your situation.</p><div class="callout"><strong>Want to make the document now?</strong><p>ChattoPaper lets you import one WhatsApp export, choose a date range, preview the pages and create a printable PDF with supported photos. The selected chat files are processed locally in your browser.</p><a class="btn" href="/#converter">Create your WhatsApp PDF</a></div>${sourceNote(a)}<h2>Related guides</h2><div class="related">${related}</div><p class="source">This page is part of ChattoPaper’s focused guide library. We use AI-assisted drafting for structure and breadth, then check claims against the behavior of ChattoPaper and official product documentation. See our <a href="/editorial-policy/">editorial policy</a>.</p></main>`;
  return layout({title:`${a.title} | ChattoPaper`,description:a.description,canonical,main,type:'article',jsonLd});
}

// Blog index and category hubs.
const cats=[...new Set(articles.map(a=>a.category))];
const catNav=cats.map(c=>`<a href="/blog/category/${slugifyCategory(c)}/">${escapeHtml(c)}</a>`).join('');
const cards=articles.map(a=>`<article class="card"><small>${escapeHtml(a.category)}</small><h2>${escapeHtml(a.title)}</h2><p>${escapeHtml(a.answer)}</p><a href="/blog/${a.slug}/">Read guide →</a></article>`).join('');
const blogJson=`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:'ChattoPaper WhatsApp PDF Guides',url:`${SITE}/blog/`,description:'100 practical guides about exporting, printing and preserving WhatsApp conversations.'}).replace(/</g,'\\u003c')}</script>`;
write('blog/index.html',layout({title:'WhatsApp PDF Guides — Export, Print & Preserve Chats | ChattoPaper',description:'100 practical guides for converting WhatsApp chats to PDF, printing conversations with photos, exporting on iPhone and Android, troubleshooting, privacy and archiving.',canonical:`${SITE}/blog/`,jsonLd:blogJson,main:`<main class="wrap"><section class="hero"><div class="eyebrow">100 PRACTICAL GUIDES</div><h1>WhatsApp chats,<br>made easier to keep.</h1><p>Answer-first guides for exporting, converting, printing and preserving WhatsApp conversations. Built around real tasks rather than keyword stuffing.</p><div class="category-nav">${catNav}</div></section><section class="grid">${cards}</section></main>`}));
for(const cat of cats){
  const subset=articles.filter(a=>a.category===cat);
  const catCards=subset.map(a=>`<article class="card"><small>${escapeHtml(a.category)}</small><h2>${escapeHtml(a.title)}</h2><p>${escapeHtml(a.answer)}</p><a href="/blog/${a.slug}/">Read guide →</a></article>`).join('');
  const slug=slugifyCategory(cat), canonical=`${SITE}/blog/category/${slug}/`;
  write(`blog/category/${slug}/index.html`,layout({title:`${cat} WhatsApp Guides | ChattoPaper`,description:`Practical ChattoPaper guides about ${cat.toLowerCase()} for WhatsApp conversations, exports and printable PDFs.`,canonical,main:`<main class="wrap"><section class="hero"><div class="eyebrow">GUIDE CATEGORY</div><h1>${escapeHtml(cat)}</h1><p>${subset.length} focused guides for this part of the WhatsApp-to-PDF workflow.</p><div class="category-nav">${catNav}</div></section><section class="grid">${catCards}</section></main>`}));
}
for(const a of articles) write(`blog/${a.slug}/index.html`,articleHtml(a));

function infoPage(slug,title,description,body){
  write(`${slug}/index.html`,layout({title:`${title} | ChattoPaper`,description,canonical:`${SITE}/${slug}/`,main:`<main class="article"><div class="crumbs"><a href="/">Home</a> / ${escapeHtml(title)}</div>${body}</main>`}));
}
infoPage('about','About ChattoPaper','What ChattoPaper does, how the WhatsApp-to-PDF converter works and the limits of the service.',`<div class="eyebrow">ABOUT CHATTOPAPER</div><h1>A small tool for conversations worth keeping.</h1><p class="lede">ChattoPaper turns an exported WhatsApp conversation into a readable, printable PDF with sender names, timestamps and supported photos in context.</p><h2>Why it exists</h2><p>WhatsApp can export a conversation, but the result is designed as data rather than a polished document. ChattoPaper focuses on the last mile: turning that export into pages that are easier to read, print or save.</p><h2>Privacy by design</h2><p>The selected chat text and photos are processed in your browser. They are not uploaded to a ChattoPaper application server. Vercel Web Analytics and Speed Insights measure site usage and performance, while Stripe handles checkout separately; neither is sent the contents of the WhatsApp files you select.</p><h2>What it does not do</h2><p>ChattoPaper does not recover deleted messages, bypass WhatsApp privacy restrictions, authenticate chat history or certify legal evidence. It formats the export you provide and warns when media is missing or unsupported.</p><h2>Independent product</h2><p>ChattoPaper is independent and is not affiliated with, endorsed by or sponsored by WhatsApp or Meta.</p>`);
infoPage('editorial-policy','Editorial policy','How ChattoPaper creates, reviews and updates its WhatsApp export and PDF guides, including AI-assisted drafting disclosure.',`<div class="eyebrow">EDITORIAL POLICY</div><h1>Useful first. Search second.</h1><p class="lede">Our guide library is built to answer practical questions people have while exporting, printing and preserving conversations.</p><h2>How articles are created</h2><p>ChattoPaper uses AI-assisted drafting to help organize topics and produce consistent first drafts at scale. We do not publish pages simply by swapping keywords. Each guide targets a distinct user question and includes a direct answer, a task-specific workflow, limitations, preview checks and related resources.</p><h2>How claims are checked</h2><p>Product-behavior claims are checked against the current ChattoPaper implementation. WhatsApp workflow claims are grounded in WhatsApp’s public Help Center. We avoid claims that a formatted PDF can recover deleted messages, bypass export restrictions, authenticate a chat or guarantee legal admissibility.</p><h2>Updates</h2><p>Pages show an updated date. We revise guides when WhatsApp export behavior, browser capabilities or ChattoPaper functionality materially changes.</p><h2>Corrections</h2><p>If a guide is wrong, the goal is to correct the page rather than preserve old wording for ranking purposes. The site’s primary purpose is the WhatsApp-to-PDF workflow and closely related questions.</p>`);
infoPage('privacy','Privacy','ChattoPaper privacy information: local chat processing, Vercel analytics and Stripe checkout.',`<div class="eyebrow">PRIVACY</div><h1>Your chat files stay in your browser.</h1><p class="lede">ChattoPaper is designed so the WhatsApp export you select is processed locally in the browser instead of being uploaded to an application server.</p><h2>Conversation contents</h2><p>Your selected TXT, ZIP and supported image files are read in the page. Replacing or clearing the conversation releases the app’s references to those files; closing the tab ends that browser session.</p><h2>Analytics</h2><p>ChattoPaper uses Vercel Web Analytics and Speed Insights to understand visits and site performance. Those services do not receive the contents of the WhatsApp files you select for conversion.</p><h2>Payments</h2><p>Stripe handles checkout separately. ChattoPaper does not send your conversation text or photos to Stripe.</p><h2>Your finished PDF</h2><p>The PDF you create can contain personal information from the conversation. Review it before saving, printing or sharing it.</p>`);
infoPage('terms','Terms','Terms for using ChattoPaper to format an exported WhatsApp conversation into a printable PDF.',`<div class="eyebrow">TERMS</div><h1>Using ChattoPaper.</h1><p class="lede">Use ChattoPaper only with conversation files you are entitled to process and share.</p><h2>A formatting tool</h2><p>ChattoPaper formats data present in your export. It does not guarantee that WhatsApp included every message or media file, recover deleted material, authenticate messages, or certify legal evidence.</p><h2>Review before relying</h2><p>Check the preview, date interpretation, sender names and missing-media warnings before using the finished document.</p><h2>Payments</h2><p>The intended product is a one-time payment per finished PDF, with no subscription. Stripe handles the payment experience separately from the local chat-processing workflow.</p><h2>Independence</h2><p>ChattoPaper is not affiliated with, endorsed by or sponsored by WhatsApp or Meta. WhatsApp and related marks belong to their respective owners.</p>`);

// Crawl/discovery files.
const sitemapUrls=[
  {loc:`${SITE}/`,priority:'1.0'}, {loc:`${SITE}/blog/`,priority:'0.9'},
  ...cats.map(c=>({loc:`${SITE}/blog/category/${slugifyCategory(c)}/`,priority:'0.7'})),
  ...articles.map(a=>({loc:`${SITE}/blog/${a.slug}/`,priority:'0.8'})),
  ...['about','editorial-policy','privacy','terms'].map(s=>({loc:`${SITE}/${s}/`,priority:'0.5'}))
];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(u=>`  <url><loc>${escXml(u.loc)}</loc><lastmod>2026-10-22</lastmod><changefreq>${u.loc.includes('/blog/')?'monthly':'weekly'}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
write('llms.txt',`# ChattoPaper\n\nChattoPaper is a browser-based tool that turns an exported WhatsApp conversation into a printable PDF with sender names, timestamps and supported photos.\n\n## Key pages\n- ${SITE}/ — converter\n- ${SITE}/blog/ — 100 practical WhatsApp export and PDF guides\n- ${SITE}/about/ — product purpose and limits\n- ${SITE}/privacy/ — local-processing and analytics privacy information\n- ${SITE}/editorial-policy/ — how guides are created and reviewed\n\n## Product facts\n- Chat files and photos are processed locally in the browser.\n- The tool formats exported content; it does not recover deleted messages, authenticate a chat, or bypass WhatsApp export restrictions.\n- ChattoPaper is independent and not affiliated with WhatsApp or Meta.\n`);
write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>ChattoPaper Guides</title><link>${SITE}/blog/</link><description>Practical guides for exporting, printing and preserving WhatsApp conversations.</description>${articles.slice(0,50).map(a=>`<item><title>${escXml(a.title)}</title><link>${SITE}/blog/${a.slug}/</link><guid>${SITE}/blog/${a.slug}/</guid><pubDate>Thu, 22 Oct 2026 12:00:00 GMT</pubDate><description>${escXml(a.description)}</description></item>`).join('')}</channel></rss>`);
write('manifest.webmanifest',JSON.stringify({name:'ChattoPaper',short_name:'ChattoPaper',start_url:'/',display:'standalone',background_color:'#f6f5ef',theme_color:'#274339',description:'Convert WhatsApp chats to printable PDFs.'},null,2));
write('404.html',layout({title:'Page not found | ChattoPaper',description:'The requested ChattoPaper page could not be found.',canonical:`${SITE}/404`,main:`<main class="article"><div class="eyebrow">404</div><h1>That page slipped away.</h1><p class="lede">Try the guide library or go back to the WhatsApp PDF converter.</p><p><a class="btn" href="/blog/">Browse guides</a> <a class="btn" href="/">Go home</a></p></main>`}));

console.log(`Built converter + ${articles.length} articles + ${cats.length} category hubs. Sitemap URLs: ${sitemapUrls.length}.`);