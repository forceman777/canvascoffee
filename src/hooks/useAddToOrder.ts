import { useCallback, useState } from 'react';
import { fullName, needsChoices } from '../data/menu';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import { describeLine } from '../utils/whatsapp';
import type { Product } from '../types/menu';
import type { LineSelection } from '../utils/pricing';

/** Shared "add to order" behaviour: direct add for simple items, product panel for choices. */
export function useAddToOrder() {
  const { dispatch } = useCart();
  const toast = useToast();
  const [choosing, setChoosing] = useState<Product | null>(null);

  const confirm = useCallback(
    (selection: LineSelection) => {
      dispatch({ type: 'add', selection });
      toast({
        message: `Added ${selection.quantity} × ${describeLine(selection)}`,
        action: { label: 'View order', to: '/order' },
      });
      setChoosing(null);
    },
    [dispatch, toast],
  );

  const add = useCallback(
    (p: Product) => {
      if (needsChoices(p)) {
        setChoosing(p);
        return;
      }
      confirm({ productId: p.id, variantId: p.variants?.[0]?.id, addOnIds: [], quantity: 1 });
    },
    [confirm],
  );

  return { add, choosing, confirm, close: () => setChoosing(null), label: (p: Product) => fullName(p) };
}
