import type { PixelGrid } from '../utils/pixelCanvas';

const _ = null;
const C = 0x00ffcc;
const D = 0x00ccaa;
const W = 0xffffff;
const B = 0x0088ff;
const Vc = 0xff1166;
const Vw = 0xffccdd;
const G = 0x00ff88;

/** 默认机体像素（朝上） */
export const playerPixels: PixelGrid = [
  [_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,W,C,C,W,_,_,_,_,_,_],
  [_,_,_,_,_,W,C,C,C,C,W,_,_,_,_,_],
  [_,_,_,_,_,C,C,W,W,C,C,_,_,_,_,_],
  [_,_,_,_,C,C,C,C,C,C,C,C,_,_,_,_],
  [_,_,_,C,C,C,C,C,C,C,C,C,C,_,_,_],
  [_,_,_,C,D,C,C,C,C,C,C,D,C,_,_,_],
  [_,_,C,C,D,D,C,C,C,C,D,D,C,C,_,_],
  [_,_,C,C,D,D,C,Vw,Vc,C,D,D,C,C,_,_],
  [_,G,C,C,C,C,C,C,C,C,C,C,C,C,G,_],
  [_,G,D,C,C,C,C,C,C,C,C,C,C,D,G,_],
  [G,G,D,D,C,C,C,C,C,C,C,C,D,D,G,G],
  [_,_,D,D,D,C,C,C,C,C,C,D,D,D,_,_],
  [_,_,_,D,D,D,_,_,_,_,D,D,D,_,_,_],
  [_,_,_,_,D,_,_,_,_,_,_,D,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 带盔甲外观：银灰装甲 + 侧板加粗，与默认机体同尺寸便于热切换纹理 */
const Ag = 0xb8c4d0;
const Am = 0x7a8899;
const Ad = 0x4a5566;
const Ay = 0xffdd66;

export const playerArmorPixels: PixelGrid = [
  [_,_,_,_,_,_,_,Ay,Ay,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,Ay,Ag,Ag,Ay,_,_,_,_,_,_],
  [_,_,_,_,_,Ay,Ag,Am,Am,Ag,Ay,_,_,_,_,_],
  [_,_,_,_,_,Am,Am,Ay,Ay,Am,Am,_,_,_,_,_],
  [_,_,_,_,Am,Am,Am,Am,Am,Am,Am,Am,_,_,_,_],
  [_,_,_,Am,Am,Ad,Am,Am,Am,Am,Ad,Am,Am,_,_,_],
  [_,_,_,Am,Ad,Ad,Am,Am,Am,Am,Ad,Ad,Am,_,_,_],
  [_,_,Am,Am,Ad,Ad,Am,Am,Am,Am,Ad,Ad,Am,Am,_,_],
  [_,_,Am,Am,Ad,Ad,Am,Vw,Vc,Am,Ad,Ad,Am,Am,_,_],
  [_,Ay,Am,Am,Am,Am,Am,Am,Am,Am,Am,Am,Am,Am,Ay,_],
  [_,Ay,Ad,Am,Am,Am,Am,Am,Am,Am,Am,Am,Am,Ad,Ay,_],
  [Ay,Ay,Ad,Ad,Am,Am,Am,Am,Am,Am,Am,Am,Ad,Ad,Ay,Ay],
  [_,_,Ad,Ad,Ad,Am,Am,Am,Am,Am,Am,Ad,Ad,Ad,_,_],
  [_,_,_,Ad,Ad,Ad,_,_,_,_,Ad,Ad,Ad,_,_,_],
  [_,_,_,_,Ad,_,_,_,_,_,_,Ad,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

/** 浮游炮 / 铠甲浮游：机身两侧悬浮炮舱 */
const Fd = 0x0088aa;
const F = 0x00ddff;

export const playerWithDronesPixels: PixelGrid = playerPixels.map((row, yi) =>
  row.map((cell, xi) => {
    const leftPod = (xi === 2 || xi === 3) && yi >= 10 && yi <= 12;
    const rightPod = (xi === 12 || xi === 13) && yi >= 10 && yi <= 12;
    if (leftPod || rightPod) {
      const edge = xi === 2 || xi === 12;
      return edge ? Fd : F;
    }
    return cell;
  })
) as PixelGrid;

export const playerArmoredWithDronesPixels: PixelGrid = playerArmorPixels.map((row, yi) =>
  row.map((cell, xi) => {
    const leftPod = (xi === 2 || xi === 3) && yi >= 10 && yi <= 12;
    const rightPod = (xi === 12 || xi === 13) && yi >= 10 && yi <= 12;
    if (leftPod || rightPod) {
      const edge = xi === 2 || xi === 12;
      return edge ? Fd : F;
    }
    return cell;
  })
) as PixelGrid;

/** 尾焰像素 */
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
