# SarvaCart — Firebase Production Setup

## Objectives
Enable a production Firebase backend WITHOUT modifying application code, UI, routing, or StoreContext.

## Tasks
- [x] Read existing seed data, types, repository, and firebase wiring
- [x] Create `firestore.rules` — role-based access
- [x] Create `storage.rules` — admin product uploads, user profile photos
- [x] Create `firestore.indexes.json` — products & orders composite indexes
- [x] Create `firebase.json` — Firebase CLI config
- [x] Create `scripts/seed.ts` — idempotent seed via firebase-admin + tsx
  - [x] Products: skip if collection not empty
  - [x] Categories: skip if collection not empty
  - [x] Admin bootstrap: only create with `--create-admin` flag; idempotent
- [x] Expand `.env.example` — Firebase + service account + Razorpay + Delhivery
- [x] Update `package.json` scripts + devDeps (firebase-admin, tsx)
- [x] Create `DEPLOYMENT.md` — full deployment guide
- [x] Add "Production Deployment" section to README
- [x] Verify: `npm run build` — 2249 modules transformed, built successfully (exit 0)
- [x] Verify: `npx tsc --noEmit` — passes (no type errors)
- [x] Verify: `npx tsx scripts/seed.ts` — compiles & runs; correctly reports missing `FIREBASE_SERVICE_ACCOUNT`

## Live Firebase Config Integration
- [x] Create `.gitignore` — excludes `.env*`, `node_modules`, `dist`, service-account keys, logs
- [x] Create `.env.local` — real Firebase project (`sarvacart-d0b8f`) config via env vars
- [x] Update `src/lib/firebaseConfig.ts` — read `measurementId` from `VITE_FIREBASE_MEASUREMENT_ID` (fully env-driven, no hardcoding)
- [x] Update `src/services/firebase.ts` — add `FirebaseSetupError` class + `toFriendlyFirebaseError()` error-code mapper (additive; lazy singleton getters unchanged)
- [x] Update `src/lib/firebaseExports.ts` — re-export `toFriendlyFirebaseError` + `FirebaseSetupError` type
- [x] Update `src/lib/store.tsx` — use `toFriendlyFirebaseError` in `register()`/`login()` catch blocks (friendly auth error messages)
- [x] Verify Analytics NOT initialized (app does not use Analytics — omitted intentionally)
- [x] Verify `npm run build` — passes (2249 modules, exit 0)
- [x] Verify `npx tsc --noEmit` — passes (clean)
