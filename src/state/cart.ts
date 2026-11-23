/**
 * Pure cart logic. The cart stores only ids and quantities; prices are always derived
 * from src/data/menu.ts, so a stale saved cart can never carry an old price.
 */
import { addOnsForProduct, getProduct } from '../data/menu';
import { site } from '../config/site';
import { unitPrice, type LineSelection } from '../utils/pricing';

export interface CartLine extends LineSelection {
  key: string;
}

export interface CartState {
  lines: CartLine[];
}

export const emptyCart: CartState = { lines: [] };

const MAX = site.ordering.maxQuantityPerLine;

export function lineKey(sel: Omit<LineSelection, 'quantity'>): string {
  return [sel.productId, sel.variantId ?? '-', [...sel.addOnIds].sort().join('+') || '-'].join('|');
}

/** Returns a normalised selection, or null if it is not orderable. */
export function sanitise(sel: LineSelection): LineSelection | null {
  const product = getProduct(sel.productId);
  if (!product) return null;
  const allowed = new Set(addOnsForProduct(product).map((a) => a.id));
  const addOnIds = [...new Set(sel.addOnIds)].filter((id) => allowed.has(id)).sort();
  let variantId = sel.variantId;
  if (product.variants) {
    if (!product.variants.some((v) => v.id === variantId)) return null;
  } else {
    variantId = undefined;
  }
  const quantity = Math.floor(sel.quantity);
  if (!Number.isFinite(quantity) || quantity < 1) return null;
  const clean = { productId: sel.productId, variantId, addOnIds, quantity: Math.min(quantity, MAX) };
  try {
    unitPrice(clean);
  } catch {
    return null;
  }
  return clean;
}

export type CartAction =
  | { type: 'add'; selection: LineSelection }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'replace'; key: string; selection: LineSelection }
  | { type: 'clear' }
  | { type: 'load'; state: CartState };

function merge(lines: CartLine[], sel: LineSelection): CartLine[] {
  const key = lineKey(sel);
  const existing = lines.find((l) => l.key === key);
  if (existing) {
    return lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(l.quantity + sel.quantity, MAX) } : l));
  }
  return [...lines, { ...sel, key }];
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const sel = sanitise(action.selection);
      return sel ? { lines: merge(state.lines, sel) } : state;
    }
    case 'setQuantity': {
      if (action.quantity < 1) return { lines: state.lines.filter((l) => l.key !== action.key) };
      return {
        lines: state.lines.map((l) =>
          l.key === action.key ? { ...l, quantity: Math.min(Math.floor(action.quantity), MAX) } : l,
        ),
      };
    }
    case 'remove':
      return { lines: state.lines.filter((l) => l.key !== action.key) };
    case 'replace': {
      const sel = sanitise(action.selection);
      if (!sel) return state;
      const index = state.lines.findIndex((l) => l.key === action.key);
      if (index === -1) return { lines: merge(state.lines, sel) };
      const without = state.lines.filter((l) => l.key !== action.key);
      const newKey = lineKey(sel);
      // If the edit now matches another line, merge into it; otherwise keep the original position.
      if (without.some((l) => l.key === newKey)) return { lines: merge(without, sel) };
      const next = [...without];
      next.splice(index, 0, { ...sel, key: newKey });
      return { lines: next };
    }
    case 'clear':
      return emptyCart;
    case 'load':
      return action.state;
  }
}

// ---------- persistence ----------

export const STORAGE_KEY = 'canvas-o-coffee:cart:v1';

/** Parses saved JSON defensively; drops anything that no longer matches the menu. */
export function parseSavedCart(raw: string | null): CartState {
  if (!raw) return emptyCart;
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.lines)) return emptyCart;
    let lines: CartLine[] = [];
    for (const item of data.lines) {
      if (!item || typeof item.productId !== 'string') continue;
      const sel = sanitise({
        productId: item.productId,
        variantId: typeof item.variantId === 'string' ? item.variantId : undefined,
        addOnIds: Array.isArray(item.addOnIds) ? item.addOnIds.filter((x: unknown) => typeof x === 'string') : [],
        quantity: Number(item.quantity),
      });
      if (sel) lines = merge(lines, sel);
    }
    return { lines };
  } catch {
    return emptyCart;
  }
}

export const serialiseCart = (state: CartState) =>
  JSON.stringify({ lines: state.lines.map(({ productId, variantId, addOnIds, quantity }) => ({ productId, variantId, addOnIds, quantity })) });
