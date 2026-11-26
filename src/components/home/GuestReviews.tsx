import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import { overallRating, reviews, type Review } from '../../data/reviews';
import { site } from '../../config/site';
import { usePrefersReducedMotion } from '../../hooks';

/** Five gold stars filled to `value` (supports fractions, e.g. 4.7). */
export function Stars({ value, outOf = 5, size = 'md' }: { value: number; outOf?: number; size?: 'md' | 'lg' }) {
  const uid = useId().replace(/:/g, '');
  return (
    <span className={`stars stars--${size}`} role="img" aria-label={`${value} out of ${outOf} stars`}>
      {Array.from({ length: outOf }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={`${uid}-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset={fill} stopColor="currentColor" />
                <stop offset={fill} stopColor="currentColor" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"
              fill={`url(#${uid}-${i})`}
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}

/** Longer reviews stay on screen longer: 5.5 s plus reading time. */
const dwell = (text: string) => Math.min(12000, 5500 + text.length * 45);

const initial = (name: string) => name.trim().charAt(0).toUpperCase();

/** Soft avatar tints in the brand palette, picked from the name so each reviewer keeps theirs. */
const tints = ['#e7c88a', '#c9a27c', '#b9c2a5', '#d9a6a0', '#a9bcc4', '#d8c3e0'];
const tintOf = (name: string) => tints[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % tints.length];

function ReviewBody({ review }: { review: Review }) {
  return (
    <>
      <span className="g-review__head">
        <span className="g-review__avatar" style={{ background: tintOf(review.name) }} aria-hidden="true">
          {initial(review.name)}
        </span>
        <span className="g-review__who">
          <span className="g-review__name">{review.name}</span>
          <span className="g-review__src">Google review</span>
        </span>
      </span>
      {review.rating !== null && <Stars value={review.rating} />}
      <span className="g-review__text">{review.text}</span>
    </>
  );
}

/**
 * "Loved by Our Guests": a glass frame holding the overall Google rating and one customer
 * review at a time. Neighbouring reviews peek in at the sides (wide screens) and act as prev / next.
 * Autoplay pauses on hover, focus, when off screen, by button, and never runs with reduced motion.
 */
export function GuestReviews() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const count = reviews.length;
  const autoplay = !reduced && !userPaused && !hovering && !focused && onScreen;
  const at = (i: number) => ((i % count) + count) % count;

  const go = useCallback(
    (to: number, fromUser = true) => {
      setActive(((to % count) + count) % count);
      if (fromUser) setAnnounce(true);
    },
    [count],
  );
  const next = useCallback((user = true) => go(active + 1, user), [active, go]);
  const prev = useCallback(() => go(active - 1), [active, go]);

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => next(false), dwell(reviews[active].text));
    return () => window.clearTimeout(t);
  }, [autoplay, active, next]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="reviews"
      className="reviews on-dark"
      aria-labelledby="reviews-title"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      <span className="reviews__arc reviews__arc--top" aria-hidden="true" />
      <span className="reviews__arc reviews__arc--bottom" aria-hidden="true" />

      <div className="reviews__stage">
        {/* Neighbouring reviews peek in at the sides on wide screens: purely visual (navigation is below). */}
        <div className="reviews__peek reviews__peek--prev" aria-hidden="true" {...{ inert: '' }}>
          <span className="g-review g-review--peek" key={`p-${active}`}>
            <ReviewBody review={reviews[at(active - 1)]} />
          </span>
        </div>
        <div className="reviews__peek reviews__peek--next" aria-hidden="true" {...{ inert: '' }}>
          <span className="g-review g-review--peek" key={`n-${active}`}>
            <ReviewBody review={reviews[at(active + 1)]} />
          </span>
        </div>

        <div className="reviews__glass">
          <h2 id="reviews-title" className="reviews__title">
            <span className="reviews__title-light">Loved by</span>
            <span className="reviews__title-bold">Our Guests</span>
          </h2>
          <div className="reviews__rating">
            <Stars value={overallRating.value} outOf={overallRating.outOf} size="lg" />
            <p>
              <strong className="tabular">{overallRating.value}</strong> / {overallRating.outOf} overall on {overallRating.source}
            </p>
          </div>

          <div
            className="reviews__viewport"
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer reviews"
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
            <div className="reviews__track" style={{ transform: `translate3d(${-active * 100}%, 0, 0)` }} aria-live={announce && !autoplay ? 'polite' : 'off'}>
              {reviews.map((r, i) => (
                <div
                  key={r.name}
                  className={`reviews__slide ${i === active ? 'is-active' : ''}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}: review by ${r.name}`}
                  aria-hidden={i !== active}
                  {...(i !== active ? { inert: '' } : {})}
                >
                  <div className="g-review">
                    <ReviewBody review={r} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reviews__progress" aria-hidden="true">
            <span key={`${active}-${autoplay}`} className={autoplay ? 'is-running' : ''} style={{ animationDuration: `${dwell(reviews[active].text)}ms` }} />
          </div>

          <div className="reviews__controls">
            <button type="button" className="reviews__btn" onClick={prev} aria-label="Previous review">
              <ChevronLeft size={20} />
            </button>
            <div className="reviews__dots" role="group" aria-label="Choose a review">
              {reviews.map((r, i) => (
                <button
                  key={r.name}
                  type="button"
                  className={`reviews__dot ${i === active ? 'is-active' : ''}`}
                  onClick={() => i !== active && go(i)}
                  aria-label={`Show review ${i + 1} of ${count}, by ${r.name}`}
                  aria-current={i === active ? 'true' : undefined}
                />
              ))}
            </div>
            <button type="button" className="reviews__btn" onClick={() => next()} aria-label="Next review">
              <ChevronRight size={20} />
            </button>
            {!reduced && (
              <button
                type="button"
                className="reviews__btn reviews__btn--pause"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? 'Start automatic reviews' : 'Pause automatic reviews'}
              >
                {userPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {site.contact.mapUrl && (
        <div className="reviews__footer">
          <a className="reviews__more" href={site.contact.mapUrl} target="_blank" rel="noopener noreferrer">
            Read more reviews on Google
            <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
