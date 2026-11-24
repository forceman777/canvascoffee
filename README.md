# Canvas O Coffee

Website for Canvas O Coffee, Belda, West Bengal: heritage luxury × modern technology.
React + TypeScript + Vite, with an optional Supabase backend and WhatsApp hand-off.

## Run it locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev          # http://localhost:5173
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Production build into `dist/` (runs the image pipeline and a type check first) |
| `npm run preview` | Serves the production build at http://localhost:4173 |
| `npm test` | Unit tests: every menu item and price, cart, ₹500 delivery boundary, validation, WhatsApp text |
| `npm run qa` | Browser tests of the real flows (menu, cart, checkout, reservations, WhatsApp, mocked backend) |
| `npm run images` | Converts supplied images in `assets-src/images/` into responsive files |
| `npm run db:seed` | Regenerates `supabase/seed.sql` from the menu |

## Where things live

| To change… | Edit |
|---|---|
| Address, phone, hours, socials, delivery area | `src/config/site.ts` |
| Menu items and prices (single source of truth) | `src/data/menu.ts`, then `npm run db:seed` |
| Story, Reading Corner and other copy | `src/data/siteContent.ts` |
| Images | Drop files into `assets-src/images/…` (see below) |
| Colours, type, spacing, motion | `src/styles/tokens.css` |

## Adding the real images

1. Name each file exactly as listed in [`docs/IMAGE_ASSET_REQUIREMENTS.md`](docs/IMAGE_ASSET_REQUIREMENTS.md)
   (JPG, PNG or WebP; transparent cut-outs as PNG or WebP; videos as MP4 and/or WebM),
   e.g. `assets-src/images/hero/hero-coffee-desktop.jpg`.
2. Run `npm run dev` or `npm run build`. The pipeline converts the image and the placeholder is replaced
   automatically. No code changes are needed.

Until an image exists, the site shows a labelled placeholder of the right shape (asset ID, filename, ratio).

## Going live

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): hosting, WhatsApp number, Supabase setup and the
launch checklist (including switching `previewMode` off).

## Documentation

- [Deployment and backend setup](docs/DEPLOYMENT.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Image asset requirements](docs/IMAGE_ASSET_REQUIREMENTS.md)
- [Implementation plan and status](docs/IMPLEMENTATION_PLAN.md)
