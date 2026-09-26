import { WorldView } from './view3d.js?v=cam3';

export class Renderer {
  constructor(canvas, game) {
    this.cv = canvas;
    this.game = game;
    this.view = new WorldView(canvas);
  }
  resize() { this.view.resize(); }
  follow(target, dt) { this.view.follow(target, dt, this.game?.world?.map); }
  snap(target) { this.view.snap(target); }
  screenToWorld(sx, sy) { return this.view.screenToWorld(sx, sy); }
  worldToScreen(x, y) { return this.view.worldToScreen(x, y); }
  render() { if (this.game) this.view.render(this.game); }
}
