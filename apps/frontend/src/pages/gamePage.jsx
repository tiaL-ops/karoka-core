import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// --- Scenes ---
// (Assuming all your scene imports are correct)
import BootScene from '@game-core/scenes/BootScene';
import ArenaScene from '@game-core/scenes/ArenaScene';
import UIScene from '@game-core/scenes/UIScene';
import PlayScene from '@game-core/scenes/PlayScene';
import CodeLessonScene from '@game-core/scenes/CodeLessonScene';
import CodeEditorScene from '@game-core/scenes/CodeEditorScene';
import DocumentationScene from '@game-core/scenes/DocumentationScene';
import HelpScene from '@game-core/scenes/HelpScene';
import VARKScene from '@game-core/scenes/VARKScene';
import MenuScene from '@game-core/scenes/MenuScene';
import HistoryScene from '@game-core/scenes/HistoryScene';
import InstructionsScene from '@game-core/scenes/InstructionsScene';

// --- Service ---
import DataService from '@game-core/services/DataService';

// --- CodeMirror imports ---
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python.js';

// --- Auth context ---
import { useAuth } from '@/components/Auth/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function GamePage() {
  const gameRef = useRef(null);
  const { currentUser, userProfile } = useAuth();
  // State to manage the visibility of the disclaimer
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // This useEffect hook handles the Phaser game initialization.
  // It will only run when the game container is rendered (i.e., after the disclaimer is hidden).
  useEffect(() => {
    // Don't initialize if the disclaimer is showing, or if the user/profile isn't ready.
    if (showDisclaimer || !currentUser || !userProfile) {
      return;
    }

    // Prevent re-initialization if the game instance already exists
    if (gameRef.current) return;

    const getAuthToken = () => currentUser.getIdToken();
    const dataService = new DataService(API_BASE_URL, getAuthToken);

    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 900,
      height: 600,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      backgroundColor: '#1a1a2d', // A darker, more modern background
      dom: { createContainer: true },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Manually add all scenes
    game.scene.add('BootScene', BootScene);
    game.scene.add('ArenaScene', ArenaScene);
    game.scene.add('UIScene', UIScene);
    game.scene.add('PlayScene', PlayScene);
    game.scene.add('CodeEditorScene', CodeEditorScene);
    game.scene.add('CodeLessonScene', CodeLessonScene);
    game.scene.add('DocumentationScene', DocumentationScene);
    game.scene.add('HelpScene', HelpScene);
    game.scene.add('VARKScene', VARKScene);
    game.scene.add('MenuScene', MenuScene);
    game.scene.add('HistoryScene', HistoryScene);
    game.scene.add('InstructionsScene', InstructionsScene);

    // Manually start the BootScene with necessary data
    game.scene.start('BootScene', {
      userProfile,
      dataService,
    });

    // Cleanup function to destroy the game instance on component unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [currentUser, userProfile, showDisclaimer]); // Rerun effect when showDisclaimer changes

  // Loading state while waiting for user profile
  if (!currentUser || !userProfile) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.headerFont}>Loading User Profile...</h1>
          <p style={styles.bodyFont}>Please wait while we prepare the game.</p>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div style={styles.container}>
      {showDisclaimer ? (
        // --- Disclaimer View ---
        <div style={styles.card}>
          <h1 style={styles.headerFont}>Disclaimer & Welcome! 👋</h1>
          <p style={styles.bodyFont}>
            This is a small working demo of <strong>Karoka</strong> — a game I’m building to make learning Python fun and interactive!
          </p>
          <p style={styles.bodyFont}>
            What you see here is the very beginning: basic instructions, a puzzle, one playable house, and LLM-powered help. Feel free to explore and break things 😊
          </p>
          <p style={styles.bodyFont}>
            I'm still improving the art (yes, I know I suck at drawing :()), working on offline mode, deeper AI, and more game content. Thanks for playing along and watching me grow :D !
          </p>
          <button
            style={styles.button}
            onClick={() => setShowDisclaimer(false)}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
          >
            Start Game
          </button>
        </div>
      ) : (
        // --- Game View ---
        <div id="game-container" style={styles.gameContainer} />
      )}
    </div>
  );
}

// --- CSS-in-JS Styles ---
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2d 0%, #1f1f3a 100%)',
    padding: '20px',
    fontFamily: "'Inter', sans-serif", // A clean, modern font
  },
  card: {
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    border: '1px solid #00ffff',
    borderRadius: '15px',
    padding: '40px',
    maxWidth: '800px',
    textAlign: 'center',
    color: '#e0e0e0',
    boxShadow: '0 8px 32px 0 rgba(0, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
  },
  headerFont: {
    fontFamily: "'Press Start 2P', cursive", // Retro game font
    color: '#00ffff',
    fontSize: '2rem',
    marginBottom: '24px',
    textShadow: '3px 3px 0px #ff00ff',
  },
  bodyFont: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  button: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '1rem',
    color: '#ffffff',
    backgroundColor: '#ff00ff',
    border: 'none',
    borderRadius: '8px',
    padding: '15px 30px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 4px 15px 0 rgba(255, 0, 255, 0.4)',
  },
  buttonHover: {
    backgroundColor: '#c000c0',
  },
  gameContainer: {
    width: '900px',
    height: '600px',
    border: '4px solid #00ffff',
    borderRadius: '10px',
    boxShadow: '0 0 25px #00ffff',
  }
};

export default GamePage;
