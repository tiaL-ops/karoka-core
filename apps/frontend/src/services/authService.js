// frontend/src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import {
  createUserProfile,
  getUserProfile,
  updateLastActive,
} from "@/services/userService";

/**
 * Signs up a new user with email+password, then immediately creates a Firestore document
 * under /users/{uid} 
 *
 * - role defaults to "user".
 */
export async function signup(email, password, displayName, role = "user") {
  // 1) Create Auth user
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;
  // 2) Immediately write Firestore doc for this user
  await createUserProfile(user, displayName, role);

  return user;
}

/**
 * Signs in with email+password. After login, updates `lastActiveAt`.
 */
export async function loginEmail(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // Update lastActiveAt
  await updateLastActive(user.uid);
  return user;
}

/**
 * Signs in with Google popup. If this is the first time the user logs in (no /users/{uid} doc),
 * we create one automatically with role="user". Otherwise, we just update lastActiveAt.
 */
export async function loginGoogle() {
  const userCred = await signInWithPopup(auth, googleProvider);
  const user = userCred.user;
  const uid = user.uid;

  const existingProfile = await getUserProfile(uid);
  if (!existingProfile) {
    // First‐time Google login: create a Firestore doc
    await createUserProfile(user, user.displayName || "", "user");
  } else {
    // Just update lastActiveAt
    await updateLastActive(uid);
  }

  return user;
}

/**
 * Signs out the current user.
 */
export async function logout() {
  return signOut(auth);
}
