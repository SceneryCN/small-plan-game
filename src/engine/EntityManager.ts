import { Container, Sprite } from 'pixi.js';
import type { SpriteAtlas } from '../sprites/SpriteFactory';
import type { PlayerEntity, BulletEntity, EnemyEntity, ItemEntity, HomingBulletEntity } from '../entities/Entity';
import { GAME_CONFIG } from '../config/gameConfig';
import { rand, randInt } from '../utils/math';

export class EntityManager {
  private stage: Container;
  private atlas: SpriteAtlas;

  public player: PlayerEntity | null = null;
  public playerSprite: Sprite | null = null;
  public engineSprite: Sprite | null = null;

  public bullets: BulletEntity[] = [];
  public bulletSprites: Sprite[] = [];

  public enemies: EnemyEntity[] = [];
  public enemySprites: Sprite[] = [];

  public items: ItemEntity[] = [];
  public itemSprites: Sprite[] = [];

  public homingBullets: HomingBulletEntity[] = [];
  public homingBulletSprites: Sprite[] = [];

  constructor(stage: Container, atlas: SpriteAtlas) {
    this.stage = stage;
    this.atlas = atlas;
  }

  spawnPlayer(x: number, y: number): void {
    this.player = {
      x, y, targetX: x,
      hp: GAME_CONFIG.PLAYER_MAX_HP,
      maxHp: GAME_CONFIG.PLAYER_MAX_HP,
      shieldHp: 0,
      fireTimer: 0,
      invincible: 0,
      effects: [],
    };

    this.playerSprite = new Sprite(this.atlas.player);
    this.playerSprite.anchor.set(0.5, 0.5);
    this.playerSprite.x = x;
    this.playerSprite.y = y;
    this.stage.addChild(this.playerSprite);

    this.engineSprite = new Sprite(this.atlas.playerEngine);
    this.engineSprite.anchor.set(0.5, 0);
    this.engineSprite.x = x;
    this.engineSprite.y = y + 6;
    this.stage.addChild(this.engineSprite);
  }

  spawnBullet(x: number, y: number, vx: number, vy: number, damage: number, pierce: boolean): void {
    const bullet: BulletEntity = { x, y, vx, vy, damage, pierce, alive: true };
    this.bullets.push(bullet);

    const sprite = new Sprite(pierce ? this.atlas.bullets.pierce : this.atlas.bullets.normal);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    this.bulletSprites.push(sprite);
    this.stage.addChild(sprite);
  }

  spawnEnemy(tier: number, opts?: { hpMult?: number; speedMult?: number }): void {
    const pool = GAME_CONFIG.ENEMY_TYPES.filter(e => e.tier === tier);
    const config = pool[randInt(0, Math.max(0, pool.length - 1))] ?? GAME_CONFIG.ENEMY_TYPES[0];
    const dividerX = GAME_CONFIG.LOGICAL_WIDTH * GAME_CONFIG.DIVIDER_RATIO;
    const margin = 20;
    const x = rand(dividerX + margin, GAME_CONFIG.LOGICAL_WIDTH - margin);

    const hpMult = opts?.hpMult ?? 1;
    const speedMult = opts?.speedMult ?? 1;
    const hp = Math.round(config.hp * hpMult);
    const elite = hpMult > 1.35;

    const enemy: EnemyEntity = {
      x,
      y: -20,
      hp,
      maxHp: hp,
      size: config.size,
      speed: config.speed * speedMult,
      score: Math.round(config.score * (elite ? 1.25 : 1)),
      color: elite ? 0xff66ee : config.color,
      tier: config.tier,
      elite,
      wobble: rand(0, Math.PI * 2),
      flashTimer: 0,
      alive: true,
    };
    this.enemies.push(enemy);

    const texKey = Math.min(tier, 4) as 1 | 2 | 3 | 4;
    const sprite = new Sprite(this.atlas.enemies[texKey]);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = -20;
    this.enemySprites.push(sprite);
    this.stage.addChild(sprite);
  }

  spawnItem(tier: number): void {
    const pool = GAME_CONFIG.ITEM_TYPES.filter(i => i.tier === tier);
    const config = pool[randInt(0, Math.max(0, pool.length - 1))] ?? GAME_CONFIG.ITEM_TYPES[0];
    const dividerX = GAME_CONFIG.LOGICAL_WIDTH * GAME_CONFIG.DIVIDER_RATIO;
    const margin = 20;
    const x = rand(margin, dividerX - margin);

    const item: ItemEntity = {
      x,
      y: -20,
      hp: config.hp,
      maxHp: config.hp,
      size: 8 + config.tier * 4,
      effect: config.effect,
      duration: config.duration,
      value: config.value,
      color: config.color,
      tier: config.tier,
      flashTimer: 0,
      alive: true,
    };
    this.items.push(item);

    const sprite = new Sprite(this.atlas.items[config.effect]);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = -20;
    this.itemSprites.push(sprite);
    this.stage.addChild(sprite);
  }

  spawnHomingBullet(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    options?: { tint?: number; life?: number; maxSpeed?: number }
  ): void {
    const tint = options?.tint ?? 0xff8844;
    const life = options?.life ?? 180;
    const spd0 = Math.hypot(vx, vy);
    const maxSpeed = options?.maxSpeed ?? (spd0 > 0.01 ? spd0 : GAME_CONFIG.HOMING_SPEED);
    const homing: HomingBulletEntity = { x, y, vx, vy, damage, life, alive: true, tint, maxSpeed };
    this.homingBullets.push(homing);

    const sprite = new Sprite(this.atlas.bullets.pierce);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.tint = tint;
    this.homingBulletSprites.push(sprite);
    this.stage.addChild(sprite);
  }

  cleanupHomingBullets(): void {
    for (let i = this.homingBullets.length - 1; i >= 0; i--) {
      if (!this.homingBullets[i].alive) {
        this.homingBullets.splice(i, 1);
        const sprite = this.homingBulletSprites.splice(i, 1)[0];
        this.stage.removeChild(sprite);
        sprite.destroy();
      }
    }
  }

  cleanup(): void {
    // Remove dead bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.alive || b.y < -10 || b.x < -10 || b.x > GAME_CONFIG.LOGICAL_WIDTH + 10) {
        this.bullets.splice(i, 1);
        const sprite = this.bulletSprites.splice(i, 1)[0];
        this.stage.removeChild(sprite);
        sprite.destroy();
      }
    }

    // Remove dead enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].alive) {
        this.enemies.splice(i, 1);
        const sprite = this.enemySprites.splice(i, 1)[0];
        this.stage.removeChild(sprite);
        sprite.destroy();
      }
    }

    // Remove dead items
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].alive) {
        this.items.splice(i, 1);
        const sprite = this.itemSprites.splice(i, 1)[0];
        this.stage.removeChild(sprite);
        sprite.destroy();
      }
    }
  }

  syncVisuals(): void {
    if (this.player && this.playerSprite && this.engineSprite) {
      this.playerSprite.x = this.player.x;
      this.playerSprite.y = this.player.y;
      this.playerSprite.alpha = this.player.invincible > 0 ? 0.5 : 1;
      this.engineSprite.x = this.player.x;
      this.engineSprite.y = this.player.y + 6;
    }

    for (let i = 0; i < this.bullets.length; i++) {
      this.bulletSprites[i].x = this.bullets[i].x;
      this.bulletSprites[i].y = this.bullets[i].y;
    }

    for (let i = 0; i < this.enemies.length; i++) {
      this.enemySprites[i].x = this.enemies[i].x;
      this.enemySprites[i].y = this.enemies[i].y;
      this.enemySprites[i].tint = this.enemies[i].flashTimer > 0 ? 0xffffff : this.enemies[i].color;
      // Pulsing scale for bosses
      if (this.enemies[i].tier >= 3) {
        const pulse = 1.0 + Math.sin(this.enemies[i].wobble * 2) * 0.05;
        this.enemySprites[i].scale.set(pulse);
      } else if (this.enemies[i].elite) {
        this.enemySprites[i].scale.set(1.08);
      } else {
        this.enemySprites[i].scale.set(1);
      }
    }

    for (let i = 0; i < this.items.length; i++) {
      this.itemSprites[i].x = this.items[i].x;
      this.itemSprites[i].y = this.items[i].y;
      this.itemSprites[i].tint = this.items[i].flashTimer > 0 ? 0xffffff : this.items[i].color;
    }

    for (let i = 0; i < this.homingBullets.length; i++) {
      this.homingBulletSprites[i].x = this.homingBullets[i].x;
      this.homingBulletSprites[i].y = this.homingBullets[i].y;
      const h = this.homingBullets[i];
      this.homingBulletSprites[i].tint = h.tint;
      this.homingBulletSprites[i].rotation = Math.atan2(h.vy, h.vx) + Math.PI / 2;
    }
  }

  reset(): void {
    this.bulletSprites.forEach(s => { this.stage.removeChild(s); s.destroy(); });
    this.enemySprites.forEach(s => { this.stage.removeChild(s); s.destroy(); });
    this.itemSprites.forEach(s => { this.stage.removeChild(s); s.destroy(); });
    this.homingBulletSprites.forEach(s => { this.stage.removeChild(s); s.destroy(); });
    if (this.playerSprite) { this.stage.removeChild(this.playerSprite); this.playerSprite.destroy(); }
    if (this.engineSprite) { this.stage.removeChild(this.engineSprite); this.engineSprite.destroy(); }

    this.player = null;
    this.playerSprite = null;
    this.engineSprite = null;
    this.bullets = [];
    this.bulletSprites = [];
    this.enemies = [];
    this.enemySprites = [];
    this.items = [];
    this.itemSprites = [];
    this.homingBullets = [];
    this.homingBulletSprites = [];
  }
}
