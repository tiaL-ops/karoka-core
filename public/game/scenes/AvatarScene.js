import Player from "./Player.js";
import WorldScene from "./WorldScene.js";
import config from '../../scripts/game.js';
import ProfileScene from "./ProfileScene.js";
import game from '../../scripts/game.js';
import MainMenuScene from "./MainMenuScene.js";
import RiddleScene from "./RiddleScene.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

import {db, auth } from '../../scripts/firebase.js';
import {
  doc,
  getDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

export default class AvatarScene extends Phaser.Scene {
    constructor(competitionData) {
        super({ key: 'AvatarScene' });
        this.competitionData = competitionData;

        this.currentAvatar = 'boi'; // Default avatar
        this.avatars = {
            boi: null,
            girl: null
        };
        this.avatarNames = ['boi', 'girl'];
        this.selectedIndex = 0;
    }

    preload() {
        const data = this.competitionData;
        if (Array.isArray(data.spritesheet)) {
            data.spritesheet.forEach((sprites) => {
              this.load.spritesheet(sprites.key, sprites.url, {
                frameWidth: sprites.frameWidth,
                frameHeight: sprites.frameHeight,
              });
            });
          }
          
    }

    create() {
        console.log("Avatar created!");
    
        this.anims.create({
            key: 'boi_turn',
            frames: this.anims.generateFrameNumbers('boi', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_turn',
            frames: this.anims.generateFrameNumbers('girl', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.avatars.boi = this.add.sprite(300, 250, 'boi').setScale(4).play('boi_turn');
        this.avatars.girl = this.add.sprite(500, 250, 'girl').setScale(4).setVisible(false);

        this.add.text(400, 150, 'Press C to Switch', {
            fontSize: '20px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.leftArrow = this.add.text(200, 250, '<', { fontSize: '50px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => this.changeAvatar(-1));

        this.rightArrow = this.add.text(600, 250, '>', { fontSize: '50px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => this.changeAvatar(1));

        this.selectionText = this.add.text(400, 400, 'Choose Your Avatar', { fontSize: '30px', fill: '#fff' })
            .setOrigin(0.5);

        this.confirmButton = this.add.text(400, 500, 'Confirm', {
            fontSize: '25px',
            fill: '#fff',
            backgroundColor: '#000'
        }).setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.confirmSelection());

        this.input.keyboard.on('keydown-C', () => this.changeAvatar(-1));

        this.updateSelection();
    }

    changeAvatar(direction) {
        this.selectedIndex = (this.selectedIndex + direction + this.avatarNames.length) % this.avatarNames.length;
        this.updateSelection();
    }

    updateSelection() {
        for (const avatarName of this.avatarNames) {
            this.avatars[avatarName].setVisible(false).stop();
        }

        const selectedAvatar = this.avatarNames[this.selectedIndex];
        this.avatars[selectedAvatar].setVisible(true).play(`${selectedAvatar}_turn`);

        this.confirmButton.setBackgroundColor(selectedAvatar === 'boi' ? '#0f0' : '#f00');
        this.currentAvatar = selectedAvatar;
        console.log(`Switched to: ${this.currentAvatar}`);
    }

    confirmSelection() {
        localStorage.setItem('selectedAvatar', this.currentAvatar);
        console.log(`Confirmed selection: ${this.currentAvatar}`);
    
        this.events.emit("avatarChanged", this.currentAvatar);
    
        this.scene.start("WorldScene");
    }
}