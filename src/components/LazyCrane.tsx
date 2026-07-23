"use client";

import dynamic from "next/dynamic";
import type { CraneVariant } from "@/components/Crane";

/** Lazy entry point for the crane (spec §2: lazy-load, stay under budget).
 * The SVG + GSAP timeline only ship when a page actually renders one. */
const Crane = dynamic(() => import("@/components/Crane"), { ssr: false });

export type { CraneVariant };

export default function LazyCrane(props: {
  variant: CraneVariant;
  className?: string;
  onComplete?: () => void;
}) {
  return <Crane {...props} />;
}
