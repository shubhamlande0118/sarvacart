# 🦄 SarvaCart — Cinematic Luxury E-Commerce

A premium, cinematic, mobile-first e-commerce experience built with **React + Vite + Tailwind CSS v4 + Framer Motion**. Dark luxury theme, glassmorphism, parallax scrolling, 3D-style product storytelling, real authentication, full cart & order flow, and a complete admin dashboard with product CRUD.

> This build runs entirely in the browser using an encapsulated data layer persisted to `localStorage`, so it is instantly demoable and deployable as a static site. The data layer (`src/lib/store.tsx`) is written as a clean service boundary — every function maps 1:1 to a REST/Next.js API route, so swapping to a real backend is straightforward (see **Going to Production** below).

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

## 🔑 Demo Logins

**Admin** (Admin Portal → `/#/admin/login`)
```
Email:    admin@sarvacart.store
Password: Admin@123
```

**User** — create any account via **Sign Up**, or log in after registering.

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

- **Vercel / Netlify:** Build command `npm run build`, output dir `dist`.
- **Static host (S3, GitHub Pages, etc.):** upload `dist/index.html`.
- Routing uses `HashRouter`, so deep links work on any static host without server config.

---

## 🛠 Going to Production (real backend)

The provided store is a drop-in service layer backed by Firebase. When `VITE_FIREBASE_*` env vars are
present, the repository layer (`src/services/repository.ts`) transparently syncs to Firestore; otherwise
the app falls back to localStorage. See **Production Deployment** below for the complete Firebase setup.

---

## 🚀 Production Deployment

SarvaCart ships complete Firebase production configuration out of the box. See **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**
for the full step-by-step guide.

**Quick start:**

```bash
# 1. Configure environment
cp .env.example .env.local      # fill in VITE_FIREBASE_* + FIREBASE_SERVICE_ACCOUNT

# 2. Install Firebase CLI & log in
npm install -g firebase-tools
firebase login

# 3. Deploy security rules, indexes, and storage rules
firebase deploy --only firestore:rules,firestore:indexes,storage

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
| [`scripts/seed.ts`](./scripts/seed.ts) | Idempotent seeder + admin bootstrap |
| [`.env.example`](./.env.example) | All environment variables |

**Admin:** `admin@sarvacart.store` (created via `npm run seed:admin`; set a real password in the
Firebase console → Authentication → Users).

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
