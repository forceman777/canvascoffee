import { useEffect, useRef, useState, type RefObject } from 'react';

export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Adds `is-visible` once the element scrolls into view (one time only).
 * Driven by IntersectionObserver, so there is no scroll handler.
 */
export function useReveal<T extends HTMLElement>(options: { rootMargin?: string; threshold?: number } = {}): RefObject<T> {
  const ref = useRef<T>(null);
  const { rootMargin = '0px 0px -12% 0px', threshold = 0.15 } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold]);
  return ref;
}

export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} | Canvas O Coffee` : 'Canvas O Coffee | Belda, West Bengal';
  }, [title]);
}

/** True while the element is (at least partly) on screen. */
export function useInView<T extends HTMLElement>(ref: RefObject<T>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** True when the visitor has asked the browser to save data (e.g. Chrome's Lite mode). */
export function prefersSaveData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(c?.saveData);
}
