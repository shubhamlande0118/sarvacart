// Typed exports wrapper.
// UI should never import directly from firebase/*; import from here instead.
//
// This re-exports the guarded, lazy Firebase boundary from `src/services/firebase.ts`
// (the single source of truth). When Firebase is not configured, calling these
// getters throws a clear error — callers must check `isFirebaseConfigured` first.

import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import type { Functions } from "firebase/functions";

import {
  getAuthInstance,
  getFirestoreInstance,
  getStorageInstance,
  getFunctionsInstance,
  isFirebaseConfigured,
  toFriendlyFirebaseError,
  type FirebaseSetupError,
} from "../services/firebase";

export type FirebaseAuth = Auth;
export type FirebaseFirestore = Firestore;
export type FirebaseStorageInstance = FirebaseStorage;
export type FirebaseFunctions = Functions;

/** Re-export the friendly error mapper + typed setup error for UI consumers. */
export { toFriendlyFirebaseError };
export type { FirebaseSetupError };

/** Lazy-access to the Firebase Auth instance (throws if not configured). */
export const auth = getAuthInstance;
/** Lazy-access to the Firebase Firestore instance (throws if not configured). */
export const firestore = getFirestoreInstance;
/** Lazy-access to the Firebase Storage instance (throws if not configured). */
export const storage = getStorageInstance;
/** Lazy-access to the Firebase Functions instance (throws if not configured). */
export const functions = getFunctionsInstance;

export { isFirebaseConfigured };
