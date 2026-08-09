/**
 * Firebase configuration.
 *
 * IMPORTANT: This module must NEVER throw at import time. The app gracefully
 * falls back to the localStorage-backed store when Firebase is not configured,
 * so a missing `.env.local` must not crash the build or runtime.
 *
 * These values are loaded from environment variables so the project can be
 * wired to a real Firebase project without code changes. For local development,
 * copy `.env.example` to `.env.local` and fill in the values from your
 * Firebase project console.
 */

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

function getEnv(key: string): string {
  const v = (import.meta as unknown as { env: Record<string, unknown> }).env[key];
  return typeof v === "string" ? v.trim() : "";
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID") || undefined,
};

/** True only when a real Firebase config is provided. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);
