import type { Container, Texture } from 'pixi.js';
import { Sprite } from 'pixi.js';
import { createSolidTexture } from '../utils/pixelCanvas';
import { rand, clamp } from '../utils/math';
import { GAME_CONFIG } from '../config/gameConfig';

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
    let cached = this.textures.get(color);
    if (!cached) {
      cached = createSolidTexture(3, 3, color);
      this.textures.set(color, cached);
    }
    return cached;
  }

  /** 向四周随机飞散（通用爆炸 / 命中） */
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

  /**
   * 指定初速度的单个粒子（用于定向轨迹特效）。
   */
  emitDirected(x: number, y: number, vx: number, vy: number, color: number, lifeFrames: number): void {
    const maxLife = Math.max(1, lifeFrames);
    const sprite = new Sprite(this.getTexture(color));
    sprite.anchor.set(0.5);
    sprite.x = x;
    sprite.y = y;
    this.stage.addChild(sprite);
    this.particles.push({
      sprite,
      vx,
      vy,
      life: lifeFrames,
      maxLife,
    });
  }

  /**
   * 激光爆发：参考《龙珠》魔贯光杀炮 — 竖直能量柱 + 沿柱螺旋的粉黄白粒子、炮口环状蓄能闪光。
   * 不改变游戏判定，仅视觉层。
   */
  emitLaserMakankoVolley(beamCenters: readonly number[], anchorY: number, frame: number, topY = 12): void {
    const step = 8;
    for (let bi = 0; bi < beamCenters.length; bi++) {
      const cx = beamCenters[bi];
      const columnPhase = bi * 2.7 + frame * 0.11;

      for (let y = anchorY - 6; y >= topY; y -= step) {
        const depth = (anchorY - y) / (anchorY - topY + 0.01);
        const spiralAngle = depth * 12 * Math.PI + columnPhase;
        const radius = 3.2 + 5.2 * Math.sin(depth * Math.PI);
        const px = cx + Math.cos(spiralAngle) * radius;
        const py = y;
        const spiralSpeed = 1.85;
        const vx = -Math.sin(spiralAngle) * spiralSpeed + rand(-0.18, 0.18);
        const vy = -rand(3.2, 6.8);

        let col = 0xaa66ff;
        if (depth < 0.1) col = 0xffffff;
        else if (depth < 0.32) col = 0xffffcc;
        else if (depth < 0.58) col = 0xff99ee;
        else if (depth < 0.82) col = 0xff66dd;
        if (Math.random() < 0.18) col = 0xffffff;

        this.emitDirected(px, py, vx, vy, col, rand(20, 36));
        if (Math.random() < 0.32) {
          this.emitDirected(
            px + rand(-2, 2),
            py + rand(-2, 2),
            vx * 0.55 + rand(-0.35, 0.35),
            vy - rand(0.4, 2.2),
            0xffffff,
            rand(12, 22)
          );
        }
      }

      const ringCount = beamCenters.length >= 4 ? 10 : 16;
      for (let j = 0; j < ringCount; j++) {
        const ang = (j / ringCount) * Math.PI * 2 + columnPhase * 0.45;
        const r = rand(3, 12);
        const px = cx + Math.cos(ang) * r * 0.4;
        const py = anchorY + rand(-2, 8);
        const vx = Math.cos(ang) * rand(0.4, 2.0);
        const vy = -rand(1.2, 4.2);
        const c = j % 3 === 0 ? 0xffffff : j % 3 === 1 ? 0xffff99 : 0xffccff;
        this.emitDirected(px, py, vx, vy, c, rand(14, 24));
      }
    }
  }

  /** 激光蓄力：能量环沿机身环绕一周 */
  emitLaserChargeRing(cx: number, cy: number, chargeFrame: number, chargeTotal: number): void {
    const R = 21;
    const denom = Math.max(1, chargeTotal - 1);
    const arc = (chargeFrame / denom) * Math.PI * 2;
    const dots = 18;
    for (let k = 0; k < dots; k++) {
      const a = arc - (k / dots) * 1.15;
      const px = cx + Math.cos(a) * R;
      const py = cy + Math.sin(a) * R * 0.5;
      const c = k % 3 === 0 ? 0xffffff : k % 3 === 1 ? 0xffccff : 0xff66ee;
      this.emitDirected(px, py, -Math.sin(a) * 0.4, Math.cos(a) * 0.25, c, 20);
    }
  }

  /**
   * 单次向上光柱特效：竖直稀疏粒子 + 柱芯少量亮点（低开销）。
   */
  emitLaserVerticalPulse(beamCenters: readonly number[], anchorY: number): void {
    const topY = 12;
    const step = 14;
    const hw = GAME_CONFIG.LASER_MAX_HALF_WIDTH;
    const mid = clamp(hw * 0.28, 2, 8);
    const edge = clamp(hw * 0.52, 4, 14);
    for (let bi = 0; bi < beamCenters.length; bi++) {
      const cx = beamCenters[bi];
      let row = 0;
      for (let y = anchorY - 6; y >= topY; y -= step, row++) {
        this.emitDirected(cx, y, 0, -0.35, 0xfff8ff, 12);
        if (row % 2 === 0) {
          this.emitDirected(cx - mid, y, 0, 0, 0xffd8ff, 9);
          this.emitDirected(cx + mid, y, 0, 0, 0xffd8ff, 9);
          this.emitDirected(cx - edge, y, 0, 0, 0xffc8ff, 9);
          this.emitDirected(cx + edge, y, 0, 0, 0xffc8ff, 9);
        }
      }
      this.emit(cx, anchorY + rand(-2, 4), 0xffeeff, 5, 2.2);
    }
  }

  /** 巨型 BOSS 蓄力环：比主角慢一圈，偏红紫 */
  emitMegaBossLaserRing(cx: number, cy: number, chargeFrame: number, chargeTotal: number): void {
    const R = 28;
    const denom = Math.max(1, chargeTotal - 1);
    const arc = (chargeFrame / denom) * Math.PI * 2;
    const dots = 20;
    for (let k = 0; k < dots; k++) {
      const a = arc - (k / dots) * 1.2;
      const px = cx + Math.cos(a) * R;
      const py = cy + Math.sin(a) * R * 0.48;
      const c = k % 3 === 0 ? 0xffccd0 : k % 3 === 1 ? 0xff6699 : 0xff2244;
      this.emitDirected(px, py, -Math.sin(a) * 0.28, Math.cos(a) * 0.18, c, 22);
    }
  }

  /** 巨型 BOSS 向下竖直激光柱特效 */
  emitMegaBossDownLaser(
    beamCenters: readonly number[],
    anchorY: number,
    frame: number,
    halfWidth: number,
    maxHalfWidth: number
  ): void {
    const ref = Math.max(1, maxHalfWidth);
    const scale = clamp(halfWidth / ref, 0.15, 1);
    const step = Math.max(6, Math.floor(10 / scale));
    const bottomY = GAME_CONFIG.LOGICAL_HEIGHT - 14;
    for (let bi = 0; bi < beamCenters.length; bi++) {
      const cx = beamCenters[bi];
      const columnPhase = bi * 2.4 + frame * 0.09;
      const coreStep = Math.max(2, Math.floor(2.5 + 1.4 * scale));
      const coreGlow = clamp(halfWidth * 0.55 + 1, 2, 5.5);
      for (let y = anchorY + 6; y <= bottomY; y += coreStep) {
        this.emitDirected(cx, y, 0, 0, 0xffeef5, rand(12, 18));
        this.emitDirected(cx, y, 0, 0.15, 0xffccd8, rand(10, 16));
        this.emitDirected(cx - coreGlow * 0.38, y, 0, 0, 0xffaac8, rand(8, 14));
        this.emitDirected(cx + coreGlow * 0.38, y, 0, 0, 0xffaac8, rand(8, 14));
      }
      for (let y = anchorY + 8; y <= bottomY; y += step) {
        const depth = (y - anchorY) / (bottomY - anchorY + 0.01);
        const spiralAngle = depth * 10 * Math.PI + columnPhase;
        const radiusMin = 4 + coreGlow * 0.25;
        const radius = (radiusMin + 5.2 * Math.sin(depth * Math.PI)) * scale;
        const px = cx + Math.cos(spiralAngle) * radius;
        const py = y;
        const vx = -Math.sin(spiralAngle) * 1.4 * scale + rand(-0.12, 0.12);
        const vy = rand(2.2, 5.5) * scale;

        let col = 0xff3366;
        if (depth < 0.15) col = 0xffaac8;
        else if (depth < 0.45) col = 0xff5588;
        else if (depth < 0.75) col = 0xff2244;
        if (Math.random() < 0.14) col = 0xffffff;

        this.emitDirected(px, py, vx, vy, col, rand(14, 26));
        if (Math.random() < 0.22 * scale) {
          this.emitDirected(
            px + rand(-2, 2),
            py + rand(-2, 2),
            vx * 0.5 + rand(-0.25, 0.25),
            vy + rand(0.3, 1.8),
            0xffccaa,
            rand(10, 18)
          );
        }
      }
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
