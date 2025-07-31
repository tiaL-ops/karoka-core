import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// --- Scenes ---
import BootScene from '@game-core/scenes/BootScene';
import ArenaScene from '@game-core/scenes/ArenaScene';
import UIScene from '@game-core/scenes/UIScene';
import PlayScene from '@game-core/scenes/PlayScene';
import CodeLessonScene from '@game-core/scenes/CodeLessonScene';
import CodeEditorScene from '@game-core/scenes/CodeEditorScene';
import DocumentationScene from '@game-core/scenes/DocumentationScene'; 
import HelpScene from '@game-core/scenes/HelpScene';

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

  useEffect(() => {
    if (!currentUser || !userProfile) {
      return;
    }

    if (gameRef.current) return;

    const getAuthToken = () => currentUser.getIdToken();
    const dataService = new DataService(API_BASE_URL, getAuthToken);

    // --- The Fix is Here ---
    // The 'scene' property is removed from the config to prevent Phaser
    // from automatically starting any scenes.
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 900,
      height: 600,
      physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
      backgroundColor: '#211a21',
      dom: { createContainer: true },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Manually add all scenes to the game's Scene Manager.
    // This makes the game aware of them without starting them.
    game.scene.add('BootScene', BootScene);
    game.scene.add('ArenaScene', ArenaScene);
    game.scene.add('UIScene', UIScene);
    game.scene.add('PlayScene', PlayScene);
    game.scene.add('CodeEditorScene', CodeEditorScene);
    game.scene.add('CodeLessonScene', CodeLessonScene);
    game.scene.add('DocumentationScene', DocumentationScene);
    game.scene.add('HelpScene', HelpScene);

    // Now, manually start the BootScene.
    // This call is now safe and correctly passes your init data.
    game.scene.start('BootScene', {
      userProfile,
      dataService,
    });

    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, [currentUser, userProfile]);

  if (!currentUser || !userProfile) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Loading User Profile...</h1>
        <p>Please wait while we prepare the game.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      <h1>Welcome to the Game!</h1>
      <p>Your game is loading below. Have fun !</p>
      <div
        id="game-container"
        style={{
          width: '900px',
          height: '600px',
          border: '2px solid #ff3399'
        }}
      />
    </div>
  );
}

export default GamePage;