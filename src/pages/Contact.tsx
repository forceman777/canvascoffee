import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, MessageCircle } from 'lucide-react';
import { ImageSlot } from '../components/common/ImageSlot';
import { ExternalButton } from '../components/common/Button';
import { WhisperBox } from '../components/engagement/WhisperBox';
import { site } from '../config/site';
import { useDocumentTitle } from '../hooks';

function Pending({ children }: { children: string }) {
  return <span className="is-pending">{children}</span>;
}

export default function Contact() {
  useDocumentTitle('Contact');
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);
  const { contact, openingHours, whatsappNumber } = site;

  return (
    <div className="contact-page">
      <section className="contact-hero surface-walnut grain on-dark" aria-labelledby="contact-title">
        <div className="container contact-hero__grid">
          <div>
            <h1 id="contact-title" className="page-title">
              Contact
            </h1>
            <p className="page-lead">Find the café, check the hours, or get in touch.</p>
            <ul role="list" className="contact-list">
              <li>
                <MapPin size={20} strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <h2>Address</h2>
                  {contact.address ? <address>{contact.address}</address> : <p>{site.locality}. <Pending>Street address to be added.</Pending></p>}
                </div>
              </li>
              <li>
                <Clock size={20} strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <h2>Opening hours</h2>
                  {openingHours.length ? (
                    <dl className="hours">
                      {openingHours.map((h) => (
                        <div key={h.days}>
                          <dt>{h.days}</dt>
                          <dd>{h.hours}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p><Pending>To be added</Pending></p>
                  )}
                </div>
              </li>
              <li>
                <Phone size={20} strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <h2>Phone</h2>
                  {contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a> : <p><Pending>To be added</Pending></p>}
                </div>
              </li>
              <li>
                <Mail size={20} strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <h2>Email</h2>
                  {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <p><Pending>To be added</Pending></p>}
                </div>
              </li>
            </ul>
            <div className="contact-hero__actions">
              {contact.mapUrl && (
                <ExternalButton href={contact.mapUrl} variant="brass" onDark icon={<MapPin size={16} />}>
                  Get directions
                </ExternalButton>
              )}
              {whatsappNumber && (
                <ExternalButton href={`https://wa.me/${whatsappNumber}`} variant="secondary" onDark icon={<MessageCircle size={16} />}>
                  Message on WhatsApp
                </ExternalButton>
              )}
            </div>
          </div>
          <div className="contact-hero__media">
            <ImageSlot id="ATM-03" sizes="(min-width: 64rem) 45vw, 90vw" />
          </div>
        </div>
      </section>
      <WhisperBox />
    </div>
  );
}
