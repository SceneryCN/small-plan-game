import { create } from 'zustand';
import type { EffectType } from '../config/gameConfig';

export type GameScreen = 'loading' | 'start' | 'playing' | 'gameOver';

interface ActiveEffect {
  type: EffectType;
  remaining: number;
}

interface GameStore {
  screen: GameScreen;
  score: number;
  combo: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  activeEffects: ActiveEffect[];
  wave: number;
  finalScore: number;

  setScreen: (screen: GameScreen) => void;
  updateHUD: (data: Partial<Pick<GameStore, 'score' | 'combo' | 'hp' | 'maxHp' | 'shieldHp' | 'activeEffects' | 'wave'>>) => void;
  setFinalScore: (score: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  screen: 'loading',
  score: 0,
  combo: 0,
  hp: 100,
  maxHp: 100,
  shieldHp: 0,
  activeEffects: [],
  wave: 1,
  finalScore: 0,

  setScreen: (screen) => set({ screen }),
  updateHUD: (data) => set(data),
  setFinalScore: (finalScore) => set({ finalScore }),
  reset: () => set({
    score: 0,
    combo: 0,
    hp: 100,
    maxHp: 100,
    shieldHp: 0,
    activeEffects: [],
    wave: 1,
    finalScore: 0,
  }),
}));
