import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Pause, Play, RotateCcw, UtensilsCrossed } from 'lucide-react';
import { ButtonLink } from '../common/Button';
import { Picture } from '../common/ImageSlot';
import { imageFiles, publicPath } from '../../data/images';
import { categoriesInGroup, fromPrice, productsInCategory } from '../../data/menu';
import { homeContent } from '../../data/siteContent';
import { site } from '../../config/site';
import { formatINR } from '../../utils/pricing';
import { usePrefersReducedMotion } from '../../hooks';

type Phase = 'loading' | 'playing' | 'paused' | 'ended';

const from = (categoryId: string) => formatINR(Math.min(...productsInCategory(categoryId).map(fromPrice)));
const facts = [
  { label: 'Coffee', value: from('coffee') },
  { label: 'Tea', value: from('tea') },
  { label: 'Mocktails', value: from('mocktails') },
  { label: 'Food', value: formatINR(Math.min(...categoriesInGroup('food').flatMap((c) => productsInCategory(c.id)).map(fromPrice))) },
];

function saveData() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(c?.saveData);
}

/**
 * Cinematic hero: the supplied pour video (HERO-VID) plays once and rests on the full glass.
 * With reduced motion or data saver, the final frame is shown as a still.
 */
export function HeroFilm() {
  const reduced = usePrefersReducedMotion();
  const video = imageFiles('HERO-VID')!;
  const poster = imageFiles('HERO-POSTER');
  const still = imageFiles('HERO-STILL');
  const ref = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [ready, setReady] = useState(false);
  const [lite] = useState(() => typeof navigator !== 'undefined' && saveData());
  const showStill = (reduced || lite) && still;

  // Pause while off screen; resume if it was playing.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && !el.paused) {
        el.pause();
        el.dataset.autoPaused = '1';
      } else if (e.isIntersecting && el.dataset.autoPaused) {
        delete el.dataset.autoPaused;
        el.play().catch(() => {});
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [showStill]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (phase === 'ended') {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const posterUrl = poster ? publicPath(`${poster.key}-${poster.widths[poster.widths.length - 1]}.webp`) : undefined;

  return (
    <section className="hero-film surface-ink on-dark" aria-labelledby="hero-title">
      <div className={`hero-film__media ${ready || showStill ? 'is-ready' : ''}`}>
        {showStill ? (
          <Picture image={still!} sizes="(min-width: 52rem) 60vw, 100vw" alt={video.alt} priority className="hero-film__still" />
        ) : (
          <video
            ref={ref}
            className="hero-film__video"
            poster={posterUrl}
            muted
            playsInline
            autoPlay
            preload="auto"
            aria-label={video.alt}
            onLoadedData={() => setReady(true)}
            onPlaying={() => {
              setReady(true);
              setPhase('playing');
            }}
            onPause={() => setPhase((p) => (p === 'ended' ? p : 'paused'))}
            onEnded={() => setPhase('ended')}
          >
            {video.sources?.map((s) => <source key={s.src} src={publicPath(s.src)} type={s.type} />)}
          </video>
        )}
        <div className="hero-film__shade" aria-hidden="true" />
        {!showStill && (
          <button type="button" className="hero-film__control" onClick={toggle} aria-label={phase === 'ended' ? 'Replay video' : phase === 'playing' ? 'Pause video' : 'Play video'}>
            {phase === 'ended' ? <RotateCcw size={16} /> : phase === 'playing' ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )}
      </div>

      <div className="container hero-film__content">
        <div className="hero-film__text">
          <p className="hero-film__place">{site.locality.replace(', India', '')}</p>
          <h1 id="hero-title" className="hero-film__title">
            {homeContent.heroTitle}
          </h1>
          <p className="hero-film__lead">{homeContent.heroLead}</p>
          <div className="hero-film__actions">
            <ButtonLink to="/menu" variant="brass" onDark icon={<UtensilsCrossed size={16} />}>
              Explore the menu
            </ButtonLink>
            <ButtonLink to="/reservations" variant="secondary" onDark icon={<CalendarDays size={16} />}>
              Reserve a table
            </ButtonLink>
          </div>
          <dl className="hero-film__facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>from {f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
