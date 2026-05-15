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

/** 敌弹：红核 + 暗红尾 */
const R = 0xff3333;
const Rd = 0xaa0000;
const Rw = 0xffaaaa;

const enemy: PixelGrid = [
  [_,_,_,Rd,R,R,Rd,_],
  [_,_,Rd,Rw,R,R,Rw,Rd],
  [_,Rd,Rw,R,R,R,Rw,Rd],
  [_,Rd,R,R,R,R,R,Rd],
  [_,Rd,Rw,R,R,R,Rw,Rd],
  [_,_,Rd,Rw,R,R,Rw,Rd],
  [_,_,_,Rd,R,R,Rd,_],
  [_,_,_,_,_,_,_,_],
];

/** 玩家跟踪弹：月牙（凸向飞行方向上方） */
const M = 0xff8833;
const Mw = 0xffcc99;

const homingCrescent: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_],
  [_,_,_,Mw,M,M,M,_,_,_],
  [_,_,Mw,M,M,M,M,Mw,_,_],
  [_,Mw,M,M,M,M,M,M,Mw,_],
  [Mw,M,M,M,M,M,M,M,M,Mw],
  [_,M,M,M,M,M,M,M,M,_],
  [_,_,M,M,M,M,M,M,_,_],
  [_,_,_,M,M,M,M,_,_,_],
  [_,_,_,_,M,M,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_],
];

export const bulletPixels = { normal, pierce, enemy, homingCrescent };
