import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, Plus } from 'lucide-react';
import { PourCanvas } from '../art/PourCanvas';
import { Bean, IceCube, LimeWheel, MintLeaf } from '../art/Ingredients';
import { ImageSlot } from '../common/ImageSlot';
import { Price } from '../common/bits';
import { getProduct, productsInCategory } from '../../data/menu';
import { hasImage, type ImageId } from '../../data/images';
import { useAddToOrder } from '../../hooks/useAddToOrder';
import { usePrefersReducedMotion } from '../../hooks';
import { formatINR } from '../../utils/pricing';
import type { VesselKind } from '../art/vessels';

interface Slide {
  id: string;
  theme: 'walnut' | 'caramel' | 'forest' | 'burgundy';
  ghost: string;
  kicker: string;
  title: string;
  body: string;
  products: string[];
  categoryId: string;
  vessel: VesselKind;
  imageId: ImageId;
  particles: 'beans' | 'ice' | 'mint';
}

const range = (categoryId: string) => {
  const prices = productsInCategory(categoryId).map((p) => p.price as number);
  return `${formatINR(Math.min(...prices))} to ${formatINR(Math.max(...prices))}`;
};

const slides: Slide[] = [
  {
    id: 'hot',
    theme: 'walnut',
    ghost: 'Roast',
    kicker: 'Hot coffee',
    title: 'Hot, dark and freshly poured',
    body: 'A straight black coffee or a milky regular. The simple ones, done properly.',
    products: ['black-coffee', 'regular-coffee'],
    categoryId: 'coffee',
    vessel: 'cup',
    imageId: 'SLIDE-01',
    particles: 'beans',
  },
  {
    id: 'cold',
    theme: 'caramel',
    ghost: 'Iced',
    kicker: 'Cold coffee',
    title: 'Cold, creamy, over ice',
    body: 'For the warm afternoons: a cold coffee, or an iced mocha with chocolate.',
    products: ['cold-coffee', 'iced-mocha'],
    categoryId: 'coffee',
    vessel: 'glass',
    imageId: 'SLIDE-02',
    particles: 'ice',
  },
  {
    id: 'tea',
    theme: 'forest',
    ghost: 'Chai',
    kicker: 'Tea',
    title: 'Tea, any time of day',
    body: `Four teas on the menu, ${range('tea')}.`,
    products: ['masala-tea', 'leaker-tea', 'green-tea', 'iced-tea'],
    categoryId: 'tea',
    vessel: 'tea',
    imageId: 'SLIDE-03',
    particles: 'beans',
  },
  {
    id: 'mocktails',
    theme: 'burgundy',
    ghost: 'Fizz',
    kicker: 'Mocktails',
    title: 'Fizz, mint and something cold',
    body: `Six coolers, ${range('mocktails')}.`,
    products: ['mint-mojito', 'kacha-aam-mojito', 'blue-butterfly'],
    categoryId: 'mocktails',
    vessel: 'mocktail',
    imageId: 'SLIDE-04',
    particles: 'mint',
  },
];

const INTERVAL = 7000;
/** Stable arrays, so the canvas is not re-initialised on every render. */
const single: Record<VesselKind, VesselKind[]> = { glass: ['glass'], cup: ['cup'], tea: ['tea'], togo: ['togo'], mocktail: ['mocktail'] };

/** Positions for the burst of beans / ice / leaves when a slide arrives. */
const burst = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + 0.3;
  const d = 170 + (i % 3) * 60;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, r: (i * 67) % 360, s: 0.6 + (i % 4) * 0.18, delay: (i % 4) * 40 };
});
const ambient = [
  { x: -42, y: -30, s: 0.9, d: 0 },
  { x: 40, y: -38, s: 0.7, d: 1.2 },
  { x: 46, y: 30, s: 1, d: 0.6 },
  { x: -46, y: 34, s: 0.75, d: 1.8 },
  { x: 8, y: -46, s: 0.6, d: 2.4 },
];

function Particle({ kind, style, className }: { kind: Slide['particles']; style?: React.CSSProperties; className: string }) {
  if (kind === 'ice') return <IceCube className={className} style={style} />;
  if (kind === 'mint') return <MintLeaf className={className} style={style} />;
  return <Bean className={className} style={style} />;
}

export function CoffeeSlider() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const { add } = useAddToOrder();

  const autoplay = !reduced && !userPaused && !hovering && !focused && onScreen;

  const go = useCallback(
    (next: number, dir: 1 | -1, fromUser = true) => {
      setPrevious(active);
      setDirection(dir);
      setActive((next + slides.length) % slides.length);
      if (fromUser) setAnnounce(true);
    },
    [active],
  );
  const next = useCallback((user = true) => go(active + 1, 1, user), [active, go]);
  const prev = useCallback(() => go(active - 1, -1), [active, go]);

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => next(false), INTERVAL);
    return () => window.clearTimeout(t);
  }, [autoplay, active, next]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (previous === null) return;
    const t = window.setTimeout(() => setPrevious(null), 1100);
    return () => window.clearTimeout(t);
  }, [previous, active]);

  return (
    <section
      ref={rootRef}
      id="home-slider"
      className={`slider theme-${slides[active].theme} on-dark`}
      aria-roledescription="carousel"
      aria-label="Coffee, tea and mocktails"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        }
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button, a')) return;
        pointer.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = pointer.current;
        pointer.current = null;
        if (!start) return;
        const dx = e.clientX - start.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - start.y)) (dx < 0 ? next : prev)();
      }}
    >
      <div className="slider__backdrops" aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s.id} className={`slider__backdrop theme-${s.theme} ${i === active ? 'is-active' : ''}`} />
        ))}
      </div>

      <div className="slider__track" aria-live={announce && !autoplay ? 'polite' : 'off'}>
        {slides.map((s, i) => {
          const isActive = i === active;
          const isLeaving = i === previous;
          const mountArt = isActive || isLeaving;
          return (
            <div
              key={s.id}
              className={`slide ${isActive ? 'is-active' : ''} ${isLeaving ? 'is-leaving' : ''} ${direction === 1 ? 'dir-next' : 'dir-prev'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}: ${s.kicker}`}
              aria-hidden={!isActive}
              {...(!isActive ? { inert: '' } : {})}
            >
              <span className="slide__ghost" aria-hidden="true">
                {s.ghost}
              </span>
              <div className="container slide__grid">
                <div className="slide__text">
                  <p className="slide__kicker">{s.kicker}</p>
                  <h2 className="slide__title">{s.title}</h2>
                  <p className="slide__body">{s.body}</p>
                  <ul role="list" className="slide__items">
                    {s.products.map((id) => {
                      const p = getProduct(id)!;
                      return (
                        <li key={id}>
                          <span className="slide__item-name">{p.name}</span>
                          <Price amount={p.price as number} className="slide__item-price" />
                          <button type="button" className="slide__add" onClick={() => add(p)} aria-label={`Add ${p.name} to your order`}>
                            <Plus size={15} strokeWidth={2} aria-hidden="true" /> Add
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <Link to={`/menu#${s.categoryId}`} className="slide__link">
                    See all {s.kicker.toLowerCase()} on the menu
                  </Link>
                </div>
                <div className="slide__art" aria-hidden="true">
                  <div className="slide__halo" />
                  {mountArt &&
                    ambient.map((a, k) => (
                      <Particle
                        key={k}
                        kind={s.particles}
                        className="slide__ambient"
                        style={{ '--x': `${a.x}%`, '--y': `${a.y}%`, '--s': a.s, '--d': `${a.d}s` } as React.CSSProperties}
                      />
                    ))}
                  <div className="slide__product">
                    {mountArt &&
                      (hasImage(s.imageId) ? (
                        <ImageSlot id={s.imageId} bare fit="contain" sizes="(min-width: 52rem) 40vw, 80vw" />
                      ) : (
                        <PourCanvas mode="idle" kinds={single[s.vessel]} reduced={reduced} paused={!isActive} label={s.kicker} />
                      ))}
                  </div>
                  {isActive && !reduced && (
                    <div className="slide__burst" key={`burst-${active}`}>
                      {burst.map((b, k) => (
                        <Particle
                          key={k}
                          kind={s.particles}
                          className="slide__burst-piece"
                          style={{ '--bx': `${b.x}px`, '--by': `${b.y}px`, '--br': `${b.r}deg`, '--bs': b.s, animationDelay: `${b.delay}ms` } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  )}
                  {s.particles === 'mint' && <LimeWheel className="slide__lime" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="container slider__controls">
        <div className="slider__dots" role="group" aria-label="Choose a slide">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`slider__dot ${i === active ? 'is-active' : ''}`}
              onClick={() => i !== active && go(i, i > active ? 1 : -1)}
              aria-label={`Show slide ${i + 1}: ${s.kicker}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <span className="slider__dot-label">{s.kicker}</span>
              <span className="slider__dot-bar">
                <span className={autoplay && i === active ? 'is-running' : ''} key={`${active}-${autoplay}`} style={{ animationDuration: `${INTERVAL}ms` }} />
              </span>
            </button>
          ))}
        </div>
        <div className="slider__buttons">
          {!reduced && (
            <button type="button" className="slider__btn" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Start automatic slides' : 'Pause automatic slides'}>
              {userPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          )}
          <button type="button" className="slider__btn" onClick={prev} aria-label="Previous slide">
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="slider__btn" onClick={() => next()} aria-label="Next slide">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
