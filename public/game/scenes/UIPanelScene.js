// UIPanelScene.js
import {db, auth } from '../../scripts/firebase.js';
import {
  doc,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

export default class UIPanelScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIPanelScene" });
  }

  /**
   * Expected data:
   * {
   *   currentUserId: string,
   *   playerPosition: { x, y }
   * }
   */
  init(data) {
    if (data) {
      this.currentUserId = data.currentUserId;
      this.playerPosition = data.playerPosition || { x: 0, y: 0 };
    } else {
      console.error("No data passed to UIPanelScene");
    }
    console.log("UIPanelScene initialized:", {
      currentUserId: this.currentUserId,
      playerPosition: this.playerPosition,
    });
  }

  preload() {
    // No external image assets required because we draw our background.
  }

  create() {
    // Panel dimensions
    const panelWidth = Math.min(250, this.cameras.main.width * 0.3);
    const panelHeight = this.cameras.main.height;
    
    // Create a container for the panel, fixed to the right side of the screen.
    this.panelContainer = this.add.container(this.cameras.main.width - panelWidth, 0)
      .setDepth(20);
    this.panelContainer.setScrollFactor(0);

    // Create a Graphics object to draw the background rectangle.
    const graphics = this.add.graphics();
    const fillColor = 0x222222;     // dark gray fill
    const strokeColor = 0xffffff;   // white border
    const borderThickness = 4;
    const radius = 10;
    
    // Draw a filled rounded rectangle
    graphics.fillStyle(fillColor, 1);
    graphics.fillRoundedRect(0, 0, panelWidth, panelHeight, radius);
    
    // Draw the border around the rectangle
    graphics.lineStyle(borderThickness, strokeColor, 1);
    graphics.strokeRoundedRect(0, 0, panelWidth, panelHeight, radius);
    
    // Add the drawn graphics to the container.
    this.panelContainer.add(graphics);

    // Add Username text
    /*
    const Kname = localStorage.getItem("Kname") || localStorage.getItem("Name") || "Unknown";
    const usernameText = this.add.text(20, 20, "Username: " + Kname, {
      font: "18px 'Press Start 2P', cursive",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.panelContainer.add(usernameText);
    */

    // Points text (initially 0; will update via Firebase)
    this.pointsText = this.add.text(20, 20, "Points: 0", {
      font: "18px 'Press Start 2P', cursive",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.panelContainer.add(this.pointsText);

    // Header for the Levels list
    const levelsText = this.add.text(20, 60, "Levels:", {
      font: "18px 'Press Start 2P', cursive",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.panelContainer.add(levelsText);

    // Create a selection arrow indicator (text-based)
    this.selectionIndicator = this.add.text(0, 0, "►", {
      font: "18px 'Press Start 2P', cursive",
      fill: "#ff0000",
      stroke: "#000000",
      strokeThickness: 2,
    });
    // Initially hide the indicator until the user hovers over an interactive element
    this.selectionIndicator.setVisible(false);
    this.panelContainer.add(this.selectionIndicator);

    // Retrieve the riddles JSON from cache (using the key "riddles" from preload)
    const riddlesData = this.cache.json.get("riddles");
    if (!riddlesData) {
      console.error("Riddles JSON data not found in cache");
      return;
    }
    const totalLevels = riddlesData.length;
    this.levelTexts = [];

    const compDocRef = doc(db, "competition1Test", this.currentUserId);

    // Listen for changes in competition1Test
    onSnapshot(compDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // solvedLevels: an array of level numbers that are solved.
        const solvedLevels = new Set(Array.isArray(data.solvedLevels) ? data.solvedLevels : []);
        this.pointsText.setText(`Points: ${data.points || 0}`);
    
        // Loop through every level from the JSON
        for (let i = 0; i < totalLevels; i++) {
          const currentRiddle = riddlesData[i];
          const level = currentRiddle.Level;
          // Here, we treat the level as "locked" if it is solved.
          const isSolved = solvedLevels.has(level);
          const displayTitle = currentRiddle.Title ? currentRiddle.Title : `Level ${level}`;
          
          // If solved, display with a check mark; if not, with an unlock icon.
          const levelTextContent = isSolved
            ? `${displayTitle} ✅`
            : `${displayTitle} 🔓`;
    
          if (this.levelTexts[i]) {
            // Update existing level text
            this.levelTexts[i].setText(levelTextContent);
            this.levelTexts[i].setFill(isSolved ? "#00ff00" : "#ff0000");
            if (isSolved) {
              this.levelTexts[i].disableInteractive();
            } else {
              this.levelTexts[i].setInteractive({ useHandCursor: true });
            }
          } else {
            // Create new level text
            const levelText = this.add.text(20, 100 + i * 30, levelTextContent, {
              font: "16px 'Press Start 2P', cursive",
              fill: isSolved ? "#00ff00" : "#ff0000",
              stroke: "#000000",
              strokeThickness: 2,
            });
            // If not solved, make it clickable so the user can attempt it.
            if (!isSolved) {
              levelText.setInteractive({ useHandCursor: true });
              levelText.on("pointerover", () => {
                this.updateSelectionIndicator(levelText);
              });
              levelText.on("pointerdown", () => {
                console.log(`Level ${level} clicked in UIPanelScene`);
                // Launch AnswerScene so the user can enter their answer.
              });
            }
            this.panelContainer.add(levelText);
            this.levelTexts.push(levelText);
          }
        }
      } else {
        // If competition1Test doc doesn't exist, check the profiles collection.
        const profileDocRef = doc(db, "profiles", this.currentUserId);
        onSnapshot(profileDocRef, (profileSnap) => {
          if (profileSnap.exists()) {
            // Create a default competition1Test document for this user.
            const defaultData = { points: 0, solvedLevels: [] };
            setDoc(compDocRef, defaultData)
              .then(() => {
                console.log("Created competition1Test doc for user", this.currentUserId);
              })
              .catch((error) => {
                console.error("Error creating competition1Test doc:", error);
              });
          } else {
            console.error("User not found in profiles collection");
          }
        });
      }
    });

    // Main Menu button at the bottom of the panel
    const mainMenuButton = this.add.text(20, panelHeight - 100, "Main Menu", {
      font: "18px 'Press Start 2P', cursive",
      fill: "#ff0000",
      stroke: "#000000",
      strokeThickness: 2,
    }).setInteractive({ useHandCursor: true });
    mainMenuButton.on("pointerover", () => {
      this.updateSelectionIndicator(mainMenuButton);
    });
    mainMenuButton.on("pointerdown", () => {
      this.scene.stop("WorldScene");
  
      this.scene.start("MainMenuScene");
    });
    this.panelContainer.add(mainMenuButton);

  }

  /**
   * Updates the position of the text-based selection indicator (►)
   * to align with the provided target text.
   *
   * @param {Phaser.GameObjects.Text} target - The interactive text to highlight.
   */
  updateSelectionIndicator(target) {
    // Make the indicator visible
    this.selectionIndicator.setVisible(true);
    // Position the indicator 15 pixels to the left of the target text
    this.selectionIndicator.x = target.x - 15;
    // Align vertically with the target (you can tweak the offset as needed)
    this.selectionIndicator.y = target.y;
  }
}
