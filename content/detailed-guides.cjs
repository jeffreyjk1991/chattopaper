'use strict';
// Hand-maintained guides: product details checked against importer.js and the UI.
module.exports = {
  'convert-whatsapp-chat-to-pdf': {
    description: 'The complete guide to converting a WhatsApp chat to PDF on iPhone or Android, with photos, timestamps, date checks, privacy guidance and troubleshooting.',
    sections: [
      ['Choose the best method for your goal', `<p>There are three realistic ways to turn a WhatsApp conversation into a PDF: export the chat and use a purpose-built converter, copy the transcript into a document editor, or capture screenshots and print them. For anything longer than a few messages, the exported-chat workflow is usually the most reliable because it keeps message order, names and timestamps together without requiring dozens of manual screenshots.</p><div class="table-scroll"><table><thead><tr><th>Method</th><th>Best for</th><th>Main trade-off</th></tr></thead><tbody><tr><td><strong>Export + converter</strong></td><td>Long chats, photos, printing, archiving</td><td>You must verify the export and preview</td></tr><tr><td>Copy into Word/Docs</td><td>Heavy manual editing</td><td>Easy to alter formatting or lose context</td></tr><tr><td>Screenshots</td><td>A handful of messages</td><td>Slow and impractical for long conversations</td></tr></tbody></table></div><p>ChatToPaper is designed for the first method: it reads the exported TXT or ZIP, reconstructs the conversation into printable pages, and shows a preview before download.</p>`],
      ['Export the chat correctly on iPhone or Android', `<p>Start with one conversation. On <a href="/blog/export-whatsapp-chat-iphone/">iPhone, use the conversation information screen and Export Chat</a>. On <a href="/blog/export-whatsapp-chat-android/">Android, open the chat menu, choose More, then Export chat</a>. Choose the media option when photos are part of the record or memory you want to keep.</p><p><strong>Important:</strong> WhatsApp exports source material; it does not create a polished PDF. A TXT contains the transcript. A ZIP may contain the transcript plus exported media. An encrypted WhatsApp backup is a different file type and is not the right input for a chat-to-PDF converter.</p>`],
      ['Know what the export can and cannot contain', `<p>Before converting, inspect the export itself. The earliest and latest messages should cover the period you expected. If the chat was exported without media, a converter cannot recreate missing photos later. If WhatsApp omitted older messages or attachments, changing PDF settings will not bring them back.</p><p>This distinction is important for records: the <strong>export is the source</strong>; the PDF is a formatted reading and printing layer. Keep the untouched TXT/ZIP separately whenever completeness or provenance matters.</p>`],
      ['Convert the export in ChatToPaper', `<ol class="steps"><li>Open the <a href="/#converter">free WhatsApp-to-PDF converter</a>.</li><li>Select the ZIP, or select the TXT and exported photos together. Keep original attachment filenames unchanged.</li><li>Review the import summary. Confirm the first and last messages, participant names, and any photo warnings.</li><li>Open Customize PDF. Choose the date range, chat-bubble or Simple &amp; clean layout, timestamps and photo settings.</li><li>Choose A4 or US Letter under Finishing touches.</li><li>Inspect the preview before download, then create and save the PDF.</li></ol><p>Current upload limits are 300 MB for a ZIP or 100 MB total for loose files. Chat files are processed in the browser rather than uploaded to a ChatToPaper application server.</p>`],
      ['Verify dates before trusting the PDF', `<p>A common failure mode is not missing text—it is a plausible-looking document with the wrong regional date interpretation. For example, 04/05 may mean April 5 or May 4. If ChatToPaper detects an ambiguous date pattern, choose the correct day/month or month/day order and check a message whose date you know.</p><p>Also verify time format, sender labels and multiline messages. A clean layout is only useful if the underlying conversation was interpreted correctly.</p>`],
      ['Verify photos and attachments', `<p>Photo placement depends on matching attachment references in the transcript with the actual exported image files. If an image was omitted from the export, renamed, or not selected, it cannot be reconstructed reliably.</p><p>Before downloading, compare the preview with the source chat around photo-heavy sections. Missing or unsupported media should remain visible as warnings or placeholders rather than silently disappearing. See the <a href="/blog/whatsapp-photos-missing-from-pdf/">missing-photo troubleshooting guide</a> if the count looks wrong.</p>`],
      ['Choose a layout for printing, records or keepsakes', `<p>Use chat bubbles when you want the document to feel conversational or gift-like. Use the cleaner transcript-style layout when density and scanability matter more, such as business or record-keeping use. Match the PDF paper size to your printer: <a href="/blog/whatsapp-pdf-a4-vs-letter/">A4 or US Letter</a>.</p><p>If you only need part of a long conversation, use the date filter instead of editing the source TXT. That keeps the original export intact while producing a shorter PDF.</p>`],
      ['Privacy: what “local processing” does and does not mean', `<p>ChatToPaper processes the selected chat files in your browser. That reduces exposure compared with a workflow that uploads the conversation to an application server. It does not make the final PDF automatically safe to share: the document can still contain private names, phone numbers, addresses, photos or business information.</p><p>Review the finished PDF before sending it to anyone, and keep sensitive records according to your normal privacy practices. For more detail, see <a href="/blog/is-whatsapp-pdf-converter-safe/">Is a WhatsApp PDF converter safe?</a></p>`],
      ['Use the PDF as a readable copy, not automatic proof', `<p>A formatted PDF can be useful for reading, printing, archiving, customer records and project files. It does not by itself authenticate the conversation, prove that every message is complete, or guarantee legal admissibility. If evidentiary value matters, preserve the original export and any other relevant source records.</p><p>For business use, store the chat PDF beside the actual invoice, quote, work order, receipt or contract instead of treating the chat as a replacement for formal records.</p>`],
      ['Troubleshooting checklist', `<div class="table-scroll"><table><thead><tr><th>Problem</th><th>Check first</th></tr></thead><tbody><tr><td>Photos missing</td><td>Was the chat exported with media, and are the original image files present?</td></tr><tr><td>Wrong dates</td><td>Choose the correct regional date order and verify a known message.</td></tr><tr><td>Upload fails</td><td>Use a full browser, not an attachment preview, and confirm the file size/type.</td></tr><tr><td>Chat seems incomplete</td><td>Check the original TXT/ZIP; a converter cannot add messages absent from the export.</td></tr><tr><td>Blank or strange text</td><td>Confirm the TXT is an actual WhatsApp chat export and has not been reformatted or renamed from another document type.</td></tr></tbody></table></div><p>More detailed fixes are available in the <a href="/blog/category/troubleshooting/">troubleshooting guides</a>.</p>`],
      ['A quality checklist before you download or print', `<ul><li>The first and last messages match the period you intended to preserve.</li><li>Sender names are correct and easy to distinguish.</li><li>Dates use the intended regional order.</li><li>Timestamps are present when sequence matters.</li><li>Expected photos appear beside the right messages.</li><li>Missing media is clearly marked rather than hidden.</li><li>The page size matches the printer or print service.</li><li>You have kept the untouched original export separately.</li></ul><p>If all eight checks pass, the resulting PDF is much more likely to be useful later than a document created with a one-click workflow that never verifies the source.</p>`]
    ],
    faq: [
      ['Can I convert a WhatsApp chat to PDF for free?', 'Yes. ChatToPaper is free during the current launch period, with no checkout required to create and download a PDF.'],
      ['Can I convert a chat without photos?', 'Yes. Select the TXT alone, or turn off Include photos after import. The PDF can retain text, names and timestamps without displaying images.'],
      ['Can the PDF include WhatsApp photos?', 'Yes, when the export includes supported image files and those files can be matched to the attachment references in the transcript.'],
      ['Can I convert a WhatsApp group chat?', 'Yes. Export the group conversation as its own chat and keep participant names visible in the preview and final PDF.'],
      ['Can I choose only one month or date range?', 'Yes, after import. Date filtering changes the final PDF scope but cannot add older messages that were missing from the WhatsApp export.'],
      ['Can I convert several chats at once?', 'Import one conversation at a time. Mixing transcripts can make participant names, dates and attachment matching ambiguous.'],
      ['Does the PDF preserve deleted messages?', 'No. A converter can only format content that is present in the export. It cannot recover deleted messages or omitted media.'],
      ['Is a WhatsApp PDF valid legal evidence?', 'A PDF may be useful as a readable record, but formatting a conversation does not authenticate it or guarantee legal admissibility. Preserve the original export when evidence matters.'],
      ['Do I need an account?', 'No account is required to use ChatToPaper during the current free launch.']
    ]
  },
  'export-whatsapp-chat-iphone': {
    description: 'Export a WhatsApp chat on iPhone, save it to Files, and turn the TXT or ZIP into a PDF. Includes media choices and help finding the saved export.',
    sections: [
      ['Export from the conversation', `<ol class="steps"><li>Open WhatsApp and the individual or group chat you want to save.</li><li>Tap the contact or group name at the top to open chat information, then look for Export Chat.</li><li>Choose whether to attach media. Text-only is smaller; attaching media is needed if you want the exported photos in your PDF.</li><li>In the iOS share sheet, choose Save to Files if available. Pick a folder and note whether it is in iCloud Drive or On My iPhone.</li><li>Open Files and check that the export is present. If it is stored in iCloud, allow it to download before selecting it in the converter.</li></ol><p>Menu wording and available share destinations can vary with app and iOS versions. Refer to WhatsApp’s export help below if your screen differs.</p>`],
      ['Find the export and create a PDF', `<p>Open ChatToPaper in Safari, choose your WhatsApp export, and browse to the folder you selected. Use the ZIP when the export includes photos, or select the TXT and image files together if they were saved separately. Keep the original image filenames.</p><p>Read the import warnings and compare the date range with the conversation. Then follow the <a href="/blog/convert-whatsapp-chat-to-pdf/">PDF conversion steps</a>. Exporting produces source files; the converter creates the printable pages.</p>`],
      ['If the file or export option is missing', `<p>If you cannot find the file, check the destination chosen in the share sheet and the Recents view in Files. Saving to another app does not necessarily save a local copy in Files.</p><p>If Export Chat is unavailable, check the conversation settings and <a href="/blog/whatsapp-advanced-chat-privacy-export/">Advanced Chat Privacy</a>. A converter cannot bypass a chat’s export restrictions. If photos are absent, first check that the source actually contains them before changing PDF settings.</p>`]
    ],
    faq: [['Does iPhone export a PDF directly?', 'This workflow exports the conversation as text and, optionally, media. Import those files into ChatToPaper to create a paginated PDF.'], ['Will an export contain my entire chat?', 'Do not assume it will. Export limits and media availability can affect the result. Check the earliest and latest messages in the exported transcript before relying on the PDF.']]
  },
  'export-whatsapp-chat-android': {
    description: 'Export a WhatsApp chat on Android and save it as a PDF with photos, names and timestamps. Use the free browser-based workflow, keep files private, and check dates and media before download.',
    sections: [
      ['Export one conversation', `<ol class="steps"><li>Open WhatsApp and enter the individual or group conversation.</li><li>Open More options, choose More, then Export chat.</li><li>Choose whether to include media. Include media when exported photos should appear alongside the messages.</li><li>Use an available share destination that lets you retrieve the files. If a file manager or cloud drive is offered, save to a folder you can identify.</li><li>Check the saved result before converting: you need the conversation TXT and any photos, either together in a ZIP or as separate files.</li></ol><p>Share destinations vary by device and installed apps. If a sharing service rejects a large export, try a destination that accepts the files rather than repeatedly forwarding the same attachment.</p>`],
      ['Select the files in your browser', `<p>Open the <a href="/#converter">free WhatsApp-to-PDF converter</a> in Chrome, Samsung Internet or another modern Android browser and choose the saved export. For separate files, select the TXT and photos together. Avoid renaming pictures: the transcript’s filename references are used to place them in context.</p><p>No ChatToPaper account or Android app is required. The selected chat text and photos are processed locally in the browser instead of being uploaded to a ChatToPaper application server. Preview the messages, date interpretation and media warnings before download.</p>`],
      ['Check dates, photos and page size before download', `<p>Android exports can use date formats that are ambiguous when the day and month are both 12 or lower. If the preview flags this, choose the correct day/month or month/day interpretation and verify a message whose date you know.</p><p>For printing, A4 is common in many countries while US Letter is common in North America. Pick the paper size that matches the printer or print shop you will use. If photos matter, compare the matched-photo count with the original conversation before creating the PDF.</p>`],
      ['Export files are different from backups', `<p>An encrypted WhatsApp backup or database is not a readable chat export. ChatToPaper does not decrypt backup files. Return to the conversation’s Export chat command and use its TXT or ZIP output.</p><p>If the export lacks older messages, changing the PDF date range will not recover them. If photos are missing, <a href="/blog/whatsapp-photos-missing-from-pdf/">check the source and filename matches</a>. If exporting is disabled by Advanced Chat Privacy, the converter cannot bypass that setting.</p>`]
    ],
    faq: [['Where is the export saved on Android?', 'It depends on the share destination you selected. Look in that app or folder; there is no single folder shared by every Android device and export method.'], ['Can I save the WhatsApp export as PDF directly on Android?', 'Yes. Export the chat from WhatsApp, open the TXT or ZIP in ChatToPaper in a modern Android browser, review the preview, and download the finished PDF. No ChatToPaper app or account is required.'], ['Which paper size should I choose?', 'Choose A4 when that matches your local printer or print shop, or US Letter for standard North American Letter paper.'], ['Can I convert a group chat?', 'Yes. Export the group conversation and review the participant labels in the preview. Process it as its own conversation rather than combining it with another export.']]
  },
  'whatsapp-photos-missing-from-pdf': {
    seoTitle: 'WhatsApp Photos Missing From Export or PDF? 7 Fixes',
    description: 'WhatsApp photos missing from an export or PDF? Work through seven checks: media export settings, ZIP contents, filenames, date filters, photo settings, file type and source availability.',
    sections: [
      ['7 checks for missing WhatsApp photos', `<ol class="steps"><li><strong>Check the transcript.</strong> If it says &lt;Media omitted&gt; or image omitted, the photo is not inside that text export.</li><li><strong>Check how you exported.</strong> Re-export with media when the original photo still exists in WhatsApp.</li><li><strong>Open the ZIP.</strong> Confirm the expected JPG, PNG, WebP or other attachment file is actually present.</li><li><strong>Keep filenames unchanged.</strong> Renaming files can break the link between a message and its attachment.</li><li><strong>Check the PDF date range and Include photos setting.</strong> A correctly imported image will not appear if its message is filtered out or photos are disabled.</li><li><strong>Check the file type.</strong> Audio, video, documents or unreadable images may remain as placeholders instead of printable photos.</li><li><strong>Start from the untouched export.</strong> Mixing folders or combining files from different exports can create duplicate or ambiguous matches.</li></ol>`],
      ['Find where the photo went missing', `<div class="table-scroll"><table><thead><tr><th>What you see</th><th>What it usually means</th><th>Next step</th></tr></thead><tbody><tr><td>Media omitted / image omitted</td><td>The source export does not contain that attachment</td><td>Re-export with media if possible</td></tr><tr><td>Image filename, but no matching file</td><td>The transcript references a photo that is absent from the selected files</td><td>Use the original ZIP or select the matching photo</td></tr><tr><td>File exists, but no image in the PDF</td><td>Filename mismatch, unsupported image, date filter or photo setting</td><td>Use the untouched export and review the preview warnings</td></tr><tr><td>Wrong photo beside a message</td><td>Duplicate or renamed files created an ambiguous match</td><td>Do not combine exports; start again from one original chat export</td></tr></tbody></table></div>`],
      ['Preserve the connection between text and pictures', `<p>A photo is placed using an attachment reference in the transcript, not its position in a folder. Renaming images or mixing photos from different exports can break that connection. Start again with the untouched ZIP when possible.</p><p>For example, if a message references IMG-20261020-WA0001.jpg, the corresponding image must be available in the imported files. A similarly dated photo with a different filename is not a reliable substitute.</p>`],
      ['Verify the repair before downloading again', `<ol class="steps"><li>Inspect the source archive and confirm the expected image exists.</li><li>Import the original ZIP, or the TXT and accompanying photos together.</li><li>Check the matched and missing-photo warnings.</li><li>Find the affected message in the preview and confirm the correct image is in context.</li><li>Create a fresh PDF after fixing the source or settings; an older downloaded PDF will not update itself.</li></ol><p>ChatToPaper cannot recover a deleted photo or infer the contents of an omitted attachment. See <a href="/blog/whatsapp-export-media-omitted/">what “Media omitted” means</a> when the source itself does not contain the file.</p>`]
    ],
    faq: [
      ['Why are my WhatsApp photos missing from the PDF?', 'The most common causes are exporting without media, an attachment missing from the ZIP, renamed files, a date filter that excludes the message, Include photos being off, or an unsupported attachment type.'],
      ['Can a converter restore photos from “Media omitted”?', 'No. That text alone does not contain the image. Re-export with media or provide the actual source photo if you still have it.'],
      ['What if the photo is inside the ZIP but does not show?', 'Use the untouched export, check that the message is inside the selected date range, keep Include photos enabled, and review missing or unsupported-media warnings.']
    ]
  },
  'whatsapp-txt-to-pdf': {
    description: 'Turn a WhatsApp TXT export into a readable PDF. Learn which text formats work, how to include photos, and how to check dates and multiline messages.',
    sections: [
      ['Use the original text export', `<p>Select the TXT produced by WhatsApp’s Export chat feature. Avoid copying messages into a word processor first: editing can change line breaks or the timestamp patterns that identify the start of a message.</p><p>The parser uses date, time and sender information to separate messages. It keeps continuation lines with the preceding message. If the file has no recognizable messages, check that it is a chat export rather than a document renamed to end in .txt.</p>`],
      ['Text-only PDF or text with photos?', `<p>Choose the TXT alone for a document of text messages. To include pictures, select the exported photos in the same import and keep their filenames unchanged. The TXT contains references, not embedded image data.</p><p>For example, a reference to an image filename does not make that photo available unless its file is also selected. A media-omitted line cannot be converted back into the missing image. Use the <a href="/blog/whatsapp-photos-missing-from-pdf/">missing-photo checklist</a> when the preview shows a placeholder.</p>`],
      ['Review the parsed conversation', `<ol class="steps"><li>Select your TXT in the <a href="/#converter">converter</a>, along with photos if needed.</li><li>Check the date range and participant names. If the dates are ambiguous, choose the appropriate day/month or month/day order.</li><li>Inspect a multiline message and confirm its paragraphs belong to one sender.</li><li>Choose chat bubbles or Simple &amp; clean, plus A4 or US Letter.</li><li>Download the PDF and retain the original TXT alongside it.</li></ol>`]
    ],
    faq: [['Can I edit the TXT to remove messages?', 'Keep an unchanged original. For a shorter PDF, use the converter’s date range instead of manually changing the source; editing timestamp lines can affect parsing.'], ['Does TXT-to-PDF preserve WhatsApp formatting exactly?', 'ChatToPaper lays out the exported content as printable pages. It does not reproduce the app interface pixel for pixel or restore details absent from the text export.']]
  },
  'print-whatsapp-chat-with-photos': {
    seoTitle: 'Print a WhatsApp Chat With Photos: iPhone & Android',
    description: 'Print a WhatsApp chat with photos by exporting with media, converting the chat to a paginated PDF, checking image matches, then printing from iPhone, Android, Windows or Mac.',
    sections: [
      ['The short answer: export, convert, then print', `<p>WhatsApp does not provide a clean whole-chat print layout. For a long conversation with photos, the dependable workflow is: <strong>export the chat with media → convert the export to a paginated PDF → print the PDF.</strong></p><p>Screenshots can work for one or two messages, but they become slow and inconsistent across a long chat. A PDF keeps page breaks, sender names and timestamps together and can place supported exported photos near the messages that referenced them.</p>`],
      ['Prepare the chat and its images', `<p>Export on <a href="/blog/export-whatsapp-chat-iphone/">iPhone</a> or <a href="/blog/export-whatsapp-chat-android/">Android</a> with media included. Import the ZIP, or the TXT and its images together. Keep the original filenames so photos can be matched to their messages.</p><p>Review missing-media warnings before printing. If the transcript says <a href="/blog/whatsapp-export-media-omitted/">&lt;Media omitted&gt; or image omitted</a>, the file is not in that export and cannot be reconstructed from the placeholder.</p>`],
      ['Choose paper, layout and date range', `<p>Under Customize PDF → Finishing touches, select A4 for A4 paper or US Letter for Letter paper. Match the PDF size to the paper in the printer. Chat bubbles emphasize the conversation; Simple &amp; clean is a denser alternative.</p><p>Use date filters to keep the period you want. Leave timestamps visible when sequence matters. Preview portrait and landscape photos, long messages and the page immediately after a large image.</p>`],
      ['Print from iPhone, Android, Windows or Mac', `<div class="table-scroll"><table><thead><tr><th>Device</th><th>After downloading the PDF</th></tr></thead><tbody><tr><td>iPhone / iPad</td><td>Open the PDF in Files or another PDF viewer, use Share → Print, then choose an available printer.</td></tr><tr><td>Android</td><td>Open the PDF in a PDF viewer and use its Print option or system print service.</td></tr><tr><td>Windows</td><td>Open the PDF and use Ctrl+P, then verify paper size, scale and duplex settings.</td></tr><tr><td>Mac</td><td>Open the PDF in Preview or another viewer and use File → Print.</td></tr></tbody></table></div><p>Printer menus differ by device and manufacturer, so use the print preview to confirm that nothing is clipped or unexpectedly scaled.</p>`],
      ['Print a test before the whole conversation', `<ol class="steps"><li>Create the PDF and open the downloaded file in a PDF viewer.</li><li>Choose one page with photos and one with dense text as a test.</li><li>Check paper size, orientation and the printer’s scaling preview.</li><li>Inspect text readability and photo quality on the printed samples.</li><li>For a long chat, consider double-sided printing before printing the remaining pages.</li></ol><p>The PDF cannot add detail to a low-resolution source image. For a photo book or paid print service, inspect the PDF against that service’s own specifications before placing an order.</p>`]
    ],
    faq: [
      ['Can I print WhatsApp messages with the photos inline?', 'Yes, when the original export includes supported image files that can be matched to the message references.'],
      ['Can I print directly from WhatsApp?', 'For a few visible messages you can use screenshots, but for a long conversation the cleaner method is to export the chat, create a paginated PDF, and print that document.'],
      ['Will videos and voice notes print?', 'They cannot play on paper. Keep the original audio and video files separately; the PDF can preserve a reference or placeholder.'],
      ['Can I print just one month?', 'Yes, if that month is present in the imported export. Set the start and end dates, check the preview, then create the shortened PDF.']
    ]
  },
  'print-whatsapp-messages-without-screenshots': {
    seoTitle: 'How to Print WhatsApp Messages Without Screenshots',
    description: 'Print a long WhatsApp conversation without screenshots: export the chat, turn the TXT or ZIP into a clean PDF, verify names and dates, then print the paginated document.',
    sections: [
      ['Why screenshots stop working for long chats', `<p>Screenshots are fine for a handful of messages. For dozens or hundreds of messages they create four problems: you must capture every screen manually, overlapping screenshots can duplicate messages, gaps can omit messages, and the final pages are difficult to search or reorder.</p><p>WhatsApp’s exported transcript already contains the conversation in sequence, so using that export as the source is usually faster and easier to verify.</p>`],
      ['Four ways to print a WhatsApp conversation', `<div class="table-scroll"><table><thead><tr><th>Method</th><th>Best for</th><th>Main limitation</th></tr></thead><tbody><tr><td>Screenshots</td><td>One or two short exchanges</td><td>Manual, easy to miss or duplicate messages</td></tr><tr><td>Print WhatsApp Web</td><td>A short section already loaded on screen</td><td>Browser page breaks and loaded-message limits make long chats unreliable</td></tr><tr><td>Print the raw TXT</td><td>Free text-only record</td><td>Dense formatting; photos are not laid out inline</td></tr><tr><td>Export → paginated PDF</td><td>Long chats, printing, records, photos</td><td>You should verify the export and preview first</td></tr></tbody></table></div>`],
      ['A cleaner workflow without screenshots', `<ol class="steps"><li>Use WhatsApp’s Export Chat feature on the phone.</li><li>Choose media when photos matter.</li><li>Open the TXT or ZIP in the <a href="/#converter">ChatToPaper converter</a>.</li><li>Confirm sender names, date interpretation and missing-media warnings.</li><li>Choose A4 or US Letter and preview the page breaks.</li><li>Download the PDF and print from your normal PDF viewer.</li></ol>`],
      ['Keep the source as well as the printout', `<p>The PDF is a readable presentation of the export, not a replacement for the source file. Keep the original TXT or ZIP unchanged when completeness matters. If you need only a date range, filter the PDF after import rather than manually editing the transcript.</p><p>For chats with many pictures, use the <a href="/blog/print-whatsapp-chat-with-photos/">photo-printing guide</a>. If the export shows <a href="/blog/whatsapp-export-media-omitted/">Media omitted</a>, fix the source export first.</p>`]
    ],
    faq: [
      ['Is there a way to print WhatsApp messages without taking screenshots?', 'Yes. Export the conversation from WhatsApp, convert the TXT or ZIP to a paginated PDF, then print the PDF.'],
      ['Why not print WhatsApp Web?', 'It can be acceptable for a short visible section, but long chats can be incomplete or break poorly across pages because the browser is printing a live interface rather than a document designed for paper.'],
      ['Can this include photos?', 'Yes, when the export contains supported image files and they can be matched to their message references.']
    ]
  },

  'whatsapp-customer-orders-business-records': {
    description: 'Create a readable WhatsApp paper trail for customer orders, changes and confirmations, while keeping invoices, receipts and accounting records separate.',
    sections: [
      ['When this helps', `<p>Many small businesses receive order details through WhatsApp: product choices, quantities, delivery addresses, substitutions, pickup times, payment confirmations and last-minute changes. Those details can become hard to find once the chat moves on.</p><p>A PDF copy gives you a readable snapshot of the conversation to store with the order record. It is best treated as supporting documentation, not as a substitute for invoices, receipts, bookkeeping or signed contracts.</p>`],
      ['A simple record-keeping workflow', `<ol class="steps"><li>Complete the customer conversation in WhatsApp.</li><li>Export that chat and keep the original export unchanged.</li><li>Convert it in <a href="/#converter">ChatToPaper</a>, keeping names and timestamps visible.</li><li>Use a date range if the conversation includes unrelated older messages.</li><li>Save the PDF with the order number, invoice, receipt or delivery record in your normal business folder.</li></ol>`],
      ['What to keep together', `<p>For a stronger paper trail, store the chat PDF beside the formal business documents that relate to the transaction: the quote, invoice, receipt, payment record, shipping record, purchase order or delivery confirmation. The chat is useful context because it shows what was discussed and confirmed in sequence.</p>`]
    ],
    faq: [['Does a WhatsApp PDF replace an invoice?', 'No. It is supporting documentation. Continue using the invoices, receipts and accounting records required for your business.'], ['Should I keep the original export too?', 'Yes. Keep the untouched export separately from the formatted PDF so you retain both the source files and a readable copy.']]
  },
  'whatsapp-quotes-customer-approvals-pdf': {
    description: 'Save WhatsApp quote approvals, scope changes and customer confirmations as a readable PDF to keep with estimates, invoices and job records.',
    sections: [
      ['Why approvals get lost in chat', `<p>A customer may approve a quote, accept a revised price, choose an option or authorize extra work with a short WhatsApp reply. Months later, that decision can be difficult to locate in a long conversation.</p><p>Exporting the relevant thread to PDF makes the approval easier to retrieve and review alongside the formal quote or job file.</p>`],
      ['What to preserve', `<p>Keep sender names, timestamps and the surrounding messages that explain what was being approved. Avoid saving only a single isolated reply if the meaning depends on the price, scope or option discussed immediately before it.</p><p>Use ChatToPaper's date filtering when you need only the part of the conversation connected to a specific quote or project.</p>`],
      ['Keep formal records separate', `<p>The PDF should support your normal business records, not replace them. Keep the signed proposal, quote, estimate, invoice and payment records in the systems you already use. A formatted WhatsApp conversation is useful context, but it does not automatically establish contractual or legal status.</p>`]
    ],
    faq: [['Can I use this for change-order approvals?', 'Yes, as a readable record of the conversation. Keep the formal change order or revised estimate as well.'], ['Should I include timestamps?', 'Usually yes. Timestamps help show the sequence of the discussion and approval.']]
  },
  'whatsapp-supplier-orders-purchase-records': {
    description: 'Archive WhatsApp supplier order discussions, quantities, substitutions and delivery confirmations as PDF alongside purchase and inventory records.',
    sections: [
      ['Supplier conversations are operational records', `<p>Small businesses often coordinate purchases with suppliers through WhatsApp: quantities, unit prices, availability, substitutions, delivery windows and missing items. That chat may be the fastest place to check what was agreed, but it is not always easy to search later.</p>`],
      ['Create a readable purchase trail', `<ol class="steps"><li>Export the supplier chat after the order or delivery is complete.</li><li>Convert it to PDF with timestamps and participant names visible.</li><li>Keep photos when they show products, damage, packing or delivery details.</li><li>Store the PDF with the purchase order, supplier invoice, receipt and inventory record.</li></ol>`],
      ['Use the PDF as supporting context', `<p>The chat can explain why a substitute was accepted, when a delivery was promised or which quantity was confirmed. It should complement, not replace, your accounting and purchasing documents.</p>`]
    ],
    faq: [['Can I keep supplier photos in the PDF?', 'Yes, when the export includes supported image files and their filenames can be matched to the chat.'], ['Is this a purchase-order system?', 'No. ChatToPaper formats the exported conversation; use your normal purchasing system for formal orders and accounting.']]
  },
  'whatsapp-contractor-job-records': {
    description: 'Preserve WhatsApp job instructions, customer photos, schedule changes and approved extras as a PDF for contractor and service-job files.',
    sections: [
      ['What often lives in the job chat', `<p>Contractors and field-service businesses commonly receive measurements, site photos, access instructions, scheduling changes, material choices and approvals for extra work in WhatsApp. Keeping those decisions with the job file reduces the chance that important context is buried in an old thread.</p>`],
      ['Build a job paper trail', `<p>Export the customer or project chat and create a PDF covering the relevant job dates. Keep names, timestamps and photos when they matter. File the PDF with estimates, work orders, invoices, signed agreements and site documentation.</p>`],
      ['Preserve context around changes', `<p>If a customer approves an added task or revised price, include the messages immediately before and after the approval so the record is understandable on its own. A chat PDF can document the conversation but does not replace a formal change order where one is required.</p>`]
    ],
    faq: [['Can I use this for before-and-after job photos?', 'Yes, when those images are part of the exported conversation and supported by the converter.'], ['Does this prove a customer approved extra work?', 'It records the exported conversation in readable form, but legal or contractual effect depends on the facts and applicable rules. Keep your formal job documents too.']]
  },
  'whatsapp-property-management-records': {
    description: 'Save WhatsApp tenant repair requests, vendor updates, access instructions and property photos as a readable PDF for property files.',
    sections: [
      ['Common property-management chat records', `<p>Tenant and vendor conversations may contain repair requests, photos of damage, access arrangements, appointment windows, contractor updates and completion confirmations. Those messages can be useful context when reviewing maintenance history later.</p>`],
      ['File conversations by property or issue', `<p>Export the relevant conversation, use a date range for the repair or incident, and create a PDF with names and timestamps visible. Store it with the work order, invoice, inspection record or property-management system entry for that issue.</p>`],
      ['Handle personal information carefully', `<p>Property conversations can contain phone numbers, addresses, access information and other private details. Limit who receives the PDF and retain it according to your normal privacy and record-retention practices.</p>`]
    ],
    faq: [['Can I save vendor conversations too?', 'Yes. Vendor instructions and completion updates can be archived the same way and stored with the related maintenance record.'], ['Should I email these PDFs to everyone involved?', 'Not automatically. Treat them as business records containing personal information and share only when appropriate.']]
  },
  'whatsapp-freelancer-client-records': {
    description: 'Archive WhatsApp client requirements, revisions, delivery confirmations and approvals as a PDF alongside proposals, invoices and project files.',
    sections: [
      ['Chats often contain project decisions', `<p>Freelancers, consultants and service businesses frequently receive scope details, revision requests, deadlines, file approvals and delivery confirmations through WhatsApp. A readable PDF helps keep those decisions with the rest of the project instead of relying on chat search months later.</p>`],
      ['Close out a project cleanly', `<ol class="steps"><li>Export the client chat when a milestone or project is complete.</li><li>Convert the relevant date range to PDF.</li><li>Keep names, timestamps and images where they explain a revision or approval.</li><li>Save the PDF beside the proposal, statement of work, invoice and final deliverables.</li></ol>`],
      ['Use it as supporting documentation', `<p>The chat PDF can make it easier to answer questions such as which version was approved or when a deadline changed. It should sit beside your formal scope and billing documents rather than replacing them.</p>`]
    ],
    faq: [['Can this help with revision approvals?', 'Yes. Include enough surrounding messages to make the approval clear and keep it with the project record.'], ['Is a chat PDF the same as a signed statement of work?', 'No. It is a readable record of the exported conversation, not a substitute for formal agreements.']]
  },
  'whatsapp-export-media-omitted': {
    seoTitle: '“Media Omitted” on WhatsApp: Meaning & What to Do',
    description: 'Seeing <Media omitted>, image omitted or video omitted in a WhatsApp export? Learn what it means, when re-exporting with media can restore the file, and when it cannot be recovered.',
    sections: [
      ['What “Media omitted” means', `<p><strong>&lt;Media omitted&gt;</strong> means WhatsApp recorded that an attachment existed at that point in the conversation, but the actual photo, video, audio, sticker or document is not inside the export you are looking at. The placeholder is not a hidden copy of the file.</p><p>If you only need the short answer: <strong>re-export the original chat with media included.</strong> If the new export contains the attachment, it can be restored to the PDF. If the file is still absent, no PDF converter can reconstruct the original attachment from the words “Media omitted” alone.</p>`],
      ['Android and iPhone use different wording', `<div class="table-scroll"><table><thead><tr><th>What you may see</th><th>Typical meaning</th><th>Can the file be inside this export?</th></tr></thead><tbody><tr><td><strong>&lt;Media omitted&gt;</strong></td><td>Android-style placeholder for an attachment excluded from the export</td><td>No — not from that placeholder alone</td></tr><tr><td><strong>image omitted</strong></td><td>iPhone-style placeholder for a photo that was not included</td><td>No</td></tr><tr><td><strong>video omitted / audio omitted / sticker omitted</strong></td><td>iPhone-style placeholder naming the missing media type</td><td>No</td></tr><tr><td>A filename such as IMG-…jpg or an attached-file marker</td><td>The transcript references a real exported file</td><td>Possibly — check the ZIP for the matching file</td></tr></tbody></table></div><p>The exact wording can vary by device, WhatsApp version and phone language. The important distinction is whether the export contains an actual attachment file, not the exact placeholder text.</p>`],
      ['The fastest fix to try', `<ol class="steps"><li>Open the original conversation in WhatsApp.</li><li>Use <strong>Export Chat</strong> again.</li><li>Choose the option that includes media when WhatsApp offers it.</li><li>Save the resulting export without renaming or reorganizing its files.</li><li>Open it in the <a href="/#converter">ChatToPaper converter</a> and check the matched-photo and missing-media warnings before download.</li></ol><p>If the new ZIP contains the referenced image or other supported file, ChatToPaper can place it back near the correct message. If the source export still contains only a placeholder, changing PDF layouts will not recreate the media.</p>`],
      ['Can the omitted media be recovered?', `<div class="table-scroll"><table><thead><tr><th>Situation</th><th>Best next step</th><th>Recovery outlook</th></tr></thead><tbody><tr><td>You originally exported without media</td><td>Export the chat again with media</td><td><strong>Often recoverable</strong> if the attachment is still available in WhatsApp</td></tr><tr><td>The attachment was deleted, expired, cleared or is no longer on the device</td><td>Look for a separate copy or backup you already control</td><td><strong>Not recoverable from the text export</strong></td></tr><tr><td>The ZIP contains the image but the PDF does not show it</td><td>Use the untouched export and check filename matching / supported image type</td><td><strong>Usually a conversion or matching issue</strong></td></tr><tr><td>The export is very large or incomplete</td><td>Try a fresh export and inspect the ZIP before conversion</td><td>Depends on what WhatsApp actually includes</td></tr></tbody></table></div>`],
      ['Check the source before blaming the PDF', `<p>Open the exported ZIP and confirm whether the expected attachment file is actually present. If it is absent from the source export, another converter cannot legitimately restore it. If the file is present but not displayed, then attachment matching, filename changes or format support are the next things to investigate.</p><p>For images specifically, use the <a href="/blog/whatsapp-photos-missing-from-pdf/">seven-step missing WhatsApp photos checklist</a>. You can also use the <a href="/tools/whatsapp-export-checker/">free WhatsApp Export Checker</a> to inspect an export locally before converting it.</p>`]
    ],
    faq: [
      ['What does <Media omitted> mean on WhatsApp?', 'It means an attachment existed in the conversation, but the actual media file is not included in the export you are viewing.'],
      ['Can I recover a photo from “Media omitted”?', 'Not from the placeholder itself. Re-export the original chat with media; recovery is only possible if WhatsApp can still include the original file or you have another copy.'],
      ['Why does iPhone say “image omitted” instead?', 'WhatsApp exports can use different placeholder wording by platform and language. “Image omitted” and “Media omitted” both indicate that the actual attachment is not in that text export.'],
      ['Does “Media omitted” mean my PDF converter deleted the photo?', 'Not necessarily. Check the original TXT or ZIP first. If the source already contains the placeholder and no matching file, the omission happened before PDF conversion.'],
      ['Should I keep the placeholder in the PDF?', 'Usually yes. A placeholder preserves the fact that an attachment existed at that point in the conversation instead of silently changing the record.']
    ]
  },
  'whatsapp-stickers-pdf': {
    description: 'Learn how WhatsApp stickers are represented in chat exports and PDFs, why sticker files can be missing, and when a WebP sticker can be preserved in a printable conversation.',
    sections: [
      ['How WhatsApp stickers appear in an export', `<p>WhatsApp stickers are image attachments rather than plain text. Depending on the export and device, the transcript may reference a sticker file—commonly a WebP image—or may simply indicate that media existed.</p><p>If the actual sticker file is present and the converter supports the image format, it can be placed near the message where it appeared. If the file is missing, the safest printable representation is a labeled placeholder.</p>`],
      ['Keep the original sticker files', `<p>Do not rename or reorganize exported attachment files before conversion. The transcript-to-media relationship often depends on the original filename. Import the original ZIP when possible, or select the TXT and its media files together.</p><p>If a sticker is important to the conversation, verify it in the preview before downloading the PDF.</p>`],
      ['What to do when stickers are missing', `<ol class="steps"><li>Check whether the export was created with media.</li><li>Inspect the ZIP for WebP or other sticker image files.</li><li>Re-import the untouched export.</li><li>Check whether the converter reports a missing or unsupported attachment.</li><li>If the sticker file is absent, preserve the placeholder and original source files rather than substituting a different image.</li></ol><p>The same source-first troubleshooting applies to photos; see <a href="/blog/whatsapp-photos-missing-from-pdf/">WhatsApp photos missing from PDF</a>.</p>`]
    ],
    faq: [
      ['Can WhatsApp stickers be included in a PDF?', 'Sometimes. The sticker file must be present in the export and in an image format the converter can display.'],
      ['Why does my PDF show a sticker placeholder?', 'The export may not contain the sticker file, or its format may not be supported for direct rendering. The placeholder preserves the message position.'],
      ['Are WhatsApp stickers usually WebP files?', 'WhatsApp commonly uses WebP for stickers, although the exact exported files can vary by device and export.']
    ]
  },
  'save-whatsapp-conversation-loved-one': {
    seoTitle: 'How to Save a WhatsApp Conversation With a Loved One',
    description: 'Save a meaningful WhatsApp conversation with a loved one as a private, readable PDF with dates and supported photos. Keep the original export as a source copy.',
    sections: [
      ['A simple way to preserve the conversation', `<p>Export the WhatsApp chat, include media when the photos matter, then create a PDF that keeps names, timestamps and supported images in sequence. The original export should remain untouched; the PDF is the readable keepsake.</p>`],
      ['Choose a meaningful scope', `<p>A lifetime of routine messages can make a keepsake enormous. Pick a meaningful period such as a trip, anniversary, year or family event. ChatToPaper lets you filter the final PDF by date without editing the source export.</p>`],
      ['Protect the private parts', `<p>Before sharing or printing, review names, phone numbers, addresses, personal photos and sensitive messages. A keepsake can be meaningful without including every private detail.</p>`],
      ['Make it printable', `<ol class="steps"><li>Export the chat from WhatsApp.</li><li>Include media if important photos should appear.</li><li>Open the export in ChatToPaper.</li><li>Choose the date range and layout.</li><li>Preview photo-heavy pages and long messages.</li><li>Download the PDF and keep the original export separately.</li></ol>`]
    ],
    faq: [
      ['Can I save a WhatsApp conversation as a keepsake?', 'Yes. Export the chat, create a readable PDF, and keep the untouched export separately as the source.'],
      ['Can the keepsake include photos?', 'Yes, when supported photo files are included in the WhatsApp export and can be matched to their message references.']
    ]
  },
  'print-whatsapp-one-month': {
    seoTitle: 'How to Print One Month of a WhatsApp Chat',
    description: 'Print only one month of a WhatsApp conversation by exporting the chat, filtering the PDF by start and end date, previewing the pages, then printing the shortened document.',
    sections: [
      ['Use the export as the source, then filter the PDF', `<p>You do not need to delete messages manually. Export the available WhatsApp conversation, import it, then set the start and end dates for the month you need. This keeps the original export intact while the PDF contains only the selected period.</p>`],
      ['Pick the exact month', `<ol class="steps"><li>Import the TXT or ZIP.</li><li>Open Customize PDF.</li><li>Set the first day of the month as the start date.</li><li>Set the last day of the month as the end date.</li><li>Confirm the first and last visible messages in the preview.</li><li>Download and print the shortened PDF.</li></ol>`],
      ['Watch for timezone and date-order confusion', `<p>WhatsApp text exports can use regional date formats. If a date such as 04/05 is ambiguous, confirm whether the file uses day/month or month/day before filtering. A plausible-looking wrong date interpretation can exclude the wrong messages.</p>`]
    ],
    faq: [
      ['Can WhatsApp export only one month directly?', 'The reliable workflow is to export the available chat and filter the final PDF by date. That avoids altering the source conversation file.'],
      ['Can I make several month-by-month PDFs from one export?', 'Yes. Keep the original export and create separate PDFs with different date ranges.']
    ]
  },
  'whatsapp-export-multiple-txt-files': {
    seoTitle: 'Why a WhatsApp Export Has Multiple TXT Files',
    description: 'A WhatsApp ZIP can contain more than one TXT file because text documents can be attachments. Learn how to identify the actual chat transcript before converting it.',
    sections: [
      ['Why more than one TXT can appear', `<p>The main WhatsApp transcript is a text file, but a conversation can also contain text documents sent as attachments. Those attached documents may also end in .txt, so a ZIP can legitimately contain several text files.</p>`],
      ['How to identify the chat transcript', `<p>The chat transcript contains repeated message headers with dates, times and sender names. An attached text document usually reads like ordinary prose or data instead. Do not simply choose the largest TXT file.</p>`],
      ['What ChatToPaper does', `<p>ChatToPaper inspects candidate text files for recognizable WhatsApp message headers rather than treating every TXT as the conversation. If an archive is ambiguous, start from the untouched export rather than combining files from different chats.</p>`]
    ],
    faq: [
      ['Does multiple TXT files mean the export is broken?', 'No. Some TXT files may be documents that were shared inside the conversation.'],
      ['Should I rename the files?', 'No. Keep the original filenames until conversion, especially when media and attachments need to be matched to message references.']
    ]
  },
  'print-whatsapp-conversation-double-sided': {
    seoTitle: 'How to Print a WhatsApp Conversation Double-Sided',
    description: 'Create a paginated WhatsApp PDF, then print it double-sided using duplex printing. Learn long-edge vs short-edge flipping and how to test before a long print run.',
    sections: [
      ['Create the PDF first', `<p>Double-sided printing is a printer setting, not a WhatsApp export setting. First create a normal paginated PDF with the conversation in the correct order.</p>`],
      ['Choose duplex printing', `<p>In the print dialog, enable Two-Sided, Duplex or Print on Both Sides. For a portrait document, <strong>flip on the long edge</strong> is usually the book-like option. Short-edge flipping is more like a notepad and can make the reverse side appear upside down.</p>`],
      ['Test two sheets before printing everything', `<ol class="steps"><li>Print pages 1–4 only.</li><li>Check that page 2 appears behind page 1 in the expected orientation.</li><li>Confirm margins and scale.</li><li>Only then print the full PDF.</li></ol>`]
    ],
    faq: [
      ['Should I flip on the long edge or short edge?', 'For most portrait WhatsApp PDFs, long-edge flipping gives normal book-style reading. Test a few pages because printer menus vary.']
    ]
  },
  'save-whatsapp-chat-without-screenshots': {
    seoTitle: 'Save a WhatsApp Chat Without Screenshots',
    description: 'Save a long WhatsApp chat without screenshots by exporting the conversation and turning the TXT or ZIP into a searchable, paginated PDF.',
    sections: [
      ['Why export beats screenshots for long chats', `<p>Exporting avoids hundreds of manual captures, overlapping screenshots, missing gaps and inconsistent page sizes. The source transcript already contains the message sequence and timestamps.</p>`],
      ['A cleaner six-step workflow', `<ol class="steps"><li>Export the conversation from WhatsApp.</li><li>Include media if photos matter.</li><li>Import the TXT or ZIP.</li><li>Verify names, dates and missing-media warnings.</li><li>Preview the page breaks.</li><li>Download the PDF and keep the original export separately.</li></ol>`],
      ['When screenshots still make sense', `<p>For one or two messages, screenshots are faster. For a long conversation, an exported transcript is easier to verify, search, paginate and print.</p>`]
    ],
    faq: [
      ['Can I save a WhatsApp conversation without screenshots?', 'Yes. Use WhatsApp Export Chat, then convert the exported TXT or ZIP into a PDF.']
    ]
  },
  'whatsapp-android-export-with-media': {
    seoTitle: 'WhatsApp Android Export With Media: Step by Step',
    description: 'Export a WhatsApp chat with media on Android, keep the generated files together, verify missing photos, and convert the result into a printable PDF.',
    sections: [
      ['Export from Android', `<ol class="steps"><li>Open the WhatsApp conversation.</li><li>Open the three-dot menu.</li><li>Choose More, then Export chat.</li><li>Choose the option to include media when photos are needed.</li><li>Save or share the resulting export somewhere you can open it in a full browser.</li></ol>`],
      ['Check what was actually included', `<p>An export with media can still be incomplete if a file is unavailable. Inspect the ZIP or import it into ChatToPaper and compare the matched-photo and missing-media counts before creating the final PDF.</p>`],
      ['Keep filenames unchanged', `<p>Attachment matching depends on the references in the transcript. Renaming exported photos can prevent them from being placed beside the correct messages.</p>`]
    ],
    faq: [
      ['Does Include media guarantee every photo is present?', 'No. Verify the actual export. A converter can only place files that WhatsApp included and that remain available.']
    ]
  },
  'print-part-whatsapp-chat-iphone': {
    seoTitle: 'How to Print Part of a WhatsApp Chat on iPhone',
    description: 'Print only part of a WhatsApp chat from iPhone by exporting the conversation, filtering the PDF by date, checking the preview, and printing the selected period.',
    sections: [
      ['Export first, filter second', `<p>Export the conversation from WhatsApp on iPhone, then choose the date range for the final PDF. This is safer than deleting messages from the transcript or assembling screenshots manually.</p>`],
      ['Select the section you need', `<ol class="steps"><li>Save the WhatsApp export to Files or another accessible location.</li><li>Open it in ChatToPaper.</li><li>Set the From and To dates.</li><li>Confirm the first and last messages in the preview.</li><li>Download the shortened PDF.</li><li>Open the PDF in Files and use Share → Print.</li></ol>`],
      ['If you need only a few messages', `<p>For a tiny excerpt, screenshots may be faster. For a multi-day or multi-week section, the date-filtered PDF is easier to paginate and review.</p>`]
    ],
    faq: [
      ['Can I print only part of a WhatsApp chat on iPhone?', 'Yes. Export the conversation, filter the PDF to the dates you need, then print the downloaded PDF from iPhone or another device.']
    ]
  },
  'chat-bubble-vs-transcript-records': {
    seoTitle: 'Chat Bubbles vs Transcript Layout for WhatsApp Records',
    description: 'Compare chat bubbles with a plain transcript layout for WhatsApp PDFs. Bubbles are familiar; transcripts are denser and easier to scan for records.',
    sections: [
      ['Which layout should you choose?', `<div class="table-scroll"><table><thead><tr><th>Layout</th><th>Best for</th><th>Trade-off</th></tr></thead><tbody><tr><td>Chat bubbles</td><td>Keepsakes, familiar reading, visual conversation flow</td><td>Uses more page space</td></tr><tr><td>Plain transcript</td><td>Business records, review, printing many messages</td><td>Looks less like the app</td></tr></tbody></table></div>`],
      ['For records, scanability usually wins', `<p>A transcript layout can place more text on each page and makes names, timestamps and message sequence easier to scan. That matters when the PDF is supporting a job file, order, quote or project record.</p>`],
      ['For memories, familiarity can matter more', `<p>Chat bubbles feel closer to a messaging experience and can make a personal keepsake easier to read. Use the preview to compare page count and readability before deciding.</p>`]
    ],
    faq: [
      ['Is a transcript layout more official?', 'No. Layout does not authenticate a conversation. It only changes presentation and page density.']
    ]
  },
  'does-whatsapp-export-include-timestamps': {
    seoTitle: 'Does WhatsApp Export Include Timestamps?',
    description: 'Yes, WhatsApp text exports normally include date and time information with messages. Learn how timestamps are parsed, why regional date order matters, and what to verify.',
    sections: [
      ['The short answer', `<p>WhatsApp chat exports normally include date and time information in the transcript. A converter can preserve those exported values in a PDF, but it should not invent a timezone that is not present in the source text.</p>`],
      ['Regional date order can be ambiguous', `<p>A timestamp such as 04/05 can mean April 5 or May 4. If the export does not contain enough unambiguous dates to infer the order, confirm the correct day/month or month/day interpretation before downloading.</p>`],
      ['What to verify', `<ul><li>A message whose date you already know.</li><li>Whether the clock is 12-hour or 24-hour.</li><li>Whether multiline messages stay attached to the correct timestamp.</li><li>Whether system notices are included or hidden intentionally.</li></ul>`]
    ],
    faq: [
      ['Does WhatsApp export show the exact time?', 'The text export normally includes the local-looking date and clock time recorded in the transcript. It does not necessarily identify a timezone.']
    ]
  }
};