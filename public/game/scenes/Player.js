export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, frame = 0) {
        super(scene, x, y, textureKey, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 1);
        this.setSize(32, 32);
        this.setOffset(8, 16);

        this.speed = 200;
        this.cursors = null;
        this.lastDirection = "down";

        this.textureKey = textureKey; // Store the textureKey for animation keys
    }

    update() {
        if (!this.cursors) return;

        this.setVelocity(0);

        let isMoving = false;

        const prefix = this.textureKey; // Use the stored textureKey for animation keys

        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.anims.play(`${prefix}_walk_left`, true);
            this.lastDirection = "left";
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.anims.play(`${prefix}_walk_right`, true);
            this.lastDirection = "right";
            isMoving = true;
        }

        if (this.cursors.up.isDown) {
            this.setVelocityY(-this.speed);
            this.anims.play(`${prefix}_walk_up`, true);
            this.lastDirection = "up";
            isMoving = true;
        } else if (this.cursors.down.isDown) {
            this.setVelocityY(this.speed);
            this.anims.play(`${prefix}_walk_down`, true);
            this.lastDirection = "down";
            isMoving = true;
        }

        if (!isMoving) {
            this.anims.stop();
            switch (this.lastDirection) {
                case "down":
                    this.setFrame(0);
                    break;
                case "left":
                    this.setFrame(1);
                    break;
                case "up":
                    this.setFrame(2);
                    break;
                case "right":
                    this.setFrame(3);
                    break;
            }
        }
    }
}
