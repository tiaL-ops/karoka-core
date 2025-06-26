export default class Bucket extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, varName) {
    super(scene, x, y, 'bucket_sprite'); // Assumes 'bucket_sprite' is preloaded
    this.varName = varName;
    scene.add.existing(this);
    // This object acts as a drop zone
  }
}