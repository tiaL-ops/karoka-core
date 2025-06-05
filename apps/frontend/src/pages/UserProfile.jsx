import { useState, useEffect } from "react"
 import { useAuth } from "../components/Auth/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const { currentUser, loading } = useAuth();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
        if (loading) return; // Don't fetch if authentication is still loading
        if (!currentUser) {
        console.log("No current user, cannot fetch profile from backend.");
            return;
          }
      
    try {
        const token = await currentUser.getIdToken(); 
        const res = await fetch(`${API_BASE_URL}/user/${currentUser.uid}`, { // Use currentUser.uid
                headers: {
                    'Authorization': `Bearer ${token}` // Add Authorization header
                  }
                });
                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setUser(data);
              } catch (err) {
                console.error("Error loading user:", err);
                setUser(null); // Clear user on error
              }
            };

            fetchUserProfile();
          }, [currentUser, loading]); // Re-run effect when currentUser or loading changes

          if (loading) return <p>Loading authentication...</p>;
          if (!currentUser) return <p>Please log in to view profile.</p>;
          if (!user) return <p>Loading user data...</p>;

          return (
            <div>
              <h2>User Profile</h2>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
            </div>
          );
        }
