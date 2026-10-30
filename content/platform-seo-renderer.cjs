'use strict';

module.exports=function renderPlatformSeo({SITE,layout,write,escapeHtml,platformGuides}){
  const {platforms,guides}=require('./platform-seo-guides.cjs');

  function articleHtml(g){
    const canonical=\`\${SITE}/blog/\${g.slug}/\`;
    const p=platforms.find(x=>x.key===g.platform);
    const siblings=guides.filter(x=>x.platform===g.platform&&x.slug!==g.slug).slice(0,6);
    const jsonLd=\`<script type="application/ld+json">\${JSON.stringify({
      '@context':'https://schema.org','@type':'BlogPosting',
      headline:g.title,description:g.description,datePublished:g.updated,dateModified:g.updated,
      mainEntityOfPage:canonical,inLanguage:'en-US',keywords:g.keyword,
      author:{'@id':\`\${SITE}/#org\`},publisher:{'@id':\`\${SITE}/#org\`},
      isPartOf:{'@type':'Blog',name:'ChatToPaper Guides',url:\`\${SITE}/blog/\`},
      about:[{'@type':'Thing',name:g.platformName},{'@type':'Thing',name:'chat to PDF'}]
    }).replace(/</g,'\\u003c')}</script><script type="application/ld+json">\${JSON.stringify({
      '@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'Home',item:\`\${SITE}/\`},
        {'@type':'ListItem',position:2,name:'Guides',item:\`\${SITE}/blog/\`},
        {'@type':'ListItem',position:3,name:\`\${g.platformName} guides\`,item:\`\${SITE}/blog/platform/\${g.hub}/\`},
        {'@type':'ListItem',position:4,name:g.title,item:canonical}
      ]
    }).replace(/</g,'\\u003c')}</script>\`;

    const faq=[
      [\`What file should I use for \${g.platformName}?\`,\`Use \${g.upload}.\`],
      [\`Are my \${g.platformName} messages uploaded?\`,\`No. ChatToPaper processes supported conversation files locally in your browser rather than uploading their message contents to the application server.\`],
      [\`Can ChatToPaper recover deleted \${g.platformName} messages?\`,\`No. It formats supported data present in the source you provide and cannot recover deleted messages or invent missing content.\`]
    ];
    const faqJson=\`<script type="application/ld+json">\${JSON.stringify({
      '@context':'https://schema.org','@type':'FAQPage',
      mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))
    }).replace(/</g,'\\u003c')}</script>\`;

    const intentIntro={
      export:'A structured export is more dependable than screenshots because message order and timestamps come from the platform data. Keep the original export unchanged, then make a separate PDF for reading and printing.',
      print:'For long conversations, a generated PDF is easier to print than dozens of screenshots. It gives you predictable page breaks, margins, sender labels and a file that standard print dialogs understand.',
      dates:'Dates and times are most useful when they come from the source export instead of being retyped. Review a few known messages in the preview before treating the finished PDF as a record.',
      archive:'A strong archive keeps two layers: the original source export and a readable PDF derivative. The source preserves the original structure; the PDF is easier to browse and share.',
      privacy:'Conversation files can contain highly personal information. A privacy-conscious workflow should minimize what leaves the device and clearly separate chat contents from anonymous site analytics.',
      troubleshooting:'When conversion fails, start with the original export rather than repeatedly editing the same file. A fresh, intact source removes the most common causes of parser and media problems.'
    }[g.intent];

    const main=\`<main class="article">
      <div class="crumbs"><a href="/">Home</a> / <a href="/blog/">Guides</a> / <a href="/blog/platform/\${g.hub}/">\${escapeHtml(g.platformName)}</a></div>
      <div class="eyebrow">\${escapeHtml(g.platformName.toUpperCase())} · Updated <time datetime="\${g.updated}">\${new Date(g.updated+'T00:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</time></div>
      <h1>\${escapeHtml(g.title)}</h1>
      <p class="meta">By <a href="/about/">ChatToPaper</a> · <a href="/editorial-policy/">How we review guides</a></p>
      <p class="lede">\${escapeHtml(g.description)}</p>
      <div class="answerbox"><strong>Short answer</strong><p>\${escapeHtml(g.answer)}</p></div>
      <h2>Why this workflow works</h2><p>\${escapeHtml(intentIntro)}</p>
      <h2>Get the right source file</h2><p>\${escapeHtml(g.export)}</p><p><strong>Supported input:</strong> \${escapeHtml(g.upload)}.</p>
      <h2>Open it in ChatToPaper</h2>
      <ol class="steps"><li>Keep the original export intact.</li><li>Choose the supported file on the ChatToPaper homepage.</li><li>If the source contains several conversations, select the thread you actually need.</li><li>Review sender names, first and last dates, message count and warnings.</li><li>Choose the date range and layout, then download the PDF.</li></ol>
      <h2>Media and attachment expectations</h2><p>\${escapeHtml(g.media)}</p>
      <h2>Platform-specific limitation</h2><p>\${escapeHtml(g.limitation)}</p>
      <h2>What to verify before saving</h2>
      <div class="trust"><div><strong>Conversation</strong><p>Make sure the correct thread is selected and the beginning and end match what you expected.</p></div><div><strong>Dates & senders</strong><p>Check several known messages so names and timestamps make sense in context.</p></div><div><strong>Warnings</strong><p>Review any missing-content or unsupported-media notice instead of assuming the PDF is complete.</p></div></div>
      <h2>What the PDF can and cannot prove</h2><p>The PDF is a readable presentation of the supported source data. It does not authenticate who sent a message, recover deleted content, or certify the conversation as legal evidence. Preserve the original export when provenance matters.</p>
      <div class="callout"><strong>Create the PDF now</strong><p>ChatToPaper supports \${escapeHtml(g.platformName)} alongside WhatsApp, Telegram, Instagram, Messenger, iMessage and SMS through the same private browser-based converter.</p><a class="btn" href="/#converter">Convert \${escapeHtml(g.platformName)} to PDF</a></div>
      <h2>More \${escapeHtml(g.platformName)} guides</h2><div class="related"><a href="/blog/\${p.core}/">Complete \${escapeHtml(g.platformName)} to PDF guide</a>\${siblings.map(s=>\`<a href="/blog/\${s.slug}/">\${escapeHtml(s.title)}</a>\`).join('')}</div>
      <h2>Questions</h2>\${faq.map(([q,a])=>\`<h3>\${escapeHtml(q)}</h3><p>\${escapeHtml(a)}</p>\`).join('')}
      <p class="source">This page is part of ChatToPaper’s platform-specific guide library. We use a shared editorial framework, but each page is written around the export format, limitations and workflow of the named platform rather than simply swapping keywords. See our <a href="/editorial-policy/">editorial policy</a>.</p>
    </main>\`;

    return layout({title:\`\${g.title} | ChatToPaper\`,description:g.description,canonical,main,type:'article',jsonLd:jsonLd+faqJson});
  }

  for(const g of guides)write(\`blog/\${g.slug}/index.html\`,articleHtml(g));

  const hubLinks=[];
  for(const p of platforms){
    const children=guides.filter(g=>g.platform===p.key);
    const canonical=\`\${SITE}/blog/platform/\${p.hub}/\`;
    const main=\`<main class="wrap"><section class="hero"><div class="eyebrow">PLATFORM GUIDES</div><h1>\${escapeHtml(p.name)} → PDF guides</h1><p>Export, print, archive and troubleshoot \${escapeHtml(p.name)} conversations using the source formats ChatToPaper actually supports.</p><p><a class="btn" href="/blog/\${p.core}/">Start with the complete \${escapeHtml(p.name)} guide →</a></p></section><section class="grid">\${children.map(g=>\`<article class="card"><small>\${escapeHtml(g.intent)}</small><h2>\${escapeHtml(g.title)}</h2><p>\${escapeHtml(g.answer)}</p><a href="/blog/\${g.slug}/">Read guide →</a></article>\`).join('')}</section></main>\`;
    write(\`blog/platform/\${p.hub}/index.html\`,layout({title:\`\${p.name} to PDF Guides | ChatToPaper\`,description:\`Practical guides for exporting, printing, archiving and converting \${p.name} conversations to PDF with ChatToPaper.\`,canonical,main}));
    hubLinks.push({key:p.key,name:p.name,hub:p.hub,href:\`/blog/platform/\${p.hub}/\`});
  }

  return {guides,platforms,hubLinks};
};
