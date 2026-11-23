import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { cartReducer, emptyCart, parseSavedCart, serialiseCart, STORAGE_KEY, type CartAction, type CartLine } from './cart';
import { orderTotals, type OrderTotals } from '../utils/pricing';

interface CartValue {
  lines: CartLine[];
  totals: OrderTotals;
  dispatch: (a: CartAction) => void;
}

const CartContext = createContext<CartValue | null>(null);

function loadCart() {
  try {
    return parseSavedCart(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyCart;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCart, loadCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, serialiseCart(state));
    } catch {
      /* storage unavailable (private mode): the cart still works for this visit */
    }
  }, [state]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: 'load', state: parseSavedCart(e.newValue) });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ lines: state.lines, totals: orderTotals(state.lines), dispatch }), [state]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
