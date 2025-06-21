// scenes/PlayScene.js

import { rooms } from '../config/roomData.js';
import PuzzleManager from '../systems/puzzleManager.js';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    this.playJsonUrl   = data.playJsonUrl;
    this.tilesetsData  = data.tilesets;
    this.mapKey        = 'playMap_' + Date.now();
  }

  preload() {
    // Load only the JSON here — your tilesets are already in the cache
    console.log(`PlayScene: Preloading map from ${this.playJsonUrl}`);
    this.load.tilemapTiledJSON(this.mapKey, this.playJsonUrl);
  }

  create() {
    console.log("PlayScene: Creating scene.");

    // 1) Build the tilemap + layers
    const map = this.make.tilemap({ key: this.mapKey });
    const tilesets = this.tilesetsData.map(ts => map.addTilesetImage(ts.name, ts.key));
    map.createLayer('Background', tilesets, 0, 0);
   // map.createLayer('Elements',   tilesets, 0, 0);

    // 2) Read the Tiled “Drag” object‐layer
    const dragObjects = map.getObjectLayer('Drag').objects;
    const ballObj     = dragObjects.find(o => o.name === 'ball');
    const targetObjs  = dragObjects.filter(o => ['x','y','z'].includes(o.name));

    // 3) Create drop‐zones for x, y, z
    this.dropZones = targetObjs.map(o => {
      const zone = this.add.zone(o.x, o.y, o.width, o.height)
        .setOrigin(0)    // top-left alignment
        .setData('name', o.name);
      return zone;
    });

    // (Optional: outline them so you can see the targets during dev)
    this.dropZones.forEach(z =>
      this.add
        .rectangle(z.x + z.width/2, z.y + z.height/2, z.width, z.height)
        .setStrokeStyle(2, 0xffffff)
        .setOrigin(0.5)
    );

    // 4) Spawn 3 draggable “balls”
    this.balls = this.add.group();
    for (let i = 0; i < 7; i++) {
      const px = ballObj.x + i * (ballObj.width + 10);
      const py = ballObj.y;
      // using a simple red circle for placeholder:
      const ball = this.add.circle(px, py, ballObj.width/2, 0xff0000)
        .setInteractive({ draggable: true });
      // remember its home spot for snapping back
      ball.setData('homeX', px);
      ball.setData('homeY', py);

      this.input.setDraggable(ball);
      this.balls.add(ball);
    }

    // 5) Drag callbacks
    this.input
      .on('dragstart', (_, ball) => ball.setScale(1.2))
      .on('drag', (pointer, ball, dragX, dragY) => {
        ball.x = dragX;
        ball.y = dragY;
      })
      .on('dragend', (pointer, ball) => {
        ball.setScale(1);
        // check if dropped on any zone
        const droppedOn = this.dropZones.find(z =>
          Phaser.Geom.Intersects.RectangleToRectangle(
            ball.getBounds(), z.getBounds()
          )
        );
        if (droppedOn) {
          console.log(`Ball dropped on "${droppedOn.getData('name')}"`);
          ball.destroy();
        } else {
          // snap back home
          ball.x = ball.getData('homeX');
          ball.y = ball.getData('homeY');
        }
      });

    // 6) Q to close scene
    this.input.keyboard.on('keydown-Q', () => {
      if (this.scene.isActive('PlayScene')) {
        console.log("Q pressed, stopping PlayScene");
        this.scene.stop('PlayScene');
      }
    });
  }

  update(time, delta) {
    // nothing special here
  }
}
