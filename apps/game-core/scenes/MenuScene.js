

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.uiElements = []; // To keep track of all UI elements
  }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    const { width, height } = this.scale;

    // Create a semi-transparent background overlay
    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.uiElements.push(background);

    WebFont.load({
      google: {
        families: ['Press Start 2P']
      },
      active: () => {
        this.createMenuUI();
      }
    });

    this.input.keyboard.on('keydown-ESC', this.resumeGame, this);
  }

  createMenuUI() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // --- Paused Title ---
    const title = this.add.text(centerX, height * 0.2, 'Paused', {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // --- Menu Buttons ---
    const menuYPosition = height * 0.45;
    const buttonSpacing = 70;

    const resumeButton = this.add.text(centerX, menuYPosition, 'Resume', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      fill: '#4CAF50'
    }).setOrigin(0.5);

    const varkButton = this.add.text(centerX, menuYPosition + buttonSpacing, 'VARK Test', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const helpButton = this.add.text(centerX, menuYPosition + buttonSpacing * 2, 'Ask for Help', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const codeButton = this.add.text(centerX, menuYPosition + buttonSpacing * 3, 'Coding Assignment', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Add all UI elements to the array for easy show/hide
    this.uiElements.push(title, resumeButton, varkButton, helpButton, codeButton);

    // --- Interactivity ---
    this.makeButtonInteractive(resumeButton, this.resumeGame, this);
    // FIX: When launching a sub-scene, we now also hide the pause menu
    this.makeButtonInteractive(varkButton, () => this.launchSubScene('VARKScene'));
    this.makeButtonInteractive(helpButton, () => this.launchSubScene('HelpScene'));
    this.makeButtonInteractive(codeButton, () => this.launchSubScene('CodeEditorScene'));
  }

  makeButtonInteractive(button, callback, context) {
    button.setInteractive({ useHandCursor: true });
    const originalColor = button.style.fill;
    button.on('pointerover', () => button.setFill('#007BFF'));
    button.on('pointerout', () => button.setFill(originalColor));
    button.on('pointerdown', () => {
      if (context) {
        callback.call(context);
      } else {
        callback();
      }
    });
  }

  // This function handles launching other scenes from the pause menu
  launchSubScene(sceneKey) {
    // Hide the pause menu UI
    this.toggleUI(false);

    // Launch the new scene
    this.scene.launch(sceneKey);

    // Listen for when the launched scene shuts down
    this.scene.get(sceneKey).events.once('shutdown', () => {
      // When it shuts down, make the pause menu visible again
      this.toggleUI(true);
    });
  }

  // Toggles the visibility of all UI elements in this scene
  toggleUI(visible) {
    this.uiElements.forEach(element => element.setVisible(visible));
  }

  resumeGame() {
    // Resume the main game scene (ArenaScene)
    this.scene.resume('ArenaScene');
    // Stop the PauseScene itself
    this.scene.stop();
  }
}
