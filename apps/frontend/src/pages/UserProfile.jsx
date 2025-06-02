import { useEffect, useState } from "react"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


export default function UserProfile() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetch(`${API_BASE_URL}/user/test-id-123`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error loading user:", err))
  }, [])

  if (!user) return <p>Loading user...</p>

  return (
    <div>
      <h2>User Profile</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Name:</strong> {user.name}</p>
    </div>
  )
}
