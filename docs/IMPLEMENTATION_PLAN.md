# Canvas O Coffee: Implementation Plan

Status: **Phase 1 (Inspect and plan): complete, awaiting review**
Last updated: 2026-11-23

---

## 1. Repository inspection result

| Item | Finding |
|---|---|
| Commits | None. The branch had no history. |
| Source files | None |
| Dependencies / config | None (no `package.json`, no build config) |
| Image or brand assets | None. No logo, photographs, illustrations or fonts were found. |
| Existing work to preserve | None |

Conclusion: this is a greenfield build. Every visual asset must be supplied (see
[`IMAGE_ASSET_REQUIREMENTS.md`](./IMAGE_ASSET_REQUIREMENTS.md)). Business facts must come
from the owner (see §6).

Toolchain available: Node 22, npm 10, Chromium + Playwright (for screenshot QA).

---

## 2. Technology decisions

| Concern | Decision | Reason |
|---|---|---|
| Framework | React 18 + TypeScript + Vite | As specified; fast and familiar to other developers |
| Routing | React Router | Multi-page site with shareable URLs |
| Styling | Plain modern CSS: design tokens as CSS custom properties, CSS Modules per component | No utility-framework lock-in. Tokens map 1:1 to the brand guide. |
| Icons | `lucide-react` | Consistent, tree-shakeable |
| Motion | In-house `useReveal` hook (IntersectionObserver) + CSS transitions; scroll-linked iced-latte driven by one rAF-throttled progress value | No heavy animation library needed. Transform and opacity only. |
| Cart state | React context + `useReducer`, persisted to `localStorage` (try/catch guarded) | Small, testable, no extra dependency |
| Validation | `zod` schemas shared by forms and the service layer | Same rules on the client and before backend submission |
| Backend | Supabase (Postgres + RLS + RPC functions), free tier | The server recomputes totals and never trusts client prices |
| Images | Masters in `assets-src/images/`; a `sharp` script generates responsive AVIF/WebP into `public/images/` at build | Keeps shipped files small; one place to drop supplied files |
| Testing | Vitest (cart, pricing, delivery fee, validation); Playwright screenshots at 390 / 834 / 1440 px | The ₹500 boundary and menu accuracy are tested automatically |
| Hosting | Static hosting with a free tier (Vercel, Netlify or Cloudflare Pages) | Zero cost to start |

Money is held as integer rupees (all supplied prices are whole rupees). Delivery fee is
exactly `subtotal > 500 ? 0 : 25`, implemented once in `src/utils/pricing.ts` and mirrored in
the database function.

---

## 3. Site map

| Route | Contents | Visual environment |
|---|---|---|
| `/` Home | Hero → story teaser → Signature iced-latte sequence → menu preview (Drinks / Food / Mocktails) → reservation invitation → visit info | Dark burgundy / walnut, then alternating |
| `/story` Our Story | Editorial narrative, coffee cherry-to-bean botanical feature, **Reading Corner** | Parchment, editorial |
| `/menu` Menu | Full digital menu: group/category nav, search, veg/non-veg marks, product panel, add to cart | Ivory / parchment |
| `/order` Order | Cart, delivery fee, checkout form, review, truthful submission state | Clean modern UI in brand language |
| `/reservations` | Table reservation request + **Occasion enquiry** (secondary) | Burgundy, parchment, brass |
| `/gallery` | Editorial grid + lightbox (**real café photos only**; hidden from nav until supplied) | Photography-led |
| `/contact` | Owner-supplied address, hours, contact, map link + **Whisper Box** | Walnut |

Cart access stays visible on every page through a header button and, on mobile, a compact cart bar.

---

## 4. Mapping of the 17 master-prompt parts

| # | Part | Where it lands | Image-dependent? |
|---|---|---|---|
| 01 | Initialisation & architecture | Repo scaffold, folders, tooling | No |
| 02 | Brand identity | `docs/BRAND_GUIDELINES.md`, tokens | Partly (logo) |
| 03 | Design system & components | `src/styles/tokens.css`, `src/components/common` | No |
| 04 | Navigation | `src/components/navigation` | No (logo optional) |
| 05 | Homepage | `src/pages/Home.tsx` | **Yes** |
| 06 | Our Story | `src/pages/Story.tsx` | **Yes** |
| 07 | Signature iced-latte + botanical | `src/components/motion/IcedLatteSequence.tsx` | **Yes** |
| 08 | Complete digital menu | `src/data/menu.ts`, `src/pages/Menu.tsx` | Data: no. Presentation: partly |
| 09 | Menu experience / product details | `src/components/menu` | No |
| 10 | Ordering & cart | `src/components/ordering`, `src/utils/pricing.ts` | No |
| 11 | Checkout & payment architecture | `src/pages/Order.tsx`, `src/services/orders.ts` | No |
| 12 | Table reservations | `src/pages/Reservations.tsx`, `src/services/reservations.ts` | Partly |
| 13 | Occasion enquiry | Reservations page, secondary section | No |
| 14 | Gallery | `src/pages/Gallery.tsx` | **Yes (real photos)** |
| 15 | Whisper Box & Reading Corner | Contact page / Story page | Reading Corner: yes |
| 16 | Backend, database, security | `supabase/` migrations, RLS, RPC, `.env.example` | No |
| 17 | QA, performance, a11y, deployment | Tests, screenshots, `docs/DEPLOYMENT.md` | No |

---

## 5. Phase checklist

### Phase 1: Inspect and plan ✅
- [x] Inspect repository (empty)
- [x] Choose architecture and technologies
- [x] Write this plan
- [x] Image asset requirements audit (`docs/IMAGE_ASSET_REQUIREMENTS.md`)
- [x] Create asset drop folders (`assets-src/images/**`)
- [x] List missing business information and decisions needing approval

### Phase 2: Design foundation (not image-dependent, can start on approval)
- [ ] Vite + React + TS scaffold, lint, Vitest
- [ ] `docs/BRAND_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, `docs/MOTION_GUIDELINES.md`
- [ ] Tokens: colour, type scale, spacing, containers, radii, shadows, breakpoints, motion
- [ ] Components: Button, Link, SectionHeading, ImageFrame, PriceLabel, QuantityStepper, Input/Select/Textarea, Modal, Toast, Spinner, EmptyState, ConfirmationState
- [ ] Image pipeline script plus a typed image manifest with graceful "awaiting asset" placeholders
- [ ] Navigation (desktop + mobile), footer shell

### Phase 3: Public website (image-dependent, **blocked on your approval and assets**)
- [ ] Homepage hero and scroll transitions
- [ ] Our Story
- [ ] Signature iced-latte sequence + reduced-motion fallback
- [ ] Menu presentation
- [ ] Gallery, Reading Corner, Contact

### Phase 4: Business functionality (not image-dependent)
- [ ] `src/data/menu.ts`: all 55 products + 2 add-ons, exact names and prices, Momo variants
- [ ] Menu search, category nav, product panel, variants, add-ons, quantity
- [ ] Cart, delivery fee, persistence, empty state
- [ ] Checkout validation, review, truthful submission states
- [ ] Reservation request, occasion enquiry, Whisper Box

### Phase 5: Backend integration
- [ ] Supabase schema, RLS (anonymous insert-only, no anonymous reads of customer data)
- [ ] `place_order` RPC: recompute prices server-side from `menu_products`
- [ ] Rate limiting / honeypot spam protection
- [ ] "Backend not configured" safe fallback (actions disabled with a clear notice)

### Phase 6: QA
- [ ] Unit tests: every price, Momo variants, add-ons, ₹500 / ₹501 boundary
- [ ] Screenshots at mobile / tablet / desktop for every route; fix defects
- [ ] Keyboard, focus, contrast, reduced-motion, alt text
- [ ] Image weight and layout-shift checks

### Phase 7: Delivery
- [ ] README, `docs/DEPLOYMENT.md`, `docs/DATABASE_SCHEMA.md`, `docs/BOOKING_FLOW.md`, `docs/ORDERING_FLOW.md`, `docs/MENU_DATA.md`
- [ ] Honest status report of configured and unconfigured integrations

---

## 6. Missing business information (owner must supply; nothing will be invented)

| Needed for | Information |
|---|---|
| Footer, Contact | Full street address in Belda, phone, WhatsApp (if used), email, opening hours, map link |
| Brand | Official logo (vector preferred). If none, a typographic wordmark is built in code. |
| Ordering | Is delivery offered? Delivery area/radius. Minimum order (if any). Accepted payment methods (cash / UPI on delivery?). Order-taking hours. |
| Reservations | Booking hours, maximum party size, how much notice is needed, how the café confirms (call / WhatsApp / SMS) |
| Occasion enquiry | Whether group/celebration enquiries are accepted at all |
| Menu | Veg / non-veg status of items whose names don't say (e.g. desserts may contain egg; pizzas, fries, chaat, drinks). Confirm "Leaker Tea" spelling. Item availability. |
| Story | Verified story copy. Until then, clearly editable neutral copy without factual claims. |
| Legal | Privacy notice contact; FSSAI licence number if they wish to display it |

---

## 7. Decisions requiring your approval

1. **Payment / order handling.** No payment gateway is configured, and gateways such as
   Razorpay need business KYC. Recommended start: orders are submitted to Supabase as
   **"Pending — awaiting café confirmation"**, with payment collected on delivery by the café.
   Alternative: a WhatsApp hand-off that opens WhatsApp with the order pre-filled, which needs
   the café's number. No fake payment success is ever shown.
2. **Veg / non-veg indicators.** Shown **only** where the supplied name makes it explicit
   (Veg / Veggie / "Vegetarian" group → veg; Chicken / Fish / Prawn / Vetki → non-veg).
   All other items show no mark until the owner confirms.
3. **Generated food imagery.** Menu category images may be AI-generated as *illustrative*
   images with a small "Images are illustrative" note, then replaced by real photos later.
   The alternative is a purely typographic menu until real photos exist.
4. **Botanical style.** Recommended: vintage hand-coloured botanical-plate illustration,
   not a photo cut-out (details in the asset document).
5. **The iced latte is not on the supplied menu.** The sequence will be presented as brand
   storytelling with **no "order this" button**, unless the owner adds the item and gives a price.
6. **Placement of optional features.** Reading Corner goes on Our Story, Whisper Box on
   Contact, and Occasion enquiry on Reservations.
7. **Gallery visibility.** The gallery stays out of the navigation until real café photos are
   supplied, so it is never filled with generated images.
