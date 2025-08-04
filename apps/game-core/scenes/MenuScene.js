

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

  // ── 1) Dark-green striped full-screen background ──
  const bg = this.add.graphics();
  bg.fillStyle(0x164A2C, 1).fillRect(0, 0, width, height);
  bg.lineStyle(1, 0x1F593B, 1);
  for (let y = 0; y < height; y += 12) {
    bg.beginPath().moveTo(0, y).lineTo(width, y).strokePath();
  }
  this.uiElements.push(bg);

  // ── 2) Pale-green panel with black border ──
  const panelW = width * 0.6;
  const panelH = height * 0.7;
  const panelX = centerX - panelW / 2;
  const panelY = height * 0.15;
  const panel = this.add.graphics()
    .fillStyle(0xA3D9A5, 1)
    .lineStyle(4, 0x000000, 1)
    .fillRect(panelX, panelY, panelW, panelH)
    .strokeRect(panelX, panelY, panelW, panelH);
  this.uiElements.push(panel);

  // ── 3) Grey header bar ──
  const headerH = 60;
  const header = this.add.graphics()
    .fillStyle(0xC0C0C0, 1)
    .lineStyle(4, 0x000000, 1)
    .fillRect(panelX, panelY, panelW, headerH)
    .strokeRect(panelX, panelY, panelW, headerH);
  this.uiElements.push(header);

  // ── 4) YOUR TITLE (unchanged var name!) ──
  const title = this.add.text(
    centerX,
    panelY + headerH / 2,
    'Paused',
    {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      fill: '#000000',
      stroke: '#000000',
      strokeThickness: 4
    }
  ).setOrigin(0.5);

  // ── 5) Create ALL label Texts first ──
  const labels    = ['Resume', 'VARK Test', 'Ask for Help', 'Coding Assignment'];
  const startY    = panelY + headerH + 30;
  const spacing   = 70;
  const btnHeight = 50;
  const buttonTexts = labels.map((label, i) => {
    const y = startY + i * spacing;
    return this.add.text(centerX, y, label, {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      fill: '#000000'
    }).setOrigin(0.5);
  });

  // ── 6) Measure widest Text → uniform boxWidth ──
  const maxTextWidth = Math.max(...buttonTexts.map(t => t.width));
  const boxWidth     = maxTextWidth + 40;
  const boxX         = centerX - boxWidth / 2;

  // ── 7) Draw each green box **behind** its Text ──
  buttonTexts.forEach(txt => {
    const y = txt.y;
    const box = this.add.graphics()
      .fillStyle(0xB7E0B2, 1)
      .lineStyle(3, 0x000000, 1)
      .fillRect(boxX, y - btnHeight/2, boxWidth, btnHeight)
      .strokeRect(boxX, y - btnHeight/2, boxWidth, btnHeight);

    box.setDepth(0);
    txt.setDepth(1);
    this.uiElements.push(box);
  });

  // ── 8) Destructure back to YOUR original vars ──
  const [resumeButton, varkButton, helpButton, codeButton] = buttonTexts;

  // ── 9) Keep your exact push of title + buttons ──
  this.uiElements.push(
    title,
    resumeButton,
    varkButton,
    helpButton,
    codeButton
  );

  // ── 10) Interactivity: black ↔ blue only ──
  const makeBtn = (btn, fn) => {
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover',  () => btn.setFill('#007BFF'));
    btn.on('pointerout',   () => btn.setFill('#000000'));
    btn.on('pointerdown',  fn, this);
  };
  makeBtn(resumeButton, () => this.resumeGame());
  makeBtn(varkButton,   () => this.launchSubScene('VARKScene'));
  makeBtn(helpButton,   () => this.launchSubScene('HelpScene'));
  makeBtn(codeButton,   () => this.launchSubScene('CodeEditorScene'));

  // ── 11) Grey footer + “Choose an option.” text ──
  const footerY = panelY + panelH - 30;
  const footerBar = this.add.graphics()
    .fillStyle(0xC0C0C0, 1)
    .lineStyle(4, 0x000000, 1)
    .fillRect(boxX, footerY - 25, boxWidth, 50)
    .strokeRect(boxX, footerY - 25, boxWidth, 50);
  footerBar.setDepth(0);
  this.uiElements.push(footerBar);

  const footerText = this.add.text(centerX, footerY, 'Choose an option.', {
    fontFamily: '"Press Start 2P"',
    fontSize: '18px',
    fill: '#000000'
  }).setOrigin(0.5).setDepth(1);
  this.uiElements.push(footerText);
}


  makeButtonInteractive(button, callback, context) {
    button.setInteractive({ useHandCursor: true });
    const originalColor = button.style.fill;
    button.on('pointerover', () => button.setFill('#007BFF'));
    button.on('pointerout', () => button.setFill(black));
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
