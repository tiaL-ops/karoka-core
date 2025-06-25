import CodeMirror from 'codemirror';

export default class CodeEditorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CodeEditorScene' });
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // --- 1) Header ---
    this.add.text(width / 2, 24, 'LeetCode‑Lite', {
      font: '36px Consolas, Monaco, monospace',
      fill: '#0ff',
      stroke: '#00f',
      strokeThickness: 4
    }).setOrigin(0.5);

    // --- 2) Dark background panel ---
    this.add.rectangle(width / 2, height / 2 + 30, 760, 500, 0x1e1e1e, 0.95);

    // --- 3) CodeMirror editor container ---
    const edX = 20, edY = 80, edW = 760, edH = 400;
    const wrapper = document.createElement('div');
    wrapper.id = 'cm-wrapper';
    wrapper.style.cssText = `
      position: absolute;
      top: ${edY}px;
      left: ${edX}px;
      width: ${edW}px;
      height: ${edH}px;
      border: 2px solid #444;
      border-radius: 6px;
      overflow: hidden;
    `;
    this.editorDOM = this.add.dom(0, 0, wrapper).setOrigin(0);

    // initialize CodeMirror after the element is in the DOM
    this.time.delayedCall(0, () => {
      const template =
`# Fill in the blanks to make this code work
# It should print: “Galaxia has 4 town and 2 Tera”

# --- Write your code below--- 


# ── Do not change this line ──
print(city + " has " + str(c) + " town and " + str(b) + " " + town)`;

      this.editor = CodeMirror(wrapper, {
        value: template,
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        autofocus: true
      });

      const doc = this.editor.getDoc();
      // make the template read-only up to the write region
      doc.markText({ line: 0, ch: 0 }, { line: 3, ch: Infinity }, { readOnly: true });
      // lock the print statement line
      doc.markText({ line: 7, ch: 0 }, { line: 7, ch: Infinity }, { readOnly: true });
      // highlight the editable region
      doc.markText({ line: 3, ch: 0 }, { line: 3, ch: Infinity }, { className: 'cm-blank' });
    });

    // --- 4) Run button ---
    const btn = document.createElement('button');
    btn.id = 'run-btn';
    btn.textContent = 'Run';
    btn.style.cssText = `
      position: absolute;
      top: ${edY + edH + 10}px;
      left: ${edX}px;
      padding: 8px 20px;
      font-size: 18px;
      background: #0a74da;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    this.runButton = this.add.dom(0, 0, btn).setOrigin(0);
    this.runButton.addListener('click').on('click', () => this.checkAnswer());

    // --- 5) Feedback text ---
    this.feedback = this.add.text(
      edX + 100,
      edY + edH + 14,
      'Edit the blanks and click Run.',
      {
        font: '18px Consolas, Monaco, monospace',
        fill: '#aaa'
      }
    );

    // --- 6) Exit hint ---
    this.add.text(
      width - 24,
      height - 16,
      "Press 'Q' to exit",
      {
        font: '14px Consolas, Monaco, monospace',
        fill: '#666'
      }
    ).setOrigin(1);

    this.input.keyboard.on('keydown-Q', () => {
      this.editorDOM.destroy();
      this.runButton.destroy();
      this.scene.stop();
    });
  }

  checkAnswer() {
    const code = this.editor.getValue();

    // Extract numeric values for b and c
    const bMatch = code.match(/b\s*=\s*(\d+)/);
    const cMatch = code.match(/c\s*=\s*(\d+)/);
    const bVal = bMatch ? parseInt(bMatch[1], 10) : null;
    const cVal = cMatch ? parseInt(cMatch[1], 10) : null;

    // Extract city and town strings
    const cityMatch = code.match(/city\s*=\s*["']([^"']+)["']/);
    const townMatch = code.match(/town\s*=\s*["']([^"']+)["']/);
    const cityVal = cityMatch ? cityMatch[1] : null;
    const townVal = townMatch ? townMatch[1] : null;

    // Display extracted values
    this.feedback
      .setText(`b=${bVal}, c=${cVal}, city=${cityVal}, town=${townVal}`)
      .setStyle({ fill: '#0ff' });
    console.log('Extracted values:', { b: bVal, c: cVal, city: cityVal, town: townVal });
  }
}
