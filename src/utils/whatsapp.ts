/**
 * WhatsApp hand-off. Builds a pre-filled message for the café's official number.
 * Opening WhatsApp is NOT a confirmation: the visitor still has to send the message,
 * and the café confirms in the chat.
 */
import { fullName, getAddOn, getProduct } from '../data/menu';
import { site } from '../config/site';
import { formatINR, lineTotal, orderTotals, type LineSelection } from './pricing';
import { formatLongDate, formatTime } from './dates';
import type { CheckoutForm, EnquiryForm, ReservationForm } from './validation';

export const whatsappConfigured = () => Boolean(site.whatsappNumber);

export function whatsappUrl(message: string, number = site.whatsappNumber): string {
  if (!number) throw new Error('WhatsApp number is not configured');
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function describeLine(l: LineSelection): string {
  const p = getProduct(l.productId);
  if (!p) return l.productId;
  const parts = [fullName(p)];
  const variant = p.variants && p.variants.length > 1 ? p.variants.find((v) => v.id === l.variantId) : undefined;
  if (variant) parts.push(variant.label);
  if (p.variants?.length === 1) parts.push(p.variants[0].label);
  const extras = l.addOnIds.map((id) => getAddOn(id)?.name).filter(Boolean);
  if (extras.length) parts.push(`+ ${extras.join(', ')}`);
  return parts.join(' · ');
}

export function orderMessage(lines: LineSelection[], form: CheckoutForm): string {
  const t = orderTotals(lines);
  const items = lines.map((l) => `• ${l.quantity} × ${describeLine(l)}: ${formatINR(lineTotal(l))}`);
  return [
    `Hello ${site.name}, I would like to place an order.`,
    '',
    ...items,
    '',
    `Subtotal: ${formatINR(t.subtotal)}`,
    `Delivery: ${t.delivery === 0 ? 'Free' : formatINR(t.delivery)}`,
    `Total: ${formatINR(t.total)}`,
    '',
    `Name: ${form.name.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Address: ${form.address.trim()}`,
    form.instructions.trim() ? `Instructions: ${form.instructions.trim()}` : '',
    '',
    'Please confirm my order.',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n');
}

export function reservationMessage(f: ReservationForm): string {
  return [
    `Hello ${site.name}, I would like to request a table.`,
    '',
    `Date: ${formatLongDate(f.date)}`,
    `Time: ${formatTime(f.time)}`,
    `Guests: ${f.partySize}`,
    `Name: ${f.name.trim()}`,
    `Phone: ${f.phone.trim()}`,
    f.email.trim() ? `Email: ${f.email.trim()}` : '',
    f.requests.trim() ? `Requests: ${f.requests.trim()}` : '',
    '',
    'Please let me know if this is available.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function enquiryMessage(f: EnquiryForm): string {
  return [
    `Hello ${site.name}, I have an occasion enquiry.`,
    '',
    `Occasion: ${f.occasion}`,
    f.preferredDate ? `Preferred date: ${formatLongDate(f.preferredDate)}` : '',
    `Approximate group size: ${f.groupSize}`,
    `Name: ${f.name.trim()}`,
    `Phone: ${f.phone.trim()}`,
    f.email.trim() ? `Email: ${f.email.trim()}` : '',
    f.message.trim() ? `Message: ${f.message.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
