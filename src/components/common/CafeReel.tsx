import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Picture } from './ImageSlot';
import { imageFiles, publicPath } from '../../data/images';
import { prefersSaveData, usePrefersReducedMotion } from '../../hooks';

type State = 'idle' | 'playing' | 'paused';

/**
 * The café's own reel (CAFE-VID) in a tall frame. Muted, looping, and only playing while
 * it is on screen. Nothing is downloaded until it scrolls into view. With reduced motion
 * or data saver it shows the first frame and waits for the visitor to press play.
 */
export function CafeReel({ caption, className = '', sizes = '(min-width: 52rem) 22rem, 80vw' }: { caption?: string; className?: string; sizes?: string }) {
  const video = imageFiles('CAFE-VID');
  const poster = imageFiles('CAFE-POSTER');
  const reduced = usePrefersReducedMotion();
  const [lite] = useState(prefersSaveData);
  const auto = !reduced && !lite;
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [state, setState] = useState<State>('idle');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !auto || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.35) {
          if (!userPaused.current) el.play().catch(() => {});
        } else if (!el.paused) {
          el.pause();
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [auto]);

  if (!video) return null;

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      el.play().catch(() => {});
    } else {
      userPaused.current = true;
      el.pause();
    }
  };

  const playing = state === 'playing';
  return (
    <figure className={`reel ${className}`}>
      <div className={`reel__frame ${ready ? 'is-ready' : ''}`}>
        {poster && <Picture image={poster} sizes={sizes} alt="" className="reel__poster" />}
        <video
          ref={ref}
          className="reel__video"
          muted
          loop
          playsInline
          preload="none"
          aria-label={video.alt}
          onPlaying={() => {
            setReady(true);
            setState('playing');
          }}
          onPause={() => setState('paused')}
        >
          {video.sources?.map((s) => <source key={s.src} src={publicPath(s.src)} type={s.type} />)}
        </video>
        {!auto && state !== 'playing' ? (
          <button type="button" className="reel__play" onClick={toggle} aria-label="Play the café video">
            <Play size={26} strokeWidth={1.6} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="reel__control" onClick={toggle} aria-label={playing ? 'Pause the café video' : 'Play the café video'}>
            {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          </button>
        )}
      </div>
      {caption && <figcaption className="reel__caption">{caption}</figcaption>}
    </figure>
  );
}
