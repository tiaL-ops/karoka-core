export default class CodePanel {
  constructor(scene, x, y, code) {
    // A real implementation would create a scrolling text box
    const textStyle = { font: '14px Courier', fill: '#0f0' };
    scene.add.text(x + 10, y + 10, code, textStyle)
      .setOrigin(0)
      .setWordWrapWidth(380);
    
    // Create a background for the panel
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x000000, 0.8);
    graphics.fillRect(x, y, 400, 200);
  }
}