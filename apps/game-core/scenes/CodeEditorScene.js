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
        this.dataService = null;
        this.feedback = null;
        this.editorDOM = null;
        this.runButton = null;
    }

    init(data) {
        // Get the required services and profile from the global registry.
        this.userProfile = this.registry.get('userProfile');
        this.dataService = this.registry.get('dataService');

        // Get the current exercise from the room configuration
        const roomKey = data.roomKey || 'FirstArena';
        const room = rooms[roomKey];
        if (room && room.exercise) {
            this.currentExercise = room.exercise;
        } else {
            console.error(`CodeEditorScene: Exercise data not found for roomKey: "${roomKey}"`);
        }
    }

    create() {
        if (!this.currentExercise || !this.dataService || !this.userProfile) {
            this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'ERROR: Could not load challenge.\nMissing user profile or data service.', { font: '20px Arial', fill: '#ff0000', align: 'center' }).setOrigin(0.5);
            return;
        }

        // --- UI and CodeMirror setup ---
        const { width, height } = this.sys.game.canvas;
        const { title, template, description } = this.currentExercise;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.add.text(width / 2, 30, title, { font: '28px Consolas, Monaco, monospace', fill: '#00ffff' }).setOrigin(0.5);

        const editorX = (width - 760) / 2 + 10;
        const editorY = 100;
        const editorWidth = 740;
        const editorHeight = 350;

        const wrapper = document.createElement('div');
        this.editorDOM = this.add.dom(editorX, editorY, wrapper).setOrigin(0);

        this.time.delayedCall(10, () => {
            this.editor = CodeMirror(wrapper, { value: template.join('\n'), mode: 'python', theme: 'monokai', lineNumbers: true, autofocus: true });
            this.editor.setSize(editorWidth, editorHeight);
        });

        const uiY = editorY + editorHeight + 40;
        const btn = document.createElement('button');
        btn.textContent = 'Run Code';
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '18px';
        btn.style.cursor = 'pointer';

        this.runButton = this.add.dom(width / 2, uiY, btn);
        this.runButton.addListener('click');
        this.runButton.on('click', () => this.checkAnswer());
        
        this.feedback = this.add.text(width / 2, uiY + 60, description, { font: '16px Consolas, Monaco, monospace', fill: '#aaa', wordWrap: { width: editorWidth }, align: 'center' }).setOrigin(0.5);
        
        const exitText = this.add.text(width / 2, height - 20, 'Press Q to Exit', { font: '14px Arial', fill: '#888'}).setOrigin(0.5);
        this.input.keyboard.on('keydown-Q', () => this.scene.stop());
    }

    /**
     * This function is the core of the data logging process.
     */
     async checkAnswer() {
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

        const attemptData = {
            sessionId: this.userProfile.sessionId, //  Use the stored sessionId
            challengeId: this.currentExercise.id,
            submittedCode: code,
            isCorrect: allCorrect,
            errors: errors,
        };

        try {
            console.log("Calling dataService.logCodeAttempt...");
            await this.dataService.logCodeAttempt(attemptData); // This now calls the correct backend endpoint
            console.log("Attempt logged successfully!");

            if (allCorrect) {
                this.feedback.setText('✅ Correct! Challenge Complete!').setStyle({ fill: '#0f0' });
                this.runButton.removeListener('click');
                this.time.delayedCall(2000, () => this.scene.stop());
            } else {
                this.feedback.setText('❌ Incorrect. Review your code and try again!').setStyle({ fill: '#f00' });
            }

        } catch (error) {
            console.error("Failed to log code attempt:", error);
            this.feedback.setText('⚠️ Could not save progress. Please check your connection.').setStyle({ fill: '#f90' });
        }
    }
  
    shutdown() {
        // Clean up DOM elements and listeners to prevent memory leaks
        if (this.editor) {
            this.editor.toTextArea(); 
            this.editor = null;
        }
        if (this.editorDOM) this.editorDOM.destroy();
        if (this.runButton) this.runButton.destroy();
        this.input.keyboard.off('keydown-Q');
    }
}