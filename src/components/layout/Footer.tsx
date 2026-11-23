import { Link } from 'react-router-dom';
import { site } from '../../config/site';
import { Wordmark } from '../common/Wordmark';
import { Botanical } from '../common/Botanical';
import { navItems } from '../navigation/navItems';
import { formatINR } from '../../utils/pricing';

export function Footer() {
  const { contact, openingHours } = site;
  return (
    <footer className="site-footer surface-ink grain on-dark">
      <Botanical variant="horizontal" className="site-footer__sprig" />
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Wordmark size="lg" />
          <p className="site-footer__locality">{site.locality}</p>
          <p className="site-footer__note">
            Free delivery on orders above {formatINR(site.ordering.freeDeliveryAbove)}. Otherwise a {formatINR(site.ordering.deliveryFee)} delivery charge applies.
          </p>
        </div>

        <nav className="site-footer__col" aria-label="Footer">
          <h2 className="site-footer__heading">Explore</h2>
          <ul role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/order">Your order</Link>
            </li>
          </ul>
        </nav>

        <div className="site-footer__col">
          <h2 className="site-footer__heading">Visit</h2>
          {contact.address ? <address>{contact.address}</address> : <p className="is-pending">Street address to be added</p>}
          {openingHours.length > 0 ? (
            <dl className="hours">
              {openingHours.map((h) => (
                <div key={h.days}>
                  <dt>{h.days}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="is-pending">Opening hours to be added</p>
          )}
          {contact.mapUrl && (
            <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer">
              Open in Maps
            </a>
          )}
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__heading">Contact</h2>
          {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {site.whatsappNumber && (
            <a href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
          {contact.instagramUrl && (
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          {contact.facebookUrl && (
            <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          )}
          {!contact.phone && !contact.email && !site.whatsappNumber && <p className="is-pending">Phone and email to be added</p>}
          <Link to="/contact#whisper-box">Leave us a note</Link>
        </div>
      </div>
      <div className="container site-footer__base">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p>Prices in Indian rupees.</p>
      </div>
    </footer>
  );
}
