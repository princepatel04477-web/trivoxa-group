"use client";

import { useEffect, useRef } from "react";
import { createParticleScene, type ParticleScene } from "@/lib/particle-scene";
import { markPreloaderDone } from "@/lib/site-events";

export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ParticleScene | null>(null);

  useEffect(() => {
    let cancelled = false;
    createParticleScene().then((scene) => {
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
  }, []);

  return <div ref={containerRef} />;
}
