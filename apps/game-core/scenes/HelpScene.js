// Retrieve the base URL for the API from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default class HelpScene extends Phaser.Scene {
  constructor() {
    super('HelpScene');
    this.interactions = 0;
    this.maxInteractions = 5; // Set a limit for interactions to prevent spam
    this.messages = [
      {
        role: 'system',
        content: 'You are a helpful game genie that assists the player through this 2d game that teaches python. The user is a beginner that is learning python.'
      },
      {
        role: 'assistant',
        content: 'Hi, how can I help you? Reminder: you have five attempts to discuss.'
      }
    ];
  }

  init() {
   
   
    // Retrieve shared data from the Phaser registry
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');

    // Ensure necessary data is available, otherwise stop the scene
    if (!this.userProfile || !this.dataService) {
      console.error("HelpScene requires userProfile and dataService to function.");
      this.scene.stop();
    }
  }

  create() {

    const { width, height } = this.scale;
    this.input.keyboard.removeCapture(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );

    // Add a semi-transparent background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Display the conversation text
    this.conversationText = this.add.text(20, 20, '', {
      font: '16px',
      fill: '#ffffff',
      wordWrap: { width: width - 40 }
    });

    // Add the HTML form for chat input using a DOM element
    this.domElement = this.add.dom(width / 2, height - 30, 'div').setHTML(`
        <input id="chatInput" placeholder="Ask Karo..." style="width:${width - 240}px; padding: 10px; border-radius: 5px; border: 1px solid #ccc;"/>
        <button id="sendBtn" style="padding: 10px 15px; margin-left: 5px; border-radius: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Send</button>
        <button id="quitBtn" style="padding: 10px 15px; margin-left: 5px; border-radius: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Quit</button>
    `);

    // Get references to the HTML elements
    this.inputEl = this.domElement.node.querySelector('#chatInput');
    this.sendBtn = this.domElement.node.querySelector('#sendBtn');
    this.quitBtn = this.domElement.node.querySelector('#quitBtn');

    // Add event listeners
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.quitBtn.addEventListener('click', () => this.scene.stop());

    // Allow sending message with Enter key
    this.inputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            this.handleSend();
        }
    });

    // Allow closing the scene with the 'Q' key
    this.input.keyboard.on('keydown-Q', () => this.scene.stop());

    // Initialize the conversation display
    this.updateConversation();
  }

  async handleSend() {
    const text = this.inputEl.value.trim();
    if (!text || this.interactions >= this.maxInteractions) {
        return; // Do nothing if input is empty or limit is reached
    }

    this.interactions++;
    this.messages.push({ role: 'user', content: text });
    this.inputEl.value = '';
    this.updateConversation();

    // Disable input while waiting for the response
    this.toggleInput(false);

    try {
      // 1. Get the authentication token from the data service
      const token = await this.dataService.getAuthToken();

      // 2. Fetch the response from the chat API
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 3. Include the Authorization header for the backend middleware
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: this.messages,
          // 4. Send the session ID to link history records
          sessionId: this.userProfile.sessionId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Karo is resting. Please try again later.');
      }

      const { reply } = await res.json();
      this.messages.push({ role: 'assistant', content: reply });

    } catch (err) {
      // Display a user-friendly error message
      this.messages.push({ role: 'assistant', content: `Error: ${err.message}` });
    } finally {
        // Re-enable input if interaction limit not reached
        if (this.interactions < this.maxInteractions) {
            this.toggleInput(true);
        }
    }

    this.updateConversation();
    this.checkInteractionLimit();
  }

  updateConversation() {
    // Only display user and assistant messages (hide system prompts)
    const lines = this.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        const prefix = msg.role === 'user' ? 'You:'
                     : msg.role === 'assistant' ? 'Karo:' : '';
        return `${prefix} ${msg.content}`;
      });
    this.conversationText.setText(lines.join('\n\n'));
  }

  checkInteractionLimit() {
    if (this.interactions >= this.maxInteractions) {
      this.toggleInput(false);
      this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        'Interaction limit reached. Press Q to quit.',
        { font: '18px Arial', fill: '#ff0000', backgroundColor: '#000' }
      ).setOrigin(0.5);
    }
  }

  toggleInput(enabled) {
      this.inputEl.disabled = !enabled;
      this.sendBtn.disabled = !enabled;
      // Visually indicate that the input is disabled
      this.inputEl.style.backgroundColor = enabled ? '' : '#ccc';
      this.sendBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }
}