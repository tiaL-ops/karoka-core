// scenes/ArenaScene.js

import { rooms } from '../config/roomData.js';
import PlayScene from './PlayScene.js';
import PuzzleManager from '../systems/puzzleManager.js';
import CodeEditorScene from './CodeEditorScene.js';
import Player from './Player.js';

export default class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene');
    this.player = null;
    this.cursors = null;
    this.collisionGroup = null;
  }

  init(data) {
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
    this.roomKey = data.roomKey;
  }

  preload() {
    const room = rooms[this.roomKey];
    if (room.players) {
      room.players.forEach(p => {
        this.load.spritesheet(p.key, p.url, { frameWidth: p.frameWidth, frameHeight: p.frameHeight });
      });
    }
    if (room.tilesets) {
      room.tilesets.forEach(ts => this.load.image(ts.key, ts.url));
    }
    this.load.tilemapTiledJSON(this.roomKey, room.mapUrl);
  }

  create() {
    const room = rooms[this.roomKey];
    const map = this.make.tilemap({ key: this.roomKey });
    const tilesets = room.tilesets.map(ts => map.addTilesetImage(ts.name, ts.key));

    map.createLayer('Floor', tilesets, 0, 0);
    const wallsLayer = map.createLayer('Walls', tilesets, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });
    map.createLayer('Furniture', tilesets, 0, 0);

    this.puzzleManager = new PuzzleManager(this, map, room.puzzleGoal);
    this.puzzleManager.spawnObjects();

    // Debug: draw and physics for Collision object layer
    const collisionLayer = map.getObjectLayer('Collision');
    if (collisionLayer && collisionLayer.objects.length) {
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.fillStyle(0xff0000, 0.3);
      this.collisionGroup = this.physics.add.staticGroup();

      collisionLayer.objects.forEach(obj => {
        const x0 = obj.x;
        const y0 = obj.y;
        const w = obj.width;
        const h = obj.height;
        graphics.strokeRect(x0, y0, w, h);
        graphics.fillRect(x0, y0, w, h);
        // physics body centered
        const rect = this.add.rectangle(x0 + w / 2, y0 + h / 2, w, h);
        this.physics.add.existing(rect, true);
        this.collisionGroup.add(rect);
      });
    }

    // Player setup
    let spawnX = map.widthInPixels / 2;
    let spawnY = map.heightInPixels / 2;
    const spawnLayer = map.getObjectLayer('Spawn');
    if (spawnLayer && spawnLayer.objects.length) {
      spawnX = spawnLayer.objects[0].x;
      spawnY = spawnLayer.objects[0].y;
    }
    this.player = new Player(this, spawnX, spawnY, this.userProfile?.selectedAvatar || 'Boi');

    // Colliders
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player);
    this.physics.add.collider(this.player, wallsLayer);
    if (this.collisionGroup) {
      this.physics.add.collider(this.player, this.collisionGroup);
    }

    this.cursors = this.input.keyboard.createCursorKeys();

    if (!this.scene.get('PlayScene')) {
      this.scene.add('PlayScene', PlayScene, false);
    }
    this.input.keyboard.on('keydown-P', () => {
      if (!this.scene.isActive('PlayScene') && room.playJsonUrl) {
        this.scene.start('PlayScene', { playJsonUrl: room.playJsonUrl, roomKey: this.roomKey, challengeId: room.challengeId, tilesets: room.tilesets });
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

  update() {
    if (this.player) {
      this.player.update(this.cursors);
    }
  }
}
