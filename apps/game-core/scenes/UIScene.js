// scenes/UIScene.js

import CodePanel from '../ui/codePanel.js';
import DialogBox from '../ui/dialogBox.js';
/**
 * UIScene runs on top of ArenaScene to display UI elements
 * like code snippets, dialogue, and inventory. This keeps
 * UI logic separate from game logic.
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
  }

  init(data) {
    this.codeSnippet = data.snippet;
    this.karoEnabled = data.karoEnabled;
  }

  create() {
    console.log("UIScene: Creating UI elements.");

    // Create the code panel to display the puzzle
    this.codePanel = new CodePanel(this, 10, 10, this.codeSnippet);

    // If Karo is enabled for this arena, create the dialog box
    if (this.karoEnabled) {
      this.dialogBox = new DialogBox(this, 'Karo', 'Need a hint? Click here!');
    }
  }
}