import type { PlayerEntity, EnemyEntity } from '../entities/Entity';
import { GAME_CONFIG } from '../config/gameConfig';
import type { EffectType } from '../config/gameConfig';
import type { EntityManager } from '../engine/EntityManager';
import type { ParticleSystem } from '../engine/ParticleSystem';
import type { CollisionSystem } from '../engine/CollisionSystem';
import type { Camera } from '../engine/Camera';
import { audioEngine } from '../audio/AudioEngine';
import { rand, dist, clamp, randInt } from '../utils/math';
import { createPlayerPowerupSnapshot, type PlayerPowerupSnapshot } from '../game/playerPowerupSnapshot';
import { tryApplyInstantPickupEffect } from '../game/instantPickupEffects';

export class CombatSystem {
  private entities: EntityManager;
  private particles: ParticleSystem;
  private collision: CollisionSystem;
  private camera: Camera | null = null;

  public score = 0;
  public combo = 0;
  public comboTimer = 0;
  private droneFireTimer = 0;
  private homingFireTimer = 0;
  /** 激光：蓄力环 → 单帧向上光柱 → 短冷却 → 循环 */
  private laserPhase: 'charging' | 'pulse' | 'cooldown' = 'charging';
  private laserPhaseFrame = 0;

  constructor(entities: EntityManager, particles: ParticleSystem, collision: CollisionSystem) {
    this.entities = entities;
    this.particles = particles;
    this.collision = collision;
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.droneFireTimer = 0;
    this.homingFireTimer = 0;
    this.laserPhase = 'charging';
    this.laserPhaseFrame = 0;
  }

  update(player: PlayerEntity, entities: EntityManager, frame: number, wave: number): void {
    const fx = createPlayerPowerupSnapshot(player);

    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    if (player.invincible > 0) player.invincible--;

    this.tickEnemyShooters(player, entities, wave);
    this.updateMegaBossLasers(player, entities, frame);
    this.resolveEnemyBulletPlayerHits(player, entities);

    player.fireTimer++;
    const fireRate = this.getFireRate(fx);
    if (player.fireTimer >= fireRate) {
      player.fireTimer = 0;
      this.fireBullets(player, fx);
    }

    if (fx.hasDrone) this.updateDrone(player, fx);
    if (fx.has('homing')) this.updateHoming(player, fx);

    if (!fx.has('laser')) {
      this.laserPhase = 'charging';
      this.laserPhaseFrame = 0;
    } else if (this.laserPhase === 'charging') {
      this.particles.emitLaserChargeRing(
        player.x,
        player.y,
        this.laserPhaseFrame,
        GAME_CONFIG.LASER_CHARGE_FRAMES
      );
      this.laserPhaseFrame++;
      if (this.laserPhaseFrame >= GAME_CONFIG.LASER_CHARGE_FRAMES) {
        this.laserPhase = 'pulse';
        this.laserPhaseFrame = 0;
      }
    } else if (this.laserPhase === 'pulse') {
      this.applyLaserPulseDamage(player, entities, fx);
      this.particles.emitLaserVerticalPulse(this.getLaserBeamXs(player, fx), player.y);
      audioEngine.sfx?.play('laser');
      this.laserPhase = 'cooldown';
      this.laserPhaseFrame = 0;
    } else {
      this.laserPhaseFrame++;
      if (this.laserPhaseFrame >= GAME_CONFIG.LASER_POST_BURST_COOLDOWN_FRAMES) {
        this.laserPhase = 'charging';
        this.laserPhaseFrame = 0;
      }
    }

    this.resolveBulletEnemyHits(entities);
    this.resolveBulletItemHits(entities);
    this.updateHomingBullets(entities);
    this.resolveEnemyDeathsAndLeaks(player, entities);
    this.resolveArmorContact(player, entities);
    this.resolveItemLifecycle(player, entities);
  }

  private tickEnemyShooters(player: PlayerEntity, entities: EntityManager, wave: number): void {
    const sp = GAME_CONFIG.ENEMY_BULLET_SPEED;
    const waveCd = Math.max(0, Math.min(22, Math.floor(wave * 0.35)));
    for (const e of entities.enemies) {
      if (!e.alive || !e.canShoot) continue;
      e.shootCd--;
      if (e.shootCd > 0) continue;
      e.shootCd = Math.max(32, randInt(55, 115) + (4 - Math.min(e.tier, 4)) * 14 - waveCd);
      const ox = e.x;
      const oy = e.y + e.size * 0.35;
      const dx = player.x - ox;
      const dy = player.y - oy;
      const len = Math.hypot(dx, dy) || 1;
      entities.spawnEnemyBullet(ox, oy, (dx / len) * sp, (dy / len) * sp);
    }
  }

  private updateMegaBossLasers(player: PlayerEntity, entities: EntityManager, frame: number): void {
    const CH = GAME_CONFIG.MEGA_LASER_CHARGE_FRAMES;
    const BD = GAME_CONFIG.MEGA_LASER_BEAM_FRAMES;
    const maxW = GAME_CONFIG.MEGA_LASER_MAX_HALF_WIDTH;
    for (const e of entities.enemies) {
      if (!e.alive || e.tier !== 4) continue;
      let phase = e.megaLaserPhase ?? 'charging';
      let fr = e.megaLaserFrame ?? 0;
      if (phase === 'charging') {
        this.particles.emitMegaBossLaserRing(e.x, e.y + e.size * 0.12, fr, CH);
        fr++;
        if (fr >= CH) {
          phase = 'beam';
          fr = 0;
          audioEngine.sfx?.play('laser');
        }
      } else {
        const t = BD <= 1 ? 0 : fr / (BD - 1);
        const hw = maxW * (1 - t);
        this.applyMegaBossLaserPlayerHit(player, e, hw);
        if (fr % 2 === 0 || hw > 3.5) {
          this.particles.emitMegaBossDownLaser([e.x], e.y + e.size * 0.28, frame, hw, maxW);
        }
        fr++;
        if (fr >= BD) {
          phase = 'charging';
          fr = 0;
        }
      }
      e.megaLaserPhase = phase;
      e.megaLaserFrame = fr;
    }
  }

  private applyMegaBossLaserPlayerHit(player: PlayerEntity, boss: EnemyEntity, halfWidth: number): void {
    const hw = Math.max(0.5, halfWidth);
    const beamTop = boss.y + boss.size * 0.12;
    if (player.y < beamTop - 10) return;
    if (Math.abs(player.x - boss.x) >= hw + GAME_CONFIG.PLAYER_CORE_RADIUS) return;
    if (player.invincible > 0) return;
    let damage = GAME_CONFIG.MEGA_LASER_PLAYER_DAMAGE_PER_TICK;
    if (player.shieldHp > 0) {
      const absorbed = Math.min(player.shieldHp, damage);
      player.shieldHp -= absorbed;
      damage -= absorbed;
      this.particles.emit(player.x, player.y, 0x4488ff, 4, 2);
    }
    if (damage > 0) {
      player.hp -= damage;
      player.invincible = GAME_CONFIG.MEGA_LASER_PLAYER_HIT_INVINC;
      this.particles.emit(player.x, player.y, 0xff4488, 8, 3);
      audioEngine.sfx?.play('damage');
      if (this.camera) this.camera.shake(1.1);
    }
  }

  private resolveEnemyBulletPlayerHits(player: PlayerEntity, entities: EntityManager): void {
    for (const b of entities.enemyBullets) {
      if (!b.alive) continue;
      if (!this.collision.checkEnemyBulletPlayerCore(b, player)) continue;
      b.alive = false;
      if (player.invincible > 0) continue;
      let damage = GAME_CONFIG.ENEMY_BULLET_DAMAGE;
      if (player.shieldHp > 0) {
        const absorbed = Math.min(player.shieldHp, damage);
        player.shieldHp -= absorbed;
        damage -= absorbed;
        this.particles.emit(player.x, player.y, 0x4488ff, 5, 2.5);
      }
      if (damage > 0) {
        player.hp -= damage;
        player.invincible = 30;
        this.particles.emit(player.x, player.y, 0xff2222, 12, 4);
        audioEngine.sfx?.play('damage');
        if (this.camera) this.camera.shake(2);
      }
    }
  }

  /** 子弹命中敌怪 */
  private resolveBulletEnemyHits(entities: EntityManager): void {
    for (const bullet of entities.bullets) {
      if (!bullet.alive) continue;
      for (const enemy of entities.enemies) {
        if (!enemy.alive) continue;
        if (!this.collision.checkBulletEnemy(bullet, enemy)) continue;
        enemy.hp -= bullet.damage;
        enemy.flashTimer = 4;
        if (!bullet.pierce) bullet.alive = false;
        this.particles.emit(bullet.x, bullet.y, 0xffaa00, 4, 3);
        this.particles.emit(bullet.x, bullet.y, 0xffffff, 2, 2);
        if (enemy.tier >= 3) audioEngine.sfx?.play('bossHit');
        else audioEngine.sfx?.play('hit');
        this.combo++;
        this.comboTimer = 90;
        if (this.combo >= 3 && this.combo % 3 === 0) audioEngine.sfx?.play('combo', { combo: this.combo });
        if (this.camera) this.camera.shake(0.45 + (enemy.tier >= 3 ? 0.35 : 0));
      }
    }
  }

  /** 子弹命中左侧道具 */
  private resolveBulletItemHits(entities: EntityManager): void {
    for (const bullet of entities.bullets) {
      if (!bullet.alive) continue;
      for (const item of entities.items) {
        if (!item.alive) continue;
        if (!this.collision.checkBulletItem(bullet, item)) continue;
        item.hp -= bullet.damage;
        item.flashTimer = 4;
        if (!bullet.pierce) bullet.alive = false;
        this.particles.emit(bullet.x, bullet.y, item.color, 3, 2);
        audioEngine.sfx?.play('hit');
      }
    }
  }

  /** 敌怪阵亡与漏到底线 */
  private resolveEnemyDeathsAndLeaks(player: PlayerEntity, entities: EntityManager): void {
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
          this.particles.emit(enemy.x, enemy.y, 0xff4400, pc * 2, ps * 1.5);
          this.particles.emit(enemy.x, enemy.y, 0xff8800, pc, ps * 1.2);
        } else {
          audioEngine.sfx?.play('kill');
        }
        if (this.camera) this.camera.shake(1.1 + enemy.tier * 0.9);
        continue;
      }
      if (this.collision.checkEnemyReachedBottom(enemy, GAME_CONFIG.LOGICAL_HEIGHT - 30)) {
        enemy.alive = false;
        let damage = 8 + enemy.tier * 6;
        if (player.shieldHp > 0) {
          const absorbed = Math.min(player.shieldHp, damage);
          player.shieldHp -= absorbed;
          damage -= absorbed;
          this.particles.emit(player.x, player.y, 0x4488ff, 6, 3);
        }
        if (damage > 0 && player.invincible <= 0) {
          player.hp -= damage;
          player.invincible = 30;
          this.particles.emit(player.x, player.y, 0xff0000, 10, 4);
          audioEngine.sfx?.play('damage');
          if (this.camera) this.camera.shake(2.8);
        }
      }
    }
  }

  /** 反应装甲与敌怪贴身一次即碎裂 */
  private resolveArmorContact(player: PlayerEntity, entities: EntityManager): void {
    if (!player.armorActive) return;
    for (const enemy of entities.enemies) {
      if (!enemy.alive) continue;
      if (!this.collision.checkPlayerEnemyBodyOverlap(player, enemy)) continue;
      player.armorActive = false;
      this.particles.emit(player.x, player.y, 0x99aabb, 14, 4);
      this.particles.emit(player.x, player.y, 0xffffff, 6, 2);
      audioEngine.sfx?.play('armorBreak');
      if (this.camera) this.camera.shake(1.2);
      break;
    }
  }

  /** 道具被击碎、落出屏幕 */
  private resolveItemLifecycle(player: PlayerEntity, entities: EntityManager): void {
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

  private updateDrone(player: PlayerEntity, fx: PlayerPowerupSnapshot): void {
    this.droneFireTimer++;
    if (this.droneFireTimer < GAME_CONFIG.DRONE_FIRE_RATE) return;
    this.droneFireTimer = 0;
    const spd = GAME_CONFIG.DRONE_HOMING_SPEED;
    const n =
      GAME_CONFIG.DRONE_BASE_STREAMS + (fx.has('tripleShot') ? GAME_CONFIG.TRIPLE_EXTRA_STREAMS : 0);
    const slotSpan = n <= 2 ? 15 : 8;
    for (let i = 0; i < n; i++) {
      const slot = i - (n - 1) / 2;
      const droneX = player.x + slot * slotSpan;
      const droneY = player.y - 2 + (i % 2) * 1.5;
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
          { tint: 0x55eeff, maxSpeed: spd, spriteKind: 'drone' }
        );
      } else {
        this.entities.spawnHomingBullet(droneX, droneY, 0, -spd, GAME_CONFIG.DRONE_HOMING_DAMAGE, {
          tint: 0x55eeff,
          maxSpeed: spd,
          spriteKind: 'drone',
        });
      }
      this.particles.emit(droneX, droneY, 0x00ccff, 2, 1.5);
    }
    audioEngine.sfx?.play('shootDrone');
  }

  private updateHoming(player: PlayerEntity, fx: PlayerPowerupSnapshot): void {
    this.homingFireTimer++;
    if (this.homingFireTimer < GAME_CONFIG.HOMING_FIRE_RATE) return;
    this.homingFireTimer = 0;
    const n =
      GAME_CONFIG.HOMING_BASE_STREAMS + (fx.has('tripleShot') ? GAME_CONFIG.TRIPLE_EXTRA_STREAMS : 0);
    const spd = GAME_CONFIG.HOMING_SPEED;
    audioEngine.sfx?.play('shootHoming');
    for (let i = 0; i < n; i++) {
      const slot = i - (n - 1) / 2;
      const droneX = player.x + slot * 6;
      const droneY = player.y - 3 + (i % 2) * 2;
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
          GAME_CONFIG.HOMING_DAMAGE,
          { tint: 0xff8844, maxSpeed: spd, spriteKind: 'playerCrescent' }
        );
      } else {
        this.entities.spawnHomingBullet(droneX, droneY, 0, -spd, GAME_CONFIG.HOMING_DAMAGE, {
          tint: 0xff8844,
          maxSpeed: spd,
          spriteKind: 'playerCrescent',
        });
      }
      this.particles.emit(droneX, droneY, 0xff6622, 2, 1.5);
    }
  }

  private updateHomingBullets(entities: EntityManager): void {
    const steer = GAME_CONFIG.HOMING_TURN_RATE;
    for (const b of entities.homingBullets) {
      if (!b.alive) continue;
      let nearest: EnemyEntity | null = null;
      let nd = Infinity;
      for (const e of entities.enemies) {
        if (!e.alive) continue;
        const d = dist(b.x, b.y, e.x, e.y);
        if (d < nd) {
          nd = d;
          nearest = e;
        }
      }
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
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (Math.random() < 0.4) {
        const pc = b.spriteKind === 'playerCrescent' ? 0xff6622 : 0x00ccff;
        this.particles.emit(b.x, b.y, pc, 1, 1);
      }
      for (const e of entities.enemies) {
        if (!e.alive) continue;
        if (dist(b.x, b.y, e.x, e.y) >= e.size + 4) continue;
        e.hp -= b.damage;
        e.flashTimer = 5;
        b.alive = false;
        this.particles.emit(b.x, b.y, b.spriteKind === 'playerCrescent' ? 0xffaa66 : 0x66eeff, 6, 3);
        audioEngine.sfx?.play('hit');
        this.combo++;
        this.comboTimer = 90;
        if (this.camera) this.camera.shake(0.55);
        break;
      }
      if (b.life <= 0 || b.x < -20 || b.x > GAME_CONFIG.LOGICAL_WIDTH + 20 || b.y < -20 || b.y > GAME_CONFIG.LOGICAL_HEIGHT + 20) {
        b.alive = false;
      }
    }
    entities.cleanupHomingBullets();
  }

  private fireBullets(player: PlayerEntity, fx: PlayerPowerupSnapshot): void {
    const pierce = fx.has('pierce');
    const dmg = this.getMainBulletDamage();
    audioEngine.sfx?.play(pierce ? 'shootPierce' : 'shoot');
    if (fx.has('tripleShot')) {
      const total = GAME_CONFIG.MAIN_BULLET_BASE_STREAMS + GAME_CONFIG.TRIPLE_EXTRA_STREAMS;
      const spacing = 5;
      for (let i = 0; i < total; i++) {
        const slot = i - (total - 1) / 2;
        const ox = slot * spacing;
        this.entities.spawnBullet(
          player.x + ox,
          player.y - GAME_CONFIG.PLAYER_SIZE,
          slot * 0.38,
          -GAME_CONFIG.BULLET_SPEED,
          dmg,
          pierce
        );
      }
    } else {
      this.entities.spawnBullet(player.x - 3, player.y - GAME_CONFIG.PLAYER_SIZE, 0, -GAME_CONFIG.BULLET_SPEED, dmg, pierce);
      this.entities.spawnBullet(player.x + 3, player.y - GAME_CONFIG.PLAYER_SIZE, 0, -GAME_CONFIG.BULLET_SPEED, dmg, pierce);
    }
  }

  private getMainBulletDamage(): number {
    return Math.max(1, GAME_CONFIG.BULLET_DAMAGE);
  }

  private getLaserBeamXs(player: PlayerEntity, fx: PlayerPowerupSnapshot): number[] {
    const margin = 6;
    const w = GAME_CONFIG.LOGICAL_WIDTH;
    const n =
      GAME_CONFIG.LASER_BASE_BEAM_COUNT + (fx.has('tripleShot') ? GAME_CONFIG.TRIPLE_EXTRA_STREAMS : 0);
    const spread = GAME_CONFIG.LASER_BEAM_SPREAD;
    const xs: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i - (n - 1) / 2) * spread;
      xs.push(clamp(player.x + t, margin, w - margin));
    }
    return xs;
  }

  /** 单次向上光柱：固定半宽、整段伤害一次结算 */
  private applyLaserPulseDamage(player: PlayerEntity, entities: EntityManager, fx: PlayerPowerupSnapshot): void {
    const hw = Math.max(0.45, GAME_CONFIG.LASER_MAX_HALF_WIDTH);
    const dmg = GAME_CONFIG.LASER_DAMAGE_PER_BEAM;
    const beams = this.getLaserBeamXs(player, fx);

    for (const enemy of entities.enemies) {
      if (!enemy.alive) continue;
      let beamHits = 0;
      for (const bx of beams) {
        if (Math.abs(enemy.x - bx) < hw + enemy.size * 0.55) beamHits++;
      }
      if (beamHits <= 0) continue;
      enemy.hp -= dmg * beamHits;
      enemy.flashTimer = 6;
      this.particles.emitDirected(enemy.x + rand(-3, 3), enemy.y, rand(-0.4, 0.4), rand(-1.2, 1.2), 0xffccff, 14);
      this.particles.emitDirected(enemy.x, enemy.y, rand(-0.6, 0.6), rand(-1.5, 0.5), 0xffffff, 10);
    }

    for (const item of entities.items) {
      if (!item.alive) continue;
      let beamHits = 0;
      for (const bx of beams) {
        if (Math.abs(item.x - bx) < hw + item.size * 0.6) beamHits++;
      }
      if (beamHits <= 0) continue;
      item.hp -= dmg * beamHits * 0.88;
      item.flashTimer = 4;
    }
  }

  private applyEffect(player: PlayerEntity, effect: EffectType, duration: number, entities: EntityManager): void {
    if (tryApplyInstantPickupEffect(effect, player)) {
      if (effect === 'heal') {
        audioEngine.sfx?.play('heal');
        return;
      }
      if (effect === 'armor') {
        this.droneFireTimer = 0;
        audioEngine.sfx?.play('powerup');
        return;
      }
    }

    player.effects = player.effects.filter(e => e.type !== effect);

    if (effect === 'nuke') {
      audioEngine.sfx?.play('nuke');
      for (const eb of entities.enemyBullets) eb.alive = false;
      for (const e of entities.enemies) {
        if (!e.alive) continue;
        if (e.tier === 3) {
          e.hp -= e.maxHp * 0.5;
          e.flashTimer = 12;
          this.particles.emit(e.x, e.y, 0xff4400, 14, 5);
          this.particles.emit(e.x, e.y, 0xffffff, 6, 3);
          this.score += Math.floor(e.score * 0.35);
        } else if (e.tier >= 4) {
          e.hp -= e.maxHp / 3;
          e.flashTimer = 12;
          this.particles.emit(e.x, e.y, 0xff6600, 18, 5);
          this.particles.emit(e.x, e.y, 0xffffff, 8, 3);
          this.score += Math.floor(e.score * 0.28);
        } else {
          e.alive = false;
          this.score += e.score * 2;
          this.particles.emit(e.x, e.y, 0xff4400, 20, 6);
          this.particles.emit(e.x, e.y, 0xffffff, 8, 4);
        }
      }
      if (this.camera) this.camera.shake(9);
      this.particles.emit(GAME_CONFIG.LOGICAL_WIDTH / 2, GAME_CONFIG.LOGICAL_HEIGHT / 2, 0xffffff, 30, 8);
      return;
    }

    if (effect === 'shield') {
      player.shieldHp = 60;
      audioEngine.sfx?.play('powerup');
      return;
    }
    if (effect === 'laser') {
      player.effects.push({ type: effect, timer: duration });
      this.laserPhase = 'charging';
      this.laserPhaseFrame = 0;
      audioEngine.sfx?.play('powerup');
      return;
    }
    if (effect === 'drone') {
      player.effects.push({ type: effect, timer: duration });
      this.droneFireTimer = 0;
      audioEngine.sfx?.play('powerup');
      return;
    }
    if (effect === 'homing') {
      player.effects.push({ type: effect, timer: duration });
      this.homingFireTimer = 0;
      audioEngine.sfx?.play('powerup');
      return;
    }

    player.effects.push({ type: effect, timer: duration });
    audioEngine.sfx?.play('powerup');
  }

  private getFireRate(fx: PlayerPowerupSnapshot): number {
    let rate: number = GAME_CONFIG.BASE_FIRE_RATE;
    if (fx.has('fireRate')) rate = Math.floor(rate * 0.28);
    return Math.max(2, rate);
  }
}
