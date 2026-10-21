import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreInstance } from "./firebase";
import type { ProductRecord } from "./types";

/* ------------------------------ Converters ------------------------------- */

export const productConverter: FirestoreDataConverter<ProductRecord> = {
  toFirestore(product: ProductRecord): DocumentData {
    return product;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProductRecord {
    const data = snapshot.data();
    return { ...(data as ProductRecord), id: snapshot.id };
  },
};

/* ------------------------------- Queries --------------------------------- */

export interface ProductQueryOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featuredOnly?: boolean;
  sortBy?: "latest" | "low" | "high" | "rating";
  pageSize?: number;
  last?: ProductRecord | null;
}

function buildConstraints(opts: ProductQueryOptions): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  constraints.push(where("active", "==", true));
  if (opts.category) constraints.push(where("category", "==", opts.category));
  if (opts.brand) constraints.push(where("brand", "==", opts.brand));
  if (opts.minPrice != null) constraints.push(where("discountPrice", ">=", opts.minPrice));
  if (opts.maxPrice != null) constraints.push(where("discountPrice", "<=", opts.maxPrice));
  if (opts.featuredOnly) constraints.push(where("featured", "==", true));
  if (opts.sortBy === "latest") constraints.push(orderBy("createdAt", "desc"));
  if (opts.sortBy === "low") constraints.push(orderBy("discountPrice", "asc"));
  if (opts.sortBy === "high") constraints.push(orderBy("discountPrice", "desc"));
  if (opts.sortBy === "rating") constraints.push(orderBy("rating", "desc"));
  constraints.push(limit(opts.pageSize ?? 24));
  if (opts.last) {
    // Order must match the active sortBy to paginate correctly.
    const field = opts.sortBy === "latest" ? "createdAt" : "discountPrice";
    constraints.push(startAfter(opts.last[field]));
  }
  return constraints;
}

export async function fetchProducts(opts: ProductQueryOptions = {}): Promise<ProductRecord[]> {
  const db = getFirestoreInstance();
  const constraints = buildConstraints(opts);
  const q = query(collection(db, "products").withConverter(productConverter), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function fetchProductById(id: string): Promise<ProductRecord | null> {
  const db = getFirestoreInstance();
  const ref = doc(db, "products", id).withConverter(productConverter);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function fetchRelatedProducts(
  product: ProductRecord,
  count = 4
): Promise<ProductRecord[]> {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, "products").withConverter(productConverter),
    where("active", "==", true),
    where("category", "==", product.category),
    where("__name__", "!=", product.id),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/* ------------------------------- Mutations ------------------------------- */

export async function createProduct(
  product: Omit<ProductRecord, "id" | "createdAt">
): Promise<ProductRecord> {
  const db = getFirestoreInstance();
  const ref = doc(collection(db, "products"));
  const record: ProductRecord = {
    ...product,
    id: ref.id,
    createdAt: Date.now(),
  };
  await setDoc(ref.withConverter(productConverter), record);
  return record;
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<ProductRecord, "id">>
): Promise<void> {
  const db = getFirestoreInstance();
  await updateDoc(doc(db, "products", id), patch as DocumentData);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getFirestoreInstance();
  await deleteDoc(doc(db, "products", id));
}

/**
 * Intentionally unavailable from the browser. A client-side stock decrement
 * would require product write access and would let a customer alter inventory
 * independently of checkout. Inventory must be changed by a trusted server
 * transaction (for example the placeCodOrder callable function).
 */
export async function reduceStock(_lines: { productId: string; qty: number }[]): Promise<void> {
  throw new Error("Inventory updates must be performed by the checkout backend.");
}
