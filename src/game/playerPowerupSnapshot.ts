import type { PlayerEntity } from '../entities/Entity';
import type { EffectType } from '../config/gameConfig';

/**
 * 单帧内玩家身上「限时效果」的快照，避免在战斗循环里反复遍历 effects 数组。
 */
export interface PlayerPowerupSnapshot {
  /** 是否拥有指定限时效果 */
  has(type: EffectType): boolean;
  /** 是否应发射浮游炮（含限时浮游炮道具或盔甲附带的常驻浮游炮） */
  hasDrone: boolean;
  /** 是否装备可被撞碎的盔甲 */
  armorActive: boolean;
}

/**
 * 从玩家实体构建本帧快照（O(n)，n 为效果条数，通常很小）。
 */
export function createPlayerPowerupSnapshot(player: PlayerEntity): PlayerPowerupSnapshot {
  const set = new Set<EffectType>();
  for (const e of player.effects) {
    set.add(e.type);
  }
  return {
    has: (t) => set.has(t),
    hasDrone: set.has('drone') || player.armorActive,
    armorActive: player.armorActive,
  };
}
