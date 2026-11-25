# Deployment and backend setup

The site is a static single-page app. It works with **no backend at all**: every page,
the full menu, the cart and price calculations run in the browser. Sending orders,
table requests, enquiries and Whisper Box notes needs **at least one** of:

| Channel | Enables | Cost | Setup time |
|---|---|---|---|
| **WhatsApp number** | Orders, table requests, occasion enquiries (opens WhatsApp with the message written out) | Free | 2 minutes |
| **Supabase** | All of the above saved in a database, order status lookup, Whisper Box | Free tier | ~20 minutes |

Until one is configured, those buttons are disabled and the page says so. Nothing pretends to send.

---

## 1. Host the website (free)

Any static host works. Recommended: **Vercel**, **Netlify** or **Cloudflare Pages**.

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18 or newer
- SPA routing is already configured (`vercel.json` for Vercel, `public/_redirects` for Netlify/Cloudflare).

Add environment variables (below) in the host's project settings, then redeploy.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local work. Set the same names on the host.

| Variable | Example shape | Required for |
|---|---|---|
| `VITE_WHATSAPP_NUMBER` | `91XXXXXXXXXX` (country code + number, digits only) | WhatsApp hand-off |
| `VITE_SUPABASE_URL` | `https://abcd1234.supabase.co` | Database submissions |
| `VITE_SUPABASE_ANON_KEY` | the **anon / public** key | Database submissions |

`VITE_` variables are built into the public website. That is fine for these three: the anon key is
designed to be public and the database is protected by row-level security. **Never** put the
Supabase `service_role` key in any variable, file or code in this project.

## 3. Supabase setup (optional, recommended)

1. Create a free project at supabase.com. Choose the Mumbai (ap-south-1) region for India.
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`.
3. Still in SQL Editor, run `supabase/seed.sql` (the menu with prices, generated from `src/data/menu.ts`).
4. Optional check: run `supabase/tests/rpc_checks.sql`. It should end with *ALL DATABASE CHECKS PASSED*.
   It inserts test rows, so delete them afterwards (`truncate orders, reservations, occasion_enquiries, customer_messages;`).
5. **Project Settings → API**: copy the Project URL and the `anon` `public` key into the environment variables.
6. Redeploy the site.

### What the database does

| Function (called by the site) | Behaviour |
|---|---|
| `place_order` | Validates the order, looks up **every price on the server**, applies the delivery rule (`subtotal > 500 ? 0 : 25`), stores it as `pending`, returns a reference. Max 3 orders per phone per 10 minutes. |
| `get_order_status` | Returns the stored status for a reference **and** matching phone number. |
| `request_reservation` | Stores a `pending` table request (today to 60 days ahead, 1–10 guests, India time). |
| `send_occasion_enquiry` | Stores a `pending` enquiry. |
| `leave_message` | Stores a Whisper Box note. |

Tables: `menu_products`, `menu_variants`, `menu_add_ons`, `orders`, `reservations`,
`occasion_enquiries`, `customer_messages`. Row-level security is on with no public policies, so
the public key can only call the five functions above. This is verified by `supabase/tests/rpc_checks.sql`.

### Daily use by café staff

Open Supabase → **Table Editor**:

- **orders**: new orders arrive as `pending`. Call the customer, then set `status` to
  `confirmed` → `preparing` → `dispatched` → `completed` (or `cancelled`), and `payment_status` when paid.
  Customers who check their order see exactly this status.
- **reservations** and **occasion_enquiries**: set `status` to `confirmed` or `declined` after contacting the guest.
- **customer_messages**: Whisper Box notes.

Tip: turn on Supabase's email notifications (Database Webhooks, or a free tool such as Zapier) if staff
should be alerted to new orders. This is not set up yet.

### Changing the menu later

Edit `src/data/menu.ts` → `npm test` (checks prices against the supplied list; update that list in
`src/data/menu.test.ts` too) → `npm run db:seed` → run the new `supabase/seed.sql` → redeploy.

## 4. Launch checklist

- [x] Real business details in `src/config/site.ts` (address, phone, hours 5–10 pm, map link)
- [x] WhatsApp configured (919332740085, built in; Supabase optional)
- [ ] Essential images supplied (see `docs/IMAGE_ASSET_REQUIREMENTS.md`)
- [x] `previewMode: false` in `src/config/site.ts`. This hides placeholder labels and owner setup hints.
- [ ] `menuImagesAreIllustrative` set to match the images actually used
- [ ] Confirm "Leaker Tea" spelling and veg / non-veg marks with the owner
- [ ] `npm test` and `npm run qa` pass
- [ ] Place one real test order and one table request; delete them in Supabase afterwards

## 5. Known limitations

- **No online payment.** No payment gateway is configured; payment is arranged with the café on
  confirmation. Adding Razorpay or similar needs a business account and a server-side function, and
  must never be faked in the browser.
- **No live table availability.** Reservations are requests. The café confirms each one.
- **No staff notifications** yet (see the tip above).
- **Delivery area** is not checked automatically; add it in `site.ordering.deliveryArea` once confirmed.

## 6. Quality checks

```bash
npm test        # 49 unit tests
npm run qa      # 87 browser checks across three builds (none / WhatsApp / mocked Supabase)
node scripts/screens.mjs qa-output/screens   # screenshots of every page at 390 / 834 / 1440 px (needs `npm run preview` running)
```
