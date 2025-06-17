import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '@game-core/scenes/MainScene';


function GamePage() {
  
  const gameRef = useRef(null);

  // useEffect will run once after the component mounts
  useEffect(() => {
    // Check if a game instance already exists
    if (gameRef.current) {
      return;
    }

    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container', // This must match the div id below
      width: 800,
      height: 600,
      backgroundColor: '#211a21', // Dark background
      scene: [MainScene] // Your scene
    };

    // Create a new Phaser game instance
    gameRef.current = new Phaser.Game(config);

    // Cleanup function to destroy the game instance when the component unmounts
    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []); // The empty dependency array ensures this runs only once

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h1>Welcome to the Game!</h1>
      <p>Your game is loading below. Assets are fetched from Firebase Storage.</p>
      {/* This div is where the Phaser canvas will be injected */}
      <div id="game-container" style={{ width: '800px', height: '600px', border: '2px solid #ff3399' }} />
    </div>
  );
}

export default GamePage;