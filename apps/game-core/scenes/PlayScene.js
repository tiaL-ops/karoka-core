// scenes/PlayScene.js

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
    // Preload an asset for the 'show code' button close icon
    this.load.image('close_icon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAU5JREFUOE9jZKAQMKLr//9/Bib///+hM1FRUeM2mG6gIsYmYGBgYOBkZGT8B2IY8//f//8yYGBgZmZ+BiLyMhC5jIqKCjOwsLDoCGIW8P//P2f4//8/AyMjo+MEjIt4gGkYGBgYGDjZ2Nr+A/FMXFxciGA+CQkJUQxGg4KC3ODExMR/APF/gPg/kBgCg0HlAcY/zIz/Y2b4z8DAwMDw/w8DAOZvYHh/Z/j//z8Du4GBkZEBgf///w/k/P//Hy7AwMDExASoSmbIAECAAQBAzQ1n2+m/dAAAAABJRU5ErkJggg=='); // Simple X icon
  }

  create() {
    console.log("PlayScene: Creating scene.");
    const room = rooms[this.roomKey];

    // --- TASK 1: Refactored Ball/Drop Zone Logic ---

    // Counts
    this.sourceBallCount = 10;
    this.zoneCounts = { x: 0, y: 0, z: 0 };
    
    // 1) Build the tilemap + layers
    const map = this.make.tilemap({ key: this.mapKey });
    const tilesets = this.tilesetsData.map(ts => map.addTilesetImage(ts.name, ts.key));
    map.createLayer('Background', tilesets, 0, 0);

    // 2) Read Tiled object layers
    const dragObjects = map.getObjectLayer('Drag').objects;
    const ballObj = dragObjects.find(o => o.name === 'ball');
    const targetObjs = dragObjects.filter(o => ['x', 'y', 'z'].includes(o.name));
    
    // 3) Create visual drop zones and their count text
    this.dropZones = this.add.group();
    this.zoneCountTexts = {};

    targetObjs.forEach(o => {
      const zone = this.add.zone(o.x, o.y, o.width, o.height).setRectangleDropZone(o.width, o.height);
      zone.setName(o.name);
      zone.setData('count', 0);
      this.dropZones.add(zone);

      // Display zone name and count below it
      const text = this.add.text(o.x + o.width / 2, o.y + o.height + 10, `${o.name}: 0`, { font: '16px Monospace', fill: '#ffffff' }).setOrigin(0.5);
      this.zoneCountTexts[o.name] = text;
    });

    // 4) Create ONE source ball with its count text
    this.sourceBall = this.add.circle(ballObj.x, ballObj.y, ballObj.width / 2, 0xff0000).setInteractive();
    this.input.setDraggable(this.sourceBall);
    this.sourceBall.setData('homeX', ballObj.x);
    this.sourceBall.setData('homeY', ballObj.y);

    this.sourceBallCountText = this.add.text(ballObj.x, ballObj.y - 20, `x${this.sourceBallCount}`, { font: '16px Monospace', fill: '#ffffff' }).setOrigin(0.5);
    
    // Group for balls placed in zones, so they can be dragged off
    this.placedBalls = this.add.group();

    // 5) Drag and Drop Logic
    this.input.on('dragstart', (pointer, gameObject) => {
        gameObject.setStrokeStyle(2, 0xffff00); // Highlight when dragging
        this.children.bringToTop(gameObject);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
        gameObject.setStrokeStyle(); // Remove highlight

        // Case 1: Dragging the SOURCE ball
        if (gameObject === this.sourceBall) {
            if (dropped && this.sourceBallCount > 0) {
                const zone = gameObject.input.dropZone;
                const zoneName = zone.name;

                this.sourceBallCount--;
                this.zoneCounts[zoneName]++;
                this.addPlacedBall(zone.x + zone.width/2, zone.y + zone.height/2, zoneName);
            }
            gameObject.x = gameObject.getData('homeX');
            gameObject.y = gameObject.getData('homeY');
        } 
        // Case 2: Dragging a PLACED ball off a zone
        else if (this.placedBalls.contains(gameObject)) {
            if (!dropped) { // If dropped outside any zone
                const zoneName = gameObject.getData('originZone');
                
                this.zoneCounts[zoneName]--;
                this.sourceBallCount++;
                gameObject.destroy();
            }
        }

        this.updateCounts();
    });

    // --- TASK 2: "Show Code" Button ---
    const showCodeButton = this.add.text(650, 30, '[ Show Code ]', { font: '16px Monospace', fill: '#00ff00', backgroundColor: '#333', padding: { x: 5, y: 5 } })
      .setInteractive()
      .on('pointerdown', () => this.showCodePanel(room.codeSnippet));

    // --- Key listeners to launch other scenes ---
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
      const placedBall = this.add.circle(x, y, 16, 0xff0000).setInteractive();
      this.input.setDraggable(placedBall);
      placedBall.setData('originZone', zoneName);
      this.placedBalls.add(placedBall);
  }

  updateCounts() {
      this.sourceBallCountText.setText(`x${this.sourceBallCount}`);
      
      for (const zoneName in this.zoneCountTexts) {
          this.zoneCountTexts[zoneName].setText(`${zoneName}: ${this.zoneCounts[zoneName]}`);
      }

      if (this.sourceBallCount === 0) {
          this.sourceBall.disableInteractive().setAlpha(0.5);
      } else {
          this.sourceBall.setInteractive().setAlpha(1.0);
      }
  }

  showCodePanel(code) {
    if (this.codePanel) return;

    this.codePanel = this.add.group();
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 0.9);
    bg.fillRect(50, 50, this.scale.width - 100, this.scale.height - 100);
    this.codePanel.add(bg);

    const codeText = this.add.text(70, 70, code, { font: '14px Courier', fill: '#ffffff', wordWrap: { width: this.scale.width - 140 } });
    this.codePanel.add(codeText);

    const closeButton = this.add.image(this.scale.width - 70, 70, 'close_icon').setInteractive();
    closeButton.on('pointerdown', () => {
      this.codePanel.destroy(true);
      this.codePanel = null;
    });
    this.codePanel.add(closeButton);
  }
}