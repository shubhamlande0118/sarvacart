import { createHash } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type DocumentData } from "firebase-admin/firestore";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type CheckoutItem = {
  productId: string;
  qty: number;
  size?: string;
  color?: string;
};

type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type CheckoutBody = {
  customer: Customer;
  payment: "Cash on Delivery";
  items: CheckoutItem[];
};

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not configured.");
  const serviceAccount = JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") return false;
  const customer = value as Partial<Customer>;
  return typeof customer.name === "string" && customer.name.trim().length >= 2
    && typeof customer.email === "string" && /^\S+@\S+\.\S+$/.test(customer.email)
    && typeof customer.phone === "string" && /^\d{10}$/.test(customer.phone.replace(/\D/g, "").slice(-10))
    && typeof customer.address === "string" && customer.address.trim().length >= 10;
}

function isCheckoutItem(value: unknown): value is CheckoutItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CheckoutItem>;
  return typeof item.productId === "string" && item.productId.length > 0
    && typeof item.qty === "number" && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 100
    && (item.size === undefined || typeof item.size === "string")
    && (item.color === undefined || typeof item.color === "string");
}

function idempotencyId(uid: string, key: string) {
  return createHash("sha256").update(`${uid}:${key}`).digest("hex");
}

function sendError(response: VercelResponse, status: number, message: string, code?: string) {
  response.setHeader("Cache-Control", "private, no-store");
  const body: Record<string, string> = { error: message };
  if (code) body.code = code;
  return response.status(status).json(body);
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Content-Type", "application/json");

  try {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return sendError(response, 405, "Method not allowed.");
    }

    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      return sendError(response, 401, "Authentication is required.", "MISSING_AUTHORIZATION_HEADER");
    }

    try {
      const app = getAdminApp();
      const token = await getAuth(app).verifyIdToken(authorization.slice(7));
      const body = request.body as Partial<CheckoutBody>;
      if (body.payment !== "Cash on Delivery" || !isCustomer(body.customer)
        || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100
        || body.items.some((item) => !isCheckoutItem(item))) {
        return sendError(response, 400, "Invalid checkout details.");
      }

      const itemsInput = body.items as CheckoutItem[];
      const quantities = new Map<string, number>();
      for (const item of itemsInput) {
        quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.qty);
      }

      const db = getFirestore(app);
      const orderRef = db.collection("orders").doc();
      const requestKey = request.headers["idempotency-key"];
      const requestRef = typeof requestKey === "string"
        ? db.collection("orderRequests").doc(idempotencyId(token.uid, requestKey))
        : null;
      const now = Date.now();

      const order = await db.runTransaction(async (transaction) => {
        if (requestRef) {
          const previous = await transaction.get(requestRef);
          if (previous.exists) return previous.data()?.order as DocumentData;
        }

        const productSnapshots = new Map<string, DocumentData>();
        for (const [productId, qty] of quantities) {
          const productRef = db.collection("products").doc(productId);
          const snapshot = await transaction.get(productRef);
          if (!snapshot.exists) throw new Error("A cart product is no longer available.");
          const product = snapshot.data() as DocumentData;
          if (product.active !== true || !Number.isInteger(product.stock) || product.stock < qty
            || typeof product.price !== "number" || typeof product.discountPrice !== "number") {
            throw new Error("One or more items are out of stock.");
          }
          productSnapshots.set(productId, product);
        }

        let subtotal = 0;
        let discounted = 0;
        const items = itemsInput.map((item) => {
          const product = productSnapshots.get(item.productId)!;
          subtotal += product.price * item.qty;
          discounted += product.discountPrice * item.qty;
          transaction.update(db.collection("products").doc(item.productId), {
            stock: product.stock - quantities.get(item.productId)!,
          });
          return {
            productId: item.productId,
            name: String(product.name ?? "Product"),
            image: Array.isArray(product.images) ? String(product.images[0] ?? "") : "",
            price: product.discountPrice,
            qty: item.qty,
            sellerId: String(product.sellerId ?? ""),
            sellerName: String(product.sellerName ?? ""),
            ...(item.size ? { size: item.size } : {}),
            ...(item.color ? { color: item.color } : {}),
          };
        });
        const delivery = discounted > 50000 ? 0 : 499;
        const record = {
          id: orderRef.id,
          orderNumber: `PG${now.toString(36).toUpperCase()}`,
          userId: token.uid,
          customer: body.customer,
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
        if (requestRef) transaction.create(requestRef, { uid: token.uid, order: record, createdAt: now });

        // --- Commission calculation (server-side, 10% default) ---
        const commissionRate = 0.10;
        const itemsBySeller = new Map<string, { gross: number; items: typeof items }>();
        for (const item of items) {
          const sid = item.sellerId || "admin";
          const existing = itemsBySeller.get(sid) || { gross: 0, items: [] };
          existing.gross += item.price * item.qty;
          existing.items.push(item);
          itemsBySeller.set(sid, existing);
        }
        const commissionRefs: DocumentData[] = [];
        for (const [sellerId, data] of itemsBySeller.entries()) {
          const grossAmount = data.gross;
          const commissionAmount = Math.round(grossAmount * commissionRate * 100) / 100;
          const sellerAmount = Math.round((grossAmount - commissionAmount) * 100) / 100;
          const commissionRef = db.collection("commissions").doc();
          commissionRefs.push({
            id: commissionRef.id,
            orderId: orderRef.id,
            sellerId,
            grossAmount,
            commissionRate,
            commissionAmount,
            sellerAmount,
            status: "pending",
            createdAt: now,
          });
          transaction.create(commissionRef, commissionRefs[commissionRefs.length - 1]);
        }

        return record;
      });

      response.setHeader("Cache-Control", "private, no-store");
      const confirmation = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        payment: order.payment,
        customer: { name: order.customer.name },
      };
      return response.status(201).json({ order: confirmation });
    } catch (error) {
      const err = error as { code?: string; message?: string };

      const code = err.code || "";
      const message = err.message || "";

      if (message === "FIREBASE_SERVICE_ACCOUNT is not configured.") {
        return sendError(response, 500, "Checkout service is not configured.", "FIREBASE_ADMIN_NOT_CONFIGURED");
      }
      if (message.includes("JSON.parse") || message.includes("Unexpected token")) {
        return sendError(response, 500, "Checkout service configuration is invalid.", "FIREBASE_ADMIN_CONFIG_INVALID");
      }
      if (code === "auth/id-token-expired" || message.includes("id-token-expired") || message.includes("token expired")) {
        return sendError(response, 401, "Authentication token has expired.", "TOKEN_EXPIRED");
      }
      if (code === "auth/id-token-revoked" || message.includes("id-token-revoked")) {
        return sendError(response, 401, "Authentication token has been revoked.", "TOKEN_REVOKED");
      }
      if (code === "auth/user-disabled" || message.includes("user-disabled")) {
        return sendError(response, 401, "This account has been disabled.", "USER_DISABLED");
      }
      if (code === "auth/user-not-found" || message.includes("user-not-found")) {
        return sendError(response, 401, "Firebase Auth user not found.", "AUTH_USER_NOT_FOUND");
      }
      if (code === "auth/argument-error" || message.includes("argument-error") || message.includes("no \"aud\" claim")) {
        return sendError(response, 401, "Invalid ID token. Token may be from a different Firebase project or malformed.", "INVALID_ID_TOKEN");
      }
      if (code === "auth/invalid-id-token" || message.includes("invalid-id-token")) {
        return sendError(response, 401, "Invalid ID token format.", "INVALID_ID_TOKEN_FORMAT");
      }
      if (code.startsWith("auth/") || message.includes("auth/") || message.includes("token") || message.includes("credential")) {
        return sendError(response, 401, "Authentication failed.", "AUTHENTICATION_FAILED");
      }
      if (message.includes("cart product")) {
        return sendError(response, 400, message, "PRODUCT_NOT_FOUND");
      }
      if (message.includes("out of stock")) {
        return sendError(response, 409, message, "OUT_OF_STOCK");
      }
      if (message.includes("permission") || message.includes("denied")) {
        return sendError(response, 403, "Database access denied.", "FIRESTORE_PERMISSION_DENIED");
      }
      if (message.includes("not-found") || message.includes("does not exist")) {
        return sendError(response, 404, "Resource not found.", "RESOURCE_NOT_FOUND");
      }
      if (message.includes("already-exists")) {
        return sendError(response, 409, "Order already exists.", "ORDER_ALREADY_EXISTS");
      }
      if (message.includes("deadline") || message.includes("timeout")) {
        return sendError(response, 504, "Request timed out.", "REQUEST_TIMEOUT");
      }
      if (message.includes("unavailable") || message.includes("internal")) {
        return sendError(response, 503, "Database temporarily unavailable.", "FIRESTORE_TEMPORARILY_UNAVAILABLE");
      }
      return sendError(response, 500, "Unable to create the order. Please try again.", "ORDER_CREATION_FAILED");
    }
    } catch (error) {
    // Outer safety net: any uncaught error (including platform/runtime issues)
    // must still return valid JSON, never an empty response.
    console.error("[orders/create] Uncaught error:", error);
    response.setHeader("Cache-Control", "private, no-store");
    return response.status(500).json({ error: "Unable to create the order. Please try again." });
  }
}
