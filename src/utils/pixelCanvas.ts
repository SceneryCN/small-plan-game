import { Texture, ImageSource } from 'pixi.js';

export type PixelGrid = (number | null)[][];

export function createPixelTexture(grid: PixelGrid, scale = 1): Texture {
  const h = grid.length;
  const w = grid[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d')!;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const color = grid[y]?.[x];
      if (color != null) {
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  return textureFromCanvas(canvas);
}

export function createSolidTexture(width: number, height: number, color: number): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, width, height);
  return textureFromCanvas(canvas);
}

function textureFromCanvas(canvas: HTMLCanvasElement): Texture {
  const source = new ImageSource({
    resource: canvas,
    scaleMode: 'nearest',
  });
  return new Texture({ source });
}
