// src/pages/restrictedPage.jsx
import React from 'react';
import Navbar from '../components/Navbar/Navbar'; // Import the shared Navbar
import '../styles/restrictedPage.css'; // Import the new stylesheet

function RestrictedPage() {
  return (
    <>
      <Navbar />
      <div className="restricted-container">
        <div className="restricted-content">
          <h1>OUHHH</h1>
          <p>
            So excited you want to be part of Karoka!
          </p>
          <p>
            We are in the current alpha phase of our ML integration, so access is restricted to a few users for now. We will be opening up very soon!
          </p>
        </div>
      </div>
    </>
  );
}

export default RestrictedPage;