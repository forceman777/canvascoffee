import { describe, expect, it } from 'vitest';
import { normalisePhone, validateCheckout, validateEnquiry, validateReservation, validateWhisper } from './validation';
import { orderMessage } from './whatsapp';

const now = new Date(2026, 10, 23, 15, 0); // 23 Nov 2026, 3:00 pm local

describe('phone numbers', () => {
  it.each([
    ['9876543210', '9876543210'],
    ['+91 98765 43210', '9876543210'],
    ['098765-43210', '9876543210'],
    ['12345', null],
    ['98765432101', null],
  ])('%s → %s', (raw, out) => expect(normalisePhone(raw)).toBe(out));
});

describe('checkout', () => {
  it('requires name, phone and address', () => {
    expect(Object.keys(validateCheckout({ name: '', phone: '', address: '', instructions: '' })).sort()).toEqual([
      'address', 'name', 'phone',
    ]);
  });
  it('accepts a complete form', () => {
    expect(validateCheckout({ name: 'Asha', phone: '9876543210', address: '12 Station Road, Belda', instructions: '' })).toEqual({});
  });
});

describe('reservation', () => {
  const base = { date: '2026-11-24', time: '19:30', partySize: '4', name: 'Asha', phone: '9876543210', email: '', requests: '' };
  it('accepts a valid request', () => expect(validateReservation(base, now)).toEqual({}));
  it('rejects past dates', () => expect(validateReservation({ ...base, date: '2026-11-22' }, now).date).toBeTruthy());
  it('rejects a time already passed today', () =>
    expect(validateReservation({ ...base, date: '2026-11-23', time: '14:00' }, now).time).toBeTruthy());
  it('accepts a later time today', () =>
    expect(validateReservation({ ...base, date: '2026-11-23', time: '18:00' }, now)).toEqual({}));
  it('rejects dates beyond the window', () => expect(validateReservation({ ...base, date: '2027-03-01' }, now).date).toBeTruthy());
  it('sends large groups to the enquiry form', () =>
    expect(validateReservation({ ...base, partySize: '11' }, now).partySize).toMatch(/occasion enquiry/));
  it('rejects bad email', () => expect(validateReservation({ ...base, email: 'nope' }, now).email).toBeTruthy());
});

describe('enquiry and whisper', () => {
  it('requires an occasion type and group size', () => {
    const e = validateEnquiry({ name: 'Asha', phone: '9876543210', email: '', occasion: '', preferredDate: '', groupSize: '', message: '' }, now);
    expect(Object.keys(e).sort()).toEqual(['groupSize', 'occasion']);
  });
  it('requires a message', () => expect(validateWhisper({ message: ' ', name: '', contact: '' }).message).toBeTruthy());
});

describe('WhatsApp order message', () => {
  it('lists items, variants, add-ons and the exact totals', () => {
    const msg = orderMessage(
      [
        { productId: 'veg-momo', variantId: 'pan-fried', addOnIds: [], quantity: 2 },
        { productId: 'chicken-burger', addOnIds: ['cheese-slice'], quantity: 1 },
      ],
      { name: 'Asha', phone: '9876543210', address: '12 Station Road, Belda', instructions: '' },
    );
    expect(msg).toContain('2 × Veg Momo · Pan Fried: ₹180');
    expect(msg).toContain('1 × Chicken Burger · + Cheese Slice Add-on: ₹90');
    expect(msg).toContain('Subtotal: ₹270');
    expect(msg).toContain('Delivery: ₹25');
    expect(msg).toContain('Total: ₹295');
  });
});
