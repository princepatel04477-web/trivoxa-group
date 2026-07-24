"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { SceneConfig } from "@/lib/particle-scene";

const ParticleCanvas = dynamic(() => import("@/components/ParticleCanvas"), { ssr: false });

interface ParticleCanvasWrapperProps {
  /** This page's choreography — see src/lib/choreography.ts. */
  config: Omit<SceneConfig, "onDegrade">;
}

export default function ParticleCanvasWrapper({ config }: ParticleCanvasWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ParticleCanvas config={config} />;
}
