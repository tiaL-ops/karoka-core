// apps/frontend/src/pages/PingPage.jsx
import { useEffect, useState } from "react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


export default function PingPage() {
  const [pingMessage, setPingMessage] = useState("")

  useEffect(() => {
    fetch(`${API_BASE_URL}/ping`)
      .then((res) => res.json())
      .then((data) => setPingMessage(data.message))
      .catch((err) => setPingMessage("Error: " + err.message))
  }, [])

  return (
    <div>
      <h1>Ping Page</h1>
      <p>Backend says: {pingMessage}</p>
    </div>
  )
}
