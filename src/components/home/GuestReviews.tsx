import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import { overallRating, reviews } from '../../data/reviews';
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
                <stop offset={fill} stopColor="currentColor" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"
              fill={`url(#${uid}-${i})`}
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}

/** Longer reviews stay on screen longer: 5 s plus reading time. */
const dwell = (text: string) => Math.min(12000, 5000 + text.length * 45);

const sizeOf = (text: string) => (text.length > 140 ? 'long' : text.length > 60 ? 'medium' : 'short');

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * "Loved by Our Guests": the overall Google rating, then one customer review per slide.
 * Autoplay pauses on hover, focus, when off screen, by button, and never runs with reduced motion.
 */
export function GuestReviews() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const autoplay = !reduced && !userPaused && !hovering && !focused && onScreen;
  const count = reviews.length;

  const go = useCallback((to: number, dir: 1 | -1, fromUser = true) => {
    setDirection(dir);
    setActive(((to % count) + count) % count);
    if (fromUser) setAnnounce(true);
  }, [count]);
  const next = useCallback((user = true) => go(active + 1, 1, user), [active, go]);
  const prev = useCallback(() => go(active - 1, -1), [active, go]);

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

  const review = reviews[active];
  const length = sizeOf(review.text);

  return (
    <section
      ref={rootRef}
      id="reviews"
      className="reviews textured surface-parchment"
      aria-labelledby="reviews-title"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      <div className="container reviews__grid">
        <header className="reviews__intro">
          <h2 id="reviews-title" className="section-title">
            Loved by Our Guests
          </h2>
          <div className="reviews__score">
            <p className="reviews__value">
              <span className="tabular">{overallRating.value}</span>
              <span className="reviews__outof"> / {overallRating.outOf}</span>
            </p>
            <div>
              <Stars value={overallRating.value} outOf={overallRating.outOf} size="lg" />
              <p className="reviews__source">Overall rating on {overallRating.source}</p>
            </div>
          </div>
          {site.contact.mapUrl && (
            <a className="reviews__more" href={site.contact.mapUrl} target="_blank" rel="noopener noreferrer">
              Read more reviews on Google
              <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
          )}
        </header>

        <div
          className="reviews__carousel"
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
          <div className="review-card">
            <span className="review-card__mark" aria-hidden="true">
              “
            </span>
            <div className="review-card__stage" aria-live={announce && !autoplay ? 'polite' : 'off'}>
              {/* Invisible copies of every review: the card takes the height of the longest, so nothing jumps. */}
              {reviews.map((r) => (
                <div key={`sizer-${r.name}`} className="review review--sizer" aria-hidden="true">
                  <div className={`review__text review__text--${sizeOf(r.text)}`}>
                    <p>{r.text}</p>
                  </div>
                  <div className="review__by">
                    <span className="review__avatar">{initials(r.name)}</span>
                    <span>
                      <span className="review__name">{r.name}</span>
                      <span className="review__meta">Google review</span>
                    </span>
                  </div>
                </div>
              ))}
              <div
                key={active}
                className={`review ${direction === 1 ? 'from-next' : 'from-prev'}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${active + 1} of ${count}: review by ${review.name}`}
              >
                <blockquote className={`review__text review__text--${length}`}>
                  <p>{review.text}</p>
                </blockquote>
                <p className="review__by">
                  <span className="review__avatar" aria-hidden="true">
                    {initials(review.name)}
                  </span>
                  <span>
                    <span className="review__name">{review.name}</span>
                    <span className="review__meta">
                      {review.rating !== null && <Stars value={review.rating} />}
                      Google review
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <div className="review-card__progress" aria-hidden="true">
              <span
                key={`${active}-${autoplay}`}
                className={autoplay ? 'is-running' : ''}
                style={{ animationDuration: `${dwell(review.text)}ms` }}
              />
            </div>
          </div>

          <div className="reviews__controls">
            <div className="reviews__dots" role="group" aria-label="Choose a review">
              {reviews.map((r, i) => (
                <button
                  key={r.name}
                  type="button"
                  className={`reviews__dot ${i === active ? 'is-active' : ''}`}
                  onClick={() => i !== active && go(i, i > active ? 1 : -1)}
                  aria-label={`Show review ${i + 1} of ${count}, by ${r.name}`}
                  aria-current={i === active ? 'true' : undefined}
                />
              ))}
            </div>
            <div className="reviews__buttons">
              {!reduced && (
                <button type="button" className="reviews__btn" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Start automatic reviews' : 'Pause automatic reviews'}>
                  {userPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
              )}
              <button type="button" className="reviews__btn" onClick={prev} aria-label="Previous review">
                <ChevronLeft size={20} />
              </button>
              <button type="button" className="reviews__btn" onClick={() => next()} aria-label="Next review">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
