import { GAME_CONFIG } from '../config/gameConfig';
import { EntityManager } from '../engine/EntityManager';
import { randInt } from '../utils/math';

export class SpawnSystem {
  private entities: EntityManager;
  private enemyTimer = 30;
  private itemTimer = 60;
  private lastWave = 1;

  constructor(entities: EntityManager) {
    this.entities = entities;
  }

  update(difficulty: number, wave: number): void {
    this.handleWaveEvents(wave);

    this.enemyTimer--;
    if (this.enemyTimer <= 0) {
      const rate = Math.max(
        9,
        GAME_CONFIG.ENEMY_SPAWN_RATE - Math.floor(difficulty * 9) - Math.floor(wave * 1.2)
      );
      this.enemyTimer = rate;

      const maxTier = Math.min(3, Math.ceil(difficulty));
      const tier = randInt(1, maxTier);
      this.entities.spawnEnemy(tier);

      if (difficulty > 1.8 && Math.random() < 0.32) {
        this.entities.spawnEnemy(1);
      }
    }

    this.itemTimer--;
    if (this.itemTimer <= 0) {
      const rate = Math.max(58, GAME_CONFIG.ITEM_SPAWN_RATE - Math.floor(difficulty * 8) - Math.floor(wave * 0.65));
      this.itemTimer = rate;

      const maxTier = Math.min(4, 1 + Math.floor(difficulty * 0.85));
      const tier = randInt(1, maxTier);
      this.entities.spawnItem(tier);
    }
  }

  private handleWaveEvents(wave: number): void {
    if (wave <= this.lastWave) return;

    for (let w = this.lastWave + 1; w <= wave; w++) {
      if (w % 20 === 0) {
        this.entities.spawnEnemy(4);
      } else if (w % 10 === 0) {
        this.entities.spawnEnemy(3);
      } else if (w % 5 === 0 && w % 10 !== 0) {
        this.entities.spawnEnemy(2, { hpMult: 2.1, speedMult: 1.18 });
        this.entities.spawnEnemy(2, { hpMult: 2.1, speedMult: 1.18 });
      }
    }

    this.lastWave = wave;
  }

  reset(): void {
    this.enemyTimer = 30;
    this.itemTimer = 60;
    this.lastWave = 1;
  }
}
