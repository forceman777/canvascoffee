import { Truck } from 'lucide-react';
import { Price } from '../common/bits';
import { amountToFreeDelivery, formatINR, FREE_DELIVERY_ABOVE, type OrderTotals } from '../../utils/pricing';

export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const remaining = amountToFreeDelivery(subtotal);
  const pct = Math.min(100, (subtotal / (FREE_DELIVERY_ABOVE + 1)) * 100);
  return (
    <div className={`delivery-progress ${remaining === 0 ? 'is-free' : ''}`}>
      <p>
        <Truck size={16} strokeWidth={1.6} aria-hidden="true" />
        {remaining === 0 ? (
          <span>Delivery is free on this order.</span>
        ) : (
          <span>
            Add <strong className="tabular">{formatINR(remaining)}</strong> more for free delivery (orders above {formatINR(FREE_DELIVERY_ABOVE)}).
          </span>
        )}
      </p>
      <div className="delivery-progress__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}

export function OrderSummary({ totals, title = 'Summary' }: { totals: OrderTotals; title?: string }) {
  return (
    <div className="order-summary">
      <h2 className="order-summary__title">{title}</h2>
      <dl className="order-summary__rows">
        <div>
          <dt>
            Subtotal <span className="order-summary__count">({totals.itemCount} item{totals.itemCount === 1 ? '' : 's'})</span>
          </dt>
          <dd>
            <Price amount={totals.subtotal} />
          </dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{totals.itemCount === 0 ? '–' : totals.delivery === 0 ? <span className="is-free">Free</span> : <Price amount={totals.delivery} />}</dd>
        </div>
        <div className="order-summary__total">
          <dt>Total</dt>
          <dd>
            <Price amount={totals.total} />
          </dd>
        </div>
      </dl>
      <p className="order-summary__note">No taxes or service charges are added. Payment is arranged with the café when it confirms your order.</p>
    </div>
  );
}
