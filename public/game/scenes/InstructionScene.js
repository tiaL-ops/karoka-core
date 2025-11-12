export default class InstructionsScene extends Phaser.Scene {
  constructor(competitionData) {
    super({ key: 'InstructionsScene' });
    this.competitionData = competitionData;
  }

  preload() {
    // Load assets for icons and visuals
    const data = this.competitionData;

    if (Array.isArray(data.instructions)) {
      data.instructions.forEach((ins) => {
        this.load.image(ins.key,ins.url, {
        });
      });
    }

  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#1e1e2f');

    // Title text
    this.add.text(
      this.cameras.main.centerX, 
      50, 
      'How to Play Karoka', 
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
      }
    ).setOrigin(0.5);

    // Instruction layout with pop-up images
    const instructions = [
      { text: "1. The riddle is inside the quotes. Here is a screenshot :)", image: 'RI' },
      { text: "2. If you need help, click the hint button to visit helpful websites", image: null },
      { text: "3. Now, where do you find the riddle?", image: null },
      { text: "4. Inside the game! Search for it and solve it!", image: null },
      { text: "5. Good luck!", image: null }
    ];
    

    let yOffset = 120;
    let popupImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, '').setVisible(false);
    
    instructions.forEach(({ text, image }) => {
      let instructionText = this.add.text(
        this.cameras.main.centerX - 250, 
        yOffset, 
        text,
        {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#ffffff',
          wordWrap: { width: 500 }
        }
      ).setOrigin(0);

      if (image) {
        let button = this.add.text(this.cameras.main.centerX , yOffset + 40, '[See Here]', {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#00ff00',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 },
        }).setOrigin(0.5).setInteractive();

        button.on('pointerdown', () => {
          popupImage.setTexture(image).setScale(0.5).setVisible(true).setDepth(1);
        });
      }

      yOffset += 80;
    });

    // Click anywhere to close popup image
    this.input.on('pointerdown', (pointer, currentlyOver) => {
      if (!currentlyOver.length) {
        popupImage.setVisible(false);
      }
    });

    
    // Return Button
    const startButton = this.add.text(
      this.cameras.main.centerX -100, 
      yOffset , 
      'Start Game', 
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    ).setOrigin(0.5)
     .setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('WorldScene');
    });


    const back= this.add.text(
      this.cameras.main.centerX + 100, 
      yOffset , 
      'Return', 
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    ).setOrigin(0.5)
     .setInteractive();

    back.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
  
}
