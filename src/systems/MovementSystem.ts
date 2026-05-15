import { GAME_CONFIG } from "../config/gameConfig";
import type {
	BulletEntity,
	EnemyBulletEntity,
	EnemyEntity,
	ItemEntity,
	PlayerEntity,
} from "../entities/Entity";
import { lerp } from "../utils/math";

export class MovementSystem {
	private frame = 0;

	update(
		player: PlayerEntity,
		bullets: BulletEntity[],
		enemies: EnemyEntity[],
		items: ItemEntity[],
		enemyBullets: EnemyBulletEntity[],
	): void {
		this.frame++;

		// Player smooth movement (全方向)
		player.x = lerp(player.x, player.targetX, GAME_CONFIG.PLAYER_LERP);
		player.y = lerp(player.y, player.targetY, GAME_CONFIG.PLAYER_LERP);

		// Bullets
		for (const b of bullets) {
			b.x += b.vx;
			b.y += b.vy;
		}

		for (const b of enemyBullets) {
			b.x += b.vx;
			b.y += b.vy;
		}

		// Enemies - animated behaviors based on tier
		for (const e of enemies) {
			e.wobble += 0.06;
			if (e.flashTimer > 0) e.flashTimer--;

			const drift = (player.x - e.x) * (e.tier <= 2 ? 0.014 : 0.006);

			switch (e.tier) {
				case 1:
					// Tier 1 小兵: zig-zag sine wave descent
					e.y += e.speed;
					e.x += Math.sin(e.wobble * 1.5) * 1.2 + drift;
					break;

				case 2:
					// Tier 2 重甲/精英: slow descent with periodic horizontal charge
					if (Math.sin(e.wobble * 0.4) > 0.7) {
						// Charge horizontally
						const dir = e.x > GAME_CONFIG.LOGICAL_WIDTH * 0.7 ? -1 : 1;
						e.x += dir * e.speed * 3 + drift * 0.5;
						e.y += e.speed * 0.2;
					} else {
						e.y += e.speed;
						e.x += Math.sin(e.wobble) * 0.5 + drift;
					}
					break;

				case 3:
					// Tier 3 BOSS: slow descent + orbit pattern + pulsing
					e.y += e.speed;
					e.x += Math.sin(e.wobble * 0.8) * 2.0 + drift * 0.4;
					// Pause periodically (simulate power charging)
					if (Math.sin(e.wobble * 0.3) > 0.85) {
						e.y -= e.speed * 0.8; // nearly hover
					}
					break;

				case 4: {
					// Tier 4 巨型BOSS: slow majestic sweep + stops to "attack"
					const phase = Math.floor(e.wobble / 3) % 4;
					switch (phase) {
						case 0: // Descend slowly
							e.y += e.speed;
							e.x += Math.sin(e.wobble * 0.5) * 1.5 + drift * 0.35;
							break;
						case 1: // Sweep left
							e.y += e.speed * 0.3;
							e.x -= 0.8;
							break;
						case 2: // Hold position (charging)
							e.y += e.speed * 0.1;
							// Vibrate
							e.x += Math.sin(e.wobble * 8) * 0.5 + drift * 0.25;
							break;
						case 3: // Sweep right
							e.y += e.speed * 0.3;
							e.x += 0.8;
							break;
					}
					break;
				}

				default:
					e.y += e.speed;
					e.x += Math.sin(e.wobble) * 0.3 + drift;
			}

			// Clamp X within right side area
			const minX = GAME_CONFIG.LOGICAL_WIDTH * GAME_CONFIG.DIVIDER_RATIO + 10;
			const maxX = GAME_CONFIG.LOGICAL_WIDTH - 10;
			if (e.x < minX) e.x = minX;
			if (e.x > maxX) e.x = maxX;
		}

		// Items - gentle float with slight sway
		for (const item of items) {
			item.y += GAME_CONFIG.ITEM_FALL_SPEED;
			// Gentle sway
			item.x += Math.sin(this.frame * 0.03 + item.y * 0.02) * 0.2;
			if (item.flashTimer > 0) item.flashTimer--;
		}
	}
}
