import type { PlayerEntity } from '../entities/Entity';

export class EffectSystem {
  reset(): void { /* no persistent state */ }

  update(player: PlayerEntity): void {
    player.effects = player.effects.filter(e => {
      e.timer--;
      return e.timer > 0;
    });
  }
}
