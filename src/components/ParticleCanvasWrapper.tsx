"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ParticleCanvas = dynamic(() => import("@/components/ParticleCanvas"), { ssr: false });

export default function ParticleCanvasWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ParticleCanvas />;
}
