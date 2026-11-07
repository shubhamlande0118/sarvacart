/**
 * Firebase Storage service for product images.
 *
 * Handles uploading product images to Firebase Storage and returning secure
 * download URLs. Validates file type and size before upload.
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getStorageInstance } from "./firebase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Upload a product image to Firebase Storage.
 * Path: products/{sellerId}/{productId}/{fileName}
 */
export async function uploadProductImage(
  sellerId: string,
  file: File,
  productId?: string
): Promise<string> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be under 5MB.");
  }

  const storage = getStorageInstance();
  const productPath = productId || "temp";
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const storageRef = ref(storage, `products/${sellerId}/${productPath}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Delete a product image from Firebase Storage.
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const storage = getStorageInstance();
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch {
    // Image may not exist; ignore deletion errors
  }
}

/**
 * Generate a Storage reference path for a product image (used in rules).
 */
export function productImagePath(sellerId: string, productId: string): string {
  return `products/${sellerId}/${productId}`;
}
