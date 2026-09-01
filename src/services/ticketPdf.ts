// ============================================================
// Ticket PDF — renders a designed HTML ticket to a PDF file and
// opens the system share/save sheet. Uses expo-print + expo-sharing.
// (Mobile equivalent of the PHP lib/ticket_pdf.php.)
// ============================================================
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { ticketHtml, shortId, type TicketData } from '@/services/ticketTemplate';

export type { TicketData } from '@/services/ticketTemplate';

// Renders the ticket to a PDF and returns its base64 content (no data-URI
// prefix). Used to attach the PDF to the confirmation email via EmailJS.
export async function ticketPdfBase64(t: TicketData): Promise<string> {
  const { base64 } = await Print.printToFileAsync({ html: ticketHtml(t), base64: true });
  if (!base64) throw new Error('Could not generate the ticket PDF.');
  return base64;
}

// Generates the PDF and lets the user save/share it.
//
// Some devices/clients (notably Expo Go) reject sharing a generated file URI
// with "not allowed to read file given the URL". So we try the share sheet
// first, and if that is unavailable or rejected we fall back to the native
// print dialog ("Save as PDF" on Android, print/share sheet on iOS), which
// needs no file-provider access at all.
export async function downloadTicketPdf(t: TicketData): Promise<void> {
  const html = ticketHtml(t);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // Copy into the document directory with a friendly filename so the shared
  // file is named nicely (and lives in a provider-served location).
  let shareUri = uri;
  try {
    const filename = `Ticket_${t.bookingId.slice(0, 8).toUpperCase()}.pdf`;
    const dest = new File(Paths.document, filename);
    if (dest.exists) dest.delete();
    await new File(uri).copy(dest);
    shareUri = dest.uri;
  } catch {
    shareUri = uri;
  }

  try {
    if (!(await Sharing.isAvailableAsync())) throw new Error('sharing-unavailable');
    await Sharing.shareAsync(shareUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Ticket ${shortId(t.bookingId)}`,
      UTI: 'com.adobe.pdf',
    });
  } catch {
    // Fallback that works everywhere: render straight to the print dialog.
    await Print.printAsync({ html });
  }
}
