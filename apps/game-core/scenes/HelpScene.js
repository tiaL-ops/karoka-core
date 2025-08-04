// Retrieve the base URL for the API from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default class HelpScene extends Phaser.Scene {
  constructor() {
    super('HelpScene');
    this.interactions = 0;
    this.maxInteractions = 5;
    this.messages = [
      {
  role: 'system',
  content: `You are Karo, a friendly “game genie” in a beginner-level Python adventure.

1. Story Context  
It’s the year 2030 and a virus has wiped out every computer in the world. The player’s first mission is at home: to unlock the main computer by solving a coding puzzle about variables. They must find the magic “ball” hidden in the room to reveal the puzzle.

2. Role & Tone  
Be chill, kind, patient, and encouraging. The player is a total beginner in Python—they’re here to learn, not just play. Focus your answers on teaching Python concepts (especially variables) clearly and simply.

3. Question Limit  
The player may ask up to **five** questions per session. Keep track, and when they reach the limit, politely remind them that they’ve used all their questions and encourage them to solve the puzzle with what they’ve learned.

4. Allowed Hint  
If the player asks “What do I do next in the game?”, your only game-hint is:  
> “Look for the magic ball in your room—that’s where the puzzle begins.”

5. Technical Help  
- If they ask “What is a variable?” or “How does Python work?”, explain in beginner-friendly terms with a short example or analogy.  
- Offer code snippets that are concise and easy to follow.

6. Coding Assignment  
When the user asks about the coding assignment, this is the code they will work on:

\`\`\`python
# --- Write your code below ---
city = "Galaxia"
c    = 4
b    = 2
town = "Tera"

# ── Do not change this line ──
print(city + ' has ' + str(c) + ' town and ' + str(b) + ' ' + town)
\`\`\`

Give them hints about creating and using variables, but **never** the full answer—remind them they need to define and manipulate variables.

7. End of Session  
When they’ve used all five questions, let them know they’ve hit the limit and encourage them to solve the puzzle with what they’ve learned.`
},

      {
        role: 'assistant',
        content: 'Hi, how can I help you? Reminder: you have five attempts to discuss.'
      }
    ];
    // This will hold the DOM element for our scrollable message area
    this.messageArea = null;
  }

  init() {
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
    if (!this.userProfile || !this.dataService) {
      console.error("HelpScene requires userProfile and dataService to function.");
      this.scene.stop();
    }
  }

  create() {
    const { width, height } = this.scale;
    this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Add a semi-transparent background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // --- ✨ NEW: Add CSS styles for the chat box ---
    const styles = `
        <style>
            #messageArea {
                width: ${width - 40}px;
                height: ${height - 120}px;
                overflow-y: scroll;
                padding: 10px;
                background-color: rgba(20, 20, 20, 0.8);
                border: 1px solid #555;
                border-radius: 5px;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
            }
            .user-message {
                color: #87CEEB; /* Light Blue for user */
                margin-bottom: 10px;
            }
            .assistant-message {
                color: #90EE90; /* Light Green for Karo */
                margin-bottom: 10px;
            }
            #messageArea::-webkit-scrollbar {
                width: 10px;
            }
            #messageArea::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 5px;
            }
            #messageArea::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        </style>
    `;

    // --- ✨ NEW: Create the scrollable message area ---
    const chatAreaHeight = height - 120;
    this.add.dom(width / 2, chatAreaHeight / 2 + 20).createFromHTML(styles + `<div id="messageArea"></div>`);
    this.messageArea = document.getElementById('messageArea');

    // Add the HTML form for chat input, positioned at the bottom
    this.domElement = this.add.dom(width / 2, height - 50, 'div').setHTML(`
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
    this.inputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') this.handleSend();
    });
    this.input.keyboard.on('keydown-Q', () => this.scene.stop());

    // Initialize the conversation display
    this.updateConversation();
  }

  async handleSend() {
    const text = this.inputEl.value.trim();
    if (!text || this.interactions >= this.maxInteractions) return;

    this.interactions++;
    this.messages.push({ role: 'user', content: text });
    this.inputEl.value = '';
    this.updateConversation();
    this.toggleInput(false);

    try {
      const token = await this.dataService.getAuthToken();
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: this.messages,
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
      this.messages.push({ role: 'assistant', content: `Error: ${err.message}` });
    } finally {
      if (this.interactions < this.maxInteractions) {
        this.toggleInput(true);
      }
    }

    this.updateConversation();
    this.checkInteractionLimit();
  }

  // --- ✨ NEW: updateConversation now generates HTML and scrolls ---
  updateConversation() {
    const html = this.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        const speakerClass = msg.role === 'user' ? 'user-message' : 'assistant-message';
        const speakerName = msg.role === 'user' ? 'You' : 'Karo';
        // Basic sanitization to prevent HTML injection
        const sanitizedContent = msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<div class="${speakerClass}"><strong>${speakerName}:</strong> ${sanitizedContent}</div>`;
      })
      .join('');

    // Set the HTML and scroll to the bottom to show the latest message
    this.messageArea.innerHTML = html;
    this.messageArea.scrollTop = this.messageArea.scrollHeight;
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
      this.inputEl.style.backgroundColor = enabled ? '' : '#ccc';
      this.sendBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }
}