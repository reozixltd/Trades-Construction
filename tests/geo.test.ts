import { describe, expect, it } from 'vitest';
import { projectPoints } from '@/lib/geo';

const pts = [
  { id: 'west', lat: -33.75, lng: 150.7 },
  { id: 'east', lat: -33.75, lng: 151.0 },
  { id: 'north', lat: -33.6, lng: 150.85 },
];

describe('projectPoints', () => {
  it('fits all points inside the padded viewBox', () => {
    const { points, width, height } = projectPoints(pts, { width: 600, padding: 40 });
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(40);
      expect(p.x).toBeLessThanOrEqual(width - 40);
      expect(p.y).toBeGreaterThanOrEqual(40);
      expect(p.y).toBeLessThanOrEqual(height - 40);
    }
  });

  it('keeps west left of east and north above south', () => {
    const { points } = projectPoints(pts, { width: 600, padding: 40 });
    const by = Object.fromEntries(points.map((p) => [p.id, p]));
    expect(by.west!.x).toBeLessThan(by.east!.x);
    expect(by.north!.y).toBeLessThan(by.west!.y);
  });

  it('preserves aspect (longitude scaled by cos(latitude))', () => {
    const { width, height } = projectPoints(pts, { width: 600, padding: 0 });
    const lngSpan = 0.3 * Math.cos((33.675 * Math.PI) / 180);
    expect(height / width).toBeCloseTo(0.15 / lngSpan, 2);
  });

  it('skips entries without coordinates', () => {
    const { points } = projectPoints([...pts, { id: 'none' }], { width: 600 });
    expect(points.map((p) => p.id)).not.toContain('none');
  });
});
