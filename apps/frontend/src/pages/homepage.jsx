import React from "react";
import "../styles/homepage.css";
import logoSrc from "../assets/logo.png"; 
import placeholderGif from "../assets/game.gif";
import gameGif from "../assets/1.gif";

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

      {/* ======================================
         SECTION 1: HERO / START LEARNING
         ====================================== */}
      <main className="main-split">
        {/* LEFT SIDE */}
        <section className="left-pane-1">
          <h1 className="title">KAROKA</h1>
          <p className="tagline">Learning reimagined</p>
          <button className="cta-button">Start Learning</button>
          <div className="down-arrow">
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="right-pane-1">
          <img
            src={placeholderGif}
            alt="Animated placeholder"
            className="animated-gif"
          />
        </section>
      </main>

      {/* ======================================
         SECTION 2: LEARN
         ====================================== */}
      <main className="main-split reverse">
        {/* LEFT SIDE (flipped with .reverse) */}
        <section className="left-pane-2">
          <img
            src={gameGif}
            alt="Game-based platform demo"
            className="animated-gif"
          />
        </section>

        {/* RIGHT SIDE */}
        <section className="right-pane-2">
          <p className="tagline">
            Karoka is a game-based platform that teaches coding, and helps you discover how you learn best.
          </p>
          <button className="cta-button-2">Play</button>
          <div className="down-arrow">
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </section>
      </main>

      {/* ======================================
         SECTION 3: MISSION
         ====================================== */}
      <main className="main-split">
        {/* LEFT SIDE */}
        <section className="left-pane-1">
          <p className="tagline">
            “Make it fun, make it accessible, make it productive. xo.”
          </p>
          <button className="cta-button">Play</button>
          <div className="down-arrow">
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="right-pane-1">
          <img
            src={placeholderGif}
            alt="Animated placeholder"
            className="animated-gif"
          />
        </section>
      </main>

      {/* ======================================
         SECTION 4: JOIN US
         ====================================== */}
      <main className="main-split join-section reverse">
        {/* LEFT SIDE (because of .reverse, this will show on the right visually) */}
        <section className="left-pane-2 join-left">
          <div className="join-text-block">
            <p className="join-line">Engineer? Designer? Educator?</p>
            <p className="join-line">Looking forward to build with us?</p>
            <p className="join-line">See our open roles!</p>
            <button className="cta-button-2">Apply</button>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="right-pane-2 join-right">
          <div className="wip-shape">
            <div className="wip-text">Work<br />In<br />Progress</div>
          </div>
        </section>
      </main>

      {/* ======================================
         SECTION 5: CONTACT
         ====================================== */}
      <main className="main-split contact-section">
        {/* LEFT SIDE (Form) */}
        <section className="left-pane-1 contact-left">
          <form className="contact-form">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />

            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" required />

            <label htmlFor="message">Message</label>
            <textarea id="message" rows="6" required></textarea>

            <button type="submit" className="cta-button">Send</button>
          </form>
        </section>

        {/* RIGHT SIDE (Text) */}
        <section className="right-pane-1 contact-right">
          <p className="contact-text">
            Would like to contact us?<br />
            Please fill out this following form,<br />
            We will reach to you soon.
          </p>
        </section>
      </main>
    </div>
  );
}
