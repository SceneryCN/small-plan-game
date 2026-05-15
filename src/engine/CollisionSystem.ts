import type { BulletEntity, EnemyEntity, ItemEntity, PlayerEntity, EnemyBulletEntity } from '../entities/Entity';
import { dist } from '../utils/math';
import { GAME_CONFIG } from '../config/gameConfig';

export class CollisionSystem {
  checkBulletEnemy(bullet: BulletEntity, enemy: EnemyEntity): boolean {
    return dist(bullet.x, bullet.y, enemy.x, enemy.y) < enemy.size + 3;
  }

  checkBulletItem(bullet: BulletEntity, item: ItemEntity): boolean {
    return dist(bullet.x, bullet.y, item.x, item.y) < item.size + 3;
  }

  checkEnemyReachedBottom(enemy: EnemyEntity, bottomY: number): boolean {
    return enemy.y > bottomY;
  }

  /** 敌弹是否命中玩家机体中心弱点 */
  checkEnemyBulletPlayerCore(bullet: EnemyBulletEntity, player: PlayerEntity): boolean {
    return dist(bullet.x, bullet.y, player.x, player.y) < GAME_CONFIG.PLAYER_CORE_RADIUS;
  }

  /** 敌怪机体与玩家是否发生「贴身」重叠（用于撞碎反应装甲） */
  checkPlayerEnemyBodyOverlap(player: PlayerEntity, enemy: EnemyEntity): boolean {
    const r = GAME_CONFIG.PLAYER_HIT_RADIUS + enemy.size * 0.5;
    return dist(player.x, player.y, enemy.x, enemy.y) < r;
  }
}
