export const GAME_CONFIG = {
  // Display
  LOGICAL_WIDTH: 240,
  LOGICAL_HEIGHT: 426,
  SCALE: 2,
  DIVIDER_RATIO: 0.45,

  // Player
  PLAYER_SIZE: 16,
  PLAYER_Y_OFFSET: 40,
  PLAYER_LERP: 0.15,

  // Bullets
  BULLET_SPEED: 5,
  BULLET_DAMAGE: 12,
  /** Main gun damage multiplier while homing item is active */
  HOMING_MAIN_BULLET_DAMAGE_MULT: 0.68,
  BASE_FIRE_RATE: 7, // faster base fire rate for denser bullets

  // Laser — vertical columns only, burst volley + cooldown (highest damage source)
  LASER_COLUMN_HALF_WIDTH: 2.5,
  LASER_DAMAGE_PER_BEAM: 32,
  LASER_VOLLEY_COOLDOWN_FRAMES: 46,
  LASER_BEAM_SPREAD: 13,

  // Items
  ITEM_SPAWN_RATE: 158,
  ITEM_FALL_SPEED: 0.62,
  ITEM_TYPES: [
    { name: '加速射击', value: 90, hp: 25, color: 0x00ff88, effect: 'fireRate' as const, duration: 350, tier: 1 },
    { name: '三连弹', value: 200, hp: 50, color: 0xffaa00, effect: 'tripleShot' as const, duration: 450, tier: 2 },
    { name: '激光炮', value: 500, hp: 90, color: 0xff44ff, effect: 'laser' as const, duration: 300, tier: 3 },
    { name: '全屏爆破', value: 999, hp: 140, color: 0xff0044, effect: 'nuke' as const, duration: 1, tier: 4 },
    { name: '护盾', value: 150, hp: 35, color: 0x4488ff, effect: 'shield' as const, duration: 500, tier: 2 },
    { name: '穿透弹', value: 300, hp: 70, color: 0xffff00, effect: 'pierce' as const, duration: 400, tier: 3 },
    { name: '浮游炮', value: 600, hp: 100, color: 0x00ccff, effect: 'drone' as const, duration: 500, tier: 3 },
    { name: '跟踪弹', value: 450, hp: 80, color: 0xff8844, effect: 'homing' as const, duration: 400, tier: 3 },
  ],

  // Enemies
  ENEMY_SPAWN_RATE: 40,
  ENEMY_TYPES: [
    { name: '小兵', hp: 22, size: 12, speed: 1.05, score: 10, color: 0xff6b9d, tier: 1 },
    { name: '重甲', hp: 62, size: 16, speed: 0.52, score: 30, color: 0xffa040, tier: 2 },
    { name: '疾风', hp: 14, size: 10, speed: 1.95, score: 20, color: 0xff9cf0, tier: 1 },
    { name: '精英', hp: 135, size: 20, speed: 0.38, score: 60, color: 0xc86bff, tier: 2 },
    { name: 'BOSS', hp: 620, size: 32, speed: 0.16, score: 200, color: 0xff3366, tier: 3 },
    { name: '巨型BOSS', hp: 1500, size: 44, speed: 0.09, score: 500, color: 0xff5588, tier: 4 },
  ],

  // Player HP
  PLAYER_MAX_HP: 120,

  // Difficulty (continuous scalar used for spawns)
  DIFFICULTY_INCREASE_RATE: 0.00135,
  /** Frames per discrete HUD wave (~42s at 60fps). */
  WAVE_FRAMES_PER_WAVE: 2520,

  // Drone — low damage homing micro missiles
  DRONE_FIRE_RATE: 14,
  DRONE_HOMING_DAMAGE: 5,
  DRONE_HOMING_SPEED: 2.75,

  // Homing item missiles (not main gun)
  HOMING_FIRE_RATE: 20,
  HOMING_DAMAGE: 11,
  HOMING_SPEED: 3.4,
  /** 0–1, higher = snappier tracking */
  HOMING_TURN_RATE: 0.26,
} as const;

export type EffectType = 'fireRate' | 'tripleShot' | 'laser' | 'nuke' | 'shield' | 'pierce' | 'drone' | 'homing';
export type ItemType = typeof GAME_CONFIG.ITEM_TYPES[number];
export type EnemyType = typeof GAME_CONFIG.ENEMY_TYPES[number];
