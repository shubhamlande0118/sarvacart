import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirestoreInstance, initializeAuth } from "./firebase";
import type { UserProfile } from "./types";

const usersCollection = "users";

function toUserProfile(uid: string, fb: FirebaseUser, role: "user" | "admin" = "user"): UserProfile {
  return {
    id: uid,
    name: fb.displayName ?? "",
    email: fb.email ?? "",
    phone: "",
    ...(fb.photoURL ? { avatarUrl: fb.photoURL } : {}),
    role,
    createdAt: Date.now(),
    onboarded: false,
  };
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const db = getFirestoreInstance();
  await setDoc(doc(db, usersCollection, profile.id), profile as DocumentData);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestoreInstance();
  const snap = await getDoc(doc(db, usersCollection, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<Omit<UserProfile, "id" | "email">>
): Promise<void> {
  const db = getFirestoreInstance();
  await updateDoc(doc(db, usersCollection, uid), patch as DocumentData);
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<FirebaseUser> {
  const auth = await initializeAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
  await createUserProfile(toUserProfile(cred.user.uid, cred.user));
  return cred.user;
}

export async function logInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const auth = await initializeAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function getCurrentIdToken(): Promise<string> {
  const auth = await initializeAuth();
  if (!auth.currentUser) throw new Error("Please sign in to continue.");
  return auth.currentUser.getIdToken();
}

export async function logInWithGoogle(): Promise<FirebaseUser> {
  const auth = await initializeAuth();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const fb = cred.user;
  const existing = await fetchUserProfile(fb.uid);
  if (!existing) {
    await createUserProfile(toUserProfile(fb.uid, fb));
  }
  return fb;
}

export async function logOut(): Promise<void> {
  const auth = await initializeAuth();
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = await initializeAuth();
  await sendPasswordResetEmail(auth, email);
}

export async function verifyEmail(): Promise<void> {
  const auth = await initializeAuth();
  const current = auth.currentUser;
  if (!current) throw new Error("No signed-in user.");
  await sendEmailVerification(current);
}

export async function changePassword(newPassword: string): Promise<void> {
  const auth = await initializeAuth();
  const current = auth.currentUser;
  if (!current) throw new Error("No signed-in user.");
  await updatePassword(current, newPassword);
}

export async function getAdminClaim(user: FirebaseUser): Promise<boolean> {
  const token = await user.getIdTokenResult();
  return token.claims.admin === true;
}

export async function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  const auth = await initializeAuth();
  return onAuthStateChanged(auth, callback);
}
