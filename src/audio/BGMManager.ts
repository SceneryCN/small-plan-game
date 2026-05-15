export interface BGMTrack {
  start(): void;
  stop(): void;
  setIntensity(v: number): void;
  fadeIn(ms: number): void;
  fadeOut(ms: number): void;
  isPlaying: boolean;
}

export type BGMState = 'loading' | 'menu' | 'battle' | 'gameOver' | 'none';

export class BGMManager {
  private ctx: AudioContext;
  private output: GainNode;
  private tracks: Map<BGMState, BGMTrack> = new Map();
  private currentState: BGMState = 'none';

  constructor(ctx: AudioContext, output: GainNode) {
    this.ctx = ctx;
    this.output = output;
  }

  registerTrack(state: BGMState, track: BGMTrack): void {
    this.tracks.set(state, track);
  }

  transition(newState: BGMState, fadeOutMs = 500, fadeInMs = 500): void {
    if (newState === this.currentState) return;
    const oldTrack = this.tracks.get(this.currentState);
    const newTrack = this.tracks.get(newState);

    if (oldTrack?.isPlaying) {
      oldTrack.fadeOut(fadeOutMs);
      setTimeout(() => oldTrack.stop(), fadeOutMs);
    }

    if (newTrack) {
      setTimeout(() => {
        newTrack.start();
        newTrack.fadeIn(fadeInMs);
      }, fadeOutMs * 0.5);
    }

    this.currentState = newState;
  }

  setIntensity(v: number): void {
    const track = this.tracks.get(this.currentState);
    track?.setIntensity(v);
  }

  get state(): BGMState {
    return this.currentState;
  }

  get context(): AudioContext {
    return this.ctx;
  }

  get outputNode(): GainNode {
    return this.output;
  }
}
