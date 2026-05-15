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
  [_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_],
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

// Tier 3 BOSS: 更大史莱姆王 + 醒目金冠 + 腮红（28×28）
const K = 0x55ee99;
const Kd = 0x228855;
const Kw = 0xddffee;
const Ky = 0xffcc33;
const Kg = 0xffaa22;
const Ke = 0x1a4028;

const tier3: PixelGrid = (() => {
  const N = 28;
  const g: PixelGrid = Array.from({ length: N }, () => Array(N).fill(null));
  const cx = 14;
  const cy = 15;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = (x - cx) / 12.5;
      const dy = (y - cy) / 10.2;
      if (dx * dx + dy * dy < 1) {
        const edge = dx * dx + dy * dy;
        g[y][x] = edge < 0.22 ? Kw : edge < 0.62 ? K : Kd;
      }
    }
  }
  // 加宽金冠
  for (let xx = 9; xx <= 18; xx++) g[2][xx] = Ky;
  for (let xx = 10; xx <= 17; xx++) g[3][xx] = Ky;
  g[4][11] = Kg;
  g[4][12] = Kg;
  g[4][13] = Ky;
  g[4][14] = Ky;
  g[4][15] = Ky;
  g[4][16] = Kg;
  g[4][17] = Kg;
  // 眼睛更大
  for (let yy = 11; yy <= 14; yy++) {
    for (let xx = 8; xx <= 11; xx++) g[yy][xx] = xx <= 9 ? Bl : Ke;
    for (let xx = 16; xx <= 19; xx++) g[yy][xx] = xx <= 17 ? Bl : Ke;
  }
  g[10][7] = Ke;
  g[10][20] = Ke;
  // 腮红
  for (let yy = 15; yy <= 17; yy++) {
    g[yy][6] = 0xff88aa;
    g[yy][21] = 0xff88aa;
  }
  return g;
})();

// Tier 4 巨型 BOSS: 40×40 气鼓鼓团子 + 粗眉 + 金纹
const C = 0xff6688;
const Cd = 0xcc3355;
const Cw = 0xffdde8;
const Ce = 0x331122;
const Cc = 0xffee88;
const Cg = 0xff9944;

const tier4: PixelGrid = (() => {
  const N = 40;
  const g: PixelGrid = Array.from({ length: N }, () => Array(N).fill(null));
  const cx = 20;
  const cy = 21;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = (x - cx) / 18.5;
      const dy = (y - cy) / 14.2;
      const d = dx * dx + dy * dy;
      if (d < 1) {
        g[y][x] = d < 0.18 ? Cw : d < 0.52 ? C : Cd;
      }
    }
  }
  // 粗眉
  for (let yy = 9; yy <= 10; yy++) {
    for (let xx = 9; xx <= 15; xx++) g[yy][xx] = Ce;
    for (let xx = 24; xx <= 30; xx++) g[yy][xx] = Ce;
  }
  // 大眼
  for (let yy = 12; yy <= 16; yy++) {
    for (let xx = 10; xx <= 14; xx++) g[yy][xx] = xx <= 12 ? Bl : Ce;
    for (let xx = 25; xx <= 29; xx++) g[yy][xx] = xx <= 27 ? Bl : Ce;
  }
  // 嘴
  for (let xx = 16; xx <= 23; xx++) g[20][xx] = Ce;
  for (let xx = 17; xx <= 22; xx++) g[21][xx] = Ce;
  // 肚皮高光 + 金纹
  for (let yy = 26; yy <= 30; yy++) {
    g[yy][18] = Cc;
    g[yy][19] = Cc;
    g[yy][20] = Cc;
    g[yy][21] = Cc;
  }
  g[24][19] = Cg;
  g[24][20] = Cg;
  g[25][18] = Cg;
  g[25][21] = Cg;
  return g;
})();

export const enemySprites = { tier1, tier2, tier3, tier4 };
