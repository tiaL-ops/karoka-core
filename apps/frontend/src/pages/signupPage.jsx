// frontend/src/pages/signupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthContext";
import Navbar from '../components/Navbar/Navbar'; // Import the shared Navbar
import '../styles/loginPage.css'; // <<< We can reuse the login page styles!
import '../styles/homepage.css'; // Import for the .cta-button style

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

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await signup(email, password, displayName);
      navigate("/userProfile");
    } catch (err) {
      // Provide a more user-friendly error message
      if (err.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-page-container">
        <div className="login-form-wrapper">
          <h1>Create Account</h1>
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label htmlFor="displayName">Name</label>
              <input
                id="displayName"
                type="text"
                placeholder="Alice"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="alice@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="6+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="cta-button">
              Sign Up
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </>
  );
}