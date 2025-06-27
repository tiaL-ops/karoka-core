// game-core/scenes/CodeEditorScene.js
import CodeMirror from 'codemirror';
import { rooms } from '../config/roomData.js';

export default class CodeEditorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CodeEditorScene' });
    this.currentExercise = null;
    this.editor = null;
  }

  init(data) {
    const roomKey = data.roomKey || 'FirstArena'; 
    if (rooms[roomKey] && rooms[roomKey].exercise) {
      this.currentExercise = rooms[roomKey].exercise;
    } else {
      console.error(`CodeEditorScene: Exercise data not found for roomKey: "${roomKey}"`);
    }
  }

  create() {
    if (!this.currentExercise) {
      this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'ERROR: Could not load exercise data.', { fill: '#ff0000' }).setOrigin(0.5);
      return;
    }

    const { width, height } = this.sys.game.canvas;
    const { title, template, description, readOnlyRegions } = this.currentExercise;

    // --- Header ---
    this.add.text(width / 2, 24, title, { font: '36px Consolas, Monaco, monospace', fill: '#0ff', stroke: '#00f', strokeThickness: 4 }).setOrigin(0.5);
    
    // --- Dark background panel ---
    this.add.rectangle(width / 2, height / 2 + 30, 760, 500, 0x1e1e1e, 0.95);

    // --- CodeMirror editor ---
    const edX = (width - 760) / 2, edY = 80, edW = 760, edH = 400;
    const wrapper = document.createElement('div');
    this.editorDOM = this.add.dom(edX, edY, wrapper).setOrigin(0);

    this.time.delayedCall(0, () => {
      this.editor = CodeMirror(wrapper, {
        value: template.join('\n'),
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        autofocus: true
      });

      const doc = this.editor.getDoc();
      if (readOnlyRegions) {
        readOnlyRegions.forEach(region => {
          const from = { line: region.from.line, ch: region.from.ch };
          const to = { line: region.to.line, ch: region.to.ch === 'Infinity' ? null : region.to.ch };
          doc.markText(from, to, { readOnly: true });
        });
      }
    });

    // --- Run button ---
    const btn = document.createElement('button');
    btn.textContent = 'Run';
    this.runButton = this.add.dom(edX, edY + edH + 10, btn).setOrigin(0);
    this.runButton.addListener('click').on('click', () => this.checkAnswer());

    // --- Feedback text ---
    this.feedback = this.add.text(edX + 100, edY + edH + 14, description, { font: '18px Consolas, Monaco, monospace', fill: '#aaa' });

    // --- Exit hint ---
    
    this.input.keyboard.on('keydown-Q', () => {
     
  
      this.scene.stop();
    });
  }

  async checkAnswer() {
    if (!this.editor) return;

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
          errors.push({
            variable: key,
            expected: expectedValue,
            actual: actualValue
          });
        }
      } catch (e) {
        allCorrect = false;
        errors.push({ error: `Error validating ${key}: ${e.message}` });
      }
    }

    if (allCorrect) {
      this.feedback.setText('✅ Correct! Well done!').setStyle({ fill: '#0f0' });
      console.log('✅ Player solved it.');
    } else {
      this.feedback.setText('❌ Incorrect. Try again!').setStyle({ fill: '#f00' });
      console.log('❌ Wrong values submitted.');
    }

    // Log the attempt to the backend
    try {
      await logGameAttempt({
        sessionId: this.userProfile.sessionId,
        challengeId: this.currentExercise.id,
        submittedCode: code,
        isCorrect: allCorrect,
        errors: errors,
      });
      console.log('Game attempt logged successfully.');
    } catch (error) {
      console.error('Failed to log game attempt:', error);
      // You could show an error to the user here if desired
    }
  }

}