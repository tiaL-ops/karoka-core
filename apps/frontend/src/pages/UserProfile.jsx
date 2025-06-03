import { useState } from "react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function CreateUser() {
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [user, setUser] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch(`${API_BASE_URL}/user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    })

    const data = await res.json()
    setUser(data)
  }

  return (
    <div>
      {!user ? (
        <form onSubmit={handleSubmit}>
          <label>
            Enter user ID:
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. test-id-456"
              required
            />
          </label>
          <br />
          <label>
            Enter name:
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice"
              required
            />
          </label>
          <br />
          <button type="submit">Create User</button>
        </form>
      ) : (
        <div>
          <h2>User Created!</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name}</p>
        </div>
      )}
    </div>
  )
}
