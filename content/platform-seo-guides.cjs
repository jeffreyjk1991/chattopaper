'use strict';

const UPDATED='2026-10-30';

const platforms=[
  {
    key:'telegram', name:'Telegram', hub:'telegram',
    format:'Telegram Desktop JSON export',
    upload:'JSON or ZIP containing result.json',
    export:'Use Telegram Desktop → Settings → Advanced → Export Telegram data, or export an individual chat, and choose JSON.',
    media:'Supported exported photos can be matched when their files are included in the export.',
    limitation:'HTML exports are for viewing and are not the structured format ChatToPaper currently parses.',
    core:'telegram-chat-to-pdf',
    official:'https://telegram.org/blog/export-and-more',
    hubTitle:'Telegram PDF, Print & Archive Guides',
    hubDescription:'Export Telegram chats with Telegram Desktop, print or convert them to PDF, preserve timestamps and archive conversations from the supported JSON source.'
  },
  {
    key:'instagram', name:'Instagram', hub:'instagram',
    format:'Instagram message JSON from Meta Accounts Center',
    upload:'downloaded ZIP containing message JSON',
    export:'Use Meta Accounts Center → Download your information, select Instagram messages, and choose JSON.',
    media:'Supported Instagram photos can be preserved when the downloaded archive includes the image files referenced by the message data.',
    limitation:'Choose JSON rather than HTML. Some disappearing or unavailable content may not be present in the downloaded archive.',
    core:'instagram-dm-to-pdf',
    official:'https://www.facebook.com/help/accountscenter/',
    hubTitle:'Instagram DM Archive & PDF Guides',
    hubDescription:'Download Instagram message data, save or archive DM conversations, print chats and convert supported JSON exports to PDF.'
  },
  {
    key:'messenger', name:'Messenger', hub:'messenger',
    format:'Messenger message JSON from Meta Accounts Center',
    upload:'downloaded ZIP containing message JSON',
    export:'Use Meta Accounts Center or Facebook Download Your Information, select Messages, and choose JSON.',
    media:'Supported photos can be matched when they are included in the Meta download and referenced by the message JSON.',
    limitation:'A Meta download can contain several conversations and multiple message_N.json parts; ChatToPaper groups supported parts by thread.',
    core:'messenger-chat-to-pdf',
    official:'https://www.facebook.com/help/accountscenter/',
    hubTitle:'Messenger Print, Archive & PDF Guides',
    hubDescription:'Download Messenger conversations from Meta, print or archive a chat and convert supported message JSON to a readable PDF.'
  },
  {
    key:'imessage', name:'iMessage', hub:'imessage',
    format:'Apple Messages chat.db or sms.db',
    upload:'chat.db or sms.db',
    export:'On a Mac, copy the Messages database from your user Library (commonly ~/Library/Messages/chat.db) to a location you can select in the browser.',
    media:'This version focuses on text stored in the Apple Messages database.',
    limitation:'Apple Messages attachments are not imported from chat.db in the current version. Preserve the original Messages library or backup when attachments matter.',
    core:'imessage-to-pdf',
    official:'https://support.apple.com/guide/messages/welcome/mac',
    hubTitle:'iMessage Archive & PDF Guides',
    hubDescription:'Learn how to archive iMessage conversations, save iPhone messages without screenshots, print a chat and create a PDF from a supported Apple Messages database.'
  },
  {
    key:'sms', name:'SMS', hub:'sms',
    format:'SMS Backup & Restore XML or Apple Messages database',
    upload:'SMS XML, chat.db or sms.db',
    export:'On Android, create an SMS Backup & Restore compatible XML backup. On Apple devices, use an available Messages database copy.',
    media:'The current SMS workflow focuses on text-message content and timestamps.',
    limitation:'MMS attachments are not imported from SMS XML in the current version.',
    core:'sms-to-pdf',
    official:'',
    hubTitle:'SMS Archive & PDF Guides',
    hubDescription:'Archive SMS and text-message conversations, print message threads and create a PDF from supported Android XML or Apple Messages database sources.'
  }
];

const archiveSeo={
  telegram:{
    title:'How to Archive a Telegram Chat (Export + PDF)',
    seoTitle:'How to Archive a Telegram Chat — Export, Save & PDF | ChatToPaper',
    keyword:'telegram archiver, archive telegram chat, telegram archive conversation, telegram pdf',
    description:'Archive a Telegram chat by exporting it from Telegram Desktop, keeping the original JSON/HTML copy and creating a readable PDF for printing or long-term reference.',
    answer:'Telegram Desktop has an official Export chat history feature. For a durable archive, keep that original export and create a separate PDF copy for easier reading, printing and sharing.',
    faq:[
      ['How do I archive a Telegram chat?','Use Telegram Desktop → Export chat history for one chat, or Settings → Advanced → Export Telegram data. Keep the original export and optionally create a PDF copy for convenient reading.'],
      ['Can Telegram export a chat as JSON?','Yes. Telegram Desktop can export chat data in machine-readable JSON as well as human-readable HTML. ChatToPaper uses the supported JSON export.'],
      ['Can I archive Telegram messages with photos?','Telegram exports can include photos and other media. ChatToPaper can place supported exported photos when the files are present in the export.']
    ]
  },
  instagram:{
    title:'How to Archive an Instagram DM Conversation',
    seoTitle:'How to Archive Instagram DMs — Download & Save a Conversation | ChatToPaper',
    keyword:'archive instagram conversation, archive instagram dm, save instagram chat, download instagram conversation',
    description:'Archive an Instagram DM conversation by downloading message data from Meta Accounts Center, keeping the original export and creating a readable PDF copy when needed.',
    answer:'For a durable Instagram DM archive, download your message data from Meta Accounts Center, keep the original archive unchanged, and create a PDF copy for easier reading or printing.',
    faq:[
      ['How do I archive an Instagram DM conversation?','Download your Instagram message data from Meta Accounts Center, keep the original archive as the source copy, and make a PDF derivative for reading or printing.'],
      ['How do I download an Instagram conversation?','Use Meta Accounts Center → Download your information, select Instagram messages and choose JSON when you want ChatToPaper to parse the export.'],
      ['Can I save an Instagram chat as PDF?','Yes, when you have a supported Instagram message export. ChatToPaper can read supported message JSON locally in your browser and create a PDF.']
    ]
  },
  messenger:{
    title:'How to Archive a Facebook Messenger Conversation',
    seoTitle:'How to Archive Messenger Chats — Download & Save Conversations | ChatToPaper',
    keyword:'archive messenger conversation, save facebook messenger chat, print messenger messages',
    description:'Archive a Facebook Messenger conversation by downloading message data from Meta, preserving the original JSON and creating a readable PDF copy for reference.',
    answer:'Download your Messenger message data from Meta, keep the original archive intact, and create a separate PDF copy when you want a readable or printable record.',
    faq:[
      ['How do I archive a Messenger conversation outside Facebook?','Download your message data from Meta, preserve the original archive and create a PDF copy for reading or printing.'],
      ['Can I print a Facebook Messenger conversation?','Yes. After downloading a supported message export, ChatToPaper can format one selected conversation into a printable PDF.'],
      ['Can ChatToPaper combine long Messenger exports?','Supported numbered message JSON parts from the same conversation folder are grouped before the preview is created.']
    ]
  },
  imessage:{
    title:'How to Archive iMessage Conversations',
    seoTitle:'How to Archive iMessage Conversations on iPhone or Mac | ChatToPaper',
    keyword:'archive imessage, how to archive imessage, imessage archive chat, archive iphone messages, archive imessage conversation',
    description:'Can you archive iMessage conversations? Learn how to preserve iPhone and Mac Messages using the original Messages database or backup plus a readable PDF copy.',
    answer:'Apple Messages does not provide a separate archive folder for conversations. For a durable iMessage archive, preserve the original Messages database or backup and create a separate PDF copy for easier reading, printing and sharing.',
    faq:[
      ['Can you archive iMessage conversations?','Apple Messages does not provide a separate archive folder for chats. Preserve the original Messages database or backup, and use a PDF copy when you want an easy-to-read archive.'],
      ['How do I archive iMessages on iPhone?','Keep the iPhone Messages data in a backup or synced Mac Messages library. ChatToPaper can read a supported Apple Messages chat.db or sms.db copy and turn one conversation into a PDF.'],
      ['How do I archive an iMessage chat without screenshots?','Use a supported Apple Messages database instead of capturing dozens of screenshots. ChatToPaper reads the source locally, lets you choose a conversation and creates the PDF in the browser.'],
      ['Can I archive iPhone text messages with timestamps?','Yes for supported source data. ChatToPaper preserves available message order, sender labels and stored timestamps in the PDF preview.']
    ]
  },
  sms:{
    title:'How to Archive SMS & Text Messages',
    seoTitle:'How to Archive SMS & Text Messages on Android or iPhone | ChatToPaper',
    keyword:'sms archive, archive sms, archive text messages, archive iphone text messages, sms transcript',
    description:'Archive SMS and text messages from Android or iPhone by keeping the original backup source and creating a readable PDF copy with dates and sender labels.',
    answer:'For a durable SMS archive, keep the original phone backup or message export and create a PDF derivative for reading, printing and sharing. ChatToPaper supports common Android SMS XML and Apple Messages database sources.',
    faq:[
      ['How do I archive SMS messages?','Keep the original SMS backup or Messages database as the source copy, then create a PDF version for convenient reading and printing.'],
      ['Can I archive text messages from Android?','Yes. ChatToPaper supports the common SMS Backup & Restore XML layout and can turn a selected conversation into a PDF.'],
      ['Can I archive iPhone text messages?','For messages stored in Apple Messages, ChatToPaper can read a supported chat.db or sms.db database copy and create a PDF of one conversation.']
    ]
  }
};


const intents=[
  {
    id:'export',
    title:p=>`How to Export ${p.name} Messages for PDF`,
    slug:p=>`export-${p.key}-messages-for-pdf`,
    keyword:p=>`export ${p.name.toLowerCase()} messages pdf`,
    answer:p=>`${p.export} Then upload the supported export to ChatToPaper, choose the conversation if prompted, preview it, and save the PDF.`
  },
  {
    id:'print',
    title:p=>`How to Print a ${p.name} Conversation`,
    slug:p=>`print-${p.key}-conversation`,
    keyword:p=>`print ${p.name.toLowerCase()} conversation`,
    answer:p=>`Export the conversation in ${p.format}, open it in ChatToPaper, verify names and dates, then create a PDF and print that file. This is cleaner than stitching screenshots for long conversations.`
  },
  {
    id:'dates',
    title:p=>`How to Save ${p.name} Messages as PDF With Dates and Times`,
    slug:p=>`${p.key}-messages-pdf-dates-times`,
    keyword:p=>`${p.name.toLowerCase()} messages pdf dates times`,
    answer:p=>`Use the timestamps already stored in the ${p.format}. ChatToPaper keeps supported exported timestamps visible and lets you narrow the final document by date range without editing the source export.`
  },
  {
    id:'archive',
    title:p=>archiveSeo[p.key]?.title || `Best Way to Archive a ${p.name} Conversation`,
    slug:p=>`archive-${p.key}-conversation`,
    keyword:p=>archiveSeo[p.key]?.keyword || `archive ${p.name.toLowerCase()} conversation`,
    description:p=>archiveSeo[p.key]?.description || `Keep the original ${p.name} export and a readable PDF copy for long-term reference.`,
    answer:p=>archiveSeo[p.key]?.answer || `Keep both the original ${p.format} and a readable PDF. The source export is your preservation copy; the PDF is the convenient version for reading, printing and sharing.`,
    seoTitle:p=>archiveSeo[p.key]?.seoTitle,
    faq:p=>archiveSeo[p.key]?.faq || null
  },
  {
    id:'privacy',
    title:p=>`Is It Safe to Convert ${p.name} Messages to PDF?`,
    slug:p=>`safe-${p.key}-to-pdf`,
    keyword:p=>`safe ${p.name.toLowerCase()} pdf converter`,
    answer:p=>`Prefer a workflow that explains what leaves the device. ChatToPaper parses supported ${p.name} files locally in the browser; chat contents are not uploaded to the ChatToPaper application server.`
  },
  {
    id:'troubleshooting',
    title:p=>`Why a ${p.name} Export Will Not Convert to PDF`,
    slug:p=>`${p.key}-export-wont-convert-pdf`,
    keyword:p=>`${p.name.toLowerCase()} export wont convert pdf`,
    answer:p=>`Start with the original export and confirm it is in the supported format: ${p.upload}. ${p.limitation} If the preview shows zero messages, create a fresh export before changing the file.`
  }
];

function buildGuide(p,intent){
  return {
    platform:p.key,
    platformName:p.name,
    hub:p.hub,
    slug:intent.slug(p),
    title:intent.title(p),
    keyword:intent.keyword(p),
    answer:intent.answer(p),
    description:intent.description ? intent.description(p) : intent.answer(p),
    seoTitle:intent.seoTitle ? intent.seoTitle(p) : null,
    faq:intent.faq ? intent.faq(p) : null,
    intent:intent.id,
    updated:intent.id==='archive'?'2026-11-17':UPDATED,
    format:p.format,
    upload:p.upload,
    export:p.export,
    media:p.media,
    limitation:p.limitation,
    core:p.core,
    official:p.official,
    hubTitle:p.hubTitle,
    hubDescription:p.hubDescription
  };
}

const guides=platforms.flatMap(p=>intents.map(i=>buildGuide(p,i)));

module.exports={UPDATED,platforms,intents,guides};
