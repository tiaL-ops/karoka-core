// apps/frontend/src/App.jsx
import { useEffect, useState } from "react"
import UserProfile from "./pages/UserProfile"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function App() {
  const [pingMessage, setPingMessage] = useState("")
  console.log("API_BASE_URL in fromnt:", API_BASE_URL)
  useEffect(() => {
    fetch(`${API_BASE_URL}/ping/`)
      .then((res) => res.json())
      .then((data) => setPingMessage(data.message))
      .catch((err) => setPingMessage("Error: " + err.message))
  }, [])

  return (
    <div>
      <h1>Hello from Karoka!</h1>
      <p>Backend says: {pingMessage}</p>
       <hr />

      <UserProfile />
    </div>
  )
}
