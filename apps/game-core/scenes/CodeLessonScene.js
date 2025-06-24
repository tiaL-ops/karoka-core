// game-core/scenes/CodeLessonScene.js

import CodePanel from '../ui/codePanel.js';

export default class CodeLessonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CodeLessonScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.6)');

    const lessonText = `
    // Welcome to your first Code Lesson!

    // In programming, variables are like labeled boxes
    // where you can store information.

    let x = 10; // 'x' is a variable holding the number 10

    let name = "Annah"; // 'name' holds the text "Annah"

    // You can perform operations with them.
    let y = x + 5; // y would now be 15

    // This is fundamental to solving puzzles in this world.
    // Press 'Q' to return.
    `;

    this.codePanel = new CodePanel(this, 200, 150, lessonText);

    this.input.keyboard.on('keydown-Q', () => {
        this.scene.stop('CodeLessonScene');
        if (this.scene.isSleeping('PlayScene')) {
            this.scene.wake('PlayScene');
        }
    });
  }
}