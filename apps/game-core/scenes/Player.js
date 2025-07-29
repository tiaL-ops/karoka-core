// entities/Player.js

/**
 * The Player class encapsulates all logic for the player character,
 * including sprite creation, physics, animations, and movement.
 */
export default class Player {
  /**
   * @param {Phaser.Scene} scene The scene that owns this player.
   * @param {number} x The starting x-coordinate.
   * @param {number} y The starting y-coordinate.
   * @param {string} textureKey The key for the player's spritesheet.
   */
  constructor(scene, x, y, textureKey) {
    this.scene = scene;
    
    // Create the sprite and enable physics
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    
    // Set physics properties
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(this.sprite.width * 0.8, this.sprite.height * 0.8);
    this.sprite.body.setOffset(this.sprite.width * 0.1, this.sprite.height * 0.2);

    // Create animations using a prefix based on the texture key
    this.createPlayerAnimations(textureKey);
  }

  /**
   * Creates the player's walking animations from its spritesheet.
   * This uses a prefix for each animation key to support multiple avatars.
   * @param {string} textureKey The key for the player's spritesheet, used as a prefix.
   */
  createPlayerAnimations(textureKey) {
    // Frame numbers are based on the 'boi.png' layout for a smooth walk cycle.
    // Animation keys are now prefixed, e.g., "Boi_down".
    this.scene.anims.create({
      key: `${textureKey}_down`,
      frames: this.scene.anims.generateFrameNames(textureKey, { frames: [1, 0, 3, 0] }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: `${textureKey}_left`,
      frames: this.scene.anims.generateFrameNames(textureKey, { frames: [5, 4, 7, 4] }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: `${textureKey}_right`,
      frames: this.scene.anims.generateFrameNames(textureKey, { frames: [9, 8, 11, 8] }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: `${textureKey}_up`,
      frames: this.scene.anims.generateFrameNames(textureKey, { frames: [13, 12, 15, 12] }),
      frameRate: 8,
      repeat: -1,
    });
  }

  /**
   * The update loop for the player, called from the scene's update method.
   * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors The cursor keys object.
   */
  update(cursors) {
    const speed = 200;
    const prefix = this.sprite.texture.key; // Get the current avatar's key for the animation prefix

    // Stop any previous movement from the last frame
    this.sprite.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
      this.sprite.body.setVelocityX(-speed);
      this.sprite.anims.play(`${prefix}_left`, true);
    } else if (cursors.right.isDown) {
      this.sprite.body.setVelocityX(speed);
      this.sprite.anims.play(`${prefix}_right`, true);
    }
    // Vertical movement
    else if (cursors.up.isDown) {
      this.sprite.body.setVelocityY(-speed);
      this.sprite.anims.play(`${prefix}_up`, true);
    } else if (cursors.down.isDown) {
      this.sprite.body.setVelocityY(speed);
      this.sprite.anims.play(`${prefix}_down`, true);
    } else {
      // No keys down, stop animation and show idle frame
      this.sprite.anims.stop();

      // Set idle frame based on last direction
      const lastAnimKey = this.sprite.anims.currentAnim?.key;
      if (lastAnimKey === `${prefix}_left`) this.sprite.setFrame(4);
      else if (lastAnimKey === `${prefix}_right`) this.sprite.setFrame(8);
      else if (lastAnimKey === `${prefix}_up`) this.sprite.setFrame(12);
      else if (lastAnimKey === `${prefix}_down`) this.sprite.setFrame(0);
    }
  }
}
