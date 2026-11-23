import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ImageSlot } from '../components/common/ImageSlot';
import { Botanical } from '../components/common/Botanical';
import { Ornament } from '../components/common/bits';
import { ReservationForm } from '../components/booking/ReservationForm';
import { OccasionForm } from '../components/booking/OccasionForm';
import { useDocumentTitle } from '../hooks';
import { site } from '../config/site';

export default function Reservations() {
  useDocumentTitle('Reservations');
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="reservations-page">
      <section className="res-hero surface-burgundy grain on-dark" aria-labelledby="res-title">
        <div className="container res-hero__grid">
          <div className="res-hero__text">
            <h1 id="res-title" className="page-title">
              Reservations
            </h1>
            <p className="page-lead">Ask for a table and the café will confirm it with you. Ordering food for delivery is separate: use the menu for that.</p>
            <ul role="list" className="res-hero__points">
              <li>Requests up to {site.reservations.maxDaysAhead} days ahead</li>
              <li>Up to {site.reservations.maxPartySize} guests per table request</li>
              <li>Confirmed by the café, not automatically</li>
            </ul>
            <div className="res-hero__media">
              <ImageSlot id="ATM-02" sizes="(min-width: 64rem) 30vw, 90vw" />
            </div>
          </div>
          <div className="res-hero__form">
            <ReservationForm />
          </div>
        </div>
      </section>

      <section id="occasions" className="occasions textured surface-parchment" aria-labelledby="occasions-title">
        <Botanical variant="vertical" className="occasions__sprig" />
        <div className="container occasions__grid">
          <div className="occasions__intro">
            <Ornament />
            <h2 id="occasions-title" className="section-title">
              Birthdays, small celebrations and group visits
            </h2>
            <p className="prose-serif">
              Planning something for a group? Send an enquiry with the occasion, a preferred date and roughly how many of you there will be. The café will reply with what it can offer.
            </p>
            <p className="occasions__fine">This is an enquiry, not a booking. Nothing is reserved until the café confirms it with you.</p>
          </div>
          <OccasionForm />
        </div>
      </section>
    </div>
  );
}
