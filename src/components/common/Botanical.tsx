/**
 * Line-drawn coffee sprig, drawn in code. It stands in for the botanical illustrations
 * (BOT-01 to BOT-03) until they are supplied, and is always decorative.
 */
import { useMemo } from 'react';
import { hasImage, type ImageId } from '../../data/images';
import { ImageSlot } from './ImageSlot';

type Variant = 'horizontal' | 'vertical' | 'cluster';

const LEAF = 'M0 0 C 14 -16, 46 -20, 74 0 C 46 18, 14 15, 0 0 Z';

function quad(t: number, p0: number[], p1: number[], p2: number[]) {
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
  const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function Cherries({ x, y, n = 3, seed = 0 }: { x: number; y: number; n?: number; seed?: number }) {
  const offsets = [
    [0, 0],
    [11, 6],
    [-9, 9],
    [4, 15],
    [-14, -2],
  ].slice(0, n);
  return (
    <g>
      {offsets.map(([dx, dy], i) => {
        const r = 7.5 - ((i + seed) % 3) * 0.8;
        const ripe = (i + seed) % 4 !== 3;
        return (
          <g key={i} transform={`translate(${x + dx} ${y + dy})`}>
            <circle r={r} fill={ripe ? 'var(--sprig-cherry, #7a2533)' : 'var(--sprig-unripe, #9a8a3c)'} stroke="var(--sprig-line, #30231d)" strokeWidth="0.8" />
            <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.28} fill="#fff" opacity="0.35" />
            <path d={`M ${r * 0.1} ${-r} l 1.5 -3`} stroke="var(--sprig-line, #30231d)" strokeWidth="0.8" />
          </g>
        );
      })}
    </g>
  );
}

function Leaf({ x, y, angle, scale = 1 }: { x: number; y: number; angle: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path d={LEAF} fill="var(--sprig-leaf, #243b32)" fillOpacity="0.82" stroke="var(--sprig-line, #30231d)" strokeWidth="0.9" />
      <path d="M2 0 C 24 -1, 48 -1, 70 0" stroke="var(--sprig-vein, #d9cfae)" strokeOpacity="0.55" strokeWidth="0.8" fill="none" />
      {[16, 30, 44].map((v) => (
        <path key={v} d={`M${v} 0 q 6 -5 12 -8 M${v} 0 q 6 5 12 8`} stroke="var(--sprig-vein, #d9cfae)" strokeOpacity="0.35" strokeWidth="0.6" fill="none" />
      ))}
    </g>
  );
}

function SprigDrawing({ variant }: { variant: Variant }) {
  const drawing = useMemo(() => {
    if (variant === 'cluster') {
      return (
        <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
          <path d="M80 20 C 78 50, 76 70, 80 92" stroke="var(--sprig-line, #30231d)" strokeWidth="1.6" fill="none" />
          <Leaf x={80} y={46} angle={-150} scale={0.85} />
          <Leaf x={80} y={46} angle={-30} scale={0.85} />
          <Cherries x={78} y={100} n={5} />
        </svg>
      );
    }
    const p0 = [8, 150];
    const p1 = [260, 30];
    const p2 = [592, 96];
    const stem = `M${p0} Q${p1} ${p2}`;
    const nodes = [0.16, 0.32, 0.48, 0.64, 0.8, 0.94];
    const content = (
      <>
        <path d={stem} stroke="var(--sprig-line, #30231d)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {nodes.map((t, i) => {
          const { x, y, angle } = quad(t, p0, p1, p2);
          const s = 1 - t * 0.35;
          return (
            <g key={t}>
              <Leaf x={x} y={y} angle={angle - 48} scale={s} />
              <Leaf x={x} y={y} angle={angle + 48} scale={s * 0.92} />
              {(i === 1 || i === 3) && <Cherries x={x + 4} y={y + 12} n={i === 1 ? 4 : 3} seed={i} />}
            </g>
          );
        })}
        {(() => {
          const { x, y } = quad(0.99, p0, p1, p2);
          return (
            <g transform={`translate(${x + 4} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} rx="7" ry="2.6" cx="7" transform={`rotate(${a})`} fill="var(--sprig-blossom, #f5ebdd)" stroke="var(--sprig-line, #30231d)" strokeWidth="0.6" />
              ))}
              <circle r="2" fill="var(--brass, #b08a4b)" />
            </g>
          );
        })()}
      </>
    );
    if (variant === 'vertical') {
      return (
        <svg viewBox="0 0 200 620" aria-hidden="true" focusable="false">
          <g transform="translate(200 0) rotate(90)">{content}</g>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 620 200" aria-hidden="true" focusable="false">
        {content}
      </svg>
    );
  }, [variant]);
  return drawing;
}

const variantImage: Record<Variant, ImageId> = {
  horizontal: 'BOT-01',
  vertical: 'BOT-02',
  cluster: 'BOT-03',
};

/** Uses the supplied botanical illustration when present, otherwise the drawn sprig. */
export function Botanical({ variant = 'horizontal', className = '' }: { variant?: Variant; className?: string }) {
  const id = variantImage[variant];
  return (
    <div className={`botanical botanical--${variant} ${className}`} aria-hidden="true">
      {hasImage(id) ? <ImageSlot id={id} sizes="(min-width: 64rem) 40vw, 70vw" fit="contain" bare /> : <SprigDrawing variant={variant} />}
    </div>
  );
}
