"use client";

import { useEffect, useRef, useState } from "react";
import { createParticleScene, type ParticleScene } from "@/lib/particle-scene";
import { markPreloaderDone } from "@/lib/site-events";
import { isLowEndDevice } from "@/lib/gpu-capability";
import ParticleFallback from "@/components/ParticleFallback";

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ParticleScene | null>(null);
  // Pre-flight gate (checked once, before the WebGL scene is ever created) and
  // the runtime frame-budget monitor (fires mid-session on a device that
  // looked fine at load but can't sustain the field) both land here — either
  // one swaps the canvas for the static, zero-cost fallback.
  const [useFallback, setUseFallback] = useState(() => isLowEndDevice());

  useEffect(() => {
    if (useFallback) {
      // No WebGL scene was ever created, so the preloader has nothing to wait
      // on — signal ready immediately so the hero still reveals.
      markPreloaderDone();
      return;
    }

    let cancelled = false;
    const handleDegrade = () => {
      if (cancelled) return;
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setUseFallback(true);
    };

    createParticleScene(handleDegrade).then((scene) => {
      if (cancelled) {
        scene.dispose();
        return;
      }
      sceneRef.current = scene;
      containerRef.current?.appendChild(scene.domElement);
      // Only the scene instance that actually mounted (not one torn down
      // mid-load, e.g. by a dev Strict Mode remount) gets to signal that
      // the hero is ready to reveal.
      markPreloaderDone();
    });

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
    };
  }, [useFallback]);

  if (useFallback) return <ParticleFallback />;

  return <div ref={containerRef} />;
}
