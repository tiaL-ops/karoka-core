// frontend/src/pages/signupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "@/components/Auth/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate(); 
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signup(email, password, displayName);

      navigate("/userProfile"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Create an Account</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="displayName">Name (optional):</label>
          <input
            id="displayName"
            type="text"
            placeholder="Alice"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="alice@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password (6+ chars):</label>
          <input
            id="password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Sign Up</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
