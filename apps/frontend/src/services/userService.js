// frontend/src/services/userService.js
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

// Import auth to get the current user and their ID token
import { auth } from "@/firebase"; // ADD THIS LINE

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Assuming VITE_API_BASE_URL is defined in .env and available

/**
 * Creates a Firestore document at /users/{uid}
 * AND calls the backend API to create a user in PostgreSQL.
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

  // 1. Prepare data for Firestore
  const firestoreData = {
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
    firestoreData.email = user.email || null;
    firestoreData.displayName = displayName || user.displayName || null;
  }

  // 2. Write to Firestore
  await setDoc(userRef, firestoreData);

  // 3. Prepare and send data to Flask Backend for PostgreSQL
  const backendData = {
    id: uid, // Use Firebase UID as the ID for PostgreSQL
    name: displayName || user.displayName || user.email || "New User", // Name for PostgreSQL
   
    // You can add other fields here that your backend User model expects, e.g., bio, age, sex
    // based on what your signupPage.jsx might collect or you want to default.
    // For now, let's keep it minimal as per your User model's non-nullable fields.
  };

  try {
    // Get the Firebase ID token for authentication with your backend
    const token = await user.getIdToken();
    console.log("Starting user in backend PostgreSQL with token:", token);

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Attach the Firebase ID token
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend user creation failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const backendUser = await response.json();
    console.log("User successfully created in backend PostgreSQL:", backendUser);

  } catch (error) {
    console.error("Error creating user in backend PostgreSQL:", error);
    // Decide if you want to re-throw or handle this error gracefully.
    // For now, we'll log it and proceed, but in a production app,
    // you might want to ensure backend creation succeeds or notify the user.
    throw error; // Re-throw to propagate the error up
  }

  return firestoreData; // Return the Firestore data as before
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