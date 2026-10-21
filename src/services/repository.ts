/**
 * Repository / adapter layer.
 *
 * This is the SINGLE persistence boundary for the app. The UI store
 * (`src/lib/store.tsx`) calls only into this module — never directly into
 * Firestore or localStorage.
 *
 * When Firebase is configured (`isFirebaseConfigured === true`), reads/writes
 * go to Firestore. Otherwise the module transparently falls back to the
 * existing localStorage-backed implementation. No business logic lives here;
 * it only maps between the UI types (`Product`, `User`, `Order`, `CartItem`)
 * and the Firestore document types (`ProductRecord`, `UserProfile`, `OrderRecord`).
 */

import { isFirebaseConfigured } from "./firebase";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reduceStock,
} from "./products";
import {
  updateOrderStatus,
  fetchOrdersByUser,
  fetchAllOrders,
  subscribeToUserOrders,
} from "./orders";
import {
  createUserProfile,
  fetchUserProfile,
  updateUserProfile,
} from "./auth";
import type { ProductRecord, UserProfile, OrderRecord } from "./types";
import type { Product } from "../data/seed";
import type { Order, OrderStatus, User } from "./storeService";
import { httpsCallable } from "firebase/functions";
import { getFunctionsInstance } from "./firebase";

/* ------------------------------ Mappers ------------------------------ */

/** UI Product -> Firestore ProductRecord */
function toProductRecord(p: Product): ProductRecord {
  return {
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
  };
}

/** Firestore ProductRecord -> UI Product */
function toProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    name: record.name,
    category: (record.category as Product["category"]) || record.category,
    price: record.price,
    discountPrice: record.discountPrice,
    description: record.description,
    stock: record.stock,
    images: record.images,
    sizes: record.sizes.length ? record.sizes : undefined,
    colors: record.colors.length ? record.colors : undefined,
    rating: record.rating,
    featured: record.featured,
    createdAt: record.createdAt,
  };
}

/** Firestore OrderRecord -> UI Order */
function toOrder(record: OrderRecord): Order {
  return {
    id: record.id,
    userId: record.userId,
    customer: {
      name: record.customer.name,
      email: record.customer.email,
      phone: record.customer.phone,
      address: record.customer.address,
    },
    items: record.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      image: it.image,
      price: it.price,
      qty: it.qty,
      size: it.size,
      color: it.color,
    })),
    subtotal: record.subtotal,
    discount: record.discount,
    delivery: record.delivery,
    total: record.total,
    payment: record.payment,
    status: record.status as OrderStatus,
    shipment: record.shipment
      ? {
          awb: record.shipment.awb,
          courier: record.shipment.courier,
          status: record.shipment.status,
          trackingUrl: `https://www.delhivery.com/track/package/${encodeURIComponent(record.shipment.awb)}`,
          timeline: record.shipment.timeline,
          updatedAt: record.shipment.updatedAt,
        }
      : undefined,
    createdAt: record.createdAt,
  };
}

/* ------------------------------ Products ------------------------------ */

export async function repoGetProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured) {
    const { seedProducts } = await import("../data/seed");
    return seedProducts;
  }
  const records = await fetchProducts({ sortBy: "latest" });
  return records.map(toProduct);
}

export async function repoGetProduct(id: string): Promise<Product | null> {
  if (!isFirebaseConfigured) {
    const { seedProducts } = await import("../data/seed");
    return seedProducts.find((p) => p.id === id) ?? null;
  }
  const record = await fetchProductById(id);
  return record ? toProduct(record) : null;
}

export async function repoUpsertProduct(
  p: Omit<Product, "id" | "createdAt"> & { id?: string }
): Promise<Product | null> {
  if (!isFirebaseConfigured) return null;
  const record = toProductRecord({ ...(p as Product), id: p.id ?? "", createdAt: Date.now() });
  if (p.id) {
    const { id, ...rest } = record;
    await updateProduct(id, rest);
    return toProduct(record);
  } else {
    const { id: _id, ...rest } = record;
    return toProduct(await createProduct(rest));
  }
}

export async function repoDeleteProduct(id: string): Promise<void> {
  if (isFirebaseConfigured) await deleteProduct(id);
}

export async function repoReduceStock(
  lines: { productId: string; qty: number }[]
): Promise<void> {
  if (isFirebaseConfigured) await reduceStock(lines);
}

/* ------------------------------ Auth / Users ------------------------------ */

export async function repoCreateUser(profile: {
  id: string;
  name: string;
  email: string;
}): Promise<void> {
  if (!isFirebaseConfigured) return;
  const record: UserProfile = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: "user",
    createdAt: Date.now(),
    onboarded: true,
  };
  await createUserProfile(record);
}

export async function repoFetchUser(id: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) return null;
  return fetchUserProfile(id);
}

export async function repoUpdateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "phone" | "address">>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const data: Partial<Omit<UserProfile, "id" | "email">> = {
    name: patch.name,
    phone: patch.phone,
  };
  // address is an extra field on the UI User that isn't part of UserProfile;
  // persist it as a custom field on the Firestore doc.
  if (patch.address !== undefined) {
    await updateUserProfile(id, {
      ...data,
      address: patch.address,
    } as unknown as Partial<Omit<UserProfile, "id" | "email">>);
    return;
  }
  await updateUserProfile(id, data);
}

/* ------------------------------ Orders ------------------------------ */

export async function repoPlaceOrder(
  order: Order
): Promise<Order> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  if (order.payment !== "Cash on Delivery" || !order.userId) {
    throw new Error("Only authenticated Cash on Delivery orders are supported.");
  }
  const { getCurrentIdToken } = await import("./auth");
  const token = await getCurrentIdToken();
  const result = await fetch("/api/orders/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      customer: order.customer,
      payment: "Cash on Delivery",
      items: order.items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        ...(item.size ? { size: item.size } : {}),
        ...(item.color ? { color: item.color } : {}),
      })),
    }),
  });
  const payload = await result.json() as {
    order?: {
      orderId: string;
      orderNumber: string;
      status: Order["status"];
      total: number;
      payment: Order["payment"];
      customer: { name: string };
    };
    error?: string;
  };
  if (!result.ok || !payload.order) throw new Error(payload.error ?? "Unable to create the order.");
  // The server is authoritative for monetary values and status. The client's
  // validated input supplies the line items and customer contact details.
  return {
    id: payload.order.orderId,
    userId: order.userId,
    customer: { ...order.customer, name: payload.order.customer.name },
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    delivery: order.delivery,
    total: payload.order.total,
    payment: payload.order.payment,
    status: payload.order.status,
    createdAt: order.createdAt,
  };
}

export async function repoUpdateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  if (isFirebaseConfigured) {
    await updateOrderStatus(orderId, status as OrderRecord["status"]);
  }
}

export async function repoGetOrdersForUser(userId: string): Promise<Order[]> {
  if (!isFirebaseConfigured) return [];
  const records = await fetchOrdersByUser(userId);
  return records.map(toOrder);
}

export async function repoGetAllOrders(): Promise<Order[]> {
  if (!isFirebaseConfigured) return [];
  const records = await fetchAllOrders();
  return records.map(toOrder);
}

export function repoSubscribeOrdersForUser(
  userId: string,
  onData: (orders: Order[]) => void,
  onError: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured) return () => undefined;
  return subscribeToUserOrders(
    userId,
    (records) => onData(records.map(toOrder)),
    onError,
  );
}

/** Gets a fresh server-side Delhivery scan without exposing its API token. */
export async function repoRefreshOrderTracking(orderId: string): Promise<Order> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  const refreshTracking = httpsCallable<{ orderId: string }, { order: Order }>(
    getFunctionsInstance(),
    "refreshDelhiveryTracking"
  );
  const result = await refreshTracking({ orderId });
  return result.data.order;
}

/** Admin-only: attach a waybill created in Delhivery One to an order. */
export async function repoAssignDelhiveryWaybill(orderId: string, awb: string): Promise<Order> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  const assignWaybill = httpsCallable<{ orderId: string; awb: string }, { order: Order }>(
    getFunctionsInstance(),
    "assignDelhiveryWaybill"
  );
  const result = await assignWaybill({ orderId, awb });
  return result.data.order;
}

export { isFirebaseConfigured };
