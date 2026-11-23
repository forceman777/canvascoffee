import { useCallback, useState } from 'react';
import { CalendarDays, Pause, Play, Plus, UtensilsCrossed } from 'lucide-react';
import { ButtonLink } from '../common/Button';
import { Price } from '../common/bits';
import { PourCanvas } from '../art/PourCanvas';
import { imageFiles, publicPath } from '../../data/images';
import { getProduct } from '../../data/menu';
import { homeContent } from '../../data/siteContent';
import { site } from '../../config/site';
import { usePrefersReducedMotion } from '../../hooks';
import { useAddToOrder } from '../../hooks/useAddToOrder';
import type { VesselKind } from '../art/vessels';

/** Each vessel in the pour is tied to a real item on the menu. */
const sequence: { kind: VesselKind; productId: string; note: string }[] = [
  { kind: 'glass', productId: 'cold-coffee', note: 'Over ice' },
  { kind: 'cup', productId: 'black-coffee', note: 'Freshly poured' },
  { kind: 'togo', productId: 'regular-coffee', note: 'Lidded and ready to go' },
];
const kinds = sequence.map((s) => s.kind);

/**
 * Hero: coffee pours into a glass of ice, a cup, then a take-away cup, with splashes
 * and the last drops falling onto the coffee. A supplied video (HERO-VID) replaces the
 * drawn animation automatically.
 */
export function HeroPour() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const { add } = useAddToOrder();
  const onChange = useCallback((i: number) => setIndex(i), []);
  const video = imageFiles('HERO-VID');

  const current = sequence[index];
  const product = getProduct(current.productId)!;

  return (
    <section className="hero-pour textured surface-ivory" aria-labelledby="hero-title">
      <div className="hero-pour__glow" aria-hidden="true" />
      <div className="container hero-pour__grid">
        <div className="hero-pour__stage">
          {video ? (
            <video className="hero-pour__video" src={publicPath(video.fallback)} autoPlay={!reduced} muted loop playsInline aria-label="Coffee being poured" />
          ) : (
            <PourCanvas mode="pour" kinds={kinds} paused={paused} reduced={reduced} onVesselChange={onChange} className="hero-pour__canvas" label="Coffee pouring into a glass of ice, a cup and a take-away cup" />
          )}
          {!video && (
            <div className="pour-caption">
              <span className="pour-caption__note">{current.note}</span>
              <span className="pour-caption__name">{product.name}</span>
              <Price amount={product.price as number} className="pour-caption__price" />
              <button type="button" className="pour-caption__add" onClick={() => add(product)} aria-label={`Add ${product.name} to your order`}>
                <Plus size={16} strokeWidth={2} aria-hidden="true" />
                Add
              </button>
              {!reduced && (
                <button type="button" className="pour-caption__pause" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play animation' : 'Pause animation'} aria-pressed={paused}>
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="hero-pour__text">
          <p className="hero-pour__place">{site.locality.replace(', India', '')}</p>
          <h1 id="hero-title" className="hero-pour__title">
            {homeContent.heroTitle}
          </h1>
          <p className="hero-pour__lead">{homeContent.heroLead}</p>
          <div className="hero-pour__actions">
            <ButtonLink to="/menu" icon={<UtensilsCrossed size={16} />}>
              Explore the menu
            </ButtonLink>
            <ButtonLink to="/reservations" variant="secondary" icon={<CalendarDays size={16} />}>
              Reserve a table
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
