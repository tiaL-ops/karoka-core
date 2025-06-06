// src/pages/CareerPage.jsx
import React from 'react';
import Navbar from '../components/Navbar/Navbar'; // Import the shared Navbar
import '../styles/pageStyles.css'; // Import the shared stylesheet

function CareerPage() {
  return (
    <>
      <Navbar />
      <div className="page-container-light">
        <div className="content-wrapper">
          <h1>Join Our Team</h1>
          <p style={{ fontSize: '20px', lineHeight: '1.6', marginTop: '-20px' }}>
            We're building the future of learning, and we need passionate, creative people to help us achieve our mission.
          </p>

          <div className="placeholder-text">
            There are no open roles at the moment, but please check back soon!
          </div>
        </div>
      </div>
    </>
  );
}

export default CareerPage;