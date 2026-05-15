import { Container, Sprite, Texture } from 'pixi.js';
import { createSolidTexture } from '../utils/pixelCanvas';
import { rand } from '../utils/math';

interface Particle {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private stage: Container;
  private particles: Particle[] = [];
  private textures: Map<number, Texture> = new Map();

  constructor(stage: Container) {
    this.stage = stage;
  }

  private getTexture(color: number): Texture {
    if (!this.textures.has(color)) {
      this.textures.set(color, createSolidTexture(3, 3, color));
    }
    return this.textures.get(color)!;
  }

  emit(x: number, y: number, color: number, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const spd = rand(speed * 0.3, speed);
      const sprite = new Sprite(this.getTexture(color));
      sprite.anchor.set(0.5);
      sprite.x = x;
      sprite.y = y;
      this.stage.addChild(sprite);

      this.particles.push({
        sprite,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: rand(15, 30),
        maxLife: 30,
      });
    }
  }

  update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.sprite.x += p.vx;
      p.sprite.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life--;
      p.sprite.alpha = p.life / p.maxLife;

      if (p.life <= 0) {
        this.stage.removeChild(p.sprite);
        p.sprite.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  reset(): void {
    this.particles.forEach(p => {
      this.stage.removeChild(p.sprite);
      p.sprite.destroy();
    });
    this.particles = [];
  }
}
