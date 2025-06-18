export default class Gem extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'gem_sprite'); // Assumes 'gem_sprite' is preloaded
    scene.add.existing(this);
    // You would use the dragManager to make this draggable
    // scene.dragManager.makeDraggable(this);
  }
}