

export default class HistoryScene extends Phaser.Scene {
  constructor() {
    super('HistoryScene');
    
 this.storyScript = [
  "Welcome to the world of Karo.",
  "It’s the year 2030. A virus has wiped out every computer in the world \n (Yeah, yeah, we know, classic dystopian setup. I’m working on it.)",
  "Anyway... you are the hero of this story. (Pretty cool, right?)",
  "Your mission: connect to the world’s major computers and clean out the virus by solving coding problems.",
  "There are 7 main systems to fix.",
  "But before you go saving the world... you need to \"make your bed\".",
  "Or more precisely... start small.",
  "Your first challenge starts at home.",
  "The main computer in your house is locked.",
  "To unlock it, you’ll need a password.",
  "To get the password, you need to solve a hidden puzzle in your room.",
  "Look around. Think smart. Store things right.",
  "Solve the mystery, and let the real journey begin.",
  "Good luck, Code Seeker."
];

    
    this.currentLineIndex = 0;
    this.storyText = null;
    this.promptText = null;
    this.typingTimer = null;
    this.isTyping = false;
    this.blinkingCursor = null;
  }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    
    WebFont.load({
      google: {
        families: ['Press Start 2P']
      },
      active: () => {
        this.createUI();
        this.typeNextLine();
      }
    });

    this.input.keyboard.on('keydown-ENTER', this.handleEnterPress, this);
    this.input.keyboard.on('keydown-ESC', this.startGame, this);
  }

  createUI() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // --- Enhanced Decorated Text Box ---
    const boxWidth = width * 0.9;
    const boxHeight = height * 0.6;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;
    const cornerSize = 16;

    const box = this.add.graphics();
    box.fillStyle(0x0d0d0d, 0.9); // Even darker, slightly transparent fill
    box.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Add corner brackets for a more retro terminal feel
    box.lineStyle(4, '#33FF33', 1); // A more vibrant, classic green
    box.beginPath();
    // Top-left
    box.moveTo(boxX, boxY + cornerSize);
    box.lineTo(boxX, boxY);
    box.lineTo(boxX + cornerSize, boxY);
    // Top-right
    box.moveTo(boxX + boxWidth - cornerSize, boxY);
    box.lineTo(boxX + boxWidth, boxY);
    box.lineTo(boxX + boxWidth, boxY + cornerSize);
    // Bottom-right
    box.moveTo(boxX + boxWidth, boxY + boxHeight - cornerSize);
    box.lineTo(boxX + boxWidth, boxY + boxHeight);
    box.lineTo(boxX + boxWidth - cornerSize, boxY + boxHeight);
    // Bottom-left
    box.moveTo(boxX + cornerSize, boxY + boxHeight);
    box.lineTo(boxX, boxY + boxHeight);
    box.lineTo(boxX, boxY + boxHeight - cornerSize);
    box.strokePath();

    // --- Story Text Area (with new styling) ---
    this.storyText = this.add.text(centerX, centerY, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      fill: '#ffffff', // Changed to white as requested
      align: 'center',
      wordWrap: { width: boxWidth - 60 },
      lineSpacing: 15 // Added line spacing
    }).setOrigin(0.5);

    // --- Blinking Cursor ---
    this.blinkingCursor = this.add.graphics();
    this.blinkingCursor.fillStyle(0xffffff, 1);
    this.blinkingCursor.fillRect(0, 0, 12, 22);
    this.blinkingCursor.setVisible(false);
    this.tweens.add({
        targets: this.blinkingCursor,
        alpha: 0,
        duration: 350,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
    });

    // --- Instruction Prompts ---
    this.promptText = this.add.text(centerX, height - 60, '[ Press ENTER to continue ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      fill: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(centerX, height - 30, '(Press ESC to skip)', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      fill: '#666666'
    }).setOrigin(0.5);
  }

  handleEnterPress() {
    if (this.isTyping) {
      // If typing, skip to the end of the line
      this.skipTyping();
    } else {
      // If not typing, display the next line
      this.typeNextLine();
    }
  }

  typeNextLine() {
    if (this.currentLineIndex >= this.storyScript.length) {
      this.startGame();
      return;
    }

    const line = this.storyScript[this.currentLineIndex];
    this.storyText.setText(''); // Clear previous text
    this.isTyping = true;
    this.promptText.setVisible(false); // Hide prompt while typing

    let charIndex = 0;
    this.typingTimer = this.time.addEvent({
      delay: 50, // Speed of the typing effect
      callback: () => {
        this.storyText.text += line[charIndex];
        this.updateCursorPosition();
        charIndex++;
        if (charIndex === line.length) {
          this.isTyping = false;
          if (this.typingTimer) this.typingTimer.remove();
          this.promptText.setVisible(true);
          this.updateCursorPosition(); // Final cursor position
        }
      },
      repeat: line.length - 1
    });

    this.currentLineIndex++;
    if (this.currentLineIndex >= this.storyScript.length) {
      this.promptText.setText('[ Press ENTER to begin ]');
    }
  }

  skipTyping() {
    if (this.typingTimer) this.typingTimer.remove();
    this.isTyping = false;
    this.storyText.setText(this.storyScript[this.currentLineIndex - 1]);
    this.promptText.setVisible(true);
    this.updateCursorPosition();
  }

  updateCursorPosition() {
      const textBounds = this.storyText.getBounds();
      // Position cursor at the end of the current text line
      this.blinkingCursor.setPosition(textBounds.right + 5, textBounds.y - 1);
      this.blinkingCursor.setVisible(true);
  }

  startGame() {
    this.scene.start('ArenaScene', { roomKey: 'FirstArena' });
  }
}
