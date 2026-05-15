import type { BulletEntity, EnemyEntity, ItemEntity } from '../entities/Entity';
import { dist } from '../utils/math';

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
}
