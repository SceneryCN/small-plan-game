import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { GAME_CONFIG } from '../config/gameConfig';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../store/gameStore';

let engineInstance: GameEngine | null = null;

export function getEngine(): GameEngine | null {
  return engineInstance;
}

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const screen = useGameStore(s => s.screen);

  useEffect(() => {
    if (!containerRef.current || screen !== 'playing') return;

    let app: Application | null = null;
    let engine: GameEngine | null = null;
    let destroyed = false;

    const init = async () => {
      try {
        app = new Application();
        await app.init({
          width: GAME_CONFIG.LOGICAL_WIDTH,
          height: GAME_CONFIG.LOGICAL_HEIGHT,
          backgroundColor: 0x0a0a0f,
          resolution: GAME_CONFIG.SCALE,
          autoDensity: true,
        });

        if (destroyed) return;

        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'contain';
        canvas.style.imageRendering = 'pixelated';
        canvas.style.touchAction = 'none';
        containerRef.current!.appendChild(canvas);

        engine = new GameEngine(app);
        engineInstance = engine;
        engine.startGame();
      } catch (e) {
        console.error('[GameCanvas] init failed:', e);
      }
    };

    init();

    return () => {
      destroyed = true;
      if (engine) engine.destroy();
      if (app) {
        app.destroy(true, { children: true });
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      engineInstance = null;
    };
  }, [screen]);

  if (screen !== 'playing') return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
      }}
    />
  );
}
