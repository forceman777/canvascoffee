import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useCart } from '../state/CartContext';
import { OrderLines } from '../components/ordering/OrderLines';
import { FreeDeliveryProgress, OrderSummary } from '../components/ordering/OrderSummary';
import { OrderStatusCheck } from '../components/ordering/OrderStatusCheck';
import { ProductDialog } from '../components/menu/ProductDialog';
import { Button, ButtonLink } from '../components/common/Button';
import { Honeypot, TextArea, TextField } from '../components/common/Field';
import { EmptyState, ErrorNotice, InfoNotice, Price, SetupNotice, DevHint } from '../components/common/bits';
import { getProduct } from '../data/menu';
import { useDocumentTitle } from '../hooks';
import { hasErrors, validateCheckout, type CheckoutForm, type Errors } from '../utils/validation';
import { orderMessage, whatsappConfigured, whatsappUrl } from '../utils/whatsapp';
import { backendConfigured, BackendError } from '../services/backend';
import { orderStatusLabel, placeOrder, type PlacedOrder } from '../services/submissions';
import { site } from '../config/site';
import type { CartLine } from '../state/cart';

type Step = 'order' | 'details' | 'review';
type Submission =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'placed'; order: PlacedOrder; phone: string }
  | { kind: 'whatsapp' }
  | { kind: 'error'; message: string };

const emptyForm: CheckoutForm = { name: '', phone: '', address: '', instructions: '' };
const FORM_KEY = 'canvas-o-coffee:checkout:v1';

function loadForm(): CheckoutForm {
  try {
    return { ...emptyForm, ...JSON.parse(sessionStorage.getItem(FORM_KEY) || '{}') };
  } catch {
    return emptyForm;
  }
}

export default function OrderPage() {
  useDocumentTitle('Your order');
  const { lines, totals, dispatch } = useCart();
  const [step, setStep] = useState<Step>('order');
  const [form, setForm] = useState<CheckoutForm>(loadForm);
  const [errors, setErrors] = useState<Errors<CheckoutForm>>({});
  const [trap, setTrap] = useState('');
  const [editing, setEditing] = useState<CartLine | null>(null);
  const [submission, setSubmission] = useState<Submission>({ kind: 'idle' });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const backend = backendConfigured();
  const whatsapp = whatsappConfigured();
  const canSubmit = backend || whatsapp;

  useEffect(() => {
    try {
      sessionStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step, submission.kind]);

  const set = (k: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const toReview = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateCheckout(form);
    setErrors(found);
    if (hasErrors(found)) {
      const first = Object.keys(found)[0];
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }
    setStep('review');
  };

  const submitToBackend = async () => {
    if (trap) return; // bot
    setSubmission({ kind: 'sending' });
    try {
      const order = await placeOrder(lines, form);
      setSubmission({ kind: 'placed', order, phone: form.phone });
      dispatch({ type: 'clear' });
    } catch (err) {
      setSubmission({ kind: 'error', message: err instanceof BackendError ? err.message : 'Something went wrong. Nothing was submitted.' });
    }
  };

  const sendWhatsApp = () => {
    if (trap) return;
    window.open(whatsappUrl(orderMessage(lines, form)), '_blank', 'noopener,noreferrer');
    setSubmission({ kind: 'whatsapp' });
  };

  // ---------- After submission ----------
  if (submission.kind === 'placed') {
    const { order, phone } = submission;
    return (
      <div className="order-page surface-ivory">
        <div className="container--narrow order-result">
          <h1 ref={headingRef} tabIndex={-1} className="order-page__title">
            Order request received
          </h1>
          <p className="order-result__ref">
            Reference <strong className="tabular">{order.reference}</strong>
          </p>
          <p className="order-result__status">
            Status: <strong>{orderStatusLabel[order.status]}</strong>
          </p>
          <InfoNotice>
            The café has your request but has not confirmed it yet. It will contact you on <strong>{phone}</strong> to confirm the order and arrange payment.
          </InfoNotice>
          <dl className="order-summary__rows order-result__totals">
            <div>
              <dt>Subtotal</dt>
              <dd><Price amount={order.subtotal} /></dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{order.delivery_fee === 0 ? 'Free' : <Price amount={order.delivery_fee} />}</dd>
            </div>
            <div className="order-summary__total">
              <dt>Total</dt>
              <dd><Price amount={order.total} /></dd>
            </div>
          </dl>
          <h2 className="order-result__subhead">Check on this order</h2>
          <OrderStatusCheck reference={order.reference} phone={phone} />
          <ButtonLink to="/menu" variant="quiet">Back to the menu</ButtonLink>
        </div>
      </div>
    );
  }

  if (submission.kind === 'whatsapp') {
    return (
      <div className="order-page surface-ivory">
        <div className="container--narrow order-result">
          <h1 ref={headingRef} tabIndex={-1} className="order-page__title">
            Finish in WhatsApp
          </h1>
          <InfoNotice>
            WhatsApp opened with your order written out. <strong>Your order is only placed once you press send in WhatsApp</strong>, and it is confirmed when the café replies.
          </InfoNotice>
          <div className="order-result__actions">
            <Button variant="secondary" onClick={sendWhatsApp} icon={<MessageCircle size={16} />}>
              Open WhatsApp again
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                dispatch({ type: 'clear' });
                setSubmission({ kind: 'idle' });
                setStep('order');
              }}
            >
              I sent it, clear my order
            </Button>
            <Button variant="quiet" onClick={() => setSubmission({ kind: 'idle' })}>
              Back to my order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Empty ----------
  if (lines.length === 0) {
    return (
      <div className="order-page surface-ivory">
        <div className="container order-page__empty">
          <h1 ref={headingRef} tabIndex={-1} className="visually-hidden">
            Your order
          </h1>
          <EmptyState title="Your order is empty" action={<ButtonLink to="/menu">Browse the menu</ButtonLink>}>
            <p>Add drinks and dishes from the menu and they will appear here.</p>
          </EmptyState>
          {backend && (
            <details className="order-page__status">
              <summary>Already ordered? Check its status</summary>
              <OrderStatusCheck />
            </details>
          )}
        </div>
      </div>
    );
  }

  const steps: Array<[Step, string]> = [
    ['order', 'Order'],
    ['details', 'Details'],
    ['review', 'Review'],
  ];

  return (
    <div className="order-page surface-ivory">
      <div className="container order-page__inner">
        <header className="order-page__header">
          <h1 ref={headingRef} tabIndex={-1} className="order-page__title">
            {step === 'order' ? 'Your order' : step === 'details' ? 'Delivery details' : 'Review and send'}
          </h1>
          <ol className="steps" role="list" aria-label="Checkout progress">
            {steps.map(([id, label], i) => {
              const index = steps.findIndex(([s]) => s === step);
              return (
                <li key={id} className={i === index ? 'is-current' : i < index ? 'is-done' : ''} aria-current={i === index ? 'step' : undefined}>
                  <span className="oldstyle">{i + 1}</span> {label}
                </li>
              );
            })}
          </ol>
        </header>

        <div className="order-page__grid">
          <div className="order-page__main">
            {step === 'order' && (
              <>
                <OrderLines
                  lines={lines}
                  onQuantity={(key, quantity) => dispatch({ type: 'setQuantity', key, quantity })}
                  onRemove={(key) => dispatch({ type: 'remove', key })}
                  onEdit={setEditing}
                />
                <FreeDeliveryProgress subtotal={totals.subtotal} />
                {!canSubmit && (
                  <InfoNotice>
                    Online ordering is not connected yet. You can build and review your order here, but it cannot be sent from the website at the moment.
                  </InfoNotice>
                )}
                <div className="order-page__actions">
                  <ButtonLink to="/menu" variant="quiet">
                    Add more from the menu
                  </ButtonLink>
                  <Button onClick={() => setStep('details')}>Continue to delivery details</Button>
                </div>
              </>
            )}

            {step === 'details' && (
              <form className="checkout-form" onSubmit={toReview} noValidate>
                <TextField id="checkout-name" label="Name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                <TextField
                  id="checkout-phone"
                  label="Phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                  hint="The café calls this number to confirm your order."
                />
                <TextArea
                  id="checkout-address"
                  label="Delivery address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={set('address')}
                  error={errors.address}
                  hint={site.ordering.deliveryArea ? `We deliver ${site.ordering.deliveryArea}.` : 'House or flat, street, area and a landmark.'}
                />
                <TextArea
                  id="checkout-instructions"
                  label="Delivery instructions"
                  optional
                  value={form.instructions}
                  onChange={set('instructions')}
                  error={errors.instructions}
                  hint="For example: call when you arrive."
                />
                <Honeypot value={trap} onChange={setTrap} />
                <p className="checkout-form__privacy">Your details are used only to deliver this order.</p>
                <div className="order-page__actions">
                  <Button variant="quiet" onClick={() => setStep('order')}>
                    Back to order
                  </Button>
                  <Button type="submit">Review order</Button>
                </div>
              </form>
            )}

            {step === 'review' && (
              <div className="review">
                <section aria-labelledby="review-items">
                  <h2 id="review-items" className="review__heading">
                    Items <button type="button" className="text-link" onClick={() => setStep('order')}>Edit</button>
                  </h2>
                  <OrderLines lines={lines} readOnly onQuantity={() => {}} onRemove={() => {}} onEdit={() => {}} />
                </section>
                <section aria-labelledby="review-details">
                  <h2 id="review-details" className="review__heading">
                    Deliver to <button type="button" className="text-link" onClick={() => setStep('details')}>Edit</button>
                  </h2>
                  <dl className="review__details">
                    <div><dt>Name</dt><dd>{form.name}</dd></div>
                    <div><dt>Phone</dt><dd>{form.phone}</dd></div>
                    <div><dt>Address</dt><dd>{form.address}</dd></div>
                    {form.instructions.trim() && <div><dt>Instructions</dt><dd>{form.instructions}</dd></div>}
                  </dl>
                </section>

                {submission.kind === 'error' && <ErrorNotice>{submission.message}</ErrorNotice>}

                {!canSubmit && (
                  <SetupNotice title="Online ordering is not connected yet">
                    <p>
                      Orders cannot be sent from the website at the moment, so nothing will be submitted.
                      {site.contact.phone ? (
                        <> Call the café on <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`}>{site.contact.phone}</a> to order.</>
                      ) : null}
                    </p>
                    <DevHint>Site owner: add the WhatsApp number or connect Supabase (see docs/DEPLOYMENT.md).</DevHint>
                  </SetupNotice>
                )}

                <div className="review__submit">
                  {backend && (
                    <Button onClick={submitToBackend} loading={submission.kind === 'sending'} icon={<Send size={16} />}>
                      Send order request
                    </Button>
                  )}
                  {whatsapp && (
                    <Button variant={backend ? 'secondary' : 'primary'} onClick={sendWhatsApp} icon={<MessageCircle size={16} />}>
                      Send order on WhatsApp
                    </Button>
                  )}
                  {!canSubmit && <Button disabled>Send order request</Button>}
                  <p className="review__fineprint">
                    {backend
                      ? 'Sending creates a pending request. The café confirms it by phone.'
                      : whatsapp
                        ? 'This opens WhatsApp with your order written out. The café confirms it in the chat.'
                        : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="order-page__aside" aria-label="Order summary">
            <OrderSummary totals={totals} />
          </aside>
        </div>
      </div>

      <ProductDialog
        product={editing ? getProduct(editing.productId) ?? null : null}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        onConfirm={(selection) => {
          if (editing) dispatch({ type: 'replace', key: editing.key, selection });
          setEditing(null);
        }}
      />
    </div>
  );
}
