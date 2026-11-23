import { useEffect, useRef } from 'react';
import { drawDrop, drawRipple, drawStream, drawVessel, fitScene, geometry, SCENE, type VesselKind } from './vessels';

/**
 * Animated canvas.
 *  mode="pour": pours coffee into each vessel in turn (stream, splashes, ripples,
 *               last drops falling onto the coffee, lid landing on the take-away cup).
 *  mode="idle": one full vessel with steam / bubbles / bobbing ice.
 * Pauses when off screen or when `paused`; draws one still frame with reduced motion.
 */

interface Props {
  mode: 'pour' | 'idle';
  kinds: VesselKind[];
  paused?: boolean;
  reduced?: boolean;
  onVesselChange?: (index: number) => void;
  className?: string;
  label?: string;
}

const CYCLE = 6.4; // seconds per vessel in pour mode
const T = {
  enter: 0.7,
  headStart: 0.7,
  headEnd: 1.0,
  pourEnd: 3.5,
  tailEnd: 3.75,
  drop1: 3.95,
  drop2: 4.6,
  lidStart: 4.1,
  lidEnd: 4.75,
  exit: 5.8,
};
const STREAM_X = SCENE.CX + 6;
const G = 1500;

const ease = (k: number) => 1 - Math.pow(1 - Math.min(Math.max(k, 0), 1), 3);
const bounce = (k: number) => {
  k = Math.min(Math.max(k, 0), 1);
  const n1 = 7.5625;
  const d1 = 2.75;
  if (k < 1 / d1) return n1 * k * k;
  if (k < 2 / d1) return n1 * (k -= 1.5 / d1) * k + 0.75;
  if (k < 2.5 / d1) return n1 * (k -= 2.25 / d1) * k + 0.9375;
  return n1 * (k -= 2.625 / d1) * k + 0.984375;
};
const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  floor: number;
}
interface Ripple {
  r: number;
  life: number;
}

const targetLevel: Record<VesselKind, number> = { glass: 0.8, cup: 1, tea: 1, togo: 1, mocktail: 0.9 };
const hasSteam = (k: VesselKind) => k === 'cup' || k === 'tea' || k === 'togo';

export function PourCanvas({ mode, kinds, paused, reduced, onVesselChange, className = '', label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const changeRef = useRef(onVesselChange);
  changeRef.current = onVesselChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced || !running) frame(0);
    });
    ro.observe(canvas);

    let time = 0; // seconds since start (sequence clock)
    let last = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let lastIndex = -1;
    let particles: Particle[] = [];
    let ripples: Ripple[] = [];
    let nextRipple = 0;
    const dropsDone = new Set<string>();

    const clear = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fitScene(ctx, cssW, cssH, dpr);
    };

    const splash = (kind: VesselKind, level: number, n: number, power = 1, spread = 1) => {
      const geo = geometry[kind];
      const y = geo.surface(level);
      const maxHalf = geo.surfaceRx(level) * 0.8;
      for (let i = 0; i < n; i++) {
        particles.push({
          x: STREAM_X + rand(-5, 5),
          y: y - 2,
          vx: rand(-1, 1) * rand(30, Math.min(150, maxHalf * 2.1)) * spread,
          vy: -rand(110, 320) * power,
          r: rand(1.6, 4.2),
          floor: y,
        });
      }
    };

    const frame = (dt: number) => {
      clear();
      if (mode === 'idle' || reduced) {
        const kind = kinds[mode === 'pour' ? Math.min(1, kinds.length - 1) : 0];
        drawVessel(ctx, kind, { level: targetLevel[kind], t: time, steam: hasSteam(kind) && kind !== 'togo' ? 1 : 0, lid: kind === 'togo' ? 0 : undefined });
        return;
      }

      const index = Math.floor(time / CYCLE) % kinds.length;
      const kind = kinds[index];
      const t = time % CYCLE;
      if (index !== lastIndex) {
        lastIndex = index;
        particles = [];
        ripples = [];
        dropsDone.clear();
        changeRef.current?.(index);
      }
      const geo = geometry[kind];
      const target = targetLevel[kind];
      const pourK = (t - T.headEnd) / (T.pourEnd - T.headEnd);
      const level = t < T.headEnd ? 0.04 : t < T.pourEnd ? 0.04 + (target - 0.04) * ease(pourK) : target;
      const surface = geo.surface(level);

      // vessel enter / exit
      const enterK = ease(t / T.enter);
      const exitK = t > T.exit ? ease((t - T.exit) / (CYCLE - T.exit)) : 0;
      const alpha = Math.min(enterK, 1 - exitK);
      const lift = (1 - enterK) * 40 - exitK * 18;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(0, lift);

      // The take-away lid drops in and bounces into place once the cup is full.
      const lid = kind === 'togo' && t >= T.lidStart ? 1 - bounce((t - T.lidStart) / (T.lidEnd - T.lidStart)) : undefined;
      const steamAlpha = hasSteam(kind) ? Math.min(1, Math.max(0, (t - 2.6) / 1.2)) * (1 - exitK) : 0;
      drawVessel(ctx, kind, { level, t: time, lid, steam: steamAlpha });

      // ripples on the surface (clipped to the vessel opening)
      if (t > T.headEnd && t < T.tailEnd && time >= nextRipple) {
        ripples.push({ r: 6, life: 1 });
        nextRipple = time + 0.26;
      }
      ripples = ripples.filter((rp) => rp.life > 0);
      const lidSeated = lid !== undefined && lid < 0.02;
      if (!lidSeated) {
        for (const rp of ripples) drawRipple(ctx, kind, level, rp.r, 0.55 * rp.life);
      }
      for (const rp of ripples) {
        rp.r += 120 * dt;
        rp.life -= dt * 1.1;
      }

      // stream: head falls, pours, then the tail leaves
      const top = -30;
      if (t > T.headStart && t < T.tailEnd) {
        const head = t < T.headEnd ? top + (surface - top) * ((t - T.headStart) / (T.headEnd - T.headStart)) : surface;
        const tail = t > T.pourEnd ? top + (surface - top) * ((t - T.pourEnd) / (T.tailEnd - T.pourEnd)) : top;
        drawStream(ctx, STREAM_X, tail, head, kind === 'cup' || kind === 'tea' ? 11 : 13, time);
        if (t >= T.headEnd && t < T.pourEnd + 0.1) {
          // continuous splash where the stream meets the coffee
          const n = Math.random() < 90 * dt - Math.floor(90 * dt) ? Math.ceil(90 * dt) : Math.floor(90 * dt);
          splash(kind, level, n);
        }
      }

      // the last drops falling onto the coffee (not for the lidded cup)
      if (kind !== 'togo') {
        for (const [key, start] of [
          ['d1', T.drop1],
          ['d2', T.drop2],
        ] as const) {
          const dtDrop = t - start;
          if (dtDrop < 0) continue;
          const y = top + 0.5 * G * 1.6 * dtDrop * dtDrop;
          if (y < surface - 4) {
            drawDrop(ctx, STREAM_X, y, 8.5, 'coffee', 1.3);
          } else if (!dropsDone.has(key)) {
            dropsDone.add(key);
            splash(kind, level, 20, 1.35, 0.85);
            // the rebound column
            particles.push({ x: STREAM_X, y: surface - 4, vx: 0, vy: -420, r: 8, floor: surface });
            ripples.push({ r: 4, life: 1 }, { r: -18, life: 1.15 });
          }
        }
      }

      // particles
      for (const p of particles) {
        p.vy += G * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      particles = particles.filter((p) => !(p.vy > 0 && p.y > p.floor + 2));
      for (const p of particles) drawDrop(ctx, p.x, p.y, p.r, 'coffee', p.vy < 0 ? 1.15 : 1);

      ctx.restore();
    };

    const loop = (now: number) => {
      raf = 0;
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
      last = now;
      if (!pausedRef.current) time += dt;
      frame(pausedRef.current ? 0 : dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    if (reduced) {
      if (mode === 'pour') changeRef.current?.(Math.min(1, kinds.length - 1));
      frame(0);
    } else {
      frame(0);
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      });
      io.observe(canvas);
      return () => {
        io.disconnect();
        ro.disconnect();
        stop();
      };
    }
    return () => {
      ro.disconnect();
      stop();
    };
  }, [mode, kinds, reduced]);

  return <canvas ref={canvasRef} className={`pour-canvas ${className}`} role="img" aria-label={label ?? 'Coffee being poured'} />;
}
