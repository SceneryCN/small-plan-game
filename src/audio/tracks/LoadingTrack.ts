import type { BGMTrack } from '../BGMManager';

export class LoadingTrack implements BGMTrack {
  private ctx: AudioContext;
  private output: GainNode;
  private gain: GainNode;
  private oscs: OscillatorNode[] = [];
  private intervalId: number | null = null;
  public isPlaying = false;

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

    // Ambient pad - C minor chord (C3, Eb3, G3)
    const padNotes = [130.81, 155.56, 196.0];
    padNotes.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      oscGain.gain.value = 0.15;
      osc.connect(oscGain);
      oscGain.connect(this.gain);
      osc.start();
      this.oscs.push(osc);
    });

    // Slow arpeggio
    const arpNotes = [261.63, 311.13, 392.0, 523.25, 392.0, 311.13];
    let arpIndex = 0;
    this.intervalId = window.setInterval(() => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = arpNotes[arpIndex % arpNotes.length];
      osc.connect(g);
      g.connect(this.gain);
      g.gain.setValueAtTime(0.08, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
      arpIndex++;
    }, 600);
  }

  stop(): void {
    this.isPlaying = false;
    this.oscs.forEach(o => { try { o.stop(); } catch (e) { /* */ } });
    this.oscs = [];
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setIntensity(_v: number): void { /* no-op for loading */ }

  fadeIn(ms: number): void {
    this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + ms / 1000);
  }

  fadeOut(ms: number): void {
    this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + ms / 1000);
  }
}
