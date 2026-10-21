import { seedProducts, type Product } from "../data/seed";

// NOTE: Step 1 scaffolding only. This service abstracts the data boundary so
// we can swap localStorage to Firestore in subsequent steps without changing UI.

export type OrderStatus =
  | "Pending Confirmation"
  | "Pending"
  | "Processing"
  | "Packed"
  | "Picked Up"
  | "In Transit"
  | "Out For Delivery"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  qty: number;
  size?: string;
  color?: string;
}

export interface OrderLine {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customer: { name: string; email: string; phone: string; address: string };
  items: OrderLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  payment: "Cash on Delivery" | "UPI" | "Online Payment";
  status: OrderStatus;
  shipment?: {
    awb: string;
    courier: string;
    status: string;
    trackingUrl: string;
    timeline?: { status: string; at: number }[];
    updatedAt: number;
  };
  createdAt: number;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface StoreSnapshot {
  products: Product[];
  user: User | null;
  isAdmin: boolean;
  cart: CartItem[];
  orders: Order[];
}

export interface StoreService {
  // products
  getProducts: () => Promise<Product[]>;
  upsertProduct: (p: Omit<Product, "id" | "createdAt"> & { id?: string }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // auth
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean }>;
  login: (email: string, password: string) => Promise<{ ok: boolean }>;
  logout: () => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<{ ok: boolean }>;
  adminLogout: () => Promise<void>;
  updateProfile: (
    data: Partial<Pick<User, "name" | "phone" | "address">>
  ) => Promise<{ ok: boolean }>;

  // cart
  addToCart: (productId: string, qty: number, opts?: { size?: string; color?: string }) => Promise<void>;
  removeFromCart: (item: CartItem) => Promise<void>;
  setQty: (item: CartItem, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // orders
  placeOrder: (customer: Order["customer"], payment: Order["payment"]) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

  // snapshot
  snapshot: () => Promise<StoreSnapshot>;
}

const LS = {
  products: "sarvacart.products",
  users: "sarvacart.users",
  session: "sarvacart.session",
  admin: "sarvacart.admin",
  cart: "sarvacart.cart",
  orders: "sarvacart.orders",
};


function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function sameLine(a: CartItem, b: CartItem) {
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

// LocalStorage-backed implementation for Step 1 scaffolding.
export function createStoreService(): StoreService {
  return {
    async getProducts() {
      return read<Product[]>(LS.products, seedProducts);
    },

    async upsertProduct(p) {
      const products = read<Product[]>(LS.products, seedProducts);
      const now = Date.now();
      const product: Product = p.id
        ? (products.find((x) => x.id === p.id) ? { ...(products.find((x) => x.id === p.id) as Product), ...p, createdAt: (products.find((x) => x.id === p.id) as Product).createdAt } : ({ ...(p as Product), id: p.id, createdAt: now } as Product))
        : { ...(p as Omit<Product, "id" | "createdAt">), id: uid(), createdAt: now };
      const idx = products.findIndex((x) => x.id === product.id);
      if (idx >= 0) {
        products[idx] = product;
      } else {
        products.unshift(product);
      }
      write(LS.products, products);
    },

    async deleteProduct(id) {
      const products = read<Product[]>(LS.products, seedProducts);
      write(LS.products, products.filter((p) => p.id !== id));
    },

    async register(_name, _email, _password) {
      throw new Error("Legacy localStorage registration is disabled. Use Firebase Authentication.");
    },

    async login(_email, _password) {
      throw new Error("Legacy localStorage login is disabled. Use Firebase Authentication.");
    },

    async logout() {
      write(LS.session, null);
    },

    async adminLogin(email, password) {
      // Kept only for compatibility with the unused legacy adapter. Admin
      // authorization is Firebase custom-claim based in StoreContext.
      void email;
      void password;
      return { ok: false };
    },

    async adminLogout() {
      write(LS.admin, false);
    },

    async updateProfile(data) {
      const session = read<string | null>(LS.session, null);
      if (!session) return { ok: false };
      const users = read<User[]>(LS.users, []);
      const idx = users.findIndex((u) => u.id === session);
      if (idx < 0) return { ok: false };
      users[idx] = { ...users[idx], ...data };
      write(LS.users, users);
      return { ok: true };
    },

    async addToCart(productId, qty, opts) {
      const products = read<Product[]>(LS.products, seedProducts);
      const product = products.find((p) => p.id === productId);
      if (!product || product.stock <= 0) return;

      const cart = read<CartItem[]>(LS.cart, []);
      const line: CartItem = { productId, qty, size: opts?.size, color: opts?.color };
      const idx = cart.findIndex((x) => sameLine(x, line));
      if (idx >= 0) {
        cart[idx] = { ...cart[idx], qty: Math.min(cart[idx].qty + qty, product.stock) };
      } else {
        cart.push(line);
      }
      write(LS.cart, cart);
    },

    async removeFromCart(item) {
      const cart = read<CartItem[]>(LS.cart, []);
      write(LS.cart, cart.filter((x) => !sameLine(x, item)));
    },

    async setQty(item, qty) {
      const products = read<Product[]>(LS.products, seedProducts);
      const product = products.find((p) => p.id === item.productId);
      const stock = product?.stock ?? qty;
      const cart = read<CartItem[]>(LS.cart, []);
      const next = cart
        .map((x) => (sameLine(x, item) ? { ...x, qty: Math.min(Math.max(qty, 0), stock) } : x))
        .filter((x) => x.qty > 0);
      write(LS.cart, next);
    },

    async clearCart() {
      write(LS.cart, []);
    },

    async placeOrder(customer, payment) {
      const products = read<Product[]>(LS.products, seedProducts);
      const cart = read<CartItem[]>(LS.cart, []);
      const session = read<string | null>(LS.session, null);
      if (cart.length === 0) return null;

      const lines: OrderLine[] = cart.map((c) => {
        const p = products.find((x) => x.id === c.productId);
        if (!p) throw new Error("Product not found");
        return {
          productId: c.productId,
          name: p.name,
          image: p.images[0],
          price: p.discountPrice,
          qty: c.qty,
          size: c.size,
          color: c.color,
        };
      });

      const subtotal = cart.reduce((s, c) => {
        const p = products.find((x) => x.id === c.productId);
        if (!p) return s;
        return s + p.price * c.qty;
      }, 0);
      const discounted = cart.reduce((s, c) => {
        const p = products.find((x) => x.id === c.productId);
        if (!p) return s;
        return s + p.discountPrice * c.qty;
      }, 0);
      const discount = subtotal - discounted;
      const delivery = discounted > 50000 ? 0 : 499;
      const total = discounted + delivery;

      const order: Order = {
        id: "PG" + Date.now().toString(36).toUpperCase(),
        userId: session,
        customer,
        items: lines,
        subtotal,
        discount,
        delivery,
total,
        payment,
        status: "Pending Confirmation",
        createdAt: Date.now(),
      };

      const orders = read<Order[]>(LS.orders, []);
      write(LS.orders, [order, ...orders]);

      // reduce stock
      const updatedProducts = products.map((p) => {
        const ordered = cart
          .filter((c) => c.productId === p.id)
          .reduce((n, c) => n + c.qty, 0);
        return ordered ? { ...p, stock: Math.max(0, p.stock - ordered) } : p;
      });
      write(LS.products, updatedProducts);
      write(LS.cart, []);
      return order;
    },

    async updateOrderStatus(orderId, status) {
      const orders = read<Order[]>(LS.orders, []);
      write(
        LS.orders,
        orders.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    },

    async snapshot() {
      const products = read<Product[]>(LS.products, seedProducts);
      const session = read<string | null>(LS.session, null);
      const users = read<User[]>(LS.users, []);
      const user = session ? users.find((u) => u.id === session) ?? null : null;
      const isAdmin = read<boolean>(LS.admin, false);
      const cart = read<CartItem[]>(LS.cart, []);
      const orders = read<Order[]>(LS.orders, []);
      return { products, user, isAdmin, cart, orders };
    },
  };
}

