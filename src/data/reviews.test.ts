import { describe, expect, it } from 'vitest';
import { overallRating, reviews } from './reviews';

/** Independent copy of the reviews exactly as supplied by the owner. */
const supplied: Array<[string, string]> = [
  ['Ashish Murmu', 'Loved the ambience as well as the food quality. Totally value for money.'],
  ['ARIJIT PATRA', 'The restaurant is beautifully designed, clean, and well-organized. I really enjoyed the overall atmosphere—it feels warm and welcoming. One of its biggest advantages is that the prices are very budget-friendly.'],
  ['Gobinda Murmu', 'Nice ambience, Great food, Great Service.'],
  ['Indrajit Sarkar', 'Good vibe, stuff are so friendly. One of the best cafe I have visited.'],
  ['Swarup Dandapat', 'Great ambiance, Great Food. will visit again 😃'],
  ['Tathagata Kundu', 'Atmosphere is photogenic but sorry to say my food was below expectations.'],
  ['Arindam Adhikary', 'Awesome Resturent. Awesome Staff Behiviour.'],
  ['Surajit Mahata', 'Highly Recommend. Must visit with family.'],
];

describe('customer reviews', () => {
  it('match the supplied names and wording exactly, in order', () => {
    expect(reviews.map((r) => [r.name, r.text])).toEqual(supplied);
  });
  it('every review has written text', () => {
    expect(reviews.every((r) => r.text.trim().length > 0)).toBe(true);
  });
  it('no individual star ratings are assumed', () => {
    expect(reviews.every((r) => r.rating === null)).toBe(true);
  });
  it('keeps the overall rating separate', () => {
    expect(overallRating).toEqual({ value: 4.7, outOf: 5, source: 'Google' });
  });
});
