// scenes/ArenaScene.js

import { rooms } from '../config/roomData.js';
import PlayScene from './PlayScene.js';
import PuzzleManager from '../systems/puzzleManager.js';
import CodeEditorScene from './CodeEditorScene.js';
import Player from './Player.js';
import HelpScene from './HelpScene.js';
import VARKScene from './VARKScene.js';

export default class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene');
    this.player = null;
    this.cursors = null;
    this.collisionGroup = null;
    this.hintGroup = null;
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

    // Layers
    map.createLayer('Floor', tilesets, 0, 0);
    const wallsLayer = map.createLayer('Walls', tilesets, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });
    map.createLayer('Furniture', tilesets, 0, 0);

    // Systems
    this.puzzleManager = new PuzzleManager(this, map, room.puzzleGoal);
    this.puzzleManager.spawnObjects();

    // Collision objects
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
        const rect = this.add.rectangle(x0 + w/2, y0 + h/2, w, h);
        this.physics.add.existing(rect, true);
        this.collisionGroup.add(rect);
      });
    }

    // Player spawn
    let spawnX = map.widthInPixels / 2;
    let spawnY = map.heightInPixels / 2;
    const spawnLayer = map.getObjectLayer('Spawn');
    if (spawnLayer && spawnLayer.objects.length) {
      spawnX = spawnLayer.objects[0].x;
      spawnY = spawnLayer.objects[0].y;
    }
    this.player = new Player(this, spawnX, spawnY, this.userProfile?.selectedAvatar || 'Boi');

    // Physics & Camera
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player);
    this.physics.add.collider(this.player, wallsLayer);
    if (this.collisionGroup) {
      this.physics.add.collider(this.player, this.collisionGroup);
    }

    // Hint objects: green overlay + message with name
    const hintsLayer = map.getObjectLayer('Hints');
    if (hintsLayer && hintsLayer.objects.length) {
      const hintGraphics = this.add.graphics();
      hintGraphics.lineStyle(2, 0x00ff00, 1);
      hintGraphics.fillStyle(0x00ff00, 0.3);
      this.hintGroup = this.physics.add.staticGroup();
      hintsLayer.objects.forEach(obj => {
        const x0 = obj.x;
        const y0 = obj.y;
        const w = obj.width;
        const h = obj.height;
        hintGraphics.strokeRect(x0, y0, w, h);
        hintGraphics.fillRect(x0, y0, w, h);
        const hintRect = this.add.rectangle(x0 + w/2, y0 + h/2, w, h);
        this.physics.add.existing(hintRect, true);
        hintRect.hintName = obj.name || 'hint';
        hintRect.hintShown = false;
        this.hintGroup.add(hintRect);
      });
      // Overlap to show hint text once, using the object's name
      this.physics.add.overlap(this.player, this.hintGroup, (player, hint) => {
        if (!hint.hintShown) {
          this.add.text(hint.x, hint.y - 20, `Oh, here is the ${hint.hintName}`, {
            font: '16px Arial',
            fill: '#00ff00',
          }).setOrigin(0.5);
          hint.hintShown = true;
          // If this hint is the 'ball', open the code editor
          if (hint.hintName.toLowerCase() === 'code') {
            this.scene.launch('CodeEditorScene');
          }
          if (hint.hintName.toLowerCase() === 'ball') {
           this.scene.start('PlayScene', { playJsonUrl: room.playJsonUrl, roomKey: this.roomKey, challengeId: room.challengeId, tilesets: room.tilesets });
          }
        }
      });
    }

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // PlayScene
    if (!this.scene.get('PlayScene')) {
      this.scene.add('PlayScene', PlayScene, false);
    }
    this.input.keyboard.on('keydown-P', () => {
      if (!this.scene.isActive('PlayScene') && room.playJsonUrl) {
        this.scene.start('PlayScene', { playJsonUrl: room.playJsonUrl, roomKey: this.roomKey, challengeId: room.challengeId, tilesets: room.tilesets });
      }
    });

    // CodeEditor
    if (!this.scene.get('CodeEditorScene')) {
      this.scene.add('CodeEditorScene', CodeEditorScene, false);
    }
    this.input.keyboard.on('keydown-C', () => {
      if (!this.scene.isActive('CodeEditorScene')) {
        this.scene.launch('CodeEditorScene');
      }
    });

     this.input.keyboard.on('keydown-H', () => {
      if (!this.scene.isActive('HelpScene')) {
        this.scene.launch('HelpScene');
      }
    });

     this.input.keyboard.on('keydown-V', () => {
      if (!this.scene.isActive('VARKScene')) {
        this.scene.launch('VARKScene');
      }
    });
  }

  update() {
    if (this.player) {
      this.player.update(this.cursors);
    }
  }
}
