/** Shared lat/lon <-> unit-sphere conversions for the particle globe's world-map
 * shape and its trade-arc overlay — both must agree on orientation or the arcs
 * won't land on the continents the point cloud draws. */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function latLonToVec3(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lon + 180) * DEG2RAD;
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export function vec3ToLatLon(x: number, y: number, z: number): { lat: number; lon: number } {
  const r = Math.sqrt(x * x + y * y + z * z) || 1;
  const phi = Math.acos(Math.min(1, Math.max(-1, y / r)));
  const lat = 90 - phi * RAD2DEG;
  const thetaDeg = Math.atan2(z, -x) * RAD2DEG;
  const lon = (((thetaDeg - 180 + 540) % 360) + 360) % 360 - 180;
  return { lat, lon };
}

/** Equirectangular projection onto a flat width x height rectangle centered
 * on the origin — shares the same lat/lon convention as latLonToVec3/
 * vec3ToLatLon so a point's sphere and flat positions stay coherent (the
 * unfurl morph and the flat trade-arc overlay both depend on this). */
export function latLonToFlatVec3(
  lat: number,
  lon: number,
  width: number,
  height: number,
  z = 0
): [number, number, number] {
  return [(lon / 360) * width, (lat / 180) * height, z];
}
