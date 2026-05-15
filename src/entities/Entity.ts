import type { EffectType } from '../config/gameConfig';

export interface PlayerEntity {
  x: number;
  y: number;
  targetX: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  fireTimer: number;
  invincible: number;
  effects: { type: EffectType; timer: number }[];
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
  wobble: number;
  flashTimer: number;
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
}
