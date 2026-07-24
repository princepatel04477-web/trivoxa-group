import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Shape } from "./types";

/**
 * Sample `count` points off any BufferGeometry surface.
 *
 * Disposes the geometry it is handed — callers pass a throwaway.
 */
export function sampleGeometry(
  geo: THREE.BufferGeometry,
  name: string,
  color: number,
  count: number
): Shape {
  const mesh = new THREE.Mesh(geo);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const data = new Float32Array(count * 3);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sampler.sample(tmp);
    data[i * 3] = tmp.x;
    data[i * 3 + 1] = tmp.y;
    data[i * 3 + 2] = tmp.z;
  }
  geo.dispose();
  return { name, data, color };
}

/**
 * Merge a set of primitive parts into one geometry and sample it, disposing
 * every part. All parts must be indexed (every THREE primitive is), or
 * mergeGeometries returns null.
 */
export function sampleParts(
  parts: THREE.BufferGeometry[],
  name: string,
  color: number,
  count: number
): Shape {
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((g) => g.dispose());
  return sampleGeometry(merged, name, color, count);
}
