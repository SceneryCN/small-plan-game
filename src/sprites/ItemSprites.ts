import type { EffectType } from '../config/gameConfig';
import type { PixelGrid } from '../utils/pixelCanvas';

const _ = null;

/** 加速射击 — 多枚小弹 + 绿色「快」字感闪电 */
const G = 0x00ff88;
const Gd = 0x00aa55;
const Gw = 0xc8ffe8;

export const fireRate: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,Gd,G,G,G,_,_,_,G,G,Gd,_,_],
  [_,_,G,Gw,G,G,_,_,G,Gw,G,G,_,_],
  [_,_,_,G,G,G,G,G,G,G,G,G,_,_,_],
  [_,_,_,_,Gd,G,G,G,G,Gd,_,_,_,_],
  [_,_,G,G,G,_,G,G,_,G,G,G,_,_],
  [_,G,Gw,G,_,_,G,G,_,_,G,Gw,G,_],
  [_,_,G,G,_,_,G,G,_,_,G,G,_,_],
  [_,_,Gd,_,G,G,G,G,G,G,_,Gd,_,_],
  [_,_,_,G,Gw,G,G,G,Gw,G,_,_,_],
  [_,_,_,_,G,G,G,G,G,G,_,_,_,_],
  [_,_,_,_,_,Gd,G,Gd,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 三连弹 — 中央一发、左右分叉成「人」字形 */
const O = 0xffaa00;
const Od = 0xcc7700;
const Ow = 0xffeeaa;

export const tripleShot: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,_,_,_,_,_,_,_],
  [_,_,_,O,_,_,O,_,_,O,_,_,_,_],
  [_,_,O,Ow,O,_,O,_,O,Ow,O,_,_,_],
  [_,O,Ow,O,Ow,O,O,O,Ow,O,Ow,O,_],
  [_,_,O,O,O,O,O,O,O,O,O,_,_,_],
  [_,_,_,Od,O,O,O,O,O,Od,_,_,_,_],
  [_,_,_,_,O,O,O,O,O,_,_,_,_,_],
  [_,_,_,_,Ow,O,Ow,O,Ow,_,_,_,_,_],
  [_,_,_,_,_,O,O,O,_,_,_,_,_,_],
  [_,_,_,_,_,Ow,O,Ow,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 激光炮 — 飞机剪影下竖直粗光束 */
const L = 0xff44ff;
const Lw = 0xffccff;
const Ld = 0xaa22aa;
const B = 0x4488ff;

export const laser: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,_,_,_,_,_],
  [_,_,_,Ld,L,L,L,L,L,L,Ld,_,_,_],
  [_,_,_,Lw,L,L,L,L,L,L,Lw,_,_,_],
  [_,_,_,Lw,L,L,L,L,L,L,Lw,_,_,_],
  [_,_,_,Lw,L,L,L,L,L,L,Lw,_,_,_],
  [_,_,_,Lw,L,L,L,L,L,L,Lw,_,_,_],
  [_,_,_,Lw,L,L,L,L,L,L,Lw,_,_,_],
  [_,_,_,Ld,L,L,L,L,L,L,Ld,_,_,_],
  [_,_,_,_,Lw,L,L,L,Lw,_,_,_,_,_],
  [_,_,_,_,_,L,L,L,_,_,_,_,_,_],
  [_,_,_,_,_,Ld,Ld,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 全屏爆破 — 辐射三角 + 爆心 */
const N = 0xff0044;
const Nw = 0xff6688;
const Ny = 0xffcc00;

export const nuke: PixelGrid = [
  [_,_,_,_,_,Ny,Ny,Ny,_,_,_,_,_,_],
  [_,_,_,_,Ny,N,N,N,Ny,_,_,_,_,_],
  [_,_,_,Ny,N,Nw,Nw,N,Ny,_,_,_,_],
  [_,_,Ny,N,Nw,Nw,Nw,Nw,N,Ny,_,_],
  [_,Ny,N,Nw,Nw,Ny,Ny,Nw,Nw,N,Ny,_],
  [Ny,N,Nw,Nw,Ny,N,N,Ny,Nw,Nw,N,Ny],
  [_,Ny,N,Nw,Nw,Ny,Ny,Nw,Nw,N,Ny,_],
  [_,_,Ny,N,Nw,Nw,Nw,Nw,N,Ny,_,_],
  [_,_,_,Ny,N,Nw,Nw,N,Ny,_,_,_,_],
  [_,_,_,_,Ny,N,N,N,Ny,_,_,_,_,_],
  [_,_,_,_,_,Ny,N,Ny,_,_,_,_,_,_],
  [_,_,_,_,_,_,N,_,_,_,_,_,_,_],
  [_,_,_,_,_,Ny,Ny,Ny,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 护盾 — 双层六边形护罩 */
const S = 0x4488ff;
const Sw = 0xaaddff;
const Sd = 0x2266cc;

export const shield: PixelGrid = [
  [_,_,_,_,Sd,S,S,S,S,Sd,_,_,_,_],
  [_,_,_,Sd,S,Sw,Sw,Sw,Sw,S,Sd,_,_,_],
  [_,_,Sd,S,Sw,_,_,_,_,Sw,S,Sd,_,_],
  [_,Sd,S,Sw,_,_,_,_,_,_,Sw,S,Sd,_],
  [Sd,S,Sw,_,_,Sd,S,Sd,_,_,Sw,S,Sd],
  [S,Sw,_,_,Sd,S,Sw,S,Sd,_,_,Sw,S],
  [S,Sw,_,_,S,Sw,_,_,Sw,S,_,_,Sw,S],
  [S,Sw,_,_,Sd,S,Sw,S,Sd,_,_,Sw,S],
  [Sd,S,Sw,_,_,Sd,S,Sd,_,_,Sw,S,Sd],
  [_,Sd,S,Sw,_,_,_,_,_,Sw,S,Sd,_],
  [_,_,Sd,S,Sw,_,_,_,_,Sw,S,Sd,_,_],
  [_,_,_,Sd,S,Sw,Sw,Sw,Sw,S,Sd,_,_,_],
  [_,_,_,_,Sd,S,S,S,S,Sd,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 穿透弹 — 黄箭贯穿三层墙 */
const P = 0xffff00;
const Pd = 0xccaa00;
const Pb = 0x666666;

export const pierce: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,Pb,Pb,Pb,_,_,_,_,Pb,Pb,Pb,_,_],
  [_,Pb,Pb,Pb,_,Pd,P,_,Pb,Pb,Pb,_,_],
  [_,Pb,Pb,Pb,P,P,P,P,P,Pb,Pb,Pb,_],
  [_,_,_,Pd,P,P,P,P,P,P,Pd,_,_,_],
  [_,_,P,P,P,P,P,P,P,P,P,P,_,_],
  [_,Pd,P,P,P,P,P,P,P,P,P,P,Pd,_],
  [_,_,P,P,P,P,P,P,P,P,P,P,_,_],
  [_,_,_,Pd,P,P,P,P,P,P,Pd,_,_,_],
  [_,Pb,Pb,Pb,P,P,P,P,P,Pb,Pb,Pb,_],
  [_,Pb,Pb,Pb,_,Pd,P,_,Pb,Pb,Pb,_,_],
  [_,Pb,Pb,Pb,_,_,_,_,Pb,Pb,Pb,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 浮游炮 — 机体两侧小炮塔 + 轨道点 */
const D = 0x00ccff;
const Dd = 0x0088aa;
const Dw = 0xaaeeff;
const Dc = 0xffffff;

export const drone: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,Dd,D,D,D,_,_,_,Dd,D,D,D,_],
  [_,D,Dw,Dc,D,_,_,D,Dw,Dc,D,_],
  [_,D,Dc,D,D,_,_,D,Dc,D,D,_],
  [_,D,D,D,D,_,_,D,D,D,D,_],
  [_,_,Dd,_,_,_,_,_,_,Dd,_,_,_],
  [_,_,D,_,Dc,_,_,Dc,_,D,_,_,_],
  [_,_,_,D,D,D,D,D,D,_,_,_,_],
  [_,_,_,_,D,D,D,D,_,_,_,_,_],
  [_,_,_,_,_,D,D,_,_,_,_,_,_],
  [_,_,D,_,_,_,_,_,_,D,_,_,_],
  [_,D,Dw,D,_,_,_,_,D,Dw,D,_,_],
  [_,_,D,_,_,_,_,_,_,D,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 跟踪弹 — 雷达扇形 + 四个锁定点 */
const H = 0xff8844;
const Hd = 0xcc5522;
const Hw = 0xffccaa;
const Hz = 0xff2200;

export const homing: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,Hz,Hz,Hz,Hz,Hz,_,_,_,_],
  [_,_,_,Hz,Hw,H,H,H,Hw,Hz,_,_,_],
  [_,_,Hz,Hw,H,H,H,H,H,Hw,Hz,_,_],
  [_,Hz,Hw,H,H,Hd,Hd,H,H,Hw,Hz,_],
  [_,_,Hw,H,Hd,Hz,Hz,Hd,H,H,Hw,_],
  [_,_,_,H,Hd,Hz,Hz,Hd,H,H,_,_,_],
  [_,_,_,_,Hd,Hz,Hz,Hd,_,_,_,_,_],
  [_,_,Hz,_,Hz,Hz,Hz,Hz,_,Hz,_,_,_],
  [_,Hz,Hw,Hz,_,_,_,_,Hz,Hw,Hz,_],
  [_,_,Hz,Hw,Hz,_,_,Hz,Hw,Hz,_,_],
  [_,_,_,Hz,Hw,Hz,Hz,Hw,Hz,_,_,_],
  [_,_,_,_,Hz,Hw,Hw,Hz,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 回血 — 红心 + 白十字 */
const Rh = 0x00ff88;
const Rhd = 0x00aa55;
const Rw = 0xffffff;

export const heal: PixelGrid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,Rhd,Rh,Rh,Rh,Rhd,_,_,_,_],
  [_,_,_,Rhd,Rh,Rw,Rw,Rh,Rhd,_,_,_,_],
  [_,_,Rhd,Rh,Rw,Rw,Rw,Rw,Rh,Rhd,_,_,_],
  [_,Rhd,Rh,Rw,Rw,Rw,Rw,Rw,Rw,Rh,Rhd,_,_],
  [_,Rh,Rw,Rw,Rw,Rw,Rw,Rw,Rw,Rw,Rh,_],
  [Rhd,Rh,Rw,Rw,Rw,Rw,Rw,Rw,Rw,Rw,Rh,Rhd],
  [_,Rh,Rw,Rw,Rw,Rw,Rw,Rw,Rw,Rw,Rh,_],
  [_,Rhd,Rh,Rw,Rw,Rw,Rw,Rw,Rh,Rhd,_,_],
  [_,_,Rhd,Rh,Rw,Rh,Rw,Rh,Rhd,_,_,_,_],
  [_,_,_,Rhd,Rh,Rw,Rh,Rhd,_,_,_,_,_],
  [_,_,_,_,Rhd,Rh,Rhd,_,_,_,_,_,_],
  [_,_,_,_,_,Rhd,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 反应装甲 — 板甲胸甲 + 中央铆钉 */
const Ar = 0x8899aa;
const Arm = 0x556070;
const Arh = 0xc8d8e8;
const Arx = 0xffdd44;

export const armor: PixelGrid = [
  [_,_,_,_,Arm,Ar,Ar,Ar,Ar,Arm,_,_,_,_],
  [_,_,Arm,Ar,Arh,Arh,Arh,Arh,Arh,Ar,Arm,_,_],
  [_,Arm,Ar,Arh,Arx,Arh,Arh,Arh,Arx,Arh,Ar,Arm,_],
  [Arm,Ar,Arh,Arh,Arh,Arh,Arh,Arh,Arh,Arh,Ar,Ar,Arm],
  [Arm,Ar,Arh,Arm,Arm,Arm,Arm,Arm,Arm,Arh,Ar,Ar,Arm],
  [_,Arm,Ar,Arm,Arh,Arh,Arh,Arh,Arh,Arm,Ar,Arm,_],
  [_,_,Arm,Arm,Ar,Arh,Arh,Arh,Ar,Arm,Arm,_,_,_],
  [_,_,_,Arm,Arm,Arm,Arm,Arm,Arm,Arm,_,_,_,_],
  [_,_,Arm,Arh,Arm,Arm,Arm,Arm,Arm,Arh,Arm,_,_],
  [_,Arm,Ar,Arh,Arh,Arh,Arh,Arh,Arh,Arh,Ar,Arm,_],
  [_,_,Arm,Ar,Ar,Ar,Ar,Ar,Ar,Ar,Arm,_,_,_],
  [_,_,_,Arm,Arm,Arm,Arm,Arm,Arm,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
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
  heal,
  armor,
};
