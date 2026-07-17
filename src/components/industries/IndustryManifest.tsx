"use client";

import { useState } from "react";
import Link from "next/link";

export interface ManifestRow {
  name: string;
  description: string;
  href: string;
  image: string;
}

/** Editorial manifest: numbered rows with hairline dividers; hovering a row
 * slides its preview image in from the right (desktop only, CSS-gated). */
export default function IndustryManifest({ rows }: { rows: ManifestRow[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="industry-list" onMouseLeave={() => setHovered(null)}>
      {rows.map((item, i) => (
        <Link
          key={item.name}
          href={item.href}
          className="industry-row"
          onMouseEnter={() => setHovered(i)}
          onFocus={() => setHovered(i)}
        >
          <span className="industry-row__index">{String(i + 1).padStart(2, "0")}</span>
          <span className="industry-row__name">{item.name}</span>
          <span className="industry-row__desc">{item.description}</span>
        </Link>
      ))}
      <div className={`industry-preview${hovered !== null ? " is-visible" : ""}`} aria-hidden="true">
        {rows.map((item, i) => (
          // all images stay mounted so hover swaps don't refetch
          <img key={item.name} src={item.image} alt="" className={hovered === i ? "is-active" : ""} loading="lazy" />
        ))}
      </div>
    </div>
  );
}
