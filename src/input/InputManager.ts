import { GAME_CONFIG } from '../config/gameConfig';
import { clamp } from '../utils/math';

export class InputManager {
  private canvas: HTMLCanvasElement;
  private logicalWidth: number;
  private targetX: number | null = null;
  private isDragging = false;

  constructor(canvas: HTMLCanvasElement, logicalWidth: number) {
    this.canvas = canvas;
    this.logicalWidth = logicalWidth;
    this.bind();
  }

  private toLogicalX(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = this.logicalWidth / rect.width;
    return clamp((clientX - rect.left) * ratio, GAME_CONFIG.PLAYER_SIZE, this.logicalWidth - GAME_CONFIG.PLAYER_SIZE);
  }

  private bind(): void {
    this.canvas.addEventListener('mousedown', this.onPointerDown);
    this.canvas.addEventListener('mousemove', this.onPointerMove);
    this.canvas.addEventListener('mouseup', this.onPointerUp);
    this.canvas.addEventListener('mouseleave', this.onPointerUp);
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
  }

  private onPointerDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.targetX = this.toLogicalX(e.clientX);
  };

  private onPointerMove = (e: MouseEvent) => {
    if (this.isDragging) {
      this.targetX = this.toLogicalX(e.clientX);
    }
  };

  private onPointerUp = () => {
    this.isDragging = false;
  };

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this.isDragging = true;
    this.targetX = this.toLogicalX(e.touches[0].clientX);
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (this.isDragging) {
      this.targetX = this.toLogicalX(e.touches[0].clientX);
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.isDragging = false;
  };

  getTargetX(): number | null {
    return this.isDragging ? this.targetX : null;
  }

  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.onPointerDown);
    this.canvas.removeEventListener('mousemove', this.onPointerMove);
    this.canvas.removeEventListener('mouseup', this.onPointerUp);
    this.canvas.removeEventListener('mouseleave', this.onPointerUp);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
  }
}
