# 🦄 SarvaCart — Cinematic Luxury E-Commerce

A premium, cinematic, mobile-first e-commerce experience built with **React + Vite + Tailwind CSS v4 + Framer Motion**. Dark luxury theme, glassmorphism, parallax scrolling, 3D-style product storytelling, real authentication, full cart & order flow, and a complete admin dashboard with product CRUD.

> SarvaCart uses Firebase Authentication and Firestore when `VITE_FIREBASE_*` variables are configured, with a localStorage fallback for offline demos. COD checkout uses the `placeCodOrder` Cloud Function so pricing and inventory are trusted on the server.

---

## ✨ Features

- **Cinematic hero** with animated headline, floating 3D product visuals & parallax
- **4 categories** — Men's Wear, Ladies Wear, Jewellery, Electronics
- **Product listing** with search, category filter, price range & sorting (latest / low→high / high→low / top rated)
- **Immersive product detail** — gallery, size/colour options, quantity, Add to Cart & Buy Now
- **Cart system** — add/remove, quantity, subtotal, discount, delivery & total, empty-cart state
- **Checkout** — validated form, payment options (COD / UPI / Online–Razorpay-ready), order summary, success screen
- **Separate User & Admin auth** with SHA-256 salted password hashing + protected routes & role verification
- **User area** — signup/login, order history, editable profile
- **Admin dashboard** — sales / orders / products / users stats, recent orders, full product CRUD, image management, order status updates
- **UX** — Framer Motion page transitions, toast notifications, loading states, sticky cart, responsive navbar + mobile menu
- **SEO** — meta/OG tags, semantic markup, optimized lazy-loaded imagery

---

## 🔑 Accounts

Create user accounts through **Sign Up**. Admin access requires a Firebase custom
claim and is configured by a project owner; credentials are never hardcoded in
the frontend.

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

The app is output as a single self-contained `dist/index.html` (via `vite-plugin-singlefile`) — drop it on any static host.

---

## 🌐 Deployment

- **Vercel:** Build command `npm run build`, output dir `dist`. The included `vercel.json` rewrites all non-`/api/*` requests to `/index.html`, which is required for direct navigation to nested `BrowserRouter` routes (e.g. `/shop/:category`, `/product/:id`, `/account/orders/:id`).
- **Static host (S3, GitHub Pages, etc.):** upload `dist/index.html` and configure a SPA fallback to `index.html` for all routes.
- Routing uses `BrowserRouter` (see `src/App.tsx`), not `HashRouter`. A `HashRedirectHandler` migrates legacy `#/` hash URLs to path-based routes.

---

## Architecture

The repository layer is the persistence boundary. Firebase Auth owns sessions,
Firestore stores profiles, products and orders, and the browser stores only the
cart/demo fallback. COD orders are authenticated and sent to `POST /api/orders/create`
on Vercel, which recomputes prices and reserves stock in one trusted Firestore
transaction before returning a minimal confirmation. Cloud Functions require the
Blaze plan and are optional. Without Firebase configuration, the localStorage
fallback remains suitable only for offline UI demos.

---

## 🚀 Production Deployment

SarvaCart ships complete Firebase production configuration out of the box. See **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**
for the full step-by-step guide.

**Quick start:**

```bash
# 1. Configure environment
cp .env.example .env.local      # fill in VITE_FIREBASE_* values

# 2. Install Firebase CLI & log in
npm install -g firebase-tools
firebase login

# 3. Deploy Spark-supported rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# 4. Seed data + bootstrap the first admin (idempotent)
npm install
npm run seed                    # products + categories (only if empty)
npm run seed:admin              # admin@sarvacart.store (only if missing)

# 5. Build & deploy hosting
npm run build
firebase deploy --only hosting
```

**Config files included:**

| File | Purpose |
| --- | --- |
| [`firestore.rules`](./firestore.rules) | Role-based Firestore security rules |
| [`storage.rules`](./storage.rules) | Admin product uploads, user profile photos |
| [`firestore.indexes.json`](./firestore.indexes.json) | Composite indexes for products & orders |
| [`firebase.json`](./firebase.json) | Firebase CLI config (rules, indexes, hosting) |
| [`vercel.json`](./vercel.json) | Vercel routing: SPA fallback + `/api/*` Node.js runtime |
| [`scripts/seed.ts`](./scripts/seed.ts) | Idempotent seeder + admin bootstrap |
| [`.env.example`](./.env.example) | All environment variables |

Storage initialization and deployment are separate Firebase Console actions.
Cloud Functions and Delhivery tracking require Blaze; they are not required for
Spark authentication, catalog, cart, COD order creation or order history.

## API routes vs Cloud Functions

- **Vercel API** (`api/orders/create.ts`): the actively used COD checkout
  endpoint. Runs on the `nodejs20.x` runtime, verifies the Firebase ID token,
  recomputes pricing/stock inside a Firestore transaction, and returns a safe,
  minimal order confirmation to the customer.
- **Cloud Functions** (`functions/src/index.ts`): separate optional functions
  (`placeCodOrder`, `assignDelhiveryWaybill`, `refreshDelhiveryTracking`) that
  require the Blaze plan to deploy. They are **not** used by the default
  checkout flow unless you explicitly wire the frontend to them. Deploy only
  when strict transactional inventory or Delhivery tracking is required.

---

## 📁 Project Structure

```
src/
├─ data/seed.ts            # categories + seed products (real imagery)
├─ lib/store.tsx           # global store: auth, cart, orders, product CRUD, toasts
├─ components/             # Navbar, Footer, ProductCard, Toaster, ui primitives, route guards
├─ pages/
│  ├─ Home, Shop, ProductDetails, Cart, Checkout, Static (About/Contact/legal)
│  ├─ auth/                # Login, Signup, AdminLogin
│  ├─ account/             # Orders, Profile
│  └─ admin/               # AdminLayout, Dashboard, ProductForm, ManageProducts, AdminOrders
└─ App.tsx                 # router + layout + page transitions
```

Crafted with precision. © 2026 SarvaCart.
