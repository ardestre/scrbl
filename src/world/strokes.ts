import type { Point, Stroke } from './types';

export const PAPER_SIZE = 1000;

export type Box = { x: number; y: number; w: number; h: number };

export function bounds(strokes: Stroke[]): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    for (const [x, y] of s.points) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (minX > maxX) return { x: 0, y: 0, w: PAPER_SIZE, h: PAPER_SIZE };
  return { x: minX, y: minY, w: Math.max(maxX - minX, 1), h: Math.max(maxY - minY, 1) };
}

/** A stroke that ends near where it started reads as a shape the art can fill. */
export function isClosed(stroke: Stroke): boolean {
  const pts = stroke.points;
  if (pts.length < 8) return false;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  const b = bounds([stroke]);
  return Math.hypot(ax - bx, ay - by) < Math.max(40, 0.25 * Math.max(b.w, b.h));
}

/** Smooth SVG path through the points, using midpoints as curve ends. */
export function toPath(points: Point[], close = false): string {
  if (points.length === 0) return '';
  const f = (n: number) => Math.round(n * 10) / 10;
  const [x0, y0] = points[0];
  if (points.length === 1) return `M${f(x0)} ${f(y0)}L${f(x0 + 0.1)} ${f(y0 + 0.1)}`;
  let d = `M${f(x0)} ${f(y0)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += `Q${f(x)} ${f(y)} ${f((x + nx) / 2)} ${f((y + ny) / 2)}`;
  }
  const [lx, ly] = points[points.length - 1];
  d += `L${f(lx)} ${f(ly)}`;
  return close ? d + 'Z' : d;
}

/** Small seeded random generator, so the same creation always draws the same way. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

export function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const rgbToHex = (rgb: number[]) =>
  '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

export const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
};

export const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/** The crayon used most, ignoring the dark outline crayon when there is another. */
export function mainColor(strokes: Stroke[]): string | undefined {
  const use = new Map<string, number>();
  for (const s of strokes) use.set(s.color, (use.get(s.color) ?? 0) + s.points.length);
  const ranked = [...use.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  return ranked.find((c) => luminance(c) >= 0.3) ?? ranked[0];
}
