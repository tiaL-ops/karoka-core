// src/components/Navbar/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// Import NavHashLink to handle scrolling to sections on the homepage
import { NavHashLink } from 'react-router-hash-link';
import './Navbar.css';

export default function Navbar() {
  // This function helps determine if the link is active for styling
  const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -80; // Account for the sticky navbar height
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">KAROKA</Link>
      <div className="nav-links">
        {/* These NavHashLinks go to the homepage (/) and scroll to the element with the matching id */}
        <NavHashLink smooth to="/#about" scroll={scrollWithOffset}>About</NavHashLink>
        <NavHashLink smooth to="/#mission" scroll={scrollWithOffset}>Mission</NavHashLink>
        <NavHashLink smooth to="/#join" scroll={scrollWithOffset}>Join us</NavHashLink>
        <NavHashLink smooth to="/#contact" scroll={scrollWithOffset}>Contact</NavHashLink>

        {/* This is a standard link to the login page */}
        <Link to="/login" className="login-link">Login</Link>
      </div>
    </nav>
  );
}