"use client";

/**
 * Tiny event bus for cross-component coordination, mirroring the original
 * page's implicit globals:
 *  - "preloader:done"  — all 3D models loaded; hero intro + globe morph start
 *  - "modal:open" / "modal:close" — contact modal state (freezes Lenis)
 *  - "lenis:init" — Lenis instance ready (late subscribers re-init against it)
 */
type Handler = () => void;

const handlers = new Map<string, Set<Handler>>();

export function on(event: string, fn: Handler): () => void {
  if (!handlers.has(event)) handlers.set(event, new Set());
  handlers.get(event)!.add(fn);
  return () => handlers.get(event)?.delete(fn);
}

export function emit(event: string): void {
  handlers.get(event)?.forEach((fn) => fn());
}

/** Latched flag so late subscribers to preloader:done still fire. */
let preloaderDone = false;
export function markPreloaderDone(): void {
  preloaderDone = true;
  emit("preloader:done");
}
export function onPreloaderDone(fn: Handler): () => void {
  if (preloaderDone) {
    fn();
    return () => {};
  }
  return on("preloader:done", fn);
}

