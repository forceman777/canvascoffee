/**
 * Small decorative illustrations drawn in code: coffee beans and kitchen ingredients.
 * All are decorative (aria-hidden).
 */
type P = { className?: string; style?: React.CSSProperties };
const svg = (viewBox: string, children: React.ReactNode, { className = '', style }: P) => (
  <svg viewBox={viewBox} className={`ingredient ${className}`} style={style} aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export const Bean = (p: P) =>
  svg(
    '0 0 40 56',
    <>
      <defs>
        <radialGradient id="bean-g" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#8a5530" />
          <stop offset="0.6" stopColor="#5a3119" />
          <stop offset="1" stopColor="#2c170d" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="28" rx="17" ry="25" fill="url(#bean-g)" />
      <path d="M20 5 C 12 18, 28 34, 20 51" stroke="#22110a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <ellipse cx="13" cy="17" rx="4" ry="8" fill="#fff" opacity="0.18" />
    </>,
    p,
  );

export const MintLeaf = (p: P) =>
  svg(
    '0 0 60 40',
    <>
      <path d="M2 20 C 14 2, 44 0, 58 20 C 44 40, 14 38, 2 20 Z" fill="#3f8a4a" />
      <path d="M4 20 C 20 19, 40 19, 56 20" stroke="#bfe0b0" strokeWidth="1.4" fill="none" />
      {[16, 28, 40].map((x) => (
        <path key={x} d={`M${x} 20 q 6 -6 12 -9 M${x} 20 q 6 6 12 9`} stroke="#bfe0b0" strokeWidth="0.9" fill="none" opacity="0.7" />
      ))}
    </>,
    p,
  );

export const BasilLeaf = (p: P) =>
  svg(
    '0 0 50 70',
    <>
      <path d="M25 68 C 2 50, 2 18, 25 2 C 48 18, 48 50, 25 68 Z" fill="#2f7a3a" />
      <path d="M25 66 C 25 46, 25 24, 25 4" stroke="#a8d79a" strokeWidth="1.4" fill="none" />
      <ellipse cx="17" cy="24" rx="5" ry="11" fill="#fff" opacity="0.15" />
    </>,
    p,
  );

export const Chilli = (p: P) =>
  svg(
    '0 0 90 40',
    <>
      <path d="M14 18 C 30 6, 64 8, 86 30 C 60 26, 34 30, 16 28 Z" fill="#c62a1f" />
      <path d="M22 16 C 40 10, 60 12, 74 22" stroke="#ff8a70" strokeWidth="2.2" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M16 22 C 8 18, 6 12, 2 8" stroke="#3d7a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="15" cy="23" rx="5" ry="6" fill="#4b8b34" />
    </>,
    p,
  );

export const TomatoSlice = (p: P) =>
  svg(
    '0 0 60 60',
    <>
      <circle cx="30" cy="30" r="28" fill="#d63a2a" />
      <circle cx="30" cy="30" r="23" fill="#f05a43" />
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a} 30 30)`}>
          <ellipse cx="30" cy="16" rx="6" ry="9" fill="#f8b2a0" />
          <ellipse cx="30" cy="15" rx="1.6" ry="2.4" fill="#f4e2a0" />
        </g>
      ))}
      <circle cx="30" cy="30" r="5" fill="#f6a08c" />
    </>,
    p,
  );

export const Garlic = (p: P) =>
  svg(
    '0 0 50 56',
    <>
      <path d="M25 4 C 32 14, 46 24, 44 38 C 42 50, 32 54, 25 54 C 18 54, 8 50, 6 38 C 4 24, 18 14, 25 4 Z" fill="#f4ecdc" stroke="#d8c8a8" strokeWidth="1.2" />
      <path d="M25 8 C 22 24, 22 40, 25 54 M16 20 C 12 32, 14 46, 20 53 M34 20 C 38 32, 36 46, 30 53" stroke="#d8c8a8" strokeWidth="1" fill="none" />
    </>,
    p,
  );

export const Peppercorns = (p: P) =>
  svg(
    '0 0 50 40',
    <>
      {[
        [12, 14, 7],
        [30, 10, 6],
        [24, 28, 7.5],
        [40, 26, 5.5],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#2e2218" />
          <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#fff" opacity="0.25" />
        </g>
      ))}
    </>,
    p,
  );

export const Corn = (p: P) =>
  svg(
    '0 0 50 40',
    <>
      {[
        [10, 12],
        [24, 8],
        [38, 14],
        [16, 26],
        [31, 27],
      ].map(([x, y], i) => (
        <g key={i} transform={`rotate(${i * 23} ${x} ${y})`}>
          <rect x={x - 6} y={y - 5} width="12" height="10" rx="4" fill="#f2c230" />
          <rect x={x - 4} y={y - 4} width="5" height="3" rx="1.5" fill="#fff3b0" opacity="0.8" />
        </g>
      ))}
    </>,
    p,
  );

export const StarAnise = (p: P) =>
  svg(
    '0 0 60 60',
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} 30 30)`}>
          <path d="M30 30 C 25 22, 26 8, 30 4 C 34 8, 35 22, 30 30 Z" fill="#7a3f1d" />
          <ellipse cx="30" cy="16" rx="2.4" ry="3.4" fill="#c88b4a" />
        </g>
      ))}
      <circle cx="30" cy="30" r="4" fill="#5a2c12" />
    </>,
    p,
  );

export const LimeWheel = (p: P) =>
  svg(
    '0 0 60 60',
    <>
      <circle cx="30" cy="30" r="28" fill="#6f9e2f" />
      <circle cx="30" cy="30" r="24" fill="#f3f7c8" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M30 30 L 30 9 A 21 21 0 0 1 44.8 15.2 Z" fill="#c9e07a" transform={`rotate(${i * 45} 30 30)`} stroke="#f3f7c8" strokeWidth="1.6" />
      ))}
    </>,
    p,
  );

export const IceCube = (p: P) =>
  svg(
    '0 0 50 50',
    <>
      <rect x="4" y="4" width="42" height="42" rx="10" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
      <path d="M12 14 L 28 11" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>,
    p,
  );
