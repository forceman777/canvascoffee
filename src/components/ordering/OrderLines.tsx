import { Pencil, Trash2 } from 'lucide-react';
import { addOnsForProduct, fullName, getAddOn, getProduct, needsChoices } from '../../data/menu';
import { DietMark, Price, QuantityStepper } from '../common/bits';
import { lineTotal, unitPrice } from '../../utils/pricing';
import type { CartLine } from '../../state/cart';
import { site } from '../../config/site';

interface Props {
  lines: CartLine[];
  onQuantity: (key: string, q: number) => void;
  onRemove: (key: string) => void;
  onEdit: (line: CartLine) => void;
  readOnly?: boolean;
}

export function OrderLines({ lines, onQuantity, onRemove, onEdit, readOnly }: Props) {
  return (
    <ul role="list" className={`order-lines ${readOnly ? 'order-lines--readonly' : ''}`}>
      {lines.map((line) => {
        const p = getProduct(line.productId);
        if (!p) return null;
        const variant = p.variants?.find((v) => v.id === line.variantId);
        const extras = line.addOnIds.map((id) => getAddOn(id)).filter(Boolean);
        const editable = needsChoices(p) || addOnsForProduct(p).length > 0;
        return (
          <li key={line.key} className="order-line">
            <div className="order-line__main">
              <p className="order-line__name">
                <DietMark diet={p.diet} />
                {fullName(p)}
              </p>
              <p className="order-line__options">
                {variant && <span>{variant.label}</span>}
                {extras.map((a) => (
                  <span key={a!.id}>+ {a!.name}</span>
                ))}
                <span className="order-line__unit">
                  <Price amount={unitPrice(line)} /> each
                </span>
              </p>
            </div>
            {readOnly ? (
              <p className="order-line__qty tabular">× {line.quantity}</p>
            ) : (
              <div className="order-line__controls">
                <QuantityStepper
                  size="sm"
                  value={line.quantity}
                  min={0}
                  max={site.ordering.maxQuantityPerLine}
                  onChange={(n) => onQuantity(line.key, n)}
                  label={`Quantity of ${fullName(p)}`}
                />
                {editable ? (
                  <button type="button" className="icon-btn" onClick={() => onEdit(line)} aria-label={`Change options for ${fullName(p)}`}>
                    <Pencil size={16} strokeWidth={1.6} />
                  </button>
                ) : (
                  <span className="icon-btn icon-btn--spacer" aria-hidden="true" />
                )}
                <button type="button" className="icon-btn" onClick={() => onRemove(line.key)} aria-label={`Remove ${fullName(p)}`}>
                  <Trash2 size={16} strokeWidth={1.6} />
                </button>
              </div>
            )}
            <Price amount={lineTotal(line)} className="order-line__total" />
          </li>
        );
      })}
    </ul>
  );
}
