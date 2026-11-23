import { useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Honeypot, SelectField, TextArea, TextField } from '../common/Field';
import { ErrorNotice, InfoNotice, SetupNotice, DevHint } from '../common/bits';
import { hasErrors, occasionTypes, validateEnquiry, type EnquiryForm, type Errors } from '../../utils/validation';
import { isoDate } from '../../utils/dates';
import { enquiryMessage, whatsappConfigured, whatsappUrl } from '../../utils/whatsapp';
import { backendConfigured, BackendError } from '../../services/backend';
import { sendEnquiry } from '../../services/submissions';

const empty: EnquiryForm = { name: '', phone: '', email: '', occasion: '', preferredDate: '', groupSize: '', message: '' };

type State = { kind: 'form' } | { kind: 'sending' } | { kind: 'sent'; reference: string } | { kind: 'whatsapp' } | { kind: 'error'; message: string };

/** An enquiry, never a booking: the café replies with what it can offer. */
export function OccasionForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Errors<EnquiryForm>>({});
  const [state, setState] = useState<State>({ kind: 'form' });
  const [trap, setTrap] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => isoDate(new Date()), []);
  const backend = backendConfigured();
  const whatsapp = whatsappConfigured();

  const set = (k: keyof EnquiryForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const found = validateEnquiry(form);
    setErrors(found);
    if (hasErrors(found)) {
      document.getElementById(`occ-${Object.keys(found)[0]}`)?.focus();
      return false;
    }
    return !trap;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !backend) return;
    setState({ kind: 'sending' });
    try {
      const res = await sendEnquiry(form);
      setState({ kind: 'sent', reference: res.reference });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (err) {
      setState({ kind: 'error', message: err instanceof BackendError ? err.message : 'Something went wrong. Nothing was submitted.' });
    }
  };

  const viaWhatsApp = () => {
    if (!validate()) return;
    window.open(whatsappUrl(enquiryMessage(form)), '_blank', 'noopener,noreferrer');
    setState({ kind: 'whatsapp' });
  };

  if (state.kind === 'sent' || state.kind === 'whatsapp') {
    return (
      <div className="booking-card booking-result" ref={resultRef} tabIndex={-1}>
        <h3 className="booking-card__title">{state.kind === 'sent' ? 'Enquiry sent' : 'Finish in WhatsApp'}</h3>
        {state.kind === 'sent' && (
          <p>
            Reference <strong className="tabular">{state.reference}</strong>
          </p>
        )}
        <InfoNotice>
          {state.kind === 'sent'
            ? 'The café will reply on the number you gave, with what it can offer for your occasion. Nothing is booked until then.'
            : 'WhatsApp opened with your enquiry written out. It is sent only when you press send there.'}
        </InfoNotice>
        <Button variant="quiet" onClick={() => { setForm(empty); setState({ kind: 'form' }); }}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form className="booking-card occasion-form" onSubmit={submit} noValidate>
      <h3 className="booking-card__title">Occasion enquiry</h3>
      <div className="booking-form__row booking-form__row--2">
        <SelectField id="occ-occasion" label="Occasion" value={form.occasion} onChange={set('occasion')} error={errors.occasion}>
          <option value="">Choose…</option>
          {occasionTypes.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </SelectField>
        <TextField id="occ-groupSize" label="Approximate group size" type="number" inputMode="numeric" min={1} max={200} value={form.groupSize} onChange={set('groupSize')} error={errors.groupSize} />
      </div>
      <TextField id="occ-preferredDate" label="Preferred date" type="date" optional min={today} value={form.preferredDate} onChange={set('preferredDate')} error={errors.preferredDate} />
      <div className="booking-form__row booking-form__row--2">
        <TextField id="occ-name" label="Name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField id="occ-phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
      </div>
      <TextField id="occ-email" label="Email" type="email" optional autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
      <TextArea id="occ-message" label="Tell us about it" optional value={form.message} onChange={set('message')} error={errors.message} hint="Timing, anything you are hoping for, questions for the café." />
      <Honeypot value={trap} onChange={setTrap} />
      {state.kind === 'error' && <ErrorNotice>{state.message}</ErrorNotice>}
      {!backend && !whatsapp && (
        <SetupNotice title="Enquiries are not connected yet">
          <p>Enquiries cannot be sent from the website at the moment, so nothing will be submitted.</p>
          <DevHint>Site owner: add the WhatsApp number or connect Supabase (see docs/DEPLOYMENT.md).</DevHint>
        </SetupNotice>
      )}
      <div className="booking-actions">
        {backend && <Button type="submit" loading={state.kind === 'sending'}>Send enquiry</Button>}
        {whatsapp && (
          <Button variant={backend ? 'secondary' : 'primary'} onClick={viaWhatsApp} icon={<MessageCircle size={16} />}>
            Send on WhatsApp
          </Button>
        )}
        {!backend && !whatsapp && <Button disabled>Send enquiry</Button>}
      </div>
    </form>
  );
}
