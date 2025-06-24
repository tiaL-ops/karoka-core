import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// 1. Import all the necessary scenes for the game
import BootScene from '@game-core/scenes/BootScene';
import ArenaScene from '@game-core/scenes/ArenaScene';
import UIScene from '@game-core/scenes/UIScene';
// It's good practice to import all scenes that will be used.
import CodeEditorScene from '@game-core/scenes/CodeEditorScene.js';
import PlayScene from '@game-core/scenes/PlayScene.js';
import CodeLessonScene from '@game-core/scenes/CodeLessonScene.js';


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
      // --- FIX STARTS HERE ---
      // Add the dom property to allow phaser to render HTML elements
      dom: {
        createContainer: true
      },
      // --- FIX ENDS HERE ---
      // 2. Register all scenes with Phaser and start with BootScene
      // I've also included the other scenes from your game.js file
      scene: [BootScene, ArenaScene, UIScene, PlayScene, CodeEditorScene, CodeLessonScene]
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