// frontend/src/pages/loginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // <<< Import Link
import { useAuth } from "@/components/Auth/AuthContext";
import Navbar from '../components/Navbar/Navbar';
import '../styles/loginPage.css';
import '../styles/homepage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginEmail, loginGoogle } = useAuth();

  // ... (rest of your state and handlers remain the same)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginEmail(email, password);
      navigate("/userProfile");
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginGoogle();
      navigate("/");
    } catch (err) {
      setError("Failed to sign in with Google.");
    }
  };


  return (
    <>
      <Navbar />
      <div className="login-page-container">
        <div className="login-form-wrapper">
          <h1>Log In</h1>
          {/* ... your form is unchanged ... */}
          <form onSubmit={handleEmailLogin}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="alice@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="cta-button">Login with Email</button>
          </form>

          <div className="divider"></div>

          <button onClick={handleGoogleLogin} className="cta-button secondary-button">
            Login with Google
          </button>

          {error && <p className="error-message">{error}</p>}
          
          {/* --- NEW SIGNUP LINK --- */}
          <p className="signup-prompt">
            New here? <Link to="/signup">Create an account!</Link>
          </p>
          {/* --- END NEW LINK --- */}

        </div>
      </div>
    </>
  );
}