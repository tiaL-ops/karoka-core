import Phaser from 'phaser';
import { storage } from '../../frontend/src/firebase'; 
import { ref, getDownloadURL } from 'firebase/storage';

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // --- Asset Loading from Firebase Storage ---

    // Get Download URL for the tileset image from the 'variable' folder
    const tilesetImageRef = ref(storage, 'variable/ktilestest.png'); // <-- Updated path
    getDownloadURL(tilesetImageRef)
      .then((url) => {
        this.load.image('tiles', url);
        this.load.start();
      })
      .catch((error) => {
        console.error("Error loading tileset image:", error);
      });

    // Get Download URL for the tilemap JSON from the 'variable' folder
    const tilemapJsonRef = ref(storage, 'variable/firstdraft.json'); // <-- Updated path
    getDownloadURL(tilemapJsonRef)
      .then((url) => {
        this.load.tilemapTiledJSON('map', url);
        this.load.start();
      })
      .catch((error) => {
        console.error("Error loading tilemap JSON:", error);
      });
  }

  create() {
    // This create logic remains the same.
    // It waits for the preloaded assets to be ready.
    if (!this.cache.tilemap.get('map') || !this.textures.exists('tiles')) {
         console.warn('Map or tileset not loaded yet, retrying in 100ms...');
         setTimeout(this.create.bind(this), 100);
         return;
    }

    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('ground', 'tiles');
    const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.add.text(10, 10, 'Phaser Game Running!', {
      font: '16px Courier',
      fill: '#ffffff',
    });
  }
}