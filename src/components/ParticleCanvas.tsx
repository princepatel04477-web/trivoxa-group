"use client";

import { useEffect, useRef } from "react";
import { createParticleScene, type ParticleScene, type SceneConfig } from "@/lib/particle-scene";
import { markPreloaderDone } from "@/lib/site-events";


interface ParticleCanvasProps {
  /** This page's choreography — see src/lib/choreography.ts. */
  config: Omit<SceneConfig, "onDegrade">;
}

export default function ParticleCanvas({ config }: ParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ParticleScene | null>(null);

  useEffect(() => {
    let cancelled = false;

    createParticleScene(config).then((scene) => {
      if (cancelled) {
        scene.dispose();
        return;
      }
      sceneRef.current = scene;
      if (containerRef.current && scene.domElement) {
        containerRef.current.appendChild(scene.domElement);
      }
      markPreloaderDone();
    }).catch(() => {
      markPreloaderDone();
    });

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [config]);

  return <div ref={containerRef} />;
}

