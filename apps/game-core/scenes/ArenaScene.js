// scenes/ArenaScene.js

import { rooms } from '../config/roomData.js';
import PlayScene from './PlayScene.js';
import PuzzleManager from '../systems/puzzleManager.js';
import CodeEditorScene from './CodeEditorScene.js';
/**
 * ArenaScene is the main gameplay scene. It is data-driven,
 * using the `roomKey` passed via init() to fetch the correct
 * configuration from roomData.js and build the level.
 */
export default class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene');
  }

  init(data) {
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
    // The key for the current room (e.g., 'FirstArena')
    this.roomKey = data.roomKey;
  }

  create() {
    const room = rooms[this.roomKey];
    console.log(`ArenaScene: Creating room "${this.roomKey}"`);

    // 1. Create the tilemap from the preloaded Tiled JSON
    const map = this.make.tilemap({ key: this.roomKey });

    // 2. Add the tilesets to the map
    const tilesets = room.tilesets.map(ts => {
      // The first parameter is the name of the tileset in Tiled, the second is the key in Phaser
      return map.addTilesetImage(ts.name, ts.key);
    });

    // 3. Create the tilemap layers
    // The names 'Floor', 'Walls', etc., must match the layer names in your Tiled project
    map.createLayer('Floor', tilesets, 0, 0);
    const wallsLayer = map.createLayer('Walls', tilesets, 0, 0);
    // Add collision to the walls layer if needed
    // wallsLayer.setCollisionByProperty({ collides: true });

    map.createLayer('Furniture', tilesets, 0, 0);

    // 4. Initialize systems
    this.puzzleManager = new PuzzleManager(this, map, room.puzzleGoal);
    // this.dragManager = new DragManager(this);
    // this.interactionManager = new InteractionManager(this);

    // 5. Spawn dynamic objects (Player, Gems, Buckets) using the puzzleManager
    // This manager reads object layers from the Tiled map to know where to place items.
    this.puzzleManager.spawnObjects();

    // 6. Launch the UI scene as an overlay
    this.scene.launch('UIScene', {
      snippet: room.codeSnippet,
      karoEnabled: room.karoEnabled
    });

    if (!this.scene.get('PlayScene')) {
  this.scene.add('PlayScene', PlayScene, false);
}


     this.input.keyboard.on('keydown-P', () => {
        if (!this.scene.isActive('PlayScene')) {
            console.log("P pressed, launching PlayScene");
            if (room.playJsonUrl) {
               
                // Pass the URL and the necessary tileset data to the PlayScene
                this.scene.start('PlayScene', { 
                    playJsonUrl: room.playJsonUrl, 
                    roomKey: this.roomKey ,
                    tilesets: room.tilesets 
                });
            }
        }
    });

    if (!this.scene.get('CodeEditorScene')) {
  this.scene.add('CodeEditorScene', CodeEditorScene, false);
}

    this.input.keyboard.on('keydown-C', () => {
        if (!this.scene.isActive('CodeEditorScene')) {
            this.scene.launch('CodeEditorScene');
        }
    });

    this.input.keyboard.on('keydown-Q', () => {
        if (this.scene.isActive('PlayScene')) {
            console.log("Q pressed, stopping PlayScene");
            this.scene.stop('PlayScene');
        }
    });
  }

  

  update(time, delta) {
    // Main game loop for the arena
  }
}