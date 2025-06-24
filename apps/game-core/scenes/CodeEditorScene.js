// game-core/scenes/CodeEditorScene.js

export default class CodeEditorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CodeEditorScene' });
  }

  create() {
    console.log("hi");

   
    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.8)');
    
    const promptText = "Fill in the blanks so the output is: 'Galaxia has 4 town and 2 Tera'";
    this.add.text(100, 50, promptText, { font: '18px Monospace', fill: '#ffffff', wordWrap: { width: 600 } });

    const formHtml = `
      <div style="position: absolute; top: 120px; left: 100px; color: white; font-family: monospace; font-size: 16px;">
        <pre>
a, b, c = 1, 2, []
town = "Galaxia"
city = "Tera"

# Re-assign 'c' to be a number and 'town' to hold the string
c = <input type="text" id="blank1" size="5" style="background:#333; color:white; border: 1px solid #777;">
town = <input type="text" id="blank2" size="10" style="background:#333; color:white; border: 1px solid #777;">

print(f"'{town} has {c} town and {b} {city}'")
        </pre>
      </div>
    `;
    this.formElement = this.add.dom(0, 0).createFromHTML(formHtml);

    const submitButtonHtml = `<button id="submit-btn" style="position: absolute; top: 320px; left: 100px; font-size: 18px;">Submit</button>`;
    this.submitButton = this.add.dom(0, 0).createFromHTML(submitButtonHtml);
    this.submitButton.addListener('click');

    this.submitButton.on('click', () => {
        const answer1 = this.formElement.getChildByID('blank1').value;
        const answer2 = this.formElement.getChildByID('blank2').value;

        if (answer1.trim() === '4' && (answer2.trim() === '"Galaxia"' || answer2.trim() === 'Galaxia')) {
             console.log("Answer is: Correct!");
             this.feedbackText.setText("Correct! You solved the puzzle.").setColor('#00ff00');
        } else {
             console.log(`Answer is: Incorrect. You submitted c=${answer1}, town=${answer2}`);
             this.feedbackText.setText("Almost! Check your values and try again.").setColor('#ff0000');
        }
    });

    this.feedbackText = this.add.text(100, 370, 'Fill the blanks and click "Submit".', { font: '16px Monospace', fill: '#ffffff' });

    this.add.text(100, 550, "Press 'Q' to exit.", { font: '14px Monospace', fill: '#888888' });
    this.input.keyboard.on('keydown-Q', () => {
        this.formElement.destroy();
        this.submitButton.destroy();
        this.scene.stop('CodeEditorScene');
    });
    
  }
}