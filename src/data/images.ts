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

  // Real footage from the café (owner's reel, edited for the web: flash removed, seamless loop, no audio).
  'CAFE-VID': img('cafe/cafe-walkthrough', 'mp4', [9, 16], 'dark', 'Café walkthrough video', 'A walk around Canvas O Coffee: painted masks, lantern lights, paintings and a village mural'),
  'CAFE-POSTER': img('cafe/cafe-walkthrough-poster', 'jpg', [9, 16], 'dark', 'Café video first frame', 'A painted mask on the café wall'),

  // Steaming momos (supplied video, cropped to 4:3, seamless loop, no audio) and in-context drink photos.
  'FOOD-VID': img('food/momo-steam', 'mp4', [4, 3], 'dark', 'Steaming momos video', 'Illustrative video: steam rising from six momos in a paper tray'),
  'FOOD-POSTER': img('food/momo-steam-poster', 'jpg', [4, 3], 'dark', 'Steaming momos, first frame', 'Illustrative image: six momos in a paper tray'),
  'SCENE-DRINKS': img('menu/items/cold-coffee', 'jpg', [3, 2], 'dark', 'Cold coffee on a café table', 'Illustrative image: a cold coffee with whipped cream and chocolate on a sunlit wooden table'),
  'SCENE-MOCKTAILS': img('menu/items/blue-butterfly', 'jpg', [3, 2], 'dark', 'Blue Butterfly on a café table', 'Illustrative image: a blue mocktail with mint and lime on a sunlit wooden table'),

  'HERO-01': img('hero/hero-coffee-desktop', 'jpg', [16, 9], 'dark', 'Hero coffee still life (desktop)', 'A cup of black coffee on a dark walnut table beside a sprig of coffee leaves and cherries'),
  'HERO-02': img('hero/hero-coffee-mobile', 'jpg', [9, 16], 'dark', 'Hero coffee still life (mobile)', 'A cup of black coffee on a dark walnut table beside a sprig of coffee leaves and cherries'),

  'BOT-01': img('botanical/coffee-branch-horizontal', 'png', [3, 2], 'light', 'Botanical coffee branch, horizontal', '', true),
  'BOT-02': img('botanical/coffee-branch-vertical', 'png', [2, 3], 'light', 'Botanical coffee branch, vertical', '', true),
  'BOT-03': img('botanical/coffee-cherry-cluster', 'png', [1, 1], 'light', 'Coffee cherry cluster', '', true),
  'BOT-04': img('botanical/cherry-to-bean-sheet', 'png', [4, 1], 'light', 'Cherry-to-bean botanical sheet', 'Botanical drawing of a coffee cherry, its cross-section, green beans and roasted beans'),

  // Five frames from the hero pour video (fixed camera, so they line up exactly as they cross-fade).
  'IL-01': img('signature/iced-coffee/iced-coffee-01-glass', 'jpg', [4, 5], 'dark', 'Sequence frame 1: glass of ice', 'A clear glass full of ice on a wooden bar counter'),
  'IL-02': img('signature/iced-coffee/iced-coffee-02-first-pour', 'jpg', [4, 5], 'dark', 'Sequence frame 2: first pour', 'Coffee starting to pour onto the ice'),
  'IL-03': img('signature/iced-coffee/iced-coffee-03-through-ice', 'jpg', [4, 5], 'dark', 'Sequence frame 3: through the ice', 'Coffee running down through the ice cubes'),
  'IL-04': img('signature/iced-coffee/iced-coffee-04-filling', 'jpg', [4, 5], 'dark', 'Sequence frame 4: filling', 'The glass filling with dark coffee'),
  'IL-05': img('signature/iced-coffee/iced-coffee-05-complete', 'jpg', [4, 5], 'dark', 'Sequence frame 5: complete', 'A full glass of iced coffee with a light foam on top'),

  'SLIDE-01': cutout('slider/slide-hot-coffee', [1, 1], 'Slider: hot coffee cut-out', 'Illustrative image: a steaming cup of black coffee on a saucer'),
  'SLIDE-02': cutout('slider/slide-cold-coffee', [1, 2], 'Slider: iced mocha cut-out', 'Illustrative image: an iced mocha with chocolate drizzle in a tall glass'),
  'SLIDE-03': cutout('slider/slide-tea', [1, 2], 'Slider: iced tea cut-out', 'Illustrative image: iced tea with lemon and mint in a tall glass'),
  'SLIDE-04': cutout('slider/slide-mocktail', [1, 2], 'Slider: mint mojito cut-out', 'Illustrative image: a mint mojito with lime and ice in a tall glass'),
  'SLIDE-05': cutout('slider/slide-blue-butterfly', [1, 2], 'Slider: blue butterfly cut-out', 'Illustrative image: a blue mocktail with mint, lime and a blue flower'),

  'PLATE-01': cutout('food/plate-momo', [3, 2], 'Momo tray (top view)', 'Illustrative image: six steamed momos in a paper tray with a red chutney'),
  'PLATE-02': cutout('food/plate-pizza', [1, 1], 'Pizza (top view)', 'Illustrative image: a vegetable pizza with peppers, olives and onion'),
  'PLATE-03': cutout('food/plate-burger', [3, 2], 'Burger tray (top view)', 'Illustrative image: a double patty burger with fries and a dip in a paper tray'),
  'PLATE-04': cutout('food/plate-fried-special', [3, 2], 'Fried special tray (top view)', 'Illustrative image: chicken nuggets, strips and wings in a paper tray'),
  'PLATE-05': cutout('food/plate-fries', [3, 2], 'Fries tray (top view)', 'Illustrative image: seasoned french fries with a dip in a paper tray'),
  'PLATE-06': cutout('food/plate-desserts', [3, 2], 'Brownie tray (top view)', 'Illustrative image: a walnut brownie with chocolate drizzle in a paper tray'),
  'PLATE-07': cutout('food/plate-bread-chaat', [3, 2], 'Garlic bread tray (top view)', 'Illustrative image: cheese garlic bread with fries and a dip in a paper tray'),
  'PLATE-08': cutout('food/plate-wraps', [3, 2], 'Wrap tray (top view)', 'Illustrative image: a grilled chicken wrap cut in half in a paper tray'),
  'PLATE-09': cutout('food/plate-noodles', [1, 1], 'Noodle bowl (top view)', 'Illustrative image: instant-style noodles with vegetables in a paper bowl'),

  'STORY-01': img('story/story-slow-moment', 'jpg', [3, 2], 'light', 'Coffee beside an open book', 'A cup of milky coffee beside an open book on a wooden table in warm sunlight'),
  'STORY-02': img('story/story-coffee-beans', 'jpg', [3, 2], 'dark', 'Roasted beans and coffee cherries', 'Roasted coffee beans beside ripe red coffee cherries and glossy coffee leaves'),

  'MENU-01': menuImg('menu/categories/tea', 'Tea', 'Illustrative image: a cup of spiced tea and a glass of iced tea', ['SLIDE-03']),
  'MENU-02': menuImg('menu/categories/coffee', 'Coffee', 'Illustrative image: a cup of black coffee and a glass of cold coffee', ['SLIDE-02', 'SLIDE-01']),
  'MENU-03': menuImg('menu/categories/momo', 'Momo', 'Illustrative image: steamed and pan-fried momos', ['PLATE-01']),
  'MENU-04': menuImg('menu/categories/bread-chaat', 'Bread & Chaat', 'Illustrative image: cheese garlic bread and corn chaat', ['PLATE-07']),
  'MENU-05': menuImg('menu/categories/burger', 'Burger', 'Illustrative image: a burger on a wooden board', ['PLATE-03']),
  'MENU-06': menuImg('menu/categories/pizza', 'Pizza', 'Illustrative image: a pizza with melted cheese and corn', ['PLATE-02']),
  'MENU-07': menuImg('menu/categories/wraps', 'Wraps', 'Illustrative image: a wrap cut in half', ['PLATE-08']),
  'MENU-08': menuImg('menu/categories/noodles', 'Noodles', 'Illustrative image: a bowl of noodles with vegetables', ['PLATE-09']),
  'MENU-09': menuImg('menu/categories/french-fries', 'French Fries', 'Illustrative image: golden fries in a basket', ['PLATE-05']),
  'MENU-10': menuImg('menu/categories/fried-special', 'Fried Special', 'Illustrative image: assorted fried nuggets and strips', ['PLATE-04']),
  'MENU-11': menuImg('menu/categories/desserts', 'Desserts', 'Illustrative image: a slice of chocolate cake and a muffin', ['PLATE-06']),
  'MENU-12': menuImg('menu/categories/mocktails', 'Mocktails', 'Illustrative image: a mint mojito and a masala cola', ['SLIDE-04', 'SLIDE-05']),

  // Until a wide interior photo is supplied, "The room" shows the real pendant-lamp photo.
  'ATM-01': { ...img('cafe/interior-wide', 'jpg', [3, 2], 'dark', 'Café interior, wide (real photo)', 'The seating area inside Canvas O Coffee'), fallbackTo: ['ATM-05'] },
  'ATM-02': { ...img('cafe/interior-table', 'jpg', [1, 1], 'dark', 'A table at the café (real photo)', 'A table and chairs under three flower paintings at Canvas O Coffee'), fallbackTo: ['STORY-01'] },
  // Until a storefront photo is supplied, the Contact page shows the real wall-art photo.
  'ATM-03': { ...img('cafe/storefront', 'jpg', [3, 2], 'dark', 'Storefront (real photo)', 'The front of Canvas O Coffee'), fallbackTo: ['ATM-06'] },
  'ATM-04': img('cafe/counter', 'jpg', [4, 5], 'dark', 'Counter (real photo)', 'The counter at Canvas O Coffee'),
  'ATM-05': img('cafe/lamps', 'jpg', [2, 3], 'dark', 'Pendant lamps (real photo)', 'Gold pendant lamps glowing above a wooden wall hung with small framed food prints'),
  'ATM-06': img('cafe/wall-art', 'jpg', [16, 9], 'dark', 'Wall of painted faces (real photo)', 'Three colourful abstract face paintings on a grey wall at the café'),

  // Gallery stills taken from the café's own reel (GAL-05 to GAL-09 are open for more real photos).
  'GAL-01': img('gallery/gallery-01', 'jpg', [3, 4], 'dark', 'Gallery: village mural', 'A mural of a dancer in a tall silver headdress in front of thatched village huts'),
  'GAL-02': img('gallery/gallery-02', 'jpg', [9, 16], 'dark', 'Gallery: lamp-lit corner', 'A corner table under a gold pendant lamp, beside the village mural'),
  'GAL-03': img('gallery/gallery-03', 'jpg', [4, 5], 'dark', 'Gallery: blue painted mask', 'Close-up of a painted mask with a blue face and an orange crown'),
  'GAL-04': img('gallery/gallery-04', 'jpg', [4, 5], 'dark', 'Gallery: green painted mask', 'A painted mask with a green face and a black and white crown'),
  'GAL-05': img('gallery/gallery-05', 'jpg', [4, 5], 'dark', 'Gallery: open slot', 'A photo from the café'),
  'GAL-06': img('gallery/gallery-06', 'jpg', [4, 5], 'dark', 'Gallery: open slot', 'A photo from the café'),
  'GAL-07': img('gallery/gallery-07', 'jpg', [4, 5], 'dark', 'Gallery: open slot', 'A photo from the café'),
  'GAL-08': img('gallery/gallery-08', 'jpg', [3, 2], 'dark', 'Gallery: open slot', 'A photo from the café'),
  'GAL-09': img('gallery/gallery-09', 'jpg', [4, 5], 'dark', 'Gallery: open slot', 'A photo from the café'),

  'READ-01': img('reading/reading-corner', 'jpg', [1, 1], 'dark', 'Reading painting (real photo)', 'Paintings on the café wall: a woman reading a book with a cup of coffee, and an iced coffee'),
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
  /** Crop ratio of the asset actually shown (a fallback keeps its own proportions). */
  ratio: [number, number];
}

const generated = manifest as Record<string, ManifestEntry>;

function resolve(id: ImageId, seen = new Set<string>()): ResolvedImage | null {
  if (seen.has(id)) return null;
  seen.add(id);
  const spec: ImageSpec = images[id];
  const entry = generated[spec.file];
  if (entry) return { ...entry, key: spec.file, alt: spec.alt, decorative: Boolean(spec.decorative), cutout: Boolean(spec.cutout), ratio: spec.ratio };
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
  'black-coffee': 'SLIDE-01',
  'peri-peri-french-fry': 'PLATE-05',
  'chicken-wrap': 'PLATE-08',
  'veggie-maggi-noodles': 'PLATE-09',
};
export function itemPhoto(productId: string): ResolvedImage | null {
  const key = `menu/items/${productId}`;
  const own = generated[key];
  if (own) return { ...own, key, alt: '', decorative: false, cutout: Boolean(own.alpha), ratio: [own.width, own.height] };
  const fallback = itemPhotoFallbacks[productId];
  return fallback ? imageFiles(fallback) : null;
}

export const publicPath = (file: string) => `/images/${file}`;
