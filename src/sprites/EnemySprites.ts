import type { PixelGrid } from '../utils/pixelCanvas';

const _ = null;

// Tier 1: 软萌粉豆 + 大眼睛
const P = 0xff8ec8;
const Pd = 0xe060a0;
const E = 0x222222;
const B = 0xffb0d8;
const Bl = 0xffffff;

const tier1: PixelGrid = [
  [_,_,_,_,_,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,P,B,B,B,B,P,_,_,_,_],
  [_,_,_,P,B,P,P,P,P,B,P,_,_,_],
  [_,_,P,B,P,E,Bl,Bl,E,P,B,P,_],
  [_,_,P,B,P,E,Bl,Bl,E,P,B,P,_],
  [_,P,B,P,P,P,P,P,P,P,P,B,P,_],
  [_,P,B,P,P,Pd,P,P,Pd,P,P,B,P,_],
  [_,P,B,P,P,P,P,P,P,P,P,B,P,_],
  [_,_,P,B,P,P,P,P,P,P,B,P,_],
  [_,_,_,P,B,P,P,P,P,B,P,_,_],
  [_,_,_,_,P,B,B,B,B,P,_,_,_],
  [_,_,_,_,_,P,P,P,P,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Tier 2: 果冻紫团子 + 小触角
const J = 0xc8a0ff;
const Jd = 0x8860cc;
const Jw = 0xeeddff;
const Je = 0x3a2060;

const tier2: PixelGrid = [
  [_,_,Jw,J,J,J,J,Jw,_,_,_,_,_,_,_],
  [_,Jw,J,Jw,Jw,Jw,J,J,Jw,_,_,_,_,_],
  [_,J,Jw,Jw,J,J,Jw,Jw,J,J,_,_,_,_],
  [Jw,J,J,J,J,J,J,J,J,J,J,Jw,_,_,_],
  [J,Jw,J,J,Jw,Jw,J,J,J,Jw,J,J,_],
  [J,J,J,J,Je,Bl,Bl,Je,J,J,J,J,J],
  [J,J,J,J,Je,Bl,Bl,Je,J,J,J,J,J],
  [J,J,J,J,J,J,J,J,J,J,J,J,J],
  [J,J,J,J,Jd,J,J,Jd,J,J,J,J,J],
  [_,J,J,J,J,J,J,J,J,J,J,J,_],
  [_,_,J,J,J,J,J,J,J,J,J,_,_],
  [_,_,_,J,J,Jd,Jd,J,J,J,_,_,_],
  [_,_,_,_,J,J,J,J,J,_,_,_,_],
  [_,_,_,_,_,J,J,J,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Tier 3: 胖史莱姆王 + 小皇冠
const K = 0x66ff99;
const Kd = 0x33cc66;
const Kw = 0xccffdd;
const Ky = 0xffdd44;
const Ke = 0x1a4028;

const tier3: PixelGrid = (() => {
  const g: PixelGrid = Array.from({ length: 20 }, () => Array(20).fill(null));
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const dx = (x - 10) / 9.2;
      const dy = (y - 11) / 7.8;
      if (dx * dx + dy * dy < 1) {
        const edge = dx * dx + dy * dy;
        g[y][x] = edge < 0.35 ? Kw : edge < 0.7 ? K : Kd;
      }
    }
  }
  // crown
  g[3][8] = Ky; g[3][9] = Ky; g[3][10] = Ky; g[3][11] = Ky;
  g[2][9] = Ky; g[2][10] = Ky;
  g[1][9] = Ky;
  // eyes
  g[8][6] = Ke; g[8][7] = Bl; g[8][8] = Ke;
  g[8][11] = Ke; g[8][12] = Bl; g[8][13] = Ke;
  g[9][7] = Bl; g[9][8] = Ke;
  g[9][11] = Bl; g[9][12] = Ke;
  // blush
  g[11][5] = 0xff88aa; g[11][14] = 0xff88aa;
  return g;
})();

// Tier 4: 大号「气鼓鼓」团子 — 可爱但更有压迫感
const C = 0xff7799;
const Cd = 0xdd4466;
const Cw = 0xffccd8;
const Ce = 0x442233;
const Cc = 0xffee88;

const tier4: PixelGrid = (() => {
  const g: PixelGrid = Array.from({ length: 28 }, () => Array(28).fill(null));
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const dx = (x - 14) / 13;
      const dy = (y - 15) / 10.5;
      const d = dx * dx + dy * dy;
      if (d < 1) {
        g[y][x] = d < 0.2 ? Cw : d < 0.55 ? C : Cd;
      }
    }
  }
  // angry brows
  for (let i = 0; i < 5; i++) {
    g[7][8 + i] = Ce;
    g[7][15 + i] = Ce;
  }
  // eyes
  for (let yy = 9; yy <= 11; yy++) {
    for (let xx = 8; xx <= 11; xx++) g[yy][xx] = xx <= 9 ? Bl : Ce;
    for (let xx = 16; xx <= 19; xx++) g[yy][xx] = xx <= 17 ? Bl : Ce;
  }
  // mouth
  for (let xx = 11; xx <= 16; xx++) g[14][xx] = Ce;
  g[15][12] = Ce; g[15][13] = Ce; g[15][14] = Ce; g[15][15] = Ce;
  // belly shine
  g[18][13] = Cc; g[18][14] = Cc; g[19][13] = Cc; g[19][14] = Cc;
  return g;
})();

export const enemySprites = { tier1, tier2, tier3, tier4 };
