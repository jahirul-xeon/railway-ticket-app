// ============================================================
// Ticket PDF — renders a designed HTML ticket to a PDF file and
// opens the system share/save sheet. Uses expo-print + expo-sharing.
// (Mobile equivalent of the PHP lib/ticket_pdf.php.)
// ============================================================
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { formatBDT, formatDate, formatDateTime } from '@/utils/format';

export type TicketData = {
  bookingId: string;
  trainName: string;
  trainCode?: number;
  fromStation: string;
  toStation: string;
  startTime?: string;
  endTime?: string;
  travelDate: string; // YYYY-MM-DD
  className: string;
  classType?: string;
  seats: string[];
  passengerName: string;
  passengerAge?: number;
  gender?: string;
  paymentMethod?: string;
  totalFare: number;
  status?: string;
  bookedAtMs?: number;
};

const strip = (s: string) => s.replace(' Railway Station', '');
const short = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

function ticketHtml(t: TicketData): string {
  const perforations = Array.from({ length: 30 })
    .map(() => '<span class="hole"></span>')
    .join('');

  const rows: [string, string][] = [
    ['Passenger', t.passengerName + (t.passengerAge ? `, ${t.passengerAge}` : '')],
    ['Class', t.className + (t.classType ? ` (${t.classType})` : '')],
    ['Seats', t.seats.join(', ')],
    ['Date', formatDate(t.travelDate)],
  ];
  if (t.gender) rows.push(['Gender', t.gender]);
  if (t.paymentMethod) rows.push(['Payment', t.paymentMethod]);

  const detailRows = rows
    .map(
      ([k, v]) => `
      <div class="cell">
        <div class="k">${k}</div>
        <div class="v">${v}</div>
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'Helvetica Neue', Roboto, Arial, sans-serif;
    background: #eef2f0;
    padding: 28px;
    color: #15241e;
  }
  .ticket {
    max-width: 640px;
    margin: 0 auto;
    background: #fff;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(11,59,44,.18);
  }
  .top {
    background: linear-gradient(135deg, #0B6E4F 0%, #095C42 100%);
    color: #fff;
    padding: 26px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo {
    width: 46px; height: 46px; border-radius: 12px;
    background: rgba(255,255,255,.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
  }
  .brand h1 { font-size: 19px; font-weight: 800; letter-spacing: .3px; }
  .brand p { font-size: 12px; opacity: .85; margin-top: 2px; }
  .status {
    background: rgba(255,255,255,.16);
    padding: 6px 14px; border-radius: 999px;
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
  }
  .route {
    display: flex; align-items: center; justify-content: space-between;
    padding: 26px 30px 20px;
  }
  .stn { max-width: 42%; }
  .stn .code { font-size: 12px; color: #6b7280; font-weight: 700; letter-spacing: 1px; }
  .stn .name { font-size: 24px; font-weight: 800; margin-top: 4px; }
  .stn .time { font-size: 13px; color: #0B6E4F; font-weight: 700; margin-top: 4px; }
  .stn.to { text-align: right; }
  .mid { flex: 1; text-align: center; color: #0B6E4F; padding: 0 10px; }
  .mid .train { font-size: 13px; font-weight: 800; color: #15241e; }
  .mid .line {
    height: 2px; background: repeating-linear-gradient(90deg,#0B6E4F 0 6px,transparent 6px 12px);
    margin: 8px 0; position: relative;
  }
  .mid .icon { font-size: 20px; }
  .mid .code { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .perf {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 14px; height: 22px;
    background:
      radial-gradient(circle at left center, #eef2f0 11px, transparent 12px) left,
      radial-gradient(circle at right center, #eef2f0 11px, transparent 12px) right;
    background-repeat: no-repeat;
  }
  .hole { width: 8px; height: 8px; border-radius: 50%; background: #dbe3df; }
  .grid {
    padding: 20px 30px 8px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 18px 20px;
  }
  .cell .k { font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .cell .v { font-size: 16px; font-weight: 700; margin-top: 4px; }
  .fare {
    margin: 12px 30px 0; padding: 18px 22px;
    background: #E7F3EE; border-radius: 16px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .fare .lbl { font-size: 13px; color: #095C42; font-weight: 700; }
  .fare .amt { font-size: 26px; font-weight: 900; color: #0B6E4F; }
  .barcode {
    margin: 20px 30px 6px; height: 58px;
    background: repeating-linear-gradient(90deg,#15241e 0 3px,transparent 3px 5px,#15241e 5px 6px,transparent 6px 10px);
    border-radius: 6px;
  }
  .bkid { text-align: center; font-size: 13px; letter-spacing: 3px; font-weight: 800; color: #15241e; padding-bottom: 8px; }
  .foot {
    padding: 14px 30px 26px; text-align: center;
    font-size: 11px; color: #8a938e; line-height: 1.6;
    border-top: 1px dashed #dbe3df; margin-top: 10px;
  }
</style>
</head>
<body>
  <div class="ticket">
    <div class="top">
      <div class="brand">
        <div class="logo">🚆</div>
        <div>
          <h1>Bangladesh Railway</h1>
          <p>e-Ticket / Booking Confirmation</p>
        </div>
      </div>
      <div class="status">${t.status || 'Confirmed'}</div>
    </div>

    <div class="route">
      <div class="stn from">
        <div class="code">FROM</div>
        <div class="name">${strip(t.fromStation)}</div>
        ${t.startTime ? `<div class="time">${t.startTime}</div>` : ''}
      </div>
      <div class="mid">
        <div class="train">${t.trainName}</div>
        <div class="line"></div>
        <div class="icon">🚆</div>
        ${t.trainCode ? `<div class="code">Train #${t.trainCode}</div>` : ''}
      </div>
      <div class="stn to">
        <div class="code">TO</div>
        <div class="name">${strip(t.toStation)}</div>
        ${t.endTime ? `<div class="time">${t.endTime}</div>` : ''}
      </div>
    </div>

    <div class="perf">${perforations}</div>

    <div class="grid">${detailRows}</div>

    <div class="fare">
      <div class="lbl">Total Paid</div>
      <div class="amt">${formatBDT(t.totalFare)}</div>
    </div>

    <div class="barcode"></div>
    <div class="bkid">${short(t.bookingId)}</div>

    <div class="foot">
      Please carry a valid photo ID matching the passenger name.<br />
      ${t.bookedAtMs ? `Booked on ${formatDateTime(t.bookedAtMs)} · ` : ''}This is a system-generated ticket.
    </div>
  </div>
</body>
</html>`;
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
      dialogTitle: `Ticket ${short(t.bookingId)}`,
      UTI: 'com.adobe.pdf',
    });
  } catch {
    // Fallback that works everywhere: render straight to the print dialog.
    await Print.printAsync({ html });
  }
}
