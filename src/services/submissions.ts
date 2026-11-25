/**
 * Service layer for every backend-dependent action. Each function either returns the
 * server's real response or throws a BackendError. Nothing here fabricates a success.
 */
import { callRpc } from './backend';
import { normalisePhone, type CheckoutForm, type EnquiryForm, type ReservationForm, type WhisperForm } from '../utils/validation';
import type { LineSelection } from '../utils/pricing';

/** Order lifecycle as stored in the database. Only values returned by the server are shown. */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'dispatched' | 'completed' | 'cancelled';

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'Pending: awaiting café confirmation',
  confirmed: 'Confirmed by the café',
  preparing: 'Being prepared',
  dispatched: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export interface PlacedOrder {
  reference: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
}

export function placeOrder(lines: LineSelection[], form: CheckoutForm) {
  return callRpc<PlacedOrder>('place_order', {
    p_customer_name: form.name.trim(),
    p_phone: normalisePhone(form.phone),
    p_address: form.address.trim(),
    p_instructions: form.instructions.trim() || null,
    // Only ids and quantities are sent. The server looks up every price itself.
    p_items: lines.map((l) => ({
      product_id: l.productId,
      variant_id: l.variantId ?? null,
      add_on_ids: l.addOnIds,
      quantity: l.quantity,
    })),
  });
}

export function getOrderStatus(reference: string, phone: string) {
  return callRpc<{ reference: string; status: OrderStatus; updated_at: string } | null>('get_order_status', {
    p_reference: reference,
    p_phone: normalisePhone(phone),
  });
}

export interface SubmittedRequest {
  reference: string;
  status: 'pending';
}

export function requestReservation(f: ReservationForm) {
  return callRpc<SubmittedRequest>('request_reservation', {
    p_date: f.date,
    p_time: f.time,
    p_time_until: f.until,
    p_party_size: Number(f.partySize),
    p_name: f.name.trim(),
    p_phone: normalisePhone(f.phone),
    p_email: f.email.trim() || null,
    p_requests: f.requests.trim() || null,
  });
}

export function sendEnquiry(f: EnquiryForm) {
  return callRpc<SubmittedRequest>('send_occasion_enquiry', {
    p_name: f.name.trim(),
    p_phone: normalisePhone(f.phone),
    p_email: f.email.trim() || null,
    p_occasion: f.occasion,
    p_preferred_date: f.preferredDate || null,
    p_group_size: Number(f.groupSize),
    p_message: f.message.trim() || null,
  });
}

export function sendWhisper(f: WhisperForm) {
  return callRpc<{ received: true }>('leave_message', {
    p_message: f.message.trim(),
    p_name: f.name.trim() || null,
    p_contact: f.contact.trim() || null,
  });
}
