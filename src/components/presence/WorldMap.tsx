"use client";

import { motion } from "framer-motion";
import type { WorldMapData } from "@/lib/world-map";

/**
 * Flat dotted world map (rendered server-side by dotted-map) with Trivoxa's
 * hub cities. Framer Motion draws the trade-route arcs from Surat on scroll-in
 * and staggers each city/country label into view; markers pulse continuously.
 */
export default function WorldMap({ data }: { data: WorldMapData }) {
  const { svg, w, h, hubs } = data;
  const origin = hubs.find((hub) => hub.origin) ?? hubs[0];
  const dots = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  return (
    <div className="world-map" style={{ aspectRatio: `${w} / ${h}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="world-map__dots" src={dots} alt="" aria-hidden="true" />

      <svg className="world-map__lines" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        {hubs.filter((hub) => !hub.origin).map((hub, i) => {
          const cx = (origin.x + hub.x) / 2;
          const cy = (origin.y + hub.y) / 2 - Math.hypot(hub.x - origin.x, hub.y - origin.y) * 0.32;
          return (
            <motion.path
              key={`${hub.city}-arc`}
              d={`M ${origin.x} ${origin.y} Q ${cx} ${cy} ${hub.x} ${hub.y}`}
              fill="none"
              stroke="var(--route, #8FB4E8)"
              strokeWidth={0.18}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.55 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: "easeInOut" }}
            />
          );
        })}
      </svg>

      {hubs.map((hub, i) => (
        <div
          key={`${hub.city}-pin`}
          className={`world-map__hub${hub.origin ? " is-origin" : ""}`}
          style={{ left: `${hub.px}%`, top: `${hub.py}%` }}
        >
          <motion.span
            className="world-map__dot"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1, type: "spring", stiffness: 260 }}
          />
          <motion.span
            className="world-map__ping"
            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25, ease: "easeOut" }}
          />
          <motion.span
            className="world-map__label"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.45 + i * 0.1 }}
          >
            <span className="world-map__city">{hub.city}</span>
            <span className="world-map__country">{hub.country}</span>
          </motion.span>
        </div>
      ))}
    </div>
  );
}
