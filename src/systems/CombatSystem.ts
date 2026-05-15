import type { PlayerEntity, EnemyEntity } from '../entities/Entity';
import { GAME_CONFIG } from '../config/gameConfig';
import { EntityManager } from '../engine/EntityManager';
import { ParticleSystem } from '../engine/ParticleSystem';
import { CollisionSystem } from '../engine/CollisionSystem';
import { Camera } from '../engine/Camera';
import { audioEngine } from '../audio/AudioEngine';
import { rand, dist, clamp } from '../utils/math';
import type { EffectType } from '../config/gameConfig';

export class CombatSystem {
  private entities: EntityManager;
  private particles: ParticleSystem;
  private collision: CollisionSystem;
  private camera: Camera | null = null;

  public score = 0;
  public combo = 0;
  public comboTimer = 0;
  private droneAngle = 0;
  private droneFireTimer = 0;
  private homingFireTimer = 0;
  /** 0 = laser volley ready; >0 counts down until next vertical burst */
  private laserCooldown = 0;

  constructor(entities: EntityManager, particles: ParticleSystem, collision: CollisionSystem) {
    this.entities = entities;
    this.particles = particles;
    this.collision = collision;
  }

  setCamera(camera: Camera): void { this.camera = camera; }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.droneAngle = 0;
    this.droneFireTimer = 0;
    this.homingFireTimer = 0;
    this.laserCooldown = 0;
  }

  update(player: PlayerEntity, entities: EntityManager, frame: number): void {
    if (this.comboTimer > 0) { this.comboTimer--; if (this.comboTimer <= 0) this.combo = 0; }
    if (player.invincible > 0) player.invincible--;

    // Auto-fire
    player.fireTimer++;
    const fireRate = this.getFireRate(player);
    if (player.fireTimer >= fireRate) { player.fireTimer = 0; this.fireBullets(player); }

    // Drone
    if (this.hasEffect(player, 'drone')) this.updateDrone(player);
    // Homing
    if (this.hasEffect(player, 'homing')) this.updateHoming(player);

    // Laser — only vertical beam columns, burst + cooldown (highest damage)
    if (this.hasEffect(player, 'laser')) {
      if (this.laserCooldown > 0) this.laserCooldown--;
      if (this.laserCooldown === 0) {
        this.fireLaserVolley(player, entities, frame);
        this.laserCooldown = GAME_CONFIG.LASER_VOLLEY_COOLDOWN_FRAMES;
      }
    }

    // Bullet-Enemy
    for (const bullet of entities.bullets) {
      if (!bullet.alive) continue;
      for (const enemy of entities.enemies) {
        if (!enemy.alive) continue;
        if (this.collision.checkBulletEnemy(bullet, enemy)) {
          enemy.hp -= bullet.damage; enemy.flashTimer = 4;
          if (!bullet.pierce) bullet.alive = false;
          this.particles.emit(bullet.x, bullet.y, 0xffaa00, 4, 3);
          this.particles.emit(bullet.x, bullet.y, 0xffffff, 2, 2);
          if (enemy.tier >= 3) { audioEngine.sfx?.play('bossHit'); } else { audioEngine.sfx?.play('hit'); }
          this.combo++; this.comboTimer = 90;
          if (this.combo >= 3 && this.combo % 3 === 0) audioEngine.sfx?.play('combo', { combo: this.combo });
          if (this.camera) this.camera.shake(0.45 + (enemy.tier >= 3 ? 0.35 : 0));
        }
      }
    }

    // Bullet-Item
    for (const bullet of entities.bullets) {
      if (!bullet.alive) continue;
      for (const item of entities.items) {
        if (!item.alive) continue;
        if (this.collision.checkBulletItem(bullet, item)) {
          item.hp -= bullet.damage; item.flashTimer = 4;
          if (!bullet.pierce) bullet.alive = false;
          this.particles.emit(bullet.x, bullet.y, item.color, 3, 2);
          audioEngine.sfx?.play('hit');
        }
      }
    }

    // Homing bullets
    this.updateHomingBullets(entities);

    // Enemy deaths
    for (const enemy of entities.enemies) {
      if (!enemy.alive) continue;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        const mult = 1 + Math.floor(this.combo / 5);
        this.score += enemy.score * mult;
        const pc = 8 + enemy.tier * 8;
        const ps = 2 + enemy.tier * 2;
        this.particles.emit(enemy.x, enemy.y, enemy.color, pc, ps);
        this.particles.emit(enemy.x, enemy.y, 0xffffff, Math.floor(pc / 2), ps * 0.8);
        this.particles.emit(enemy.x, enemy.y, 0xffcc00, 4, ps * 0.6);
        if (enemy.tier >= 3) {
          audioEngine.sfx?.play('bossDeath');
          // Extra explosion particles for bosses
          this.particles.emit(enemy.x, enemy.y, 0xff4400, pc * 2, ps * 1.5);
          this.particles.emit(enemy.x, enemy.y, 0xff8800, pc, ps * 1.2);
        } else {
          audioEngine.sfx?.play('kill');
        }
        if (this.camera) this.camera.shake(1.1 + enemy.tier * 0.9);
      }
      if (this.collision.checkEnemyReachedBottom(enemy, GAME_CONFIG.LOGICAL_HEIGHT - 30)) {
        enemy.alive = false;
        let damage = 8 + enemy.tier * 6;
        if (player.shieldHp > 0) { const a = Math.min(player.shieldHp, damage); player.shieldHp -= a; damage -= a; this.particles.emit(player.x, player.y, 0x4488ff, 6, 3); }
        if (damage > 0 && player.invincible <= 0) {
          player.hp -= damage; player.invincible = 30;
          this.particles.emit(player.x, player.y, 0xff0000, 10, 4);
          audioEngine.sfx?.play('damage');
          if (this.camera) this.camera.shake(2.8);
        }
      }
    }

    // Item deaths
    for (const item of entities.items) {
      if (!item.alive) continue;
      if (item.hp <= 0) {
        item.alive = false;
        this.applyEffect(player, item.effect, item.duration, entities);
        this.score += item.value;
        this.particles.emit(item.x, item.y, item.color, 15, 5);
        this.particles.emit(item.x, item.y, 0xffffff, 5, 3);
        audioEngine.sfx?.play('itemBreak');
        if (this.camera) this.camera.shake(1.2 + item.tier * 0.35);
      }
      if (item.y > GAME_CONFIG.LOGICAL_HEIGHT + 30) item.alive = false;
    }
  }

  private updateDrone(player: PlayerEntity): void {
    this.droneAngle += 0.05;
    this.droneFireTimer++;
    if (this.droneFireTimer >= GAME_CONFIG.DRONE_FIRE_RATE) {
      this.droneFireTimer = 0;
      const spd = GAME_CONFIG.DRONE_HOMING_SPEED;
      for (let i = 0; i < 2; i++) {
        const angle = this.droneAngle + i * Math.PI;
        const droneX = player.x + Math.cos(angle) * 20;
        const droneY = player.y + Math.sin(angle) * 12 - 10;
        let nearest: EnemyEntity | null = null;
        let nd = Infinity;
        for (const e of this.entities.enemies) {
          if (!e.alive) continue;
          const d = dist(droneX, droneY, e.x, e.y);
          if (d < nd) {
            nd = d;
            nearest = e;
          }
        }
        if (nearest && nd > 0.5) {
          const a = Math.atan2(nearest.y - droneY, nearest.x - droneX);
          this.entities.spawnHomingBullet(
            droneX,
            droneY,
            Math.cos(a) * spd,
            Math.sin(a) * spd,
            GAME_CONFIG.DRONE_HOMING_DAMAGE,
            { tint: 0x55eeff, maxSpeed: spd }
          );
        } else {
          this.entities.spawnHomingBullet(
            droneX,
            droneY,
            0,
            -spd,
            GAME_CONFIG.DRONE_HOMING_DAMAGE,
            { tint: 0x55eeff, maxSpeed: spd }
          );
        }
        this.particles.emit(droneX, droneY, 0x00ccff, 2, 1.5);
      }
    }
  }

  private updateHoming(player: PlayerEntity): void {
    this.homingFireTimer++;
    if (this.homingFireTimer >= GAME_CONFIG.HOMING_FIRE_RATE) {
      this.homingFireTimer = 0;
      let nearest = null; let nd = Infinity;
      for (const e of this.entities.enemies) { if (!e.alive) continue; const d = dist(player.x, player.y, e.x, e.y); if (d < nd) { nd = d; nearest = e; } }
      if (nearest) {
        const a = Math.atan2(nearest.y - player.y, nearest.x - player.x);
        this.entities.spawnHomingBullet(
          player.x,
          player.y - 8,
          Math.cos(a) * GAME_CONFIG.HOMING_SPEED,
          Math.sin(a) * GAME_CONFIG.HOMING_SPEED,
          GAME_CONFIG.HOMING_DAMAGE,
          { maxSpeed: GAME_CONFIG.HOMING_SPEED }
        );
        this.particles.emit(player.x, player.y - 8, 0xff8844, 3, 2);
      }
    }
  }

  private updateHomingBullets(entities: EntityManager): void {
    const steer = GAME_CONFIG.HOMING_TURN_RATE;
    for (const b of entities.homingBullets) {
      if (!b.alive) continue;
      let nearest = null; let nd = Infinity;
      for (const e of entities.enemies) { if (!e.alive) continue; const d = dist(b.x, b.y, e.x, e.y); if (d < nd) { nd = d; nearest = e; } }
      const targetSpd = b.maxSpeed;
      let spd = Math.hypot(b.vx, b.vy);
      if (spd < 0.15) {
        b.vx = 0;
        b.vy = -targetSpd;
        spd = targetSpd;
      }
      if (nearest && nd > 2) {
        const ux = (nearest.x - b.x) / nd;
        const uy = (nearest.y - b.y) / nd;
        const ix = ux * targetSpd;
        const iy = uy * targetSpd;
        let vx = b.vx + (ix - b.vx) * steer;
        let vy = b.vy + (iy - b.vy) * steer;
        const len = Math.hypot(vx, vy);
        if (len > 0.01) {
          vx = (vx / len) * targetSpd;
          vy = (vy / len) * targetSpd;
        }
        b.vx = vx;
        b.vy = vy;
      } else if (nearest && nd > 0.01) {
        const ux = (nearest.x - b.x) / nd;
        const uy = (nearest.y - b.y) / nd;
        b.vx = ux * targetSpd;
        b.vy = uy * targetSpd;
      }
      b.x += b.vx; b.y += b.vy; b.life--;
      if (Math.random() < 0.4) this.particles.emit(b.x, b.y, 0xff8844, 1, 1);
      for (const e of entities.enemies) {
        if (!e.alive) continue;
        if (dist(b.x, b.y, e.x, e.y) < e.size + 4) {
          e.hp -= b.damage; e.flashTimer = 5; b.alive = false;
          this.particles.emit(b.x, b.y, 0xff8844, 6, 3);
          audioEngine.sfx?.play('hit'); this.combo++; this.comboTimer = 90;
          if (this.camera) this.camera.shake(0.55); break;
        }
      }
      if (b.life <= 0 || b.x < -20 || b.x > GAME_CONFIG.LOGICAL_WIDTH + 20 || b.y < -20 || b.y > GAME_CONFIG.LOGICAL_HEIGHT + 20) b.alive = false;
    }
    entities.cleanupHomingBullets();
  }

  private fireBullets(player: PlayerEntity): void {
    const pierce = this.hasEffect(player, 'pierce');
    const dmg = this.getMainBulletDamage(player);
    audioEngine.sfx?.play('shoot');
    if (this.hasEffect(player, 'tripleShot')) {
      const spread = this.hasEffect(player, 'fireRate') ? 5 : 3;
      for (let i = -(spread - 1) / 2; i <= (spread - 1) / 2; i++) {
        this.entities.spawnBullet(player.x + i * 5, player.y - GAME_CONFIG.PLAYER_SIZE, i * 0.9, -GAME_CONFIG.BULLET_SPEED, dmg, pierce);
      }
    } else {
      this.entities.spawnBullet(player.x - 3, player.y - GAME_CONFIG.PLAYER_SIZE, 0, -GAME_CONFIG.BULLET_SPEED, dmg, pierce);
      this.entities.spawnBullet(player.x + 3, player.y - GAME_CONFIG.PLAYER_SIZE, 0, -GAME_CONFIG.BULLET_SPEED, dmg, pierce);
    }
  }

  private getMainBulletDamage(player: PlayerEntity): number {
    let d: number = GAME_CONFIG.BULLET_DAMAGE;
    if (this.hasEffect(player, 'homing')) {
      d = Math.floor(d * GAME_CONFIG.HOMING_MAIN_BULLET_DAMAGE_MULT);
    }
    return Math.max(1, d);
  }

  private getLaserBeamXs(player: PlayerEntity): number[] {
    const margin = 6;
    const w = GAME_CONFIG.LOGICAL_WIDTH;
    if (!this.hasEffect(player, 'tripleShot')) {
      return [clamp(player.x, margin, w - margin)];
    }
    const n = this.hasEffect(player, 'fireRate') ? 5 : 3;
    const spread = GAME_CONFIG.LASER_BEAM_SPREAD;
    const xs: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i - (n - 1) / 2) * spread;
      xs.push(clamp(player.x + t, margin, w - margin));
    }
    return xs;
  }

  private fireLaserVolley(player: PlayerEntity, entities: EntityManager, frame: number): void {
    const hw = GAME_CONFIG.LASER_COLUMN_HALF_WIDTH;
    const dpb = GAME_CONFIG.LASER_DAMAGE_PER_BEAM;
    const beams = this.getLaserBeamXs(player);

    for (const enemy of entities.enemies) {
      if (!enemy.alive) continue;
      let beamHits = 0;
      for (const bx of beams) {
        if (Math.abs(enemy.x - bx) < hw + enemy.size * 0.55) beamHits++;
      }
      if (beamHits > 0) {
        enemy.hp -= dpb * beamHits;
        enemy.flashTimer = 6;
        if (frame % 2 === 0) this.particles.emit(enemy.x + rand(-4, 4), enemy.y, 0xff44ff, 3, 2);
      }
    }

    for (const item of entities.items) {
      if (!item.alive) continue;
      let beamHits = 0;
      for (const bx of beams) {
        if (Math.abs(item.x - bx) < hw + item.size * 0.6) beamHits++;
      }
      if (beamHits > 0) {
        item.hp -= dpb * beamHits * 0.88;
        item.flashTimer = 4;
      }
    }

    for (const bx of beams) {
      for (let ty = 8; ty < GAME_CONFIG.LOGICAL_HEIGHT; ty += 16) {
        this.particles.emit(bx + rand(-1, 1), ty, 0xffaaee, 1, 1.2);
      }
    }
    audioEngine.sfx?.play('laser');
  }

  private applyEffect(player: PlayerEntity, effect: EffectType, duration: number, entities: EntityManager): void {
    player.effects = player.effects.filter(e => e.type !== effect);
    if (effect === 'nuke') {
      audioEngine.sfx?.play('nuke');
      for (const e of entities.enemies) {
        if (!e.alive) continue;
        if (e.tier >= 3) {
          const cut = e.maxHp * 0.42;
          e.hp -= cut;
          e.flashTimer = 12;
          this.particles.emit(e.x, e.y, 0xff4400, 14, 5);
          this.particles.emit(e.x, e.y, 0xffffff, 6, 3);
          this.score += Math.floor(e.score * 0.35);
        } else {
          e.alive = false;
          this.score += e.score * 2;
          this.particles.emit(e.x, e.y, 0xff4400, 20, 6);
          this.particles.emit(e.x, e.y, 0xffffff, 8, 4);
        }
      }
      if (this.camera) this.camera.shake(9);
      this.particles.emit(GAME_CONFIG.LOGICAL_WIDTH / 2, GAME_CONFIG.LOGICAL_HEIGHT / 2, 0xffffff, 30, 8);
    } else if (effect === 'shield') { player.shieldHp = 60; audioEngine.sfx?.play('powerup');
    } else if (effect === 'laser') {
      player.effects.push({ type: effect, timer: duration });
      this.laserCooldown = 0;
      audioEngine.sfx?.play('laser');
    } else if (effect === 'drone') { player.effects.push({ type: effect, timer: duration }); this.droneFireTimer = 0; audioEngine.sfx?.play('powerup');
    } else if (effect === 'homing') { player.effects.push({ type: effect, timer: duration }); this.homingFireTimer = 0; audioEngine.sfx?.play('powerup');
    } else { player.effects.push({ type: effect, timer: duration }); audioEngine.sfx?.play('powerup'); }
  }

  private getFireRate(player: PlayerEntity): number {
    let rate: number = GAME_CONFIG.BASE_FIRE_RATE;
    if (this.hasEffect(player, 'fireRate')) rate = Math.floor(rate * 0.35);
    return Math.max(2, rate);
  }

  private hasEffect(player: PlayerEntity, type: EffectType): boolean {
    return player.effects.some(e => e.type === type);
  }
}
