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
    // The 'name' in roomData must match the tileset name in Tiled.
    // This now correctly only uses assets from the 'tilesets' array.
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

    const selectedAvatarKey = this.userProfile?.selectedAvatar || 'Girl';
    this.player = this.physics.add.sprite(spawnX, spawnY, selectedAvatarKey);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.8, this.player.height * 0.8);
    this.player.body.setOffset(this.player.width * 0.1, this.player.height * 0.2);

    // Create player animations. This will now work correctly.
    this.createPlayerAnimations(selectedAvatarKey);

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
   * @param {string} avatarKey - The key for the player's spritesheet.
   */
 createPlayerAnimations(avatarKey) {
  const directions = ['down', 'left', 'right', 'up'];

  directions.forEach((dir, rowIndex) => {
    const base = rowIndex * 4;
    this.anims.create({
      key: dir,
      frames: this.anims.generateFrameNumbers(avatarKey, {
        frames: [base + 1, base + 0, base + 3, base + 0],
      }),
      frameRate: 8,
      repeat: -1,
    });
  });
}


  update(time, delta) {
    const speed = 200;
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    // Normalize speed to prevent faster diagonal movement
    this.player.body.velocity.normalize().scale(speed);

    // Update animations based on movement
    if (this.cursors.left.isDown) {
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.anims.play('right', true);
    } else if (this.cursors.up.isDown) {
      this.player.anims.play('up', true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play('down', true);
    } else {
      // No keys down, stop animation and show idle frame
      this.player.anims.stop();

      // Set idle frame based on last direction. The idle frames are the
      // standing poses: 0 (down), 4 (left), 8 (right), 12 (up).
      const lastAnimKey = this.player.anims.currentAnim?.key;
      if (lastAnimKey === 'left') this.player.setFrame(4);
      else if (lastAnimKey === 'right') this.player.setFrame(8);
      else if (lastAnimKey === 'up') this.player.setFrame(12);
      else if (lastAnimKey === 'down') this.player.setFrame(0);
    }
  }
}
