# ChattoPaper

ChattoPaper turns a WhatsApp chat export into a printable PDF with messages, timestamps, sender names, and supported photos in their conversation positions.

## Product

- Import a WhatsApp ZIP, or a TXT export plus photos.
- Filter the conversation by date.
- Preview the printable pages before download.
- Download a PDF locally in the browser.
- No account is required in this preview build.
- The planned offer shown in the UI is 99¢ per finished PDF; payment collection is not connected yet.

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