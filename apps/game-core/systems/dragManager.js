// systems/dragManager.js

/**
 * dragManager.js
 *
 * A generic system to make game objects draggable. You could initialize
 * this in your scene and then use it to register specific objects
 * (like Gems) that need drag-and-drop functionality.
 */
export default class DragManager {
  constructor(scene) {
    this.scene = scene;

    // Generic drag handlers
    this.scene.input.on('dragstart', (pointer, gameObject) => {
      // e.g., bring to top, tint
      gameObject.setTint(0xff0000); 
    });

    this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.scene.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint();
      // Logic for what happens on drop (e.g., check if over a bucket)
    });
  }

  /**
   * Makes a specific game object draggable.
   * @param {Phaser.GameObjects.GameObject} gameObject The object to make draggable.
   */
  makeDraggable(gameObject) {
    gameObject.setInteractive();
    this.scene.input.setDraggable(gameObject);
  }
}