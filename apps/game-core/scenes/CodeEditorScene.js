import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/python/python.js';
import { rooms } from '../config/roomData.js';

export default class CodeEditorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CodeEditorScene' });
    this.currentExercise = null;
    this.editor = null;
    this.userProfile = null;
    this.feedback = null;
    this.editorDOM = null;
    this.runButton = null;
  }

  init(data) {
    // Get userProfile from the registryso we can log attempts
    this.userProfile = this.registry.get('userProfile');
    console.log('CodeEditorScene: User Profile:', this.userProfile);

    const roomKey = data.roomKey || 'FirstArena';
    if (rooms[roomKey] && rooms[roomKey].exercise) {
      this.currentExercise = rooms[roomKey].exercise;
    } else {
      console.error(`CodeEditorScene: Exercise data not found for roomKey: "${roomKey}"`);
      this.currentExercise = null;
    }
  }

  create() {
    // Gracefully handle if exercise data could not be loaded
    if (!this.currentExercise) {
      this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'ERROR: Could not load exercise data.', { font: '20px Arial', fill: '#ff0000' }).setOrigin(0.5);
      const backButton = this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2 + 50, 'Go Back', { font: '24px Arial', fill: '#ffffff', backgroundColor: '#555', padding: { x:10, y:5 }})
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      backButton.on('pointerdown', () => this.scene.start('PlayScene'));
      return;
    }

    const { width, height } = this.sys.game.canvas;
    const { title, template, description, readOnlyRegions } = this.currentExercise;

    // --- UI Elements ---
    this.add.text(width / 2, 30, title, { font: '28px Consolas, Monaco, monospace', fill: '#00ffff' }).setOrigin(0.5);
    this.add.rectangle(width / 2, height / 2 + 40, 760, 500, 0x1e1e1e, 0.95).setStrokeStyle(2, 0x00ffff);

    // --- CodeMirror Editor Setup ---
    const editorX = (width - 760) / 2 + 10;
    const editorY = 100;
    const editorWidth = 740;
    const editorHeight = 350;

    const wrapper = document.createElement('div');
    wrapper.style.width = `${editorWidth}px`;
    wrapper.style.height = `${editorHeight}px`;

    this.editorDOM = this.add.dom(editorX, editorY, wrapper).setOrigin(0);

    // Use a small delay to ensure the DOM element is fully ready
    this.time.delayedCall(10, () => {
      this.editor = CodeMirror(wrapper, {
        value: template.join('\n'),
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        autofocus: true
      });
      this.editor.setSize(editorWidth, editorHeight);

      const doc = this.editor.getDoc();
      if (readOnlyRegions) {
        readOnlyRegions.forEach(region => {
          const from = { line: region.from.line, ch: region.from.ch };
          const to = { line: region.to.line, ch: region.to.ch === Infinity ? null : region.to.ch };
          doc.markText(from, to, { readOnly: true, className: 'readonly-code' });
        });
      }
    });

    // --- UI Below Editor ---
    const uiY = editorY + editorHeight + 25;

    const btn = document.createElement('button');
    btn.textContent = 'Run Code';
    btn.style.padding = '10px 20px';
    btn.style.fontSize = '16px';
    btn.style.cursor = 'pointer';
    this.runButton = this.add.dom(editorX + 650, uiY, btn).setOrigin(0.5);
    this.runButton.addListener('click').on('click', () => this.checkAnswer());

    this.feedback = this.add.text(editorX, uiY, description, { font: '16px Consolas, Monaco, monospace', fill: '#aaa', wordWrap: { width: 500 } }).setOrigin(0, 0.5);

    this.add.text(width / 2, height - 20, 'Press Q to exit the challenge', { font: '14px Arial', fill: '#888'}).setOrigin(0.5);
    this.input.keyboard.on('keydown-Q', () => {
      this.scene.start('PlayScene');
    });
  }

  async checkAnswer() {
    if (!this.editor ){
        console.error("Editor Cannot log attempt.");
        this.feedback.setText('ERROR: User not loaded. Cannot save progress.').setStyle({fill: '#f00'});
        return;
    }
    if (!this.userProfile) {
        console.error(" User Profile not available. Cannot log attempt.");
        this.feedback.setText('ERROR: User not loaded. Cannot save progress.').setStyle({fill: '#f00'});
        return;
    }


    const code = this.editor.getValue();
    const validationRules = this.currentExercise.validation;
    let allCorrect = true;
    const errors = [];

    for (const key in validationRules) {
        const expectedValue = validationRules[key];
        let actualValue = null;
        try {
            if (typeof expectedValue === 'number') {
                const match = code.match(new RegExp(`${key}\\s*=\\s*(\\d+)`));
                actualValue = match ? parseInt(match[1], 10) : null;
            } else if (typeof expectedValue === 'string') {
                const match = code.match(new RegExp(`${key}\\s*=\\s*["']([^"']+)["']`));
                actualValue = match ? match[1] : null;
            }
            if (actualValue !== expectedValue) {
                allCorrect = false;
                errors.push({ variable: key, expected: expectedValue, actual: actualValue });
            }
        } catch (e) {
            allCorrect = false;
            errors.push({ error: `Error validating ${key}: ${e.message}` });
        }
    }

    if (allCorrect) {
        this.feedback.setText('✅ Correct! Well done!').setStyle({ fill: '#0f0' });
    } else {
        this.feedback.setText('❌ Incorrect. Try again!').setStyle({ fill: '#f00' });
    }

    // Emit an event for the React component to handle the API call
    const attemptData = {
        sessionId: this.userProfile.sessionId,
        challengeId: this.currentExercise.id,
        submittedCode: code,
        isCorrect: allCorrect,
        errors: errors,
    };

    this.game.events.emit('submitAttempt', attemptData);
  }
  
  // Clean up DOM elements when the scene shuts down
  shutdown() {
    if (this.editorDOM) {
      this.editorDOM.destroy();
    }
    if (this.runButton) {
      this.runButton.destroy();
    }
    this.input.keyboard.off('keydown-Q');
  }
}
