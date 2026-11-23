# Design system

**Direction:** Heritage luxury × modern technology. A literary coffee house (warm wood, aged
paper, brass) translated into a calm, editorial website. All tokens live in `src/styles/tokens.css`.

## Principles

1. **One bold moment.** The iced-latte sequence is the signature. Everything around it stays quiet.
2. **Typeset, not templated.** The menu reads like a printed café card: serif names, dotted leaders, aligned prices.
3. **The ring.** The "O" of the wordmark, a thin brass ring, is the one recurring motif. It appears in the
   wordmark, ornaments, empty image frames and list markers. Do not add other decorative motifs.
4. **Truthful interface.** Nothing claims success before the server confirms it. Unconnected features say so.
5. **Visual rhythm.** Sections alternate environments rather than repeating one background:
   walnut (hero, signature), parchment (story, occasions), ivory (menu, order), burgundy (reservations).

## Colour

| Token | Hex | Use |
|---|---|---|
| `--burgundy` | #461C25 | Primary actions, headings on light, reservation surface |
| `--walnut` / `--walnut-deep` | #30231D / #231915 | Dark surfaces, footer |
| `--parchment` | #E9DFC9 | Editorial surfaces |
| `--ivory` | #F5EBDD | Main light surface |
| `--ink` | #211D19 | Body text |
| `--brass` | #B08A4B | Accents and decorative lines only. Not for text on light surfaces. |
| `--brass-light` | #D2B47C | Brass-coloured **text** on dark surfaces (meets AA) |
| `--brass-deep` | #7D5F2C | Brass-coloured **text** on light surfaces (meets AA) |
| `--forest` | #243B32 | Supporting accent: success, free delivery, leaves |

Burgundy, parchment, walnut and ivory carry the identity; forest and brass support it.

## Typography

- **Cormorant Garamond** (500/600, self-hosted): headings, menu item names, editorial passages.
- **Jost** (variable, self-hosted): interface, body, forms. Its geometric forms echo interwar café signage.
- Fluid scale `--step--1` … `--step-6`. Body 16–17px. Line length ≤ 36em for prose.
- Prices use lining tabular figures (`.tabular`). Category numbers use lining figures (Cormorant's old-style "1" reads as "I").
- Sentence case everywhere. No all-caps labels.

## Layout

- Container 76rem with fluid gutters (16px minimum on phones). Text and headings are left-aligned.
- Breakpoints: 40rem (640px), 52rem (832px), 64rem (1024px).
- Asymmetric editorial grids (5/6, 1/1.3) rather than equal columns. The menu preview staggers its middle column.
- Radii by hierarchy: controls 3px, panels 6px, chips pill-shaped. Images are square-cornered.

## Components (`src/components`)

| Component | Notes |
|---|---|
| `Button`, `ButtonLink`, `ExternalButton` | Variants: primary (burgundy), brass, secondary (outline), quiet (underlined). `onDark`, `loading`, `disabled`. |
| `TextField`, `TextArea`, `SelectField` | Visible labels, hints, inline errors linked by `aria-describedby`, 16px text to avoid zoom on phones |
| `Dialog` | Native `<dialog>`: focus trap, Escape, focus return, backdrop click. Bottom sheet on phones. |
| `QuantityStepper`, `Price`, `DietMark` | Diet marks are the standard Indian green-dot / brown-triangle symbols |
| `ImageSlot` | Responsive image, or a labelled placeholder of the same ratio until the asset is supplied |
| `Botanical` | Supplied illustration, or a code-drawn coffee sprig |
| `SetupNotice`, `InfoNotice`, `ErrorNotice`, `EmptyState`, toasts | State and feedback |

## Motion

**Smooth, restrained, cinematic, tactile, intentional.** Tokens: `--dur-1` 140ms (feedback),
`--dur-2` 260ms (state), `--dur-3` 620ms (reveal), `--dur-4` 1100ms (hero); easing `--ease-out`.

| Moment | Technique |
|---|---|
| Hero entrance | One staggered load sequence (CSS). The content recedes on scroll via CSS scroll-driven animation where supported. |
| Iced-latte sequence | Sticky frame; five layers cross-fade from one rAF-throttled scroll value, active only while on screen. Skip link provided. Never hijacks scrolling. |
| Section reveals | Only key headings and images (IntersectionObserver, one-shot). Images unveil with a clip-path. |
| Interaction feedback | Hover/press on buttons, count "pop" in the header, toasts, dialog rise, progress bar easing |

Only `transform`, `opacity` and `clip-path` are animated. With `prefers-reduced-motion`, all
durations go to zero and the iced-latte sequence becomes a static five-frame series.

## Accessibility

Semantic landmarks, skip link, visible brass focus rings, labelled forms with announced errors,
accessible dialogs, `aria-live` for search results, toasts and status, alt text in the image registry
(`src/data/images.ts`), decorative art hidden from screen readers, touch targets ≥ 40px.
