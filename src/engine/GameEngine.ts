import { Application, Container } from 'pixi.js';
import { GAME_CONFIG } from '../config/gameConfig';
import { InputManager } from '../input/InputManager';
import { EntityManager } from './EntityManager';
import { CollisionSystem } from './CollisionSystem';
import { ParticleSystem } from './ParticleSystem';
import { Camera } from './Camera';
import { SpawnSystem } from '../systems/SpawnSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { EffectSystem } from '../systems/EffectSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../audio/AudioEngine';
import { getAtlas } from '../sprites/SpriteFactory';

export class GameEngine {
  public app: Application;
  public stage: Container;
  public input: InputManager;
  public entities: EntityManager;
  public collision: CollisionSystem;
  public particles: ParticleSystem;
  public camera: Camera;

  private spawnSystem: SpawnSystem;
  private movementSystem: MovementSystem;
  private combatSystem: CombatSystem;
  private effectSystem: EffectSystem;
  private difficultySystem: DifficultySystem;

  private frame = 0;
  private running = false;

  constructor(app: Application) {
    this.app = app;
    this.camera = new Camera();
    this.stage = this.camera.container;
    app.stage.addChild(this.stage);

    this.input = new InputManager(
      app.canvas as HTMLCanvasElement,
      GAME_CONFIG.LOGICAL_WIDTH,
      GAME_CONFIG.LOGICAL_HEIGHT
    );
    this.entities = new EntityManager(this.stage, getAtlas());
    this.collision = new CollisionSystem();
    this.particles = new ParticleSystem(this.stage);

    this.spawnSystem = new SpawnSystem(this.entities);
    this.movementSystem = new MovementSystem();
    this.combatSystem = new CombatSystem(this.entities, this.particles, this.collision);
    this.combatSystem.setCamera(this.camera);
    this.effectSystem = new EffectSystem();
    this.difficultySystem = new DifficultySystem();

    app.ticker.add(this.update.bind(this));
  }

  startGame(): void {
    this.running = true;
    this.frame = 0;
    this.entities.reset();
    this.particles.reset();
    this.effectSystem.reset();
    this.spawnSystem.reset();
    this.difficultySystem.reset();
    this.combatSystem.reset();

    // Create player
    this.entities.spawnPlayer(
      GAME_CONFIG.LOGICAL_WIDTH / 2,
      GAME_CONFIG.LOGICAL_HEIGHT - GAME_CONFIG.PLAYER_Y_OFFSET
    );

    useGameStore.getState().reset();
    audioEngine.bgm?.transition('battle', 300, 500);
  }

  stopGame(): void {
    this.running = false;
    audioEngine.sfx?.play('gameOver');
    audioEngine.bgm?.transition('gameOver', 800, 800);
    useGameStore.getState().setFinalScore(this.combatSystem.score);
    useGameStore.getState().setScreen('gameOver');
  }

  private update(): void {
    if (!this.running) return;
    this.frame++;

    const player = this.entities.player;
    if (!player) return;

    // 1. Input
    const target = this.input.getTarget();
    if (target) {
      player.targetX = target.x;
      player.targetY = target.y;
    }

    // 2. Spawn
    this.spawnSystem.update(this.difficultySystem.level, this.difficultySystem.wave);

    // 3. Movement
    this.movementSystem.update(
      player,
      this.entities.bullets,
      this.entities.enemies,
      this.entities.items,
      this.entities.enemyBullets
    );

    // 4. Combat (includes shooting)
    this.combatSystem.update(player, this.entities, this.frame, this.difficultySystem.wave);

    // 5. Effects
    this.effectSystem.update(player);

    // 6. Difficulty
    this.difficultySystem.update();

    // 7. Cleanup
    this.entities.cleanup();

    // 8. Camera
    this.camera.update();

    // 9. Particles
    this.particles.update();

    // 9.5 Sync sprite positions
    this.entities.syncVisuals();

    // 10. Update HUD (every 5 frames)
    if (this.frame % 5 === 0) {
      useGameStore.getState().updateHUD({
        score: this.combatSystem.score,
        combo: this.combatSystem.combo,
        hp: player.hp,
        maxHp: player.maxHp,
        shieldHp: player.shieldHp,
        armorActive: player.armorActive,
        activeEffects: player.effects.map(e => ({ type: e.type, remaining: e.timer })),
        wave: this.difficultySystem.wave,
      });
    }

    // 11. Battle BGM intensity
    audioEngine.bgm?.setIntensity(
      Math.min(1, this.difficultySystem.wave / 10 + this.difficultySystem.level / 6)
    );

    // Check game over
    if (player.hp <= 0) {
      this.stopGame();
    }
  }

  destroy(): void {
    this.running = false;
    this.input.destroy();
  }
}
