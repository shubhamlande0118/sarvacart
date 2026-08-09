import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { seedProducts, type Product } from "../data/seed";
import {
  type CartItem,
  type Order,
  type OrderLine,
  type OrderStatus,
  type Toast,
  type User,
} from "../services/storeService";
import {
  isFirebaseConfigured,
  repoGetProducts,
  repoUpsertProduct,
  repoDeleteProduct,
  repoReduceStock,
  repoCreateUser,
  repoPlaceOrder,
  repoUpdateOrderStatus,
  repoGetAllOrders,
} from "../services/repository";
import { toFriendlyFirebaseError } from "./firebaseExports";

/* ---------------------------------- Types --------------------------------- */
// Types are defined in src/services/storeService for the data boundary.
// These re-exports are kept to avoid breaking existing UI imports.
export type {
  User,
  CartItem,
  OrderStatus,
  OrderLine,
  Order,
  Toast,
  StoreSnapshot,
} from "../services/storeService";

interface StoreState {
  products: Product[];
  user: User | null;
  isAdmin: boolean;
  cart: CartItem[];
  orders: Order[];
  toasts: Toast[];
}

interface StoreContextValue extends StoreState {
  // auth
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "phone" | "address">>) => void;
  // cart
  addToCart: (productId: string, qty?: number, opts?: { size?: string; color?: string }) => void;
  removeFromCart: (item: CartItem) => void;
  setQty: (item: CartItem, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  // orders
  placeOrder: (
    customer: Order["customer"],
    payment: Order["payment"]
  ) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  // products (admin)
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  // toast
  toast: (type: Toast["type"], message: string) => void;
  dismissToast: (id: string) => void;
}

/* ------------------------------- Persistence ------------------------------ */
const LS = {
  products: "sarvacart.products",
  users: "sarvacart.users",
  session: "sarvacart.session",
  admin: "sarvacart.admin",
  cart: "sarvacart.cart",
  orders: "sarvacart.orders",
};

const ADMIN_EMAIL = "admin@sarvacart.store";
const ADMIN_PASSWORD = "Admin@123";

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
    /* ignore */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* -------------------------------- Provider -------------------------------- */
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => read(LS.products, seedProducts));
  const [users, setUsers] = useState<User[]>(() => read<User[]>(LS.users, []));
  const [user, setUser] = useState<User | null>(() => {
    const id = read<string | null>(LS.session, null);
    if (!id) return null;
    return read<User[]>(LS.users, []).find((u) => u.id === id) ?? null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => read(LS.admin, false));
  const [cart, setCart] = useState<CartItem[]>(() => read<CartItem[]>(LS.cart, []));
  const [orders, setOrders] = useState<Order[]>(() => read<Order[]>(LS.orders, []));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const timers = useRef<Record<string, number>>({});

  // keep auth loading state referenced so TS doesn't error under noUnusedLocals
  useEffect(() => {
    void loadingAuth;
  }, [loadingAuth]);

useEffect(() => write(LS.products, products), [products]);
  useEffect(() => write(LS.users, users), [users]);
  useEffect(() => write(LS.cart, cart), [cart]);
  useEffect(() => write(LS.orders, orders), [orders]);
  useEffect(() => write(LS.session, user?.id ?? null), [user]);
  useEffect(() => write(LS.admin, isAdmin), [isAdmin]);

  /* Firebase bootstrap: when configured, hydrate products & orders from Firestore. */
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const [fbProducts, fbOrders] = await Promise.all([
          repoGetProducts(),
          repoGetAllOrders(),
        ]);
        if (cancelled) return;
        if (fbProducts.length) setProducts(fbProducts);
        if (fbOrders.length) setOrders(fbOrders);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("Firestore sync error:", err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* toasts */
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);
  const toast = useCallback(
    (type: Toast["type"], message: string) => {
      const id = uid();
      setToasts((t) => [...t, { id, type, message }]);
      timers.current[id] = window.setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast]
  );

  /* auth (Firebase only; local demo data remains for cart/products) */
  const register = useCallback(
async (name: string, email: string, password: string) => {
      setLoadingAuth(true);
      try {
        // actual signup + verification email
        const { emailSignup } = await import("./authService");
        await emailSignup({ name, email, password });
        // persist a Firestore profile when the backend is live
if (isFirebaseConfigured) {
          const { auth } = await import("./firebaseExports");
          const uid = auth().currentUser?.uid;
          if (uid) await repoCreateUser({ id: uid, name, email });
        }
toast("success", "Account created. Please verify your email.");
        return true;
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
        return false;
      } finally {
        setLoadingAuth(false);
      }
    },
    [toast]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setLoadingAuth(true);
      try {
        const { emailLogin } = await import("./authService");
        await emailLogin({ email, password });

// Let auth listener set user. We only return ok for navigation.
        toast("success", "Signed in successfully.");
        return true;
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
        return false;
      } finally {
        setLoadingAuth(false);
      }
    },
    [toast]
  );

  const logout = useCallback(() => {
    setLoadingAuth(true);
    (async () => {
      try {
        const { logout: fbLogout } = await import("./authService");
        await fbLogout();
        toast("info", "You have been signed out.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unable to sign out.";
        toast("error", msg);
      } finally {
        setLoadingAuth(false);
      }
    })();
  }, [toast]);

  const adminLogin = useCallback(
    async (email: string, password: string) => {
      if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setIsAdmin(true);
        toast("success", "Admin access granted.");
        return true;
      }
      toast("error", "Invalid admin credentials.");
      return false;
    },
    [toast]
  );
  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    toast("info", "Admin signed out.");
  }, [toast]);

  const updateProfile = useCallback(
    (data: Partial<Pick<User, "name" | "phone" | "address">>) => {
      if (!user) return;
      const updated = { ...user, ...data };
      setUser(updated);
      setUsers((list) => list.map((u) => (u.id === user.id ? updated : u)));
      toast("success", "Profile updated.");
    },
    [user, toast]
  );

  /* cart */
  const sameLine = (a: CartItem, b: CartItem) =>
    a.productId === b.productId && a.size === b.size && a.color === b.color;

  const addToCart = useCallback(
    (productId: string, qty = 1, opts?: { size?: string; color?: string }) => {
      const product = products.find((p) => p.id === productId);
      if (!product || product.stock <= 0) {
        toast("error", "This item is out of stock.");
        return;
      }
      const line: CartItem = { productId, qty, size: opts?.size, color: opts?.color };
      setCart((c) => {
        const idx = c.findIndex((x) => sameLine(x, line));
        if (idx >= 0) {
          const next = [...c];
          next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + qty, product.stock) };
          return next;
        }
        return [...c, line];
      });
      toast("success", `${product.name} added to cart.`);
    },
    [products, toast]
  );

  const removeFromCart = useCallback((item: CartItem) => {
    setCart((c) => c.filter((x) => !sameLine(x, item)));
  }, []);

  const setQty = useCallback((item: CartItem, qty: number) => {
    setCart((c) =>
      c
        .map((x) => (sameLine(x, item) ? { ...x, qty } : x))
        .filter((x) => x.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);

  /* orders */
  const placeOrder = useCallback(
    (customer: Order["customer"], payment: Order["payment"]) => {
      if (cart.length === 0) return null;
      const lines: OrderLine[] = cart.map((c) => {
        const p = products.find((x) => x.id === c.productId)!;
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
        const p = products.find((x) => x.id === c.productId)!;
        return s + p.price * c.qty;
      }, 0);
      const discounted = cart.reduce((s, c) => {
        const p = products.find((x) => x.id === c.productId)!;
        return s + p.discountPrice * c.qty;
      }, 0);
      const discount = subtotal - discounted;
      const delivery = discounted > 50000 ? 0 : 499;
      const total = discounted + delivery;

      const order: Order = {
        id: "PG" + Date.now().toString(36).toUpperCase(),
        userId: user?.id ?? null,
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
      setOrders((o) => [order, ...o]);
      // reduce stock
      setProducts((ps) =>
        ps.map((p) => {
          const ordered = cart.filter((c) => c.productId === p.id).reduce((n, c) => n + c.qty, 0);
          return ordered ? { ...p, stock: Math.max(0, p.stock - ordered) } : p;
        })
      );
      setCart([]);
      // sync to Firestore when the backend is live
      if (isFirebaseConfigured) {
        void repoPlaceOrder(order);
        void repoReduceStock(
          cart.map((c) => ({ productId: c.productId, qty: c.qty }))
        );
      }
      toast("success", "Order placed successfully!");
      return order;
    },
    [cart, products, user, toast]
  );

const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((o) => o.map((x) => (x.id === orderId ? { ...x, status } : x)));
      if (isFirebaseConfigured) void repoUpdateOrderStatus(orderId, status);
      toast("success", `Order ${orderId} → ${status}`);
    },
    [toast]
  );

/* product CRUD */
  const addProduct = useCallback(
    (p: Omit<Product, "id" | "createdAt">) => {
      const product: Product = { ...p, id: uid(), createdAt: Date.now() };
      setProducts((list) => [product, ...list]);
      if (isFirebaseConfigured) void repoUpsertProduct(product);
      toast("success", `${p.name} added.`);
    },
    [toast]
  );
const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      if (isFirebaseConfigured) {
        const current = products.find((p) => p.id === id);
        if (current) void repoUpsertProduct({ ...current, ...patch, id });
      }
      toast("success", "Product updated.");
    },
    [toast, products]
  );
  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((list) => list.filter((p) => p.id !== id));
      if (isFirebaseConfigured) void repoDeleteProduct(id);
      toast("info", "Product deleted.");
    },
    [toast]
  );
  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  const value: StoreContextValue = {
    products,
    user,
    isAdmin,
    cart,
    orders,
    toasts,
    register,
    login,
    logout,
    adminLogin,
    adminLogout,
    updateProfile,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    cartCount,
    placeOrder,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    toast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
