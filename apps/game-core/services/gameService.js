// apps/frontend/src/services/gameService.js
import { auth } from "@/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function logGameAttempt(attemptData) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}/game/attempt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(attemptData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to log game attempt: ${errorData.error || response.statusText}`);
  }

  return await response.json();
}