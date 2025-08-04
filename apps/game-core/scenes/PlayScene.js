import { rooms } from '../config/roomData.js';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
    this.successUI = null; // To hold the success screen elements
  }

  init(data) {
    // --- SESSION & USER DATA ---
    this.playJsonUrl = data.playJsonUrl;
    this.tilesetsData = data.tilesets;
    this.mapKey = 'playMap_' + Date.now();
    this.roomKey = data.roomKey;
    this.challengeId = data.challengeId;

    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
  
    if (!this.userProfile || !this.dataService) {
      console.warn('PlayScene: userProfile or dataService not found. Analytics will be disabled.');
      this.dataService = {
        logEvent: () => Promise.resolve(),
        createAttempt: () => Promise.resolve(),
        updateUserScore: () => Promise.resolve(),
      };
    }

    // --- ANALYTICS STATE INITIALIZATION ---
    this.attemptNumber = 0;
    this.attemptAnalytics = {};
  }

  preload() {
    console.log(`PlayScene: Preloading map from ${this.playJsonUrl}`);
    this.load.tilemapTiledJSON(this.mapKey, this.playJsonUrl);
    this.load.image('close_icon', 'https://placehold.co/32x32/ffffff/000000?text=X');
    // --- Preload the pixel font for the success screen ---
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    console.log('PlayScene: Creating scene.');
    this.startNewAttempt();

    const cam = this.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    this.sourceBallCount = 10;
    this.zoneCounts = { x: 0, y: 0, z: 0 };
    const map = this.make.tilemap({ key: this.mapKey });
    const tilesets = this.tilesetsData.map(ts => map.addTilesetImage(ts.name, ts.key));
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    const offsetX = centerX - mapWidth / 2;
    const offsetY = centerY - mapHeight / 2;
    map.createLayer('Background', tilesets, offsetX, offsetY);

    const objs = map.getObjectLayer('Drag').objects;
    const ballObj = objs.find(o => o.name === 'ball');
    const targetObjs = objs.filter(o => ['x', 'y', 'z'].includes(o.name));
    
    this.dropZones = this.add.group();
    this.zoneCountTexts = {};
    targetObjs.forEach(o => {
      const zx = o.x + offsetX;
      const zy = o.y + offsetY;
      const zone = this.add.zone(zx, zy, o.width, o.height).setRectangleDropZone(o.width, o.height);
      zone.setName(o.name);
      this.dropZones.add(zone);
      const outline = this.add.graphics().lineStyle(2, 0x00ff00).strokeRect(zx, zy, o.width, o.height).setVisible(false);
      zone.setData('outline', outline);
      const txt = this.add.text(zx + o.width / 2, zy + o.height + 10, `${o.name}: 0`, { font: '16px Monospace', fill: '#fff' }).setOrigin(0.5);
      this.zoneCountTexts[o.name] = txt;
    });

    const bx = ballObj.x + offsetX;
    const by = ballObj.y + offsetY;
    this.sourceBall = this.add.circle(bx, by, ballObj.width / 2, 0xff0000).setInteractive();
    this.input.setDraggable(this.sourceBall);
    this.sourceBall.setData('homeX', bx);
    this.sourceBall.setData('homeY', by);
    this.sourceBallCountText = this.add.text(bx, by - 20, `x${this.sourceBallCount}`, { font: '16px Monospace', fill: '#fff' }).setOrigin(0.5);
    this.placedBalls = this.add.group();

    this.input.on('dragstart', (pointer, gameObject) => {
        gameObject.setStrokeStyle(2, 0xffff00);
        this.children.bringToTop(gameObject);
        this.logMicroInteraction('drag-start', { objectId: gameObject.name || 'placedBall', startX: pointer.x, startY: pointer.y });
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragenter', (pointer, gameObject, dropZone) => {
        dropZone.getData('outline').setVisible(true);
        this.logMicroInteraction('drag-enter', { objectId: gameObject.name, zoneId: dropZone.name });
    });

    this.input.on('dragleave', (pointer, gameObject, dropZone) => {
        dropZone.getData('outline').setVisible(false);
        this.logMicroInteraction('drag-leave', { objectId: gameObject.name, zoneId: dropZone.name });
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      dropZone.getData('outline').setVisible(false);
      this.attemptAnalytics.moves++;

      const oldZoneName = gameObject.getData('originZone');
      const newZoneName = dropZone.name;

      if (gameObject === this.sourceBall && this.sourceBallCount > 0) {
        this.sourceBallCount--;
        this.zoneCounts[newZoneName]++;
        const px = dropZone.x + dropZone.width / 2;
        const py = dropZone.y + dropZone.height / 2;
        this.addPlacedBall(px, py, newZoneName);
        this.logMicroInteraction('drop-success', { source: 'sourceBall', targetZone: newZoneName });
      } else if (this.placedBalls.contains(gameObject)) {
        if (newZoneName !== oldZoneName) {
          this.zoneCounts[oldZoneName]--;
          this.zoneCounts[newZoneName]++;
          gameObject.setData('originZone', newZoneName).setPosition(dropZone.x + dropZone.width / 2, dropZone.y + dropZone.height / 2);
          this.logMicroInteraction('drop-success', { sourceZone: oldZoneName, targetZone: newZoneName });
        }
      }
      this.updateCounts();
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
      gameObject.setStrokeStyle();
      if (gameObject === this.sourceBall) {
        gameObject.setPosition(gameObject.getData('homeX'), gameObject.getData('homeY'));
      } else if (this.placedBalls.contains(gameObject) && !dropped) {
        const originZone = gameObject.getData('originZone');
        this.zoneCounts[originZone]--;
        this.sourceBallCount++;
        gameObject.destroy();
        this.logMicroInteraction('drop-reject', { originZone: originZone, finalX: pointer.x, finalY: pointer.y });
      }
      this.updateCounts();
      this.dropZones.getChildren().forEach(z => z.getData('outline').setVisible(false));
    });

    const uiX = 650;
    this.showCodeButton = this.add.text(uiX, 30, '[ Show Code ]', { font: '16px Monospace', fill: '#0f0', backgroundColor: '#333', padding: { x: 5, y: 5 } })
      .setInteractive().on('pointerdown', () => this.showCodePanel(rooms[this.roomKey]?.codeSnippet));

    this.checkAnswerButton = this.add.text(uiX, 60, '[ Check Answer ]', { font: '16px Monospace', fill: '#0f0', backgroundColor: '#333', padding: { x: 5, y: 5 } })
      .setInteractive().on('pointerdown', () => this.handleCheckAnswer());
      
    this.resultText = this.add.text(uiX, 90, '', { font: '16px Monospace', fill: '#ff0' });

    this.input.keyboard.on('keydown-Q', () => {
      this.scene.start('ArenaScene', { roomKey: this.roomKey });
    });
  }

  startNewAttempt() {
    this.attemptNumber++;
    this.attemptAnalytics = {
      start_ts: new Date().toISOString(),
      moves: 0,
      help_opened: false,
      time_in_code_panel: 0,
      helpPanelOpenTime: null,
    };
    console.log(`Starting attempt #${this.attemptNumber}`);
  }

  addPlacedBall(x, y, zoneName) {
    const r = this.sourceBall.radius || 16;
    const b = this.add.circle(x, y, r, 0xff0000).setInteractive();
    b.setData('originZone', zoneName);
    this.input.setDraggable(b);
    this.placedBalls.add(b);
  }

  updateCounts() {
    this.sourceBallCountText.setText(`x${this.sourceBallCount}`);
    this.sourceBall.setInteractive(this.sourceBallCount > 0).setAlpha(this.sourceBallCount > 0 ? 1 : 0.5);
    for (const zn in this.zoneCountTexts) {
      this.zoneCountTexts[zn].setText(`${zn}: ${this.zoneCounts[zn]}`);
    }
  }

  showCodePanel(code) {
    if (this.codePanel && this.codePanel.active) return;
    this.attemptAnalytics.help_opened = true;
    this.attemptAnalytics.helpPanelOpenTime = Date.now();
    this.logMicroInteraction('show-code-click', { snippetId: this.roomKey });

    this.codePanel = this.add.container(0, 0);
    const bg = this.add.graphics().fillStyle(0x111111, 0.9).fillRect(50, 50, this.scale.width - 100, this.scale.height - 100);
    const codeText = this.add.text(70, 70, code, { font: '14px Courier', fill: '#fff', wordWrap: { width: this.scale.width - 140 } });
    const closeButton = this.add.image(this.scale.width - 70, 70, 'close_icon').setInteractive();
    
    this.codePanel.add([bg, codeText, closeButton]);

    closeButton.on('pointerdown', () => {
        if (this.attemptAnalytics.helpPanelOpenTime) {
            const duration = (Date.now() - this.attemptAnalytics.helpPanelOpenTime) / 1000; 
            this.attemptAnalytics.time_in_code_panel += duration;
            this.attemptAnalytics.helpPanelOpenTime = null;
        }
        this.codePanel.destroy();
    });
  }

  async handleCheckAnswer() {
    if (!this.userProfile || !this.dataService) return;

    const goal = rooms[this.roomKey].puzzleGoal || {};
    const was_correct = this.zoneCounts.x === goal.X && this.zoneCounts.y === goal.Y && this.zoneCounts.z === goal.Z;

    if (was_correct) {
        this.showSuccessScreen();
    } else {
        this.resultText.setText('Try Again');
    }
    
    const attemptData = {
        attempt_id: `${this.userProfile.sessionId}-${this.roomKey}-${this.attemptNumber}`,
        sessionId: this.userProfile.sessionId,
        user_id: this.userProfile.id,
        puzzle_id: this.roomKey,
        start_ts: this.attemptAnalytics.start_ts,
        end_ts: new Date().toISOString(),
        moves: this.attemptAnalytics.moves,
        help_opened: this.attemptAnalytics.help_opened,
        time_in_code_panel: this.attemptAnalytics.time_in_code_panel,
        isCorrect: was_correct,
        zone_counts: this.zoneCounts,
    };

    try {
        await this.dataService.createAttempt(attemptData);
        if (was_correct) {
            this.checkAnswerButton.disableInteractive().setAlpha(0.5);
            this.showCodeButton.disableInteractive().setAlpha(0.5);
        } else {
            this.startNewAttempt();
        }
    } catch (e) {
        console.error('PlayScene: Failed to log attempt', e);
    }
  }

  showSuccessScreen() {
    // Hide the main game UI
    this.resultText.setVisible(false);
    this.checkAnswerButton.setVisible(false);
    this.showCodeButton.setVisible(false);
    this.input.enabled = false; // Disable dragging while success screen is up

    const { width, height } = this.sys.game.canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    this.successUI = this.add.container(0, 0);

    // Use WebFont loader to ensure pixel font is ready
    WebFont.load({
        google: {
            families: ['Press Start 2P']
        },
        active: () => {
            const bg = this.add.graphics();
            bg.fillStyle(0x1a1a1a, 0.95);
            bg.fillRect(0, 0, width, height);

            const box = this.add.graphics();
            box.fillStyle(0x1a1a1a, 1);
            box.lineStyle(4, 0xffd700, 1);
            box.fillRect(centerX - 280, centerY - 150, 560, 300);
            box.strokeRect(centerX - 280, centerY - 150, 560, 300);

            const title = this.add.text(centerX, centerY - 100, 'PUZZLE SOLVED!', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffd700',
                align: 'center'
            }).setOrigin(0.5);

            const message = this.add.text(centerX, centerY - 20, "You've discovered a secret word!", {
                fontFamily: '"Press Start 2P"',
                fontSize: '14px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5);

            const password = this.add.text(centerX, centerY + 30, 'karo', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ff00ff',
                stroke: '#ffffff',
                strokeThickness: 4
            }).setOrigin(0.5);

            const continueButton = this.add.text(centerX, centerY + 100, '[ CONTINUE ]', {
                fontFamily: '"Press Start 2P"',
                fontSize: '18px',
                fill: '#ffffff'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.successUI.add([bg, box, title, message, password, continueButton]);

            continueButton.on('pointerdown', () => {
                this.scene.start('ArenaScene', { roomKey: this.roomKey });
            });
            continueButton.on('pointerover', () => continueButton.setFill('#ffd700'));
            continueButton.on('pointerout', () => continueButton.setFill('#ffffff'));
        }
    });
  }

  logMicroInteraction(eventType, payload = {}) {
     if (!this.userProfile || !this.userProfile.id || !this.dataService) {
      console.warn(`Analytics event '${eventType}' skipped: User profile not ready.`);
      return;
    }

    const eventDetails = {
        ...payload,
        puzzleState: {
            sourceBallCount: this.sourceBallCount,
            zoneCounts: { ...this.zoneCounts },
            timeSinceSceneLoad: this.time.now / 1000
        }
    };
    
    const logData = {
        sessionId: this.userProfile.sessionId,
        userId: this.userProfile.id,
        challengeId: this.challengeId,
        eventType: eventType,
        eventDetailsJson: JSON.stringify(eventDetails),
        timestamp: new Date().toISOString()
    };

    this.dataService.logEvent(logData)
        .catch(e => console.error(`Failed to log micro-interaction: ${eventType}`, e));
  }
}
