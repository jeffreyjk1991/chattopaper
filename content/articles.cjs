const clusters = [
  {
    category: 'Convert & save',
    items: [
      ['How to Convert a WhatsApp Chat to PDF (iPhone, Android & Photos)', 'convert-whatsapp-chat-to-pdf', 'Export the chat from WhatsApp, choose media if photos matter, open the TXT or ZIP in a converter, verify dates and attachments in the preview, then download the PDF. ChatToPaper processes the export in your browser and is free during launch.', 'whatsapp chat to pdf'],
      ['How to Convert a WhatsApp ZIP to PDF', 'convert-whatsapp-zip-to-pdf', 'A WhatsApp ZIP usually contains the conversation text plus exported media. A good converter should read the chat text, match image filenames, and preserve each photo near the message that referenced it.', 'whatsapp zip to pdf'],
      ['How to Save a WhatsApp Conversation as a PDF', 'save-whatsapp-conversation-as-pdf', 'Export the conversation first, then convert the exported TXT or ZIP into a paginated PDF. This is more complete than stitching screenshots when the chat is long.', 'save whatsapp conversation pdf'],
      ['How to Download a WhatsApp Chat as a Printable Document', 'download-whatsapp-chat-printable-document', 'WhatsApp exports chat history as text, not as a polished printable document. The practical route is to export the chat and format that export into a PDF with page breaks, sender labels, dates, and photos.', 'printable whatsapp chat'],
      ['How to Turn WhatsApp Messages Into a Document', 'turn-whatsapp-messages-into-document', 'For a readable document, keep the original message order, sender names, timestamps, multiline messages, and media references. PDF is usually the most convenient final format for printing and sharing.', 'whatsapp messages document'],
      ['WhatsApp TXT to PDF: Complete Guide', 'whatsapp-txt-to-pdf', 'A WhatsApp TXT file contains the message transcript. It can be converted into PDF directly, but photos only appear when the matching exported image files are available too.', 'whatsapp txt to pdf'],
      ['WhatsApp Export to PDF: What Gets Preserved?', 'whatsapp-export-to-pdf-what-is-preserved', 'A careful conversion can preserve readable message order, sender names, timestamps, multiline text, and supported exported photos. It cannot restore messages or media that are absent from the export.', 'whatsapp export pdf'],
      ['How to Make a PDF From One WhatsApp Chat', 'make-pdf-from-one-whatsapp-chat', 'Export only the conversation you want, choose Include Media if photos matter, then convert and preview that single export. Working one chat at a time reduces mix-ups and makes media matching more dependable.', 'one whatsapp chat pdf'],
      ['How to Create a PDF of WhatsApp Messages With Dates and Times', 'whatsapp-messages-pdf-dates-times', 'Use the timestamps contained in the export rather than adding new times manually. A converter should retain the exported date and clock value while letting you filter the final PDF by date range.', 'whatsapp pdf dates times'],
      ['Best Way to Archive a WhatsApp Conversation', 'best-way-archive-whatsapp-conversation', 'For a human-readable archive, keep the original export plus a PDF copy. The export preserves source text and media files; the PDF provides a convenient version for reading, printing, and sharing.', 'archive whatsapp conversation']
    ]
  },
  {
    category: 'iPhone',
    items: [
      ['How to Export a WhatsApp Chat on iPhone', 'export-whatsapp-chat-iphone', 'Open the conversation, use WhatsApp’s Export Chat option, decide whether to include media, and save or share the export somewhere you can access it. The export can then be formatted into a PDF.', 'export whatsapp chat iphone'],
      ['How to Print a WhatsApp Conversation From iPhone', 'print-whatsapp-conversation-iphone', 'The cleanest approach is to export the chat, convert it to PDF, then print the finished PDF from iPhone, iPad, Mac, or another computer.', 'print whatsapp chat iphone'],
      ['How to Save WhatsApp Messages as PDF on iPhone', 'save-whatsapp-messages-pdf-iphone', 'WhatsApp does not export a styled PDF directly. Export the chat first, then use the TXT or ZIP to produce a PDF that keeps names, times, and supported photos together.', 'save whatsapp messages pdf iphone'],
      ['WhatsApp iPhone Export With Media: What to Expect', 'whatsapp-iphone-export-with-media', 'When you choose Include Media, WhatsApp attaches available media to the export. The exact amount included can vary, so always compare the converter’s message and photo counts with what you expected.', 'whatsapp iphone export media'],
      ['How to Find a WhatsApp Export in the iPhone Files App', 'find-whatsapp-export-iphone-files', 'If you save the export to Files, note the folder you chose during the share step. Searching for .zip or .txt in Files can help you locate the export before conversion.', 'find whatsapp export iphone'],
      ['Why an iPhone WhatsApp Export Has No Photos', 'iphone-whatsapp-export-no-photos', 'The most common reason is that the chat was exported Without Media, or that WhatsApp only included part of the media set. Re-export with Include Media and check the ZIP before converting.', 'iphone whatsapp export photos missing'],
      ['How to Print Only Part of a WhatsApp Chat on iPhone', 'print-part-whatsapp-chat-iphone', 'Export the full available chat, then set a start and end date in the converter before creating the PDF. This avoids manually deleting messages from screenshots or text files.', 'print part whatsapp chat iphone'],
      ['How to Make a WhatsApp Chat Book From iPhone', 'make-whatsapp-chat-book-iphone', 'Create a paginated PDF first, choose a consistent paper size and readable text size, then print or send the PDF to a book-printing service. Review photo quality before ordering a physical copy.', 'whatsapp chat book iphone'],
      ['How to Export a Long WhatsApp Chat on iPhone', 'export-long-whatsapp-chat-iphone', 'Long exports can be limited by WhatsApp and the sharing method. If one export is too large, consider exporting without media or working with a narrower date range for the printable PDF.', 'long whatsapp export iphone'],
      ['iPhone WhatsApp Chat to PDF With Photos', 'iphone-whatsapp-chat-to-pdf-with-photos', 'Use Include Media when exporting, keep the TXT and image files together, and convert them as one set. A reliable preview should show how many photos were matched before you pay or download.', 'iphone whatsapp pdf photos']
    ]
  },
  {
    category: 'Android',
    items: [
      ['How to Export a WhatsApp Chat on Android & Save as PDF', 'export-whatsapp-chat-android', 'Export a WhatsApp conversation on Android, include media when photos matter, then turn the TXT or ZIP into a clean PDF. ChatToPaper works in the browser, requires no account, and does not upload your chat files.', 'export whatsapp chat android pdf'],
      ['How to Print a WhatsApp Conversation From Android', 'print-whatsapp-conversation-android', 'Export the conversation, convert it to PDF, and print the PDF from Android or a computer. This gives you proper page breaks instead of dozens of individual screenshots.', 'print whatsapp chat android'],
      ['How to Save WhatsApp Messages as PDF on Android', 'save-whatsapp-messages-pdf-android', 'Exporting and converting is more dependable than printing from the chat screen. The exported transcript carries the message sequence and timestamps used to build the PDF.', 'save whatsapp messages pdf android'],
      ['WhatsApp Android Export With Media: Step by Step', 'whatsapp-android-export-with-media', 'Choose Include media during export, save the generated ZIP or shared files, then convert that export as a single conversation. Check the photo count before creating the final PDF.', 'whatsapp android export media'],
      ['Why an Android WhatsApp Export Is Missing Images', 'android-whatsapp-export-missing-images', 'Missing images usually mean they were not included in the export, were deleted from the device, or were omitted because of export limits. A converter cannot recreate media that is not present.', 'android whatsapp export missing images'],
      ['How to Print a Date Range From WhatsApp on Android', 'print-date-range-whatsapp-android', 'Export the conversation and use date filters during PDF creation. This lets you keep the source export intact while producing a shorter document for a specific week, month, trip, or project.', 'whatsapp date range android'],
      ['How to Convert an Android WhatsApp TXT File to PDF', 'android-whatsapp-txt-to-pdf', 'Select the exported TXT file for a text-only PDF, or select the TXT plus exported photos when you want media included. The filenames in the transcript are what connect photos to messages.', 'android whatsapp txt pdf'],
      ['How to Save a WhatsApp Group Chat as PDF on Android', 'android-whatsapp-group-chat-pdf', 'Export the group chat, keep participant names visible, then convert the transcript without merging different senders. Group PDFs are most readable when names and timestamps are retained.', 'android whatsapp group chat pdf'],
      ['How to Create a WhatsApp Chat Archive on Android', 'android-whatsapp-chat-archive', 'Keep both the original export and a printable PDF. The export is useful as source material; the PDF is easier to browse, print, and share with someone who does not use WhatsApp.', 'android whatsapp archive'],
      ['Android WhatsApp Chat to PDF With Photos', 'android-whatsapp-chat-to-pdf-with-photos', 'Export with media, preserve the ZIP or accompanying image files, and use a converter that reports matched and missing photos before download.', 'android whatsapp pdf photos']
    ]
  },
  {
    category: 'Photos & media',
    items: [
      ['How to Print a WhatsApp Chat With Photos', 'print-whatsapp-chat-with-photos', 'Export with media, then use a converter that places each matched image near the message that referenced its filename. This is much more readable than printing the transcript and photos separately.', 'print whatsapp chat with photos'],
      ['How to Convert WhatsApp ZIP to PDF With Photos', 'whatsapp-zip-to-pdf-with-photos', 'A ZIP-to-PDF workflow should inspect the chat text, locate photo references, match them to image files inside the ZIP, and show missing-photo warnings before creating the document.', 'whatsapp zip pdf photos'],
      ['WhatsApp Photos Missing From Export or PDF? 7 Things to Check', 'whatsapp-photos-missing-from-pdf', 'If WhatsApp photos are missing, first check whether you exported with media, whether the image files are actually inside the ZIP, and whether their filenames still match the transcript. This guide walks through the most common causes and fixes.', 'whatsapp photos missing export pdf'],
      ['WhatsApp Export Says “Media Omitted”? What It Means and How to Fix It', 'whatsapp-export-media-omitted', 'Seeing “Media omitted” in a WhatsApp export means the transcript knows an attachment existed but the actual file is not available in the export. Here is how to tell whether re-exporting with media can fix it and what cannot be recovered.', 'whatsapp export media omitted fix'],
      ['How WhatsApp Photo Filenames Match Messages', 'whatsapp-photo-filenames-match-messages', 'WhatsApp exports often reference an attachment filename in the transcript. Matching that normalized filename to an exported image lets a converter restore the photo to the right point in the conversation.', 'whatsapp photo filename'],
      ['Can WhatsApp Voice Notes Be Put in a PDF?', 'whatsapp-voice-notes-pdf', 'A PDF can list that a voice note existed, but the audio itself is not naturally represented on paper. A simple chat-to-PDF tool should use a labeled placeholder unless it explicitly supports transcription or QR links.', 'whatsapp voice notes pdf'],
      ['Can WhatsApp Videos Be Included in a Printable PDF?', 'whatsapp-videos-printable-pdf', 'Video cannot play inside a normal printed page. A practical PDF can preserve the video filename or placeholder, while photos and text remain directly printable.', 'whatsapp video pdf'],
      ['How to Save WhatsApp Stickers in a PDF Export', 'whatsapp-stickers-pdf', 'WhatsApp stickers are usually WebP image files. If the sticker file is included in the chat export and supported by the converter, it can be preserved in context; otherwise the PDF should show a clear placeholder instead of silently dropping it.', 'whatsapp stickers pdf export'],
      ['How to Keep WhatsApp Photos in the Correct Order', 'whatsapp-photos-correct-order', 'Do not sort photos by the file system date alone. Use the message sequence in the exported transcript and place each matched image where its attachment reference appears.', 'whatsapp photos order'],
      ['How to Check Whether a WhatsApp Export Includes Media', 'check-whatsapp-export-includes-media', 'Before conversion, inspect the ZIP or selected files for image files and compare them with attachment references in the transcript. After import, use the converter’s matched-photo count as a second check.', 'check whatsapp export media']
    ]
  },
  {
    category: 'Printing & formatting',
    items: [
      ['Best Page Size for Printing WhatsApp Chats: A4 vs Letter', 'whatsapp-pdf-a4-vs-letter', 'Choose A4 for most countries and US Letter for standard North American printers. The most important thing is to preview page breaks and photo sizing before printing.', 'whatsapp pdf a4 letter'],
      ['Best Font Size for a Printed WhatsApp Conversation', 'best-font-size-printed-whatsapp-chat', 'Use a size that remains comfortable on paper rather than matching the tiny phone interface. A moderate text size with generous spacing is usually easier to read over dozens of pages.', 'whatsapp print font size'],
      ['Chat Bubbles vs Transcript Layout for WhatsApp PDFs', 'whatsapp-pdf-chat-bubbles-vs-transcript', 'Chat bubbles feel familiar and personal; transcript layouts are denser and more formal. Pick based on whether the PDF is primarily a keepsake, a record, or a document someone needs to scan quickly.', 'whatsapp pdf layout'],
      ['How to Make a Long WhatsApp PDF Easier to Read', 'make-long-whatsapp-pdf-readable', 'Use date headings, sender labels, consistent timestamps, sensible margins, and restrained photo sizes. Filtering to the dates you actually need can reduce page count dramatically.', 'long whatsapp pdf readable'],
      ['How to Print WhatsApp Messages Without Screenshots', 'print-whatsapp-messages-without-screenshots', 'Export the chat and convert the transcript to PDF. This preserves long stretches of text more efficiently and avoids manually cropping, ordering, and printing hundreds of screenshots.', 'print whatsapp without screenshots'],
      ['How to Print a WhatsApp Conversation Double-Sided', 'print-whatsapp-conversation-double-sided', 'Create a normal paginated PDF first, then enable duplex or two-sided printing in your printer dialog. Review whether your printer flips on the long edge or short edge before a large print run.', 'double sided whatsapp print'],
      ['How to Print Only WhatsApp Messages From One Month', 'print-whatsapp-one-month', 'Use a date filter after importing the exported conversation. Keeping the source export unchanged gives you flexibility to create several month-specific PDFs later.', 'whatsapp one month pdf'],
      ['How to Make a WhatsApp Conversation Into a Keepsake Book', 'whatsapp-conversation-keepsake-book', 'Create a clean PDF, choose the date range and layout, inspect image quality, then print it yourself or upload the PDF to a book-printing provider. Keep the original export as a backup.', 'whatsapp keepsake book'],
      ['How to Reduce the Page Count of a WhatsApp PDF', 'reduce-whatsapp-pdf-page-count', 'Narrow the date range, use a compact transcript layout, slightly reduce text size, and limit photo size. Avoid making the text so small that the document becomes unpleasant to read.', 'reduce whatsapp pdf pages'],
      ['How to Preview a WhatsApp PDF Before Downloading', 'preview-whatsapp-pdf-before-download', 'A useful converter should show page count, message count, photo count, date interpretation, and missing-media warnings before payment or download.', 'whatsapp pdf preview']
    ]
  },
  {
    category: 'Troubleshooting',
    items: [
      ['WhatsApp Export ZIP Won’t Open: What to Check', 'whatsapp-export-zip-wont-open', 'Try a fresh export first. Damaged, partial, encrypted, split, or unusually large ZIP archives may fail integrity checks and should not be silently processed.', 'whatsapp zip wont open'],
      ['WhatsApp Chat Export Has the Wrong Dates', 'whatsapp-export-wrong-dates', 'Ambiguous dates such as 04/05 can mean different things in different regions. A converter should detect the ambiguity, let you choose day/month or month/day, and require a preview check.', 'whatsapp wrong date format'],
      ['Why WhatsApp Messages Are Out of Order in a PDF', 'whatsapp-messages-out-of-order-pdf', 'The PDF should follow transcript order rather than re-sorting by sender or file modification time. If timestamps cannot be parsed, those entries should stay in source order and be flagged.', 'whatsapp messages order pdf'],
      ['WhatsApp PDF Shows Missing Photo Placeholders', 'whatsapp-pdf-missing-photo-placeholders', 'A placeholder means the transcript referenced an image but the matching file was unavailable or ambiguous. Re-export with media or select the missing image file together with the TXT.', 'whatsapp missing photo placeholder'],
      ['WhatsApp Export Is Too Large to Convert', 'whatsapp-export-too-large-convert', 'Reduce the scope: export without media, select a shorter period for the final PDF, or divide the job into smaller conversation segments. Very large media archives can exceed browser memory limits.', 'whatsapp export too large'],
      ['Why a WhatsApp TXT File Has Strange Characters', 'whatsapp-txt-strange-characters', 'Character issues usually come from text encoding or damaged exports. Modern WhatsApp exports are Unicode; a converter should reject unreadable encoding rather than replacing lots of characters silently.', 'whatsapp txt encoding'],
      ['Why a WhatsApp Export Has Multiple TXT Files', 'whatsapp-export-multiple-txt-files', 'A ZIP can contain attached text documents as well as the chat transcript. If several files look like conversations, unzip the archive and choose the correct chat TXT with its media rather than guessing.', 'whatsapp multiple txt files'],
      ['Why a WhatsApp PDF Is Blank', 'whatsapp-pdf-blank', 'A blank result usually means no messages were parsed, the selected date range excludes everything, or the browser could not render the document. Recheck the source file and preview counts before download.', 'whatsapp pdf blank'],
      ['Why WhatsApp File Upload Does Not Work in a Preview Viewer', 'whatsapp-upload-file-preview-viewer', 'Embedded document viewers may block file pickers, JavaScript, downloads, or browser APIs. Open the actual website in Safari, Chrome, Edge, or Firefox rather than an attachment preview.', 'whatsapp upload not working browser'],
      ['How to Fix a WhatsApp PDF With the Wrong Time Format', 'whatsapp-pdf-wrong-time-format', 'Keep the clock value from the export and avoid timezone conversion unless the tool clearly explains it. If the source contains 12-hour or 24-hour times, the PDF should display them consistently.', 'whatsapp pdf time format']
    ]
  },
  {
    category: 'Privacy & records',
    items: [
      ['Is It Safe to Upload a WhatsApp Chat to a PDF Converter?', 'is-whatsapp-pdf-converter-safe', 'Prefer tools that process the chat locally in your browser, explain exactly what leaves the device, and do not require an account for a one-off conversion. Always review the privacy policy before using sensitive conversations.', 'safe whatsapp pdf converter'],
      ['How Local Browser Processing Protects WhatsApp Exports', 'local-browser-processing-whatsapp', 'Local processing means the browser reads and formats the selected files on your device instead of sending the conversation to an application server. Payment can still be handled separately without transmitting chat contents.', 'local whatsapp processing'],
      ['Can a WhatsApp PDF Be Used as Legal Evidence?', 'whatsapp-pdf-legal-evidence', 'A formatted PDF can make a conversation easier to read, but formatting software does not authenticate the messages or certify legal admissibility. Preserve original source material and seek qualified legal advice for evidentiary use.', 'whatsapp pdf legal evidence'],
      ['How to Preserve a WhatsApp Conversation for Your Records', 'preserve-whatsapp-conversation-records', 'Keep the original export, any included media files, and a readable PDF copy. Record when you made the export and avoid altering the source files if provenance may matter later.', 'preserve whatsapp records'],
      ['How to Share a WhatsApp Conversation PDF Carefully', 'share-whatsapp-pdf-privacy', 'Review names, phone numbers, photos, and private details before sharing. Create the narrowest date range necessary and send the PDF only to people who should receive it.', 'share whatsapp pdf privacy'],
      ['WhatsApp Advanced Chat Privacy and Chat Exports', 'whatsapp-advanced-chat-privacy-export', 'WhatsApp’s Advanced Chat Privacy can prevent chat exporting. If export is disabled for a conversation, a PDF converter cannot bypass that restriction and should not claim that it can.', 'advanced chat privacy export'],
      ['What a WhatsApp PDF Converter Should Never Promise', 'whatsapp-pdf-converter-red-flags', 'Be cautious of claims about recovering deleted messages, bypassing export restrictions, proving authenticity, or certifying legal evidence. A formatting tool should describe its limits clearly.', 'whatsapp pdf converter red flags'],
      ['How to Remove Sensitive Messages From a Printable Chat', 'remove-sensitive-messages-printable-chat', 'The safest approach is to limit the date range or use a purpose-built redaction workflow after creating the PDF. Do not assume deleting visible text also removes hidden document data unless the redaction tool guarantees it.', 'remove sensitive whatsapp messages'],
      ['Do WhatsApp PDF Converters Store Your Photos?', 'do-whatsapp-pdf-converters-store-photos', 'It depends on the tool. A browser-local converter can process photos without uploading them, while server-based converters may transmit files. Check the implementation and privacy statement rather than assuming.', 'whatsapp converter stores photos'],
      ['How to Keep a Private WhatsApp Archive Offline', 'private-whatsapp-archive-offline', 'Save the original export and PDF to encrypted local storage or another storage method you control. If you use cloud backup, understand who can access the account and whether additional encryption is available.', 'offline whatsapp archive']
    ]
  },
  {
    category: 'Use cases',
    items: [
      ['How to Save a WhatsApp Conversation With a Loved One', 'save-whatsapp-conversation-loved-one', 'Export the conversation, include the photos that matter, choose a meaningful date range, and create a readable PDF. Keep both the original export and the finished keepsake.', 'save chat loved one'],
      ['How to Print a Family WhatsApp Group Chat', 'print-family-whatsapp-group-chat', 'Preserve participant names, keep timestamps visible, and consider a transcript layout if many family members are involved. Filter to a trip, holiday, or year to keep the document manageable.', 'family whatsapp group print'],
      ['How to Make a Wedding WhatsApp Chat Keepsake', 'wedding-whatsapp-chat-keepsake', 'Choose the period around planning, the wedding, and the first days afterward; include meaningful photos; then preview the document as a keepsake rather than printing an entire multi-year conversation.', 'wedding whatsapp keepsake'],
      ['How to Save Travel WhatsApp Messages and Photos Together', 'travel-whatsapp-messages-photos-pdf', 'Use the trip dates as your range and include media so photos appear alongside the planning and reactions around them. The result becomes a compact travel diary built from the original chat.', 'travel whatsapp pdf'],
      ['How to Turn a Long-Distance Relationship Chat Into a Book', 'long-distance-whatsapp-chat-book', 'Select meaningful periods rather than every message, keep dates and photos, and use a warm chat-bubble layout. A shorter edited volume is usually more readable than an exhaustive archive.', 'relationship whatsapp book'],
      ['How to Print Customer WhatsApp Conversations for Records', 'customer-whatsapp-conversation-records', 'Use a transcript-style PDF with sender names and timestamps, keep the date range relevant to the transaction, and preserve the original export separately. Do not present a formatted PDF as independently authenticated evidence.', 'customer whatsapp records'],
      ['How to Save WhatsApp Project Discussions as PDF', 'whatsapp-project-discussion-pdf', 'Filter to the project period, keep timestamps, and use a dense transcript layout for easier scanning. Store the PDF with the project files while retaining the original export when appropriate.', 'whatsapp project pdf'],
      ['How to Print a WhatsApp Conversation for a Gift', 'whatsapp-chat-pdf-gift', 'Choose a meaningful excerpt, include photos, add a simple title, and preview the page count before printing. A focused conversation often makes a better gift than an unedited full history.', 'whatsapp conversation gift'],
      ['How to Save Parenting WhatsApp Messages as a Memory Book', 'parenting-whatsapp-memory-book', 'Use milestones or yearly date ranges, keep photos with the surrounding messages, and create separate PDFs if the archive becomes very long. Review private details before sharing copies.', 'parenting whatsapp memory book'],
      ['How to Archive Important WhatsApp Business Messages', 'archive-important-whatsapp-business-messages', 'Export the relevant conversation, preserve the source files, and create a dated PDF for easier review. Follow your organization’s retention, privacy, and legal policies for customer communications.', 'business whatsapp archive']
    ]
  },
  {
    category: 'Comparisons & decisions',
    items: [
      ['WhatsApp Chat PDF vs Screenshots: Which Is Better?', 'whatsapp-pdf-vs-screenshots', 'PDF conversion is usually better for long conversations because it preserves continuous text, page breaks, and search-friendly organization. Screenshots are useful for a few isolated messages or when exact visual appearance matters.', 'whatsapp pdf vs screenshots'],
      ['WhatsApp Export TXT vs PDF: What Is the Difference?', 'whatsapp-txt-vs-pdf', 'TXT is closer to the raw exported transcript and is easy for software to parse; PDF is designed for human reading, printing, and sharing. Keeping both gives you flexibility.', 'whatsapp txt vs pdf'],
      ['WhatsApp PDF With Photos vs Text Only', 'whatsapp-pdf-photos-vs-text-only', 'Text-only exports are smaller and faster. Photo-inclusive PDFs preserve more context but create larger files and depend on the export actually containing the images.', 'whatsapp pdf photos vs text'],
      ['Free WhatsApp to PDF Tools vs Paid Converters', 'free-vs-paid-whatsapp-pdf-converter', 'Compare privacy, media support, page limits, watermarks, preview quality, and whether the tool processes locally. Price matters, but a cheap result is not useful if photos are missing or the formatting is unreliable.', 'free paid whatsapp pdf'],
      ['WhatsApp Chat Book vs Printable PDF', 'whatsapp-chat-book-vs-pdf', 'A PDF is flexible, immediate, and easy to reprint. A physical book feels more permanent but costs more and is harder to revise after you notice a missing photo or incorrect date range.', 'whatsapp chat book vs pdf'],
      ['A4 vs US Letter for WhatsApp Conversation PDFs', 'a4-vs-us-letter-whatsapp-pdf', 'Use the paper standard that matches the printer or print service you plan to use. A4 is common globally; US Letter is standard in the United States and Canada.', 'a4 vs letter whatsapp'],
      ['Chat Bubble Layout vs Plain Transcript for Records', 'chat-bubble-vs-transcript-records', 'Bubbles are easier to recognize visually; transcripts fit more text per page and can feel more neutral. For business or documentation purposes, a transcript layout is usually easier to scan.', 'chat bubbles vs transcript'],
      ['Local WhatsApp PDF Converter vs Cloud Upload Converter', 'local-vs-cloud-whatsapp-pdf-converter', 'Local conversion reduces exposure because chat files stay in the browser. Cloud conversion may offer more server-side features, but it requires trusting the service with uploaded conversation data.', 'local vs cloud whatsapp converter'],
      ['One-Time WhatsApp PDF Tool vs Subscription Service', 'one-time-vs-subscription-whatsapp-pdf', 'If you only need occasional exports, a small one-time fee is easier to justify. Subscriptions make more sense when you convert chats frequently or need broader document-management features.', 'one time whatsapp pdf'],
      ['Printable WhatsApp PDF vs Word Document', 'whatsapp-pdf-vs-word-document', 'PDF keeps page layout stable across devices and printers. Word documents are easier to edit but can reflow, change fonts, or move images when opened in different software.', 'whatsapp pdf vs word']
    ]
  },
  {
    category: 'Business records',
    items: [
      ['How to Keep WhatsApp Customer Orders as Business Records', 'whatsapp-customer-orders-business-records', 'If customers place or confirm orders in WhatsApp, export the completed conversation and keep a readable PDF alongside your normal order, payment and accounting records. The PDF creates a convenient paper trail of what was requested, changed and confirmed.', 'whatsapp orders business records'],
      ['How to Save WhatsApp Quotes and Customer Approvals as a PDF', 'whatsapp-quotes-customer-approvals-pdf', 'When a customer approves a quote, scope, price or change in WhatsApp, a dated PDF of the relevant conversation can make the decision easier to review later. Keep it with the formal quote, invoice or job record rather than treating chat alone as your accounting system.', 'whatsapp quote approval record'],
      ['How to Keep WhatsApp Supplier Orders and Purchase Discussions', 'whatsapp-supplier-orders-purchase-records', 'Small businesses often confirm quantities, substitutions, delivery dates and prices with suppliers in WhatsApp. Exporting the conversation to PDF gives you a readable reference to store with purchase orders, receipts and inventory records.', 'whatsapp supplier order records'],
      ['How Contractors Can Save WhatsApp Job Instructions and Change Approvals', 'whatsapp-contractor-job-records', 'Contractors can preserve customer instructions, photos, scheduling details and approved changes from a WhatsApp job thread in one readable PDF. Keep the PDF with estimates, invoices and signed agreements for a clearer project history.', 'whatsapp contractor job records'],
      ['How Property Managers Can Save WhatsApp Tenant and Vendor Conversations', 'whatsapp-property-management-records', 'Property managers often receive repair requests, access instructions, photos and vendor updates through WhatsApp. A PDF export can create a readable record for the property file while the original source export is retained separately.', 'whatsapp property management records'],
      ['How Freelancers and Service Businesses Can Save WhatsApp Client Records', 'whatsapp-freelancer-client-records', 'Freelancers and service businesses can preserve project requirements, revisions, delivery confirmations and client approvals from WhatsApp as a PDF. Store it with the proposal, invoice and project files so important decisions are not buried in a chat thread.', 'whatsapp client records freelancer']
    ]
  },
  {
    category: 'Search questions',
    items: [
      ['Can You Export WhatsApp Chats to PDF?', 'can-you-export-whatsapp-chats-to-pdf', 'Yes, but WhatsApp itself generally exports chat history as text with optional media rather than a styled PDF. A separate formatting step turns that export into a printable PDF.', 'export whatsapp to pdf'],
      ['Can You Print an Entire WhatsApp Conversation?', 'can-you-print-entire-whatsapp-conversation', 'You can print a conversation after exporting and formatting it, but very long chats may exceed practical file, page, or browser limits. Splitting by date range often produces a better result.', 'print entire whatsapp conversation'],
      ['Can You Export WhatsApp Chats With Photos?', 'can-you-export-whatsapp-chats-with-photos', 'Yes, when WhatsApp offers Include Media for the chat and the media is available. Export limits can still omit some files, so verify the photo count after import.', 'export whatsapp with photos'],
      ['Can You Save a WhatsApp Chat Without Screenshots?', 'save-whatsapp-chat-without-screenshots', 'Yes. Export the conversation and convert the transcript to PDF. This scales much better than capturing a long sequence of screenshots.', 'save whatsapp without screenshots'],
      ['Can You Select a Date Range When Exporting WhatsApp?', 'whatsapp-export-date-range', 'WhatsApp export itself may not provide a custom date-range selector. A converter can filter the exported messages afterward so your final PDF covers only the dates you need.', 'whatsapp export date range'],
      ['Does WhatsApp Export Include Deleted Messages?', 'does-whatsapp-export-include-deleted-messages', 'A chat export contains what WhatsApp makes available at export time. A PDF converter cannot recover deleted messages that are missing from the export.', 'whatsapp deleted messages export'],
      ['Does WhatsApp Export Include Timestamps?', 'does-whatsapp-export-include-timestamps', 'WhatsApp chat exports normally include date and time information in the transcript. A converter should preserve those values and clearly flag dates it cannot interpret.', 'whatsapp export timestamps'],
      ['Can You Print WhatsApp Group Chats?', 'can-you-print-whatsapp-group-chats', 'Yes. Keep participant names and timestamps visible so the printed conversation remains understandable when many people are speaking.', 'print whatsapp group'],
      ['Can You Convert WhatsApp Chats Offline?', 'can-you-convert-whatsapp-chats-offline', 'A browser-based converter can perform the formatting locally after the page is loaded, provided its required code is already available. Payment or analytics features may still require an internet connection.', 'offline whatsapp converter'],
      ['What Is the Easiest Way to Print WhatsApp Messages?', 'easiest-way-print-whatsapp-messages', 'For more than a handful of messages, export the chat and convert it to a PDF with page breaks. Screenshots are faster only for very short excerpts.', 'easiest way print whatsapp']
    ]
  }
];

const published = '2026-10-22';
const updated = '2026-10-23';

// Consolidated search library: keep one strong page per distinct user intent.
// Retired overlapping URLs are permanently redirected in vercel.json so any
// existing links/signals flow into the closest surviving guide.
const KEEP = new Set([
  'convert-whatsapp-chat-to-pdf',
  'convert-whatsapp-zip-to-pdf',
  'whatsapp-txt-to-pdf',
  'whatsapp-export-to-pdf-what-is-preserved',
  'best-way-archive-whatsapp-conversation',
  'export-whatsapp-chat-iphone',
  'export-whatsapp-chat-android',
  'print-whatsapp-chat-with-photos',
  'whatsapp-photos-missing-from-pdf',
  'whatsapp-export-media-omitted',
  'whatsapp-voice-notes-pdf',
  'whatsapp-pdf-a4-vs-letter',
  'whatsapp-pdf-chat-bubbles-vs-transcript',
  'print-whatsapp-messages-without-screenshots',
  'whatsapp-conversation-keepsake-book',
  'whatsapp-export-zip-wont-open',
  'whatsapp-export-wrong-dates',
  'whatsapp-export-too-large-convert',
  'whatsapp-txt-strange-characters',
  'is-whatsapp-pdf-converter-safe',
  'whatsapp-pdf-legal-evidence',
  'preserve-whatsapp-conversation-records',
  'whatsapp-advanced-chat-privacy-export',
  'whatsapp-pdf-vs-screenshots',
  'whatsapp-txt-vs-pdf',
  'local-vs-cloud-whatsapp-pdf-converter',
  'whatsapp-export-date-range',
  'does-whatsapp-export-include-deleted-messages',
  'can-you-print-whatsapp-group-chats',
  'easiest-way-print-whatsapp-messages',
  'whatsapp-stickers-pdf',
  'whatsapp-customer-orders-business-records',
  'whatsapp-quotes-customer-approvals-pdf',
  'whatsapp-supplier-orders-purchase-records',
  'whatsapp-contractor-job-records',
  'whatsapp-property-management-records',
  'whatsapp-freelancer-client-records'
]);

const articles = clusters
  .flatMap(cluster => cluster.items.map(([title, slug, answer, keyword], index) => ({
    title, slug, category: cluster.category, answer, keyword,
    description: answer,
    published, updated,
    order: index
  })))
  .filter(article => KEEP.has(article.slug));

if (articles.length !== 37) throw new Error(`Expected 37 focused articles, got ${articles.length}`);

const detailed = require('./detailed-guides.cjs');
const materiallyUpdated = new Set([
  'convert-whatsapp-chat-to-pdf',
  'export-whatsapp-chat-android',
  'whatsapp-export-media-omitted',
  'whatsapp-photos-missing-from-pdf',
  'whatsapp-stickers-pdf'
]);
for (const article of articles) {
  if (detailed[article.slug]) Object.assign(article, detailed[article.slug]);
  if (materiallyUpdated.has(article.slug)) article.updated = article.slug==='export-whatsapp-chat-android' ? '2026-10-30' : '2026-10-28';
}
module.exports = articles;