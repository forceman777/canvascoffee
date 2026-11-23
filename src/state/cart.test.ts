import { describe, expect, it } from 'vitest';
import { cartReducer, emptyCart, lineKey, parseSavedCart, serialiseCart, type CartState } from './cart';
import { orderTotals } from '../utils/pricing';

const add = (s: CartState, productId: string, quantity = 1, variantId?: string, addOnIds: string[] = []) =>
  cartReducer(s, { type: 'add', selection: { productId, variantId, addOnIds, quantity } });

describe('cart reducer', () => {
  it('adds and merges identical selections', () => {
    let s = add(emptyCart, 'masala-tea');
    s = add(s, 'masala-tea', 2);
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0].quantity).toBe(3);
  });

  it('keeps different variants and add-ons as separate lines', () => {
    let s = add(emptyCart, 'veg-momo', 1, 'steam');
    s = add(s, 'veg-momo', 1, 'fried');
    s = add(s, 'veg-burger', 1, undefined, ['cheese-slice']);
    s = add(s, 'veg-burger', 1);
    expect(s.lines).toHaveLength(4);
    expect(orderTotals(s.lines).subtotal).toBe(60 + 70 + 70 + 50);
  });

  it('ignores invalid selections', () => {
    expect(add(emptyCart, 'not-on-menu')).toBe(emptyCart);
    expect(add(emptyCart, 'kurkure-momo-veg', 1, 'steam')).toBe(emptyCart);
    expect(add(emptyCart, 'veg-momo', 0, 'steam')).toBe(emptyCart);
  });

  it('drops add-ons that do not belong to the product', () => {
    const s = add(emptyCart, 'veg-pizza', 1, undefined, ['cheese-slice', 'cheese']);
    expect(s.lines[0].addOnIds).toEqual(['cheese']);
  });

  it('changes quantity, removes at zero, and caps at 20', () => {
    let s = add(emptyCart, 'cold-coffee');
    const key = s.lines[0].key;
    s = cartReducer(s, { type: 'setQuantity', key, quantity: 99 });
    expect(s.lines[0].quantity).toBe(20);
    s = cartReducer(s, { type: 'setQuantity', key, quantity: 0 });
    expect(s.lines).toHaveLength(0);
  });

  it('replaces a line in place when its options are edited', () => {
    let s = add(emptyCart, 'black-coffee');
    s = add(s, 'veg-momo', 2, 'steam');
    s = add(s, 'iced-tea');
    const key = lineKey({ productId: 'veg-momo', variantId: 'steam', addOnIds: [] });
    s = cartReducer(s, { type: 'replace', key, selection: { productId: 'veg-momo', variantId: 'pan-fried', addOnIds: [], quantity: 2 } });
    expect(s.lines.map((l) => l.variantId ?? l.productId)).toEqual(['black-coffee', 'pan-fried', 'iced-tea']);
    expect(orderTotals(s.lines).subtotal).toBe(20 + 180 + 50);
  });

  it('merges an edited line into an identical existing line', () => {
    let s = add(emptyCart, 'veg-momo', 1, 'steam');
    s = add(s, 'veg-momo', 1, 'fried');
    const key = s.lines[1].key;
    s = cartReducer(s, { type: 'replace', key, selection: { productId: 'veg-momo', variantId: 'steam', addOnIds: [], quantity: 1 } });
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0].quantity).toBe(2);
  });
});

describe('cart persistence', () => {
  it('round-trips', () => {
    let s = add(emptyCart, 'veg-momo', 2, 'fried');
    s = add(s, 'chicken-pizza', 1, undefined, ['cheese']);
    expect(parseSavedCart(serialiseCart(s))).toEqual(s);
  });

  it('survives corrupt or outdated data', () => {
    expect(parseSavedCart('not json')).toEqual(emptyCart);
    expect(parseSavedCart(null)).toEqual(emptyCart);
    const outdated = JSON.stringify({ lines: [{ productId: 'gone', quantity: 1 }, { productId: 'iced-mocha', quantity: 2, price: 1 }] });
    const parsed = parseSavedCart(outdated);
    expect(parsed.lines).toHaveLength(1);
    expect(orderTotals(parsed.lines).subtotal).toBe(120); // price comes from the menu, not storage
  });
});
