import { GAME_CONFIG } from '../config/gameConfig';
import { clamp } from '../utils/math';

export interface LogicalPointerTarget {
  x: number;
  y: number;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private logicalWidth: number;
  private logicalHeight: number;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private isDragging = false;

  constructor(canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) {
    this.canvas = canvas;
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.bind();
  }

  private toLogicalX(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = this.logicalWidth / rect.width;
    return clamp((clientX - rect.left) * ratio, GAME_CONFIG.PLAYER_SIZE, this.logicalWidth - GAME_CONFIG.PLAYER_SIZE);
  }

  private toLogicalY(clientY: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = this.logicalHeight / rect.height;
    const margin = GAME_CONFIG.PLAYER_SIZE;
    return clamp((clientY - rect.top) * ratio, margin, this.logicalHeight - margin);
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
    this.targetY = this.toLogicalY(e.clientY);
  };

  private onPointerMove = (e: MouseEvent) => {
    if (this.isDragging) {
      this.targetX = this.toLogicalX(e.clientX);
      this.targetY = this.toLogicalY(e.clientY);
    }
  };

  private onPointerUp = () => {
    this.isDragging = false;
  };

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this.isDragging = true;
    this.targetX = this.toLogicalX(e.touches[0].clientX);
    this.targetY = this.toLogicalY(e.touches[0].clientY);
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (this.isDragging) {
      this.targetX = this.toLogicalX(e.touches[0].clientX);
      this.targetY = this.toLogicalY(e.touches[0].clientY);
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.isDragging = false;
  };

  /** 拖拽中返回当前逻辑坐标目标，否则 null（保持上一帧位置） */
  getTarget(): LogicalPointerTarget | null {
    if (!this.isDragging || this.targetX === null || this.targetY === null) return null;
    return { x: this.targetX, y: this.targetY };
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
