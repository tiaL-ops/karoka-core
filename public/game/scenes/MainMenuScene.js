import {db, auth } from '../../scripts/firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import WorldScene from "./WorldScene.js";

import game from '../../scripts/game.js';

import AvatarScene from "./AvatarScene.js";
import ProfileScene from "./ProfileScene.js";
import InstructionsScene from "./InstructionScene.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  create() {
    const { width, height } = this.scale;

    // Background Styling
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x3a5d3a, 1);
    bgGraphics.fillRect(0, 0, width, height);
    
    for (let i = 0; i < height; i += 6) {
      bgGraphics.fillStyle(i % 12 === 0 ? 0x2f4f2f : 0x3a5d3a, 1);
      bgGraphics.fillRect(0, i, width, 3);
    }

    // Title Box
    this.add
      .rectangle(width * 0.5, height * 0.12, width * 0.8, height * 0.1, 0xd4d4d4)
      .setStrokeStyle(4, 0x000000);
    this.add
      .text(width * 0.5, height * 0.12, "Karoka 🔎", {
        font: `${Math.floor(height * 0.06)}px 'Press Start 2P'`,
        fill: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

    // Menu Items
    const menuItems = [
      { label: "Start Game", action: () => this.scene.start("WorldScene") },
      { label: "Choose Avatar", action: () => this.scene.start("AvatarScene") },
      { label: "Instructions", action: () => this.scene.start("InstructionsScene") },
      {
        label: "Return",
        action: async () => {
          try {
            this.scene.stop();
            console.log("User back to html!");
           
            window.location.href = "../index.html";
           

          } catch (error) {
            console.error("Logout failed:", error.message);
          }
        },
      },
    ];

    this.selectionIndicator = this.add.text(0, 0, "►", {
      font: `${Math.floor(height * 0.04)}px 'Press Start 2P'`,
      fill: "#ff0000",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.selectionIndicator.setVisible(false);

    const boxSpacing = height * 0.12;
    const startY = height * 0.25;
    menuItems.forEach((item, index) => {
      const y = startY + index * boxSpacing;
      this.createMenuSlot(width * 0.1, y, width * 0.8, height * 0.1, item.label, item.action);
    });

    // Instruction Box
    this.add
      .rectangle(width * 0.5, height * 0.92, width * 0.9, height * 0.08, 0xededed)
      .setStrokeStyle(4, 0x000000);
    this.add
      .text(width * 0.5, height * 0.92, "Choose an option.", {
        font: `${Math.floor(height * 0.04)}px 'Press Start 2P'`,
        fill: "#000000",
        align: "center",
      })
      .setOrigin(0.5);
  }

  createMenuSlot(x, y, width, height, label, onClick) {
    const box = this.add.rectangle(0, 0, width, height, 0xb5d6b5).setStrokeStyle(3, 0x000000);
    const labelText = this.add.text(-width / 2 + 20, -height / 4, label, {
      font: `${Math.floor(height * 0.4)}px 'Press Start 2P'`,
      fill: "#000000",
    }).setOrigin(0);

    const arrowText = this.add.text(-width / 2 - 15, -height / 4, "►", {
      font: `${Math.floor(height * 0.01)}px 'Press Start 2P'`,
      fill: "#ff0000",
      stroke: "#000000",
      strokeThickness: 2,
    }).setOrigin(0);
    arrowText.setVisible(false);

    const container = this.add.container(x + width / 2, y, [box, labelText, arrowText]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      box.setFillStyle(0xa0cfa0);
      arrowText.setVisible(true);
      this.updateSelectionIndicator(labelText);
      container.setScale(1.05);
    });

    container.on("pointerout", () => {
      box.setFillStyle(0xb5d6b5);
      arrowText.setVisible(false);
      container.setScale(1);
    });

    container.on("pointerdown", onClick);
  }

  updateSelectionIndicator(target) {
    this.selectionIndicator.setVisible(true);
    this.selectionIndicator.x = target.x - 20;
    this.selectionIndicator.y = target.y;
  }

  goToLink() {
    window.open("https://forms.gle/8kGtzRigsrYeV3LF7", "_blank");
  }
}