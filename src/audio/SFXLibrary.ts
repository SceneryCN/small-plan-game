import { shouldThrottle } from './AudioThrottle';

export class SFXLibrary {
  private ctx: AudioContext;
  private output: GainNode;

  constructor(ctx: AudioContext, output: GainNode) {
    this.ctx = ctx;
    this.output = output;
  }

  play(type: string, options?: { combo?: number }): void {
    if (shouldThrottle(type)) return;
    try {
      switch (type) {
        case 'shoot': this.shoot(); break;
        case 'hit': this.hit(); break;
        case 'kill': this.kill(); break;
        case 'itemBreak': this.itemBreak(); break;
        case 'powerup': this.powerup(); break;
        case 'damage': this.damage(); break;
        case 'nuke': this.nuke(); break;
        case 'laser': this.laser(); break;
        case 'combo': this.combo(options?.combo || 3); break;
        case 'gameOver': this.gameOverSfx(); break;
        case 'click': this.click(); break;
        case 'hover': this.hover(); break;
        case 'transition': this.transition(); break;
        case 'bossHit': this.bossHit(); break;
        case 'bossDeath': this.bossDeath(); break;
      }
    } catch (e) { /* silent */ }
  }

  private shoot(): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);

    // Add subtle bass thump for punch
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(this.output);
    bass.type = 'sine';
    bass.frequency.setValueAtTime(120, this.ctx.currentTime);
    bass.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.03);
    bassGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    bass.start();
    bass.stop(this.ctx.currentTime + 0.03);
  }

  private hit(): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);

    // Crunch layer
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = this.ctx.createGain();
    noise.connect(nGain);
    nGain.connect(this.output);
    nGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    noise.start();
  }

  private kill(): void {
    // Heavy explosion noise
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);
    const gain = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    noise.start();

    // Sub bass boom
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(this.output);
    bass.type = 'sine';
    bass.frequency.setValueAtTime(100, this.ctx.currentTime);
    bass.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.15);
    bassGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    bass.start();
    bass.stop(this.ctx.currentTime + 0.15);

    // Satisfying metallic ring
    const ring = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ring.connect(ringGain);
    ringGain.connect(this.output);
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1800, this.ctx.currentTime);
    ring.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.12);
    ringGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    ringGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    ring.start();
    ring.stop(this.ctx.currentTime + 0.12);
  }

  private itemBreak(): void {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.output);
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(2800, this.ctx.currentTime + 0.1);
    osc2.frequency.setValueAtTime(1800, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc1.start();
    osc1.stop(this.ctx.currentTime + 0.15);
    osc2.start();
    osc2.stop(this.ctx.currentTime + 0.12);

    // Sparkle burst
    const sparkle = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    sparkle.connect(sGain);
    sGain.connect(this.output);
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(3000, this.ctx.currentTime + 0.05);
    sparkle.frequency.exponentialRampToValueAtTime(5000, this.ctx.currentTime + 0.12);
    sGain.gain.setValueAtTime(0, this.ctx.currentTime);
    sGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.06);
    sGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    sparkle.start(this.ctx.currentTime + 0.05);
    sparkle.stop(this.ctx.currentTime + 0.15);
  }

  private powerup(): void {
    const notes = [523, 659, 784, 1047, 1318];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.output);
      osc.type = 'sine';
      const t = this.ctx.currentTime + i * 0.05;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    });

    // Triumphant bass note
    const bass = this.ctx.createOscillator();
    const bGain = this.ctx.createGain();
    bass.connect(bGain);
    bGain.connect(this.output);
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(130, this.ctx.currentTime);
    bGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    bGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    bass.start();
    bass.stop(this.ctx.currentTime + 0.25);
  }

  private damage(): void {
    // Distorted crunch
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.2);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(this.output);
    noiseGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    noise.start();

    // Heavy sub impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);

    // Alarm tone
    const alarm = this.ctx.createOscillator();
    const aGain = this.ctx.createGain();
    alarm.connect(aGain);
    aGain.connect(this.output);
    alarm.type = 'square';
    alarm.frequency.setValueAtTime(200, this.ctx.currentTime);
    alarm.frequency.setValueAtTime(150, this.ctx.currentTime + 0.1);
    aGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    aGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    alarm.start();
    alarm.stop(this.ctx.currentTime + 0.2);
  }

  private nuke(): void {
    // Massive explosion
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.8, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 0.8);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(8000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.8);
    const gain = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    noise.start();

    // Earth-shaking sub
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(this.output);
    bass.type = 'sine';
    bass.frequency.setValueAtTime(80, this.ctx.currentTime);
    bass.frequency.exponentialRampToValueAtTime(15, this.ctx.currentTime + 0.7);
    bassGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
    bass.start();
    bass.stop(this.ctx.currentTime + 0.7);

    // Shattering glass high
    const glass = this.ctx.createOscillator();
    const glassGain = this.ctx.createGain();
    glass.connect(glassGain);
    glassGain.connect(this.output);
    glass.type = 'sawtooth';
    glass.frequency.setValueAtTime(4000, this.ctx.currentTime);
    glass.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);
    glassGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    glassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    glass.start();
    glass.stop(this.ctx.currentTime + 0.3);
  }

  private laser(): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);

    // Electric crackle
    const crackle = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    crackle.connect(cGain);
    cGain.connect(this.output);
    crackle.type = 'square';
    crackle.frequency.setValueAtTime(3000, this.ctx.currentTime);
    crackle.frequency.setValueAtTime(1500, this.ctx.currentTime + 0.05);
    crackle.frequency.setValueAtTime(4000, this.ctx.currentTime + 0.1);
    cGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    crackle.start();
    crackle.stop(this.ctx.currentTime + 0.15);
  }

  private combo(comboCount: number): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'sine';
    const baseFreq = 600 + Math.min(comboCount, 30) * 50;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);

    // Hype layer for high combos
    if (comboCount >= 10) {
      const hype = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      hype.connect(hGain);
      hGain.connect(this.output);
      hype.type = 'square';
      hype.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.02);
      hGain.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.02);
      hGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      hype.start(this.ctx.currentTime + 0.02);
      hype.stop(this.ctx.currentTime + 0.06);
    }
  }

  private bossHit(): void {
    // Heavy metallic impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);

    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.8;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = this.ctx.createGain();
    noise.connect(nGain);
    nGain.connect(this.output);
    nGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    noise.start();
  }

  private bossDeath(): void {
    // Epic explosion sequence
    for (let i = 0; i < 4; i++) {
      const t = this.ctx.currentTime + i * 0.12;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / data.length, 1.5);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4000 - i * 800, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);
      const gain = this.ctx.createGain();
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.output);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      noise.start(t);
    }

    // Final massive sub drop
    const bass = this.ctx.createOscillator();
    const bGain = this.ctx.createGain();
    bass.connect(bGain);
    bGain.connect(this.output);
    bass.type = 'sine';
    bass.frequency.setValueAtTime(120, this.ctx.currentTime + 0.4);
    bass.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 1.2);
    bGain.gain.setValueAtTime(0.6, this.ctx.currentTime + 0.4);
    bGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
    bass.start(this.ctx.currentTime + 0.4);
    bass.stop(this.ctx.currentTime + 1.2);
  }

  private gameOverSfx(): void {
    const notes = [440, 370, 330, 220, 165];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.output);
      osc.type = 'triangle';
      const t = this.ctx.currentTime + i * 0.18;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });

    // Sad bass drone
    const bass = this.ctx.createOscillator();
    const bGain = this.ctx.createGain();
    bass.connect(bGain);
    bGain.connect(this.output);
    bass.type = 'sine';
    bass.frequency.setValueAtTime(55, this.ctx.currentTime);
    bGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    bGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
    bass.start();
    bass.stop(this.ctx.currentTime + 1.0);
  }

  private click(): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  private hover(): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.output);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.02);
  }

  private transition(): void {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5 * (1 - i / data.length);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + 0.3);
    filter.Q.value = 2;
    const gain = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    noise.start();
  }
}
