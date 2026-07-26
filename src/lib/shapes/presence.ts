/**
 * Global Presence geo field — the data behind the globe→map unwrap.
 *
 * This page's field is NOT a sequence of position buffers. Every stage is the
 * same set of points at the same lat/lon; what changes is a single `bend`
 * parameter that the vertex shader turns into a position (see the unwrap in
 * particle-scene.ts). So instead of five count*3 buffers, the page ships one
 * lat/lon pair per particle and the entire signature moment costs one float per
 * frame.
 *
 * Why not lerp between a sphere buffer and a flat-map buffer: a straight-line
 * interpolation between those two sends every particle through the sphere's
 * interior. It reads as the globe being crushed flat, not unwrapped. The
 * analytic family in the shader keeps the point set on a coherent surface at
 * every intermediate value, which is what makes it read as unrolling.
 */

import { buildGlobeGeometry } from "../globe-geometry";
import { vec3ToLatLon } from "../geo-sphere";
import { tradeOrigin } from "@/data/trade-cities";

/**
 * Trivoxa HQ — the one permanently accented node.
 *
 * Read from the shared city dataset rather than restated here, so the accented
 * cluster on the particle field and the origin the trade routes depart from can
 * never end up at different coordinates.
 */
const HQ = tradeOrigin();
/** Great-circle-ish radius (degrees) of the accented HQ cluster. */
const HQ_RADIUS_DEG = 7;

/**
 * Region ids. 0 means "unassigned" (ocean shell points and anything outside the
 * boxes below), which the shader treats as never-highlighted.
 */
export const REGION = {
  NONE: 0,
  EUROPE: 1,
  MIDDLE_EAST: 2,
  AFRICA: 3,
  NORTH_AMERICA: 4,
  SOUTH_AMERICA: 5,
  ASIA_PACIFIC: 6,
} as const;

/**
 * Coarse lon/lat boxes, tested IN THIS ORDER — the order resolves the overlaps
 * rather than the boxes being disjoint. Europe is claimed before the Middle East
 * so Turkey and the Caucasus read as European; Asia-Pacific is tested last and
 * starts at lon 40 so it picks up Russia east of the European box without
 * stealing the Gulf.
 */
const REGION_BOXES: { id: number; lon: [number, number]; lat: [number, number] }[] = [
  { id: REGION.EUROPE, lon: [-11, 40], lat: [36, 72] },
  { id: REGION.MIDDLE_EAST, lon: [34, 60], lat: [12, 40] },
  { id: REGION.AFRICA, lon: [-19, 52], lat: [-36, 37] },
  { id: REGION.NORTH_AMERICA, lon: [-169, -52], lat: [7, 76] },
  { id: REGION.SOUTH_AMERICA, lon: [-82, -33], lat: [-57, 13] },
  { id: REGION.ASIA_PACIFIC, lon: [40, 180], lat: [-48, 76] },
];

export function regionOf(lon: number, lat: number): number {
  for (const b of REGION_BOXES) {
    if (lon >= b.lon[0] && lon <= b.lon[1] && lat >= b.lat[0] && lat <= b.lat[1]) return b.id;
  }
  return REGION.NONE;
}

export interface GeoField {
  /** Interleaved lat/lon in RADIANS, length count*2 — the shader's `aGeo`. */
  geo: Float32Array;
  /** 0 = landmass, 1 = ocean shell. Reuses the existing aLayer dimming. */
  layer: Float32Array;
  /** Region id per particle, 0 for none. */
  region: Float32Array;
  /** 1 for particles in the HQ cluster, 0 elsewhere — the accent mask. */
  accent: Float32Array;
}

/**
 * Build the field.
 *
 * The point distribution is the existing two-layer Fibonacci globe (land points
 * first, ocean shell after), sampled at unit radius and then converted back to
 * lat/lon. Going through buildGlobeGeometry rather than sampling lat/lon directly
 * is deliberate: it is the distribution already tuned to avoid pole-bunching and
 * clumping, and reusing it means the hero globe here is recognisably the same
 * globe the home page shows.
 */
export function buildPresenceGeo(count: number): GeoField {
  const globe = buildGlobeGeometry(count, 1);
  const geo = new Float32Array(count * 2);
  const region = new Float32Array(count);
  const accent = new Float32Array(count);
  const D2R = Math.PI / 180;

  for (let i = 0; i < count; i++) {
    const { lat, lon } = vec3ToLatLon(
      globe.positions[i * 3],
      globe.positions[i * 3 + 1],
      globe.positions[i * 3 + 2]
    );
    geo[i * 2] = lat * D2R;
    geo[i * 2 + 1] = lon * D2R;

    // Ocean shell points are structural — they make the sphere read as solid and
    // the flat map read as a full rectangle — but they are not part of any
    // region, so a highlight never lights up open water.
    region[i] = globe.layer[i] === 0 ? regionOf(lon, lat) : REGION.NONE;

    const dLat = lat - HQ.lat;
    // Converging meridians: a degree of longitude is cos(lat) of a degree of
    // latitude, so without this the HQ cluster would smear east-west.
    const dLon = (lon - HQ.lon) * Math.cos(HQ.lat * D2R);
    accent[i] = Math.hypot(dLat, dLon) <= HQ_RADIUS_DEG ? 1 : 0;
  }

  return { geo, layer: globe.layer, region, accent };
}
