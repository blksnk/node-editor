import { Vec2 } from '../renderer/renderer.types';

export const eventPos = (e: PointerEvent): Vec2 => ({
  x: e.clientX,
  y: e.clientY,
});

export const vecDelta = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const clamp = (n: number, min: number, max: number): number =>
  Math.max(Math.min(n, max), min);

export const vecClamp = (v: Vec2, min: Vec2, max: Vec2): Vec2 => ({
  x: clamp(v.x, min.x, max.x),
  y: clamp(v.y, min.y, max.y),
});

export const mapRange = (
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
