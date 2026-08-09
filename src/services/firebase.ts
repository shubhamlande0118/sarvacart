import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";

import { firebaseConfig, isFirebaseConfigured } from "../lib/firebaseConfig";

/**
 * Firebase initialization boundary — the SINGLE source of truth.
 *
 * All modules must import from here (or from `../lib/firebaseExports`) to avoid
 * re-initializing the Firebase SDK. This module is lazy and guarded:
 *  - If `VITE_FIREBASE_*` env vars are missing, `isFirebaseConfigured` is false.
 *  - The app then gracefully falls back to the localStorage-backed store.
 *  - No Firebase call is ever made when not configured, so nothing crashes.
 */

export { isFirebaseConfigured };

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let functions: Functions | null = null;

/** Typed error for Firebase initialization/config failures. */
export class FirebaseSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseSetupError";
  }
}

/** True only when a real Firebase config is provided. */
function requireConfig() {
  if (!isFirebaseConfigured) {
    throw new FirebaseSetupError(
      "Firebase is not configured. Add your VITE_FIREBASE_* environment variables to .env.local."
    );
  }
}

/**
 * Map a Firebase Auth/Firestore error code to a human-friendly message.
 * Falls back to the raw message when the code is unrecognized.
 */
export function toFriendlyFirebaseError(error: unknown): string {
  const fallback = error instanceof Error ? error.message : "An unexpected error occurred.";
  if (typeof error !== "object" || error === null) return fallback;
  const code = (error as { code?: string }).code;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found for this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "failed-precondition":
      return "The operation could not be completed. Check Firebase indexes and rules.";
    case "permission-denied":
      return "You do not have permission to perform this action.";
    default:
      return fallback;
  }
}

export function getFirebaseApp(): FirebaseApp {
  requireConfig();
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getAuthInstance(): Auth {
  requireConfig();
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

export function getFirestoreInstance(): Firestore {
  requireConfig();
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export function getStorageInstance(): FirebaseStorage {
  requireConfig();
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
}

export function getFunctionsInstance(): Functions {
  requireConfig();
  if (!functions) functions = getFunctions(getFirebaseApp());
  return functions;
}
