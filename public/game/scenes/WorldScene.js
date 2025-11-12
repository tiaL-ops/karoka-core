import Player from "./Player.js";
import AvatarScene from "./AvatarScene.js";

import ProfileScene from "./ProfileScene.js";

import MainMenuScene from "./MainMenuScene.js";
import RiddleScene from "./RiddleScene.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";


import {db, auth } from '../../scripts/firebase.js';

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

export default class WorldScene extends Phaser.Scene {
  constructor(competitionData) {
    super({ key: "WorldScene" });
    this.competitionData = competitionData;
    this.panelContainer = null; 
    this.isVisible = false;
    this.player = null;
  }

  preload() {
    if (!this.competitionData) {
      console.error("No competition data available for preload.");
      return;
    }

    const data = this.competitionData;
    

    if (Array.isArray(data.spritesheet)) {
      data.spritesheet.forEach((sprites) => {
        this.load.spritesheet(sprites.key, sprites.url, {
          frameWidth: sprites.frameWidth,
          frameHeight: sprites.frameHeight,
        });
      });
    }
    
    // Load images
    if (Array.isArray(data.images)) {
      data.images.forEach(image => {
        this.load.image(image.key, image.url);
       
      });
    }

    // Load riddles JSON
    // We use the key "riddles" for caching. (Assumes data.riddles is an array with at least one URL.)
    const riddleKey = "riddles";
    const riddleDataLink = data.riddles; 
   
    this.load.json(riddleKey, riddleDataLink[0]);
    
    // Load tilemap
    const tilemap = data.tilemap;
    this.load.tilemapTiledJSON(tilemap.key, tilemap.url);

    // Log asset loading
    this.load.on("complete", () => {
      console.log("All assets loaded successfully.");
    });
    this.load.on("loaderror", (file) => {
      console.error(`Oh no, Failed to load asset: ${file.key}`);
    });
    this.isVisible = false;
  }

  init(data) {
    if (!data) {
      console.warn("No data passed to init. Falling back to default.");
      data = {};
    }
  
    // Check if player position is invalid
    const isInvalidPosition =
      !data.playerPosition ||
      (data.playerPosition.x === 0 && data.playerPosition.y === 0);
  
    // Use default spawn point if position is invalid
    this.playerPosition = isInvalidPosition ? { x: 505, y: 1035 } : data.playerPosition;
  }
  
  async create() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid; // Use Firebase Auth UID
      } else {
        console.error("User not logged in.");
      }
    });

    this.input.keyboard.on("keydown-G", () => {
      this.input.once("pointerdown", (pointer) => {
      
      });
    });
  
    // Create a toggle button for the panel
    this.panelContainer = null;
    // Inside WorldScene.create(), in your toggle button pointerdown handler:
const toggleButton = this.add.text(10, 10, "Show Panel", {
  font: "16px Arial",
  fill: "#ffffff",
  backgroundColor: "#0000ff",
  padding: { left: 10, right: 10, top: 5, bottom: 5 },
})
.setInteractive()
.on("pointerdown", () => {
  this.isVisible = !this.isVisible;
  if (this.isVisible) {
    // Launch UIPanelScene and pass necessary data
    
    this.scene.launch("UIPanelScene", {
      currentUserId: this.currentUserId,
      playerPosition: { x: this.player.x, y: this.player.y } ,
    });
    toggleButton.setText("Hide Panel");
  } else {
    // Stop UIPanelScene
    this.scene.stop("UIPanelScene");
    toggleButton.setText("Show Panel");
  }
})
.setDepth(100);
toggleButton.setScrollFactor(0);


    const map = this.make.tilemap({ key: this.competitionData.tilemap.key });
    const allTilesets = this.competitionData.images.map(image => {
      return map.addTilesetImage(image.key, image.key);
    });
    const backgroundLayer = map.createLayer("Background", allTilesets, 0, 0);
    const foundationLayer = map.createLayer("Foundation", allTilesets, 0, 0);
    const detailsLayer = map.createLayer("Details", allTilesets, 0, 0);

    const defaultSpawn = map.getObjectLayer("Spawn");
    if (defaultSpawn && defaultSpawn.objects.length > 0) {
      const spawnX = defaultSpawn.objects[0].x;  
      const spawnY = defaultSpawn.objects[0].y;
      //console.log(`Spawn X Coordinate: ${spawnX}`);
    } else {
      console.log("No spawn point found!");
    }
    
    const playerSpawn = defaultSpawn;
    const selectedAvatar = localStorage.getItem("selectedAvatar") || "boi";

    if (playerSpawn) {
      
      const startX = 1; 
     
      const startY = playerSpawn.y; 
    } else {
    
    }

    this.physics.world.setBounds(0, 0, backgroundLayer.width, backgroundLayer.height);
    const camera = this.cameras.main;
    camera.setBounds(0, 0, backgroundLayer.width, backgroundLayer.height);
    camera.setZoom(1);

    // Create the player sprite
    this.player = this.physics.add.sprite(this.playerPosition.x, this.playerPosition.y, selectedAvatar);
    this.player.setCollideWorldBounds(true);
    
    // Adjust the collider size (width: 20, height: 30 as an example)
    this.player.body.setSize(20, 20);
    
    // Optionally, if you need to reposition the collider relative to the sprite:
    this.player.body.setOffset(15, 20);
    
    this.createPlayerAnimations(selectedAvatar);
    camera.startFollow(this.player);
    this.cursors = this.input.keyboard.createCursorKeys();
    

    // Process Block layer for collision objects
    const gameObjectLayer = map.getObjectLayer("Block");
    if (!gameObjectLayer) {
      console.error("Object layer not found!");
      return;
    }
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0);
    graphics.fillRect(0, 0, 50, 50);
    const textureKey = "invisibleCollider";
    graphics.generateTexture(textureKey, 1, 1);
    graphics.destroy();

    const objectsBodies = this.physics.add.staticGroup();
    gameObjectLayer.objects.forEach((obj) => {
      const object = objectsBodies.create(obj.x, obj.y, textureKey);
      object.setOrigin(0);
      object.body.setSize(obj.width, obj.height).setOffset(0, 0);
    });
    this.physics.add.collider(this.player, objectsBodies, () => {
      console.log("Can't walk!");
    });

    // -------------------------------
    // Riddle Objects Setup and Fixes
    // -------------------------------
    // Create static group for riddle objects
    const riddleObjectLayer = map.getObjectLayer("Riddles");
    const riddleGroup = this.physics.add.staticGroup();
    riddleObjectLayer.objects.forEach((obj) => {
      const riddle = riddleGroup.create(obj.x, obj.y, textureKey);
      riddle.setOrigin(0);
      riddle.body.setSize(obj.width, obj.height).setOffset(0, 0);
      riddle.name = obj.name; 
      
    });

    // Retrieve the riddles JSON data from cache.
    // Retrieve the riddles JSON data from cache (an array of riddle objects)
const riddlesData = this.cache.json.get("riddles");


this.physics.add.overlap(this.player, riddleGroup, (player, riddle) => {
  if (riddle && riddle.name) {
    console.log(`Riddle "${riddle.name}" encountered`);

    // Extract the numeric part from the riddle name, e.g., "Level3_Riddle" -> "3"
    const match = riddle.name.match(/\d+/);
    if (!match) {
      console.warn(`Could not extract level number from riddle name: "${riddle.name}"`);
      return;
    }
    const levelNumber = parseInt(match[0]); // For "Level3_Riddle", this will be 3

    // Look up the riddle details in the JSON array by matching the Level number.
    const currentRiddle = riddlesData.find(item => item.Level === levelNumber);
    if (currentRiddle) {
      // Log using the Title property (or fallback to a string including the level)
      //console.log(`Should start: "${currentRiddle.Title || "Level " + currentRiddle.Level}"`);
      
      // Start the RiddleScene passing the entire currentRiddle object and player position.
      this.scene.start("RiddleScene", { 
        riddle: currentRiddle, 
        playerPosition: { x: this.player.x, y: this.player.y } 
      });
    } else {
      console.warn(`No riddle data found for riddle level: "${riddle.name}"`);
    }
  } else {
    console.warn("Encountered an unknown riddle");
  }
});




    // -------------------------------
    // End of Riddle Fixes
    // -------------------------------
  }

  

  createPlayerAnimations(textureKey) {
    const prefix = textureKey; 
    this.anims.create({
      key: `${prefix}_walk_down`,
      frames: [
        { key: textureKey, frame: 0 },
        { key: textureKey, frame: 4 },
        { key: textureKey, frame: 8 },
        { key: textureKey, frame: 12 },
      ],
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: `${prefix}_walk_left`,
      frames: [
        { key: textureKey, frame: 1 },
        { key: textureKey, frame: 5 },
        { key: textureKey, frame: 9 },
        { key: textureKey, frame: 13 },
      ],
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: `${prefix}_walk_up`,
      frames: [
        { key: textureKey, frame: 2 },
        { key: textureKey, frame: 6 },
        { key: textureKey, frame: 10 },
        { key: textureKey, frame: 14 },
      ],
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: `${prefix}_walk_right`,
      frames: [
        { key: textureKey, frame: 3 },
        { key: textureKey, frame: 7 },
        { key: textureKey, frame: 11 },
        { key: textureKey, frame: 15 },
      ],
      frameRate: 10,
      repeat: -1,
    });
  }


  

  update() {
    const speed = 200;
    const prefix = localStorage.getItem("selectedAvatar") || "boi"; 
    this.player.setVelocity(0); 
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play(`${prefix}_walk_left`, true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play(`${prefix}_walk_right`, true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play(`${prefix}_walk_up`, true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play(`${prefix}_walk_down`, true);
    } else {
      this.player.anims.stop();
    }
  }

  
}
