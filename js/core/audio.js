// Procedural WebAudio sound effects and a soft generative ambient score.
const SCALES = {
  dawn: [0, 2, 4, 7, 9], forest: [0, 2, 3, 7, 9], swamp: [0, 1, 3, 7, 8], ash: [0, 1, 4, 5, 7],
  cave: [0, 3, 5, 6, 10], desert: [0, 1, 4, 5, 8], sky: [0, 2, 4, 6, 9], snow: [0, 2, 5, 7, 9], void: [0, 1, 3, 6, 8],
  dungeon: [0, 3, 5, 7, 10], arena: [0, 2, 5, 7, 10],
};
const ROOTS = { dawn: 57, forest: 55, swamp: 50, ash: 48, cave: 45, desert: 52, sky: 60, snow: 53, void: 46, dungeon: 46, arena: 50 };
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

export class Audio {
  constructor() {
    this.ctx = null;
    this.sfxVol = 0.55;
    this.musicVol = 0.35;
    this.theme = 'dawn';
    this.nextNote = 0;
    this.last = {};
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 1; this.master.connect(c.destination);
    this.sfx = c.createGain(); this.sfx.gain.value = this.sfxVol; this.sfx.connect(this.master);
    this.music = c.createGain(); this.music.gain.value = this.musicVol; this.music.connect(this.master);
    // simple feedback delay "reverb" for the score
    const d = c.createDelay(); d.delayTime.value = 0.38;
    const fb = c.createGain(); fb.gain.value = 0.42;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
    this.musicBus = c.createGain(); this.musicBus.connect(this.music); this.musicBus.connect(d);
    d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(this.music);
    this.noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  setVolumes(sfx, music) {
    this.sfxVol = sfx; this.musicVol = music;
    if (this.sfx) { this.sfx.gain.value = sfx; this.music.gain.value = music; }
  }

  tone(freq, dur, type = 'sine', vol = 0.3, slide = 0, delay = 0, dest = null) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfx);
    o.start(t); o.stop(t + dur + 0.05);
  }

  noise(dur, vol = 0.3, freq = 1200, q = 1, delay = 0, type = 'bandpass') {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfx);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  play(name) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.last[name] && now - this.last[name] < 0.045) return;
    this.last[name] = now;
    switch (name) {
      case 'swing': this.noise(0.14, 0.18, 2400, 0.8); break;
      case 'heavy': this.noise(0.22, 0.25, 900, 0.7); this.tone(90, 0.2, 'triangle', 0.2, 0.5); break;
      case 'hit': this.noise(0.08, 0.3, 1500, 1.2); this.tone(160, 0.08, 'square', 0.08, 0.5); break;
      case 'crit': this.noise(0.12, 0.35, 2600, 1.5); this.tone(520, 0.12, 'square', 0.1, 0.6); break;
      case 'shoot': this.noise(0.1, 0.12, 3800, 2); this.tone(700, 0.1, 'triangle', 0.08, 0.6); break;
      case 'magic': this.tone(660, 0.25, 'sine', 0.14, 1.6); this.tone(990, 0.2, 'triangle', 0.06, 1.3, 0.03); break;
      case 'fire': this.noise(0.4, 0.25, 600, 0.6, 0, 'lowpass'); break;
      case 'ice': this.tone(1400, 0.3, 'sine', 0.08, 0.7); this.noise(0.2, 0.1, 6000, 3); break;
      case 'holy': [0, 4, 7].forEach((s, i) => this.tone(mtof(76 + s), 0.5, 'sine', 0.08, 1, i * 0.04)); break;
      case 'heal': [0, 4, 7, 12].forEach((s, i) => this.tone(mtof(72 + s), 0.4, 'sine', 0.07, 1, i * 0.06)); break;
      case 'buff': this.tone(440, 0.35, 'triangle', 0.1, 2); break;
      case 'slam': this.tone(70, 0.45, 'sine', 0.45, 0.4); this.noise(0.35, 0.3, 300, 0.5, 0, 'lowpass'); break;
      case 'warn': this.tone(220, 0.18, 'sawtooth', 0.06, 0.9); break;
      case 'hurt': this.tone(200, 0.12, 'sawtooth', 0.1, 0.6); break;
      case 'die': this.tone(300, 0.6, 'sawtooth', 0.12, 0.3); break;
      case 'mobdie': this.noise(0.25, 0.15, 500, 0.8); this.tone(180, 0.25, 'triangle', 0.1, 0.5); break;
      case 'coin': this.tone(1320, 0.08, 'square', 0.06); this.tone(1760, 0.12, 'square', 0.05, 1, 0.06); break;
      case 'loot': [0, 7, 12].forEach((s, i) => this.tone(mtof(79 + s), 0.18, 'triangle', 0.07, 1, i * 0.05)); break;
      case 'epic': [0, 4, 7, 11, 14].forEach((s, i) => this.tone(mtof(72 + s), 0.5, 'triangle', 0.08, 1, i * 0.07)); break;
      case 'ui': this.tone(880, 0.05, 'triangle', 0.05); break;
      case 'open': this.tone(520, 0.08, 'triangle', 0.06, 1.5); break;
      case 'close': this.tone(700, 0.08, 'triangle', 0.05, 0.6); break;
      case 'error': this.tone(160, 0.15, 'square', 0.06); break;
      case 'quest': [0, 4, 7, 12, 16].forEach((s, i) => this.tone(mtof(67 + s), 0.45, 'triangle', 0.08, 1, i * 0.09)); break;
      case 'levelup':
        [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => this.tone(mtof(60 + s), 0.6, 'triangle', 0.09, 1, i * 0.07));
        this.noise(1.2, 0.08, 8000, 2, 0.3);
        break;
      case 'portal': this.tone(200, 0.9, 'sine', 0.15, 4); this.noise(0.9, 0.08, 2000, 1); break;
      case 'gather': this.noise(0.1, 0.12, 3000, 2); break;
      case 'boss': this.tone(55, 1.4, 'sawtooth', 0.12, 0.8); this.tone(82, 1.4, 'sawtooth', 0.08, 0.8); break;
      case 'stealth': this.noise(0.5, 0.12, 1000, 0.5, 0, 'lowpass'); break;
      default: this.tone(600, 0.06);
    }
  }

  setTheme(theme) { this.theme = theme; }

  /** Called every frame; schedules gentle ambient notes. */
  update(inCombat) {
    const c = this.ctx; if (!c || this.musicVol <= 0) return;
    const t = c.currentTime;
    if (t < this.nextNote) return;
    const scale = SCALES[this.theme] || SCALES.dawn;
    const root = ROOTS[this.theme] || 57;
    const deg = scale[Math.floor(Math.random() * scale.length)];
    const oct = Math.random() < 0.3 ? 12 : 0;
    const f = mtof(root + deg + oct);
    this.tone(f, 3.2, 'sine', 0.05, 1, 0, this.musicBus);
    if (Math.random() < 0.35) this.tone(f * 1.5, 2.6, 'triangle', 0.018, 1, 0.2, this.musicBus);
    if (Math.random() < 0.18) this.tone(mtof(root - 12), 5, 'sine', 0.05, 1, 0, this.musicBus);
    this.nextNote = t + (inCombat ? 0.45 : 0.9) + Math.random() * (inCombat ? 0.4 : 1.4);
  }
}

export const audio = new Audio();
