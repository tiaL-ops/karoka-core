// Riddle.js
import {db, auth } from '../../scripts/firebase.js'; // Firebase configuration and auth
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

export default class RiddleScene extends Phaser.Scene {
  constructor() {
    // Enable DOM elements for the answer input.
    super({ key: "RiddleScene", dom: { createContainer: true } });
    // Data
    this.currentRiddleData = null;
    this.solution = "";
    this.currentLevel = 1;
    this.playerPosition = { x: 0, y: 0 };
    this.unsubscribe = null;
  }

  /**
   * Expected data format:
   * { riddle: { Title, Riddle, Level, Solution, Link }, playerPosition: { x, y } }
   */
  init(data) {
    if (data && data.riddle) {
      this.currentRiddleData = data.riddle;
      this.solution = data.riddle.Solution || "";
      this.currentLevel = data.riddle.Level || 1;
    } else {
      // Default riddle data
      this.currentRiddleData = {
        Title: "Mysterious Riddle",
        Riddle:
          "What walks on four legs in the morning, two legs in the afternoon, and three legs in the evening?",
        Solution: "man",
        Link: "", // Optional hint link
      };
      this.solution = "man";
      this.currentLevel = 1;
    }
    this.playerPosition = data.playerPosition || { x: 0, y: 0 };
  }

  preload() {
    // Preload assets if necessary
  }

  async create() {
    // Set a complementary background color
    this.cameras.main.setBackgroundColor("#A3C1DA");

    // Create a panel with a subtle drop shadow
    const panelWidth = 520;
    const panelHeight = 420;
    const panelX = (this.cameras.main.width - panelWidth) / 2;
    const panelY = (this.cameras.main.height - panelHeight) / 2;

    // Create drop shadow effect
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(panelX + 8, panelY + 8, panelWidth, panelHeight, 16);

    // Create panel graphics with a soft pastel fill and a gold stroke
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0xFFF9EC, 1);
    panelGraphics.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    panelGraphics.lineStyle(4, 0xF1C40F, 1);
    panelGraphics.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);

    // Riddle Title at the top.
    const titleText = this.add.text(panelX + panelWidth / 2, panelY + 50, this.currentRiddleData.Title, {
      font: "32px 'Press Start 2P'",
      fill: "#2C3E50",
      stroke: "#ecf0f1",
      strokeThickness: 3,
      align: "center"
    }).setOrigin(0.5);
    titleText.setShadow(2, 2, "#000000", 2, false, true);

    // Riddle content below the title.
    const riddleWithQuotes = `"${this.currentRiddleData.Riddle}"`;
    const riddleText = this.add.text(
      panelX + panelWidth / 2,
      panelY + 110,
      riddleWithQuotes,
      {
        font: "20px 'Press Start 2P'",
        fill: "#34495E",
        stroke: "#ecf0f1",
        strokeThickness: 2,
        align: "center",
        wordWrap: { width: panelWidth - 40 }
      }
    ).setOrigin(0.5);
    riddleText.setShadow(1, 1, "#000000", 1, false, true);
    
    // Prompt text for answer entry.
    const promptText = this.add.text(panelX + panelWidth / 2, panelY + 190, "Enter your answer:", {
      font: "20px 'Press Start 2P'",
      fill: "#C0392B",
      stroke: "#FFFFFF",
      strokeThickness: 2,
      align: "center"
    }).setOrigin(0.5);
    promptText.setShadow(1, 1, "#000000", 1, false, true);

    // Create a DOM input element for answer entry.
    const inputStyle = `
      width: 260px;
      height: 40px;
      font-size: 18px;
      font-family: 'Press Start 2P';
      text-align: center;
      background: rgba(255,255,255,0.9);
      border: 3px solid #3498DB;
      border-radius: 8px;
      padding: 5px;
      z-index: 10000;
    `;
    const inputElement = this.add.dom(panelX + panelWidth / 2, panelY + 250, 'input', inputStyle);
    inputElement.node.placeholder = "Type your answer...";
    if (this.solution.length) {
      inputElement.node.maxLength = this.solution.length;
    }
    this.inputElement = inputElement;

    // Create three buttons: Hint, Submit, Return.
    const buttonY = panelY + panelHeight - 70;
    const buttonSpacing = 160;
    const centerX = panelX + panelWidth / 2;

    // Utility function for creating styled buttons with hover animations.
    const createButton = (x, y, label, fillColor, callback) => {
      const btn = this.add.text(x, y, label, {
        font: "22px 'Press Start 2P'",
        fill: fillColor,
        stroke: "#FFFFFF",
        strokeThickness: 3,
        align: "center"
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.setShadow(2, 2, "#000000", 2, false, true);
      btn.on("pointerdown", callback);
      btn.on("pointerover", () => {
        this.tweens.add({
          targets: btn,
          scale: 1.1,
          duration: 100,
          ease: 'Power2'
        });
      });
      btn.on("pointerout", () => {
        this.tweens.add({
          targets: btn,
          scale: 1.0,
          duration: 100,
          ease: 'Power2'
        });
      });
      return btn;
    };

    // Hint Button.
    const hintButton = createButton(centerX - buttonSpacing, buttonY, "Hint", "#E74C3C", () => {
      if (this.currentRiddleData.Link) {
        window.open(this.currentRiddleData.Link, "_blank");
      } else {
        this.showMessage("No hint available.", false);
      }
    });

    // Submit Button.
    const submitButton = createButton(centerX, buttonY, "Submit", "#27AE60", () => {
      const userInput = this.inputElement.node.value;
      if (!userInput.trim()) {
        this.showMessage("Please enter an answer.", false);
        return;
      }
      this.validateAnswer(userInput);
    });
    this.submitButton = submitButton;

    // Return Button.
    const returnButton = createButton(centerX + buttonSpacing, buttonY, "Return", "#2980B9", () => {
      this.scene.start("WorldScene", { playerPosition: this.playerPosition });
    });

    // Listen for real-time updates to check if the level is already solved.
    const docRef = doc(db, "competition1Test", auth.currentUser.uid);
    this.unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const solvedLevelsArray = data.solvedLevels || [];
        if (solvedLevelsArray.includes(this.currentLevel)) {
          this.inputElement.node.style.backgroundColor = "#27AE60";
          this.inputElement.node.disabled = true;
          this.submitButton.disableInteractive();
          this.showMessage("Level already solved!", true);
        }
      }
    });
  }

  async validateAnswer(userInput) {
    console.log("Validating answer:", userInput, "against solution:", this.solution);
    if (userInput.trim().toLowerCase() === this.solution.trim().toLowerCase()) {
      await this.updateFirebase();
      this.showMessage("Correct Answer!", true);
      this.time.delayedCall(2000, () => {
        this.scene.start("WorldScene", { playerPosition: this.playerPosition });
      });
    } else {
      this.showMessage("Incorrect Answer. Try again.", false);
    }
  }

  showMessage(message, isCorrect) {
    const textColor = isCorrect ? "#27AE60" : "#E74C3C";
    const messageText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, message, {
      font: "26px 'Press Start 2P'",
      fill: textColor,
      stroke: "#FFFFFF",
      strokeThickness: 3,
      align: "center"
    }).setOrigin(0.5);
    messageText.setShadow(2, 2, "#000000", 2, false, true);
    this.time.delayedCall(2000, () => {
      messageText.destroy();
    });
  }

  async updateFirebase() {
    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, "competition1Test", userId);
      const docSnap = await getDoc(docRef);
      let existingData = {};
      if (docSnap.exists()) {
        existingData = docSnap.data();
      }
      const solvedLevels = new Set(existingData.solvedLevels || []);
      solvedLevels.add(this.currentLevel);
      const updatedData = {
        points: (existingData.points || 0) + 10,
        solvedLevels: Array.from(solvedLevels),
        uid: userId,
      };
      await setDoc(docRef, updatedData, { merge: true });
      console.log("Firebase updated for level", this.currentLevel);
    } catch (error) {
      console.error("Error updating firebase:", error);
    }
  }

  shutdown() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
