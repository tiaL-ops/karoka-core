// systems/puzzleManager.js

/**
 * puzzleManager.js
 * * This system is responsible for the core puzzle logic. It reads
 * object layers from the Tiled map to spawn interactive items like
 * Gems, Buckets, and the Player. It also keeps track of the puzzle's
 * state and checks if the player's actions meet the `puzzleGoal`.
 */
export default class PuzzleManager {
  constructor(scene, map, puzzleGoal) {
    this.scene = scene;
    this.map = map;
    this.puzzleGoal = puzzleGoal;
    this.bucketState = {}; // e.g., { X: 0, Y: 0, Z: 0 }
  }

  /**
   * Reads object layers from the Tiled map and spawns corresponding game objects.
   * This is key to the data-driven approach, as level layout and item
   * placement are controlled entirely by the Tiled map, not hard-coded.
   */
  spawnObjects() {
    console.log("PuzzleManager: Spawning objects from Tiled map.");

    // Example of spawning buckets
    const bucketLayer = this.map.getObjectLayer('Buckets');
    if (bucketLayer) {
      bucketLayer.objects.forEach(obj => {
        // 'var' should be a custom property set in Tiled on each bucket object
        const varName = obj.properties.find(p => p.name === 'var').value;
        console.log(`Spawning bucket ${varName} at`, obj.x, obj.y);
        // In a real implementation, you would create a Bucket sprite here:
        // new Bucket(this.scene, obj.x, obj.y, varName);
        this.bucketState[varName] = 0; // Initialize state
      });
    }

    // You would add similar logic for other object layers like 'Gems', 'Player', 'Doors'
  }

  /**
   * Called when a gem is added to a bucket.
   * @param {string} varName - The variable name of the bucket (e.g., 'X').
   */
  updateBucket(varName) {
    if (this.bucketState.hasOwnProperty(varName)) {
      this.bucketState[varName]++;
      console.log('Bucket State:', this.bucketState);
      this.checkGoal();
    }
  }

  /**
   * Checks if the current state of the buckets matches the puzzle goal.
   */
  checkGoal() {
    const success = Object.keys(this.puzzleGoal).every(key => {
      return this.bucketState[key] === this.puzzleGoal[key];
    });

    if (success) {
      console.log("PUZZLE SOLVED! Unlocking door...");
      // Find the door object and call its unlock() method.
      // this.scene.events.emit('puzzleSolved');
    }
  }
}