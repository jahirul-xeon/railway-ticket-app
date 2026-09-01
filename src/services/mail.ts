// ============================================================
// Ticket email via EmailJS (client-side email service, no backend).
//
// The confirmation email is sent through EmailJS's REST API. The email body
// itself is the ticket (all details go in as template variables) — no file
// attachment, since EmailJS attachments require a paid subscription.
//
// Setup: fill in src/config/emailjs.ts and create the template as described
// in SETUP.md "Email tickets".
// ============================================================
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EMAILJS } from '@/config/emailjs';
import { shortId, type TicketData } from '@/services/ticketTemplate';
import { formatBDT, formatDate } from '@/utils/format';

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';
const strip = (s: string) => s.replace(' Railway Station', '');

type EmailConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
  privateKey: string;
};

// Loads config from Firestore `config/emailjs` (so you can set it in the
// Firebase console), falling back to the values in src/config/emailjs.ts.
// Cached after the first successful read.
let cachedConfig: EmailConfig | null = null;

async function loadEmailConfig(): Promise<EmailConfig> {
  if (cachedConfig) return cachedConfig;
  const cfg: EmailConfig = { ...EMAILJS };
  try {
    const snap = await getDoc(doc(db, 'config', 'emailjs'));
    if (snap.exists()) {
      const d = snap.data() as Partial<EmailConfig>;
      if (d.serviceId) cfg.serviceId = d.serviceId;
      if (d.templateId) cfg.templateId = d.templateId;
      if (d.publicKey) cfg.publicKey = d.publicKey;
      if (typeof d.privateKey === 'string') cfg.privateKey = d.privateKey;
      cachedConfig = cfg; // only cache once we have the remote values
    }
  } catch {
    // ignore — use local fallback (don't cache, so a later read can succeed)
  }
  return cfg;
}

const placeholder = (v: string) =>
  !v || v.startsWith('YOUR_') || v.startsWith('PASTE_');

function isConfigured(c: EmailConfig): boolean {
  return !placeholder(c.serviceId) && !placeholder(c.templateId) && !placeholder(c.publicKey);
}

export async function sendTicketEmail(to: string, t: TicketData): Promise<void> {
  const cfg = await loadEmailConfig();
  if (!isConfigured(cfg)) {
    throw new Error('EmailJS is not configured (config/emailjs or src/config/emailjs.ts).');
  }

  const template_params = {
    to_email: to,
    subject: `Your Railway Ticket ${shortId(t.bookingId)} — ${strip(t.fromStation)} to ${strip(
      t.toStation
    )}`,
    passenger_name: t.passengerName,
    train_name: t.trainName,
    from_station: strip(t.fromStation),
    to_station: strip(t.toStation),
    travel_date: formatDate(t.travelDate),
    seats: t.seats.join(', '),
    class_name: t.className,
    total_fare: formatBDT(t.totalFare),
    booking_id: shortId(t.bookingId),
  };

  const body: Record<string, unknown> = {
    service_id: cfg.serviceId,
    template_id: cfg.templateId,
    user_id: cfg.publicKey,
    template_params,
  };
  if (cfg.privateKey) body.accessToken = cfg.privateKey;

  const res = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`EmailJS ${res.status}: ${detail || 'send failed'}`);
  }
}
