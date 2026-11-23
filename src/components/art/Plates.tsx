/**
 * Top-down plates drawn in code for the "From our kitchen" section.
 * They are illustrations. Real top-down photos (PLATE-* assets) replace them when supplied.
 */
import { useMemo } from 'react';

export type Dish = 'momo' | 'pizza' | 'burger' | 'fried' | 'fries' | 'desserts';

/** Small deterministic random generator, so drawings are stable between renders. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Plate({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-plate`} cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="0.78" stopColor="#f6efe3" />
          <stop offset="1" stopColor="#dfd2bb" />
        </radialGradient>
        <radialGradient id={`${id}-well`} cx="50%" cy="50%" r="50%">
          <stop offset="0.85" stopColor="#fbf7ef" />
          <stop offset="1" stopColor="#e6dcc8" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#30231d" floodOpacity="0.25" />
        </filter>
      </defs>
      <circle cx="200" cy="200" r="190" fill={`url(#${id}-plate)`} />
      <circle cx="200" cy="200" r="146" fill={`url(#${id}-well)`} />
      <circle cx="200" cy="200" r="178" fill="none" stroke="#b08a4b" strokeOpacity="0.45" strokeWidth="1.5" />
      <g filter={`url(#${id}-soft)`}>{children}</g>
    </>
  );
}

function Momo({ id }: { id: string }) {
  const spots = [[200, 200], ...Array.from({ length: 6 }, (_, i) => [200 + Math.cos((i * Math.PI) / 3) * 82, 200 + Math.sin((i * Math.PI) / 3) * 82])];
  return (
    <>
      <defs>
        <radialGradient id={`${id}-dough`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.7" stopColor="#efe2c6" />
          <stop offset="1" stopColor="#d6c09a" />
        </radialGradient>
      </defs>
      {spots.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i * 37})`}>
          <circle r="40" fill={`url(#${id}-dough)`} />
          {Array.from({ length: 9 }, (_, k) => {
            const a = (k / 9) * Math.PI * 2;
            return (
              <path
                key={k}
                d={`M${Math.cos(a) * 9} ${Math.sin(a) * 9} Q ${Math.cos(a + 0.35) * 26} ${Math.sin(a + 0.35) * 26} ${Math.cos(a + 0.1) * 37} ${Math.sin(a + 0.1) * 37}`}
                stroke="#cbb48a"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
          <circle r="8" fill="#e8d8b6" stroke="#cbb48a" strokeWidth="1.5" />
        </g>
      ))}
    </>
  );
}

function Pizza({ id }: { id: string }) {
  const r = useMemo(() => seeded(7), []);
  const corn = useMemo(() => Array.from({ length: 34 }, () => [r(), r(), r()]), [r]);
  const peppers = useMemo(() => Array.from({ length: 14 }, () => [r(), r(), r()]), [r]);
  const polar = (a: number, d: number) => [200 + Math.cos(a * Math.PI * 2) * d * 118, 200 + Math.sin(a * Math.PI * 2) * d * 118];
  return (
    <>
      <defs>
        <radialGradient id={`${id}-crust`} cx="50%" cy="50%" r="50%">
          <stop offset="0.86" stopColor="#e2a85a" />
          <stop offset="0.95" stopColor="#c98638" />
          <stop offset="1" stopColor="#a8682a" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill={`url(#${id}-crust)`} />
      <circle cx="200" cy="200" r="130" fill="#b8432c" />
      {Array.from({ length: 16 }, (_, i) => {
        const [x, y] = polar(i / 16 + 0.03, 0.55 + (i % 3) * 0.15);
        return <ellipse key={i} cx={x} cy={y} rx={30} ry={22} fill="#f6dc93" opacity="0.92" transform={`rotate(${i * 31} ${x} ${y})`} />;
      })}
      <circle cx="200" cy="200" r="40" fill="#f6dc93" opacity="0.9" />
      {peppers.map(([a, d, rot], i) => {
        const [x, y] = polar(a, 0.15 + d * 0.8);
        return <path key={i} d="M-9 0 a 9 6 0 0 1 18 0" stroke="#3d7a2e" strokeWidth="4" fill="none" transform={`translate(${x} ${y}) rotate(${rot * 360})`} strokeLinecap="round" />;
      })}
      {corn.map(([a, d, rot], i) => {
        const [x, y] = polar(a, 0.1 + d * 0.88);
        return <ellipse key={i} cx={x} cy={y} rx="5" ry="4" fill="#f2c230" stroke="#d9a21c" strokeWidth="0.8" transform={`rotate(${rot * 180} ${x} ${y})`} />;
      })}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={200 + Math.cos((i * Math.PI) / 4) * -148} y1={200 + Math.sin((i * Math.PI) / 4) * -148} x2={200 + Math.cos((i * Math.PI) / 4) * 148} y2={200 + Math.sin((i * Math.PI) / 4) * 148} stroke="#7a3518" strokeOpacity="0.35" strokeWidth="2" />
      ))}
    </>
  );
}

function Burger({ id }: { id: string }) {
  const r = useMemo(() => seeded(3), []);
  const seeds = useMemo(() => Array.from({ length: 26 }, () => [r(), r(), r()]), [r]);
  const lettuce = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    const d = 132 + (i % 2 ? 8 : -2);
    return `${i === 0 ? 'M' : 'L'}${200 + Math.cos(a) * d} ${200 + Math.sin(a) * d}`;
  }).join(' ');
  return (
    <>
      <defs>
        <radialGradient id={`${id}-bun`} cx="42%" cy="38%" r="62%">
          <stop offset="0" stopColor="#e8b56a" />
          <stop offset="0.6" stopColor="#c98a42" />
          <stop offset="1" stopColor="#94571f" />
        </radialGradient>
      </defs>
      <path d={`${lettuce} Z`} fill="#7cb342" />
      <rect x="100" y="100" width="200" height="200" rx="14" fill="#f3b631" transform="rotate(14 200 200)" />
      <circle cx="200" cy="200" r="122" fill={`url(#${id}-bun)`} />
      {seeds.map(([a, d, rot], i) => {
        const ang = a * Math.PI * 2;
        const dist = Math.sqrt(d) * 100;
        const x = 200 + Math.cos(ang) * dist;
        const y = 200 + Math.sin(ang) * dist;
        return <ellipse key={i} cx={x} cy={y} rx="5.5" ry="2.8" fill="#fbf1d6" transform={`rotate(${rot * 180} ${x} ${y})`} />;
      })}
      <ellipse cx="170" cy="160" rx="40" ry="22" fill="#fff" opacity="0.12" />
    </>
  );
}

function blob(cx: number, cy: number, rad: number, seed: number) {
  const r = seeded(seed);
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const d = rad * (0.82 + r() * 0.3);
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  });
  const mid = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M${mid(pts[9], pts[0]).join(' ')}`;
  for (let i = 0; i < 10; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % 10]);
    d += ` Q${p[0]} ${p[1]} ${m[0]} ${m[1]}`;
  }
  return d + 'Z';
}

function Fried({ id }: { id: string }) {
  const nuggets: Array<[number, number, number]> = [
    [150, 140, 34],
    [232, 128, 30],
    [276, 196, 32],
    [130, 222, 31],
  ];
  return (
    <>
      <defs>
        <radialGradient id={`${id}-gold`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f0c068" />
          <stop offset="0.65" stopColor="#d4923c" />
          <stop offset="1" stopColor="#a8621f" />
        </radialGradient>
      </defs>
      {nuggets.map(([x, y, rad], i) => (
        <path key={i} d={blob(x, y, rad, i + 11)} fill={`url(#${id}-gold)`} />
      ))}
      {[
        [170, 290, -20],
        [236, 270, 25],
        [205, 205, 70],
      ].map(([x, y, rot], i) => (
        <rect key={i} x={x - 52} y={y - 17} width="104" height="34" rx="17" fill={`url(#${id}-gold)`} transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      {Array.from({ length: 60 }, (_, i) => {
        const r = seeded(i + 99);
        return <circle key={i} cx={110 + r() * 180} cy={100 + r() * 210} r={1.2 + r() * 1.4} fill="#fbe2a8" opacity="0.55" />;
      })}
    </>
  );
}

function Fries({ id }: { id: string }) {
  const r = useMemo(() => seeded(21), []);
  const sticks = useMemo(() => Array.from({ length: 26 }, () => [r(), r(), r(), r()]), [r]);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-fry`} x1="0" x2="1">
          <stop offset="0" stopColor="#d99a2b" />
          <stop offset="0.5" stopColor="#f6cf62" />
          <stop offset="1" stopColor="#dba33a" />
        </linearGradient>
      </defs>
      <rect x="92" y="92" width="216" height="216" rx="14" fill="#f8f1e2" stroke="#d8c8a8" transform="rotate(8 200 200)" />
      <g transform="rotate(8 200 200)">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={92 + i * 43} y1="92" x2={92 + i * 43} y2="308" stroke="#461c25" strokeOpacity="0.12" strokeWidth="10" />
        ))}
      </g>
      {sticks.map(([a, b, rot, len], i) => (
        <rect
          key={i}
          x={-6}
          y={-(36 + len * 30)}
          width="12"
          height={72 + len * 60}
          rx="5"
          fill={`url(#${id}-fry)`}
          transform={`translate(${130 + a * 140} ${130 + b * 140}) rotate(${rot * 180})`}
        />
      ))}
    </>
  );
}

function Desserts({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-choc`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6a3a20" />
          <stop offset="1" stopColor="#2e160b" />
        </linearGradient>
        <radialGradient id={`${id}-muffin`} cx="40%" cy="35%" r="65%">
          <stop offset="0" stopColor="#d9a56a" />
          <stop offset="0.7" stopColor="#b47a40" />
          <stop offset="1" stopColor="#8a5528" />
        </radialGradient>
      </defs>
      {/* cake slice, seen from above */}
      <path d="M120 112 L 250 150 L 132 262 Z" fill={`url(#${id}-choc)`} />
      <path d="M120 112 L 250 150" stroke="#8a5a33" strokeWidth="8" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${140 + i * 18} ${132 + i * 6} q 8 30 -6 ${70 - i * 12}`} stroke="#7a4626" strokeWidth="2.4" fill="none" opacity="0.7" />
      ))}
      {/* muffin top */}
      <path d={blob(262, 262, 66, 5)} fill={`url(#${id}-muffin)`} />
      {Array.from({ length: 14 }, (_, i) => {
        const r = seeded(i + 40);
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * 50;
        const blue = i % 3 === 0;
        return <circle key={i} cx={262 + Math.cos(a) * d} cy={262 + Math.sin(a) * d} r={blue ? 6 : 4.5} fill={blue ? '#3c3f7a' : '#3a1e10'} />;
      })}
    </>
  );
}

const drawings: Record<Dish, (p: { id: string }) => JSX.Element> = {
  momo: Momo,
  pizza: Pizza,
  burger: Burger,
  fried: Fried,
  fries: Fries,
  desserts: Desserts,
};

export function PlateArt({ dish, uid, className = '' }: { dish: Dish; uid: string; className?: string }) {
  const Drawing = drawings[dish];
  const id = `plate-${uid}`;
  return (
    <svg viewBox="0 0 400 400" className={`plate-art ${className}`} aria-hidden="true" focusable="false">
      <Plate id={id}>
        <Drawing id={id} />
      </Plate>
    </svg>
  );
}
