import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../styles/homepage.css'; // Import the stylesheet
import logo from '../assets/logo.png'; // Make sure you have this logo
import gameGif from '../assets/game.gif'; // Add the game gif
import heroBg from '../assets/k2.png';
import teamIllustration from '../assets/star.gif'; // The team illustration
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
     <Navbar />
  
      {/* Hero Section */}
      <header id="learn" className="hero-section">
  
        <h1 className="main-title">KAROKA</h1>
        <p className="subtitle">Learning reimagined</p>
       <Link to="/game">
  <button className="cta-button">Start learning</button>
</Link>
      </header>

      {/* About Section */}
      <FadeInSection>
        <section id="about" className="content-section alt-bg">
          <div className="game-visual">
            <img src={gameGif} alt="Game-based learning platform" />
          </div>
          <div className="about-text">
            <p>Karoka is a game-based platform that teaches coding, and helps you discover how you learn best.</p>
             <Link to="/game">
  <button className="cta-button">Play</button>
</Link>
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
            <Link to="/careerPage">
  <button className="cta-button">Be part of the team!</button>
</Link>
          </div>
          <div className="team-illustration">
            <img src={teamIllustration} alt="Join our team" />
          </div>
        </section>
      </FadeInSection>

      {/* Contact Section */}
     <FadeInSection>
  <section id="contact" className="content-section">
    <div className="contact-wrapper">
      <h2 className="section-title">Say hello!</h2>
      <p className="contact-subtitle">
        Have a question or want to get in touch? We'd love to hear from you.
      </p>
      
      {/* This is the magic link! */}
      <a
        href="mailto:landy@karoka.co?subject=Contact from Karoka Website"
        className="cta-button"
      >
        Send Us An Email
      </a>
    </div>
  </section>
</FadeInSection>
    </div>
  );
}