/**
 * THE single source of truth for the Canvas O Coffee menu.
 *
 * Every name and price below is exactly as supplied by the owner.
 * Do not "correct" spellings (e.g. "Leaker Tea") without the owner's confirmation.
 * `src/data/menu.test.ts` checks this file against an independent copy of the supplied menu.
 */
import type { AddOn, Category, MenuGroup, Product } from '../types/menu';

export const menuGroups: MenuGroup[] = [
  { id: 'drinks', name: 'Drinks' },
  { id: 'food', name: 'Food' },
  { id: 'mocktails', name: 'Mocktails' },
];

export const categories: Category[] = [
  { id: 'tea', number: 1, name: 'Tea', groupId: 'drinks', imageId: 'MENU-01' },
  { id: 'coffee', number: 2, name: 'Coffee', groupId: 'drinks', imageId: 'MENU-02' },
  { id: 'momo', number: 3, name: 'Momo', groupId: 'food', imageId: 'MENU-03' },
  { id: 'bread-chaat', number: 4, name: 'Bread & Chaat', groupId: 'food', imageId: 'MENU-04' },
  { id: 'burger', number: 5, name: 'Burger', groupId: 'food', imageId: 'MENU-05' },
  { id: 'pizza', number: 6, name: 'Pizza', groupId: 'food', imageId: 'MENU-06' },
  { id: 'wraps', number: 7, name: 'Wraps', groupId: 'food', imageId: 'MENU-07' },
  { id: 'noodles', number: 8, name: 'Noodles', groupId: 'food', imageId: 'MENU-08' },
  { id: 'french-fries', number: 9, name: 'French Fries', groupId: 'food', imageId: 'MENU-09' },
  { id: 'fried-special', number: 10, name: 'Fried Special', groupId: 'food', imageId: 'MENU-10' },
  { id: 'desserts', number: 11, name: 'Desserts', groupId: 'food', imageId: 'MENU-11' },
  { id: 'mocktails', number: 12, name: 'Mocktails', groupId: 'mocktails', imageId: 'MENU-12' },
];

/** Momo preparation order as supplied: Steam / Fried / Pan Fried. */
const momo = (steam: number, fried: number, panFried: number) => [
  { id: 'steam', label: 'Steam', price: steam },
  { id: 'fried', label: 'Fried', price: fried },
  { id: 'pan-fried', label: 'Pan Fried', price: panFried },
];

export const products: Product[] = [
  // 1. Tea
  { id: 'leaker-tea', name: 'Leaker Tea', categoryId: 'tea', diet: null, price: 15 },
  { id: 'green-tea', name: 'Green Tea', categoryId: 'tea', diet: null, price: 20 },
  { id: 'masala-tea', name: 'Masala Tea', categoryId: 'tea', diet: null, price: 20 },
  { id: 'iced-tea', name: 'Iced Tea', categoryId: 'tea', diet: null, price: 50 },

  // 2. Coffee
  { id: 'black-coffee', name: 'Black Coffee', categoryId: 'coffee', diet: null, price: 20 },
  { id: 'regular-coffee', name: 'Regular Coffee', categoryId: 'coffee', diet: null, price: 25 },
  { id: 'cold-coffee', name: 'Cold Coffee', categoryId: 'coffee', diet: null, price: 50 },
  { id: 'iced-mocha', name: 'Iced Mocha', categoryId: 'coffee', diet: null, price: 60 },

  // 3. Momo
  { id: 'veg-momo', name: 'Veg Momo', categoryId: 'momo', diet: 'veg', variants: momo(60, 70, 90) },
  { id: 'himalayan-hot-momo-veg', name: 'Himalayan Hot Momo (Veg)', categoryId: 'momo', diet: 'veg', variants: momo(70, 80, 100) },
  { id: 'chicken-momo', name: 'Chicken Momo', categoryId: 'momo', diet: 'nonveg', variants: momo(70, 80, 100) },
  // Supplied as "₹80 (Fried)" only. No other preparation is assumed.
  { id: 'kurkure-momo-veg', name: 'Kurkure Momo (Veg)', categoryId: 'momo', diet: 'veg', variants: [{ id: 'fried', label: 'Fried', price: 80 }] },

  // 4. Bread & Chaat
  { id: 'cheese-garlic-bread', name: 'Cheese Garlic Bread', categoryId: 'bread-chaat', diet: null, price: 50 },
  { id: 'corn-masala-chaat', name: 'Corn Masala Chaat', categoryId: 'bread-chaat', diet: null, price: 50 },

  // 5. Burger
  { id: 'veg-burger', name: 'Veg Burger', categoryId: 'burger', diet: 'veg', price: 50 },
  { id: 'double-patty-veg-burger', name: 'Double Patty Veg Burger', categoryId: 'burger', diet: 'veg', price: 75 },
  { id: 'chicken-burger', name: 'Chicken Burger', categoryId: 'burger', diet: 'nonveg', price: 70 },
  { id: 'double-patty-chicken-burger', name: 'Double Patty Chicken Burger', categoryId: 'burger', diet: 'nonveg', price: 100 },
  { id: 'chicken-loaded-burger', name: 'Chicken Loaded Burger', categoryId: 'burger', diet: 'nonveg', price: 120 },

  // 6. Pizza
  { id: 'pocket-pizza', name: 'Pocket Pizza', categoryId: 'pizza', diet: null, price: 50 },
  { id: 'veg-pizza', name: 'Veg Pizza', categoryId: 'pizza', diet: 'veg', price: 125 },
  { id: 'cheese-corn-pizza', name: 'Cheese Corn Pizza', categoryId: 'pizza', diet: null, price: 130 },
  { id: 'veg-farmhouse-pizza', name: 'Veg Farmhouse Pizza', categoryId: 'pizza', diet: 'veg', price: 150 },
  { id: 'chicken-pocket-pizza', name: 'Chicken Pocket Pizza', categoryId: 'pizza', diet: 'nonveg', price: 70 },
  { id: 'chicken-pizza', name: 'Chicken Pizza', categoryId: 'pizza', diet: 'nonveg', price: 170 },
  { id: 'chicken-pepperoni-pizza', name: 'Chicken Pepperoni Pizza', categoryId: 'pizza', diet: 'nonveg', price: 200 },
  { id: 'chicken-farmhouse-pizza', name: 'Chicken Farmhouse Pizza', categoryId: 'pizza', diet: 'nonveg', price: 225 },

  // 7. Wraps
  { id: 'veggie-wraps', name: 'Veggie Wraps', categoryId: 'wraps', diet: 'veg', price: 70 },
  { id: 'chicken-wrap', name: 'Chicken Wrap', categoryId: 'wraps', diet: 'nonveg', price: 100 },

  // 8. Noodles
  { id: 'veggie-maggi-noodles', name: 'Veggie Maggi Noodles', categoryId: 'noodles', diet: 'veg', price: 60 },
  { id: 'chicken-maggi-noodles', name: 'Chicken Maggi Noodles', categoryId: 'noodles', diet: 'nonveg', price: 80 },

  // 9. French Fries
  { id: 'salted-french-fry', name: 'Salted French Fry', categoryId: 'french-fries', diet: null, price: 50 },
  { id: 'peri-peri-french-fry', name: 'Peri-Peri French Fry', categoryId: 'french-fries', diet: null, price: 60 },
  { id: 'chicken-loaded-french-fry', name: 'Chicken Loaded French Fry', categoryId: 'french-fries', diet: 'nonveg', price: 120 },

  // 10. Fried Special
  { id: 'cheese-corn-nugget', name: 'Cheese Corn Nugget', portion: '5 pcs', categoryId: 'fried-special', subgroup: 'Vegetarian', diet: 'veg', price: 70 },
  { id: 'chilli-garlic-potato-shot', name: 'Chilli Garlic Potato Shot', portion: '10 pcs', categoryId: 'fried-special', subgroup: 'Vegetarian', diet: 'veg', price: 70 },
  { id: 'veg-finger', name: 'Veg Finger', portion: '5 pcs', categoryId: 'fried-special', subgroup: 'Vegetarian', diet: 'veg', price: 70 },
  { id: 'veg-spring-roll', name: 'Veg Spring Roll', portion: '4 pcs', categoryId: 'fried-special', subgroup: 'Vegetarian', diet: 'veg', price: 80 },
  { id: 'chicken-nugget', name: 'Chicken Nugget', portion: '5 pcs', categoryId: 'fried-special', subgroup: 'Chicken', diet: 'nonveg', price: 90 },
  { id: 'chicken-popcorn', name: 'Chicken Popcorn', categoryId: 'fried-special', subgroup: 'Chicken', diet: 'nonveg', price: 130 },
  { id: 'chicken-strips', name: 'Chicken Strips', portion: '4 pcs', categoryId: 'fried-special', subgroup: 'Chicken', diet: 'nonveg', price: 140 },
  { id: 'chicken-wings', name: 'Chicken Wings', portion: '4 pcs', categoryId: 'fried-special', subgroup: 'Chicken', diet: 'nonveg', price: 150 },
  { id: 'fish-strips', name: 'Fish Strips', portion: '3 pcs', categoryId: 'fried-special', subgroup: 'Fish', diet: 'nonveg', price: 120 },
  { id: 'prawn-butterfly', name: 'Prawn Butterfly', portion: '2 pcs', categoryId: 'fried-special', subgroup: 'Fish', diet: 'nonveg', price: 130 },
  { id: 'kolkata-style-vetki-fry', name: 'Kolkata Style Vetki Fry', portion: '1 pc', categoryId: 'fried-special', subgroup: 'Fish', diet: 'nonveg', price: 150 },

  // 11. Desserts (egg content not stated, so no diet mark)
  { id: 'chocolate-cake', name: 'Chocolate Cake', categoryId: 'desserts', diet: null, price: 80 },
  { id: 'walnut-brownie', name: 'Walnut Brownie', categoryId: 'desserts', diet: null, price: 80 },
  { id: 'blueberry-muffin', name: 'Blueberry Muffin', categoryId: 'desserts', diet: null, price: 80 },
  { id: 'chocochip-muffin', name: 'Chocochip Muffin', categoryId: 'desserts', diet: null, price: 80 },

  // 12. Mocktails
  { id: 'masala-cola', name: 'Masala Cola', categoryId: 'mocktails', diet: null, price: 50 },
  { id: 'mint-mojito', name: 'Mint Mojito', categoryId: 'mocktails', diet: null, price: 50 },
  { id: 'kacha-aam-mojito', name: 'Kacha Aam Mojito', categoryId: 'mocktails', diet: null, price: 50 },
  { id: 'jira-masala-soda', name: 'Jira Masala Soda', categoryId: 'mocktails', diet: null, price: 50 },
  { id: 'fire-mojito', name: 'Fire Mojito', categoryId: 'mocktails', diet: null, price: 50 },
  { id: 'blue-butterfly', name: 'Blue Butterfly', categoryId: 'mocktails', diet: null, price: 60 },
];

/**
 * Add-ons are kept separate from ordinary products. Each is listed inside one category
 * on the supplied menu and is offered for that category's products.
 */
export const addOns: AddOn[] = [
  { id: 'cheese-slice', name: 'Cheese Slice Add-on', price: 20, categoryId: 'burger' },
  { id: 'cheese', name: 'Cheese Add-on', price: 25, categoryId: 'pizza' },
];

// ---------- lookups ----------

const productIndex = new Map(products.map((p) => [p.id, p]));
const categoryIndex = new Map(categories.map((c) => [c.id, c]));
const addOnIndex = new Map(addOns.map((a) => [a.id, a]));

export const getProduct = (id: string) => productIndex.get(id);
export const getCategory = (id: string) => categoryIndex.get(id);
export const getAddOn = (id: string) => addOnIndex.get(id);

export const productsInCategory = (categoryId: string) =>
  products.filter((p) => p.categoryId === categoryId);

export const categoriesInGroup = (groupId: string) =>
  categories.filter((c) => c.groupId === groupId);

export const addOnsForProduct = (product: Product) =>
  addOns.filter((a) => a.categoryId === product.categoryId);

/** Name with the supplied portion note, e.g. "Veg Finger (5 pcs)". */
export const fullName = (p: Product) => (p.portion ? `${p.name} (${p.portion})` : p.name);

/** Lowest price a product can be ordered at. */
export const fromPrice = (p: Product) =>
  p.variants ? Math.min(...p.variants.map((v) => v.price)) : (p.price as number);

/** True when the visitor must make a choice before adding (variants or add-ons). */
export const needsChoices = (p: Product) =>
  (p.variants?.length ?? 0) > 1 || addOnsForProduct(p).length > 0;
