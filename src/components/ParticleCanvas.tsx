"use client";

import { useEffect, useRef } from "react";
import { createParticleScene, type ParticleScene } from "@/lib/particle-scene";

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
    });

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
    };
  }, []);

  return <div ref={containerRef} />;
}
