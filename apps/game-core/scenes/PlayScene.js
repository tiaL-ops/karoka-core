import Phaser from 'phaser';
import { rooms } from '../config/roomData.js';
import CodeEditorScene from './CodeEditorScene.js';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    // Map + room config
    this.playJsonUrl = data.playJsonUrl;
    this.tilesetsData = data.tilesets;
    this.mapKey = 'playMap_' + Date.now();
    this.roomKey = data.roomKey;

    // Retrieve user/session and data service for logging
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
    if (!this.userProfile || !this.dataService) {
      console.warn('PlayScene: userProfile or dataService not found in registry');
    }
  }

  preload() {
    console.log(`PlayScene: Preloading map from ${this.playJsonUrl}`);
    this.load.tilemapTiledJSON(this.mapKey, this.playJsonUrl);
    this.load.image('close_icon', 'data:image/png;base64,iVBOR...');
  }

  create() {
    console.log('PlayScene: Creating scene.');
    const room = rooms[this.roomKey] || {};

    // Centering calculations
    const cam = this.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    // --- TASK 1: Ball/Drop Zone Logic ---
    this.sourceBallCount = 10;
    this.zoneCounts = { x: 0, y: 0, z: 0 };

    // Build map and compute offsets
    const map = this.make.tilemap({ key: this.mapKey });
    const tilesets = this.tilesetsData.map(ts => map.addTilesetImage(ts.name, ts.key));
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    const offsetX = centerX - mapWidth / 2;
    const offsetY = centerY - mapHeight / 2;
    map.createLayer('Background', tilesets, offsetX, offsetY);

    // Read objects
    const objs = map.getObjectLayer('Drag').objects;
    const ballObj = objs.find(o => o.name === 'ball');
    const targetObjs = objs.filter(o => ['x', 'y', 'z'].includes(o.name));

    // Create zones
    this.dropZones = this.add.group();
    this.zoneCountTexts = {};
    targetObjs.forEach(o => {
      const zx = o.x + offsetX;
      const zy = o.y + offsetY;
      const zone = this.add.zone(zx, zy, o.width, o.height)
        .setRectangleDropZone(o.width, o.height);
      zone.setName(o.name);
      this.dropZones.add(zone);
      const outline = this.add.graphics().lineStyle(2, 0x00ff00).strokeRect(zx, zy, o.width, o.height).setVisible(false);
      zone.setData('outline', outline);
      const txt = this.add.text(zx + o.width/2, zy + o.height + 10, `${o.name}: 0`, { font: '16px Monospace', fill: '#fff' }).setOrigin(0.5);
      this.zoneCountTexts[o.name] = txt;
    });

    // Source ball
    const bx = ballObj.x + offsetX;
    const by = ballObj.y + offsetY;
    this.sourceBall = this.add.circle(bx, by, ballObj.width/2, 0xff0000).setInteractive();
    this.input.setDraggable(this.sourceBall);
    this.sourceBall.setData('homeX', bx);
    this.sourceBall.setData('homeY', by);
    this.sourceBallCountText = this.add.text(bx, by - 20, `x${this.sourceBallCount}`, { font: '16px Monospace', fill: '#fff' }).setOrigin(0.5);
    this.placedBalls = this.add.group();

    // Drag handlers
    this.input.on('dragstart', (p, obj) => { obj.setStrokeStyle(2, 0xffff00); this.children.bringToTop(obj); });
    this.input.on('drag', (p, obj, x, y) => { obj.x = x; obj.y = y; });
    this.input.on('dragenter', (p, obj, dz) => dz.getData('outline').setVisible(true));
    this.input.on('dragleave', (p, obj, dz) => dz.getData('outline').setVisible(false));
    this.input.on('drop', (p, obj, dz) => {
      dz.getData('outline').setVisible(false);
      if (obj === this.sourceBall && this.sourceBallCount > 0) {
        const zn = dz.name;
        this.sourceBallCount--; this.zoneCounts[zn]++;
        const px = dz.x + dz.width/2, py = dz.y + dz.height/2;
        this.addPlacedBall(px, py, zn);
      } else if (this.placedBalls.contains(obj)) {
        const oldZ = obj.getData('originZone'), newZ = dz.name;
        if (newZ !== oldZ) {
          this.zoneCounts[oldZ]--; this.zoneCounts[newZ]++;
          obj.setData('originZone', newZ).setPosition(dz.x+dz.width/2, dz.y+dz.height/2);
        }
      }
      this.updateCounts();
    });
    this.input.on('dragend', (p, obj, dropped) => {
      obj.setStrokeStyle();
      if (obj === this.sourceBall) {
        obj.setPosition(obj.getData('homeX'), obj.getData('homeY'));
      } else if (this.placedBalls.contains(obj) && !dropped) {
        const oz = obj.getData('originZone'); this.zoneCounts[oz]++; this.sourceBallCount++; obj.destroy();
      }
      this.updateCounts();
      this.dropZones.getChildren().forEach(z => z.getData('outline').setVisible(false));
    });

    // --- UI: Show Code & Check Answer ---
    const uiX = 650;
    this.add.text(uiX, 30, '[ Show Code ]', { font: '16px Monospace', fill: '#0f0', backgroundColor: '#333', padding:{x:5,y:5} })
      .setInteractive().on('pointerdown', () => this.showCodePanel(room.codeSnippet));

    this.add.text(uiX, 60, '[ Check Answer ]', { font: '16px Monospace', fill: '#0f0', backgroundColor: '#333', padding:{x:5,y:5} })
      .setInteractive().on('pointerdown', async () => {
        const goal = room.puzzleGoal || {};
        const correct = this.zoneCounts.x===goal.X && this.zoneCounts.y===goal.Y && this.zoneCounts.z===goal.Z;
        if (!this.resultText) this.resultText = this.add.text(uiX, 90, '', { font:'16px Monospace', fill:'#ff0' });
        this.resultText.setText(correct?'Correct!':'Try Again');

        // Log event to database
        if (this.dataService && this.userProfile) {
          try {
            console.log("LOGGGGINNNNG")
            await this.dataService.logEvent({
              sessionId: this.userProfile.sessionId,
              eventType: 'playscene',
              eventDetails: { zoneCounts: this.zoneCounts, isCorrect: correct }
            });
            console.log('PlayScene: event logged');
          } catch(e) {
            console.error('PlayScene: failed to log event', e);
          }
        }
      });

    // Key listeners
    this.input.keyboard.on('keydown-L', ()=>{
      if (!this.scene.isActive('CodeLessonScene')){ this.scene.launch('CodeLessonScene'); this.scene.sleep(); }
    });
    this.input.keyboard.on('keydown-Q', ()=>{
      this.scene.start('ArenaScene',{roomKey:this.roomKey});
    });
  }

  addPlacedBall(x, y, zoneName) {
    const r = this.sourceBall.radius || (this.sourceBall.width/2) || 16;
    const b = this.add.circle(x, y, r, 0xff0000).setInteractive();
    b.setData('originZone', zoneName);
    this.input.setDraggable(b);
    this.placedBalls.add(b);
  }

  updateCounts() {
    this.sourceBallCountText.setText(`x${this.sourceBallCount}`);
    if (this.sourceBallCount===0) this.sourceBall.disableInteractive().setAlpha(0.5);
    else this.sourceBall.setInteractive().setAlpha(1);
    for (const zn in this.zoneCountTexts) this.zoneCountTexts[zn].setText(`${zn}: ${this.zoneCounts[zn]}`);
  }

  showCodePanel(code) {
    if (this.codePanel) return;
    this.codePanel = this.add.group();
    const bg = this.add.graphics().fillStyle(0x111111,0.9).fillRect(50,50,this.scale.width-100,this.scale.height-100);
    this.codePanel.add(bg);
    this.codePanel.add(this.add.text(70,70, code, {font:'14px Courier', fill:'#fff', wordWrap:{width:this.scale.width-140}}));
    this.codePanel.add(
      this.add.image(this.scale.width-70,70,'close_icon').setInteractive().on('pointerdown',()=>{ this.codePanel.destroy(true); this.codePanel=null; })
    );
  }
}
