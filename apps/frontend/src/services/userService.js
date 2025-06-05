// frontend/src/services/userService.js
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Creates a Firestore document at /users/{uid} 
 * - If role === "controlled", it omits email/displayName .
 * - Uses ISO strings for `createdAt` and `lastActiveAt`.
 */
export async function createUserProfile(user, displayName, role = "user") {
  if (!user || !user.uid) {
    throw new Error("createUserProfile: invalid user object");
  }

  const uid = user.uid;
  const userRef = doc(db, "users", uid);
  const nowIso = new Date().toISOString();

  // Build the base data. If role === "controlled", we omit PII fields.
  const base = {
    role,
    createdAt: nowIso,
    lastActiveAt: nowIso,
    sessionId: null,
    currentProgress: {
      currentArena: null,
      lastPlayedGameId: null,
    },
  };

  if (role !== "controlled") {
    base.email = user.email || null;
    base.displayName = displayName || user.displayName || null;
  }

  await setDoc(userRef, base);
  return base;
}

/**
 * Fetches the user document under /users/{uid}. Returns `data()` or null if not found.
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Updates only the `lastActiveAt` field to now.
 */
export async function updateLastActive(uid) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    lastActiveAt: new Date().toISOString(),
  });
}

/**
 * Sets or clears the sessionId under /users/{uid}.
 * Pass `sessionId = null` if you want to clear it.
 */
export async function setSessionId(uid, sessionId) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    sessionId: sessionId,
  });
}
