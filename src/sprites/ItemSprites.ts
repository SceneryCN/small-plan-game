import type { EffectType } from '../config/gameConfig';
import type { PixelGrid } from '../utils/pixelCanvas';

const _ = null;

/** 射速 — 绿色闪电 */
const G = 0x00ff88;
const Gd = 0x00aa55;
const Gw = 0xb8ffdd;

export const fireRate: PixelGrid = [
  [_,_,_,Gd,G,_,_,_,_,_,_,_,_,_],
  [_,_,G,G,Gw,G,_,_,_,_,_,_,_,_],
  [_,_,_,_,G,G,G,_,_,_,_,_,_,_],
  [_,_,_,_,_,G,G,G,_,_,_,_,_,_],
  [_,_,_,_,_,_,G,G,G,_,_,_,_,_],
  [_,_,_,_,_,_,_,G,G,G,_,_,_,_],
  [_,_,_,_,_,_,_,_,G,G,G,_,_,_],
  [_,_,_,_,_,_,_,_,_,G,G,G,_,_],
  [_,_,_,G,G,_,_,_,_,_,G,G,G,_],
  [_,_,G,Gw,G,G,_,_,_,_,_,G,G,_],
  [_,G,Gw,G,G,G,_,_,_,_,_,_,_,_],
  [_,_,G,G,Gd,_,_,_,_,_,_,_,_,_],
  [_,_,_,Gd,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 三连弹 — 三枚竖直弹头 */
const O = 0xffaa00;
const Od = 0xcc7700;
const Ow = 0xffdd88;

export const tripleShot: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,Ow,O,Ow,_,Ow,O,Ow,_,_,_],
  [_,_,_,O,O,O,_,O,O,O,_,_,_],
  [_,_,_,O,O,O,_,O,O,O,_,_,_],
  [_,_,_,O,O,O,_,O,O,O,_,_,_],
  [_,_,_,Od,O,Od,_,Od,O,Od,_,_,_],
  [_,_,_,O,O,O,_,O,O,O,_,_,_],
  [_,_,_,O,O,O,_,O,O,O,_,_,_],
  [_,_,_,O,O,O,_,O,O,O,_,_,_],
  [_,_,_,Od,O,Od,_,Od,O,Od,_,_,_],
  [_,_,_,O,O,O,_,O,O,O,_,_,_],
  [_,_,_,_,O,_,_,_,O,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 激光 — 粉紫能量条 */
const L = 0xff44ff;
const Lw = 0xffccff;
const Ld = 0xaa22aa;

export const laser: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,Ld,Ld,Ld,Ld,Ld,Ld,Ld,Ld,Ld,Ld,Ld,_,_],
  [Lw,L,L,L,L,L,L,L,L,L,L,L,L,Lw],
  [_,Lw,Lw,Lw,Lw,Lw,Lw,Lw,Lw,Lw,Lw,Lw,_,_],
  [_,_,L,L,L,L,L,L,L,L,L,_,_,_],
  [_,Ld,L,L,L,L,L,L,L,L,L,Ld,_,_],
  [Lw,L,L,L,L,L,L,L,L,L,L,L,Lw],
  [_,_,Lw,Lw,Lw,Lw,Lw,Lw,Lw,Lw,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 全屏爆破 — 星形爆心 */
const N = 0xff0044;
const Nw = 0xff6688;
const Ny = 0xffcc00;

export const nuke: PixelGrid = [
  [_,_,_,_,_,_,Ny,Ny,_,_,_,_,_,_],
  [_,_,_,_,_,Ny,N,N,Ny,_,_,_,_,_],
  [_,_,_,_,Ny,N,Nw,N,Ny,_,_,_,_,_],
  [_,Ny,_,Ny,N,Nw,Nw,N,Ny,_,Ny,_,_],
  [_,_,Ny,N,Nw,Nw,Nw,Nw,N,Ny,_,_],
  [_,_,N,Nw,Nw,Nw,Nw,Nw,Nw,N,_,_],
  [Ny,Ny,Nw,Nw,Nw,Ny,Ny,Nw,Nw,Nw,Ny,Ny],
  [_,_,N,Nw,Nw,Nw,Nw,Nw,Nw,N,_,_],
  [_,_,Ny,N,Nw,Nw,Nw,Nw,N,Ny,_,_],
  [_,Ny,_,Ny,N,Nw,Nw,N,Ny,_,Ny,_,_],
  [_,_,_,_,Ny,N,Nw,N,Ny,_,_,_,_,_],
  [_,_,_,_,_,Ny,N,N,Ny,_,_,_,_,_],
  [_,_,_,_,_,_,Ny,Ny,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 护盾 — 浅蓝护罩 */
const S = 0x4488ff;
const Sw = 0xaaddff;
const Sd = 0x2266cc;

export const shield: PixelGrid = [
  [_,_,_,_,_,Sd,S,S,Sd,_,_,_,_,_],
  [_,_,_,Sd,S,Sw,Sw,Sw,S,Sd,_,_,_],
  [_,_,Sd,S,Sw,_,_,_,Sw,S,Sd,_,_],
  [_,Sd,S,Sw,_,_,_,_,_,Sw,S,Sd,_],
  [Sd,S,Sw,_,_,_,_,_,_,_,Sw,S,Sd],
  [S,Sw,_,_,_,_,_,_,_,_,_,Sw,S],
  [S,Sw,_,_,_,_,_,_,_,_,_,Sw,S],
  [S,Sw,_,_,_,_,_,_,_,_,_,Sw,S],
  [S,Sw,_,_,_,_,_,_,_,_,_,Sw,S],
  [Sd,S,Sw,_,_,_,_,_,_,Sw,S,Sd],
  [_,Sd,S,Sw,_,_,_,_,Sw,S,Sd,_],
  [_,_,Sd,S,Sw,_,_,_,Sw,S,Sd,_,_],
  [_,_,_,Sd,S,Sw,Sw,Sw,S,Sd,_,_,_],
  [_,_,_,_,_,Sd,S,S,Sd,_,_,_,_,_],
];

/** 穿透 — 黄箭贯穿 */
const P = 0xffff00;
const Pd = 0xccaa00;
const Pb = 0x888888;

export const pierce: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,Pd,P,P,P,P,P,P,P,P,P,_,_],
  [_,_,_,Pd,P,P,P,P,P,P,P,_,_,_],
  [_,_,_,_,Pd,P,P,P,P,P,_,_,_,_],
  [_,_,Pb,Pb,Pb,Pd,P,P,P,P,P,_,_],
  [_,_,Pb,0xffffff,0xffffff,Pb,Pd,P,P,P,P,_],
  [_,_,Pb,0xffffff,0xffffff,Pb,P,P,Pd,P,P,_],
  [_,_,Pb,Pb,Pb,P,P,P,P,P,Pd,_],
  [_,_,_,_,P,P,P,P,P,Pd,_,_,_],
  [_,_,_,P,P,P,P,P,Pd,_,_,_,_],
  [_,_,P,P,P,P,P,Pd,_,_,_,_,_],
  [_,Pd,P,P,P,P,Pd,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 浮游炮 — 青环卫星 */
const D = 0x00ccff;
const Dd = 0x0088aa;
const Dw = 0xaaeeff;
const Dc = 0xffffff;

export const drone: PixelGrid = [
  [_,_,_,_,Dd,D,D,D,Dd,_,_,_,_,_],
  [_,_,_,Dd,Dw,D,D,D,Dw,Dd,_,_,_],
  [_,_,Dd,Dw,D,Dc,D,D,Dw,D,Dd,_],
  [_,Dd,Dw,D,Dc,Dc,Dc,D,D,Dw,Dd],
  [Dd,D,D,Dc,Dc,Dc,Dc,Dc,D,D,D,Dd],
  [D,D,D,Dc,Dc,Dc,Dc,Dc,D,D,D,D],
  [D,D,Dc,Dc,Dc,Dc,Dc,Dc,Dc,D,D,D],
  [D,D,D,Dc,Dc,Dc,Dc,Dc,D,D,D,D],
  [Dd,D,D,Dc,Dc,Dc,Dc,Dc,D,D,D,Dd],
  [_,Dd,Dw,D,Dc,Dc,Dc,D,D,Dw,Dd],
  [_,_,Dd,Dw,D,Dc,D,D,Dw,D,Dd,_],
  [_,_,_,Dd,Dw,D,D,D,Dw,Dd,_,_,_],
  [_,_,_,_,Dd,D,D,D,Dd,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 跟踪弹 — 橙弧寻的 */
const H = 0xff8844;
const Hd = 0xcc5522;
const Hw = 0xffccaa;
const Ht = 0xff2200;

export const homing: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,Ht,_,_,_,_],
  [_,_,_,_,_,_,_,_,Ht,Hw,Ht,_,_],
  [_,_,_,_,_,_,_,Ht,Hw,H,Hd,_],
  [_,_,_,_,_,_,Ht,Hw,H,Hd,_,_,_],
  [_,_,_,_,_,Ht,Hw,H,Hd,_,_,_,_],
  [_,_,_,_,Ht,Hw,H,Hd,_,_,_,_,_],
  [_,_,_,Ht,Hw,H,Hd,_,_,_,_,_,_],
  [_,_,Ht,Hw,H,Hd,_,_,_,_,_,_,_],
  [_,Ht,Hw,H,Hd,_,_,_,_,_,_,_,_],
  [Ht,Hw,H,Hd,_,_,_,_,_,_,_,_,_],
  [Hw,H,Hd,_,_,_,_,_,_,_,_,_,_],
  [H,Hd,_,_,_,_,_,_,_,_,_,_,_,_],
  [Hd,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

export const itemEffectSprites: Record<EffectType, PixelGrid> = {
  fireRate,
  tripleShot,
  laser,
  nuke,
  shield,
  pierce,
  drone,
  homing,
};
