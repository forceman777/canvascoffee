import { useEffect, useRef, useState } from 'react';
import { ImageSlot } from '../common/ImageSlot';
import { LatteArt } from './LatteArt';
import { signatureContent } from '../../data/siteContent';
import { usePrefersReducedMotion } from '../../hooks';
import type { ImageId } from '../../data/images';
import { Reveal } from './Reveal';

const frames: ImageId[] = ['IL-01', 'IL-02', 'IL-03', 'IL-04', 'IL-05'];

function Frame({ index, priority }: { index: number; priority?: boolean }) {
  return (
    <ImageSlot
      id={frames[index]}
      sizes="(min-width: 64rem) 42vw, 92vw"
      priority={priority}
      className="latte-frame__image"
      placeholderArt={<LatteArt stage={index as 0 | 1 | 2 | 3 | 4} />}
    />
  );
}

/**
 * Signature iced-latte sequence. A sticky frame cross-fades through five images, driven by
 * scroll position (one rAF-throttled listener, active only while the section is on screen).
 * Scrolling is never hijacked: the visitor scrolls normally and can skip the section.
 * With reduced motion, the five frames are shown as a static, captioned series.
 */
export function IcedLatteSequence({ nextId }: { nextId: string }) {
  const reduced = usePrefersReducedMotion();
  const stepsRef = useRef<HTMLOListElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const { steps } = signatureContent;

  useEffect(() => {
    if (reduced) return;
    const list = stepsRef.current;
    if (!list) return;
    let raf = 0;
    let running = false;

    const update = () => {
      raf = 0;
      const rect = list.getBoundingClientRect();
      const stepH = rect.height / steps.length;
      const vh = window.innerHeight;
      // 0 when the first step's centre meets the viewport centre, N-1 for the last.
      const pos = Math.min(Math.max((vh * 0.55 - (rect.top + stepH / 2)) / stepH, 0), steps.length - 1);
      layerRefs.current.forEach((layer, i) => {
        if (!layer || i === 0) return;
        // Each frame fades in over the previous one: no dark dip between frames.
        const o = Math.min(Math.max((pos - (i - 1)) * 1.25 - 0.1, 0), 1);
        layer.style.opacity = String(o);
      });
      setActive(Math.round(pos));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
      } else if (!entry.isIntersecting && running) {
        running = false;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    });
    io.observe(list);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, steps.length]);

  const header = (
    <Reveal className="signature__header">
      <h2 className="signature__title">{signatureContent.title}</h2>
      <p className="signature__lead">{signatureContent.lead}</p>
      {!reduced && (
        <a className="signature__skip" href={`#${nextId}`}>
          Skip the sequence
        </a>
      )}
    </Reveal>
  );

  if (reduced) {
    return (
      <section className="signature signature--static surface-walnut grain on-dark" aria-labelledby="signature-title">
        <div className="container">
          <h2 id="signature-title" className="visually-hidden">
            {signatureContent.title}
          </h2>
          {header}
          <ol className="signature__series" role="list">
            {steps.map((s, i) => (
              <li key={s.title}>
                <Frame index={i} />
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className="signature surface-walnut grain on-dark" aria-label={signatureContent.title}>
      <div className="container">{header}</div>
      <div className="container signature__stage">
        <div className="signature__sticky">
          <div className="latte-frame" aria-hidden="true">
            {frames.map((_, i) => (
              <div
                key={i}
                className="latte-frame__layer"
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <Frame index={i} />
              </div>
            ))}
            <div className="latte-frame__progress">
              {frames.map((_, i) => (
                <span key={i} className={i <= active ? 'is-on' : ''} />
              ))}
            </div>
          </div>
        </div>
        <ol className="signature__steps" ref={stepsRef} role="list">
          {steps.map((s, i) => (
            <li key={s.title} className={`signature__step ${i === active ? 'is-active' : ''}`}>
              <div className="signature__card">
                <span className="signature__num oldstyle" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
