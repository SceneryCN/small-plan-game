import type { PixelGrid } from '../utils/pixelCanvas';

const _ = null; // transparent
const C = 0x00ffcc; // cyan body
const D = 0x00ccaa; // dark cyan
const W = 0xffffff; // white highlight
const B = 0x0088ff; // blue engine
const G = 0x00ff88; // green accent

// 16x16 player ship (pointing up)
export const playerPixels: PixelGrid = [
  [_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,W,C,C,W,_,_,_,_,_,_],
  [_,_,_,_,_,W,C,C,C,C,W,_,_,_,_,_],
  [_,_,_,_,_,C,C,W,W,C,C,_,_,_,_,_],
  [_,_,_,_,C,C,C,C,C,C,C,C,_,_,_,_],
  [_,_,_,C,C,C,C,C,C,C,C,C,C,_,_,_],
  [_,_,_,C,D,C,C,C,C,C,C,D,C,_,_,_],
  [_,_,C,C,D,D,C,C,C,C,D,D,C,C,_,_],
  [_,_,C,C,D,D,C,G,G,C,D,D,C,C,_,_],
  [_,G,C,C,C,C,C,C,C,C,C,C,C,C,G,_],
  [_,G,D,C,C,C,C,C,C,C,C,C,C,D,G,_],
  [G,G,D,D,C,C,C,C,C,C,C,C,D,D,G,G],
  [_,_,D,D,D,C,C,C,C,C,C,D,D,D,_,_],
  [_,_,_,D,D,D,_,_,_,_,D,D,D,_,_,_],
  [_,_,_,_,D,_,_,_,_,_,_,D,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// 16x8 engine flame animation
export const playerEnginePixels: PixelGrid = [
  [_,_,_,_,_,B,B,_,_,B,B,_,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,B,0x00aaff,B,B,B,B,0x00aaff,B,_,_,_,_],
  [_,_,_,_,_,0x00aaff,0x44ccff,_,_,0x44ccff,0x00aaff,_,_,_,_],
  [_,_,_,_,_,_,0x44ccff,_,_,0x44ccff,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];
