// systems/interactionManager.js

/**
 * interactionManager.js
 *
 * Handles simple pointer interactions like clicking on a terminal
 * to inspect it or clicking on an NPC to start a dialogue.
 */
export default class InteractionManager {
  constructor(scene) {
    this.scene = scene;

    // Listen for a global pointer down event
    this.scene.input.on('gameobjectdown', this.onObjectClicked, this);
  }

  onObjectClicked(pointer, gameObject) {
    // Check if the clicked object has an 'interactionType' property
    const type = gameObject.getData('interactionType');

    if (type === 'terminal') {
      console.log('Interacting with terminal:', gameObject.name);
      // Logic to show puzzle snippet or other info
    } else if (type === 'karo') {
      console.log('Interacting with Karo');
      // Logic to open the LLM dialogue box
    }
  }
}