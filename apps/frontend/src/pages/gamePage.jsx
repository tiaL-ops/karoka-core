import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// --- Scenes ---
import BootScene from '@game-core/scenes/BootScene';
import ArenaScene from '@game-core/scenes/ArenaScene';
import UIScene from '@game-core/scenes/UIScene';
import PlayScene from '@game-core/scenes/PlayScene';
import CodeLessonScene from '@game-core/scenes/CodeLessonScene';
import CodeEditorScene from '@game-core/scenes/CodeEditorScene';

// --- CodeMirror imports ---
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python.js';

// --- Auth context ---
import { useAuth } from '@/components/Auth/AuthContext';
function GamePage() {
  const gameRef = useRef(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!userProfile) {
    return <div>Loading User Profile...</div>;
  }
    if (gameRef.current) return; 
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 800,
      height: 600,
      backgroundColor: '#211a21',
      dom: { createContainer: true },
      scene: [
        BootScene,
        ArenaScene,
        UIScene,
        PlayScene,
        CodeEditorScene,
        CodeLessonScene
      ]
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.scene.start('BootScene', { userProfile });

    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, [userProfile]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      <h1>Welcome to the Game!</h1>
      <p>Your game is loading below. It’s powered by Phaser 3 and a data‑driven scene architecture.</p>
      <div
        id="game-container"
        style={{
          width: '800px',
          height: '600px',
          border: '2px solid #ff3399'
        }}
      />
    </div>
  );
}

export default GamePage;
