// HelpScene.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default class HelpScene extends Phaser.Scene {
  constructor() {
    super('HelpScene');
    this.interactions = 0;
    this.maxInteractions = 5;
    this.messages = [
      {
        role: 'system',
        content: 'You are Karo, a helpful game genie that assists the player through this 2D game that teaches Python. The user is a beginner. Explain what a variable is, concisely.'
      }
    ];
    this.greeting = "Hi, I'm Karo! What can I help you with?";
    this.chatArea = {};
  }

  init() {
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
    if (!this.userProfile || !this.dataService) {
      console.error("HelpScene requires userProfile + dataService");
      this.scene.stop();
    }
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#222');
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.6);

    // Chat panel base config
    const x = 20, y = 20;
    const w = width - 40;
    const maxH = 300;
    const padding = 8;
    this.chatArea = { x, y, w, maxH, padding };

    // Initial greeting text
    this.convText = this.add.text(x + padding, y + padding, this.greeting, {
      fontFamily: 'Courier, monospace',
      fontSize: '16px',
      color: '#eee',
      wordWrap: { width: w - 2 * padding }
    }).setDepth(1);

    // Measure and clamp panel height
    const textH = this.convText.height;
    const panelH = Math.min(textH + 2 * padding, maxH);

    // Panel background
    this.chatWinRect = this.add.rectangle(x, y, w, panelH, 0x111111).setOrigin(0);
    this.chatWinRect.setStrokeStyle(2, 0xffffff);

    // Mask for text overflow
    this.maskGraphics = this.make.graphics();
    this.maskGraphics.fillRect(x + padding, y + padding, w - 2 * padding, panelH - 2 * padding);
    this.textMask = this.maskGraphics.createGeometryMask();
    this.convText.setMask(this.textMask);

    // Input area
    const inputH = 28;
    this.chatArea.inputH = inputH;
    this.inputBox = this.add.rectangle(x, y + panelH + 10, w - 80, inputH, 0x333333).setOrigin(0);
    this.inputBox.setStrokeStyle(2, 0xffffff);
    this.inputText = this.add.text(x + 8, y + panelH + 10 + 6, '', {
      fontFamily: 'Courier, monospace',
      fontSize: '16px',
      color: '#fff'
    }).setDepth(1);

    // Buttons
    this.sendBtn = this.add.rectangle(0, 0, 60, inputH, 0x555555)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.handleSend());
    this.sendBtn.setStrokeStyle(2, 0xffffff);
    this.quitBtn = this.add.rectangle(0, 0, 60, inputH, 0x550000)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.stop());
    this.quitBtn.setStrokeStyle(2, 0xff5555);
    this.add.text(0, 0, 'Send', { fontFamily: 'Courier, monospace', fontSize: '16px', color: '#fff' }).setDepth(1).setName('sendLabel');
    this.add.text(0, 0, 'Quit', { fontFamily: 'Courier, monospace', fontSize: '16px', color: '#fff' }).setDepth(1).setName('quitLabel');

    // Key input
    this.input.keyboard.on('keydown-Q', () => this.scene.stop());
    this.input.keyboard.on('keydown', evt => this.handleTyping(evt));

    this.updateConversation();
  }

  handleTyping(evt) {
    if (this.interactions >= this.maxInteractions) return;
    if (evt.key === 'Enter') {
      this.handleSend();
    } else if (evt.key === 'Backspace') {
      this.inputText.text = this.inputText.text.slice(0, -1);
    } else if (evt.key.length === 1) {
      this.inputText.text += evt.key;
    }
  }

  async handleSend() {
    if (this.interactions >= this.maxInteractions) return;
    const txt = this.inputText.text.trim();
    if (!txt) return;

    this.interactions++;
    this.messages.push({ role: 'user', content: txt });
    this.inputText.text = '';
    this.updateConversation();

    try {
      const token = await this.dataService.getAuthToken();
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ messages: this.messages, sessionId: this.userProfile.sessionId })
      });
      if (!res.ok) {
        const e = await res.json(); throw new Error(e.detail || 'Genie is resting.');
      }
      const { reply } = await res.json();
      this.messages.push({ role: 'assistant', content: reply });
    } catch (err) {
      this.messages.push({ role: 'assistant', content: `Error: ${err.message}` });
    }

    this.updateConversation();
    this.checkLimitNotice();
  }

  updateConversation() {
    const { x, y, w, maxH, padding } = this.chatArea;
    const convo = this.messages.filter(m => m.role !== 'system');
    const text = convo.length === 0
      ? this.greeting
      : convo.map(m => `${m.role==='user'?'You:':'Karo:'} ${m.content}`).join('\n\n');
    this.convText.setText(text);

    const textH = this.convText.height;
    const visibleH = Math.min(textH, maxH - 2 * padding);
    const panelH = visibleH + 2 * padding;

    // Resize panel and mask
    this.chatWinRect.setSize(w, panelH);
    this.maskGraphics.clear();
    this.maskGraphics.fillRect(x + padding, y + padding, w - 2 * padding, visibleH);

    // Reposition input and buttons
    const inputY = y + panelH + 10;
    this.inputBox.setPosition(x, inputY);
    this.inputText.setPosition(x + 8, inputY + 6);

    const sendX = x + (w - 80) + 20;
    this.sendBtn.setPosition(sendX, inputY);
    const quitX = sendX + 80;
    this.quitBtn.setPosition(quitX, inputY);

    // Reposition labels
    this.children.getByName('sendLabel').setPosition(sendX + 12, inputY + 6);
    this.children.getByName('quitLabel').setPosition(quitX + 12, inputY + 6);

    // Scroll text
    if (textH > visibleH) {
      this.convText.setY(y + padding + (visibleH - textH));
    } else {
      this.convText.setY(y + padding);
    }
  }

  checkLimitNotice() {
    if (this.interactions >= this.maxInteractions) {
      const { width, height } = this.scale;
      this.add.text(width/2, height/2, 'Limit reached!\nPress Q to quit', {
        fontFamily: 'Courier, monospace', fontSize: '20px', color: '#f55', align: 'center'
      }).setOrigin(0.5);
    }
  }
}