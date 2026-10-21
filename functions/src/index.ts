import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();

const delhiveryToken = defineSecret("DELHIVERY_API_TOKEN");
const DELHIVERY_TRACK_URL = "https://track.delhivery.com/api/v1/packages/json/";

// Server-enforced cooldown between Delhivery refresh attempts per order.
// Prevents repeated upstream requests and concurrent request bypass.
const DELHIVERY_REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Order statuses that are terminal/ineligible for new waybill assignment.
const INELIGIBLE_WAYBILL_STATUSES = new Set(["Cancelled", "Delivered"]);

type ShipmentRecord = {
  awb: string;
  courier: "Delhivery";
  status: string;
  trackingUrl: string;
  timeline: { status: string; at: number }[];
  updatedAt: number;
};

function isAdmin(request: { auth?: { token: Record<string, unknown> } | null }): boolean {
  return request.auth?.token.admin === true;
}

function trackingUrl(awb: string) {
  return `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}`;
}

function toTimestamp(value: unknown): number {
  const parsed = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

/**
 * Atomically enforces a per-order refresh cooldown. Runs inside a Firestore
 * transaction so concurrent requests serialize on the same cooldown document:
 * the first writer records the attempt and later concurrent writers abort,
 * re-run, observe the cooldown, and are rejected. Returns the timestamp of the
 * recorded attempt when the request may proceed.
 */
async function enforceRefreshCooldown(
  db: ReturnType<typeof getFirestore>,
  orderId: string,
): Promise<number> {
  const cooldownRef = db.collection("delhiveryCooldowns").doc(orderId);
  const now = Date.now();
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(cooldownRef);
    const last = snapshot.exists ? (snapshot.data()?.lastRefreshAt as number | undefined) : undefined;
    if (typeof last === "number" && now - last < DELHIVERY_REFRESH_COOLDOWN_MS) {
      throw new Error("cooldown");
    }
    transaction.set(cooldownRef, { orderId, lastRefreshAt: now, updatedAt: now });
  });
  return now;
}

/** Delhivery returns nested scan data; this parser accepts the documented response shape. */
function parseTracking(payload: unknown, awb: string): ShipmentRecord {
  const root = payload as { ShipmentData?: Array<{ ShipmentData?: Record<string, unknown> }> };
  const data = root?.ShipmentData?.[0]?.ShipmentData ?? {};
  const statusData = (data.Status ?? {}) as Record<string, unknown>;
  const scans = Array.isArray(data.Scans) ? data.Scans : [];
  const timeline = scans.map((scan) => {
    const entry = scan as Record<string, unknown>;
    const detail = (entry.ScanDetail ?? entry) as Record<string, unknown>;
    return {
      status: String(detail.Scan ?? detail.Status ?? detail.Instructions ?? "Shipment update"),
      at: toTimestamp(detail.ScanDateTime ?? detail.StatusDateTime),
    };
  });
  return {
    awb,
    courier: "Delhivery",
    status: String(statusData.Status ?? statusData.StatusType ?? "Shipment created"),
    trackingUrl: trackingUrl(awb),
    timeline,
    updatedAt: Date.now(),
  };
}

function orderStatusFromShipment(status: string): "Shipped" | "Delivered" | "Cancelled" | null {
  const normalized = status.toLowerCase();
  if (normalized.includes("delivered")) return "Delivered";
  if (normalized.includes("cancel") || normalized.includes("rto")) return "Cancelled";
  if (normalized.includes("picked") || normalized.includes("transit") || normalized.includes("out for delivery") || normalized.includes("dispatched")) return "Shipped";
  return null;
}

type CheckoutItem = {
  productId: string;
  qty: number;
  size?: string;
  color?: string;
};

type CheckoutRequest = {
  customer: { name: string; email: string; phone: string; address: string };
  payment: "Cash on Delivery";
  items: CheckoutItem[];
};

const validCustomer = (customer: CheckoutRequest["customer"]) =>
  typeof customer?.name === "string" && customer.name.trim().length >= 2 &&
  typeof customer?.email === "string" && customer.email.includes("@") &&
  typeof customer?.phone === "string" && /^\d{10}$/.test(customer.phone.replace(/\D/g, "").slice(-10)) &&
  typeof customer?.address === "string" && customer.address.trim().length >= 10;

/** Creates the order and reserves inventory in one trusted Firestore transaction. */
export const placeCodOrder = onCall({ region: "asia-south1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Please sign in to place an order.");
  const data = request.data as CheckoutRequest;
  if (data.payment !== "Cash on Delivery" || !validCustomer(data.customer)) {
    throw new HttpsError("invalid-argument", "Invalid checkout details.");
  }
  if (!Array.isArray(data.items) || data.items.length === 0 || data.items.some((item) =>
    typeof item.productId !== "string" || !Number.isInteger(item.qty) || item.qty < 1
  )) {
    throw new HttpsError("invalid-argument", "Invalid cart items.");
  }

  const quantities = new Map<string, number>();
  for (const item of data.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.qty);

  const db = getFirestore();
  const orderRef = db.collection("orders").doc();
  const now = Date.now();
  const order = await db.runTransaction(async (transaction) => {
    let subtotal = 0;
    let discounted = 0;
    const productData = new Map<string, FirebaseFirestore.DocumentData>();
    for (const [productId, qty] of quantities) {
      const productRef = db.collection("products").doc(productId);
      const snapshot = await transaction.get(productRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "A cart product is no longer available.");
      const product = snapshot.data()!;
      if (product.active !== true || !Number.isInteger(product.stock) || product.stock < qty) {
        throw new HttpsError("failed-precondition", "One or more items are out of stock.");
      }
      productData.set(productId, product);
      transaction.update(productRef, { stock: product.stock - qty });
    }

    const items = data.items.map((item) => {
      const product = productData.get(item.productId)!;
      subtotal += product.price * item.qty;
      discounted += product.discountPrice * item.qty;
      return {
        productId: item.productId,
        name: product.name,
        image: product.images[0] ?? "",
        price: product.discountPrice,
        qty: item.qty,
        ...(item.size ? { size: item.size } : {}),
        ...(item.color ? { color: item.color } : {}),
      };
    });
    const delivery = discounted > 50000 ? 0 : 499;
    const record = {
      id: orderRef.id,
      orderNumber: `PG${now.toString(36).toUpperCase()}`,
      userId: request.auth!.uid,
      customer: data.customer,
      items,
      subtotal,
      discount: subtotal - discounted,
      delivery,
      tax: 0,
      total: discounted + delivery,
      payment: "Cash on Delivery" as const,
      status: "Pending Confirmation" as const,
      createdAt: now,
      updatedAt: now,
    };
    transaction.create(orderRef, record);
    return record;
  });

  return { order };
});

/**
 * Attaches a Delhivery waybill created in the Delhivery merchant console.
 * Only an administrator may assign tracking to an order.
 */
export const assignDelhiveryWaybill = onCall({ region: "asia-south1" }, async (request) => {
  if (!request.auth || !isAdmin(request)) {
    throw new HttpsError("permission-denied", "Administrator access is required.");
  }
  const { orderId, awb } = request.data as { orderId?: unknown; awb?: unknown };
  if (typeof orderId !== "string" || !orderId || typeof awb !== "string" || !/^\d{8,24}$/.test(awb.trim())) {
    throw new HttpsError("invalid-argument", "A valid order ID and Delhivery waybill are required.");
  }
  const trimmedAwb = awb.trim();
  const db = getFirestore();
  const ref = db.collection("orders").doc(orderId);
  const now = Date.now();

  const order = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError("not-found", "Order not found.");
    const data = snapshot.data()!;
    if (INELIGIBLE_WAYBILL_STATUSES.has(data.status as string)) {
      throw new HttpsError("failed-precondition", "This order is not eligible for waybill assignment.");
    }
    const existing = data.shipment?.awb;
    if (typeof existing === "string" && existing) {
      if (existing === trimmedAwb) {
        // Idempotent: same waybill already assigned.
        return data;
      }
      throw new HttpsError("already-exists", "A waybill is already assigned to this order.");
    }
    const shipment: ShipmentRecord = {
      awb: trimmedAwb,
      courier: "Delhivery",
      status: "Shipment created",
      trackingUrl: trackingUrl(trimmedAwb),
      timeline: [],
      updatedAt: now,
    };
    transaction.update(ref, {
      shipment,
      status: "Shipped",
      updatedAt: now,
    });
    return { ...data, shipment, status: "Shipped" };
  });

  return { order };
});

/**
 * Reads Delhivery scans on the server, persists the latest result, and returns
 * it only to the owning customer or an administrator. The API token never
 * reaches the browser.
 */
export const refreshDelhiveryTracking = onCall(
  { region: "asia-south1", secrets: [delhiveryToken] },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Please sign in to track an order.");
    const { orderId } = request.data as { orderId?: unknown };
    if (typeof orderId !== "string" || !orderId) throw new HttpsError("invalid-argument", "Order ID is required.");

    const db = getFirestore();
    const ref = db.collection("orders").doc(orderId);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new HttpsError("not-found", "Order not found.");
    const order = snapshot.data()!;
    if (!isAdmin(request) && order.userId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "You cannot track this order.");
    }
    const awb = order.shipment?.awb;
    if (typeof awb !== "string" || !awb) {
      throw new HttpsError("failed-precondition", "Tracking will be available once the shipment is dispatched.");
    }

    // Enforce a server-side cooldown so repeated/concurrent refresh requests
    // cannot hammer the upstream Delhivery API. The credential never leaves the
    // server and upstream errors are returned as generic messages.
    try {
      await enforceRefreshCooldown(db, orderId);
    } catch (error) {
      if (error instanceof Error && error.message === "cooldown") {
        throw new HttpsError("failed-precondition", "Tracking was recently refreshed. Please try again shortly.");
      }
      throw error;
    }

    const response = await fetch(`${DELHIVERY_TRACK_URL}?waybill=${encodeURIComponent(awb)}`, {
      headers: { Authorization: `Token ${delhiveryToken.value()}`, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new HttpsError("unavailable", "Delhivery tracking is temporarily unavailable. Please try again shortly.");
    }
    const shipment = parseTracking(await response.json(), awb);
    const mappedStatus = orderStatusFromShipment(shipment.status);
    const updates = {
      shipment,
      updatedAt: Date.now(),
      ...(mappedStatus ? { status: mappedStatus } : {}),
    };
    await ref.update(updates);
    return { order: { ...order, ...updates } };
  }
);
