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
    core:'telegram-chat-to-pdf'
  },
  {
    key:'instagram', name:'Instagram', hub:'instagram',
    format:'Instagram message JSON from Meta Accounts Center',
    upload:'downloaded ZIP containing message JSON',
    export:'Use Meta Accounts Center → Download your information, select Instagram messages, and choose JSON.',
    media:'Supported Instagram photos can be preserved when the downloaded archive includes the image files referenced by the message data.',
    limitation:'Choose JSON rather than HTML. Some disappearing or unavailable content may not be present in the downloaded archive.',
    core:'instagram-dm-to-pdf'
  },
  {
    key:'messenger', name:'Messenger', hub:'messenger',
    format:'Messenger message JSON from Meta Accounts Center',
    upload:'downloaded ZIP containing message JSON',
    export:'Use Meta Accounts Center or Facebook Download Your Information, select Messages, and choose JSON.',
    media:'Supported photos can be matched when they are included in the Meta download and referenced by the message JSON.',
    limitation:'A Meta download can contain several conversations and multiple message_N.json parts; ChatToPaper groups supported parts by thread.',
    core:'messenger-chat-to-pdf'
  },
  {
    key:'imessage', name:'iMessage', hub:'imessage',
    format:'Apple Messages chat.db or sms.db',
    upload:'chat.db or sms.db',
    export:'On a Mac, copy the Messages database from your user Library (commonly ~/Library/Messages/chat.db) to a location you can select in the browser.',
    media:'This version focuses on text stored in the Apple Messages database.',
    limitation:'Apple Messages attachments are not imported from chat.db in the current version. Preserve the original Messages library or backup when attachments matter.',
    core:'imessage-to-pdf'
  },
  {
    key:'sms', name:'SMS', hub:'sms',
    format:'SMS Backup & Restore XML or Apple Messages database',
    upload:'SMS XML, chat.db or sms.db',
    export:'On Android, create an SMS Backup & Restore compatible XML backup. On Apple devices, use an available Messages database copy.',
    media:'The current SMS workflow focuses on text-message content and timestamps.',
    limitation:'MMS attachments are not imported from SMS XML in the current version.',
    core:'sms-to-pdf'
  }
];

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
    title:p=>`Best Way to Archive a ${p.name} Conversation`,
    slug:p=>`archive-${p.key}-conversation`,
    keyword:p=>`archive ${p.name.toLowerCase()} conversation`,
    answer:p=>`Keep both the original ${p.format} and a readable PDF. The source export is your preservation copy; the PDF is the convenient version for reading, printing and sharing.`
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
    description:intent.answer(p),
    intent:intent.id,
    updated:UPDATED,
    format:p.format,
    upload:p.upload,
    export:p.export,
    media:p.media,
    limitation:p.limitation,
    core:p.core
  };
}

const guides=platforms.flatMap(p=>intents.map(i=>buildGuide(p,i)));

module.exports={UPDATED,platforms,intents,guides};
