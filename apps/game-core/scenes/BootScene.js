// karoka-core/apps/game-core/scenes/BootScene.js
import { rooms } from '../config/roomData.js';
import CodeEditorScene from './CodeEditorScene.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  init(data) {
    console.log("BootScene: Initializing with data:", data);
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

  async create() {
    console.log("BootScene: Starting session and then the first arena.");
    const dataService = this.registry.get('dataService');
    const userProfile = this.registry.get('userProfile');

    try {
      // 1. Call the backend to get a new session
      const session = await dataService.startNewSession();
      console.log("New session started:", session);

      // 2. Add the new session ID to the user's profile object
      userProfile.sessionId = session.id;

      // 3. Save the MODIFIED profile back into the game's registry
      this.registry.set('userProfile', userProfile);

      // 4. Now, start the next scene
      this.scene.start('HistoryScene');
      //this.scene.start('ArenaScene', { roomKey: 'FirstArena' });

    } catch (error) {
        console.error("Fatal Error: Failed to start game session:", error);
        // You can display an error message to the user on the screen here
        this.add.text(400, 300, 'Error: Could not connect to the server.', { color: '#ff0000', fontSize: '20px' }).setOrigin(0.5);
    }
  }
}