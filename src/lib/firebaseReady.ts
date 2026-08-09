// Firebase-ready boundary.
// Reflects whether a real Firebase config is present. When true, the store
// syncs to Firestore; when false, the app falls back to localStorage.
// This value is derived from the single source of truth in `src/services/firebase.ts`.

import { isFirebaseConfigured } from "../services/firebase";

export const firebaseReady = isFirebaseConfigured;
export { isFirebaseConfigured };
