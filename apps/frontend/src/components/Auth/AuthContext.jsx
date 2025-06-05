// frontend/src/components/Auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import {
  signup as signupService,
  loginEmail as loginEmailService,
  loginGoogle as loginGoogleService,
  logout as logoutService,
} from "@/services/authService";
import { getUserProfile } from "@/services/userService";

const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  signup: async () => {},
  loginEmail: async () => {},
  loginGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch Firestore profile
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Wrap the service functions so we can update local state if needed.
  const signup = async (email, password, displayName) => {
    const user = await signupService(email, password, displayName);
    // The onAuthStateChanged listener will fire and fetch the Firestore doc for us.
    return user;
  };

  const loginEmail = async (email, password) => {
    const user = await loginEmailService(email, password);
    // onAuthStateChanged will refresh userProfile
    return user;
  };

  const loginGoogle = async () => {
    const user = await loginGoogleService();
    // onAuthStateChanged will refresh userProfile
    return user;
  };

  const logout = async () => {
    await logoutService();
    // onAuthStateChanged will clear currentUser & userProfile
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    loginEmail,
    loginGoogle,
    logout,
  };

  // Only render children once we know whether there is a logged-in user or not.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook so any component can do:
 *   const { currentUser, userProfile, signup, loginEmail, ... } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}
