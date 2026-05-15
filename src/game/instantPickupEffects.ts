import { GAME_CONFIG } from '../config/gameConfig';
import type { EffectType } from '../config/gameConfig';
import type { PlayerEntity } from '../entities/Entity';

/**
 * 拾取后立刻结算、不进入 `player.effects` 计时队列的道具类型。
 * 与限时强化解耦，后续加「一次性」类道具只改此处与配置表即可。
 */
const INSTANT_EFFECTS = new Set<EffectType>(['heal', 'armor']);

export function isInstantPickupEffect(effect: EffectType): boolean {
  return INSTANT_EFFECTS.has(effect);
}

/**
 * 应用瞬时道具；若已处理返回 true，战斗系统不再走通用入栈逻辑。
 */
export function tryApplyInstantPickupEffect(effect: EffectType, player: PlayerEntity): boolean {
  if (effect === 'heal') {
    const delta = Math.floor(player.maxHp * GAME_CONFIG.HEAL_HP_RATIO);
    player.hp = Math.min(player.maxHp, player.hp + Math.max(1, delta));
    return true;
  }
  if (effect === 'armor') {
    player.armorActive = true;
    return true;
  }
  return false;
}
