import type { BGMTrack } from '../BGMManager';

export class GameOverTrack implements BGMTrack {
  private ctx: AudioContext;
  private output: GainNode;
  private gain: GainNode;
  private oscs: OscillatorNode[] = [];
  private intervalId: number | null = null;
  public isPlaying = false;

  // Slow descending arpeggio notes (C minor descending)
  private arpNotes = [
    523.25, 466.16, 392, 349.23, 311.13, 261.63,
    233.08, 196, 174.61, 155.56, 130.81,
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

    // Dark pad - low Cm chord
    const padNotes = [65.41, 77.78, 98.0];
    padNotes.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      g.gain.value = 0.12;
      osc.connect(g);
      g.connect(this.gain);
      osc.start();
      this.oscs.push(osc);
    });

    // Slow descending arpeggio
    let arpIdx = 0;
    this.intervalId = window.setInterval(() => {
      const freq = this.arpNotes[arpIdx % this.arpNotes.length];
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(g);
      g.connect(this.gain);
      g.gain.setValueAtTime(0.1, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
      arpIdx++;
    }, 857); // ~70 BPM
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
