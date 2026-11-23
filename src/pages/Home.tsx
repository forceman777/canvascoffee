import { Link } from 'react-router-dom';
import { CalendarDays, UtensilsCrossed } from 'lucide-react';
import { ButtonLink } from '../components/common/Button';
import { ImageSlot, sourceSet } from '../components/common/ImageSlot';
import { Botanical } from '../components/common/Botanical';
import { Ornament } from '../components/common/bits';
import { Reveal } from '../components/motion/Reveal';
import { IcedLatteSequence } from '../components/motion/IcedLatteSequence';
import { categoriesInGroup, fromPrice, menuGroups, products, productsInCategory } from '../data/menu';
import { homeContent } from '../data/siteContent';
import { imageFiles, images, publicPath, type ImageId } from '../data/images';
import { formatINR } from '../utils/pricing';
import { site } from '../config/site';
import { useDocumentTitle } from '../hooks';

/** Art-directed hero: desktop and mobile compositions from HERO-01 / HERO-02. */
function HeroMedia() {
  const desktop = imageFiles('HERO-01');
  const mobile = imageFiles('HERO-02');
  if (desktop && mobile) {
    return (
      <picture className="hero__media">
        <source media="(min-width: 52rem)" type="image/webp" srcSet={sourceSet(desktop, images['HERO-01'].file, 'webp')} sizes="100vw" />
        <source type="image/webp" srcSet={sourceSet(mobile, images['HERO-02'].file, 'webp')} sizes="100vw" />
        <img src={publicPath(desktop.fallback)} alt={images['HERO-01'].alt} width={desktop.width} height={desktop.height} {...{ fetchpriority: 'high' }} />
      </picture>
    );
  }
  return (
    <div className="hero__media">
      <ImageSlot id="HERO-01" priority bare className="hero__media--desktop" position="70% 50%" />
      <ImageSlot id="HERO-02" priority bare className="hero__media--mobile" />
    </div>
  );
}

const groupImage: Record<string, ImageId> = { drinks: 'MENU-02', food: 'MENU-03', mocktails: 'MENU-12' };

export default function Home() {
  useDocumentTitle(null);
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero surface-ink grain on-dark" aria-labelledby="hero-title">
        <HeroMedia />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="container hero__content">
          <p className="hero__place">{site.locality.replace(', India', '')}</p>
          <h1 id="hero-title" className="hero__title">
            {homeContent.heroTitle}
          </h1>
          <p className="hero__lead">{homeContent.heroLead}</p>
          <div className="hero__actions">
            <ButtonLink to="/menu" variant="brass" onDark icon={<UtensilsCrossed size={16} />}>
              Explore the menu
            </ButtonLink>
            <ButtonLink to="/reservations" variant="secondary" onDark icon={<CalendarDays size={16} />}>
              Reserve a table
            </ButtonLink>
          </div>
        </div>
        <Botanical variant="horizontal" className="hero__sprig" />
      </section>

      {/* ---------- Story teaser ---------- */}
      <section className="home-story textured surface-parchment" aria-labelledby="home-story-title">
        <Botanical variant="vertical" className="home-story__sprig" />
        <div className="container home-story__grid">
          <Reveal kind="unveil" className="home-story__media">
            <ImageSlot id="STORY-01" sizes="(min-width: 64rem) 34vw, 90vw" />
          </Reveal>
          <div className="home-story__text">
            <Reveal>
              <h2 id="home-story-title" className="section-title">
                {homeContent.storyTitle}
              </h2>
            </Reveal>
            {homeContent.storyBody.map((p) => (
              <p key={p} className="prose-serif">
                {p}
              </p>
            ))}
            <ButtonLink to="/story" variant="quiet">
              Read our story
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ---------- Signature iced latte ---------- */}
      <IcedLatteSequence nextId="home-menu" />

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
                  <ImageSlot id={groupImage[g.id]} sizes="(min-width: 64rem) 30vw, 90vw" />
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
            <div className="hero__actions">
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
        <div className="container home-visit__grid">
          <div>
            <h2 id="home-visit-title" className="section-title">
              {homeContent.visitTitle}
            </h2>
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
            <ButtonLink to="/contact" variant="quiet">
              Contact and directions
            </ButtonLink>
          </div>
          <Reveal kind="unveil" className="home-visit__media">
            <ImageSlot id="ATM-03" sizes="(min-width: 64rem) 45vw, 90vw" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
