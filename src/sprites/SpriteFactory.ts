import { Texture } from 'pixi.js';
import { createPixelTexture, createSolidTexture } from '../utils/pixelCanvas';
import { playerPixels, playerEnginePixels } from './PlayerSprite';
import { enemySprites } from './EnemySprites';
import { itemEffectSprites } from './ItemSprites';
import { bulletPixels } from './BulletSprites';
import type { EffectType } from '../config/gameConfig';

export interface SpriteAtlas {
  player: Texture;
  playerEngine: Texture;
  bullets: { normal: Texture; pierce: Texture };
  enemies: Record<number, Texture>;
  items: Record<EffectType, Texture>;
  particle: Texture;
  shield: Texture;
}

let atlas: SpriteAtlas | null = null;

export function initSprites(): SpriteAtlas {
  if (atlas) return atlas;

  atlas = {
    player: createPixelTexture(playerPixels),
    playerEngine: createPixelTexture(playerEnginePixels),
    bullets: {
      normal: createPixelTexture(bulletPixels.normal),
      pierce: createPixelTexture(bulletPixels.pierce),
    },
    enemies: {
      1: createPixelTexture(enemySprites.tier1),
      2: createPixelTexture(enemySprites.tier2),
      3: createPixelTexture(enemySprites.tier3),
      4: createPixelTexture(enemySprites.tier4),
    },
    items: {
      fireRate: createPixelTexture(itemEffectSprites.fireRate),
      tripleShot: createPixelTexture(itemEffectSprites.tripleShot),
      laser: createPixelTexture(itemEffectSprites.laser),
      nuke: createPixelTexture(itemEffectSprites.nuke),
      shield: createPixelTexture(itemEffectSprites.shield),
      pierce: createPixelTexture(itemEffectSprites.pierce),
      drone: createPixelTexture(itemEffectSprites.drone),
      homing: createPixelTexture(itemEffectSprites.homing),
    },
    particle: createSolidTexture(4, 4, 0xffffff),
    shield: createSolidTexture(2, 2, 0x4488ff),
  };

  return atlas;
}

export function getAtlas(): SpriteAtlas {
  if (!atlas) initSprites();
  return atlas!;
}
