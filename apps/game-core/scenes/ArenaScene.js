// scenes/ArenaScene.js

import { rooms } from '../config/roomData.js';
import PuzzleManager from '../systems/puzzleManager.js';

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
  }

  update(time, delta) {
    // Main game loop for the arena
  }
}