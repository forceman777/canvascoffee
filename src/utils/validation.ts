/**
 * Form validation shared by the forms and the service layer.
 * The database functions repeat these checks server-side (supabase/migrations).
 */
import { site } from '../config/site';
import { addDays, isoDate } from './dates';

export type Errors<T> = Partial<Record<keyof T, string>>;

const trim = (s: string) => s.trim();

/** Indian mobile/landline: 10 digits, optional +91 / 91 / 0 prefix, spaces or dashes allowed. */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()]/g, '');
  const m = digits.match(/^(?:\+?91|0)?([0-9]{10})$/);
  return m ? m[1] : null;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

function requireName(v: string, label = 'your name'): string | undefined {
  const t = trim(v);
  if (!t) return `Enter ${label}.`;
  if (t.length < 2) return 'Name is too short.';
  if (t.length > 80) return 'Keep the name under 80 characters.';
  return undefined;
}

function requirePhone(v: string): string | undefined {
  if (!trim(v)) return 'Enter a phone number so the café can reach you.';
  if (!normalisePhone(v)) return 'Enter a 10-digit phone number, e.g. 98XXXXXXXX.';
  return undefined;
}

function optionalEmail(v: string): string | undefined {
  if (trim(v) && !isEmail(trim(v))) return 'Enter a valid email address or leave it empty.';
  return undefined;
}

function maxLen(v: string, n: number, label: string): string | undefined {
  return v.length > n ? `${label} must be under ${n} characters.` : undefined;
}

const compact = <T>(e: Errors<T>): Errors<T> =>
  Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as Errors<T>;

// ---------- Checkout ----------

export interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
  instructions: string;
}

export function validateCheckout(f: CheckoutForm): Errors<CheckoutForm> {
  const address = trim(f.address);
  return compact<CheckoutForm>({
    name: requireName(f.name),
    phone: requirePhone(f.phone),
    address: !address
      ? 'Enter the delivery address.'
      : address.length < 10
        ? 'Add more detail: house, street and area.'
        : maxLen(address, 300, 'Address'),
    instructions: maxLen(f.instructions, 300, 'Instructions'),
  });
}

// ---------- Reservation ----------

export interface ReservationForm {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: string;
  name: string;
  phone: string;
  email: string;
  requests: string;
}

export function validateReservation(f: ReservationForm, now = new Date()): Errors<ReservationForm> {
  const today = isoDate(now);
  const last = isoDate(addDays(now, site.reservations.maxDaysAhead));
  let date: string | undefined;
  if (!f.date) date = 'Choose a date.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) date = 'Choose a valid date.';
  else if (f.date < today) date = 'Choose today or a later date.';
  else if (f.date > last) date = `Requests can be made up to ${site.reservations.maxDaysAhead} days ahead.`;

  let time: string | undefined;
  if (!f.time) time = 'Choose a time.';
  else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.time)) time = 'Choose a valid time.';
  else if (f.date === today) {
    const [h, m] = f.time.split(':').map(Number);
    const minutes = h * 60 + m;
    if (minutes <= now.getHours() * 60 + now.getMinutes()) time = 'That time has already passed today.';
  }

  const size = Number(f.partySize);
  let partySize: string | undefined;
  if (!f.partySize) partySize = 'Choose how many guests.';
  else if (!Number.isInteger(size) || size < 1) partySize = 'Choose how many guests.';
  else if (size > site.reservations.maxPartySize)
    partySize = `For more than ${site.reservations.maxPartySize} guests, send an occasion enquiry instead.`;

  return compact<ReservationForm>({
    date,
    time,
    partySize,
    name: requireName(f.name),
    phone: requirePhone(f.phone),
    email: optionalEmail(f.email),
    requests: maxLen(f.requests, 400, 'Requests'),
  });
}

// ---------- Occasion enquiry ----------

export const occasionTypes = ['Birthday', 'Small celebration', 'Group visit', 'Other'] as const;

export interface EnquiryForm {
  name: string;
  phone: string;
  email: string;
  occasion: string;
  preferredDate: string;
  groupSize: string;
  message: string;
}

export function validateEnquiry(f: EnquiryForm, now = new Date()): Errors<EnquiryForm> {
  const size = Number(f.groupSize);
  return compact<EnquiryForm>({
    name: requireName(f.name),
    phone: requirePhone(f.phone),
    email: optionalEmail(f.email),
    occasion: (occasionTypes as readonly string[]).includes(f.occasion) ? undefined : 'Choose the type of occasion.',
    preferredDate: f.preferredDate && f.preferredDate < isoDate(now) ? 'Choose today or a later date.' : undefined,
    groupSize: !f.groupSize
      ? 'Enter an approximate group size.'
      : !Number.isInteger(size) || size < 1 || size > 200
        ? 'Enter a number between 1 and 200.'
        : undefined,
    message: maxLen(f.message, 800, 'Message'),
  });
}

// ---------- Whisper Box ----------

export interface WhisperForm {
  message: string;
  name: string;
  contact: string;
}

export function validateWhisper(f: WhisperForm): Errors<WhisperForm> {
  const msg = trim(f.message);
  return compact<WhisperForm>({
    message: !msg ? 'Write a few words first.' : msg.length < 3 ? 'Write a few words first.' : maxLen(msg, 600, 'Message'),
    name: maxLen(f.name, 80, 'Name'),
    contact: maxLen(f.contact, 120, 'Contact'),
  });
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
