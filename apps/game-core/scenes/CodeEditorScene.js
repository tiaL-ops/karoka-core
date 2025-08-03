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
        
        // --- NEW: State management for password and UI elements ---
        this.isAuthenticated = false;
        this.passwordUI = {};
        this.editorUI = {};
        // ---------------------------------------------------------
    }

    init(data) {
        this.userProfile = this.registry.get('userProfile');
        this.dataService = this.registry.get('dataService');

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
            this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'ERROR: Could not load challenge.', { font: '20px Arial', fill: '#ff0000', align: 'center' }).setOrigin(0.5);
            return;
        }

        const { width, height } = this.sys.game.canvas;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        // --- Create both UIs, but only show the password prompt initially ---
        this.createPasswordPrompt();
        this.createCodeEditorUI();
        // ------------------------------------------------------------------
        
        const exitText = this.add.text(width / 2, height - 20, 'Press Q to Exit', { font: '14px Arial', fill: '#888'}).setOrigin(0.5);
        this.input.keyboard.on('keydown-Q', () => this.scene.stop());
    }

    createPasswordPrompt() {
        const { width, height } = this.sys.game.canvas;
        const centerX = width / 2;
        const centerY = height / 2;

        const promptText = this.add.text(centerX, centerY - 80, 'Enter Password to Access Challenge', { font: '22px Consolas, Monaco, monospace', fill: '#ffffff' }).setOrigin(0.5);

        // --- FIX: Create a div container and then set its innerHTML ---
        // This ensures the HTML is parsed and rendered as an input box.
        const passwordInput = this.add.dom(centerX, centerY, 'div').setOrigin(0.5);
        const inputHTML = `
            <input type="password" id="passwordInput" placeholder="Password..." style="width: 250px; padding: 10px; font-size: 16px; text-align: center;">
        `;
        passwordInput.setHTML(inputHTML);
        // -------------------------------------------------------------

        const submitButton = this.add.text(centerX, centerY + 60, '[ SUBMIT ]', { font: '20px Consolas, Monaco, monospace', fill: '#4CAF50', backgroundColor: '#333', padding: { x: 10, y: 5 } }).setOrigin(0.5);
        submitButton.setInteractive({ useHandCursor: true });
        submitButton.on('pointerdown', () => this.verifyPassword());

        const feedbackText = this.add.text(centerX, centerY + 110, '', { font: '16px Consolas, Monaco, monospace', fill: '#ff0000' }).setOrigin(0.5);
        
        this.passwordUI = { promptText, passwordInput, submitButton, feedbackText };
    }

    verifyPassword() {
        const password = this.passwordUI.passwordInput.node.querySelector('#passwordInput').value;
        if (password === 'karo') {
            // Correct password, hide prompt and show editor
            Object.values(this.passwordUI).forEach(el => el.destroy());
            Object.values(this.editorUI).forEach(el => el.setVisible(true));
            this.isAuthenticated = true;
        } else {
            // Incorrect password
            this.passwordUI.feedbackText.setText('Incorrect. You need to enter the password.');
            this.passwordUI.passwordInput.node.querySelector('#passwordInput').value = '';
        }
    }

    createCodeEditorUI() {
        const { width, height } = this.sys.game.canvas;
        const { title, template, description } = this.currentExercise;

        const titleText = this.add.text(width / 2, 30, title, { font: '28px Consolas, Monaco, monospace', fill: '#00ffff' }).setOrigin(0.5);

        const editorX = (width - 760) / 2 + 10;
        const editorY = 100;
        const editorWidth = 740;
        const editorHeight = 350;

        const wrapper = document.createElement('div');
        const editorDOM = this.add.dom(editorX, editorY, wrapper).setOrigin(0);

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

        const runButton = this.add.dom(width / 2, uiY, btn);
        runButton.addListener('click');
        runButton.on('click', () => this.checkAnswer());
        
        const feedback = this.add.text(width / 2, uiY + 60, description, { font: '16px Consolas, Monaco, monospace', fill: '#aaa', wordWrap: { width: editorWidth }, align: 'center' }).setOrigin(0.5);
        
        this.editorUI = { titleText, editorDOM, runButton, feedback };
        // Hide editor UI by default
        Object.values(this.editorUI).forEach(el => el.setVisible(false));
    }

    async checkAnswer() {
        if (!this.isAuthenticated) return; // Prevent running if not authenticated

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
            sessionId: this.userProfile.sessionId,
            challengeId: this.currentExercise.id,
            submittedCode: code,
            isCorrect: allCorrect,
            errors: JSON.stringify(errors), // Ensure errors are a string
        };

        try {
            await this.dataService.logCodeAttempt(attemptData);
            if (allCorrect) {
                this.editorUI.feedback.setText('✅ Correct! Challenge Complete!').setStyle({ fill: '#0f0' });
                this.editorUI.runButton.removeListener('click');
                this.time.delayedCall(2000, () => this.scene.stop());
            } else {
                this.editorUI.feedback.setText('❌ Incorrect. Review your code and try again!').setStyle({ fill: '#f00' });
            }
        } catch (error) {
            console.error("Failed to log code attempt:", error);
            this.editorUI.feedback.setText('⚠️ Could not save progress. Please check your connection.').setStyle({ fill: '#f90' });
        }
    }
  
    shutdown() {
        if (this.editor) {
            this.editor.toTextArea(); 
            this.editor = null;
        }
        // Destroy all UI elements to prevent memory leaks
        Object.values(this.passwordUI).forEach(el => el.destroy());
        Object.values(this.editorUI).forEach(el => el.destroy());
        this.input.keyboard.off('keydown-Q');
    }
}
