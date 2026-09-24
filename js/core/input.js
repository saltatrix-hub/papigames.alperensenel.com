/** Keyboard + mouse state. `pressed` holds keys pressed since last frame. */
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, left: false, right: false, leftPressed: false, rightPressed: false, over: false, overUI: false };
    this.enabled = true;

    const isTyping = () => {
      const a = document.activeElement;
      return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
    };
    window.addEventListener('keydown', (e) => {
      if (isTyping()) return;
      const k = e.code;
      if (!this.down.has(k)) this.pressed.add(k);
      this.down.add(k);
      if (['Tab', 'Space', 'F1', 'F2', 'F3', 'F4'].includes(k) || k.startsWith('Arrow')) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => { this.down.clear(); this.mouse.left = this.mouse.right = false; });

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseenter', () => (this.mouse.over = true));
    canvas.addEventListener('mouseleave', () => (this.mouse.over = false));
    canvas.addEventListener('mousedown', (e) => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      if (e.button === 0) { this.mouse.left = true; this.mouse.leftPressed = true; }
      if (e.button === 2) { this.mouse.right = true; this.mouse.rightPressed = true; }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 2) this.mouse.right = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  key(code) { return this.enabled && this.down.has(code); }
  hit(code) { return this.enabled && this.pressed.has(code); }

  endFrame() {
    this.pressed.clear();
    this.mouse.leftPressed = false;
    this.mouse.rightPressed = false;
  }
}
