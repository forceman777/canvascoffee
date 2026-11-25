import { useMemo, useRef, useState } from 'react';
import { CalendarCheck, MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Honeypot, SelectField, TextArea, TextField } from '../common/Field';
import { ErrorNotice, InfoNotice, SetupNotice, DevHint } from '../common/bits';
import { hasErrors, validateReservation, type Errors, type ReservationForm as Form } from '../../utils/validation';
import { addDays, addMinutes, formatLongDate, formatTime, isoDate, timeSlots } from '../../utils/dates';
import { reservationMessage, whatsappConfigured, whatsappUrl } from '../../utils/whatsapp';
import { backendConfigured, BackendError } from '../../services/backend';
import { requestReservation } from '../../services/submissions';
import { site } from '../../config/site';

const empty: Form = { date: '', time: '', until: '', partySize: '2', name: '', phone: '', email: '', requests: '' };

/** 30-minute choices within opening hours: starts up to 30 min before closing, ends up to closing. */
const open = site.hours?.open ?? '08:00';
const close = site.hours?.close ?? '23:00';
const startSlots = timeSlots(open, addMinutes(close, -30));
const endSlots = timeSlots(addMinutes(open, 30), close);

type State =
  | { kind: 'form' }
  | { kind: 'review' }
  | { kind: 'sending' }
  | { kind: 'sent'; reference: string }
  | { kind: 'whatsapp' }
  | { kind: 'error'; message: string };

export function ReservationForm() {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors<Form>>({});
  const [state, setState] = useState<State>({ kind: 'form' });
  const [trap, setTrap] = useState('');
  const topRef = useRef<HTMLDivElement>(null);
  const backend = backendConfigured();
  const whatsapp = whatsappConfigured();

  const today = useMemo(() => isoDate(new Date()), []);
  const lastDay = useMemo(() => isoDate(addDays(new Date(), site.reservations.maxDaysAhead)), []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  // Choosing a start time suggests an end time one hour later (the guest can change it).
  const setFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const from = e.target.value;
    setForm((f) => {
      const suggested = addMinutes(from, 60) > close ? close : addMinutes(from, 60);
      return { ...f, time: from, until: !from ? '' : f.until && f.until > from ? f.until : suggested };
    });
    if (errors.time || errors.until) setErrors((er) => ({ ...er, time: undefined, until: undefined }));
  };

  const focusTop = () => requestAnimationFrame(() => topRef.current?.focus());

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateReservation(form);
    setErrors(found);
    if (hasErrors(found)) {
      document.getElementById(`res-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setState({ kind: 'review' });
    focusTop();
  };

  const send = async () => {
    if (trap) return;
    setState({ kind: 'sending' });
    try {
      const res = await requestReservation(form);
      setState({ kind: 'sent', reference: res.reference });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof BackendError ? err.message : 'Something went wrong. Nothing was submitted.' });
    }
    focusTop();
  };

  const sendWhatsApp = () => {
    if (trap) return;
    window.open(whatsappUrl(reservationMessage(form)), '_blank', 'noopener,noreferrer');
    setState({ kind: 'whatsapp' });
    focusTop();
  };

  const summary = (
    <dl className="booking-summary">
      <div><dt>Date</dt><dd>{form.date && formatLongDate(form.date)}</dd></div>
      <div><dt>Time</dt><dd>{form.time && form.until && `About ${formatTime(form.time)} to ${formatTime(form.until)}`}</dd></div>
      <div><dt>Guests</dt><dd>{form.partySize}</dd></div>
      <div><dt>Name</dt><dd>{form.name}</dd></div>
      <div><dt>Phone</dt><dd>{form.phone}</dd></div>
      {form.email.trim() && <div><dt>Email</dt><dd>{form.email}</dd></div>}
      {form.requests.trim() && <div><dt>Requests</dt><dd>{form.requests}</dd></div>}
    </dl>
  );

  if (state.kind === 'sent') {
    return (
      <div className="booking-card booking-result" ref={topRef} tabIndex={-1}>
        <CalendarCheck size={28} strokeWidth={1.4} aria-hidden="true" className="booking-result__icon" />
        <h2 className="booking-card__title">Table request sent</h2>
        <p>
          Reference <strong className="tabular">{state.reference}</strong>
        </p>
        <InfoNotice>
          This is a request, not a confirmed booking. The café will contact you on <strong>{form.phone}</strong> to confirm whether a table is available.
        </InfoNotice>
        {summary}
        <Button variant="quiet" onClick={() => { setForm(empty); setState({ kind: 'form' }); }}>
          Make another request
        </Button>
      </div>
    );
  }

  if (state.kind === 'whatsapp') {
    return (
      <div className="booking-card booking-result" ref={topRef} tabIndex={-1}>
        <h2 className="booking-card__title">Finish in WhatsApp</h2>
        <InfoNotice>
          WhatsApp opened with your request written out. It is sent only when you press send there, and your table is confirmed only when the café replies.
        </InfoNotice>
        <div className="booking-actions">
          <Button variant="secondary" onClick={sendWhatsApp} icon={<MessageCircle size={16} />}>Open WhatsApp again</Button>
          <Button variant="quiet" onClick={() => setState({ kind: 'review' })}>Back</Button>
        </div>
      </div>
    );
  }

  if (state.kind === 'review' || state.kind === 'sending' || state.kind === 'error') {
    return (
      <div className="booking-card" ref={topRef} tabIndex={-1}>
        <h2 className="booking-card__title">Check your request</h2>
        {summary}
        {state.kind === 'error' && <ErrorNotice>{state.message}</ErrorNotice>}
        {!backend && !whatsapp && (
          <SetupNotice title="Table requests are not connected yet">
            <p>Requests cannot be sent from the website at the moment, so nothing will be submitted.{site.contact.phone ? ` Call ${site.contact.phone} to ask about a table.` : ''}</p>
            <DevHint>Site owner: add the WhatsApp number or connect Supabase (see docs/DEPLOYMENT.md).</DevHint>
          </SetupNotice>
        )}
        <div className="booking-actions">
          <Button variant="quiet" onClick={() => setState({ kind: 'form' })}>Edit details</Button>
          {backend && <Button onClick={send} loading={state.kind === 'sending'}>Send table request</Button>}
          {whatsapp && (
            <Button variant={backend ? 'secondary' : 'primary'} onClick={sendWhatsApp} icon={<MessageCircle size={16} />}>
              Send request on WhatsApp
            </Button>
          )}
          {!backend && !whatsapp && <Button disabled>Send table request</Button>}
        </div>
      </div>
    );
  }

  return (
    <form className="booking-card booking-form" onSubmit={review} noValidate ref={topRef as never} tabIndex={-1}>
      <h2 className="booking-card__title">Request a table</h2>
      <p className="booking-card__lead">Tell us when you would like to come. Every request is confirmed by the café.</p>
      {!backend && !whatsapp && (
        <SetupNotice title="Table requests are not connected yet">
          <p>You can fill this in, but it cannot be sent from the website at the moment.{site.contact.phone ? ` Call ${site.contact.phone} to ask about a table.` : ''}</p>
        </SetupNotice>
      )}
      <div className="booking-form__row booking-form__row--2">
        <TextField id="res-date" label="Date" type="date" min={today} max={lastDay} value={form.date} onChange={set('date')} error={errors.date} />
        <SelectField id="res-partySize" label="Guests" value={form.partySize} onChange={set('partySize')} error={errors.partySize}>
          {Array.from({ length: site.reservations.maxPartySize }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} {i === 0 ? 'guest' : 'guests'}
            </option>
          ))}
        </SelectField>
      </div>
      <fieldset className="time-range">
        <legend>
          Time <span className="field__optional">(approximately)</span>
        </legend>
        <div className="time-range__row">
          <SelectField id="res-time" label="From" value={form.time} onChange={setFrom} error={errors.time}>
            <option value="">Choose…</option>
            {startSlots.map((t) => (
              <option key={t} value={t}>
                {formatTime(t)}
              </option>
            ))}
          </SelectField>
          <span className="time-range__to" aria-hidden="true">
            to
          </span>
          <SelectField id="res-until" label="To" value={form.until} onChange={set('until')} error={errors.until}>
            <option value="">Choose…</option>
            {endSlots
              .filter((t) => !form.time || t > form.time)
              .map((t) => (
                <option key={t} value={t}>
                  {formatTime(t)}
                </option>
              ))}
          </SelectField>
        </div>
        {site.hours && (
          <p className="time-range__hint">
            Open {formatTime(site.hours.open)} to {formatTime(site.hours.close)}. Give a rough window; the café confirms the exact time.
          </p>
        )}
      </fieldset>
      {!site.hours && (
        <p className="booking-form__hint">Opening hours will be shown here once confirmed. The café will tell you if your chosen time is not available.</p>
      )}
      <div className="booking-form__row booking-form__row--2">
        <TextField id="res-name" label="Name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField id="res-phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
      </div>
      <TextField id="res-email" label="Email" type="email" optional autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
      <TextArea id="res-requests" label="Special requests" optional value={form.requests} onChange={set('requests')} error={errors.requests} hint="For example: a high chair, or a table near the window." />
      <Honeypot value={trap} onChange={setTrap} />
      <div className="booking-actions">
        <Button type="submit">Review request</Button>
      </div>
      <p className="booking-form__fineprint">More than {site.reservations.maxPartySize} guests, or planning a celebration? Use the occasion enquiry below.</p>
    </form>
  );
}
