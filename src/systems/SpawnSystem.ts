import { GAME_CONFIG } from '../config/gameConfig';
import type { EntityManager } from '../engine/EntityManager';
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

      if (!this.entities.hasLivingMajorBoss()) {
        const maxTier = Math.min(2, Math.ceil(difficulty));
        const tier = randInt(1, Math.max(1, maxTier));
        this.entities.spawnEnemy(tier, undefined, wave);

        if (difficulty > 1.8 && Math.random() < 0.32) {
          this.entities.spawnEnemy(1, undefined, wave);
        }
      }
    }

    this.itemTimer--;
    if (this.itemTimer <= 0) {
      const rate = Math.max(58, GAME_CONFIG.ITEM_SPAWN_RATE - Math.floor(difficulty * 8) - Math.floor(wave * 0.65));
      this.itemTimer = rate;

      const maxTier = Math.min(4, 1 + Math.floor(difficulty * 0.85));
      const bundle =
        1 + Math.min(GAME_CONFIG.ITEM_SPAWN_BUNDLE_MAX, Math.floor(wave / GAME_CONFIG.ITEM_SPAWN_BUNDLE_WAVES));
      for (let b = 0; b < bundle; b++) {
        const tier = randInt(1, maxTier);
        this.entities.spawnItem(tier);
      }
    }
  }

  private handleWaveEvents(wave: number): void {
    if (wave <= this.lastWave) return;

    for (let w = this.lastWave + 1; w <= wave; w++) {
      // 巨型 BOSS：每 12 波且不与同帧 BOSS（每 3 波）抢位；全场仅一只 tier4
      if (w % 12 === 0) {
        if (!this.entities.hasLivingTier4() && !this.entities.hasLivingTier3Boss()) {
          this.entities.spawnEnemy(4, { hpMult: GAME_CONFIG.MEGA_WAVE_HP_MULT }, w);
        }
      } else if (w % 3 === 0) {
        if (!this.entities.hasLivingTier3Boss() && !this.entities.hasLivingTier4()) {
          this.entities.spawnEnemy(3, { hpMult: GAME_CONFIG.BOSS_WAVE_HP_MULT }, w);
        }
      } else if (w % 2 === 0) {
        if (!this.entities.hasLivingMajorBoss()) {
          this.entities.spawnEnemy(2, { hpMult: 2.1, speedMult: 1.18 }, w);
          this.entities.spawnEnemy(2, { hpMult: 2.1, speedMult: 1.18 }, w);
        }
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
