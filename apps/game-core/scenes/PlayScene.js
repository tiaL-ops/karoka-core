
import { rooms } from '../config/roomData.js';

// A simple function to generate a unique enough ID for client-side events.
// For production, a more robust library like `uuid` would be better.
const simpleUUID = () => (`${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  init(data) {
    // --- SESSION & USER DATA ---
    this.playJsonUrl = data.playJsonUrl;
    this.tilesetsData = data.tilesets;
    this.mapKey = 'playMap_' + Date.now();
    this.roomKey = data.roomKey; // This will serve as our puzzle_id
    this.challengeId = data.challengeId;

    // Retrieve user/session and data service for logging
    this.userProfile = this.registry.get('userProfile');
    this.dataService = this.registry.get('dataService');
  
    if (!this.userProfile || !this.dataService) {
      console.warn('PlayScene: userProfile or dataService not found in registry. Analytics will be disabled.');
      // Create a dummy dataService to prevent errors if it's missing
      this.dataService = {
        logEvent: () => Promise.resolve(),
        createAttempt: () => Promise.resolve(),
        updateUserScore: () => Promise.resolve(),
      };
    }else{
        console.log("Ayoo the dataservice is", this.dataService);
    }

    // --- ANALYTICS STATE INITIALIZATION ---
    this.attemptNumber = 0;
    this.attemptAnalytics = {}; // To hold data for the current attempt
  }

  preload() {
    console.log(`PlayScene: Preloading map from ${this.playJsonUrl}`);
    this.load.tilemapTiledJSON(this.mapKey, this.playJsonUrl);
    // As requested, the long base64 string is removed. 
    // You should replace 'path/to/your/close_icon.png' with a real asset path.
    this.load.image('close_icon', 'path/to/your/close_icon.png');
  }

  create() {
    console.log('PlayScene: Creating scene.');
    const room = rooms[this.roomKey] || {};

    // --- INITIALIZE ATTEMPT TRACKING ---
    this.startNewAttempt();

    // Centering calculations
    const cam = this.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    // --- MAP & WORLD SETUP ---
    this.sourceBallCount = 10;
    this.zoneCounts = { x: 0, y: 0, z: 0 };
    const map = this.make.tilemap({ key: this.mapKey });
    const tilesets = this.tilesetsData.map(ts => map.addTilesetImage(ts.name, ts.key));
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    const offsetX = centerX - mapWidth / 2;
    const offsetY = centerY - mapHeight / 2;
    map.createLayer('Background', tilesets, offsetX, offsetY);

    // --- GAME OBJECTS SETUP ---
    const objs = map.getObjectLayer('Drag').objects;
    const ballObj = objs.find(o => o.name === 'ball');
    const targetObjs = objs.filter(o => ['x', 'y', 'z'].includes(o.name));
    
    // Create drop zones
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

    // Create source ball
    const bx = ballObj.x + offsetX;
    const by = ballObj.y + offsetY;
    this.sourceBall = this.add.circle(bx, by, ballObj.width / 2, 0xff0000).setInteractive();
    this.input.setDraggable(this.sourceBall);
    this.sourceBall.setData('homeX', bx);
    this.sourceBall.setData('homeY', by);
    this.sourceBallCountText = this.add.text(bx, by - 20, `x${this.sourceBallCount}`, { font: '16px Monospace', fill: '#fff' }).setOrigin(0.5);
    this.placedBalls = this.add.group();

    // --- EVENT HANDLERS WITH ANALYTICS ---
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
      this.attemptAnalytics.moves++; // Increment move count on any successful drop

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

    // --- UI SETUP ---
    const uiX = 650;
    this.add.text(uiX, 30, '[ Show Code ]', { font: '16px Monospace', fill: '#0f0', backgroundColor: '#333', padding: { x: 5, y: 5 } })
      .setInteractive().on('pointerdown', () => this.showCodePanel(room.codeSnippet));

    this.checkAnswerButton = this.add.text(uiX, 60, '[ Check Answer ]', { font: '16px Monospace', fill: '#0f0', backgroundColor: '#333', padding: { x: 5, y: 5 } })
      .setInteractive().on('pointerdown', () => this.handleCheckAnswer());
      
    this.resultText = this.add.text(uiX, 90, '', { font: '16px Monospace', fill: '#ff0' });

    // Key listeners
    this.input.keyboard.on('keydown-L', () => {
      if (!this.scene.isActive('CodeLessonScene')) { this.scene.launch('CodeLessonScene'); this.scene.sleep(); }
    });
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
      helpPanelOpenTime: null, // internal timer
    };
    console.log(`Starting attempt #${this.attemptNumber}`);
  }

  addPlacedBall(x, y, zoneName) {
    const r = this.sourceBall.radius || (this.sourceBall.width / 2) || 16;
    const b = this.add.circle(x, y, r, 0xff0000).setInteractive();
    b.setData('originZone', zoneName);
    this.input.setDraggable(b);
    this.placedBalls.add(b);
  }

  updateCounts() {
    this.sourceBallCountText.setText(`x${this.sourceBallCount}`);
    if (this.sourceBallCount === 0) {
      this.sourceBall.disableInteractive().setAlpha(0.5);
    } else {
      this.sourceBall.setInteractive().setAlpha(1);
    }
    for (const zn in this.zoneCountTexts) {
      this.zoneCountTexts[zn].setText(`${zn}: ${this.zoneCounts[zn]}`);
    }
  }

  showCodePanel(code) {
    if (this.codePanel && this.codePanel.active) return;

    // --- ANALYTICS: Track help usage ---
    this.attemptAnalytics.help_opened = true;
    this.attemptAnalytics.helpPanelOpenTime = Date.now();
    this.logMicroInteraction('show-code-click', { snippetId: this.roomKey });
    // ------------------------------------

    this.codePanel = this.add.container(0, 0);
    const bg = this.add.graphics().fillStyle(0x111111, 0.9).fillRect(50, 50, this.scale.width - 100, this.scale.height - 100);
    const codeText = this.add.text(70, 70, code, { font: '14px Courier', fill: '#fff', wordWrap: { width: this.scale.width - 140 } });
    const closeButton = this.add.image(this.scale.width - 70, 70, 'close_icon').setInteractive();
    
    this.codePanel.add([bg, codeText, closeButton]);

    closeButton.on('pointerdown', () => {
        // --- ANALYTICS: Track time spent in help panel ---
        if (this.attemptAnalytics.helpPanelOpenTime) {
            const duration = (Date.now() - this.attemptAnalytics.helpPanelOpenTime) / 1000; 
            this.attemptAnalytics.time_in_code_panel += duration;
            this.attemptAnalytics.helpPanelOpenTime = null; // Reset timer
        }
        // ------------------------------------------------
        this.codePanel.destroy();
    });
  }

  async handleCheckAnswer() {
    let allCorrect = true;
    if (!this.userProfile || !this.dataService) return;

    const goal = rooms[this.roomKey].puzzleGoal || {};
    const was_correct = this.zoneCounts.x === goal.X && this.zoneCounts.y === goal.Y && this.zoneCounts.z === goal.Z;

    this.resultText.setText(was_correct ? 'Correct!' : 'Try Again');
    
    // --- ANALYTICS: Finalize and send attempt data ---
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
       
        console.log("Logging attempt:", attemptData);
        await this.dataService.createAttempt(attemptData);
        console.log('PlayScene: Attempt logged successfully.');

        if (was_correct) {
            isCorrect: allCorrect,
            console.log("Updating user score...");
            console.log("Correct answer! Updating score.");
     
            this.checkAnswerButton.disableInteractive().setAlpha(0.5); // Prevent further attempts
        } else {
            // If incorrect, reset for the next attempt
            this.startNewAttempt();
        }
    } catch (e) {
        console.error('PlayScene: Failed to log attempt or update score', e);
    }
  }

  logMicroInteraction(eventType, payload = {}) {
     if (!this.userProfile || !this.userProfile.id || !this.dataService) {
      console.warn(`Analytics event '${eventType}' skipped: User profile not ready.`);
      return;
    }

    const eventDetails = {
        ...payload, // e.g., sourceZone, targetZone
        puzzleState: { // Include full state for reconstruction
            sourceBallCount: this.sourceBallCount,
            zoneCounts: { ...this.zoneCounts },
            timeSinceSceneLoad: this.time.now / 1000 // seconds
        }
    };
    
    const logData = {
        sessionId: this.userProfile.sessionId,
        userId: this.userProfile.id,
        challengeId: this.challengeId,
        eventType: eventType,
        eventDetailsJson: eventDetails,
        timestamp: new Date().toISOString()
    };

    // Fire-and-forget the log event
    this.dataService.logEvent(logData)
        .then(() => {/* console.log(`Micro-interaction logged: ${eventType}`) */})
        .catch(e => console.error(`Failed to log micro-interaction: ${eventType}`, e));
  }
}
