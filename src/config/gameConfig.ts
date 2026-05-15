export const GAME_CONFIG = {
  LOGICAL_WIDTH: 240,
  LOGICAL_HEIGHT: 426,
  SCALE: 2,
  DIVIDER_RATIO: 0.45,

  PLAYER_SIZE: 16,
  PLAYER_Y_OFFSET: 40,
  PLAYER_LERP: 0.15,
  /** 机体与敌怪「贴身」判定半径（反应装甲碎裂），略小于半尺寸 */
  PLAYER_HIT_RADIUS: 9,
  /** 机体中心弱点半径：仅此处受敌弹伤害 */
  PLAYER_CORE_RADIUS: 4,

  BULLET_SPEED: 5,
  BULLET_DAMAGE: 12,
  BASE_FIRE_RATE: 5,

  LASER_CHARGE_FRAMES: 42,
  /** 单次向上光柱后的静默间隔（帧），无粒子，避免连发过密 */
  LASER_POST_BURST_COOLDOWN_FRAMES: 40,
  /** 单次脉冲光柱半宽（判定与特效，固定不再递减）；总宽约 2× 此值 */
  LASER_MAX_HALF_WIDTH: 17,
  /** 每条激光柱单次脉冲总伤害（多柱可叠） */
  LASER_DAMAGE_PER_BEAM: 32,
  LASER_BEAM_SPREAD: 13,
  /** 激光柱基础条数；三连弹再 + TRIPLE_EXTRA_STREAMS */
  LASER_BASE_BEAM_COUNT: 1,
  /** 跟踪弹每轮基础弹道条数；三连再 + TRIPLE_EXTRA_STREAMS */
  HOMING_BASE_STREAMS: 4,
  /** 主机普通弹基础条数；三连再 + TRIPLE_EXTRA_STREAMS */
  MAIN_BULLET_BASE_STREAMS: 2,
  /** 浮游炮每轮基础条数；三连再 + TRIPLE_EXTRA_STREAMS */
  DRONE_BASE_STREAMS: 2,
  /** 三连弹：任意武器在基础弹道之上额外增加的数量 */
  TRIPLE_EXTRA_STREAMS: 3,

  /** tier2 敌弹射手概率：基础 + 每波增量（上限内） */
  ENEMY_SHOOTER_T2_BASE: 0.09,
  ENEMY_SHOOTER_T2_PER_WAVE: 0.026,
  ENEMY_SHOOTER_T2_CAP: 0.72,
  /** tier3 BOSS 射手概率上限 */
  ENEMY_SHOOTER_T3_BASE: 0.22,
  ENEMY_SHOOTER_T3_PER_WAVE: 0.038,
  ENEMY_SHOOTER_T3_CAP: 0.88,
  /** 巨型 BOSS 向下激光：蓄力帧数（环一圈比主角慢） */
  MEGA_LASER_CHARGE_FRAMES: 78,
  MEGA_LASER_BEAM_FRAMES: 62,
  MEGA_LASER_MAX_HALF_WIDTH: 9,
  /** 巨型激光每帧对玩家核心伤害（配合短无敌，避免单帧秒杀） */
  MEGA_LASER_PLAYER_DAMAGE_PER_TICK: 2.4,
  MEGA_LASER_PLAYER_HIT_INVINC: 7,

  /** 波次召唤 BOSS / 巨型时额外血量倍率（基础 hp 已提高） */
  BOSS_WAVE_HP_MULT: 3.2,
  MEGA_WAVE_HP_MULT: 4.2,

  /** 每经过多少波，道具定时触发时多掉落 1 件（上限 ITEM_SPAWN_BUNDLE_MAX） */
  ITEM_SPAWN_BUNDLE_WAVES: 5,
  ITEM_SPAWN_BUNDLE_MAX: 4,
  ITEM_SPAWN_RATE: 158,
  ITEM_FALL_SPEED: 0.62,
  ITEM_TYPES: [
    { name: '加速射击', value: 90, hp: 25, color: 0x00ff88, effect: 'fireRate' as const, duration: 350, tier: 1 },
    { name: '小回血', value: 70, hp: 22, color: 0x44ff99, effect: 'heal' as const, duration: 1, tier: 1 },
    { name: '三连弹', value: 200, hp: 50, color: 0xffaa00, effect: 'tripleShot' as const, duration: 450, tier: 2 },
    { name: '护盾', value: 150, hp: 35, color: 0x4488ff, effect: 'shield' as const, duration: 500, tier: 2 },
    { name: '反应装甲', value: 380, hp: 55, color: 0x99aabb, effect: 'armor' as const, duration: 1, tier: 2 },
    { name: '激光炮', value: 500, hp: 90, color: 0xff44ff, effect: 'laser' as const, duration: 300, tier: 3 },
    { name: '穿透弹', value: 300, hp: 70, color: 0xffff00, effect: 'pierce' as const, duration: 400, tier: 3 },
    { name: '浮游炮', value: 600, hp: 100, color: 0x00ccff, effect: 'drone' as const, duration: 500, tier: 3 },
    { name: '跟踪弹', value: 450, hp: 80, color: 0xff8844, effect: 'homing' as const, duration: 400, tier: 3 },
    { name: '全屏爆破', value: 999, hp: 140, color: 0xff0044, effect: 'nuke' as const, duration: 1, tier: 4 },
  ],

  ENEMY_SPAWN_RATE: 40,
  ENEMY_TYPES: [
    { name: '小兵', hp: 22, size: 12, speed: 1.05, score: 10, color: 0xff6b9d, tier: 1 },
    { name: '重甲', hp: 62, size: 16, speed: 0.52, score: 30, color: 0xffa040, tier: 2 },
    { name: '疾风', hp: 14, size: 10, speed: 1.95, score: 20, color: 0xff9cf0, tier: 1 },
    { name: '精英', hp: 135, size: 20, speed: 0.38, score: 60, color: 0xc86bff, tier: 2 },
    { name: 'BOSS', hp: 4200, size: 38, speed: 0.14, score: 200, color: 0xff3366, tier: 3 },
    { name: '巨型BOSS', hp: 16000, size: 54, speed: 0.08, score: 500, color: 0xff5588, tier: 4 },
  ],

  PLAYER_MAX_HP: 120,

  DIFFICULTY_INCREASE_RATE: 0.00135,
  /** 每多少帧 HUD 波数 +1（约 42 秒 @60fps） */
  WAVE_FRAMES_PER_WAVE: 2520,

  /** 回血道具恢复最大生命比例 */
  HEAL_HP_RATIO: 0.1,

  DRONE_FIRE_RATE: 11,
  DRONE_HOMING_DAMAGE: 5,
  DRONE_HOMING_SPEED: 2.75,

  HOMING_FIRE_RATE: 15,
  HOMING_DAMAGE: 11,
  HOMING_SPEED: 3.4,

  /** 敌怪子弹速度与单发伤害 */
  ENEMY_BULLET_SPEED: 2.85,
  ENEMY_BULLET_DAMAGE: 14,
  /** 追踪弹转向强度，0～1，越大越贴目标 */
  HOMING_TURN_RATE: 0.26,
} as const;

export type EffectType =
  | 'fireRate'
  | 'tripleShot'
  | 'laser'
  | 'nuke'
  | 'shield'
  | 'pierce'
  | 'drone'
  | 'homing'
  | 'heal'
  | 'armor';

export type ItemType = (typeof GAME_CONFIG.ITEM_TYPES)[number];
export type EnemyType = (typeof GAME_CONFIG.ENEMY_TYPES)[number];
