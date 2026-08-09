/**
 * SarvaCart — Firebase Production Seeder & Admin Bootstrap
 *
 * Server-side only. Uses the Firebase Admin SDK (never included in the
 * frontend bundle). Run with `tsx`:
 *
 *   npx tsx scripts/seed.ts                          # seed products & categories
 *   npx tsx scripts/seed.ts --create-admin           # also bootstrap the admin user
 *
 * Requirements:
 *   - A Firebase service account JSON saved to `FIREBASE_SERVICE_ACCOUNT` env
 *     var (path to JSON file OR inline JSON string).
 *   - Valid `VITE_FIREBASE_PROJECT_ID` (used to locate the Firestore project).
 *
 * Idempotency & safety guarantees:
 *   - Products are seeded ONLY if the `products` collection is empty.
 *   - Categories are seeded ONLY if the `categories` collection is empty.
 *   - Existing production data is NEVER overwritten.
 *   - The admin user is created ONLY when `--create-admin` is passed AND the
 *     user does not already exist. If the user exists, we only (a) set the
 *     `admin` custom claim and (b) update their Firestore `role` to "admin".
 *   - Every skipped/inserted/updated document prints a clear log line.
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

import admin from "firebase-admin";

import { categories, seedProducts as seedProductList } from "../src/data/seed";

/* ------------------------------- Config ------------------------------- */

const __dirname = dirname(fileURLToPath(import.meta.url));

const ADMIN_EMAIL = "admin@sarvacart.store";
const USERS_COLLECTION = "users";
const PRODUCTS_COLLECTION = "products";
const CATEGORIES_COLLECTION = "categories";

function getProjectId(): string {
  const id = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!id) throw new Error("Missing VITE_FIREBASE_PROJECT_ID in environment.");
  return id;
}

function loadServiceAccount(): { projectId: string; clientEmail: string; privateKey: string } {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT. Set it to the path of your service-account JSON " +
        "(e.g. FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json) or paste the JSON inline."
    );
  }
  try {
    // Inline JSON string.
    return JSON.parse(raw);
  } catch {
    // Treat as a file path.
    const path = resolve(process.cwd(), raw);
    if (!existsSync(path)) {
      throw new Error(`Service account file not found: ${path}`);
    }
    return JSON.parse(readFileSync(path, "utf8"));
  }
}

function initAdmin() {
  const sa = loadServiceAccount();
  const projectId = sa.projectId || getProjectId();
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(sa as admin.ServiceAccount),
      storageBucket:
        process.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    });
  }
}

/* ------------------------------- Helpers ------------------------------- */

function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log("[seed]", ...args);
}

async function isCollectionEmpty(db: admin.firestore.Firestore, name: string): Promise<boolean> {
  const snap = await db.collection(name).limit(1).get();
  return snap.empty;
}

/* ------------------------------- Products ------------------------------ */

async function seedProducts(db: admin.firestore.Firestore): Promise<void> {
  const empty = await isCollectionEmpty(db, PRODUCTS_COLLECTION);
  if (!empty) {
    log(`Skipping "${PRODUCTS_COLLECTION}" — collection already has documents.`);
    return;
  }

  const batch = db.batch();
  let count = 0;
for (const p of seedProductList) {
    const doc = db.collection(PRODUCTS_COLLECTION).doc(p.id);
    batch.set(doc, {
      id: p.id,
      name: p.name,
      description: p.description,
      brand: "",
      category: p.category,
      price: p.price,
      discountPrice: p.discountPrice,
      images: p.images,
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      stock: p.stock,
      rating: p.rating,
      reviewCount: 0,
      tags: [],
      featured: p.featured ?? false,
      createdAt: p.createdAt,
      active: true,
    });
    count++;
  }
  await batch.commit();
  log(`Inserted ${count} products into "${PRODUCTS_COLLECTION}".`);
}

/* ------------------------------- Categories ---------------------------- */

async function seedCategories(db: admin.firestore.Firestore): Promise<void> {
  const empty = await isCollectionEmpty(db, CATEGORIES_COLLECTION);
  if (!empty) {
    log(`Skipping "${CATEGORIES_COLLECTION}" — collection already has documents.`);
    return;
  }

  const batch = db.batch();
  let count = 0;
  for (const c of categories) {
    const doc = db.collection(CATEGORIES_COLLECTION).doc(c.slug);
    batch.set(doc, {
      id: c.slug,
      name: c.name,
      slug: c.slug,
      tagline: c.tagline,
      image: c.image,
      sortOrder: count,
      active: true,
    });
    count++;
  }
  await batch.commit();
  log(`Inserted ${count} categories into "${CATEGORIES_COLLECTION}".`);
}

/* ------------------------------- Admin bootstrap ------------------------ */

async function bootstrapAdmin(
  db: admin.firestore.Firestore,
  auth: admin.auth.Auth,
  createIfMissing: boolean
): Promise<void> {
  let user: admin.auth.UserRecord | null = null;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code !== "auth/user-not-found") {
      throw err;
    }
  }

  if (!user) {
    if (!createIfMissing) {
      log(
        `Admin "${ADMIN_EMAIL}" does not exist. Run with --create-admin to create it.`
      );
      return;
    }
    const created = await auth.createUser({
      email: ADMIN_EMAIL,
      emailVerified: true,
      displayName: "SarvaCart Admin",
    });
    user = await auth.getUser(created.uid);
    log(`Created admin auth user: ${ADMIN_EMAIL} (${created.uid}).`);
  } else {
    log(`Admin "${ADMIN_EMAIL}" already exists.`);
  }

  // 1) Set the admin custom claim (idempotent).
  await auth.setCustomUserClaims(user.uid, { admin: true });
  log(`Assigned "admin" custom claim to ${ADMIN_EMAIL}.`);

  // 2) Upsert the Firestore profile doc with role = admin (idempotent).
  const docRef = db.collection(USERS_COLLECTION).doc(user.uid);
  const existing = await docRef.get();
  const now = Date.now();
  const profile = {
    id: user.uid,
    name: "SarvaCart Admin",
    email: ADMIN_EMAIL,
    phone: "",
    role: "admin",
    createdAt: existing.exists ? existing.data()?.createdAt ?? now : now,
    onboarded: true,
  };
  await docRef.set(profile, { merge: true });

  if (existing.exists) {
    log(`Updated Firestore role for ${ADMIN_EMAIL} to "admin".`);
  } else {
    log(`Created Firestore admin profile for ${ADMIN_EMAIL}.`);
  }
}

/* --------------------------------- Main -------------------------------- */

async function main() {
  const createAdmin = process.argv.includes("--create-admin");

  log("Initializing Firebase Admin SDK...");
  initAdmin();

  const db = admin.firestore();
  const auth = admin.auth();

  log("Seeding Firestore collections (skips when non-empty)...");
  await seedProducts(db);
  await seedCategories(db);

  log("Bootstrapping admin user...");
  await bootstrapAdmin(db, auth, createAdmin);

  log("Done.");
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
