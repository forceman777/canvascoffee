import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, Plus } from 'lucide-react';
import { PourCanvas } from '../art/PourCanvas';
import { Bean, IceCube, MintLeaf } from '../art/Ingredients';
import { Picture } from '../common/ImageSlot';
import { Price } from '../common/bits';
import { getProduct, productsInCategory } from '../../data/menu';
import { hasImage, imageFiles, type ImageId } from '../../data/images';
import { useAddToOrder } from '../../hooks/useAddToOrder';
import { usePrefersReducedMotion } from '../../hooks';
import { formatINR } from '../../utils/pricing';
import { site } from '../../config/site';
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
  imageId: ImageId;
  /** Drawn stand-in, used only when no drink photos have been supplied at all. */
  vessel?: VesselKind;
  particles?: 'beans' | 'ice' | 'mint';
}

const priceRange = (ids: string[]) => {
  const prices = ids.map((id) => getProduct(id)!.price as number);
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? `${formatINR(lo)} each` : `${formatINR(lo)} to ${formatINR(hi)}`;
};
const categoryRange = (categoryId: string) => priceRange(productsInCategory(categoryId).map((p) => p.id));

const allSlides: Slide[] = [
  {
    id: 'hot',
    theme: 'walnut',
    ghost: 'Roast',
    kicker: 'Hot coffee',
    title: 'Hot, dark and freshly poured',
    body: 'A straight black coffee or a milky regular. The simple ones, done properly.',
    products: ['black-coffee', 'regular-coffee'],
    categoryId: 'coffee',
    imageId: 'SLIDE-01',
    vessel: 'cup',
    particles: 'beans',
  },
  {
    id: 'cold',
    theme: 'burgundy',
    ghost: 'Iced',
    kicker: 'Cold coffee',
    title: 'Cold, creamy, over ice',
    body: 'A chilled cold coffee, or an iced mocha with chocolate.',
    products: ['iced-mocha', 'cold-coffee'],
    categoryId: 'coffee',
    imageId: 'SLIDE-02',
    vessel: 'glass',
    particles: 'ice',
  },
  {
    id: 'tea',
    theme: 'forest',
    ghost: 'Chai',
    kicker: 'Tea',
    title: 'Tea, iced or hot',
    body: `Four teas on the menu, ${categoryRange('tea')}.`,
    products: ['iced-tea', 'masala-tea', 'leaker-tea', 'green-tea'],
    categoryId: 'tea',
    imageId: 'SLIDE-03',
    vessel: 'tea',
    particles: 'beans',
  },
  {
    id: 'mojito',
    theme: 'walnut',
    ghost: 'Mint',
    kicker: 'Mojitos',
    title: 'Cold, fresh and minty',
    body: `Mint, Kacha Aam or Fire: three mojitos, ${priceRange(['mint-mojito', 'kacha-aam-mojito', 'fire-mojito'])}.`,
    products: ['mint-mojito', 'kacha-aam-mojito', 'fire-mojito'],
    categoryId: 'mocktails',
    imageId: 'SLIDE-04',
    vessel: 'mocktail',
    particles: 'mint',
  },
  {
    id: 'blue',
    theme: 'caramel',
    ghost: 'Blue',
    kicker: 'Blue Butterfly',
    title: 'Bright blue, served cold',
    body: `Our Blue Butterfly, with two masala coolers alongside. ${priceRange(['blue-butterfly', 'masala-cola', 'jira-masala-soda'])}.`,
    products: ['blue-butterfly', 'masala-cola', 'jira-masala-soda'],
    categoryId: 'mocktails',
    imageId: 'SLIDE-05',
  },
];

/** Real drink photos when supplied (at least two); otherwise the drawn stand-ins. */
const photoSlides = allSlides.filter((s) => hasImage(s.imageId));
const usePhotos = photoSlides.length >= 2;
const slides = usePhotos ? photoSlides : allSlides.filter((s) => s.vessel);

const INTERVAL = 7000;
/** Stable arrays, so the canvas is not re-initialised on every render. */
const single: Record<VesselKind, VesselKind[]> = { glass: ['glass'], cup: ['cup'], tea: ['tea'], togo: ['togo'], mocktail: ['mocktail'] };

const ambient = [
  { x: -42, y: -30, s: 0.9, d: 0 },
  { x: 40, y: -38, s: 0.7, d: 1.2 },
  { x: 46, y: 30, s: 1, d: 0.6 },
  { x: -46, y: 34, s: 0.75, d: 1.8 },
];

function Particle({ kind, style, className }: { kind: Slide['particles']; style?: React.CSSProperties; className: string }) {
  if (kind === 'ice') return <IceCube className={className} style={style} />;
  if (kind === 'mint') return <MintLeaf className={className} style={style} />;
  return <Bean className={className} style={style} />;
}

function SlideArt({ slide, mounted, active, reduced }: { slide: Slide; mounted: boolean; active: boolean; reduced: boolean }) {
  if (!mounted) return null;
  if (usePhotos) {
    const image = imageFiles(slide.imageId)!;
    return (
      <div className="slide__photo">
        <Picture image={image} sizes="(min-width: 52rem) 22rem, 46vw" alt="" priority={active} />
      </div>
    );
  }
  return (
    <>
      {ambient.map((a, k) => (
        <Particle key={k} kind={slide.particles} className="slide__ambient" style={{ '--x': `${a.x}%`, '--y': `${a.y}%`, '--s': a.s, '--d': `${a.d}s` } as React.CSSProperties} />
      ))}
      <PourCanvas mode="idle" kinds={single[slide.vessel!]} reduced={reduced} paused={!active} label={slide.kicker} />
    </>
  );
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
  const tilt = useRef(0);
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

  // Gentle depth: the drink drifts a few pixels toward the pointer (fine pointers only).
  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const el = rootRef.current;
    if (!el || tilt.current) return;
    const { clientX, clientY } = e;
    tilt.current = requestAnimationFrame(() => {
      tilt.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', ((clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty('--py', ((clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  };

  return (
    <section
      ref={rootRef}
      id="home-slider"
      className={`slider ${usePhotos ? 'slider--photos' : ''} theme-${slides[active].theme} on-dark`}
      aria-roledescription="carousel"
      aria-label="Coffee, tea and mocktails"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        rootRef.current?.style.setProperty('--px', '0');
        rootRef.current?.style.setProperty('--py', '0');
      }}
      onPointerMove={onPointerMove}
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
        <div className="slider__sheen" key={`sheen-${active}`} />
      </div>

      <div className="slider__track" aria-live={announce && !autoplay ? 'polite' : 'off'}>
        {slides.map((s, i) => {
          const isActive = i === active;
          const isLeaving = i === previous;
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
                    See all {s.categoryId === 'mocktails' ? 'mocktails' : s.kicker.toLowerCase()} on the menu
                  </Link>
                </div>
                <div className="slide__art" aria-hidden="true">
                  <div className="slide__halo" />
                  {usePhotos && <div className="slide__floor" />}
                  <div className="slide__product">
                    <SlideArt slide={s} mounted={isActive || isLeaving} active={isActive} reduced={reduced} />
                  </div>
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
      {usePhotos && site.menuImagesAreIllustrative && <p className="container slider__note">Images are illustrative.</p>}
    </section>
  );
}
