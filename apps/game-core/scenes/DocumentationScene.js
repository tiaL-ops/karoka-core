// karoka-core/apps/game-core/scenes/DocumentationScene.js

export default class DocumentationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DocumentationScene' });
    }

    init(data) {
        this.userProfile = this.registry.get('userProfile');
        this.dataService = this.registry.get('dataService');
        this.topicId = data.topicId || 'unknown';
    }

    create() {
        const { width, height } = this.sys.game.canvas;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        const content = [
            '--- Documentation: Variables ---',
            '',
            'Variables are like containers that store values.',
            'They can hold numbers (integers like 2, or floats like 2.5),',
            'text (strings like "Hello"), or other data types.',
            '',
            'In Python, the type is determined automatically.',
            'x = 2       # This is an integer',
            'y = 2.5     # This is a float',
            'name = "Annah" # This is a string'
        ];

        this.add.text(width / 2, height / 2, content, {
            font: '18px Consolas, Monaco, monospace',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width - 100 }
        }).setOrigin(0.5);

        this.add.text(width / 2, height - 30, 'Press Q to close documentation', { fill: '#888' }).setOrigin(0.5);
        this.input.keyboard.on('keydown-Q', () => this.scene.stop());

        // --- Event Logging ---
        this.dataService.logEvent({
            sessionId: this.userProfile.sessionId,
            eventType: 'documentation_accessed',
            eventDetails: {
                challenge_id: 'room1_computer_password', // Context can be passed in init data
                document_id: this.topicId
            }
        });
    }

    shutdown() {
        this.input.keyboard.off('keydown-Q');
    }
}