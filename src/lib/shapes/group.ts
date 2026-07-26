/**
 * Group-page shape vocabulary: interlocking hexagonal cells.
 *
 * The Group page's signature form is a hex lattice that subdivides as the reader
 * descends — one clean cell, then three interlocked, then six in an orbital
 * ring, then the complete mesh with its connections drawn in, then a relaxed
 * drift that keeps a faint silhouette. The through-line is that it is always
 * ONE structure, never a set of separate objects: cells share edges and corners,
 * and the particles dusting a shared edge are a single deduplicated run rather
 * than two outlines laid on top of each other. That is what makes the field read
 * as one connected organism.
 *
 * Hex-lattice geometry used throughout: a cell of circumradius r has vertices at
 * 60°k (flat top and bottom edges) and edge midpoints at 30° + 60°k. A cell
 * sharing an edge therefore sits at distance r·√3 along one of those midpoint
 * directions — which is how every arrangement below is placed, so cells always
 * interlock exactly rather than approximately.
 */

import type { Shape, ShapeContext } from "./types";

const SQRT3 = Math.sqrt(3);
const DEG = Math.PI / 180;

/** Edge-sharing neighbour directions in a hex lattice. */
const NEIGHBOUR_ANGLES = [30, 90, 150, 210, 270, 330].map((a) => a * DEG);

/**
 * Share of the pool held in node clusters (cell centres, lattice corners, the
 * founding node); the remainder dusts the shared edges. The split is applied by
 * index range, so a particle that is a node in one stage is a node in every
 * stage — roles stay stable across a morph even though the node count changes.
 */
const NODE_FRACTION = 0.26;

interface Cell {
  x: number;
  y: number;
  r: number;
}

/** A point the pool clusters around, and whether it takes the accent tone. */
interface Node {
  x: number;
  y: number;
  accent: boolean;
}

interface Topology {
  /** Deduplicated lattice corners — shared by every cell that touches them. */
  corners: [number, number][];
  /** Deduplicated edges — a shared edge appears once, not once per cell. */
  edges: [[number, number], [number, number]][];
}

function cellVertices(c: Cell): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k < 6; k++) {
    const a = k * 60 * DEG;
    out.push([c.x + c.r * Math.cos(a), c.y + c.r * Math.sin(a)]);
  }
  return out;
}

/**
 * Collapse a cell set into its shared skeleton. Quantising to 1e-3 world units
 * is what makes two cells that share an edge produce ONE edge — the whole
 * "single organism" read depends on this dedupe.
 */
function topology(cells: Cell[]): Topology {
  const key = (x: number, y: number) => `${Math.round(x * 1000)},${Math.round(y * 1000)}`;
  const corners = new Map<string, [number, number]>();
  const edges = new Map<string, [[number, number], [number, number]]>();
  for (const c of cells) {
    const vs = cellVertices(c);
    for (let k = 0; k < 6; k++) {
      const a = vs[k];
      const b = vs[(k + 1) % 6];
      corners.set(key(a[0], a[1]), a);
      // Keyed on the midpoint: the same physical edge from either adjacent cell
      // lands on the same key and overwrites rather than duplicating.
      edges.set(key((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), [a, b]);
    }
  }
  return { corners: [...corners.values()], edges: [...edges.values()] };
}

/**
 * Six cells around an empty centre.
 *
 * `spacing` is the centre-to-centre distance as a multiple of r. At exactly √3
 * the cells are edge-adjacent and the ring closes into a lattice; above that they
 * are six discrete cells with visible gaps. The orbital-ring stage uses the
 * loose spacing and the mesh stage uses √3 — that contraction from separate
 * bodies into a single interlocked structure is what the climax actually is.
 */
function ring(r: number, spacing = SQRT3): Cell[] {
  const d = r * spacing;
  return NEIGHBOUR_ANGLES.map((a) => ({ x: d * Math.cos(a), y: d * Math.sin(a), r }));
}

interface FormSpec {
  name: string;
  cells: Cell[];
  /** Extra node the cells don't provide — the founding node. */
  founding?: { x: number; y: number };
  /** Accent the cell centres (mesh climax) rather than only the founding node. */
  accentHubs?: boolean;
  /** Ambient drift amplitude as a fraction of the cell radius. */
  driftFactor?: number;
}

/**
 * Lay the pool onto a form: node clusters first (stable low indices), shared
 * edges after. Returns the target buffer plus the per-particle accent mask the
 * shader mixes the accent tone with.
 */
function buildForm(spec: FormSpec, count: number): Shape {
  const { corners, edges } = topology(spec.cells);
  const cellR = spec.cells[0].r;

  const nodes: Node[] = [];
  // Cell centres. In the mesh climax every hub is a focal node; before that only
  // the founding node carries the accent, so it stays a punctuation mark
  // rather than a second colour scheme.
  for (const c of spec.cells) nodes.push({ x: c.x, y: c.y, accent: !!spec.accentHubs });
  for (const v of corners) nodes.push({ x: v[0], y: v[1], accent: false });
  if (spec.founding) nodes.push({ ...spec.founding, accent: true });

  const data = new Float32Array(count * 3);
  const accent = new Float32Array(count);
  const nodeBudget = Math.floor(count * NODE_FRACTION);
  const nodeSpread = cellR * 0.13;
  const edgeJitter = cellR * 0.035;
  const zJitter = cellR * 0.06;

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    if (i < nodeBudget && nodes.length > 0) {
      const node = nodes[i % nodes.length];
      // Two summed randoms bias the cluster toward its centre, so a node reads
      // as a dense core with a soft halo instead of a uniform disc.
      const t = (Math.random() + Math.random()) / 2;
      const a = Math.random() * Math.PI * 2;
      const rad = nodeSpread * t;
      x = node.x + rad * Math.cos(a);
      y = node.y + rad * Math.sin(a);
      accent[i] = node.accent ? 1 : 0;
    } else {
      const [a, b] = edges[(i - nodeBudget) % edges.length];
      const t = Math.random();
      const ex = a[0] + (b[0] - a[0]) * t;
      const ey = a[1] + (b[1] - a[1]) * t;
      // Jitter perpendicular to the edge so the run keeps a crisp line rather
      // than blurring into a band.
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const off = (Math.random() - 0.5) * 2 * edgeJitter;
      x = ex + (-dy / len) * off;
      y = ey + (dx / len) * off;
      accent[i] = 0;
    }

    const z = (Math.random() - 0.5) * 2 * zJitter;


    data[i * 3] = x;
    data[i * 3 + 1] = y;
    data[i * 3 + 2] = z;
  }

  return {
    name: spec.name,
    data,
    accent,
    flat: true,
    drift: cellR * (spec.driftFactor ?? 0.03),
  };
}

/**
 * The five stages, in scroll order. Cell radius shrinks as the count grows so
 * the structure subdivides within a roughly constant footprint instead of
 * outgrowing the viewport — stages 2 and 3 deliberately share a radius, so the
 * six ring cells barely move while the seventh grows into the empty centre.
 */
export function buildGroupStages({ count, R }: ShapeContext): Shape[] {
  // Stage 1 — one clean cell.
  const one = buildForm({ name: "hex-one", cells: [{ x: 0, y: 0, r: R * 1.05 }] }, count);

  // Stage 2 — three mutually interlocked cells. Three cells that are each
  // adjacent to the other two share exactly one lattice corner, and that corner
  // is the centroid of their centres: the founding node. The form is translated
  // so it sits at the origin, which is also what the camera orbit pivots on.
  const r2 = R * 0.68;
  const d2 = r2 * SQRT3;
  const trefoil: Cell[] = [
    { x: 0, y: 0, r: r2 },
    { x: d2 * Math.cos(30 * DEG), y: d2 * Math.sin(30 * DEG), r: r2 },
    { x: d2 * Math.cos(90 * DEG), y: d2 * Math.sin(90 * DEG), r: r2 },
  ];
  const fx = (trefoil[0].x + trefoil[1].x + trefoil[2].x) / 3;
  const fy = (trefoil[0].y + trefoil[1].y + trefoil[2].y) / 3;
  const three = buildForm(
    {
      name: "hex-three",
      cells: trefoil.map((c) => ({ ...c, x: c.x - fx, y: c.y - fy })),
      founding: { x: 0, y: 0 },
    },
    count
  );

  // Stage 3 — six cells in an orbital ring, centre held open. Spaced clear of one
  // another (2.15r, not the adjacent √3r) so they read as six distinct bodies in
  // orbit rather than an already-finished lattice: the mesh must have somewhere
  // to arrive from. The founding node survives at the origin, now unhoused.
  const rMesh = R * 0.5;
  const six = buildForm(
    { name: "hex-six", cells: ring(rMesh, 2.15), founding: { x: 0, y: 0 }, driftFactor: 0.05 },
    count
  );

  // Stage 4 — the climax. The seventh cell fills the centre and the lattice is
  // complete; every hub becomes a focal node and the connections draw in.
  const flower: Cell[] = [{ x: 0, y: 0, r: rMesh }, ...ring(rMesh)];
  const mesh = buildForm({ name: "hex-mesh", cells: flower, accentHubs: true }, count);
  mesh.links = meshLinks(flower);

  return [one, three, six, mesh];
}

/**
 * Connections between hub centres for the completed mesh: six spokes from the
 * centre cell out to the ring, plus the six rim links between adjacent ring
 * cells. Drawn as line geometry, never particles.
 */
function meshLinks(flower: Cell[]): Float32Array {
  const [centre, ...rim] = flower;
  const pairs: [Cell, Cell][] = [];
  for (const c of rim) pairs.push([centre, c]);
  for (let i = 0; i < rim.length; i++) pairs.push([rim[i], rim[(i + 1) % rim.length]]);
  const out = new Float32Array(pairs.length * 6);
  pairs.forEach(([a, b], i) => {
    out.set([a.x, a.y, 0, b.x, b.y, 0], i * 6);
  });
  return out;
}
