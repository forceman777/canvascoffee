import { getAddOn, getProduct } from '../data/menu';
import { site } from '../config/site';

/** Free delivery strictly ABOVE this subtotal (₹500 exactly still pays the fee). */
export const FREE_DELIVERY_ABOVE = site.ordering.freeDeliveryAbove;
export const DELIVERY_FEE = site.ordering.deliveryFee;

/** Supplied rule, implemented literally: subtotal > 500 ? 0 : 25. */
export function deliveryFee(subtotal: number): number {
  return subtotal > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
}

/**
 * Amount still needed for free delivery. Menu prices are whole rupees, so the
 * smallest qualifying subtotal is ₹501. Returns 0 once delivery is free.
 */
export function amountToFreeDelivery(subtotal: number): number {
  return subtotal > FREE_DELIVERY_ABOVE ? 0 : FREE_DELIVERY_ABOVE + 1 - subtotal;
}

export interface LineSelection {
  productId: string;
  variantId?: string;
  addOnIds: string[];
  quantity: number;
}

/** Price of one unit: base or variant price plus each selected add-on. Throws on invalid input. */
export function unitPrice(sel: Omit<LineSelection, 'quantity'>): number {
  const product = getProduct(sel.productId);
  if (!product) throw new Error(`Unknown product: ${sel.productId}`);

  let base: number;
  if (product.variants) {
    const variant = product.variants.find((v) => v.id === sel.variantId);
    if (!variant) throw new Error(`Unknown variant "${sel.variantId}" for ${sel.productId}`);
    base = variant.price;
  } else {
    if (sel.variantId) throw new Error(`${sel.productId} has no variants`);
    base = product.price as number;
  }

  const extras = sel.addOnIds.reduce((sum, id) => {
    const addOn = getAddOn(id);
    if (!addOn || addOn.categoryId !== product.categoryId) {
      throw new Error(`Add-on "${id}" does not apply to ${sel.productId}`);
    }
    return sum + addOn.price;
  }, 0);

  return base + extras;
}

export const lineTotal = (sel: LineSelection) => unitPrice(sel) * sel.quantity;

export interface OrderTotals {
  itemCount: number;
  subtotal: number;
  delivery: number;
  total: number;
}

export function orderTotals(lines: LineSelection[]): OrderTotals {
  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  // No delivery is charged on an empty order.
  const delivery = itemCount === 0 ? 0 : deliveryFee(subtotal);
  return { itemCount, subtotal, delivery, total: subtotal + delivery };
}

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
export const formatINR = (amount: number) => `₹${inr.format(amount)}`;
