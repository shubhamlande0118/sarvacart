import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreInstance } from "./firebase";
import type { OrderRecord, OrderStatus } from "./types";

export const orderConverter: FirestoreDataConverter<OrderRecord> = {
  toFirestore(order: OrderRecord): DocumentData {
    return order;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): OrderRecord {
    const data = snapshot.data();
    return { ...(data as OrderRecord), id: snapshot.id };
  },
};

export async function createOrder(
  order: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">
): Promise<OrderRecord> {
  const db = getFirestoreInstance();
  const ref = doc(collection(db, "orders"));
  const now = Date.now();
  const record: OrderRecord = {
    ...order,
    id: ref.id,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref.withConverter(orderConverter), record);
  return record;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const db = getFirestoreInstance();
  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: Date.now(),
  });
}

export async function fetchOrdersByUser(userId: string): Promise<OrderRecord[]> {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, "orders").withConverter(orderConverter),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function fetchAllOrders(): Promise<OrderRecord[]> {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, "orders").withConverter(orderConverter),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/** Realtime subscription for a user's orders. Returns an unsubscribe fn. */
export function subscribeToUserOrders(
  userId: string,
  onData: (orders: OrderRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, "orders").withConverter(orderConverter),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap: QuerySnapshot<OrderRecord>) => onData(snap.docs.map((d) => d.data())),
    (err) => onError(err as Error)
  );
}
