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
    this.player = null;
    this.cursors = null;
    this.selectedAvatarKey = 'Boi'; // Default avatar key
    this.lastDirection = 'down'; // To set correct idle frame
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
    // Loop through the dedicated 'players' array to load character assets.
    if (room.players && Array.isArray(room.players)) {
      room.players.forEach(playerAsset => {
        this.load.spritesheet(playerAsset.key, playerAsset.url, {
          frameWidth: playerAsset.frameWidth,
          frameHeight: playerAsset.frameHeight,
        });
      });
    }

    // --- Load Map Tilesets ---
    // Loop through the 'tilesets' array for map-related images.
    if (room.tilesets && Array.isArray(room.tilesets)) {
      room.tilesets.forEach(tilesetAsset => {
        this.load.image(tilesetAsset.key, tilesetAsset.url);
      });
    }

    // It's assumed the Tiled map JSON is preloaded in a previous scene.
    // If not, you would load it here:
    // this.load.tilemapTiledJSON(this.roomKey, room.mapJsonUrl);
  }

  create() {
    const room = rooms[this.roomKey];
    console.log(`ArenaScene: Creating room "${this.roomKey}"`);

    // 1. Create the tilemap from the preloaded Tiled JSON
    const map = this.make.tilemap({ key: this.roomKey });

    // 2. Add the tilesets to the map
    const tilesets = room.tilesets.map(ts => {
      return map.addTilesetImage(ts.name, ts.key);
    });

    // 3. Create the tilemap layers
    map.createLayer('Floor', tilesets, 0, 0);
    const wallsLayer = map.createLayer('Walls', tilesets, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });
    map.createLayer('Furniture', tilesets, 0, 0);

    // 4. Initialize systems
    this.puzzleManager = new PuzzleManager(this, map, room.puzzleGoal);

    // 5. Spawn dynamic objects (Gems, Buckets)
    this.puzzleManager.spawnObjects();

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

    // Get the selected avatar and store it as a scene property for consistent access.
    this.selectedAvatarKey = this.userProfile?.selectedAvatar || 'Boi';
    
    this.player = this.physics.add.sprite(spawnX, spawnY, this.selectedAvatarKey);
    this.player.setCollideWorldBounds(true);

    // --- FIX: Set a more sensible physics body ---
    // This makes the physics body smaller than the visual sprite to prevent
    // getting stuck on corners and feel more natural.
    const bodyWidth = this.player.width * 0.5;
    const bodyHeight = this.player.height * 0.3; // Smaller height is often better for top-down
    this.player.body.setSize(bodyWidth, bodyHeight);
    
    // Offset the body to be centered horizontally and at the 'feet' of the sprite.
    this.player.body.setOffset(
        (this.player.width - bodyWidth) / 2,
        this.player.height - bodyHeight
    );

    // Create player animations using the consistent key.
    this.createPlayerAnimations(this.selectedAvatarKey);

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

  /**
   * Creates the player's walking animations from its spritesheet.
   * This assumes a specific 4xN spritesheet layout where columns represent
   * poses and rows represent directions.
   * @param {string} textureKey - The key for the player's spritesheet.
   */
  createPlayerAnimations(textureKey) {
    // This function was already correct, but now it's being called reliably.
    const anims = this.anims;
    anims.create({
      key: `${textureKey}_walk_down`,
      frames: anims.generateFrameNumbers(textureKey, { frames: [0, 4, 8, 12] }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: `${textureKey}_walk_left`,
      frames: anims.generateFrameNumbers(textureKey, { frames: [1, 5, 9, 13] }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: `${textureKey}_walk_up`,
      frames: anims.generateFrameNumbers(textureKey, { frames: [2, 6, 10, 14] }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: `${textureKey}_walk_right`,
      frames: anims.generateFrameNumbers(textureKey, { frames: [3, 7, 11, 15] }),
      frameRate: 10,
      repeat: -1,
    });
  }

  /**
   * The main game loop, called every frame.
   */
  update() {
    const speed = 200;
    // --- FIX: Use the key stored on the scene, not from localStorage ---
    // This ensures consistency and correct casing.
    const key = this.selectedAvatarKey;
    
    this.player.setVelocity(0);

    // --- Handle Movement and Animation ---
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play(`${key}_walk_left`, true);
      this.lastDirection = 'left';
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play(`${key}_walk_right`, true);
      this.lastDirection = 'right';
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play(`${key}_walk_up`, true);
      this.lastDirection = 'up';
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play(`${key}_walk_down`, true);
      this.lastDirection = 'down';
    } else {
      // --- FIX: Handle Idle State ---
      this.player.anims.stop();

      // Set the idle frame based on the last direction of movement.
      // These frame numbers (0, 1, 2, 3) correspond to the first frame
      // of each directional animation, which serves as the idle pose.
      switch (this.lastDirection) {
        case 'up':
          this.player.setFrame(2);
          break;
        case 'down':
          this.player.setFrame(0);
          break;
        case 'left':
          this.player.setFrame(1);
          break;
        case 'right':
          this.player.setFrame(3);
          break;
      }
    }
  }
}
