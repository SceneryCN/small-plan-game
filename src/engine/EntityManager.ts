import { Container, Sprite, Text } from 'pixi.js';
import type { SpriteAtlas } from '../sprites/SpriteFactory';
import type { PlayerEntity, BulletEntity, EnemyEntity, ItemEntity, HomingBulletEntity, EnemyBulletEntity } from '../entities/Entity';
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
  public enemySprites: Container[] = [];

  public items: ItemEntity[] = [];
  public itemSprites: Sprite[] = [];

  public homingBullets: HomingBulletEntity[] = [];
  public homingBulletSprites: Sprite[] = [];

  public enemyBullets: EnemyBulletEntity[] = [];
  public enemyBulletSprites: Sprite[] = [];

  constructor(stage: Container, atlas: SpriteAtlas) {
    this.stage = stage;
    this.atlas = atlas;
  }

  spawnPlayer(x: number, y: number): void {
    this.player = {
      x,
      y,
      targetX: x,
      targetY: y,
      hp: GAME_CONFIG.PLAYER_MAX_HP,
      maxHp: GAME_CONFIG.PLAYER_MAX_HP,
      shieldHp: 0,
      fireTimer: 0,
      invincible: 0,
      effects: [],
      armorActive: false,
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

  private rollEnemyShooter(tier: number, wave: number): boolean {
    if (tier < 2) return false;
    if (tier >= 4) return false;
    if (tier === 3) {
      const p = Math.min(
        GAME_CONFIG.ENEMY_SHOOTER_T3_CAP,
        GAME_CONFIG.ENEMY_SHOOTER_T3_BASE + wave * GAME_CONFIG.ENEMY_SHOOTER_T3_PER_WAVE
      );
      return Math.random() < p;
    }
    const p = Math.min(
      GAME_CONFIG.ENEMY_SHOOTER_T2_CAP,
      GAME_CONFIG.ENEMY_SHOOTER_T2_BASE + wave * GAME_CONFIG.ENEMY_SHOOTER_T2_PER_WAVE
    );
    return Math.random() < p;
  }

  /** 场上是否有 BOSS（tier3）存活 */
  hasLivingTier3Boss(): boolean {
    return this.enemies.some(e => e.alive && e.tier === 3);
  }

  /** 场上是否有巨型 BOSS（tier4）存活 */
  hasLivingTier4(): boolean {
    return this.enemies.some(e => e.alive && e.tier >= 4);
  }

  /** tier≥3 任意存活（BOSS 战期间不刷小怪） */
  hasLivingMajorBoss(): boolean {
    return this.enemies.some(e => e.alive && e.tier >= 3);
  }

  spawnEnemy(tier: number, opts?: { hpMult?: number; speedMult?: number }, wave = 1): void {
    const pool = GAME_CONFIG.ENEMY_TYPES.filter(e => e.tier === tier);
    const config = pool[randInt(0, Math.max(0, pool.length - 1))] ?? GAME_CONFIG.ENEMY_TYPES[0];
    const dividerX = GAME_CONFIG.LOGICAL_WIDTH * GAME_CONFIG.DIVIDER_RATIO;
    const margin = 20;
    const x = rand(dividerX + margin, GAME_CONFIG.LOGICAL_WIDTH - margin);

    const hpMult = opts?.hpMult ?? 1;
    const speedMult = opts?.speedMult ?? 1;
    const hp = Math.round(config.hp * hpMult);
    const elite = hpMult > 1.35;

    const canShoot = config.tier >= 3 ? false : this.rollEnemyShooter(config.tier, wave);

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
      canShoot,
      shootCd: canShoot ? randInt(52, 120) + (4 - Math.min(config.tier, 4)) * 12 : 99999,
      wobble: rand(0, Math.PI * 2),
      flashTimer: 0,
      alive: true,
      ...(config.tier === 4
        ? { megaLaserPhase: 'charging' as const, megaLaserFrame: 0 }
        : {}),
    };
    this.enemies.push(enemy);

    const texKey = Math.min(tier, 4) as 1 | 2 | 3 | 4;
    const wrap = new Container();
    const body = new Sprite(this.atlas.enemies[texKey]);
    body.anchor.set(0.5, 0.5);
    wrap.addChild(body);

    if (config.tier >= 3) {
      const label = new Text({
        text: config.tier >= 4 ? 'BBOSS' : 'BOSS',
        style: {
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: config.tier >= 4 ? 12 : 11,
          fill: 0xfff5dd,
          stroke: { color: 0x220008, width: 4 },
        },
        textureStyle: { scaleMode: 'nearest' },
      });
      label.anchor.set(0.5, 1);
      label.y = -(config.size * 0.62 + 2);
      wrap.addChild(label);
    }

    wrap.x = x;
    wrap.y = -20;
    this.enemySprites.push(wrap);
    this.stage.addChild(wrap);
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

  spawnEnemyBullet(x: number, y: number, vx: number, vy: number): void {
    const b: EnemyBulletEntity = { x, y, vx, vy, alive: true };
    this.enemyBullets.push(b);
    const sprite = new Sprite(this.atlas.bullets.enemy);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    this.enemyBulletSprites.push(sprite);
    this.stage.addChild(sprite);
  }

  spawnHomingBullet(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    options?: { tint?: number; life?: number; maxSpeed?: number; spriteKind?: 'drone' | 'playerCrescent' }
  ): void {
    const tint = options?.tint ?? 0xff8844;
    const life = options?.life ?? 180;
    const spd0 = Math.hypot(vx, vy);
    const maxSpeed = options?.maxSpeed ?? (spd0 > 0.01 ? spd0 : GAME_CONFIG.HOMING_SPEED);
    const spriteKind = options?.spriteKind ?? 'drone';
    const homing: HomingBulletEntity = { x, y, vx, vy, damage, life, alive: true, tint, maxSpeed, spriteKind };
    this.homingBullets.push(homing);

    const tex =
      spriteKind === 'playerCrescent' ? this.atlas.bullets.homingCrescent : this.atlas.bullets.pierce;
    const sprite = new Sprite(tex);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.tint = spriteKind === 'playerCrescent' ? 0xffffff : tint;
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
    // Remove dead enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      if (
        !eb.alive ||
        eb.y > GAME_CONFIG.LOGICAL_HEIGHT + 20 ||
        eb.y < -25 ||
        eb.x < -25 ||
        eb.x > GAME_CONFIG.LOGICAL_WIDTH + 25
      ) {
        this.enemyBullets.splice(i, 1);
        const sprite = this.enemyBulletSprites.splice(i, 1)[0];
        this.stage.removeChild(sprite);
        sprite.destroy();
      }
    }

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
        const wrap = this.enemySprites.splice(i, 1)[0];
        this.stage.removeChild(wrap);
        wrap.destroy({ children: true });
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
      const p = this.player;
      this.playerSprite.x = p.x;
      this.playerSprite.y = p.y;
      const hasSideCannons = p.armorActive || p.effects.some(e => e.type === 'drone');
      if (p.armorActive && hasSideCannons) {
        this.playerSprite.texture = this.atlas.playerArmoredWithDrones;
      } else if (p.armorActive) {
        this.playerSprite.texture = this.atlas.playerArmored;
      } else if (hasSideCannons) {
        this.playerSprite.texture = this.atlas.playerWithDrones;
      } else {
        this.playerSprite.texture = this.atlas.player;
      }
      this.playerSprite.alpha = p.invincible > 0 ? 0.5 : 1;
      this.engineSprite.x = p.x;
      this.engineSprite.y = p.y + 6;
    }

    for (let i = 0; i < this.bullets.length; i++) {
      this.bulletSprites[i].x = this.bullets[i].x;
      this.bulletSprites[i].y = this.bullets[i].y;
    }

    for (let i = 0; i < this.enemies.length; i++) {
      const wrap = this.enemySprites[i];
      const e = this.enemies[i];
      wrap.x = e.x;
      wrap.y = e.y;
      const body = wrap.children[0] as Sprite;
      body.tint = e.flashTimer > 0 ? 0xffffff : e.color;
      if (e.tier >= 4) {
        const pulse = 1.02 + Math.sin(e.wobble * 2) * 0.03;
        body.scale.set(pulse);
      } else if (e.tier === 3) {
        const pulse = 1.04 + Math.sin(e.wobble * 2) * 0.03;
        body.scale.set(pulse);
      } else if (e.elite) {
        body.scale.set(1.08);
      } else {
        body.scale.set(1);
      }
    }

    for (let i = 0; i < this.items.length; i++) {
      this.itemSprites[i].x = this.items[i].x;
      this.itemSprites[i].y = this.items[i].y;
      this.itemSprites[i].tint = this.items[i].flashTimer > 0 ? 0xffffff : this.items[i].color;
    }

    for (let i = 0; i < this.enemyBullets.length; i++) {
      this.enemyBulletSprites[i].x = this.enemyBullets[i].x;
      this.enemyBulletSprites[i].y = this.enemyBullets[i].y;
      this.enemyBulletSprites[i].rotation = Math.atan2(this.enemyBullets[i].vy, this.enemyBullets[i].vx) + Math.PI / 2;
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
    this.enemySprites.forEach(s => { this.stage.removeChild(s); s.destroy({ children: true }); });
    this.itemSprites.forEach(s => { this.stage.removeChild(s); s.destroy(); });
    this.homingBulletSprites.forEach(s => { this.stage.removeChild(s); s.destroy(); });
    this.enemyBulletSprites.forEach(s => { this.stage.removeChild(s); s.destroy(); });
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
    this.enemyBullets = [];
    this.enemyBulletSprites = [];
  }
}
