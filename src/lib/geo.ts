/**
 * Projects lat/lng points into SVG coordinates for the service-area map.
 * Equirectangular with longitude scaled by cos(mean latitude), which is
 * accurate enough at suburb scale (tens of km). Pure and unit-tested.
 */
export interface GeoPoint {
  id: string;
  lat?: number;
  lng?: number;
}

export interface ProjectedPoint {
  id: string;
  x: number;
  y: number;
}

export function projectPoints(points: readonly GeoPoint[], opts: { width: number; padding?: number }) {
  const padding = opts.padding ?? 32;
  const located = points.filter((p): p is GeoPoint & { lat: number; lng: number } => typeof p.lat === 'number' && typeof p.lng === 'number');
  if (located.length === 0) return { points: [] as ProjectedPoint[], width: opts.width, height: opts.width / 2 };

  const lats = located.map((p) => p.lat);
  const lngs = located.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);

  const spanX = Math.max((maxLng - minLng) * k, 1e-6);
  const spanY = Math.max(maxLat - minLat, 1e-6);
  const inner = opts.width - 2 * padding;
  const scale = inner / spanX;
  const height = spanY * scale + 2 * padding;

  return {
    width: opts.width,
    height,
    points: located.map((p) => ({
      id: p.id,
      x: padding + (p.lng - minLng) * k * scale,
      y: padding + (maxLat - p.lat) * scale,
    })),
  };
}
