

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default class VARKScene extends Phaser.Scene {
  constructor() {
    super('VARKScene');
  }

  init() {
    // Retrieve shared data from the Phaser registry
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');

    if (!this.userProfile || !this.dataService) {
      console.error("VARKScene requires userProfile and dataService.");
      // If essential data is missing, you might want to redirect
      // to a main menu or show an error.
      this.scene.start('PlayScene'); 
    }
  }

  preload() {
    // Preload a pixel font from Google Fonts
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    const { width, height } = this.scale;

    // Load the font using the WebFontLoader
    WebFont.load({
      google: {
        families: ['Press Start 2P']
      },
      active: () => {
        // This callback ensures the font is loaded before we use it
        this.createUI(width, height);
      }
    });

    // Add a dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    const exitText = this.add.text(width / 2, height - 20, 'Press Q to Exit', { font: '14px Arial', fill: '#888'}).setOrigin(0.5);
        this.input.keyboard.on('keydown-Q', () => this.scene.stop());
  }

  createUI(width, height) {
    // --- Create a pixelated dialog box background ---
    const dialogWidth = width * 0.8;
    const dialogHeight = height * 0.8;
    const x = width / 2;
    const y = height / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 1); // Dark grey fill
    bg.fillRect(x - dialogWidth / 2, y - dialogHeight / 2, dialogWidth, dialogHeight);

    bg.lineStyle(4, 0xffffff, 1); // White border
    bg.strokeRect(x - dialogWidth / 2, y - dialogHeight / 2, dialogWidth, dialogHeight);
    // ------------------------------------------------

    // Add title text
    this.add.text(x, y - dialogHeight / 2 + 40, 'Discover Your Learning Style', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Add instructional text
    this.add.text(x, y - dialogHeight / 2 + 100,
      'To personalize your adventure, please take the VARK questionnaire.\n\nClick the link below, complete the questions, and then enter your scores.', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        fill: '#dddddd',
        align: 'center',
        wordWrap: { width: dialogWidth - 40 }
      }).setOrigin(0.5);

    // --- Create the HTML form with pixel styling ---
    const formHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        #varkForm {
          font-family: 'Press Start 2P', cursive;
          color: white;
          text-align: center;
        }
        #varkLink {
          display: inline-block;
          padding: 15px 25px;
          font-size: 16px;
          background-color: #5c94fc;
          color: white;
          border: 2px solid white;
          cursor: pointer;
          text-decoration: none;
          margin-bottom: 20px;
        }
        #varkLink:hover {
          background-color: #4a78d9;
        }
        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          width: 80%;
          margin: 0 auto;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .input-group label {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .input-group input {
          width: 80px;
          padding: 10px;
          font-family: 'Press Start 2P', cursive;
          font-size: 16px;
          text-align: center;
          background-color: #333;
          color: white;
          border: 2px solid white;
        }
        #submitVarkBtn {
          margin-top: 30px;
          padding: 15px 30px;
          font-size: 18px;
          font-family: 'Press Start 2P', cursive;
          background-color: #4CAF50;
          color: white;
          border: 2px solid white;
          cursor: pointer;
        }
        #submitVarkBtn:disabled {
          background-color: #555;
          cursor: not-allowed;
        }
        #varkMessage {
            margin-top: 15px;
            font-size: 12px;
            height: 20px;
        }
      </style>
      <div id="varkForm">
        <a id="varkLink" href="https://vark-learn.com/the-vark-questionnaire" target="_blank">Take the Test</a>
        <div class="input-grid">
          <div class="input-group">
            <label for="visual">Visual</label>
            <input type="number" id="visual" min="0" />
          </div>
          <div class="input-group">
            <label for="aural">Aural</label>
            <input type="number" id="aural" min="0" />
          </div>
          <div class="input-group">
            <label for="read_write">Read/Write</label>
            <input type="number" id="read_write" min="0" />
          </div>
          <div class="input-group">
            <label for="kinesthetic">Kinesthetic</label>
            <input type="number" id="kinesthetic" min="0" />
          </div>
        </div>
        <button id="submitVarkBtn">Save Scores</button>
        <div id="varkMessage"></div>
      </div>
    `;

    this.domElement = this.add.dom(x, y + 80).createFromHTML(formHTML);

    // Add event listener to the submit button
    const submitBtn = this.domElement.node.querySelector('#submitVarkBtn');
    submitBtn.addEventListener('click', () => this.handleSubmit());
  }

  async handleSubmit() {
    const visual = this.domElement.node.querySelector('#visual').value;
    const aural = this.domElement.node.querySelector('#aural').value;
    const read_write = this.domElement.node.querySelector('#read_write').value;
    const kinesthetic = this.domElement.node.querySelector('#kinesthetic').value;
    const messageEl = this.domElement.node.querySelector('#varkMessage');
    const submitBtn = this.domElement.node.querySelector('#submitVarkBtn');
    
    
    // Validation
    if (!visual || !aural || !read_write || !kinesthetic) {
      messageEl.textContent = "Please fill in all scores.";
      messageEl.style.color = '#ff6b6b';
      return;
    }

    const scores = {
      visual: parseInt(visual, 10),
      aural: parseInt(aural, 10),
      read_write: parseInt(read_write, 10),
      kinesthetic: parseInt(kinesthetic, 10)
    };

    submitBtn.disabled = true;
    messageEl.textContent = "Saving...";
    messageEl.style.color = '#ffffff';

    try {
      const token = await this.dataService.getAuthToken();
      const res = await fetch(`${API_BASE_URL}/user/vark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scores)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Server error');
      }

      messageEl.textContent = "Thank you! Scores saved.";
      messageEl.style.color = '#4CAF50';

      // Transition away after a short delay
      this.time.delayedCall(2000, () => {
        this.scene.start('PlayScene'); 
      });

    } catch (err) {
      messageEl.textContent = `Error: ${err.message}`;
      messageEl.style.color = '#ff6b6b';
      submitBtn.disabled = false;
    }
  }
}
