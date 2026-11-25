import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Picture } from './ImageSlot';
import { imageFiles, publicPath, type ImageId } from '../../data/images';
import { prefersSaveData, usePrefersReducedMotion } from '../../hooks';

type State = 'idle' | 'playing' | 'paused';

/**
 * The café's own reel (CAFE-VID) in a tall frame. Muted, looping, and only playing while
 * it is on screen. Nothing is downloaded until it scrolls into view. With reduced motion
 * or data saver it shows the first frame and waits for the visitor to press play.
 */
export function CafeReel({
  caption,
  className = '',
  sizes = '(min-width: 52rem) 22rem, 80vw',
  videoId = 'CAFE-VID',
  posterId = 'CAFE-POSTER',
  name = 'café video',
  variant = 'reel',
}: {
  caption?: string;
  className?: string;
  sizes?: string;
  videoId?: ImageId;
  posterId?: ImageId;
  /** Used in the button labels, e.g. "Pause the café video". */
  name?: string;
  /** 'reel' = tall 9:16 frame; 'card' = 4:3 card. */
  variant?: 'reel' | 'card';
}) {
  const video = imageFiles(videoId);
  const poster = imageFiles(posterId);
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
    <figure className={`reel reel--${variant} ${className}`}>
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
          <button type="button" className="reel__play" onClick={toggle} aria-label={`Play the ${name}`}>
            <Play size={26} strokeWidth={1.6} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="reel__control" onClick={toggle} aria-label={playing ? `Pause the ${name}` : `Play the ${name}`}>
            {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          </button>
        )}
      </div>
      {caption && <figcaption className="reel__caption">{caption}</figcaption>}
    </figure>
  );
}
