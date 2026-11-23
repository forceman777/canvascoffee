import { describe, expect, it } from 'vitest';
import { addOns, categories, fullName, getCategory, products } from './menu';

/**
 * Independent copy of the menu exactly as supplied by the owner.
 * Format: [category number, category name, display name, price or "steam/fried/panFried"].
 */
const supplied: Array<[number, string, string, string]> = [
  [1, 'Tea', 'Leaker Tea', '15'],
  [1, 'Tea', 'Green Tea', '20'],
  [1, 'Tea', 'Masala Tea', '20'],
  [1, 'Tea', 'Iced Tea', '50'],
  [2, 'Coffee', 'Black Coffee', '20'],
  [2, 'Coffee', 'Regular Coffee', '25'],
  [2, 'Coffee', 'Cold Coffee', '50'],
  [2, 'Coffee', 'Iced Mocha', '60'],
  [3, 'Momo', 'Veg Momo', '60/70/90'],
  [3, 'Momo', 'Himalayan Hot Momo (Veg)', '70/80/100'],
  [3, 'Momo', 'Chicken Momo', '70/80/100'],
  [3, 'Momo', 'Kurkure Momo (Veg)', 'fried:80'],
  [4, 'Bread & Chaat', 'Cheese Garlic Bread', '50'],
  [4, 'Bread & Chaat', 'Corn Masala Chaat', '50'],
  [5, 'Burger', 'Veg Burger', '50'],
  [5, 'Burger', 'Double Patty Veg Burger', '75'],
  [5, 'Burger', 'Chicken Burger', '70'],
  [5, 'Burger', 'Double Patty Chicken Burger', '100'],
  [5, 'Burger', 'Chicken Loaded Burger', '120'],
  [6, 'Pizza', 'Pocket Pizza', '50'],
  [6, 'Pizza', 'Veg Pizza', '125'],
  [6, 'Pizza', 'Cheese Corn Pizza', '130'],
  [6, 'Pizza', 'Veg Farmhouse Pizza', '150'],
  [6, 'Pizza', 'Chicken Pocket Pizza', '70'],
  [6, 'Pizza', 'Chicken Pizza', '170'],
  [6, 'Pizza', 'Chicken Pepperoni Pizza', '200'],
  [6, 'Pizza', 'Chicken Farmhouse Pizza', '225'],
  [7, 'Wraps', 'Veggie Wraps', '70'],
  [7, 'Wraps', 'Chicken Wrap', '100'],
  [8, 'Noodles', 'Veggie Maggi Noodles', '60'],
  [8, 'Noodles', 'Chicken Maggi Noodles', '80'],
  [9, 'French Fries', 'Salted French Fry', '50'],
  [9, 'French Fries', 'Peri-Peri French Fry', '60'],
  [9, 'French Fries', 'Chicken Loaded French Fry', '120'],
  [10, 'Fried Special', 'Cheese Corn Nugget (5 pcs)', '70'],
  [10, 'Fried Special', 'Chilli Garlic Potato Shot (10 pcs)', '70'],
  [10, 'Fried Special', 'Veg Finger (5 pcs)', '70'],
  [10, 'Fried Special', 'Veg Spring Roll (4 pcs)', '80'],
  [10, 'Fried Special', 'Chicken Nugget (5 pcs)', '90'],
  [10, 'Fried Special', 'Chicken Popcorn', '130'],
  [10, 'Fried Special', 'Chicken Strips (4 pcs)', '140'],
  [10, 'Fried Special', 'Chicken Wings (4 pcs)', '150'],
  [10, 'Fried Special', 'Fish Strips (3 pcs)', '120'],
  [10, 'Fried Special', 'Prawn Butterfly (2 pcs)', '130'],
  [10, 'Fried Special', 'Kolkata Style Vetki Fry (1 pc)', '150'],
  [11, 'Desserts', 'Chocolate Cake', '80'],
  [11, 'Desserts', 'Walnut Brownie', '80'],
  [11, 'Desserts', 'Blueberry Muffin', '80'],
  [11, 'Desserts', 'Chocochip Muffin', '80'],
  [12, 'Mocktails', 'Masala Cola', '50'],
  [12, 'Mocktails', 'Mint Mojito', '50'],
  [12, 'Mocktails', 'Kacha Aam Mojito', '50'],
  [12, 'Mocktails', 'Jira Masala Soda', '50'],
  [12, 'Mocktails', 'Fire Mojito', '50'],
  [12, 'Mocktails', 'Blue Butterfly', '60'],
];

function describe_(p: (typeof products)[number]): string {
  if (!p.variants) return String(p.price);
  if (p.variants.length === 1) return `${p.variants[0].id}:${p.variants[0].price}`;
  return p.variants.map((v) => v.price).join('/');
}

describe('menu data matches the supplied menu exactly', () => {
  it('has every supplied product, in order, with exact names, categories and prices', () => {
    const actual = products.map((p) => {
      const c = getCategory(p.categoryId)!;
      return [c.number, c.name, fullName(p), describe_(p)];
    });
    expect(actual).toEqual(supplied);
  });

  it('has 55 products and 12 categories', () => {
    expect(products).toHaveLength(55);
    expect(categories.map((c) => c.name)).toEqual([
      'Tea', 'Coffee', 'Momo', 'Bread & Chaat', 'Burger', 'Pizza', 'Wraps', 'Noodles',
      'French Fries', 'Fried Special', 'Desserts', 'Mocktails',
    ]);
  });

  it('keeps momo preparations in the supplied order Steam / Fried / Pan Fried', () => {
    for (const id of ['veg-momo', 'himalayan-hot-momo-veg', 'chicken-momo']) {
      const p = products.find((x) => x.id === id)!;
      expect(p.variants!.map((v) => v.label)).toEqual(['Steam', 'Fried', 'Pan Fried']);
    }
  });

  it('gives Kurkure Momo only the supplied Fried option', () => {
    const p = products.find((x) => x.id === 'kurkure-momo-veg')!;
    expect(p.variants).toEqual([{ id: 'fried', label: 'Fried', price: 80 }]);
  });

  it('keeps add-ons separate from products', () => {
    expect(addOns).toEqual([
      { id: 'cheese-slice', name: 'Cheese Slice Add-on', price: 20, categoryId: 'burger' },
      { id: 'cheese', name: 'Cheese Add-on', price: 25, categoryId: 'pizza' },
    ]);
    expect(products.some((p) => /add-on/i.test(p.name))).toBe(false);
  });

  it('has unique product ids', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  });

  it('only marks diet where the supplied name or sub-group states it', () => {
    for (const p of products) {
      const n = fullName(p);
      if (p.diet === 'veg') expect(/\bveg|veggie/i.test(n) || p.subgroup === 'Vegetarian').toBe(true);
      if (p.diet === 'nonveg') expect(/chicken|fish|prawn|vetki/i.test(n)).toBe(true);
    }
    expect(products.filter((p) => p.categoryId === 'desserts').every((p) => p.diet === null)).toBe(true);
  });
});
