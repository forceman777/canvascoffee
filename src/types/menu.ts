import type { ImageId } from '../data/images';

export type MenuGroupId = 'drinks' | 'food' | 'mocktails';

/**
 * Diet marking. Only set where the supplied menu makes it explicit
 * (Veg / Veggie / "Vegetarian" sub-group → veg; Chicken / Fish / Prawn / Vetki → non-veg).
 * `null` means "not stated by the café" and no mark is shown.
 */
export type Diet = 'veg' | 'nonveg' | null;

export interface Variant {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  /** Stable slug, also used as the optional photo filename (menu/items/{id}.jpg). */
  id: string;
  /** Name exactly as supplied, without the portion note. */
  name: string;
  /** Portion note exactly as supplied, e.g. "5 pcs". */
  portion?: string;
  categoryId: string;
  /** Sub-group inside a category as supplied (Fried Special: Vegetarian / Chicken / Fish). */
  subgroup?: string;
  diet: Diet;
  /** Single price. Mutually exclusive with `variants`. */
  price?: number;
  /** Preparation options with their own prices, in supplied order. */
  variants?: Variant[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  /** Category whose products the add-on applies to (it is listed inside that category). */
  categoryId: string;
}

export interface Category {
  id: string;
  /** Number as printed on the supplied menu. */
  number: number;
  name: string;
  groupId: MenuGroupId;
  /** Image registry id for the category image. */
  imageId: ImageId;
}

export interface MenuGroup {
  id: MenuGroupId;
  name: string;
}
