# ChatToPaper

ChatToPaper turns a WhatsApp chat export into a printable PDF with messages, timestamps, sender names, and supported photos in their conversation positions.

## Product

- Import a WhatsApp ZIP, or a TXT export plus photos.
- Filter the conversation by date.
- Preview the printable pages before download.
- Download a PDF locally in the browser.
- No account is required in the current build.
- Stripe Checkout is connected in sandbox mode for a one-time 99¢ PDF purchase; live billing still requires the live Stripe account/runtime credential.

## Discovery and analytics

- 100 focused WhatsApp export/PDF articles generated as static HTML.
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