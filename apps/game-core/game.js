/**
 * game.js
 * * This is the main entry point for the Phaser game.
 * It creates the game instance, registers all the scenes,
 * and starts the BootScene to begin the asset loading process.
 */
import BootScene from './scenes/BootScene.js';
import ArenaScene from './scenes/ArenaScene.js';
import UIScene from './scenes/UIScene.js';
import PlayScene from './scenes/PlayScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [
    BootScene,
    ArenaScene,
    PlayScene,
    UIScene
  ]
};

const game = new Phaser.Game(config);