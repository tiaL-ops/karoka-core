import React from "react";
import "../styles/homepage.css";
import logoSrc from "../assets/logo.png"; 
import placeholderGif from "../assets/game.gif";

export default function Homepage() {
  return (
    <div className="page-wrapper">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-content">
          {/* Logo on the left */}
          <div className="logo-container">
            <img
              src={logoSrc}
              alt="Karoka Logo"
              className="logo-image"
            />
          </div>

          {/* Placeholder for future nav links */}
          <ul className="nav-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Learn</a></li>
              <li><a href="#">Mission</a></li>
              <li><a href="#">Join</a></li>
              <li><a href="#">Contact</a></li>
            
          </ul>
        </div>
      </nav>

      {/* MAIN SPLIT SECTION */}
      <main className="main-split">
        {/* LEFT SIDE */}
        <section className="left-pane">
          <h1 className="title">KAROKA</h1>
          <p className="tagline">Learning reimagined</p>
          <button className="cta-button">Start Learning</button>
          <div className="down-arrow">
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="right-pane">
          <img
            src={placeholderGif}
            alt="Animated placeholder"
            className="animated-gif"
          />
        </section>
      </main>
    </div>
  );
}
