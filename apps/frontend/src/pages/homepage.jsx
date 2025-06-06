import React, { useState, useEffect, useRef } from 'react';
import '../styles/homepage.css'; // Import the stylesheet
import logo from '../assets/logo.png'; // Make sure you have this logo
import gameGif from '../assets/game.gif'; // Add the game gif
import heroBg from '../assets/k2.png';
import teamIllustration from '../assets/heart.gif'; // The team illustration
import mascot from '../assets/game.gif'; // The mascot image

// This component will wrap our sections and apply the fade-in effect
function FadeInSection(props) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      // There's only one element to observe
      if (entries[0].isIntersecting) {
        setVisible(true);
        // No need to keep observing this element
        observer.unobserve(domRef.current);
      }
    });

    observer.observe(domRef.current);

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
      ref={domRef}
    >
      {props.children}
    </div>
  );
}

export default function Homepage() {
  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">KAROKA</div>
        <div className="nav-links">
          <a href="#learn">Learn</a>
          <a href="#about">About</a>
    
          <a href="#mission">Mission</a>
          <a href="#join">Join us</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="learn" className="hero-section">
  
        <h1 className="main-title">KAROKA</h1>
        <p className="subtitle">Learning reimagined</p>
        <button className="cta-button">Start learning</button>
      </header>

      {/* About Section */}
      <FadeInSection>
        <section id="about" className="content-section alt-bg">
          <div className="game-visual">
            <img src={gameGif} alt="Game-based learning platform" />
          </div>
          <div className="about-text">
            <p>Karoka is a game-based platform that teaches coding, and helps you discover how you learn best.</p>
            <button className="cta-button">Play</button>
          </div>
        </section>
      </FadeInSection>

      {/* Mission Section */}
      <FadeInSection>
        <section id="mission" className="content-section">
          <h2 className="section-title">Our mission</h2>
          <blockquote>
            “Make it fun, make it accessible, make it productive. xo.”
          </blockquote>
         
        </section>
      </FadeInSection>

      {/* Join Us Section */}
      <FadeInSection>
        <section id="join" className="content-section alt-bg">
          <div className="join-us-text">
            <p>Engineer? Designer? Educator?</p>
            <p>Looking forward to build with us?</p>
            <p>See our open roles!</p>
            <button className="cta-button">Be part of the team!</button>
          </div>
          <div className="team-illustration">
            <img src={teamIllustration} alt="Join our team" />
          </div>
        </section>
      </FadeInSection>

      {/* Contact Section */}
      <FadeInSection>
        <section id="contact" className="content-section">
          <div className="contact-form-container">
            <form className="contact-form">
              <input type="email" placeholder="Email" name="Email" />
              <input type="text" placeholder="Subject" name="Subject" />
              <textarea placeholder="Message" name="Message" rows="5"></textarea>
              <button type="submit" className="cta-button">Send</button>
            </form>
          </div>
          <div className="contact-text">
            <p>Would like to contact us?</p>
            <p>Please fill out this following form,</p>
            <p>We will reach to you soon</p>
          </div>
        </section>
      </FadeInSection>
    </div>
  );
}