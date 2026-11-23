/**
 * Canvas drawing for the coffee vessels used by the hero pour and the coffee slider.
 * Everything is drawn in a fixed 600 × 720 "scene" and scaled to fit the canvas.
 */

export const SCENE = { W: 600, H: 720, CX: 300 };

export type VesselKind = 'glass' | 'cup' | 'tea' | 'togo' | 'mocktail';

export interface VesselState {
  /** 0 empty → 1 full */
  level: number;
  /** Seconds, for wobble / steam / bubbles */
  t: number;
  /** Take-away lid: undefined = no lid; 0 = seated; 1 = far above (falling) */
  lid?: number;
  /** 0..1 steam opacity */
  steam?: number;
}

type Ctx = CanvasRenderingContext2D;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- geometry

interface Geo {
  rimY: number;
  baseY: number;
  topHalf: number;
  botHalf: number;
  /** y of the liquid surface for a given level */
  surface: (level: number) => number;
  /** half-width of the surface ellipse */
  surfaceRx: (level: number) => number;
  liquid: 'coffee' | 'chai' | 'mojito';
}

export const geometry: Record<VesselKind, Geo> = {
  glass: {
    rimY: 330,
    baseY: 600,
    topHalf: 112,
    botHalf: 96,
    surface: (l) => lerp(578, 352, l),
    surfaceRx: (l) => lerp(88, 103, l),
    liquid: 'coffee',
  },
  cup: {
    rimY: 430,
    baseY: 592,
    topHalf: 128,
    botHalf: 70,
    surface: (l) => 434 + (1 - l) * 24,
    surfaceRx: (l) => 120 * (0.8 + 0.2 * l),
    liquid: 'coffee',
  },
  tea: {
    rimY: 430,
    baseY: 592,
    topHalf: 128,
    botHalf: 70,
    surface: (l) => 434 + (1 - l) * 24,
    surfaceRx: (l) => 120 * (0.8 + 0.2 * l),
    liquid: 'chai',
  },
  togo: {
    rimY: 330,
    baseY: 600,
    topHalf: 118,
    botHalf: 88,
    surface: (l) => 336 + (1 - l) * 22,
    surfaceRx: (l) => 108 * (0.85 + 0.15 * l),
    liquid: 'coffee',
  },
  mocktail: {
    rimY: 250,
    baseY: 604,
    topHalf: 86,
    botHalf: 78,
    surface: (l) => lerp(582, 290, l),
    surfaceRx: () => 76,
    liquid: 'mojito',
  },
};

// ---------------------------------------------------------------- colours

export const liquidColours = {
  coffee: { dark: '#2c170d', mid: '#5b3219', light: '#9a6234', crema: '#b98552' },
  chai: { dark: '#6e4322', mid: '#a8703f', light: '#cf9d68', crema: '#e2bd8f' },
  mojito: { dark: '#4f7a2c', mid: '#9fc169', light: '#e5efb8', crema: '#f2f6d8' },
};

// ---------------------------------------------------------------- helpers

function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, Math.PI * 2);
}

function groundShadow(ctx: Ctx, y: number, rx: number, alpha = 0.22) {
  const g = ctx.createRadialGradient(SCENE.CX, y, 4, SCENE.CX, y, rx);
  g.addColorStop(0, `rgba(48,35,29,${alpha})`);
  g.addColorStop(1, 'rgba(48,35,29,0)');
  ctx.fillStyle = g;
  ellipse(ctx, SCENE.CX, y, rx, rx * 0.16);
  ctx.fill();
}

function iceCube(ctx: Ctx, x: number, y: number, size: number, rot: number, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= alpha;
  const r = size * 0.22;
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 2, size, size, r);
  ctx.fillStyle = 'rgba(255,252,246,0.28)';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.28);
  ctx.lineTo(size * 0.12, -size * 0.32);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

function steam(ctx: Ctx, topY: number, t: number, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const x0 = SCENE.CX - 50 + i * 50;
    const phase = t * 0.9 + i * 1.7;
    ctx.beginPath();
    for (let k = 0; k <= 24; k++) {
      const p = k / 24;
      const y = topY - 20 - p * 170;
      const x = x0 + Math.sin(phase * 2 + p * 5.5) * (8 + p * 16);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const g = ctx.createLinearGradient(0, topY - 20, 0, topY - 190);
    g.addColorStop(0, `rgba(120,90,70,${0.0 * alpha})`);
    g.addColorStop(0.25, `rgba(120,90,70,${0.22 * alpha})`);
    g.addColorStop(1, 'rgba(120,90,70,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 7;
    ctx.stroke();
  }
  ctx.restore();
}

function surfaceDisc(ctx: Ctx, kind: VesselKind, level: number, t: number) {
  const geo = geometry[kind];
  const c = liquidColours[geo.liquid];
  const y = geo.surface(level);
  const rx = geo.surfaceRx(level);
  const ry = rx * (kind === 'glass' || kind === 'mocktail' ? 0.12 : 0.2);
  const g = ctx.createRadialGradient(SCENE.CX - rx * 0.2, y - ry * 0.3, 2, SCENE.CX, y, rx);
  g.addColorStop(0, c.crema);
  g.addColorStop(0.55, c.light);
  g.addColorStop(1, c.dark);
  ctx.fillStyle = g;
  ellipse(ctx, SCENE.CX, y, rx, ry);
  ctx.fill();
  // soft reflected light
  ctx.strokeStyle = `rgba(255,240,220,${0.18 + 0.05 * Math.sin(t * 2)})`;
  ctx.lineWidth = 1.4;
  ellipse(ctx, SCENE.CX + rx * 0.12, y - ry * 0.1, rx * 0.55, ry * 0.45);
  ctx.stroke();
}

// ---------------------------------------------------------------- vessels

function drawGlass(ctx: Ctx, s: VesselState) {
  const g = geometry.glass;
  const { rimY, baseY, topHalf, botHalf } = g;
  const L = SCENE.CX - topHalf;
  const R = SCENE.CX + topHalf;
  const BL = SCENE.CX - botHalf;
  const BR = SCENE.CX + botHalf;
  groundShadow(ctx, baseY + 6, 150);

  // interior clip
  const inner = new Path2D();
  inner.moveTo(L + 9, rimY);
  inner.lineTo(BL + 9, baseY - 24);
  inner.quadraticCurveTo(SCENE.CX, baseY - 18, BR - 9, baseY - 24);
  inner.lineTo(R - 9, rimY);
  inner.closePath();

  ctx.save();
  ctx.clip(inner);
  // liquid body
  if (s.level > 0.005) {
    const top = g.surface(s.level);
    const lg = ctx.createLinearGradient(0, top, 0, baseY);
    const c = liquidColours.coffee;
    lg.addColorStop(0, c.dark);
    lg.addColorStop(0.45, c.mid);
    lg.addColorStop(1, '#a8703c');
    ctx.fillStyle = lg;
    ctx.fillRect(0, top, SCENE.W, baseY - top);
    // light through the glass
    const lt = ctx.createLinearGradient(L, 0, R, 0);
    lt.addColorStop(0, 'rgba(255,220,170,0.0)');
    lt.addColorStop(0.3, 'rgba(255,220,170,0.18)');
    lt.addColorStop(0.6, 'rgba(255,220,170,0.0)');
    ctx.fillStyle = lt;
    ctx.fillRect(0, top, SCENE.W, baseY - top);
  }
  // ice: always present, floats with the liquid
  const top = s.level > 0.05 ? g.surface(s.level) : baseY - 60;
  const bob = (k: number) => Math.sin(s.t * 1.6 + k) * 2.5;
  const cubes: Array<[number, number, number, number]> = [
    [-48, -6, 54, -0.25],
    [16, -14, 58, 0.18],
    [62, 4, 48, 0.5],
    [-8, 32, 52, 0.05],
    [-60, 50, 46, 0.4],
  ];
  for (const [i, [dx, dy, size, rot]] of cubes.entries()) {
    iceCube(ctx, SCENE.CX + dx, Math.min(top + dy + bob(i), baseY - 48), size, rot + Math.sin(s.t + i) * 0.03, 0.95);
  }
  ctx.restore();
  if (s.level > 0.005) surfaceDisc(ctx, 'glass', s.level, s.t);

  // glass body
  ctx.beginPath();
  ctx.moveTo(L, rimY);
  ctx.lineTo(BL, baseY - 10);
  ctx.quadraticCurveTo(BL, baseY, BL + 12, baseY);
  ctx.lineTo(BR - 12, baseY);
  ctx.quadraticCurveTo(BR, baseY, BR, baseY - 10);
  ctx.lineTo(R, rimY);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(48,35,29,0.30)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // thick base
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.moveTo(BL + 3, baseY - 22);
  ctx.quadraticCurveTo(SCENE.CX, baseY - 16, BR - 3, baseY - 22);
  ctx.lineTo(BR - 3, baseY - 4);
  ctx.lineTo(BL + 3, baseY - 4);
  ctx.fill();
  // highlights
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(L + 22, rimY + 26);
  ctx.lineTo(BL + 20, baseY - 46);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(R - 18, rimY + 40);
  ctx.lineTo(BR - 16, baseY - 70);
  ctx.stroke();
  // rim
  ctx.strokeStyle = 'rgba(48,35,29,0.32)';
  ctx.lineWidth = 2;
  ellipse(ctx, SCENE.CX, rimY, topHalf, 14);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.5;
  ellipse(ctx, SCENE.CX, rimY + 1.5, topHalf - 3, 12);
  ctx.stroke();
}

function drawCup(ctx: Ctx, kind: 'cup' | 'tea', s: VesselState) {
  const g = geometry[kind];
  const glaze = kind === 'cup' ? { dark: '#2a0f16', mid: '#461c25', light: '#7a3a48' } : { dark: '#cdbd9f', mid: '#efe4d0', light: '#fffaf0' };
  const { rimY } = g;
  // saucer
  groundShadow(ctx, 612, 230, 0.25);
  ctx.fillStyle = '#fbf5ec';
  ellipse(ctx, SCENE.CX, 602, 205, 38);
  ctx.fill();
  ctx.strokeStyle = 'rgba(48,35,29,0.18)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = '#b08a4b';
  ctx.lineWidth = 2;
  ellipse(ctx, SCENE.CX, 600, 196, 34);
  ctx.stroke();
  ctx.fillStyle = 'rgba(48,35,29,0.08)';
  ellipse(ctx, SCENE.CX, 600, 118, 20);
  ctx.fill();

  // handle
  ctx.lineCap = 'round';
  ctx.strokeStyle = glaze.mid;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(418, 462);
  ctx.bezierCurveTo(500, 450, 500, 560, 400, 556);
  ctx.stroke();
  ctx.strokeStyle = glaze.light;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(428, 460);
  ctx.bezierCurveTo(488, 456, 490, 520, 462, 540);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // body
  const body = new Path2D('M172 430 C 176 522 198 588 238 594 L 362 594 C 402 588 424 522 428 430 Z');
  const bg = ctx.createLinearGradient(172, 0, 428, 0);
  bg.addColorStop(0, glaze.dark);
  bg.addColorStop(0.28, glaze.light);
  bg.addColorStop(0.55, glaze.mid);
  bg.addColorStop(1, glaze.dark);
  ctx.fillStyle = bg;
  ctx.fill(body);
  if (kind === 'tea') {
    ctx.strokeStyle = '#b08a4b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, 470);
    ctx.bezierCurveTo(240, 486, 360, 486, 420, 470);
    ctx.stroke();
  } else {
    // brass ring motif on the cup
    ctx.strokeStyle = '#d2b47c';
    ctx.lineWidth = 3;
    ellipse(ctx, 300, 512, 17, 17);
    ctx.stroke();
  }
  // gloss
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.ellipse(222, 492, 12, 44, -0.12, 0, Math.PI * 2);
  ctx.fill();

  // rim & interior
  ctx.fillStyle = kind === 'cup' ? '#1d0a0f' : '#d9ccb4';
  ellipse(ctx, SCENE.CX, rimY, 128, 26);
  ctx.fill();
  if (s.level > 0.01) {
    ctx.save();
    ellipse(ctx, SCENE.CX, rimY, 124, 24);
    ctx.clip();
    surfaceDisc(ctx, kind, s.level, s.t);
    ctx.restore();
  }
  ctx.strokeStyle = glaze.light;
  ctx.lineWidth = 4;
  ellipse(ctx, SCENE.CX, rimY, 128, 26);
  ctx.stroke();

  steam(ctx, rimY - 10, s.t, s.steam ?? 0);
}

function drawTogo(ctx: Ctx, s: VesselState) {
  const g = geometry.togo;
  const { rimY, baseY, topHalf, botHalf } = g;
  const L = SCENE.CX - topHalf;
  const R = SCENE.CX + topHalf;
  const BL = SCENE.CX - botHalf;
  const BR = SCENE.CX + botHalf;
  groundShadow(ctx, baseY + 6, 150);

  const body = new Path2D();
  body.moveTo(L, rimY);
  body.lineTo(BL, baseY - 6);
  body.quadraticCurveTo(SCENE.CX, baseY + 6, BR, baseY - 6);
  body.lineTo(R, rimY);
  body.closePath();
  const bg = ctx.createLinearGradient(L, 0, R, 0);
  bg.addColorStop(0, '#d8c8ab');
  bg.addColorStop(0.3, '#fffaf2');
  bg.addColorStop(0.7, '#f3e9d8');
  bg.addColorStop(1, '#cdbb9a');
  ctx.fillStyle = bg;
  ctx.fill(body);

  // sleeve
  ctx.save();
  ctx.clip(body);
  const sleeve = ctx.createLinearGradient(L, 0, R, 0);
  sleeve.addColorStop(0, '#2e1218');
  sleeve.addColorStop(0.35, '#6b3440');
  sleeve.addColorStop(1, '#2e1218');
  ctx.fillStyle = sleeve;
  ctx.fillRect(0, 432, SCENE.W, 96);
  ctx.strokeStyle = '#d2b47c';
  ctx.lineWidth = 2;
  for (const y of [440, 520]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SCENE.W, y);
    ctx.stroke();
  }
  ctx.lineWidth = 3.5;
  ellipse(ctx, SCENE.CX, 480, 22, 22);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(48,35,29,0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke(body);

  // opening (visible until the lid lands)
  const lidOn = s.lid !== undefined && s.lid <= 0.001;
  if (!lidOn) {
    ctx.fillStyle = '#d9cbb2';
    ellipse(ctx, SCENE.CX, rimY, topHalf - 2, 17);
    ctx.fill();
    if (s.level > 0.01) {
      ctx.save();
      ellipse(ctx, SCENE.CX, rimY, topHalf - 6, 15);
      ctx.clip();
      surfaceDisc(ctx, 'togo', s.level, s.t);
      ctx.restore();
    }
  }
  // rolled lip
  ctx.strokeStyle = '#fffaf2';
  ctx.lineWidth = 7;
  ellipse(ctx, SCENE.CX, rimY, topHalf, 18);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(48,35,29,0.25)';
  ctx.lineWidth = 1.2;
  ellipse(ctx, SCENE.CX, rimY, topHalf + 3.5, 21);
  ctx.stroke();

  if (!lidOn) steam(ctx, rimY - 6, s.t, s.steam ?? 0);

  // lid
  if (s.lid !== undefined) {
    const dy = -s.lid * 340;
    ctx.save();
    ctx.translate(0, dy);
    const lg = ctx.createLinearGradient(L, 0, R, 0);
    lg.addColorStop(0, '#2e1218');
    lg.addColorStop(0.32, '#7a3a48');
    lg.addColorStop(1, '#2e1218');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(L - 8, rimY + 2);
    ctx.lineTo(L + 6, rimY - 22);
    ctx.bezierCurveTo(L + 20, rimY - 40, R - 20, rimY - 40, R - 6, rimY - 22);
    ctx.lineTo(R + 8, rimY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#461c25';
    ellipse(ctx, SCENE.CX, rimY + 2, topHalf + 9, 20);
    ctx.fill();
    ctx.fillStyle = '#5e2a35';
    ellipse(ctx, SCENE.CX, rimY - 26, topHalf - 26, 12);
    ctx.fill();
    ctx.fillStyle = '#1d0a0f';
    ctx.beginPath();
    ctx.roundRect(SCENE.CX + 30, rimY - 30, 36, 8, 4);
    ctx.fill();
    ctx.restore();
  }
}

function drawMocktail(ctx: Ctx, s: VesselState) {
  const g = geometry.mocktail;
  const { rimY, baseY, topHalf, botHalf } = g;
  const L = SCENE.CX - topHalf;
  const R = SCENE.CX + topHalf;
  const BL = SCENE.CX - botHalf;
  const BR = SCENE.CX + botHalf;
  groundShadow(ctx, baseY + 6, 130);

  // straw (behind front glass, in front of back rim)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#461c25';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(268, 520);
  ctx.lineTo(372, 150);
  ctx.stroke();
  ctx.strokeStyle = '#f5ebdd';
  ctx.lineWidth = 11;
  ctx.setLineDash([10, 14]);
  ctx.beginPath();
  ctx.moveTo(268, 520);
  ctx.lineTo(372, 150);
  ctx.stroke();
  ctx.restore();

  const inner = new Path2D();
  inner.moveTo(L + 8, rimY);
  inner.lineTo(BL + 8, baseY - 22);
  inner.lineTo(BR - 8, baseY - 22);
  inner.lineTo(R - 8, rimY);
  inner.closePath();
  ctx.save();
  ctx.clip(inner);
  const top = g.surface(s.level);
  const c = liquidColours.mojito;
  const lg = ctx.createLinearGradient(0, top, 0, baseY);
  lg.addColorStop(0, c.light);
  lg.addColorStop(0.55, c.mid);
  lg.addColorStop(1, c.dark);
  ctx.fillStyle = lg;
  ctx.fillRect(0, top, SCENE.W, baseY - top);
  // mint leaves
  for (const [x, y, r] of [
    [262, 470, -0.6],
    [330, 520, 0.7],
    [290, 400, 0.2],
    [318, 560, -0.3],
  ] as const) {
    ctx.save();
    ctx.translate(x, y + Math.sin(s.t + x) * 3);
    ctx.rotate(r);
    ctx.fillStyle = '#2f6b3a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220,240,200,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.restore();
  }
  // bubbles
  for (let i = 0; i < 18; i++) {
    const x = BL + 18 + ((i * 37) % (botHalf * 2 - 30));
    const speed = 30 + (i % 5) * 12;
    const span = baseY - 30 - top;
    const y = baseY - 30 - ((s.t * speed + i * 53) % Math.max(span, 1));
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ellipse(ctx, x, y, 2 + (i % 3), 2 + (i % 3));
    ctx.fill();
  }
  for (const [i, [dx, dy, size, rot]] of ([
    [-30, 10, 50, 0.3],
    [28, -4, 54, -0.2],
    [0, 48, 46, 0.1],
  ] as const).entries()) {
    iceCube(ctx, SCENE.CX + dx, top + dy + Math.sin(s.t * 1.4 + i) * 2.5, size, rot, 0.9);
  }
  ctx.restore();
  surfaceDisc(ctx, 'mocktail', s.level, s.t);

  // glass
  ctx.beginPath();
  ctx.moveTo(L, rimY);
  ctx.lineTo(BL, baseY - 8);
  ctx.quadraticCurveTo(BL, baseY, BL + 10, baseY);
  ctx.lineTo(BR - 10, baseY);
  ctx.quadraticCurveTo(BR, baseY, BR, baseY - 8);
  ctx.lineTo(R, rimY);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(48,35,29,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(L + 20, rimY + 30);
  ctx.lineTo(BL + 18, baseY - 50);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(48,35,29,0.3)';
  ctx.lineWidth = 2;
  ellipse(ctx, SCENE.CX, rimY, topHalf, 12);
  ctx.stroke();

  // lime wheel on the rim
  ctx.save();
  ctx.translate(R - 6, rimY + 4);
  ctx.rotate(0.35);
  ctx.fillStyle = '#7da83a';
  ellipse(ctx, 0, 0, 40, 40);
  ctx.fill();
  ctx.fillStyle = '#e3f0a8';
  ellipse(ctx, 0, 0, 33, 33);
  ctx.fill();
  ctx.strokeStyle = '#7da83a';
  ctx.lineWidth = 2;
  for (let k = 0; k < 8; k++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos((k * Math.PI) / 4) * 31, Math.sin((k * Math.PI) / 4) * 31);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawVessel(ctx: Ctx, kind: VesselKind, s: VesselState) {
  if (kind === 'glass') drawGlass(ctx, s);
  else if (kind === 'cup' || kind === 'tea') drawCup(ctx, kind, s);
  else if (kind === 'togo') drawTogo(ctx, s);
  else drawMocktail(ctx, s);
}

// ---------------------------------------------------------------- pouring

/** A gently wobbling liquid stream from y0 to y1. */
export function drawStream(ctx: Ctx, x: number, y0: number, y1: number, width: number, t: number, liquid: keyof typeof liquidColours = 'coffee') {
  if (y1 <= y0 + 1) return;
  const c = liquidColours[liquid];
  const steps = Math.max(4, Math.ceil((y1 - y0) / 14));
  const wob = (y: number) => Math.sin(t * 11 + y * 0.045) * 1.3 + Math.sin(t * 5 + y * 0.02) * 0.8;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const y = y0 + ((y1 - y0) * i) / steps;
    const w = width * (0.75 + 0.25 * Math.min(1, (y - y0) / 120));
    ctx.lineTo(x + wob(y) - w / 2, y);
  }
  for (let i = steps; i >= 0; i--) {
    const y = y0 + ((y1 - y0) * i) / steps;
    const w = width * (0.75 + 0.25 * Math.min(1, (y - y0) / 120));
    ctx.lineTo(x + wob(y) + w / 2, y);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
  g.addColorStop(0, c.dark);
  g.addColorStop(0.45, c.light);
  g.addColorStop(0.6, c.mid);
  g.addColorStop(1, c.dark);
  ctx.fillStyle = g;
  ctx.fill();
}

export function drawDrop(ctx: Ctx, x: number, y: number, r: number, liquid: keyof typeof liquidColours = 'coffee', stretch = 1) {
  const c = liquidColours[liquid];
  ctx.fillStyle = c.mid;
  ellipse(ctx, x, y, r, r * stretch);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,235,210,0.55)';
  ellipse(ctx, x - r * 0.35, y - r * 0.35 * stretch, r * 0.3, r * 0.3);
  ctx.fill();
}

/** Expanding ripple on the liquid surface. */
export function drawRipple(ctx: Ctx, kind: VesselKind, level: number, radius: number, alpha: number) {
  const geo = geometry[kind];
  const y = geo.surface(level);
  const maxRx = geo.surfaceRx(level);
  if (radius > maxRx) return;
  const ratio = kind === 'glass' || kind === 'mocktail' ? 0.12 : 0.2;
  ctx.strokeStyle = `rgba(230,200,160,${alpha})`;
  ctx.lineWidth = 1.6;
  ellipse(ctx, SCENE.CX, y, radius, radius * ratio);
  ctx.stroke();
}

/** Fit the 600 × 720 scene inside a canvas of the given CSS size. */
export function fitScene(ctx: Ctx, cssW: number, cssH: number, dpr: number) {
  const scale = Math.min(cssW / SCENE.W, cssH / SCENE.H);
  const ox = (cssW - SCENE.W * scale) / 2;
  const oy = (cssH - SCENE.H * scale) / 2;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
}
