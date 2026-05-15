import type { BGMTrack } from '../BGMManager';

export class MenuTrack implements BGMTrack {
  private ctx: AudioContext;
  private output: GainNode;
  private gain: GainNode;
  private intervalId: number | null = null;
  private kickId: number | null = null;
  public isPlaying = false;

  // 110 BPM = 545ms per beat
  private readonly BPM = 110;
  private readonly BEAT_MS = 60000 / 110;

  // Melody in C minor pentatonic
  private melody = [
    392, 466.16, 523.25, 622.25, 698.46,
    622.25, 523.25, 466.16, 392, 349.23,
    392, 466.16, 523.25, 622.25, 784,
    622.25, 0, 0, 0, 0,
  ];

  // Bass pattern
  private bass = [
    130.81, 0, 130.81, 0, 155.56, 0, 155.56, 0,
    174.61, 0, 174.61, 0, 130.81, 0, 196, 0,
  ];

  constructor(ctx: AudioContext, output: GainNode) {
    this.ctx = ctx;
    this.output = output;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(output);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    let melodyStep = 0;
    let bassStep = 0;

    // Melody
    this.intervalId = window.setInterval(() => {
      const freq = this.melody[melodyStep % this.melody.length];
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        // Detuned pair for richness
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.value = freq * 1.003;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(g);
        g.connect(this.gain);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
        osc2.start();
        osc2.stop(this.ctx.currentTime + 0.3);
      }
      melodyStep++;
    }, this.BEAT_MS * 0.5);

    // Bass + light kick
    this.kickId = window.setInterval(() => {
      // Bass
      const freq = this.bass[bassStep % this.bass.length];
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        osc.connect(g);
        g.connect(this.gain);
        g.gain.setValueAtTime(0.12, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }

      // Light kick on every 4th step
      if (bassStep % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kg = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(120, this.ctx.currentTime);
        kick.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);
        kick.connect(kg);
        kg.connect(this.gain);
        kg.gain.setValueAtTime(0.2, this.ctx.currentTime);
        kg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        kick.start();
        kick.stop(this.ctx.currentTime + 0.1);
      }

      bassStep++;
    }, this.BEAT_MS * 0.25);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
    if (this.kickId !== null) { clearInterval(this.kickId); this.kickId = null; }
  }

  setIntensity(_v: number): void { /* no-op */ }

  fadeIn(ms: number): void {
    this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + ms / 1000);
  }

  fadeOut(ms: number): void {
    this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + ms / 1000);
  }
}
