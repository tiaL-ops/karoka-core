// Import the rooms configuration to access player data
import { rooms } from '../config/roomData.js';

export default class InstructionsScene extends Phaser.Scene {
  constructor() {
    super('InstructionsScene');
    // Add properties to hold dynamic player data
    this.playerKey = 'Boi'; // Default value
    this.playerData = null;
  }

  // ✨ --- NEW: init method to receive data from the launching scene --- ✨
  init(data) {
    // Get the current room's key, defaulting to 'FirstArena' if not provided
    this.roomKey = data.roomKey || 'FirstArena';
    // Get the user profile from the registry
    const userProfile = this.registry.get('userProfile');
    // Determine the player avatar key
    this.playerKey = userProfile?.selectedAvatar || 'Boi';
  }

  preload() {
    // Load the pixel font
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

    // ✨ --- 1. Dynamically load the correct player spritesheet --- ✨
    const room = rooms[this.roomKey];
    if (room && room.players) {
        // Find the player data that matches the selected avatar key
        this.playerData = room.players.find(p => p.key === this.playerKey);
    }

    // If player data is found, load its spritesheet. Otherwise, load a placeholder.
    if (this.playerData) {
        this.load.spritesheet(this.playerData.key, this.playerData.url, {
            frameWidth: this.playerData.frameWidth,
            frameHeight: this.playerData.frameHeight
        });
    } else {
        // Fallback placeholder if the specific avatar isn't found in room data
        this.load.spritesheet(this.playerKey, 'https://placehold.co/128x48/1a2a4f/00ffff?text=Sprite', {
            frameWidth: 32,
            frameHeight: 48
        });
    }
  }

  create() {
    // This ensures the scene's create method runs every time it's launched
    this.events.on('wake', () => this.restartScene());

    // ✨ --- 2. Create the walking animation using the dynamic player key --- ✨
    this.anims.create({
        key: 'instruction_walk',
        // Use the dynamic key from the loaded player data
        frames: this.anims.generateFrameNumbers(this.playerKey, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });

    WebFont.load({
      google: {
        families: ['Press Start 2P']
      },
      active: () => {
        this.createUI();
      }
    });

    // Add keyboard listener to close the scene
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
    });
  }

  createUI() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // --- Background Dimmer ---
    this.add.rectangle(centerX, height / 2, width, height, 0x000000, 0.8);

    // --- Main Instruction Panel ---
    const panelWidth = width ;
    const panelHeight = height ;
    const panelX = centerX - panelWidth / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a2a4f, 1); // Dark blue background
    panel.fillRect(panelX, panelY, panelWidth, panelHeight);
    panel.lineStyle(4, 0x00ffff, 1); // Bright cyan border
    panel.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // --- Title ---
    this.add.text(centerX, panelY + 50, 'HOW TO PLAY', {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      fill: '#00ffff',
      align: 'center'
    }).setOrigin(0.5);

    // --- Controls Section ---
    const controlsY = panelY + 150;
    this.add.text(centerX, controlsY - 40, 'CONTROLS', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        fill: '#ffffff',
    }).setOrigin(0.5);

    // Draw a visual representation of the arrow keys
    this.createArrowKeys(centerX, controlsY + 50);

    // ✨ --- 3. Create the animated avatar sprite (now dynamic) --- ✨
    this.createAnimatedAvatar(centerX - 200, controlsY + 50);

    // ✨ --- 4. Adjusted text with better spacing --- ✨
    this.add.text(centerX + 260, controlsY + 50, 'Use the ARROW KEYS\nto move your character.', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        fill: '#dddddd',
        align: 'left',
        lineSpacing: 12 // Increased line spacing to prevent stacking
    }).setOrigin(0.5);


    // --- Mission Section ---
    const missionY = controlsY + 220; // Adjusted Y position
    this.add.text(centerX, missionY, 'YOUR MISSION', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        fill: '#ffffff',
    }).setOrigin(0.5);

    const missionText = [
        '> First, find the hidden puzzle in the room.',
        '> Then, solve it to unlock the main computer.'
    ];

    this.add.text(centerX, missionY + 60, missionText, {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        fill: '#dddddd',
        align: 'center',
        lineSpacing: 12 // Increased line spacing
    }).setOrigin(0.5);

    // --- Help & Exit Prompts ---
    const footerY = panelY + panelHeight - 50;
    this.add.text(centerX, footerY - 20, "Stuck? Press 'M' , use our AI to ask for help.", {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        fill: '#ffcc00', // Gold color for emphasis
    }).setOrigin(0.5);

    this.add.text(centerX, footerY + 20, '[ Press ESC to close ]', {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        fill: '#cccccc',
    }).setOrigin(0.5);
  }

  /**
   * Creates a graphical representation of the arrow keys.
   * @param {number} x - The center x position.
   * @param {number} y - The center y position.
   */
  createArrowKeys(x, y) {
    const keySize = 40;
    const spacing = 5;
    const keyGraphics = this.add.graphics();
    keyGraphics.fillStyle(0xcccccc, 1); // Light grey for keys
    keyGraphics.lineStyle(2, 0x000000, 1); // Black border

    // UP
    keyGraphics.strokeRect(x - keySize / 2, y - keySize - spacing, keySize, keySize).fillRect(x - keySize / 2, y - keySize - spacing, keySize, keySize);
    // DOWN
    keyGraphics.strokeRect(x - keySize / 2, y, keySize, keySize).fillRect(x - keySize / 2, y, keySize, keySize);
    // LEFT
    keyGraphics.strokeRect(x - keySize * 1.5 - spacing, y, keySize, keySize).fillRect(x - keySize * 1.5 - spacing, y, keySize, keySize);
    // RIGHT
    keyGraphics.strokeRect(x + keySize / 2 + spacing, y, keySize, keySize).fillRect(x + keySize / 2 + spacing, y, keySize, keySize);
  }

  /**
   * Creates and plays the animated avatar sprite.
   * @param {number} x - The center x position.
   * @param {number} y - The center y position.
   */
  createAnimatedAvatar(x, y) {
    // ✨ --- Use the dynamic player key to create the sprite --- ✨
    const avatar = this.add.sprite(x, y, this.playerKey);
    avatar.setScale(2.5);
    avatar.play('instruction_walk');
  }

  /**
   * Restarts the scene to ensure it's fresh every time.
   */
  restartScene() {
    // Pass the existing roomKey when restarting
    this.scene.restart({ roomKey: this.roomKey });
  }
}
