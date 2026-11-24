/**
 * Image registry. Every image on the site is referenced by its asset ID from
 * docs/IMAGE_ASSET_REQUIREMENTS.md.
 *
 * TO ADD A REAL IMAGE: drop the master file at assets-src/images/<file> with the exact
 * filename below, then run `npm run images` (it also runs automatically before `dev` and
 * `build`). The placeholder is replaced automatically. No code changes needed.
 */
import manifest from './image-manifest.json';

export type Tone = 'dark' | 'light';

export interface ImageSpec {
  /** Path inside assets-src/images (and public/images), without extension. */
  file: string;
  ext: 'jpg' | 'png' | 'svg' | 'mp4';
  ratio: [number, number];
  alt: string;
  /** Placeholder palette: matches the section the image sits in. */
  tone: Tone;
  /** Short description shown on the placeholder. */
  label: string;
  /** Decorative images are hidden from screen readers. */
  decorative?: boolean;
  /** Transparent cut-out (product shot): shown whole, never cropped. */
  cutout?: boolean;
  /** Other assets to show, in order, when this one has not been supplied. */
  fallbackTo?: string[];
}

const img = (file: string, ext: ImageSpec['ext'], ratio: [number, number], tone: Tone, label: string, alt: string, decorative = false): ImageSpec =>
  ({ file, ext, ratio, tone, label, alt, decorative });
const cutout = (file: string, ratio: [number, number], label: string, alt: string): ImageSpec =>
  ({ file, ext: 'png', ratio, tone: 'light', label, alt, cutout: true });
const menuImg = (file: string, label: string, alt: string, fallbackTo: string[]): ImageSpec =>
  ({ ...img(file, 'jpg', [4, 3], 'dark', label, alt), fallbackTo });

export const images = {
  'BRAND-01': img('brand/logo', 'svg', [3, 1], 'light', 'Logo', 'Canvas O Coffee'),

  'HERO-VID': img('hero/hero-pour', 'mp4', [16, 9], 'dark', 'Hero pour video', 'Iced coffee being poured over ice in a glass on a wooden bar counter'),
  'HERO-POSTER': img('hero/hero-pour-poster', 'jpg', [16, 9], 'dark', 'Hero video first frame', 'A glass of ice on a wooden bar counter'),
  'HERO-STILL': img('hero/hero-pour-still', 'jpg', [16, 9], 'dark', 'Hero video last frame', 'A glass of iced coffee on a wooden bar counter'),

  'HERO-01': img('hero/hero-coffee-desktop', 'jpg', [16, 9], 'dark', 'Hero coffee still life (desktop)', 'A cup of black coffee on a dark walnut table beside a sprig of coffee leaves and cherries'),
  'HERO-02': img('hero/hero-coffee-mobile', 'jpg', [9, 16], 'dark', 'Hero coffee still life (mobile)', 'A cup of black coffee on a dark walnut table beside a sprig of coffee leaves and cherries'),

  'BOT-01': img('botanical/coffee-branch-horizontal', 'png', [3, 2], 'light', 'Botanical coffee branch, horizontal', '', true),
  'BOT-02': img('botanical/coffee-branch-vertical', 'png', [2, 3], 'light', 'Botanical coffee branch, vertical', '', true),
  'BOT-03': img('botanical/coffee-cherry-cluster', 'png', [1, 1], 'light', 'Coffee cherry cluster', '', true),
  'BOT-04': img('botanical/cherry-to-bean-sheet', 'png', [4, 1], 'light', 'Cherry-to-bean botanical sheet', 'Botanical drawing of a coffee cherry, its cross-section, green beans and roasted beans'),

  'IL-01': img('signature/iced-latte/iced-latte-01-empty-glass', 'jpg', [4, 5], 'dark', 'Iced latte frame 1: empty glass', 'An empty clear glass on a dark walnut table'),
  'IL-02': img('signature/iced-latte/iced-latte-02-milk-pour', 'jpg', [4, 5], 'dark', 'Iced latte frame 2: milk pour', 'Cold milk pouring into the glass'),
  'IL-03': img('signature/iced-latte/iced-latte-03-espresso-pour', 'jpg', [4, 5], 'dark', 'Iced latte frame 3: espresso pour', 'Espresso pouring into the milk and clouding through it'),
  'IL-04': img('signature/iced-latte/iced-latte-04-ice-drop', 'jpg', [4, 5], 'dark', 'Iced latte frame 4: ice drop', 'Ice cubes dropping into the glass'),
  'IL-05': img('signature/iced-latte/iced-latte-05-complete', 'jpg', [4, 5], 'dark', 'Iced latte frame 5: complete', 'A finished iced latte with ice, layered from milk-white to coffee-brown'),

  'SLIDE-01': cutout('slider/slide-hot-coffee', [2, 3], 'Slider: hot coffee cut-out', 'Illustrative image: a cup of hot coffee'),
  'SLIDE-02': cutout('slider/slide-cold-coffee', [1, 2], 'Slider: iced mocha cut-out', 'Illustrative image: an iced mocha with chocolate drizzle in a tall glass'),
  'SLIDE-03': cutout('slider/slide-tea', [1, 2], 'Slider: iced tea cut-out', 'Illustrative image: iced tea with lemon and mint in a tall glass'),
  'SLIDE-04': cutout('slider/slide-mocktail', [1, 2], 'Slider: mint mojito cut-out', 'Illustrative image: a mint mojito with lime and ice in a tall glass'),
  'SLIDE-05': cutout('slider/slide-blue-butterfly', [1, 2], 'Slider: blue butterfly cut-out', 'Illustrative image: a blue mocktail with mint, lime and a blue flower'),

  'PLATE-01': cutout('food/plate-momo', [3, 2], 'Momo tray (top view)', 'Illustrative image: six steamed momos in a paper tray with a red chutney'),
  'PLATE-02': cutout('food/plate-pizza', [1, 1], 'Pizza box (top view)', 'Illustrative image: a sliced vegetable pizza in an open box'),
  'PLATE-03': cutout('food/plate-burger', [3, 2], 'Burger tray (top view)', 'Illustrative image: a double patty burger with fries and a dip in a paper tray'),
  'PLATE-04': cutout('food/plate-fried-special', [3, 2], 'Fried special tray (top view)', 'Illustrative image: fried nuggets and strips in a paper tray'),
  'PLATE-05': cutout('food/plate-fries', [3, 2], 'Fries tray (top view)', 'Illustrative image: seasoned french fries with a dip in a paper tray'),
  'PLATE-06': cutout('food/plate-desserts', [3, 2], 'Brownie tray (top view)', 'Illustrative image: a walnut brownie with chocolate drizzle in a paper tray'),
  'PLATE-07': cutout('food/plate-bread-chaat', [3, 2], 'Garlic bread tray (top view)', 'Illustrative image: cheese garlic bread with fries and a dip in a paper tray'),

  'STORY-01': img('story/story-slow-moment', 'jpg', [4, 5], 'light', 'Coffee beside an open book', 'A cup of coffee beside an open book in morning sunlight'),
  'STORY-02': img('story/story-coffee-beans', 'jpg', [3, 2], 'dark', 'Roasted beans and coffee cherries', 'Roasted coffee beans with fresh red coffee cherries'),

  'MENU-01': menuImg('menu/categories/tea', 'Tea', 'Illustrative image: a cup of spiced tea and a glass of iced tea', ['SLIDE-03']),
  'MENU-02': menuImg('menu/categories/coffee', 'Coffee', 'Illustrative image: a cup of black coffee and a glass of cold coffee', ['SLIDE-02', 'SLIDE-01']),
  'MENU-03': menuImg('menu/categories/momo', 'Momo', 'Illustrative image: steamed and pan-fried momos', ['PLATE-01']),
  'MENU-04': menuImg('menu/categories/bread-chaat', 'Bread & Chaat', 'Illustrative image: cheese garlic bread and corn chaat', ['PLATE-07']),
  'MENU-05': menuImg('menu/categories/burger', 'Burger', 'Illustrative image: a burger on a wooden board', ['PLATE-03']),
  'MENU-06': menuImg('menu/categories/pizza', 'Pizza', 'Illustrative image: a pizza with melted cheese and corn', ['PLATE-02']),
  'MENU-07': img('menu/categories/wraps', 'jpg', [4, 3], 'dark', 'Wraps', 'Illustrative image: a wrap cut in half'),
  'MENU-08': img('menu/categories/noodles', 'jpg', [4, 3], 'dark', 'Noodles', 'Illustrative image: a bowl of noodles with vegetables'),
  'MENU-09': menuImg('menu/categories/french-fries', 'French Fries', 'Illustrative image: golden fries in a basket', ['PLATE-05']),
  'MENU-10': menuImg('menu/categories/fried-special', 'Fried Special', 'Illustrative image: assorted fried nuggets and strips', ['PLATE-04']),
  'MENU-11': menuImg('menu/categories/desserts', 'Desserts', 'Illustrative image: a slice of chocolate cake and a muffin', ['PLATE-06']),
  'MENU-12': menuImg('menu/categories/mocktails', 'Mocktails', 'Illustrative image: a mint mojito and a masala cola', ['SLIDE-04', 'SLIDE-05']),

  'ATM-01': img('cafe/interior-wide', 'jpg', [3, 2], 'dark', 'Café interior, wide (real photo)', 'The seating area inside Canvas O Coffee'),
  'ATM-02': img('cafe/interior-table', 'jpg', [4, 5], 'dark', 'A table at the café (real photo)', 'A table set inside Canvas O Coffee'),
  'ATM-03': img('cafe/storefront', 'jpg', [3, 2], 'dark', 'Storefront (real photo)', 'The front of Canvas O Coffee'),
  'ATM-04': img('cafe/counter', 'jpg', [4, 5], 'dark', 'Counter (real photo)', 'The counter at Canvas O Coffee'),

  'GAL-01': img('gallery/gallery-01', 'jpg', [4, 5], 'dark', 'Gallery: drink served at a table', 'A drink being served at a table'),
  'GAL-02': img('gallery/gallery-02', 'jpg', [3, 2], 'dark', 'Gallery: seating corner', 'A seating corner in the café'),
  'GAL-03': img('gallery/gallery-03', 'jpg', [1, 1], 'dark', 'Gallery: momos as served', 'A plate of momos'),
  'GAL-04': img('gallery/gallery-04', 'jpg', [4, 5], 'dark', 'Gallery: mocktail in daylight', 'A mocktail in daylight'),
  'GAL-05': img('gallery/gallery-05', 'jpg', [1, 1], 'dark', 'Gallery: detail or texture', 'A detail inside the café'),
  'GAL-06': img('gallery/gallery-06', 'jpg', [3, 2], 'dark', 'Gallery: pizza or burger, top-down', 'Food from the menu, seen from above'),
  'GAL-07': img('gallery/gallery-07', 'jpg', [4, 5], 'dark', 'Gallery: dessert with coffee', 'A dessert with coffee'),
  'GAL-08': img('gallery/gallery-08', 'jpg', [3, 2], 'dark', 'Gallery: evening ambience', 'The café in the evening'),
  'GAL-09': img('gallery/gallery-09', 'jpg', [4, 5], 'dark', 'Gallery: entrance at golden hour', 'The café entrance at golden hour'),

  'READ-01': img('reading/reading-corner', 'jpg', [3, 2], 'dark', 'Books and tea in evening light', 'A stack of old cloth-bound books and a cup of tea in warm evening light'),
  'TEX-01': img('textures/parchment-tile', 'jpg', [1, 1], 'light', 'Parchment texture tile', '', true),
} satisfies Record<string, ImageSpec>;

export type ImageId = keyof typeof images;

export interface ManifestEntry {
  width: number;
  height: number;
  widths: number[];
  fallback: string;
  alpha?: boolean;
  /** Videos: available encodings, smallest first. */
  sources?: { src: string; type: string }[];
}

/** A supplied asset, resolved through any fallbacks. */
export interface ResolvedImage extends ManifestEntry {
  /** Path inside public/images without size suffix or extension. */
  key: string;
  alt: string;
  decorative: boolean;
  cutout: boolean;
}

const generated = manifest as Record<string, ManifestEntry>;

function resolve(id: ImageId, seen = new Set<string>()): ResolvedImage | null {
  if (seen.has(id)) return null;
  seen.add(id);
  const spec: ImageSpec = images[id];
  const entry = generated[spec.file];
  if (entry) return { ...entry, key: spec.file, alt: spec.alt, decorative: Boolean(spec.decorative), cutout: Boolean(spec.cutout) };
  for (const next of spec.fallbackTo ?? []) {
    const found = resolve(next as ImageId, seen);
    if (found) return found;
  }
  return null;
}

/** The supplied files for an asset (or its fallback), or null if nothing has been supplied. */
export const imageFiles = (id: ImageId): ResolvedImage | null => resolve(id);

export const hasImage = (id: ImageId) => imageFiles(id) !== null;

/**
 * Photo for a single menu item: a dedicated file at menu/items/{productId}, otherwise a
 * supplied product shot that clearly shows exactly that item.
 */
const itemPhotoFallbacks: Record<string, ImageId> = {
  'iced-mocha': 'SLIDE-02',
  'iced-tea': 'SLIDE-03',
  'mint-mojito': 'SLIDE-04',
  'blue-butterfly': 'SLIDE-05',
  'cheese-garlic-bread': 'PLATE-07',
  'walnut-brownie': 'PLATE-06',
  'peri-peri-french-fry': 'PLATE-05',
};
export function itemPhoto(productId: string): ResolvedImage | null {
  const key = `menu/items/${productId}`;
  const own = generated[key];
  if (own) return { ...own, key, alt: '', decorative: false, cutout: Boolean(own.alpha) };
  const fallback = itemPhotoFallbacks[productId];
  return fallback ? imageFiles(fallback) : null;
}

export const publicPath = (file: string) => `/images/${file}`;
