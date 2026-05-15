import type { EffectType } from '../config/gameConfig';

export interface PlayerEntity {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  fireTimer: number;
  invincible: number;
  effects: { type: EffectType; timer: number }[];
  /** 反应装甲：常驻浮游炮逻辑，与敌怪贴身一次后移除 */
  armorActive: boolean;
}

export interface BulletEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  pierce: boolean;
  alive: boolean;
}

export interface EnemyEntity {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  size: number;
  speed: number;
  score: number;
  color: number;
  tier: number;
  /** Wave-spawned elite modifier (stronger tier-2 style). */
  elite?: boolean;
  /** tier≥2 是否可发射敌弹（生成时按波次随机，低波少、高波多） */
  canShoot: boolean;
  /** 敌弹发射冷却（帧）；巨型 BOSS 使用独立激光逻辑，此项可置大数 */
  shootCd: number;
  /** 巨型 BOSS 激光：蓄力环 → 向下竖直光束（比主角慢） */
  megaLaserPhase?: 'charging' | 'beam';
  megaLaserFrame?: number;
  wobble: number;
  flashTimer: number;
  alive: boolean;
}

/** 敌怪发射的子弹（仅能躲避；核弹可清除） */
export interface EnemyBulletEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
}

export interface ItemEntity {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  size: number;
  effect: EffectType;
  duration: number;
  value: number;
  color: number;
  tier: number;
  flashTimer: number;
  alive: boolean;
}

export interface HomingBulletEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  life: number;
  alive: boolean;
  /** Sprite tint (e.g. orange player homing vs cyan drone). */
  tint: number;
  /** Flight speed magnitude (steering preserves this). */
  maxSpeed: number;
  /** 贴图：浮游炮用棱形，玩家跟踪弹用月牙 */
  spriteKind: 'drone' | 'playerCrescent';
}
