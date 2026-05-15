import { BGMManager } from './BGMManager';
import { SFXLibrary } from './SFXLibrary';

class AudioEngine {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public bgmGain: GainNode | null = null;
  public sfxGain: GainNode | null = null;
  public bgm: BGMManager | null = null;
  public sfx: SFXLibrary | null = null;
  private initialized = false;

  init(): boolean {
    if (this.initialized) return true;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.4;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.bgm = new BGMManager(this.ctx, this.bgmGain);
      this.sfx = new SFXLibrary(this.ctx, this.sfxGain);

      this.initialized = true;
      return true;
    } catch (e) {
      console.warn('Audio init failed:', e);
      return false;
    }
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  get isReady(): boolean {
    return this.initialized;
  }
}

export const audioEngine = new AudioEngine();
