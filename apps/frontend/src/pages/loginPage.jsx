// src/pages/LoginPage.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase';

const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in with email!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
      console.log('Logged in with Google!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Welcome to Karoka</h1>

      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Login with Email</button>
      </form>

      <button onClick={handleGoogleLogin}>Login with Google</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
