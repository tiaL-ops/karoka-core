// scenes/ArenaScene.js

import { rooms } from '../config/roomData.js';
import PlayScene from './PlayScene.js';
import PuzzleManager from '../systems/puzzleManager.js';
import CodeEditorScene from './CodeEditorScene.js';
import Player from './Player.js'; // Import the new Player class

/**
 * ArenaScene is the main gameplay scene. It is data-driven,
 * using the `roomKey` passed via init() to fetch the correct
 * configuration from roomData.js and build the level.
 */
export default class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene');
    this.player = null;
    this.cursors = null;
    // Player-specific properties (like lastDirection) have been moved to the Player class.
  }

  init(data) {
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
    // The key for the current room (e.g., 'FirstArena')
    this.roomKey = data.roomKey;
  }

  preload() {
    const room = rooms[this.roomKey];

    // --- Load Player Spritesheets ---
    if (room.players && Array.isArray(room.players)) {
      room.players.forEach(playerAsset => {
        this.load.spritesheet(playerAsset.key, playerAsset.url, {
          frameWidth: playerAsset.frameWidth,
          frameHeight: playerAsset.frameHeight,
        });
      });
    }

    // --- Load Map Tilesets ---
    if (room.tilesets && Array.isArray(room.tilesets)) {
      room.tilesets.forEach(tilesetAsset => {
        this.load.image(tilesetAsset.key, tilesetAsset.url);
      });
    }

    // --- Load Tiled JSON ---
    this.load.tilemapTiledJSON(this.roomKey, room.mapUrl);
  }

  create() {
    const room = rooms[this.roomKey];
    console.log(`ArenaScene: Creating room "${this.roomKey}"`);

    // 1. Create the tilemap from the preloaded Tiled JSON
    const map = this.make.tilemap({ key: this.roomKey });

    // 2. Add the tilesets to the map
    const tilesets = room.tilesets.map(ts => map.addTilesetImage(ts.name, ts.key));

    // 3. Create the tilemap layers
    map.createLayer('Floor', tilesets, 0, 0);
    const wallsLayer = map.createLayer('Walls', tilesets, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });
    map.createLayer('Furniture', tilesets, 0, 0);

    // 4. Initialize systems
    this.puzzleManager = new PuzzleManager(this, map, room.puzzleGoal);
    this.puzzleManager.spawnObjects();

    // 5. Debug: draw Collision object layer as red overlay
    const collisionLayer = map.getObjectLayer('Collision');
    if (collisionLayer && collisionLayer.objects) {
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.fillStyle(0xff0000, 0.3);
      collisionLayer.objects.forEach(obj => {
        // In Tiled, object y is the bottom of the rectangle
        const x = obj.x;
        const y = obj.y;
        const width = obj.width;
        const height = obj.height;
        graphics.strokeRect(x, y, width, height);
        graphics.fillRect(x, y, width, height);
      });
    } else {
      console.warn('ArenaScene: No Collision object layer found.');
    }

    // -----------------------
    // Player setup
    // -----------------------
    let spawnX = map.widthInPixels / 2;
    let spawnY = map.heightInPixels / 2;
    const spawnLayer = map.getObjectLayer('Spawn');
    if (spawnLayer && spawnLayer.objects.length > 0) {
      spawnX = spawnLayer.objects[0].x;
      spawnY = spawnLayer.objects[0].y;
    } else {
      console.warn('ArenaScene: No Spawn point found, using default center.');
    }

    // --- Instantiate the Player class ---
    const selectedAvatarKey = this.userProfile?.selectedAvatar || 'Boi';
    this.player = new Player(this, spawnX, spawnY, selectedAvatarKey);

    // Set world bounds & camera
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player);

    // Collide player with walls
    this.physics.add.collider(this.player, wallsLayer);

    // Setup cursor keys for movement
    this.cursors = this.input.keyboard.createCursorKeys();

    // 6. Launch related scenes
    if (!this.scene.get('PlayScene')) {
      this.scene.add('PlayScene', PlayScene, false);
    }
    this.input.keyboard.on('keydown-P', () => {
      if (!this.scene.isActive('PlayScene') && room.playJsonUrl) {
        this.scene.start('PlayScene', {
          playJsonUrl: room.playJsonUrl,
          roomKey: this.roomKey,
          challengeId: room.challengeId,
          tilesets: room.tilesets
        });
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
  }

  // The createPlayerAnimations method has been moved to the Player class.

  /**
   * The main game loop, called every frame.
   */
  update() {
    // Delegate update logic to the player instance
    if (this.player) {
      this.player.update(this.cursors);
    }
  }
}
