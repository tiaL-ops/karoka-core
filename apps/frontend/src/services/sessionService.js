// frontend/src/services/sessionService.js
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";


/**
 * STILL IN PROCESS FOR THIS ONE WILL WORK ON THIS LATER
 **/

/**
 * Creates a new session document at `/sessions/{sessionId}`.
 * Pass in a full `sessionData` object that matches your desired shape.
 */
export async function createSessionDocument(sessionId, sessionData) {
  const ref = doc(db, "sessions", sessionId);
  await setDoc(ref, sessionData);
}

/**
 * Updates only fields in the session doc at `/sessions/{sessionId}`.
 * `updates` should be an object with only the fields you want to merge.
 */
export async function updateSessionDocument(sessionId, updates) {
  const ref = doc(db, "sessions", sessionId);
  await updateDoc(ref, updates);
}