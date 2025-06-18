import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// 1. Import all the necessary scenes for the game
import BootScene from '@game-core/scenes/BootScene';
import ArenaScene from '@game-core/scenes/ArenaScene';
import UIScene from '@game-core/scenes/UIScene';


function GamePage() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) {
      return;
    }

    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 800,
      height: 600,
      backgroundColor: '#211a21',
      // 2. Register all scenes with Phaser and start with BootScene
      scene: [BootScene, ArenaScene, UIScene]
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h1>Welcome to the Game!</h1>
      <p>Your game is loading below. It is built using a data-driven Phaser 3 architecture.</p>
      <div id="game-container" style={{ width: '800px', height: '600px', border: '2px solid #ff3399' }} />
    </div>
  );
}

export default GamePage;