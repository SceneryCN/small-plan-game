import { GAME_CONFIG } from '../config/gameConfig';

export class DifficultySystem {
  public level = 1;
  /** Discrete wave index (increments on a timer). */
  public wave = 1;
  private waveFrameCounter = 0;

  reset(): void {
    this.level = 1;
    this.wave = 1;
    this.waveFrameCounter = 0;
  }

  update(): void {
    this.level += GAME_CONFIG.DIFFICULTY_INCREASE_RATE;
    this.waveFrameCounter++;
    if (this.waveFrameCounter >= GAME_CONFIG.WAVE_FRAMES_PER_WAVE) {
      this.waveFrameCounter = 0;
      this.wave++;
    }
  }
}
