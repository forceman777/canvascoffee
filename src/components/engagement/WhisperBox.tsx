import { useRef, useState } from 'react';
import { Feather, MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Honeypot, TextArea, TextField } from '../common/Field';
import { ErrorNotice, SetupNotice, DevHint } from '../common/bits';
import { hasErrors, validateWhisper, type Errors, type WhisperForm } from '../../utils/validation';
import { backendConfigured, BackendError } from '../../services/backend';
import { sendWhisper } from '../../services/submissions';
import { whisperContent } from '../../data/siteContent';
import { whatsappConfigured, whatsappUrl } from '../../utils/whatsapp';
import { site } from '../../config/site';

const empty: WhisperForm = { message: '', name: '', contact: '' };

export function WhisperBox() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Errors<WhisperForm>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'whatsapp' | { error: string }>('idle');
  const [trap, setTrap] = useState('');
  const doneRef = useRef<HTMLDivElement>(null);
  const backend = backendConfigured();
  // Without a database the note is handed to the café's WhatsApp (the visitor sends it themselves).
  const viaWhatsApp = !backend && whatsappConfigured();

  const set = (k: keyof WhisperForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateWhisper(form);
    setErrors(found);
    if (hasErrors(found)) {
      document.getElementById(`whisper-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    if (trap) return;
    if (viaWhatsApp) {
      const lines = [`A note for ${site.name} (Whisper Box):`, '', form.message.trim()];
      if (form.name.trim()) lines.push('', `From: ${form.name.trim()}`);
      if (form.contact.trim()) lines.push(`Reply to: ${form.contact.trim()}`);
      window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener,noreferrer');
      setState('whatsapp');
      return;
    }
    if (!backend) return;
    setState('sending');
    try {
      await sendWhisper(form);
      setState('sent');
      setForm(empty);
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (err) {
      setState({ error: err instanceof BackendError ? err.message : 'Something went wrong. Your note was not sent.' });
    }
  };

  return (
    <section id="whisper-box" className="whisper textured surface-parchment" aria-labelledby="whisper-title">
      <div className="container whisper__grid">
        <div className="whisper__intro">
          <Feather size={26} strokeWidth={1.2} aria-hidden="true" className="whisper__icon" />
          <h2 id="whisper-title" className="whisper__title">
            {whisperContent.title}
          </h2>
          <p className="whisper__lead">{whisperContent.lead}</p>
          <p className="whisper__privacy">{viaWhatsApp ? whisperContent.privacyWhatsApp : whisperContent.privacy}</p>
        </div>
        {state === 'whatsapp' ? (
          <div className="whisper__card booking-result">
            <h3 className="booking-card__title">Finish in WhatsApp</h3>
            <p>WhatsApp opened with your note written out. It reaches the café when you press send there.</p>
            <Button variant="quiet" onClick={() => setState('idle')}>Back to the note</Button>
          </div>
        ) : state === 'sent' ? (
          <div className="whisper__card booking-result" ref={doneRef} tabIndex={-1}>
            <h3 className="booking-card__title">Your note is in the box</h3>
            <p>Thank you. The café team reads every message.</p>
            <Button variant="quiet" onClick={() => setState('idle')}>Write another</Button>
          </div>
        ) : (
          <form className="whisper__card" onSubmit={submit} noValidate>
            <TextArea id="whisper-message" label="Your note" rows={5} value={form.message} onChange={set('message')} error={errors.message} maxLength={600} />
            <div className="booking-form__row booking-form__row--2">
              <TextField id="whisper-name" label="Name" optional autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
              <TextField id="whisper-contact" label="Phone or email" optional value={form.contact} onChange={set('contact')} error={errors.contact} hint="Only if you would like a reply." />
            </div>
            <Honeypot value={trap} onChange={setTrap} />
            {typeof state === 'object' && <ErrorNotice>{state.error}</ErrorNotice>}
            {!backend && !viaWhatsApp && (
              <SetupNotice title="The Whisper Box is not connected yet">
                <p>Notes cannot be sent from the website at the moment, so nothing will be submitted.</p>
                <DevHint>Site owner: connect Supabase to receive notes (see docs/DEPLOYMENT.md).</DevHint>
              </SetupNotice>
            )}
            {viaWhatsApp ? (
              <Button type="submit" variant="primary" icon={<MessageCircle size={16} />}>
                Send the note on WhatsApp
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={!backend} loading={state === 'sending'}>
                Leave the note
              </Button>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
