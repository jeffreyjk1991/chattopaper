# ChatToPaper

**Live site:** https://chattopaper.com/

ChatToPaper is a free browser-based chat-to-PDF converter for supported **WhatsApp, Telegram, Instagram, Messenger, iMessage and SMS** exports. It creates printable PDFs with sender names, timestamps, message order and supported photos while conversation files stay in the browser.

## Try it

- **All supported chats:** https://chattopaper.com/
- **WhatsApp to PDF:** https://chattopaper.com/whatsapp-to-pdf/
- **Telegram to PDF:** https://chattopaper.com/telegram-to-pdf/
- **Instagram DMs to PDF:** https://chattopaper.com/instagram-dm-to-pdf/
- **Messenger to PDF:** https://chattopaper.com/messenger-to-pdf/
- **iMessage to PDF:** https://chattopaper.com/imessage-to-pdf/
- **SMS to PDF:** https://chattopaper.com/sms-to-pdf/

## Product

- Import WhatsApp TXT/ZIP, Telegram JSON, Meta Instagram/Messenger JSON, Apple Messages chat.db/sms.db, and SMS Backup & Restore XML.
- Filter by date, preview printable pages, and download a PDF.
- Supported conversation contents stay in the browser rather than being uploaded to a ChatToPaper application server.
- No ChatToPaper account is required.
- PDF creation is free during the current launch period.

## Technical references and tools

- [WhatsApp export format reference](https://chattopaper.com/blog/whatsapp-chat-export-format/) — message headers, media markers, filenames, dates, ZIP checks and current parser limits.
- [Free WhatsApp Export Checker](https://chattopaper.com/tools/whatsapp-export-checker/) — inspect message counts, dates, missing photos and omitted media locally.
- [Complete WhatsApp to PDF guide](https://chattopaper.com/blog/convert-whatsapp-chat-to-pdf/).
- [WhatsApp chat to PDF with photos](https://chattopaper.com/blog/print-whatsapp-chat-with-photos/).

## Discovery and quality

- Static crawlable product and guide pages with canonical URLs, sitemap, robots.txt, RSS, llms.txt and llms-full.txt.
- WebApplication, Article/TechArticle and breadcrumb structured data where appropriate.
- Automated build checks validate canonical URLs, unique titles, H1s, JSON-LD, sitemap entries and internal links.
- Major search and AI crawlers are explicitly allowed.
- Vercel Web Analytics and Speed Insights are enabled.
- Production builds submit the current URL set to IndexNow.

## Privacy

Selected conversation text and photos are processed in the browser. ChatToPaper does not send chat contents to its application server. Anonymous site and conversion analytics are separate from conversation contents.

## Local build

```bash
npm install
npm run build
```

The production static site is generated in `dist/`. Vercel publishes that directory.

## Brand

ChatToPaper is independent and is not affiliated with, endorsed by or sponsored by WhatsApp, Telegram, Instagram, Messenger, Apple, Meta or their owners.
