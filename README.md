# ChatToPaper

**Live site:** https://chattopaper.com/

ChatToPaper is a free browser-based WhatsApp-to-PDF converter that turns exported WhatsApp chats into printable PDFs with messages, timestamps, sender names, and supported photos in their conversation positions.

Use it at **https://chattopaper.com/** or read the complete guide: **https://chattopaper.com/blog/convert-whatsapp-chat-to-pdf/**.

## Product

- Import a WhatsApp ZIP, or a TXT export plus photos.
- Filter the conversation by date.
- Preview the printable pages before download.
- Download a PDF locally in the browser.
- No account is required in the current build.
- Stripe Checkout is connected in sandbox mode for a one-time 99¢ PDF purchase; live billing still requires the live Stripe account/runtime credential.

## Discovery and analytics

- 36 focused WhatsApp export/PDF and small-business record-keeping guides generated as static HTML.
- Blog category hubs and internal linking.
- `sitemap.xml`, `robots.txt`, `llms.txt`, RSS, canonical URLs, Open Graph metadata, Article/WebApplication structured data.
- OAI-SearchBot and GPTBot explicitly allowed in `robots.txt`.
- Vercel Web Analytics and Speed Insights scripts are included on the converter and guide pages.
- About, privacy, terms, and editorial-policy pages provide product and content provenance.

## Privacy

The converter processes selected chat files in the browser. Conversation text and photos are not uploaded to a ChatToPaper application server. Vercel analytics measures site usage/performance; Stripe handles checkout separately.

## Local build

```bash
npm install
npm run build
```

The production static site is generated in `dist/`. Vercel is configured through `vercel.json` to publish that directory.

## Brand

Product name: **ChatToPaper**.

ChatToPaper is an independent formatting tool and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.

## Useful links

- [Free WhatsApp to PDF converter](https://chattopaper.com/)
- [How to convert a WhatsApp chat to PDF](https://chattopaper.com/blog/convert-whatsapp-chat-to-pdf/)
- [WhatsApp chat to PDF with photos](https://chattopaper.com/blog/print-whatsapp-chat-with-photos/)
- [WhatsApp customer orders as business records](https://chattopaper.com/blog/whatsapp-customer-orders-business-records/)
