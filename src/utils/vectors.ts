import { Vec2 } from '../renderer/renderer.types';

export const eventPos = (e: PointerEvent): Vec2 => ({
  x: e.clientX,
  y: e.clientY,
});

export const vecDelta = (a: Vec2, b: Vec2): Vec2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});
