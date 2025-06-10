import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Firebase auth imports
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Import NavHashLink to handle scrolling to sections on the homepage
import { NavHashLink } from 'react-router-hash-link';

import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Scroll helper for NavHashLink
  const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -80; // Account for the sticky navbar height
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">KAROKA</Link>
      <div className="nav-links">
        {/* Section links */}
        <NavHashLink smooth to="/#about" scroll={scrollWithOffset}>About</NavHashLink>
        <NavHashLink smooth to="/#mission" scroll={scrollWithOffset}>Mission</NavHashLink>
        <NavHashLink smooth to="/#join" scroll={scrollWithOffset}>Join us</NavHashLink>
        <NavHashLink smooth to="/#contact" scroll={scrollWithOffset}>Contact</NavHashLink>

        {/* Conditional rendering based on Firebase auth */}
        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-link">
            Logout
          </button>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}