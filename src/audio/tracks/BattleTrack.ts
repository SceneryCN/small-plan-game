import type { BGMTrack } from '../BGMManager';

export class BattleTrack implements BGMTrack {
  private ctx: AudioContext;
  private gain: GainNode;
  private timers: number[] = [];
  private intensity = 0.5;
  public isPlaying = false;

  // ~172 BPM — slightly faster, more driving
  private readonly STEP_MS = 60000 / 172 / 4;

  // "动次打次" pattern: kick-hat-snare-hat
  private kickPattern =  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0];
  private snarePattern = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
  private hihatPattern = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0];
  private offHatPattern = [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0];
  private bassNotes = [
    55, 0, 55, 0, 0, 55, 0, 0,
    73.42, 0, 73.42, 0, 0, 82.41, 0, 0,
  ];
  private leadNotes = [
    523.25, 0, 659.25, 0, 784, 0, 659.25, 0,
    523.25, 0, 493.88, 0, 392, 0, 440, 0,
  ];

  constructor(ctx: AudioContext, output: GainNode) {
    this.ctx = ctx;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(output);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    let step = 0;

    const id = window.setInterval(() => {
      const s = step % 16;

      // Kick drum - always plays (the "动")
      if (this.kickPattern[s]) {
        this.playKick();
      }

      // Snare/clap - always plays (the "打")
      if (this.snarePattern[s]) {
        this.playSnare();
      }

      // Hihat - the "次" (plays at low intensity too)
      if (this.hihatPattern[s]) {
        this.playHihat();
      }

      if (this.intensity > 0.35 && this.offHatPattern[s]) {
        this.playHihat(0.55, 7800);
      }

      // Sub bass (intensity > 0.22)
      if (this.bassNotes[s] > 0 && this.intensity > 0.22) {
        this.playBass(this.bassNotes[s]);
      }

      // Lead synth (intensity > 0.42)
      if (this.leadNotes[s] > 0 && this.intensity > 0.42) {
        this.playLead(this.leadNotes[s]);
      }

      // Extra arp layer at high intensity
      if (this.intensity > 0.62 && s % 2 === 0) {
        this.playArp(this.leadNotes[s] || 523.25);
      }

      // Extra offbeat kick at high intensity for more chaos
      if (this.intensity > 0.78 && s % 4 === 2) {
        this.playKick();
      }

      step++;
    }, this.STEP_MS);

    this.timers.push(id);
  }

  stop(): void {
    this.isPlaying = false;
    for (const id of this.timers) {
      clearInterval(id);
    }
    this.timers = [];
  }

  setIntensity(v: number): void {
    this.intensity = Math.max(0, Math.min(1, v));
  }

  fadeIn(ms: number): void {
    this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + ms / 1000);
  }

  fadeOut(ms: number): void {
    this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + ms / 1000);
  }

  private playKick(): void {
    // Heavy kick with sub bass punch
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(this.gain);
    g.gain.setValueAtTime(0.6, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);

    // Click transient for attack
    const click = this.ctx.createOscillator();
    const cg = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(1000, this.ctx.currentTime);
    click.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.01);
    click.connect(cg);
    cg.connect(this.gain);
    cg.gain.setValueAtTime(0.3, this.ctx.currentTime);
    cg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);
    click.start();
    click.stop(this.ctx.currentTime + 0.015);
  }

  private playSnare(): void {
    // Noise burst for snare body
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000;
    filter.Q.value = 1.5;
    const g = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.gain);
    g.gain.setValueAtTime(0.35, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    noise.start();

    // Tone body
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.04);
    osc.connect(og);
    og.connect(this.gain);
    og.gain.setValueAtTime(0.25, this.ctx.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  private playHihat(gainMul = 1, highPass = 9000): void {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highPass;
    const g = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.gain);
    g.gain.setValueAtTime(0.2 * gainMul, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    noise.start();
  }

  private playBass(freq: number): void {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.gain);
    g.gain.setValueAtTime(0.3, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  private playLead(freq: number): void {
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc2.type = 'sawtooth';
    osc2.frequency.value = freq * 1.005; // slight detune for thickness
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.12);
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(g);
    g.connect(this.gain);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
    osc2.start();
    osc2.stop(this.ctx.currentTime + 0.12);
  }

  private playArp(baseFreq: number): void {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = baseFreq * 2;
    osc.connect(g);
    g.connect(this.gain);
    g.gain.setValueAtTime(0.05, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }
}
