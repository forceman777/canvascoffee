/**
 * Drawn stand-in for the iced-latte photo sequence (IL-01 to IL-05). It follows the same
 * composition rules as the photo brief (glass centred, base at 85%, rim at 35%, pours
 * from the top-right), so the real frames can replace it one-for-one.
 */
const W = 400;
const H = 500;
const RIM_Y = 175;
const BASE_Y = 425;
const TOP_L = 128;
const TOP_R = 272;
const BOT_L = 140;
const BOT_R = 260;

const glassPath = `M${TOP_L} ${RIM_Y} L${BOT_L} ${BASE_Y - 8} Q${BOT_L} ${BASE_Y} ${BOT_L + 10} ${BASE_Y} L${BOT_R - 10} ${BASE_Y} Q${BOT_R} ${BASE_Y} ${BOT_R} ${BASE_Y - 8} L${TOP_R} ${RIM_Y}`;
const innerClip = `M${TOP_L + 6} ${RIM_Y} L${BOT_L + 6} ${BASE_Y - 22} L${BOT_R - 6} ${BASE_Y - 22} L${TOP_R - 6} ${RIM_Y} Z`;

const levels = [0, 0.5, 0.65, 0.8, 0.85];
const interiorTop = RIM_Y;
const interiorBottom = BASE_Y - 22;
const levelY = (f: number) => interiorBottom - (interiorBottom - interiorTop) * f;

function Ice({ x, y, r = 0, s = 1, o = 0.55 }: { x: number; y: number; r?: number; s?: number; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <rect x={-17} y={-17} width={34} height={34} rx={7} fill="#f4f1ec" fillOpacity={o * 0.35} stroke="#fffaf2" strokeOpacity={o} strokeWidth={1.4} />
      <path d="M-10 -9 L6 -11" stroke="#fff" strokeOpacity={o} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function LatteArt({ stage }: { stage: 0 | 1 | 2 | 3 | 4 }) {
  const id = `latte-${stage}`;
  const y = levelY(levels[stage]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="latte-art" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="48%" r="55%">
          <stop offset="0%" stopColor="#6b3440" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#30231d" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={innerClip} />
        </clipPath>
        <linearGradient id={`${id}-espresso`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3420" />
          <stop offset="45%" stopColor="#a87a55" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#efe5d6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-final`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4b2a19" />
          <stop offset="35%" stopColor="#8a5a38" />
          <stop offset="62%" stopColor="#c9a27c" />
          <stop offset="100%" stopColor="#f1e8da" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${id}-glow)`} />
      {/* table edge */}
      <rect y={BASE_Y + 10} width={W} height={H - BASE_Y - 10} fill="#231915" />
      <path d={`M0 ${BASE_Y + 10} H${W}`} stroke="#b08a4b" strokeOpacity="0.25" />
      <ellipse cx={W / 2} cy={BASE_Y + 12} rx={70} ry={6} fill="#000" opacity="0.35" />

      {/* liquid */}
      <g clipPath={`url(#${id}-clip)`}>
        {stage >= 1 && <rect x={0} y={y} width={W} height={H} fill="#efe6d8" />}
        {stage >= 1 && <path d={`M${TOP_L} ${y} q 36 -4 72 0 t 72 0`} stroke="#fffaf2" strokeOpacity="0.6" fill="none" />}
        {stage === 2 && (
          <g>
            <rect x={0} y={y} width={W} height={150} fill={`url(#${id}-espresso)`} />
            <ellipse cx={205} cy={y + 40} rx={46} ry={26} fill="#6b4128" opacity="0.55" />
            <ellipse cx={180} cy={y + 75} rx={30} ry={18} fill="#8c6141" opacity="0.4" />
          </g>
        )}
        {stage === 3 && <rect x={0} y={y} width={W} height={170} fill={`url(#${id}-espresso)`} />}
        {stage === 4 && <rect x={0} y={y} width={W} height={H} fill={`url(#${id}-final)`} />}
        {stage === 3 && (
          <>
            <Ice x={182} y={y + 6} r={-12} />
            <Ice x={222} y={y + 14} r={18} />
          </>
        )}
        {stage === 4 && (
          <>
            <Ice x={168} y={y + 16} r={-8} o={0.45} />
            <Ice x={204} y={y + 8} r={14} o={0.5} />
            <Ice x={236} y={y + 22} r={-20} o={0.42} />
            <Ice x={190} y={y + 46} r={30} o={0.3} />
          </>
        )}
      </g>

      {/* pours from the top-right */}
      {stage === 1 && <path d={`M372 0 C 340 40, 214 70, 204 ${y}`} stroke="#f3ece2" strokeWidth={7} fill="none" strokeLinecap="round" />}
      {stage === 2 && <path d={`M372 0 C 340 40, 214 70, 204 ${y + 30}`} stroke="#4a2a18" strokeWidth={5} fill="none" strokeLinecap="round" />}
      {stage === 3 && (
        <>
          <Ice x={214} y={RIM_Y - 46} r={24} o={0.8} />
          <circle cx={170} cy={y - 14} r={2.4} fill="#efe6d8" />
          <circle cx={238} cy={y - 20} r={2} fill="#efe6d8" />
          <circle cx={252} cy={y - 8} r={1.6} fill="#efe6d8" />
        </>
      )}

      {/* glass */}
      <path d={glassPath} fill="#ffffff" fillOpacity="0.05" stroke="#f5ebdd" strokeOpacity="0.75" strokeWidth={2} />
      <path d={`M${BOT_L + 2} ${BASE_Y - 22} H${BOT_R - 2}`} stroke="#f5ebdd" strokeOpacity="0.35" strokeWidth={1.4} />
      <ellipse cx={W / 2} cy={RIM_Y} rx={(TOP_R - TOP_L) / 2} ry={7} fill="none" stroke="#f5ebdd" strokeOpacity="0.7" strokeWidth={1.6} />
      <path d={`M${TOP_L + 14} ${RIM_Y + 20} L${BOT_L + 14} ${BASE_Y - 40}`} stroke="#fff" strokeOpacity="0.28" strokeWidth={5} strokeLinecap="round" />
      {stage === 4 &&
        [
          [154, 250], [160, 300], [246, 270], [242, 330], [150, 350], [250, 380], [166, 395],
        ].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={i % 2 ? 1.6 : 2.2} fill="#fff" opacity="0.4" />)}
    </svg>
  );
}
