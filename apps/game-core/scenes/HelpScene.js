// scenes/HelpScene.js

import Phaser from 'phaser';

/**
 * HelpScene provides a simple 2D chat interface to an LLM (the "Genie").
 * Users can send up to `maxInteractions` messages, see responses inline,
 * and press 'Q' or click Quit to exit.
 */
export default class HelpScene extends Phaser.Scene {
  constructor() {
    super('HelpScene');
    this.interactions = 0;
    this.maxInteractions = 5;
    this.messages = [
      { role: 'system', content: 'You are a helpful game genie that assists the player.' }
    ];
  }

  create() {
  const { width, height } = this.scale;
  this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5);

  this.conversationText = this.add.text(20, 20, '', { /* … */ });
  this.domElement = this.add.dom(width/2, height-30, 'div').setHTML(`
    <input id="chatInput" style="width:${width-240}px;"/>
    <button id="sendBtn">Send</button>
    <button id="quitBtn">Quit</button>
  `);

  this.inputEl = this.domElement.node.querySelector('#chatInput');
  this.sendBtn = this.domElement.node.querySelector('#sendBtn');
  this.quitBtn = this.domElement.node.querySelector('#quitBtn');

  this.sendBtn.addEventListener('click', () => this.handleSend());
  this.quitBtn.addEventListener('click', () => this.scene.stop());
  this.input.keyboard.on('keydown-Q', () => this.scene.stop());

  this.updateConversation();
}

async handleSend() {
  const text = this.inputEl.value.trim();
  if (!text || this.interactions >= this.maxInteractions) return;

  this.interactions++;
  this.messages.push({ role: 'user', content: text });
  this.inputEl.value = '';
  this.updateConversation();

  try {
    const res = await fetch('http://localhost:5001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: this.messages })
    });
    const { reply } = await res.json();
    this.messages.push({ role: 'assistant', content: reply });
  } catch {
    this.messages.push({ role: 'assistant', content: 'Error: Unable to contact server.' });
  }

  this.updateConversation();

  if (this.interactions >= this.maxInteractions) {
    this.inputEl.disabled = true;
    this.sendBtn.disabled = true;
    this.add.text(this.scale.width/2, this.scale.height/2,
      'Interaction limit reached.',
      { font: '18px Arial', fill: '#ff0000' }
    ).setOrigin(0.5);
  }
}


  /**
   * Renders the conversation log into the text object.
   */
  updateConversation() {
    const lines = this.messages.map(msg => {
      const prefix = msg.role === 'user' ? 'You:'
                       : msg.role === 'assistant' ? 'Genie:' : '';
      return `${prefix} ${msg.content}`;
    });
    this.conversationText.setText(lines);
  }

  update() {
    // No per-frame logic needed
  }
}
