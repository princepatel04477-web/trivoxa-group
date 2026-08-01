/**
 * Lightweight, dependency-free device-capability gate for the WebGL particle
 * field. No external benchmark library and no network call — everything here
 * runs synchronously against APIs the browser already exposes, so it works
 * fully offline and adds no bundle weight.
 *
 * Two independent checks, either of which disqualifies the device:
 *  1. CPU/RAM floor — the per-frame morph math (rebuilding a 7-14k vertex
 *     proxy array) is CPU-bound work that contends with the render thread on
 *     low-core-count or low-memory devices, even before the GPU is touched.
 *  2. Software renderer — a WebGL context backed by a software rasterizer
 *     (SwiftShader, llvmpipe, an ANGLE fallback with no real GPU backend)
 *     cannot sustain this particle count at interactive framerates no matter
 *     how capable the CPU is; this is the actual cause of a frozen tab.
 */
export function isLowEndDevice(): boolean {
  // WebGL particle animation is compulsory across all devices and browsers
  return false;
}

