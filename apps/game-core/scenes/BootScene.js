// scenes/BootScene.js

import { rooms } from '../config/roomData.js';

/**
 * BootScene is the first scene to load. Its purpose is to
 * read the master config file (roomData.js) and preload all
 * assets that the game will need, primarily the tilemaps and
 * tilesets for every arena.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    console.log("BootScene: Preloading assets...");

    // Iterate through all rooms defined in the config
    for (const [roomKey, room] of Object.entries(rooms)) {
      // Load the Tiled JSON for the map
      this.load.tilemapTiledJSON(roomKey, room.mapJsonUrl);

      // Load each tileset image for the map
      room.tilesets.forEach(ts => {
        this.load.image(ts.key, ts.url);
      });
    }

    // Preload other global assets here (e.g., player sprite, UI elements)
    // this.load.spritesheet('player', 'path/to/player.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    console.log("BootScene: Preload complete. Starting first arena.");
    
    // Start the first arena scene, passing its key from the config
    this.scene.start('ArenaScene', { roomKey: 'FirstArena' });
  }
}