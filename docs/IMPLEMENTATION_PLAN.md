# Canvas O Coffee: Implementation Plan and Status

Status: **Website built. All phases complete except the items waiting on the owner (§5).**
Last updated: 2026-11-23

## 1. Architecture (as built)

| Concern | Decision |
|---|---|
| Framework | React 18 + TypeScript (strict) + Vite 5 |
| Routing | React Router 6 data router; Home in the main bundle, other pages lazy-loaded |
| Styling | Plain CSS with design tokens (`src/styles/tokens.css`) and namespaced component classes. No CSS framework. |
| Fonts | Cormorant Garamond + Jost, self-hosted via Fontsource (no third-party requests) |
| Icons | lucide-react |
| Motion | CSS transitions/keyframes, IntersectionObserver reveals, one rAF scroll value for the iced latte. No animation library. |
| State | Cart: pure reducer (`src/state/cart.ts`) + context, persisted to localStorage (guarded) |
| Validation | Hand-written validators shared by forms and services, repeated in the database |
| Backend | Supabase via REST RPC (no SDK). SECURITY DEFINER functions, RLS on, server-side pricing |
| WhatsApp | `wa.me` hand-off with a pre-filled message. Never treated as a confirmation. |
| Images | `assets-src/images` → `npm run images` (sharp) → responsive WebP + fallback + manifest |
| Tests | Vitest (49), Playwright end-to-end (85 checks, 3 builds), axe accessibility, SQL checks on real PostgreSQL |

## 2. Site map

| Route | Contents |
|---|---|
| `/` | Cinematic video hero · "From our kitchen" food showcase · coffee slider · menu preview · reservation invitation · visit |
| `/story` | Story chapters · iced-latte sequence · cherry-to-bean botanical feature · the room · **Reading Corner** |
| `/menu` | Full menu: contents index (desktop), sticky category chips (mobile), scroll-spy, search, product dialog |
| `/order` | Cart → delivery details → review → submit (backend and/or WhatsApp) · order status lookup |
| `/reservations` | Table request (request → review → submit) · **Occasion enquiry** |
| `/gallery` | The café reel and real photos in a masonry layout with lightbox. Real photos only. |
| `/contact` | Address, hours, phone, email, map, WhatsApp · **Whisper Box** |
| `*` | Not-found page |

## 3. Master-prompt coverage (17 parts)

| # | Part | Where |
|---|---|---|
| 01 | Architecture | Repo structure, `README.md` |
| 02 | Brand identity | Tokens, wordmark, `docs/DESIGN_SYSTEM.md` |
| 03 | Design system | `src/styles/*`, `src/components/common/*` |
| 04 | Navigation | `src/components/navigation/Header.tsx` (desktop + mobile sheet), footer, mobile order bar |
| 05 | Homepage | `src/pages/Home.tsx` |
| 06 | Our Story | `src/pages/Story.tsx`, copy in `src/data/siteContent.ts` |
| 07 | Signature iced latte + botanical | `src/components/motion/IcedLatteSequence.tsx`, `LatteArt.tsx`, `common/Botanical.tsx` |
| 08 | Complete menu | `src/data/menu.ts` (55 products, 2 add-ons, verified by `menu.test.ts`) |
| 09 | Product details | `src/components/menu/ProductDialog.tsx` |
| 10 | Cart & delivery | `src/state/cart.ts`, `src/utils/pricing.ts`, `src/pages/Order.tsx` |
| 11 | Checkout & payment architecture | `src/pages/Order.tsx`, `src/services/*`, `supabase/migrations` |
| 12 | Reservations | `src/components/booking/ReservationForm.tsx` |
| 13 | Occasion enquiry | `src/components/booking/OccasionForm.tsx` |
| 14 | Gallery | `src/pages/Gallery.tsx` |
| 15 | Whisper Box & Reading Corner | `src/components/engagement/WhisperBox.tsx`, Story page |
| 16 | Backend & security | `supabase/migrations/0001_init.sql`, `supabase/tests/rpc_checks.sql` |
| 17 | QA & deployment | `scripts/qa.mjs`, `scripts/screens.mjs`, `docs/DEPLOYMENT.md` |

## 4. Decisions made (reversible, documented)

1. **Orders:** submitted as *Pending: awaiting café confirmation* (Supabase) and/or handed to WhatsApp.
   Payment is arranged with the café on confirmation. No gateway, no simulated payment.
2. **Veg / non-veg marks** only where the supplied name or sub-group states it. Desserts, drinks,
   fries, chaat and some pizzas show no mark until confirmed.
3. **Add-ons** apply to the category they are listed in (Cheese Slice to burgers, Cheese to pizzas), once per unit.
4. **Kurkure Momo** is offered as Fried only, as supplied. Other momos: Steam / Fried / Pan Fried.
5. **Portions** ("5 pcs") are stored separately from the name and displayed exactly as supplied.
6. **Iced latte** is brand storytelling only, with no order button (it is not on the supplied menu).
7. **Menu category images** are labelled "Illustrative image" (toggle: `menuImagesAreIllustrative`).
8. **Reservations:** 1–10 guests, up to 60 days ahead (editable in `site.ts`). Larger groups go to the occasion enquiry.
9. **Gallery** stays in the navigation with clearly labelled frames. Only real photos fill them.
10. **Preview mode** (`previewMode` in `site.ts`) shows placeholder labels and owner setup hints. Turn it off at launch.
12. **Homepage redesign (owner request):** hero pour, coffee slider and food showcase are drawn in code (canvas/SVG), tied to real menu items, with optional video/photo slots. The reference videos supplied were used for direction only and are not embedded. The iced-latte sequence moved to Our Story.
13. **Real media (owner-supplied):** the homepage uses the supplied pour video and product photos. Sections switch to
    photos automatically once enough are supplied (slider: 2+, kitchen: 3+) and never mix drawings with photos.
    Menu category images fall back to the matching product photo; item thumbnails appear only where a photo shows
    exactly that item. All are labelled illustrative; trays with sides carry "sides and dips may not be included".
14. **Real café media (owner-supplied):** real photos replace stand-ins wherever a real place is shown (table, room,
    Reading Corner, Contact, Gallery). The owner's reel was edited only for the web (flash removed, seamless loop,
    no audio) and loads lazily. Gallery stills were taken from the reel's sharpest frames; the gallery shows only
    real photographs, never generated images. Crops removed a brand-logo fan, wiring and an inverter box.
15. **Signature sequence:** built from five frames of the hero pour video, so it shows an iced coffee (glass of ice,
    pour, filling, finished) rather than an iced latte; no milk footage was supplied. It remains brand storytelling
    with no order button. No storefront photo exists, so Contact keeps the real wall-art photo.
11. **Copy** is neutral draft text with no founders, dates, sourcing, awards or quotations (`src/data/siteContent.ts`).

## 5. Waiting on the owner

| Item | Where it goes |
|---|---|
| Official WhatsApp number | `VITE_WHATSAPP_NUMBER` |
| Supabase project (optional) | `docs/DEPLOYMENT.md` §3 |
| Address, phone, email, hours, map link, socials, delivery area | `src/config/site.ts` |
| Logo (if one exists) | `assets-src/images/brand/logo.svg` or `logo.png`: replaces the wordmark automatically |
| Images | `docs/IMAGE_ASSET_REQUIREMENTS.md` |
| Confirm "Leaker Tea" spelling and the diet of unmarked items | `src/data/menu.ts` |
| Verified story copy and Reading Corner picks | `src/data/siteContent.ts` |
