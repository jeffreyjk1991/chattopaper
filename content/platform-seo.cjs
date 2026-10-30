'use strict';

const platforms=[
  {
    key:'telegram', name:'Telegram', possessive:'Telegram', hubSlug:'telegram-chat-to-pdf',
    input:'a Telegram JSON export (usually result.json) or a ZIP containing that JSON and exported media',
    formatName:'Telegram JSON', formatSlug:'telegram-json-to-pdf',
    exportSummary:'Use Telegram Desktop. Open one chat and choose Export chat history, or use Settings > Advanced > Export Telegram data for a broader export. Choose machine-readable JSON for ChatToPaper.',
    mediaSummary:'Telegram can include photos and other media in the export. ChatToPaper can place supported exported photos in the PDF; video, audio and other files remain references rather than printable media.',
    limitation:'Telegram chat export is a desktop workflow. The mobile and web clients do not provide the same full chat-history export flow.',
    business:'client discussions, group decisions, project updates and customer conversations',
    troubleshoot:'If ChatToPaper cannot find a conversation, confirm that the export is JSON rather than HTML and that result.json is still present. For a ZIP, keep the original folder structure so media paths remain meaningful.',
    official:'https://telegram.org/blog/export-and-more'
  },
  {
    key:'instagram', name:'Instagram DMs', short:'Instagram', possessive:'Instagram', hubSlug:'instagram-dm-to-pdf',
    input:'an Instagram message export downloaded as JSON, normally inside the original Meta ZIP',
    formatName:'Instagram message JSON', formatSlug:'instagram-json-to-pdf',
    exportSummary:'Use Meta Accounts Center and Export your information. Select the Instagram profile, request Messages, and choose JSON rather than HTML when you want ChatToPaper to parse the archive.',
    mediaSummary:'Meta message archives can include photos referenced by the conversation JSON. ChatToPaper can match supported exported images when they are present in the archive.',
    limitation:'Instagram does not provide a one-chat PDF button. The account export can contain many conversations, so ChatToPaper asks you to choose a thread after upload when needed.',
    business:'customer inquiries, order discussions, creator collaborations, approvals and client conversations',
    troubleshoot:'If a DM thread is missing, check the date range and information types chosen in Meta’s export. If the ZIP was rearranged or individual message JSON files were separated from their folders, create a fresh export and keep it intact.',
    official:'https://www.facebook.com/help/accountscenter/'
  },
  {
    key:'messenger', name:'Facebook Messenger', short:'Messenger', possessive:'Messenger', hubSlug:'messenger-chat-to-pdf',
    input:'a Facebook or Messenger message export downloaded as JSON, normally inside the original Meta ZIP',
    formatName:'Messenger message JSON', formatSlug:'messenger-json-to-pdf',
    exportSummary:'Use Meta Accounts Center and Export your information, select Messages and choose JSON. Download the completed archive without renaming or reorganizing its conversation folders.',
    mediaSummary:'Messenger exports can include photos and other attachments alongside message JSON. ChatToPaper can place supported exported photos when the archive contains them.',
    limitation:'Messenger does not export one conversation directly as a styled PDF. A Meta data archive may contain many threads and multiple JSON parts for a long conversation.',
    business:'customer support, Marketplace discussions, project approvals, order details and service conversations',
    troubleshoot:'If a long Messenger thread looks incomplete, keep all numbered message JSON parts from the same conversation folder. ChatToPaper groups supported parts from that folder before building the preview.',
    official:'https://www.facebook.com/help/accountscenter/'
  },
  {
    key:'imessage', name:'iMessage', possessive:'iMessage', hubSlug:'imessage-to-pdf',
    input:'an Apple Messages chat.db or sms.db SQLite database copied from a Mac Messages library or a compatible local backup',
    formatName:'Apple Messages chat.db', formatSlug:'apple-messages-chat-db-to-pdf',
    exportSummary:'Apple does not provide a simple “Export this iMessage chat” command on iPhone. ChatToPaper reads the Messages database available on a Mac or in a compatible local backup and then lets you choose one conversation.',
    mediaSummary:'ChatToPaper currently focuses on message text, senders and timestamps from the Apple Messages database. Attachments stored outside chat.db are not imported in this version.',
    limitation:'You need access to a readable Apple Messages database. ChatToPaper does not connect to your iPhone, iCloud account or encrypted device backup.',
    business:'customer texts, appointment details, project decisions, contractor discussions and important personal records',
    troubleshoot:'If a database opens but some message bodies are absent, those messages may use an Apple rich-text representation that cannot be decoded reliably. ChatToPaper warns rather than inventing missing text.',
    official:'https://support.apple.com/guide/messages/welcome/mac'
  },
  {
    key:'sms', name:'SMS text messages', short:'SMS', possessive:'SMS', hubSlug:'sms-to-pdf',
    input:'an SMS Backup & Restore XML file from Android, or an Apple Messages chat.db/sms.db database for SMS stored in Messages',
    formatName:'SMS backup XML', formatSlug:'sms-backup-xml-to-pdf',
    exportSummary:'On Android, create an SMS Backup & Restore-style XML backup. For SMS stored in Apple Messages, ChatToPaper can also read a compatible chat.db or sms.db database.',
    mediaSummary:'The SMS workflow is text-message focused. MMS attachments from XML or Apple Messages are not imported in this version.',
    limitation:'There is no single universal SMS export format across every phone. ChatToPaper currently supports the common SMS Backup & Restore XML layout plus Apple Messages databases.',
    business:'appointment confirmations, customer instructions, delivery details, contractor updates and transaction-related text threads',
    troubleshoot:'If an XML file is not recognized, confirm it is an SMS Backup & Restore-style backup containing sms elements. CSV, screenshots and carrier statements are different formats and are not treated as message exports.',
    official:'https://support.apple.com/guide/messages/set-up-messages-ichte16154fb/mac'
  }
];

const intents=[
  {
    key:'export', suffix:'export-messages',
    title:p=>`How to Export ${p.name} Messages`,
    keyword:p=>`export ${(p.short||p.name).toLowerCase()} messages`,
    description:p=>`Export ${p.name} messages in a format ChatToPaper can read, choose the conversation when needed, and keep a source copy before creating a PDF.`,
    answer:p=>p.exportSummary
  },
  {
    key:'print', suffix:'print-conversation',
    title:p=>`How to Print a ${p.name} Conversation`,
    keyword:p=>`print ${(p.short||p.name).toLowerCase()} conversation`,
    description:p=>`Turn an exported ${p.name} conversation into a paginated PDF with names and timestamps, then print the PDF instead of stitching screenshots.`,
    answer:p=>`First get ${p.input}. Open it in ChatToPaper, select the conversation, review the date range and preview, then download a PDF and print that file from your browser or PDF viewer.`
  },
  {
    key:'timestamps', suffix:'messages-with-dates-times',
    title:p=>`How to Save ${p.name} Messages With Dates and Times`,
    keyword:p=>`${(p.short||p.name).toLowerCase()} messages dates times pdf`,
    description:p=>`Preserve exported ${p.name} message order, sender labels, dates and times in a readable PDF without manually retyping timestamps.`,
    answer:p=>`Use the timestamps already present in the ${p.name} source data. ChatToPaper reads those exported values, shows them in the preview and lets you narrow the final PDF by date range.`
  },
  {
    key:'media', suffix:'messages-with-photos',
    title:p=>p.key==='imessage'||p.key==='sms'?`How to Export ${p.name} Without Screenshots`:`How to Export ${p.name} Messages With Photos`,
    keyword:p=>p.key==='imessage'||p.key==='sms'?`export ${(p.short||p.name).toLowerCase()} without screenshots`:`${(p.short||p.name).toLowerCase()} messages photos pdf`,
    description:p=>p.key==='imessage'||p.key==='sms'
      ?`Create a text-based PDF from supported ${p.name} source data instead of capturing a long conversation as dozens of screenshots.`
      :`Keep supported exported photos with ${p.name} messages by using the original archive and checking media matches before downloading the PDF.`,
    answer:p=>p.mediaSummary
  },
  {
    key:'archive', suffix:'archive-conversation',
    title:p=>`Best Way to Archive ${p.name} Conversations`,
    keyword:p=>`archive ${(p.short||p.name).toLowerCase()} conversation`,
    description:p=>`Keep the original ${p.name} source export plus a readable PDF copy so you have both source data and an easy document for reading or printing.`,
    answer:p=>`For a durable archive, keep the original ${p.name} export unchanged and create a separate PDF for convenient reading. Do not treat the PDF as a replacement for the source file when provenance matters.`
  },
  {
    key:'privacy', suffix:'pdf-converter-privacy',
    title:p=>`Is It Safe to Convert ${p.name} Messages to PDF?`,
    keyword:p=>`safe ${(p.short||p.name).toLowerCase()} pdf converter`,
    description:p=>`Understand what should stay local when converting ${p.name} messages to PDF and what metadata ChatToPaper records for anonymous site analytics.`,
    answer:p=>`ChatToPaper processes the selected ${p.name} conversation files in your browser rather than uploading their message contents to the application server. Review the finished PDF before sharing it because the PDF itself can contain private information.`
  },
  {
    key:'business', suffix:'customer-conversations-pdf-records',
    title:p=>`How to Save ${p.name} Customer Conversations as PDF Records`,
    keyword:p=>`${(p.short||p.name).toLowerCase()} customer conversation pdf records`,
    description:p=>`Turn relevant ${p.name} customer or project conversations into readable supporting records while keeping the original export alongside formal business documents.`,
    answer:p=>`Export the conversation that contains the relevant ${p.business}, convert only the needed date range to PDF, and store it with the related invoice, quote, work order or project file. The PDF is supporting documentation, not a substitute for formal records.`
  },
  {
    key:'format', suffix:null,
    title:p=>`How to Convert ${p.formatName} to PDF`,
    keyword:p=>`${p.formatName.toLowerCase()} to pdf`,
    description:p=>`Open ${p.formatName} in ChatToPaper, select the conversation when needed, verify names and timestamps, and download a clean PDF.`,
    answer:p=>`ChatToPaper recognizes ${p.input}. It parses the conversation locally, normalizes the messages into the same preview used by the other supported platforms, and creates a printable PDF.`
  },
  {
    key:'troubleshooting', suffix:'export-not-working',
    title:p=>`Why a ${p.name} Export Is Not Working in a PDF Converter`,
    keyword:p=>`${(p.short||p.name).toLowerCase()} export not working pdf`,
    description:p=>`Troubleshoot an unreadable or incomplete ${p.name} export by checking the source format, archive structure, date scope and known media limitations.`,
    answer:p=>p.troubleshoot
  }
];

function slugFor(p,intent){
  if(intent.key==='format')return p.formatSlug;
  const base=(p.short||p.name).toLowerCase().replace(/facebook /g,'').replace(/dms/g,'dm').replace(/text messages/g,'sms').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return `${base}-${intent.suffix}`;
}

function sectionsFor(p,intent){
  const common=[
    ['What ChatToPaper expects',`For this workflow, start with ${p.input}. ChatToPaper reads the selected source locally in the browser, turns the supported message data into a normalized conversation, and shows a preview before the PDF is created.`],
    ['How to get the source data',p.exportSummary],
    ['What to verify before download',`Check the conversation title, sender labels, first and last dates, message count and any warnings in the preview. ${p.mediaSummary}`],
    ['Known limitation',p.limitation]
  ];
  const byIntent={
    export:[
      ['Why export first',`A structured export is easier to review than screenshots because message order and timestamps come from the source data rather than from image recognition. Keep the original export unchanged so you can return to it later.`],
      ...common,
      ['After the export',`Once the source is ready, open ChatToPaper, choose the file, select the conversation if the export contains several threads, and create the PDF only after the preview matches what you expected.`]
    ],
    print:[
      ['Why PDF is easier to print',`A long conversation rarely fits neatly into screenshots. A generated PDF provides page breaks, consistent margins, readable sender labels and a document that standard print dialogs understand.`],
      ...common,
      ['Printing checklist',`Choose A4 or US Letter to match the printer, preview page count, and print a short test range before committing to a very long conversation.`]
    ],
    timestamps:[
      ['Use source timestamps',`Do not add dates manually if the export already contains them. ChatToPaper preserves supported source timestamps and uses them for date filtering and message ordering.`],
      ...common,
      ['Timezone note',p.key==='instagram'||p.key==='messenger'
        ?'Meta exports use absolute timestamps. ChatToPaper currently displays those exported times in UTC rather than guessing the device timezone.'
        :p.key==='imessage'||p.key==='sms'
          ?'Apple and SMS backup timestamps are normalized from their stored values. Review a few known messages in the preview before relying on the printed clock time.'
          :'Telegram JSON contains exported date values. Review a few known messages so the printed time matches the context you expect.']
    ],
    media:[
      ['Why screenshots are not the source',`Screenshots can be useful for a few messages, but they become difficult to order, search and print for a long thread. A structured export lets the document be built from message data instead of OCR.`],
      ...common,
      ['Media expectations',p.mediaSummary]
    ],
    archive:[
      ['Keep two layers',`A useful archive has two layers: the original source export and a PDF presentation copy. The source is better for preserving the original data structure; the PDF is better for reading, printing and sharing.`],
      ...common,
      ['Storage practice',`Use descriptive filenames and store the PDF beside the original export. If the conversation contains sensitive information, protect the storage location and avoid uploading it to services you do not trust.`]
    ],
    privacy:[
      ['What stays in the browser',`The selected message file is read by JavaScript in the page. ChatToPaper does not send the message text, photos, filenames or contact names to its application backend just to create the PDF.`],
      ['Anonymous conversion analytics',`When a PDF is generated, ChatToPaper can record coarse country or region, referral or campaign source, landing page and device type. Raw IP addresses and conversation contents are not stored in that conversion record.`],
      ...common,
      ['Before sharing',`The finished PDF can contain private names, message text and dates. Review the actual output and remove unnecessary scope with date filters before sending it to another person.`]
    ],
    business:[
      ['Good business use cases',`${p.name} can contain ${p.business}. A date-bounded PDF can make those discussions easier to file with the transaction or project they belong to.`],
      ...common,
      ['What the PDF is not',`The PDF is supporting documentation. It does not replace invoices, receipts, signed agreements, accounting records, purchase orders or other formal records your business may need.`]
    ],
    format:[
      ['What this file contains',`${p.formatName} is the structured source ChatToPaper uses for this platform. The converter reads supported message fields from that source rather than trying to reconstruct the conversation from screenshots.`],
      ...common,
      ['Why keep the original',`The PDF is a readable derivative. Keep the ${p.formatName} source separately when you may need to reconvert, verify dates or preserve the original export structure.`]
    ],
    troubleshooting:[
      ['Start with the original export',p.troubleshoot],
      ...common,
      ['When to create a fresh export',`If the file was edited, renamed, split apart or partially downloaded, make a fresh export before debugging the PDF. A clean source removes the most common cause of confusing parser failures.`]
    ]
  };
  return byIntent[intent.key]||common;
}

function faqFor(p,intent){
  const items=[
    [`Are my ${p.name} messages uploaded to ChatToPaper?`,`No. The selected conversation files are processed locally in your browser for conversion. Anonymous site and conversion analytics do not include the message contents.`],
    [`What file should I use for ${p.name}?`,`Use ${p.input}.`],
    [`Can ChatToPaper recover deleted ${p.name} messages?`,`No. It formats supported data that is present in the source you provide. It cannot recover deleted messages or invent missing media.`]
  ];
  if(intent.key==='media')items.push([`Will every attachment appear in the PDF?`,p.mediaSummary]);
  if(intent.key==='business')items.push(['Is the PDF an authenticated business record?','No. It is a readable presentation of the source export and should be kept as supporting documentation alongside formal records.']);
  return items;
}

const guides=[];
for(const p of platforms){
  for(const intent of intents){
    const slug=slugFor(p,intent);
    guides.push({
      platformKey:p.key,platformName:p.name,hubSlug:p.hubSlug,slug,
      title:intent.title(p),keyword:intent.keyword(p),description:intent.description(p),answer:intent.answer(p),
      sections:sectionsFor(p,intent),faq:faqFor(p,intent),official:p.official,
      input:p.input,published:'2026-10-30',updated:'2026-10-30'
    });
  }
}

module.exports={platforms,intents,guides};
