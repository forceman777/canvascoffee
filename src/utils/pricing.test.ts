import { describe, expect, it } from 'vitest';
import { amountToFreeDelivery, deliveryFee, formatINR, lineTotal, orderTotals, unitPrice } from './pricing';

describe('delivery fee: free strictly ABOVE ₹500', () => {
  it.each([
    [0, 25],
    [15, 25],
    [499, 25],
    [500, 25], // exactly ₹500 still pays
    [500.01, 0],
    [501, 0],
    [1200, 0],
  ])('subtotal %s → delivery %s', (subtotal, fee) => {
    expect(deliveryFee(subtotal)).toBe(fee);
  });

  it('reports the amount still needed', () => {
    expect(amountToFreeDelivery(500)).toBe(1);
    expect(amountToFreeDelivery(375)).toBe(126);
    expect(amountToFreeDelivery(501)).toBe(0);
  });

  it('charges nothing for an empty order', () => {
    expect(orderTotals([])).toEqual({ itemCount: 0, subtotal: 0, delivery: 0, total: 0 });
  });

  it('exact ₹500 order: 4 × Veg Pizza = ₹500 + ₹25', () => {
    expect(orderTotals([{ productId: 'veg-pizza', addOnIds: [], quantity: 4 }])).toEqual({
      itemCount: 4, subtotal: 500, delivery: 25, total: 525,
    });
  });

  it('₹515 order is delivered free', () => {
    const t = orderTotals([
      { productId: 'veg-pizza', addOnIds: [], quantity: 4 },
      { productId: 'leaker-tea', addOnIds: [], quantity: 1 },
    ]);
    expect(t).toEqual({ itemCount: 5, subtotal: 515, delivery: 0, total: 515 });
  });
});

describe('unit and line prices', () => {
  it('uses the variant price for momos', () => {
    expect(unitPrice({ productId: 'veg-momo', variantId: 'steam', addOnIds: [] })).toBe(60);
    expect(unitPrice({ productId: 'veg-momo', variantId: 'fried', addOnIds: [] })).toBe(70);
    expect(unitPrice({ productId: 'chicken-momo', variantId: 'pan-fried', addOnIds: [] })).toBe(100);
    expect(unitPrice({ productId: 'kurkure-momo-veg', variantId: 'fried', addOnIds: [] })).toBe(80);
  });

  it('rejects variants that were not supplied', () => {
    expect(() => unitPrice({ productId: 'kurkure-momo-veg', variantId: 'steam', addOnIds: [] })).toThrow();
    expect(() => unitPrice({ productId: 'veg-momo', addOnIds: [] })).toThrow();
  });

  it('adds category add-ons per unit', () => {
    expect(unitPrice({ productId: 'chicken-burger', addOnIds: ['cheese-slice'] })).toBe(90);
    expect(lineTotal({ productId: 'veg-pizza', addOnIds: ['cheese'], quantity: 2 })).toBe(300);
  });

  it('refuses add-ons from another category', () => {
    expect(() => unitPrice({ productId: 'veg-pizza', addOnIds: ['cheese-slice'] })).toThrow();
    expect(() => unitPrice({ productId: 'masala-tea', addOnIds: ['cheese'] })).toThrow();
  });

  it('formats rupees', () => {
    expect(formatINR(1250)).toBe('₹1,250');
  });
});
