/**
 * Seller service layer.
 *
 * Handles seller profile CRUD, KYC management, and seller authorization.
 * All operations are server-authoritative via Firestore security rules.
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreInstance } from "./firebase";
import type {
  SellerProfile,
  SellerStatus,
  SellerKyc,
  KycStatus,
  UserProfile,
} from "./types";

const SELLERS_COLLECTION = "sellers";
const KYC_COLLECTION = "sellerKyc";
const USERS_COLLECTION = "users";

/* ------------------------------- Converters ------------------------------- */

export const sellerProfileConverter: FirestoreDataConverter<SellerProfile> = {
  toFirestore(seller: SellerProfile): DocumentData {
    return seller;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): SellerProfile {
    return { ...(snapshot.data() as SellerProfile), id: snapshot.id };
  },
};

export const sellerKycConverter: FirestoreDataConverter<SellerKyc> = {
  toFirestore(kyc: SellerKyc): DocumentData {
    return kyc;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): SellerKyc {
    return { ...(snapshot.data() as SellerKyc), id: snapshot.id };
  },
};

/* ------------------------------- Helpers -------------------------------- */

function db() {
  return getFirestoreInstance();
}

/* ------------------------------- Sellers -------------------------------- */

export async function getSellerByUserId(userId: string): Promise<SellerProfile | null> {
  const d = db();
  const q = query(collection(d, SELLERS_COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as SellerProfile;
}

export async function getSeller(sellerId: string): Promise<SellerProfile | null> {
  const d = db();
  const snap = await getDoc(doc(d, SELLERS_COLLECTION, sellerId));
  return snap.exists() ? (snap.data() as SellerProfile) : null;
}

export async function getAllSellers(): Promise<SellerProfile[]> {
  const d = db();
  const q = query(collection(d, SELLERS_COLLECTION));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SellerProfile);
}

export async function createSellerProfile(profile: Omit<SellerProfile, "id" | "createdAt" | "updatedAt">): Promise<SellerProfile> {
  const d = db();
  const now = Date.now();
  const record = {
    ...profile,
    status: "pending" as SellerStatus,
    createdAt: now,
    updatedAt: now,
  } as SellerProfile;
  const ref = await addDoc(collection(d, SELLERS_COLLECTION), record);
  return { ...record, id: ref.id };
}

export async function updateSellerStatus(sellerId: string, status: SellerStatus): Promise<void> {
  const d = db();
  await updateDoc(doc(d, SELLERS_COLLECTION, sellerId), {
    status,
    updatedAt: Date.now(),
  });
}

export async function updateSellerProfile(sellerId: string, patch: Partial<Omit<SellerProfile, "id" | "userId" | "createdAt">>): Promise<void> {
  const d = db();
  await updateDoc(doc(d, SELLERS_COLLECTION, sellerId), {
    ...patch,
    updatedAt: Date.now(),
  });
}

/* -------------------------------- KYC ----------------------------------- */

export async function getKycBySellerId(sellerId: string): Promise<SellerKyc | null> {
  const d = db();
  const q = query(collection(d, KYC_COLLECTION), where("sellerId", "==", sellerId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  // Return the most recent KYC record.
  const sorted = snap.docs.sort((a, b) => (b.data().submittedAt || 0) - (a.data().submittedAt || 0));
  return sorted[0].data() as SellerKyc;
}

export async function submitKyc(kyc: Omit<SellerKyc, "id" | "submittedAt" | "status">): Promise<SellerKyc> {
  const d = db();
  const now = Date.now();
  const record = {
    ...kyc,
    status: "pending" as KycStatus,
    submittedAt: now,
  } as SellerKyc;
  const ref = await addDoc(collection(d, KYC_COLLECTION), record);
  return { ...record, id: ref.id };
}

export async function reviewKyc(kycId: string, status: KycStatus, rejectionReason?: string): Promise<void> {
  const d = db();
  const patch: Record<string, unknown> = {
    status,
    reviewedAt: Date.now(),
  };
  if (rejectionReason) patch.rejectionReason = rejectionReason;
  await updateDoc(doc(d, KYC_COLLECTION, kycId), patch);
}

/* ------------------------------- Users ---------------------------------- */

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const d = db();
  const snap = await getDoc(doc(d, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserRole(uid: string, role: UserProfile["role"]): Promise<void> {
  const d = db();
  await updateDoc(doc(d, USERS_COLLECTION, uid), { role, updatedAt: Date.now() });
}
