/**
 * Customer reviews from the café's Google listing, supplied by the owner.
 *
 * Rules (checked by reviews.test.ts):
 *  - Names and wording are exactly as written by the customer: no edits, no "corrections".
 *  - Replies by the café are not included. Ratings-only entries (no text) are not included.
 *  - Very short reviews ("Well done.", "Everything is A1.", "Good.") were removed at the owner's request.
 *  - `rating` is the reviewer's own Google star rating, set ONLY once verified on Google.
 *    `null` means not verified, and no stars are shown for that review.
 */
export interface Review {
  name: string;
  text: string;
  /** Reviewer's own Google rating (1–5), or null if not verified. */
  rating: 1 | 2 | 3 | 4 | 5 | null;
}

/** Overall Google rating, as supplied by the owner. Kept separate from individual ratings. */
export const overallRating = { value: 4.7, outOf: 5, source: 'Google' } as const;

export const reviews: Review[] = [
  { name: 'Ashish Murmu', text: 'Loved the ambience as well as the food quality. Totally value for money.', rating: null },
  {
    name: 'ARIJIT PATRA',
    text: 'The restaurant is beautifully designed, clean, and well-organized. I really enjoyed the overall atmosphere—it feels warm and welcoming. One of its biggest advantages is that the prices are very budget-friendly.',
    rating: null,
  },
  { name: 'Gobinda Murmu', text: 'Nice ambience, Great food, Great Service.', rating: null },
  { name: 'Indrajit Sarkar', text: 'Good vibe, stuff are so friendly. One of the best cafe I have visited.', rating: null },
  { name: 'Swarup Dandapat', text: 'Great ambiance, Great Food. will visit again 😃', rating: null },
  { name: 'Tathagata Kundu', text: 'Atmosphere is photogenic but sorry to say my food was below expectations.', rating: null },
  { name: 'Arindam Adhikary', text: 'Awesome Resturent. Awesome Staff Behiviour.', rating: null },
  { name: 'Surajit Mahata', text: 'Highly Recommend. Must visit with family.', rating: null },
];
