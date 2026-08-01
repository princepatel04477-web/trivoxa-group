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
let cachedIsLowEnd: boolean | null = null;

export function isLowEndDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedIsLowEnd !== null) return cachedIsLowEnd;

  // URL override for testing/debugging
  const search = window.location?.search || "";
  if (search.includes("forceShader=1") || search.includes("forceWebGL=1")) {
    cachedIsLowEnd = false;
    return false;
  }
  if (search.includes("forceLowEnd=1")) {
    cachedIsLowEnd = true;
    return true;
  }

  // 1. CPU / RAM floor checks
  if (typeof navigator !== "undefined") {
    // Low core count (< 4 logical cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      cachedIsLowEnd = true;
      return true;
    }
    // Low RAM (< 4 GB)
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof deviceMemory === "number" && deviceMemory < 4) {
      cachedIsLowEnd = true;
      return true;
    }
  }

  // 2. Software renderer detection via WebGL context debug info
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: true });

    if (!gl) {
      // Hardware acceleration unavailable or disabled
      cachedIsLowEnd = true;
      return true;
    }

    const webglGl = gl as WebGLRenderingContext;
    const debugInfo = webglGl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = webglGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (typeof renderer === "string") {
        const lowerRenderer = renderer.toLowerCase();
        const softwareKeywords = [
          "swiftshader",
          "llvmpipe",
          "software",
          "mesa",
          "angle (software",
          "basic render driver",
          "virtualbox",
          "vmware",
        ];
        if (softwareKeywords.some((keyword) => lowerRenderer.includes(keyword))) {
          webglGl.getExtension("WEBGL_lose_context")?.loseContext();
          cachedIsLowEnd = true;
          return true;
        }
      }
    }

    webglGl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cachedIsLowEnd = true;
    return true;
  }

  cachedIsLowEnd = false;
  return false;
}


