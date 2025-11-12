export default class competTest extends Phaser.Scene {
    constructor(competitionData) {
        super({ key: "competTest" });
        this.competitionData = competitionData; // Store competition data
    }

    preload() {
        if (!this.competitionData) {
            console.error("No competition data available for preload.");
            return;
        }

        const data = this.competitionData;
        console.log("Competition data loaded:", data);

        // Load spritesheet
        if (data.spritesheet) {
            const sprite = data.spritesheet;
            this.load.spritesheet(sprite.key, sprite.url, {
                frameWidth: sprite.frameWidth,
                frameHeight: sprite.frameHeight,
            });
        }

        // Load images
        if (Array.isArray(data.images)) {
            data.images.forEach(image => {
                this.load.image(image.key, image.url);
                console.log(image.key);
            });
        }

        // Load tilemap
        
        const tilemap = data.tilemap;
        this.load.tilemapTiledJSON(tilemap.key, tilemap.url);

        // Log asset loading
        this.load.on("complete", () => {
            console.log("All assets loaded successfully.");
        });

        this.load.on("loaderror", (file) => {
            console.error(`Failed to load asset: ${file.key}`);
        });
    }

    create() {
        console.log("Creating scene...");
        const map = this.make.tilemap({ key: this.competitionData.tilemap.key });
        if (!map) {
            console.error("Failed to create map with key: test");
            return;
        }

        const allTilesets = this.competitionData.images.map(image => {
            return map.addTilesetImage(image.key, image.key);
        });

        const backgroundLayer = map.createLayer("Background", allTilesets, 0, 0);
        const waterLayer = map.createLayer("Water", allTilesets, 0, 0);
        const detailsLayer = map.createLayer("Details", allTilesets, 0, 0);
        const houseLayer = map.createLayer("House", allTilesets, 0, 0);

        this.physics.world.setBounds(0, 0, backgroundLayer.width, backgroundLayer.height);
        const camera = this.cameras.main;
        camera.setBounds(0, 0, backgroundLayer.width, backgroundLayer.height);
        camera.setZoom(1);

        this.girl = this.physics.add.sprite(100, 100, "girl");
        this.girl.setCollideWorldBounds(true);
        camera.startFollow(this.girl);

        this.cursors = this.input.keyboard.createCursorKeys();
        console.log("Create done");
    }

    update() {
        const speed = 200;
        this.girl.setVelocity(0);

        if (this.cursors.left.isDown) this.girl.setVelocityX(-speed);
        if (this.cursors.right.isDown) this.girl.setVelocityX(speed);
        if (this.cursors.up.isDown) this.girl.setVelocityY(-speed);
        if (this.cursors.down.isDown) this.girl.setVelocityY(speed);
    }
}
