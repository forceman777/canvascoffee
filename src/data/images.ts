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
  ext: 'jpg' | 'png' | 'svg';
  ratio: [number, number];
  alt: string;
  /** Placeholder palette: matches the section the image sits in. */
  tone: Tone;
  /** Short description shown on the placeholder. */
  label: string;
  /** Decorative images are hidden from screen readers. */
  decorative?: boolean;
}

const img = (file: string, ext: ImageSpec['ext'], ratio: [number, number], tone: Tone, label: string, alt: string, decorative = false): ImageSpec =>
  ({ file, ext, ratio, tone, label, alt, decorative });

export const images = {
  'BRAND-01': img('brand/logo', 'svg', [3, 1], 'light', 'Logo', 'Canvas O Coffee'),

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

  'STORY-01': img('story/story-slow-moment', 'jpg', [4, 5], 'light', 'Coffee beside an open book', 'A cup of coffee beside an open book in morning sunlight'),
  'STORY-02': img('story/story-coffee-beans', 'jpg', [3, 2], 'dark', 'Roasted beans and coffee cherries', 'Roasted coffee beans with fresh red coffee cherries'),

  'MENU-01': img('menu/categories/tea', 'jpg', [4, 3], 'dark', 'Tea', 'Illustrative image: a cup of spiced tea and a glass of iced tea'),
  'MENU-02': img('menu/categories/coffee', 'jpg', [4, 3], 'dark', 'Coffee', 'Illustrative image: a cup of black coffee and a glass of cold coffee'),
  'MENU-03': img('menu/categories/momo', 'jpg', [4, 3], 'dark', 'Momo', 'Illustrative image: steamed and pan-fried momos'),
  'MENU-04': img('menu/categories/bread-chaat', 'jpg', [4, 3], 'dark', 'Bread & Chaat', 'Illustrative image: cheese garlic bread and corn chaat'),
  'MENU-05': img('menu/categories/burger', 'jpg', [4, 3], 'dark', 'Burger', 'Illustrative image: a burger on a wooden board'),
  'MENU-06': img('menu/categories/pizza', 'jpg', [4, 3], 'dark', 'Pizza', 'Illustrative image: a pizza with melted cheese and corn'),
  'MENU-07': img('menu/categories/wraps', 'jpg', [4, 3], 'dark', 'Wraps', 'Illustrative image: a wrap cut in half'),
  'MENU-08': img('menu/categories/noodles', 'jpg', [4, 3], 'dark', 'Noodles', 'Illustrative image: a bowl of noodles with vegetables'),
  'MENU-09': img('menu/categories/french-fries', 'jpg', [4, 3], 'dark', 'French Fries', 'Illustrative image: golden fries in a basket'),
  'MENU-10': img('menu/categories/fried-special', 'jpg', [4, 3], 'dark', 'Fried Special', 'Illustrative image: assorted fried nuggets and strips'),
  'MENU-11': img('menu/categories/desserts', 'jpg', [4, 3], 'dark', 'Desserts', 'Illustrative image: a slice of chocolate cake and a muffin'),
  'MENU-12': img('menu/categories/mocktails', 'jpg', [4, 3], 'dark', 'Mocktails', 'Illustrative image: a mint mojito and a masala cola'),

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
}

const generated = manifest as Record<string, ManifestEntry>;

/** Returns the generated files for an asset, or null if it has not been supplied yet. */
export const imageFiles = (id: ImageId): ManifestEntry | null => generated[images[id].file] ?? null;

export const hasImage = (id: ImageId) => imageFiles(id) !== null;

/** Optional real photo for a menu item (assets-src/images/menu/items/{productId}.jpg). */
export const itemPhoto = (productId: string): ManifestEntry | null => generated[`menu/items/${productId}`] ?? null;

export const publicPath = (file: string) => `/images/${file}`;
