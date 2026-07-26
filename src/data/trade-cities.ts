/**
 * Trade network cities — the single source of truth.
 *
 * The homepage particle globe and the Global Presence flat map render the SAME
 * network, so they read from this one list. Before this module existed they each
 * carried their own hand-typed set and had already drifted: the globe showed Surat
 * plus thirteen destinations, while the flat-map arc overlay used four Indian
 * origin ports and five destinations, two of which (Hamburg, Jebel Ali) were not on
 * the globe at all. Any new surface that draws this network imports from here.
 *
 * Coordinates are the real published positions of each port/city. `major` marks the
 * hubs that survive the mobile label tier, where drawing all fourteen would be
 * unreadable at phone width.
 */

export interface TradeCity {
  name: string;
  lat: number;
  lon: number;
  /** The single origin every route departs from. Exactly one city carries this. */
  origin?: boolean;
  /** Kept as a labelled node on small screens; the rest are dropped or abbreviated. */
  major?: boolean;
}

/**
 * Surat first — it is the origin, and keeping it at index 0 means both renderers
 * can rely on the ordering without re-searching the list.
 */
export const TRADE_CITIES: readonly TradeCity[] = [
  { name: "Surat", lat: 21.1702, lon: 72.8311, origin: true, major: true },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, major: true },
  { name: "Jeddah", lat: 21.4858, lon: 39.1925 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, major: true },
  { name: "Shanghai", lat: 31.2304, lon: 121.4737, major: true },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Rotterdam", lat: 51.9244, lon: 4.4777, major: true },
  { name: "New York", lat: 40.7128, lon: -74.006, major: true },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "Santos", lat: -23.9608, lon: -46.3336 },
  { name: "Durban", lat: -29.8587, lon: 31.0218 },
  { name: "Mombasa", lat: -4.0435, lon: 39.6682 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
] as const;

/** The origin. Throws rather than guessing — a network with no origin is a bug. */
export function tradeOrigin(): TradeCity {
  const origin = TRADE_CITIES.find((c) => c.origin);
  if (!origin) throw new Error("trade-cities: no city is flagged as the origin");
  return origin;
}

/** Every city a route terminates at — the list minus the origin. */
export function tradeDestinations(): readonly TradeCity[] {
  return TRADE_CITIES.filter((c) => !c.origin);
}
