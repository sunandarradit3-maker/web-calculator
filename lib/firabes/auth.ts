// lib/firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { User } from "@/types";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// --- SIGN UP with Email ---
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await createUserDocument(cred.user, { displayName });
  return cred.user;
}

// --- SIGN IN with Email ---
export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// --- SIGN IN with Google ---
export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserDocument(cred.user);
  return cred.user;
}

// --- SIGN IN with GitHub ---
export async function signInWithGithub() {
  const cred = await signInWithPopup(auth, githubProvider);
  await createUserDocument(cred.user);
  return cred.user;
}

// --- SIGN OUT ---
export async function logOut() {
  await signOut(auth);
}

// --- RESET PASSWORD ---
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// --- CREATE USER DOCUMENT (Firestore) ---
async function createUserDocument(
  firebaseUser: FirebaseUser,
  extra?: Partial<User>
) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const newUser: Partial<User> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: extra?.displayName || firebaseUser.displayName || "Student",
      photoURL: firebaseUser.photoURL || undefined,
      role: "student",
      level: 1,
      xp: 0,
      streak: 0,
      stats: {
        totalQuizzes: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracy: 0,
        avgScore: 0,
        bestScore: 0,
        totalStudyMinutes: 0,
        badges: [],
        rankGlobal: 0,
        rankWeekly: 0,
      },
      settings: {
        theme: "dark",
        language: "id",
        notifications: true,
        soundEffects: true,
        timerEnabled: true,
      },
      // @ts-ignore
      createdAt: serverTimestamp(),
      // @ts-ignore
      lastActive: serverTimestamp(),
    };
    await setDoc(ref, newUser);
  } else {
    // Update last active
    // @ts-ignore
    await setDoc(ref, { lastActive: serverTimestamp() }, { merge: true });
  }
}

// --- AUTH STATE LISTENER ---
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
