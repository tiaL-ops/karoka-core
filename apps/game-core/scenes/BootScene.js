// game-core/scenes/BootScene.js
import { rooms } from '../config/roomData.js';
import CodeEditorScene from './CodeEditorScene.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  init(data) {
    console.log("BootScene: Initializing with data:", data);
    // Set both the user profile and the data service in the global registry
    this.registry.set('userProfile', data.userProfile);
    this.registry.set('dataService', data.dataService);
  }

  preload() {
    console.log("BootScene: Preloading assets...");
    for (const [roomKey, room] of Object.entries(rooms)) {
        this.load.tilemapTiledJSON(roomKey, room.mapJsonUrl);
        if (room.playJsonUrl) {
          this.load.json(`${roomKey}_play_data`, room.playJsonUrl);
        }
        room.tilesets.forEach(ts => {
          this.load.image(ts.key, ts.url);
        });
    }
  }

  create() {
    console.log("BootScene: Preload complete. Starting first arena.");
    this.scene.start('ArenaScene', { roomKey: 'FirstArena' });
  }
}