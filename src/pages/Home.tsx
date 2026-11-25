import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/common/Button';
import { ImageSlot } from '../components/common/ImageSlot';
import { Ornament } from '../components/common/bits';
import { Reveal } from '../components/motion/Reveal';
import { CafeReel } from '../components/common/CafeReel';
import { HeroPour } from '../components/home/HeroPour';
import { HeroFilm } from '../components/home/HeroFilm';
import { hasImage } from '../data/images';
import { FoodShowcase } from '../components/home/FoodShowcase';
import { CoffeeSlider } from '../components/home/CoffeeSlider';
import { categoriesInGroup, fromPrice, menuGroups, products, productsInCategory } from '../data/menu';
import { homeContent } from '../data/siteContent';
import type { ImageId } from '../data/images';
import { formatINR } from '../utils/pricing';
import { site } from '../config/site';
import { useDocumentTitle } from '../hooks';

/** In-context photos where supplied, otherwise the category cut-outs. */
const groupImage: Record<string, ImageId> = {
  drinks: hasImage('SCENE-DRINKS') ? 'SCENE-DRINKS' : 'MENU-02',
  food: 'MENU-03',
  mocktails: hasImage('SCENE-MOCKTAILS') ? 'SCENE-MOCKTAILS' : 'MENU-12',
};
const foodVideo = hasImage('FOOD-VID');
const hasReel = hasImage('CAFE-VID');

export default function Home() {
  useDocumentTitle(null);
  return (
    <>
      {hasImage('HERO-VID') ? <HeroFilm /> : <HeroPour />}
      <FoodShowcase />
      <CoffeeSlider />

      {/* ---------- Menu preview ---------- */}
      <section id="home-menu" className="home-menu surface-ivory" aria-labelledby="home-menu-title">
        <div className="container">
          <Reveal className="home-menu__header">
            <h2 id="home-menu-title" className="section-title">
              {homeContent.menuTitle}
            </h2>
            <p className="section-lead">{homeContent.menuLead}</p>
          </Reveal>
          <div className="home-menu__grid">
            {menuGroups.map((g) => {
              const cats = categoriesInGroup(g.id);
              const items = products.filter((p) => cats.some((c) => c.id === p.categoryId));
              const from = Math.min(...items.map(fromPrice));
              return (
                <article key={g.id} className="menu-teaser">
                  {g.id === 'food' && foodVideo ? (
                    <CafeReel variant="card" videoId="FOOD-VID" posterId="FOOD-POSTER" name="momo video" sizes="(min-width: 64rem) 30vw, 90vw" />
                  ) : (
                    <ImageSlot id={groupImage[g.id]} ratio={[4, 3]} sizes="(min-width: 64rem) 30vw, 90vw" className="menu-teaser__image" />
                  )}
                  <div className="menu-teaser__body">
                    <h3 className="menu-teaser__title">{g.name}</h3>
                    <p className="menu-teaser__meta">
                      {items.length} on the menu, from {formatINR(from)}
                    </p>
                    <ul role="list" className="menu-teaser__cats">
                      {cats.map((c) => (
                        <li key={c.id}>
                          <Link to={`/menu#${c.id}`}>
                            {c.name} <span className="tabular">{productsInCategory(c.id).length}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
          {site.menuImagesAreIllustrative && <p className="home-menu__note">Images are illustrative.</p>}
          <div className="home-menu__cta">
            <ButtonLink to="/menu">See the full menu</ButtonLink>
            <ButtonLink to="/order" variant="secondary">
              Start an order
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ---------- Reservation invitation ---------- */}
      <section className="home-reserve surface-burgundy grain on-dark" aria-labelledby="home-reserve-title">
        <div className="container home-reserve__grid">
          <Reveal kind="unveil" className="home-reserve__media">
            <ImageSlot id="ATM-02" sizes="(min-width: 64rem) 30vw, 90vw" />
          </Reveal>
          <div className="home-reserve__text">
            <Ornament />
            <h2 id="home-reserve-title" className="section-title">
              {homeContent.reserveTitle}
            </h2>
            <p className="prose-serif">{homeContent.reserveBody}</p>
            <div className="button-row">
              <ButtonLink to="/reservations" variant="brass" onDark>
                Request a table
              </ButtonLink>
              <ButtonLink to="/reservations#occasions" variant="secondary" onDark>
                Plan an occasion
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Visit ---------- */}
      <section className="home-visit surface-ivory" aria-labelledby="home-visit-title">
        <div className={`container home-visit__grid ${hasReel ? 'home-visit__grid--reel' : ''}`}>
          <div className="home-visit__text">
            <h2 id="home-visit-title" className="section-title">
              {homeContent.visitTitle}
            </h2>
            {hasReel && <p className="section-lead">{homeContent.visitLead}</p>}
            <dl className="visit-list">
              <div>
                <dt>Where</dt>
                <dd>{site.contact.address ?? <span className="is-pending">{site.locality}. Street address to be added.</span>}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {site.openingHours.length ? (
                    site.openingHours.map((h) => (
                      <span key={h.days} className="visit-list__hours">
                        {h.days}: {h.hours}
                      </span>
                    ))
                  ) : (
                    <span className="is-pending">Opening hours to be added</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>
                  Free above {formatINR(site.ordering.freeDeliveryAbove)}, otherwise {formatINR(site.ordering.deliveryFee)}.
                </dd>
              </div>
            </dl>
            <div className="button-row">
              <ButtonLink to="/contact" variant="secondary">
                Contact and directions
              </ButtonLink>
              {hasReel && (
                <ButtonLink to="/gallery" variant="quiet">
                  See the gallery
                </ButtonLink>
              )}
            </div>
          </div>
          {hasReel ? (
            <Reveal kind="rise" className="home-visit__reel">
              <CafeReel caption="A walk around the café" />
            </Reveal>
          ) : (
            <Reveal kind="unveil" className="home-visit__media">
              <ImageSlot id="ATM-03" sizes="(min-width: 64rem) 45vw, 90vw" />
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
