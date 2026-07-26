import DottedMap from "dotted-map";

/** Trivoxa hubs shown on the flat world map. Surat is the origin all arcs draw
 *  from; the rest span the regions the group serves. */
type HubDef = { city: string; country: string; lat: number; lng: number; origin?: boolean };
const HUBS: HubDef[] = [
  { city: "Surat", country: "India", lat: 21.17, lng: 72.83, origin: true },
  { city: "Dubai", country: "UAE", lat: 25.2, lng: 55.27 },
  { city: "Singapore", country: "Singapore", lat: 1.35, lng: 103.82 },
  { city: "London", country: "United Kingdom", lat: 51.51, lng: -0.13 },
  { city: "New York", country: "United States", lat: 40.71, lng: -74.01 },
  { city: "São Paulo", country: "Brazil", lat: -23.55, lng: -46.63 },
  { city: "Lagos", country: "Nigeria", lat: 6.52, lng: 3.38 },
  { city: "Shanghai", country: "China", lat: 31.23, lng: 121.47 },
];

export interface WorldHub {
  city: string;
  country: string;
  origin?: boolean;
  x: number; // viewBox units
  y: number;
  px: number; // percent of width
  py: number; // percent of height
}
export interface WorldMapData {
  svg: string;
  w: number;
  h: number;
  hubs: WorldHub[];
}

let cache: WorldMapData | null = null;

/** Server-only: renders the dotted world map SVG and projects the hub pins.
 *  Runs in Node (build/SSR), so dotted-map never reaches the client bundle. */
export function getWorldMap(): WorldMapData {
  if (cache) return cache;
  const map = new DottedMap({ height: 46, grid: "diagonal" });
  const svg = map.getSVG({
    radius: 0.24,
    color: "#33436a",
    shape: "circle",
    backgroundColor: "transparent",
  });
  const vb = svg.match(/viewBox="([\d.\s-]+)"/);
  const parts = (vb ? vb[1] : "0 0 100 50").split(/\s+/).map(Number);
  const w = parts[2] || 100;
  const h = parts[3] || 50;
  const hubs: WorldHub[] = HUBS.map((hb) => {
    const p = map.getPin({ lat: hb.lat, lng: hb.lng });
    const x = p?.x ?? 0;
    const y = p?.y ?? 0;
    return {
      city: hb.city,
      country: hb.country,
      origin: hb.origin,
      x,
      y,
      px: (x / w) * 100,
      py: (y / h) * 100,
    };
  });
  cache = { svg, w, h, hubs };
  return cache;
}
