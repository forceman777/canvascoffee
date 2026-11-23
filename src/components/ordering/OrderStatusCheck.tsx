import { useState } from 'react';
import { Button } from '../common/Button';
import { TextField } from '../common/Field';
import { ErrorNotice } from '../common/bits';
import { getOrderStatus, orderStatusLabel, type OrderStatus } from '../../services/submissions';
import { BackendError } from '../../services/backend';

/** Shows the status exactly as stored on the server. Nothing is assumed. */
export function OrderStatusCheck({ reference: initialRef = '', phone: initialPhone = '' }: { reference?: string; phone?: string }) {
  const [reference, setReference] = useState(initialRef);
  const [phone, setPhone] = useState(initialPhone);
  const [state, setState] = useState<{ kind: 'idle' } | { kind: 'loading' } | { kind: 'found'; status: OrderStatus; updated: string } | { kind: 'missing' } | { kind: 'error'; message: string }>({ kind: 'idle' });

  return (
    <form
      className="status-check"
      onSubmit={async (e) => {
        e.preventDefault();
        setState({ kind: 'loading' });
        try {
          const res = await getOrderStatus(reference.trim().toUpperCase(), phone);
          setState(res ? { kind: 'found', status: res.status, updated: res.updated_at } : { kind: 'missing' });
        } catch (err) {
          setState({ kind: 'error', message: err instanceof BackendError ? err.message : 'Could not check the status.' });
        }
      }}
    >
      <div className="status-check__fields">
        <TextField label="Order reference" value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" />
        <TextField label="Phone used for the order" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      </div>
      <Button type="submit" variant="secondary" loading={state.kind === 'loading'}>
        Check status
      </Button>
      <div aria-live="polite">
        {state.kind === 'found' && (
          <p className="status-check__result">
            <strong>{orderStatusLabel[state.status]}</strong>
            <span>Last updated {new Date(state.updated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </p>
        )}
        {state.kind === 'missing' && <p className="status-check__result">No order was found with that reference and phone number.</p>}
        {state.kind === 'error' && <ErrorNotice>{state.message}</ErrorNotice>}
      </div>
    </form>
  );
}
