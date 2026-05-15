import { Container } from 'pixi.js';
import { rand } from '../utils/math';

const SHAKE_CAP = 5.5;
const SHAKE_DECAY = 0.82;

export class Camera {
  public container: Container;
  private shakeIntensity = 0;
  private offsetX = 0;
  private offsetY = 0;

  constructor() {
    this.container = new Container();
  }

  shake(intensity: number): void {
    const capped = Math.min(intensity, SHAKE_CAP * 1.35);
    this.shakeIntensity = Math.max(this.shakeIntensity, capped);
  }

  update(): void {
    if (this.shakeIntensity > 0.35) {
      const amp = Math.min(this.shakeIntensity, SHAKE_CAP);
      const tx = (rand(-1, 1) + rand(-1, 1)) * 0.5 * amp;
      const ty = (rand(-1, 1) + rand(-1, 1)) * 0.5 * amp;
      this.offsetX = this.offsetX * 0.35 + tx * 0.65;
      this.offsetY = this.offsetY * 0.35 + ty * 0.65;
      this.container.x = this.offsetX;
      this.container.y = this.offsetY;
      this.shakeIntensity *= SHAKE_DECAY;
    } else {
      this.shakeIntensity = 0;
      this.offsetX *= 0.5;
      this.offsetY *= 0.5;
      this.container.x = this.offsetX;
      this.container.y = this.offsetY;
      if (Math.abs(this.offsetX) < 0.05 && Math.abs(this.offsetY) < 0.05) {
        this.offsetX = 0;
        this.offsetY = 0;
        this.container.x = 0;
        this.container.y = 0;
      }
    }
  }
}
