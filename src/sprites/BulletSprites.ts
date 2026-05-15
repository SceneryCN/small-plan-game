import type { PixelGrid } from '../utils/pixelCanvas';

const _ = null;
const C = 0x00ffcc;
const Y = 0xffff00;
const W = 0xffffff;

// Normal bullet: 4x8 cyan
const normal: PixelGrid = [
  [_,W,W,_],
  [W,C,C,W],
  [C,C,C,C],
  [C,C,C,C],
  [C,C,C,C],
  [C,C,C,C],
  [_,C,C,_],
  [_,_,_,_],
];

// Pierce bullet: 4x8 yellow
const pierce: PixelGrid = [
  [_,W,W,_],
  [W,Y,Y,W],
  [Y,Y,Y,Y],
  [Y,Y,Y,Y],
  [Y,Y,Y,Y],
  [Y,Y,Y,Y],
  [_,Y,Y,_],
  [_,_,_,_],
];

export const bulletPixels = { normal, pierce };
