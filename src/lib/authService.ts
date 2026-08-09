import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as fbUpdateProfile,
  updatePassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User as FbUser,
} from "firebase/auth";

import {
  auth as getAuth,
  isFirebaseConfigured,
} from "./firebaseExports";

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
}

function mapUser(user: FbUser): AuthUser {
  return {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
  };
}

export function subscribeToAuthState(
  cb: (user: AuthUser | null) => void
): () => void {
  if (!isFirebaseConfigured) {
    // No real auth backend — notify with null so the app falls back to demo/local.
    cb(null);
    return () => {};
  }
  const auth = getAuth();
  return onAuthStateChanged(auth, (u) => {
    cb(u ? mapUser(u) : null);
  });
}

export async function emailSignup(params: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  const { name, email, password } = params;
  const auth = getAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await fbUpdateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
}

export async function emailLogin(params: {
  email: string;
  password: string;
}): Promise<void> {
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, params.email, params.password);
}

export async function googleLogin(): Promise<void> {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  await signInWithPopup(auth, provider);
}

export async function forgotPassword(email: string): Promise<void> {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
}

export async function logout(): Promise<void> {
  const auth = getAuth();
  await signOut(auth);
}

export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const auth = getAuth();
  if (!auth.currentUser) throw new Error("No authenticated user.");
  await updatePassword(auth.currentUser, params.newPassword);
}

export { isFirebaseConfigured };
