/**
 * Barrel export for the Firebase-ready service layer.
 *
 * Consumers import from here so the implementation can be swapped without
 * touching call sites. This is the single public surface for Step 1.
 */
export { isFirebaseConfigured } from "./firebase";
export * from "./types";
export * from "./products";
export * from "./orders";
export * from "./auth";
