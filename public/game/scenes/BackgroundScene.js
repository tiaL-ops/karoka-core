export default class BackgroundScene extends Phaser.Scene {
    constructor() {
      super({ key: "BackgroundScene" });
    }
  
    preload() {
      // Load any assets if necessary (e.g., glow sprite or stars)
      //this.load.image("star", "path/to/star.png"); // Replace with your star asset
    }
  
    create() {
      // Set up the starfield effect
     
  
      // Add the sweeping glow effect
      this.createSearchingGlow();
  
      // Add some textual flair (optional)
      const message = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Searching...",
        {
          fontSize: "32px",
          color: "#ffffff",
          fontFamily: "Arial",
        }
      );
      message.setOrigin(0.5);
      this.tweens.add({
        targets: message,
        alpha: 0.3,
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });
    }
  
    createStarfield() {
      const particles = this.add.particles("star");
  
      const emitter = particles.createEmitter({
        x: { min: 0, max: this.cameras.main.width },
        y: { min: 0, max: this.cameras.main.height },
        lifespan: 2000,
        speedY: { min: 20, max: 50 },
        scale: { start: 0.1, end: 0 },
        quantity: 1,
        blendMode: "ADD",
      });
  
      emitter.setFrequency(50); // Control how often stars appear
  
      // Slowly move the starfield for a parallax effect
      this.time.addEvent({
        delay: 1000 / 60,
        callback: () => {
          particles.emitParticleAt(
            Phaser.Math.Between(0, this.cameras.main.width),
            0
          );
        },
        loop: true,
      });
    }
  
    createSearchingGlow() {
      const glow = this.add.circle(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        50,
        0xffff00,
        0.5
      );
  
      // Tween to simulate searching
      this.tweens.add({
        targets: glow,
        x: { from: -50, to: this.cameras.main.width + 50 },
        y: { from: -50, to: this.cameras.main.height + 50 },
        duration: 4000,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
  
      // Tween the glow intensity
      this.tweens.add({
        targets: glow,
        radius: { from: 30, to: 60 },
        alpha: { from: 0.2, to: 0.8 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Quad.easeInOut",
      });
    }
  }
  