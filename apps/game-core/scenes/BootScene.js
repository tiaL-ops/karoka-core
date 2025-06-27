// game-core/scenes/BootScene.js
import { rooms } from '../config/roomData.js';
import CodeEditorScene from './CodeEditorScene.js';

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
  init(data) {
    
    this.registry.set('userProfile', data.userProfile);
    console.log("BootScene: Initializing with data:", data);

   
  }

  preload() {
    console.log("BootScene: Preloading assets...");

    // Iterate through all rooms defined in the config
    for (const [roomKey, room] of Object.entries(rooms)) {
        console.log(`BootScene: Preloading room "${roomKey}"`);
      // Load the Tiled JSON for the map
      this.load.tilemapTiledJSON(roomKey, room.mapJsonUrl);
      
      // Load the kinesthetic JSON if it exists
      if (room.playJsonUrl) {
        this.load.json(`${roomKey}_play_data`, room.playJsonUrl);
      }

      // Load each tileset image for the map
      room.tilesets.forEach(ts => {
        this.load.image(ts.key, ts.url);
      });
    }
  }

  create() {
    console.log("BootScene: Preload complete. Starting first arena.");
    
    // Start the first arena scene, passing its key from the config
    this.scene.start('ArenaScene', { roomKey: 'FirstArena' });
  }
}