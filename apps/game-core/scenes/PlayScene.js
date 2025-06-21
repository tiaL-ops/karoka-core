import { rooms } from '../config/roomData.js';
import PuzzleManager from '../systems/puzzleManager.js';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    this.playJsonUrl = data.playJsonUrl;
    this.tilesetsData = data.tilesets;
    this.mapKey = 'playMap_' + Date.now(); 
  }

  preload(){
    console.log(`PlayScene: Preloading map from ${this.playJsonUrl}`);
    this.load.tilemapTiledJSON(this.mapKey, this.playJsonUrl);
  }

  create() {
    console.log("PlayScene: Creating scene.");
    
    const map = this.make.tilemap({ key: this.mapKey });

    // --- Start of robust tileset loading ---

    // 1. Get the names of tilesets used in the kinesthetic.json file.
    //    The `map.tilesets` property contains the raw tileset data from the JSON.
    const tilesetNamesInMap = map.tilesets.map(ts => ts.name);

    // 2. Filter the master list of tilesets from roomData to only the ones this map needs.
    const relevantTilesetsData = this.tilesetsData.filter(ts => tilesetNamesInMap.includes(ts.name));

    // 3. Add only the relevant tilesets to the map instance.
    const tilesets = relevantTilesetsData.map(ts => {
      console.log(`PlayScene: Adding relevant tileset ${ts.name} with key ${ts.key}`);
      return map.addTilesetImage(ts.name, ts.key);
    });

    // --- End of robust tileset loading ---

    // Now, create layers using the clean, filtered list of tilesets.
    map.createLayer('Background', tilesets, 0, 0);
    map.createLayer('Elements', tilesets, 0, 0);

    // This overlay might make it harder to see the tiles.
    // You can comment it out for debugging if the tiles are still black.
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
  }
}