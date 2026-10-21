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
import { computeOrderTotals } from "./pricing";
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
  repoPlaceOrder,
  repoUpdateOrderStatus,
  repoFetchUser,
  repoGetAllOrders,
  repoSubscribeOrdersForUser,
  repoRefreshOrderTracking,
  repoAssignDelhiveryWaybill,
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
  isAuthReady: boolean;
  cart: CartItem[];
  orders: Order[];
  toasts: Toast[];
}

interface StoreContextValue extends StoreState {
  // auth
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "name" | "phone" | "address">>) => Promise<void>;
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
  ) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  refreshOrderTracking: (orderId: string) => Promise<void>;
  assignDelhiveryWaybill: (orderId: string, awb: string) => Promise<void>;
  // products (admin)
  addProduct: (p: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  // toast
  toast: (type: Toast["type"], message: string) => void;
  dismissToast: (id: string) => void;
}

/* ------------------------------- Persistence ------------------------------ */
const LS = {
  products: "sarvacart.products",
  cart: "sarvacart.cart",
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
    /* ignore */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* -------------------------------- Provider -------------------------------- */
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => read(LS.products, seedProducts));
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(!isFirebaseConfigured);
  const [cart, setCart] = useState<CartItem[]>(() => read<CartItem[]>(LS.cart, []));
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const timers = useRef<Record<string, number>>({});
  const reportFirebaseError = useCallback((err: unknown) => {
    const id = uid();
    setToasts((current) => [...current, { id, type: "error", message: toFriendlyFirebaseError(err) }]);
  }, []);

  // keep auth loading state referenced so TS doesn't error under noUnusedLocals
  useEffect(() => {
    void loadingAuth;
  }, [loadingAuth]);

useEffect(() => write(LS.products, products), [products]);
  useEffect(() => write(LS.cart, cart), [cart]);

  /* Firebase bootstrap: public products are safe to fetch before login. */
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const fbProducts = await repoGetProducts();
        if (cancelled) return;
        setProducts(fbProducts);
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

  // Firebase Auth is authoritative. Do not make protected-route decisions
  // until persistence has been configured and the first auth callback arrives.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const { onAuthStateChange, getAdminClaim } = await import("../services/auth");
      unsubscribe = await onAuthStateChange(async (firebaseUser) => {
        if (!active) return;
        if (!firebaseUser) {
          setUser(null);
          setIsAdmin(false);
          setOrders([]);
          setIsAuthReady(true);
          return;
        }
        try {
          const [profile, admin] = await Promise.all([
            repoFetchUser(firebaseUser.uid),
            getAdminClaim(firebaseUser),
          ]);
          if (!active) return;
          setUser({
            id: firebaseUser.uid,
            name: profile?.name || firebaseUser.displayName || "Customer",
            email: profile?.email || firebaseUser.email || "",
            phone: profile?.phone,
            address: (profile as (typeof profile & { address?: string }) | null)?.address,
            createdAt: profile?.createdAt || Date.now(),
          });
          setIsAdmin(admin);
        } catch (err) {
          if (active) reportFirebaseError(err);
        } finally {
          if (active) setIsAuthReady(true);
        }
      });
    })().catch((err) => {
      if (active) {
        reportFirebaseError(err);
        setIsAuthReady(true);
      }
    });
    return () => { active = false; unsubscribe?.(); };
  }, [reportFirebaseError]);

  // Regular customers only ever issue an owner-filtered query. The all-orders
  // query is reserved for a Firebase custom-claim administrator.
  useEffect(() => {
    if (!isFirebaseConfigured || !isAuthReady || !user) return;
    let cancelled = false;
    let unsubscribe: () => void = () => undefined;
    const load = async () => {
      try {
        if (isAdmin) {
          const result = await repoGetAllOrders();
          if (!cancelled) setOrders(result);
          return;
        }
        unsubscribe = repoSubscribeOrdersForUser(
          user.id,
          (result) => {
            if (!cancelled) setOrders(result);
          },
          (err) => {
            if (!cancelled) reportFirebaseError(err);
          },
        );
      } catch (err) {
        if (!cancelled) reportFirebaseError(err);
      }
    };
    void load();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user?.id, isAdmin, isAuthReady, reportFirebaseError]);

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

  /* Authentication is backed exclusively by Firebase Auth. */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoadingAuth(true);
      try {
        if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
        const { signUpWithEmail } = await import("../services/auth");
        // signUpWithEmail uses the User returned by Firebase directly to write
        // /users/{uid}; it never reads auth.currentUser as a race-prone proxy.
        await signUpWithEmail(name, email, password);
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
        if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
        const { logInWithEmail } = await import("../services/auth");
        await logInWithEmail(email, password);
        // The auth subscription updates user and protected routes.
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

  const logout = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const { logOut } = await import("../services/auth");
      await logOut();
      toast("info", "You have been signed out.");
    } catch (err) {
      toast("error", toFriendlyFirebaseError(err));
    } finally {
      setLoadingAuth(false);
    }
  }, [toast]);

  const adminLogin = useCallback(
    async (email: string, password: string) => {
      try {
        if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
        const { getAdminClaim, logInWithEmail } = await import("../services/auth");
        const firebaseUser = await logInWithEmail(email, password);
        if (!await getAdminClaim(firebaseUser)) {
          await logout();
          toast("error", "This account does not have administrator access.");
          return false;
        }
        toast("success", "Admin access granted.");
        return true;
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
        return false;
      }
    },
    [logout, toast]
  );
  const adminLogout = logout;

  const updateProfile = useCallback(
    async (data: Partial<Pick<User, "name" | "phone" | "address">>) => {
      if (!user) return;
      const updated = { ...user, ...data };
      try {
        const { repoUpdateUser } = await import("../services/repository");
        await repoUpdateUser(user.id, data);
        setUser(updated);
        toast("success", "Profile updated.");
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
      }
    },
    [user, toast]
  );

  /* cart */
  const sameLine = (a: CartItem, b: CartItem) =>
    a.productId === b.productId && a.size === b.size && a.color === b.color;

  const addToCart = useCallback(
    (productId: string, qty = 1, opts?: { size?: string; color?: string }) => {
      const product = products.find((p) => p.id === productId);
      const requestedQty = Math.floor(qty);
      if (!product || product.stock <= 0 || requestedQty < 1) {
        toast("error", "This item is out of stock.");
        return;
      }
      const line: CartItem = { productId, qty: Math.min(requestedQty, product.stock), size: opts?.size, color: opts?.color };
      setCart((c) => {
        const idx = c.findIndex((x) => sameLine(x, line));
        if (idx >= 0) {
          const next = [...c];
          next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + requestedQty, product.stock) };
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
    setCart((c) => c.flatMap((x) => {
      if (!sameLine(x, item)) return [x];
      const product = products.find((p) => p.id === x.productId);
      const boundedQty = Math.min(Math.max(Math.floor(qty), 0), product?.stock ?? 0);
      return boundedQty > 0 ? [{ ...x, qty: boundedQty }] : [];
    }));
  }, [products]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);

  /* orders */
  const placeOrder = useCallback(
    async (customer: Order["customer"], payment: Order["payment"]) => {
      if (!user || cart.length === 0) return null;
      if (!isFirebaseConfigured) {
        toast("error", "Checkout requires Firebase to be configured.");
        return null;
      }
      const invalidLine = cart.some((c) => !products.find((p) => p.id === c.productId));
      if (invalidLine) {
        toast("error", "One or more cart products are no longer available.");
        return null;
      }
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
      const { subtotal, discount, delivery, total } = computeOrderTotals(
        cart.map((c) => {
          const p = products.find((x) => x.id === c.productId)!;
          return { price: p.price, discountPrice: p.discountPrice, qty: c.qty };
        }),
      );

      const order: Order = {
        id: "PG" + Date.now().toString(36).toUpperCase(),
        userId: user.id,
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
      try {
        // Firestore rules bind the order to the authenticated owner and COD
        // status. Cart clearing happens only after the create succeeds.
        const confirmed = await repoPlaceOrder(order);
        setOrders((o) => [confirmed, ...o.filter((existing) => existing.id !== confirmed.id)]);
        setCart([]);
        toast("success", "Order placed successfully!");
        return confirmed;
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
        return null;
      }
    },
    [cart, products, user, toast]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      if (!isAdmin) {
        toast("error", "Administrator access is required.");
        return;
      }
      try {
        if (isFirebaseConfigured) await repoUpdateOrderStatus(orderId, status);
        setOrders((o) => o.map((x) => (x.id === orderId ? { ...x, status } : x)));
        toast("success", `Order ${orderId} → ${status}`);
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
      }
    },
    [isAdmin, toast]
  );

  const refreshOrderTracking = useCallback(async (orderId: string) => {
    try {
      const refreshed = await repoRefreshOrderTracking(orderId);
      setOrders((current) => current.map((order) => order.id === orderId ? refreshed : order));
      toast("success", "Tracking updated.");
    } catch (err) {
      toast("error", toFriendlyFirebaseError(err));
    }
  }, [toast]);

  const assignDelhiveryWaybill = useCallback(async (orderId: string, awb: string) => {
    if (!isAdmin) {
      toast("error", "Administrator access is required.");
      return;
    }
    try {
      const updated = await repoAssignDelhiveryWaybill(orderId, awb);
      setOrders((current) => current.map((order) => order.id === orderId ? updated : order));
      toast("success", "Delhivery tracking assigned.");
    } catch (err) {
      toast("error", toFriendlyFirebaseError(err));
    }
  }, [isAdmin, toast]);

/* product CRUD */
  const addProduct = useCallback(
    async (p: Omit<Product, "id" | "createdAt">) => {
      try {
        const persisted = isFirebaseConfigured ? await repoUpsertProduct(p) : null;
        const product: Product = persisted ?? { ...p, id: uid(), createdAt: Date.now() };
        setProducts((list) => [product, ...list]);
        toast("success", `${p.name} added.`);
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
        throw err;
      }
    },
    [toast]
  );
const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      const current = products.find((p) => p.id === id);
      if (!current) return;
      try {
        if (isFirebaseConfigured) await repoUpsertProduct({ ...current, ...patch, id });
        setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
        toast("success", "Product updated.");
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
        throw err;
      }
    },
    [toast, products]
  );
  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        if (isFirebaseConfigured) await repoDeleteProduct(id);
        setProducts((list) => list.filter((p) => p.id !== id));
        toast("info", "Product deleted.");
      } catch (err) {
        toast("error", toFriendlyFirebaseError(err));
        throw err;
      }
    },
    [toast]
  );
  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  const value: StoreContextValue = {
    products,
    user,
    isAdmin,
    isAuthReady,
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
    refreshOrderTracking,
    assignDelhiveryWaybill,
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
