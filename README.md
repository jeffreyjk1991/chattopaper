# ChattoPaper

ChattoPaper turns a WhatsApp chat export into a printable PDF with messages, timestamps, sender names, and supported photos in their conversation positions.

## Product

- Import a WhatsApp ZIP, or a TXT export plus photos.
- Filter the conversation by date.
- Preview the printable pages before download.
- Download a PDF locally in the browser.
- No ChattoPaper account is required.
- Stripe Checkout is connected in sandbox mode for a one-time 99¢ PDF purchase.
- Chat contents and photos remain local; Stripe receives payment/checkout information only.

## Privacy

The converter processes selected chat files in the browser. The current application does not upload conversation contents to an application server.

## Local build

```bash
npm install
npm run build
```

The production static site is generated in `dist/`. Vercel is configured through `vercel.json` to publish that directory.

## Brand

Product name: **ChattoPaper**.

ChattoPaper is an independent formatting tool and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.