/**
 * Shared domain types for the Firebase-ready service layer.
 *
 * These mirror the shapes used by the localStorage-backed store so the UI
 * contracts stay stable while the backend is swapped in. Each type maps 1:1
 * to a Firestore document in the corresponding collection.
 */

/** Firestore: users */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: "user" | "admin";
  createdAt: number;
  /** Set to true when the Firestore profile is created after signup. */
  onboarded: boolean;
}

/** Firestore: categories */
export interface Category {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

/** Firestore: products */
export interface ProductVariant {
  size?: string;
  color?: string;
  price?: number;
  stock?: number;
}

export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
  likes: number;
  verifiedPurchase: boolean;
  createdAt: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  discountPrice: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  createdAt: number;
  active: boolean;
}

/** Firestore: cart */
export interface CartLine {
  productId: string;
  qty: number;
  size?: string;
  color?: string;
}

export interface CartDoc {
  userId: string;
  items: CartLine[];
  updatedAt: number;
}

/** Firestore: wishlist */
export interface WishlistDoc {
  userId: string;
  productIds: string[];
  updatedAt: number;
}

/** Firestore: addresses */
export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

/** Firestore: orders */
export type OrderStatus =
  | "Pending Confirmation"
  | "Pending"
  | "Processing"
  | "Packed"
  | "Picked Up"
  | "In Transit"
  | "Out For Delivery"
  | "Delivered"
  | "Cancelled";

export interface OrderLine {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}

export interface OrderShipment {
  awb: string;
  trackingNumber: string;
  courier: string;
  estimatedDelivery: number;
  status: string;
  timeline: { status: string; at: number }[];
  updatedAt: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  payment: "Cash on Delivery" | "UPI" | "Online Payment";
  paymentRef?: string;
  status: OrderStatus;
  shipment?: OrderShipment;
  createdAt: number;
  updatedAt: number;
}

/** Firestore: coupons */
export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: number;
  active: boolean;
  usageLimit: number;
  usedCount: number;
}

/** Firestore: payments */
export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string | null;
  method: string;
  provider: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: number;
}

/** Firestore: notifications */
export type NotificationType =
  | "order_confirmed"
  | "order_packed"
  | "order_shipped"
  | "order_delivered"
  | "offer";

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

/** Firestore: settings */
export interface SettingsRecord {
  id: string;
  key: string;
  value: unknown;
  updatedAt: number;
}
