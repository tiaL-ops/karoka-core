import Phaser from 'phaser';
import { rooms } from '../config/roomData.js';
import CodeEditorScene from './CodeEditorScene.js';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    this.playJsonUrl = data.playJsonUrl;
    this.tilesetsData = data.tilesets;
    this.mapKey = 'playMap_' + Date.now();
    this.roomKey = data.roomKey;
  }

  preload() {
    console.log(`PlayScene: Preloading map from ${this.playJsonUrl}`);
    this.load.tilemapTiledJSON(this.mapKey, this.playJsonUrl);
    this.load.image('close_icon', 'data:image/png;base64,iVBOR...');
  }

  create() {
    console.log('PlayScene: Creating scene.');
    const room = rooms[this.roomKey];

    // Centering calculations
    const cam = this.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    // --- TASK 1: Ball/Drop Zone Logic ---
    this.sourceBallCount = 10;
    this.zoneCounts = { x: 0, y: 0, z: 0 };

    // 1) Build the tilemap + layers
    const map = this.make.tilemap({ key: this.mapKey });
    const tilesets = this.tilesetsData.map(ts => map.addTilesetImage(ts.name, ts.key));

    // calculate offsets to center the map
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    const offsetX = centerX - mapWidth / 2;
    const offsetY = centerY - mapHeight / 2;

    // draw background layer centered
    map.createLayer('Background', tilesets, offsetX, offsetY);

    // 2) Read Tiled object layers
    const dragObjects = map.getObjectLayer('Drag').objects;
    const ballObj = dragObjects.find(o => o.name === 'ball');
    const targetObjs = dragObjects.filter(o => ['x', 'y', 'z'].includes(o.name));

    // 3) Create drop zones, outlines, and count text
    this.dropZones = this.add.group();
    this.zoneCountTexts = {};

    targetObjs.forEach(o => {
      const zoneX = o.x + offsetX;
      const zoneY = o.y + offsetY;

      // zone for dropping
      const zone = this.add.zone(zoneX, zoneY, o.width, o.height)
        .setRectangleDropZone(o.width, o.height);
      zone.setName(o.name);
      this.dropZones.add(zone);

      // outline graphic (hidden by default)
      const outline = this.add.graphics();
      outline.lineStyle(2, 0x00ff00);
      outline.strokeRect(zoneX, zoneY, o.width, o.height);
      outline.setVisible(false);
      zone.setData('outline', outline);

      // count text below zone
      const text = this.add.text(
        zoneX + o.width / 2,
        zoneY + o.height + 10,
        `${o.name}: 0`,
        { font: '16px Monospace', fill: '#ffffff' }
      ).setOrigin(0.5);
      this.zoneCountTexts[o.name] = text;
    });

    // 4) Create source ball and its count text
    const ballX = ballObj.x + offsetX;
    const ballY = ballObj.y + offsetY;
    this.sourceBall = this.add.circle(ballX, ballY, ballObj.width / 2, 0xff0000)
      .setInteractive();
    this.input.setDraggable(this.sourceBall);
    this.sourceBall.setData('homeX', ballX);
    this.sourceBall.setData('homeY', ballY);
    this.sourceBallCountText = this.add.text(
      ballX,
      ballY - 20,
      `x${this.sourceBallCount}`,
      { font: '16px Monospace', fill: '#ffffff' }
    ).setOrigin(0.5);

    this.placedBalls = this.add.group();

    // 5) Drag start + move
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setStrokeStyle(2, 0xffff00);
      this.children.bringToTop(gameObject);
    });
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // Highlight zones on dragenter / dragleave
    this.input.on('dragenter', (pointer, gameObject, dropZone) => {
      dropZone.getData('outline').setVisible(true);
    });
    this.input.on('dragleave', (pointer, gameObject, dropZone) => {
      dropZone.getData('outline').setVisible(false);
    });

    // 6) Drop logic
    this.input.on('drop', (pointer, gameObject, dropZone) => {
      dropZone.getData('outline').setVisible(false);
      if (gameObject === this.sourceBall && this.sourceBallCount > 0) {
        const zoneName = dropZone.name;
        this.sourceBallCount--;
        this.zoneCounts[zoneName]++;
        const x = dropZone.x + dropZone.width / 2;
        const y = dropZone.y + dropZone.height / 2;
        this.addPlacedBall(x, y, zoneName);
      } else if (this.placedBalls.contains(gameObject)) {
        const oldZone = gameObject.getData('originZone');
        const newZone = dropZone.name;
        if (newZone !== oldZone) {
          this.zoneCounts[oldZone]--;
          this.zoneCounts[newZone]++;
          gameObject.setData('originZone', newZone);
          gameObject.setPosition(
            dropZone.x + dropZone.width / 2,
            dropZone.y + dropZone.height / 2
          );
        }
      }
      this.updateCounts();
    });

    // 7) Drag end: reset & cleanup
    this.input.on('dragend', (pointer, gameObject, dropped) => {
      gameObject.setStrokeStyle();
      if (gameObject === this.sourceBall) {
        gameObject.setPosition(
          gameObject.getData('homeX'),
          gameObject.getData('homeY')
        );
      } else if (this.placedBalls.contains(gameObject) && !dropped) {
        const origin = gameObject.getData('originZone');
        this.zoneCounts[origin]--;
        this.sourceBallCount++;
        gameObject.destroy();
      }
      this.updateCounts();
      this.dropZones.getChildren().forEach(zone => {
        zone.getData('outline').setVisible(false);
      });
    });

    // --- TASK 2: "Show Code" and "Check Answer" Buttons ---
    const uiX = 650;
    const showCodeButton = this.add.text(uiX, 30, '[ Show Code ]', {
      font: '16px Monospace', fill: '#00ff00', backgroundColor: '#333', padding: { x: 5, y: 5 }
    })
      .setInteractive()
      .on('pointerdown', () => this.showCodePanel(room.codeSnippet));

    const checkButton = this.add.text(uiX, 60, '[ Check Answer ]', {
      font: '16px Monospace', fill: '#00ff00', backgroundColor: '#333', padding: { x: 5, y: 5 }
    })
      .setInteractive()
      .on('pointerdown', () => {
        const goal = room.puzzleGoal;
        const correct =
          this.zoneCounts.x === goal.X &&
          this.zoneCounts.y === goal.Y &&
          this.zoneCounts.z === goal.Z;
        if (!this.resultText) {
          this.resultText = this.add.text(uiX, 90, '', { font: '16px Monospace', fill: '#ffff00' });
        }
        this.resultText.setText(correct ? 'Correct!' : 'Try Again');
      });

    // Key listeners
    this.input.keyboard.on('keydown-L', () => {
      if (!this.scene.isActive('CodeLessonScene')) {
        this.scene.launch('CodeLessonScene');
        this.scene.sleep();
      }
    });
    this.input.keyboard.on('keydown-Q', () => {
      this.scene.start('ArenaScene', { roomKey: this.roomKey });
    });
  }

  addPlacedBall(x, y, zoneName) {
    const radius = this.sourceBall.radius || (this.sourceBall.width / 2) || 16;
    const placedBall = this.add.circle(x, y, radius, 0xff0000)
      .setInteractive();
    placedBall.setData('originZone', zoneName);
    this.input.setDraggable(placedBall);
    this.placedBalls.add(placedBall);
  }

  updateCounts() {
    this.sourceBallCountText.setText(`x${this.sourceBallCount}`);
    if (this.sourceBallCount === 0) {
      this.sourceBall.disableInteractive().setAlpha(0.5);
    } else {
      this.sourceBall.setInteractive().setAlpha(1.0);
    }
    for (const zoneName in this.zoneCountTexts) {
      this.zoneCountTexts[zoneName].setText(`${zoneName}: ${this.zoneCounts[zoneName]}`);
    }
  }

  showCodePanel(code) {
    if (this.codePanel) return;
    this.codePanel = this.add.group();
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 0.9);
    bg.fillRect(50, 50, this.scale.width - 100, this.scale.height - 100);
    this.codePanel.add(bg);
    const codeText = this.add.text(
      70, 70, code,
      { font: '14px Courier', fill: '#ffffff', wordWrap: { width: this.scale.width - 140 } }
    );
    this.codePanel.add(codeText);
    const closeButton = this.add.image(this.scale.width - 70, 70, 'close_icon')
      .setInteractive()
      .on('pointerdown', () => {
        this.codePanel.destroy(true);
        this.codePanel = null;
      });
    this.codePanel.add(closeButton);
  }
}
