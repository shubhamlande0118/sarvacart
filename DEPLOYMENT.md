# SarvaCart — Firebase Production Deployment Guide

This guide walks you through taking SarvaCart from a localStorage demo to a
production system backed by Firebase (Auth + Firestore + Storage + Hosting).
Existing application code is **not** modified — you only add the backend
configuration files already present in this repo:

| File | Purpose |
| --- | --- |
| `firestore.rules` | Firestore security rules (role-based access) |
| `storage.rules` | Cloud Storage rules (admins + profile photos) |
| `firestore.indexes.json` | Composite indexes for products & orders |
| `firebase.json` | Firebase CLI config (rules, indexes, hosting) |
| `scripts/seed.ts` | Idempotent seeder + admin bootstrap (server-side) |
| `.env.example` | Reference for all environment variables |

---

## 1. Prerequisites

- A [Firebase](https://console.firebase.google.com) account and a new (or existing) project.
- Node.js 18+ and npm.
- Firebase CLI installed:
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

---

## 2. Create the Firebase project & collections

1. Open the [Firebase Console](https://console.firebase.google.com) and create a project (or select one).
2. **Authentication** → **Sign-in method** → enable **Email/Password**. (Optionally enable Google.)
3. **Firestore Database** → click **Create database** → choose production mode and a region.
4. **Storage** → click **Get started** → choose a region → **Done**.

The collections (`users`, `products`, `orders`, `cart`, `wishlist`, `addresses`, `categories`, `settings`) are created automatically on first write. The seed script below populates `products` and `categories`.

---

## 3. Add your web app

In **Project settings → Your apps → Web app (`</>`)**:

1. Register the app and copy the config values.
2. Create `.env.local` from `.env.example` and fill in the `VITE_FIREBASE_*` values:
   ```bash
   cp .env.example .env.local
   ```
3. Download a **service account** key:
   **Project settings → Service accounts → Generate new private key**.
   Save it as `firebase-service-account.json` (or set `FIREBASE_SERVICE_ACCOUNT` to its path).

---

## 4. Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

This uploads `firestore.rules`. Access model:

- **Public read:** `products`, `categories`, `settings`.
- **Owner-only read/write:** `users`, `cart`, `wishlist`, `addresses` (doc id == `request.auth.uid`).
- **orders:** owner can read/create their own; admins full access.
- **Admin writes:** everything editable by a user with the `admin` custom claim (`request.auth.token.admin == true`).

---

## 5. Deploy Storage rules

```bash
firebase deploy --only storage
```

This uploads `storage.rules`:

- `products/{productId}/{file}` → write only by **admins** (product images).
- `profilePhotos/{uid}/{file}` → write only by the **owning user** (profile photo).
- Read is public for all.

---

## 6. Deploy Firestore indexes

```bash
firebase deploy --only firestore:indexes
```

This creates the composite indexes in `firestore.indexes.json`:

- **products:** `(active, category, discountPrice)`, `(active, featured, discountPrice)`, `(active, createdAt)`, `(category, createdAt)`, `(category, price)`, `(active, category, createdAt)`.
- **orders:** `(userId, createdAt)`, `(status, createdAt)`, `(userId, status)`.

> Note: Firestore may take a few minutes to provision indexes. Queries that need a
> not-yet-created index will fail with a link to create it in the console.

---

## 7. Seed data & bootstrap the admin

Install the server-side dependencies and run the seeder. The script is **idempotent**:

- **Products** are inserted only if the `products` collection is empty.
- **Categories** are inserted only if the `categories` collection is empty.
- Existing production data is never overwritten.

```bash
npm install
# Seed products + categories (safe to re-run)
npm run seed

# Also create the first admin. Only creates if it does NOT already exist.
npm run seed:admin
```

The admin bootstrap (`admin@sarvacart.store`):

- If the user **already exists** → sets the `admin` custom claim and updates the Firestore `role` to `"admin"`.
- If the user **does not exist** → creates it **only** when `--create-admin` is passed.
- Never recreates an existing admin.

> ⚠️ Custom claims propagate to existing sessions after refresh. The `admin` claim is what
> `firestore.rules` / `storage.rules` check to grant admin-level access.

**Set the admin password:** After `npm run seed:admin`, set a real password for the admin in
**Authentication → Users → admin@sarvacart.store → Actions → Reset password** (or use the Firebase
console "Set password" flow), then sign in at `/#/admin/login`.

---

## 8. Build the frontend

```bash
npm run build
```

Produces a single self-contained `dist/index.html` (via `vite-plugin-singlefile`) plus the logo and manifest.

---

## 9. Deploy Hosting

```bash
firebase deploy --only hosting
```

`firebase.json` already configures Hosting to serve `dist/` with a `** → /index.html` rewrite so
client-side routes work. Full deploy of everything at once:

```bash
firebase deploy
```

---

## 10. Verify

- Load your hosting URL — the app boots and shows the SarvaCart loading screen.
- Browse `/shop` — products should load from Firestore (seeded in step 7).
- Sign up a new user → they appear in the `users` collection.
- Sign in as `admin@sarvacart.store` at `/#/admin/login` → dashboard loads with admin access.
- Try writing to another user's `cart`/`wishlist`/`addresses` from the console is **denied** by rules.

---

## Environment variable reference

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | yes (browser) | app | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | yes (browser) | app | e.g. `my-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | yes | app + seed | Firebase project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | yes (browser) | app | e.g. `my-app.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | yes (browser) | app | sender id |
| `VITE_FIREBASE_APP_ID` | yes (browser) | app | web app id |
| `VITE_FIREBASE_MEASUREMENT_ID` | no | Analytics | optional |
| `FIREBASE_SERVICE_ACCOUNT` | yes (seed) | `scripts/seed.ts` | path or inline JSON; **server-only** |
| `RAZORPAY_KEY_ID` | no | Cloud Functions | server-only |
| `RAZORPAY_KEY_SECRET` | no | Cloud Functions | server-only |
| `DELHIVERY_API_URL` | no | Cloud Functions | server-only |
| `DELHIVERY_API_TOKEN` | no | Cloud Functions | server-only |

---

## Troubleshooting

- **"Missing or insufficient permissions."** → Rules not deployed, or the admin custom claim is not set. Run `firebase deploy --only firestore:rules` and re-run `npm run seed:admin`.
- **Index required error** → Deploy indexes (`firebase deploy --only firestore:indexes`) and wait for them to build.
- **Seed says "collection already has documents"** → Expected; the script intentionally skips non-empty collections.
- **App falls back to localStorage** → `VITE_FIREBASE_*` vars are missing from the build environment. Configure them in your host, then rebuild.
