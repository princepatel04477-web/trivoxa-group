/**
 * Careers shape vocabulary: abstract human silhouettes assembling into a team.
 *
 * A figure is two primitives and nothing else — a disc for the head and a rounded,
 * slightly tapered dome for the shoulders and torso. That is the whole vocabulary.
 * No limbs, no features, no proportional detail: the moment a silhouette acquires
 * anatomy it stops reading as "a person" in the abstract and starts reading as a
 * specific person, which is exactly what this page must not do.
 *
 * Two constraints shape the stage design:
 *
 * 1. Connection lines are ONE static geometry with baked endpoints, so a figure a
 *    line touches must hold the same position in every stage where lines show. So
 *    figures occupy FIXED formation slots from the moment they appear: the team
 *    grows by populating more slots, never by rearranging the ones already filled.
 *    Figure HEIGHT still varies per stage — the slot is the centre, and shrinking a
 *    figure around its centre doesn't move it, so the lines stay attached.
 *
 * 2. Head-vs-torso is decided by a global index rule (`i % 97 < 14`) rather than
 *    per-figure blocks. 97 is coprime with every figure count used here, so heads
 *    stay evenly distributed however the pool is divided — and a particle that is
 *    a head in the hero is still a head in the full formation.
 */

import type { Shape, ShapeContext } from "./types";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const TAU = Math.PI * 2;

/**
 * Head/torso split. The modulus is coprime with 1, 2, 4 and 6 (every figure count
 * below), so heads never alias onto a subset of the figures.
 */
const HEAD_MOD = 97;
const HEAD_CUT = 14; // ≈14% of the pool — roughly the head's true area share

/** Formation slots, in units of R. Six across, on a shallow arc. */
const SLOT_SPACING = 0.95;
const SLOT_COUNT = 6;

/**
 * Which slots are filled at each stage, in reveal order.
 *
 * The pair takes the two CENTRE slots. Wide slots were the first instinct — a long
 * connecting line spanning the frame — but at nearly two figure-widths of clearance
 * that reads as two distant figures rather than as one being joined by another, and
 * leaves the middle of the composition empty. Adjacent-and-close is the beat the
 * section is about.
 */
const STAGE_SLOTS = [
  [2, 3], // two figures, connected
  [1, 2, 3, 4], // team cluster
  [0, 1, 2, 3, 4, 5], // full formation
];

/**
 * Figure height per stage, in units of R. Shrinks as the team grows: it keeps the
 * formation inside the frame, keeps per-figure particle density from collapsing,
 * and reads as the group settling into scale with each other.
 */
const STAGE_HEIGHT = { solo: 2.3, pair: 1.9, cluster: 1.7, full: 1.5 };

/**
 * Connections, in the order they draw. Ordering IS the choreography here: the
 * engine's staggered draw-in reveals them in array order, so the first entry is
 * the stage-1 pair's single link, the next block wires the stage-2 cluster, and
 * the last block brings in the outer figures. The reader sees the organisation
 * assemble in the same order the figures arrive.
 */
const LINKS: [number, number][] = [
  [2, 3], // the first connection — the pair in the centre slots
  [1, 2], [3, 4], [1, 3], [2, 4], // the cluster wires up
  [0, 1], [4, 5], [0, 2], [3, 5], // the outer figures join
];

interface Figure {
  cx: number;
  cy: number;
  height: number;
  /** Accent weight on this figure's head, 0–1. */
  headAccent: number;
}

/** Slot centre. A shallow arc — the outer figures sit slightly higher, which reads
 *  as a group standing together rather than as a row of items in a list. */
function slot(k: number, R: number): [number, number] {
  const x = (k - (SLOT_COUNT - 1) / 2) * SLOT_SPACING * R;
  const t = (k - (SLOT_COUNT - 1) / 2) / ((SLOT_COUNT - 1) / 2);
  return [x, 0.14 * R * t * t - 0.05 * R];
}

function isHead(i: number): boolean {
  return i % HEAD_MOD < HEAD_CUT;
}

/** Deterministic jitter — the same particle gets the same offset every rebuild. */
function jitter(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

/**
 * Sample one point inside a figure.
 *
 * Head: a disc, √-biased so it fills evenly by area rather than bunching at the
 * centre. Torso: a dome whose half-width tapers gently downward, with the top
 * eighth rounded off into shoulders. Both are deliberately crude — this is a
 * pictogram, and any more shape than this reads as a body.
 */
function samplePoint(fig: Figure, head: boolean): [number, number] {
  const H = fig.height;
  const rHead = 0.115 * H;
  const headY = 0.385 * H;

  if (head) {
    const r = rHead * Math.sqrt(Math.random());
    const a = Math.random() * TAU;
    return [fig.cx + r * Math.cos(a), fig.cy + headY + r * Math.sin(a)];
  }

  const top = headY - rHead - 0.03 * H; // a small neck gap below the head
  const bottom = -0.5 * H;
  const v = Math.random(); // 0 at the shoulders, 1 at the hem
  let halfWidth = 0.21 * H * (1 - 0.18 * v);
  // Round the shoulders over the top eighth so the torso is a dome, not a slab.
  const SHOULDER = 0.12;
  if (v < SHOULDER) {
    const s = (SHOULDER - v) / SHOULDER;
    halfWidth *= Math.sqrt(Math.max(0, 1 - s * s));
  }
  return [fig.cx + (Math.random() * 2 - 1) * halfWidth, fig.cy + top + (bottom - top) * v];
}

/**
 * Distribute the pool across `figures` and sample each particle into its figure.
 * Round-robin by index, so every figure fills evenly and a particle's structural
 * role stays stable from stage to stage.
 */
function formation(
  name: string,
  figures: Figure[],
  { count, R }: ShapeContext,
  opts: { drift?: number } = {}
): Shape {
  const data = new Float32Array(count * 3);
  const accent = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const fig = figures[i % figures.length];
    const head = isHead(i);
    const [x, y] = samplePoint(fig, head);
    const z = jitter(i * 1.7) * R * 0.045;


    data[i * 3] = x;
    data[i * 3 + 1] = y;
    data[i * 3 + 2] = z;
    // The accent lands on heads only. It is the natural focal point of a silhouette
    // the one place warmth reads as human rather than as decoration — and because
    // the head is ~14% of a figure by area, the primary tone stays dominant.
    accent[i] = head ? fig.headAccent : 0;
  }

  return {
    name,
    data,
    accent,
    flat: true,
    drift: opts.drift ?? R * 0.02,
  };
}

/** The figure the hero's single silhouette becomes — first of the centre pair. */
const ORIGIN_SLOT = 2;

/**
 * Fill the given slots at the given height. The origin figure keeps a fully accented
 * head throughout; every other figure sits slightly cooler, so the formation has a
 * centre of gravity and the reader can still see where it started.
 */
function figuresAt(slots: number[], heightR: number, R: number, accentScale = 1): Figure[] {
  return slots.map((k) => {
    const [cx, cy] = slot(k, R);
    return {
      cx,
      cy,
      height: heightR * R,
      headAccent: (k === ORIGIN_SLOT ? 1 : 0.7) * accentScale,
    };
  });
}

export function buildCareersStages(ctx: ShapeContext): Shape[] {
  const { R } = ctx;

  // Stage 1 — ONE silhouette, centred. The densest figure on the page: the whole
  // pool in a single form, so it reads as solid rather than as a sketch.
  const solo = formation(
    "one-figure",
    [{ cx: 0, cy: -0.05 * R, height: STAGE_HEIGHT.solo * R, headAccent: 1 }],
    ctx,
    { drift: R * 0.012 }
  );

  // Stage 2 — a second silhouette forms and connects. The pair takes the wide
  // slots, so the connection between them is a span rather than a contact point.
  const pair = formation("two-figures", figuresAt(STAGE_SLOTS[0], STAGE_HEIGHT.pair, R), ctx, {
    drift: R * 0.018,
  });

  // Stage 3 — the cluster. Two more figures fill the inner slots; the pair does not
  // move, so the line already drawn between them stays attached.
  const cluster = formation(
    "team-cluster",
    figuresAt(STAGE_SLOTS[1], STAGE_HEIGHT.cluster, R),
    ctx,
    { drift: R * 0.02 }
  );

  // Stage 4 — full formation. All six slots filled, every figure smaller, the
  // network complete: one organisation rather than a set of individuals.
  const fullFigures = figuresAt(STAGE_SLOTS[2], STAGE_HEIGHT.full, R);
  const full = formation("full-team", fullFigures, ctx, { drift: R * 0.018 });
  full.links = linkGeometry(fullFigures, STAGE_SLOTS[2]);

  return [solo, pair, cluster, full];
}

/**
 * Bake LINKS into line geometry, connecting figure centres (roughly chest height,
 * so a line meets a torso rather than passing under the hem). Endpoints come from
 * the FULL formation's slot positions, which every earlier stage also uses — that
 * shared layout is what lets one static buffer serve all three linked stages.
 */
function linkGeometry(figures: Figure[], slots: number[]): Float32Array {
  const bySlot = new Map<number, Figure>();
  slots.forEach((k, i) => bySlot.set(k, figures[i]));
  const usable = LINKS.filter(([a, b]) => bySlot.has(a) && bySlot.has(b));
  const out = new Float32Array(usable.length * 6);
  usable.forEach(([a, b], n) => {
    const fa = bySlot.get(a)!;
    const fb = bySlot.get(b)!;
    const ya = fa.cy + 0.08 * fa.height;
    const yb = fb.cy + 0.08 * fb.height;
    out.set([fa.cx, ya, 0, fb.cx, yb, 0], n * 6);
  });
  return out;
}

/**
 * Pulse phase. Grouped by `i % SLOT_COUNT` so particles share phases in blocks
 * rather than each grain twinkling on its own — the figures breathe softly with a
 * little internal variation. Deliberately NOT one phase per whole figure: a
 * silhouette pulsing in unison reads as a heartbeat, which is more animation than
 * this page wants.
 */
export function buildCareersPhase({ count }: ShapeContext): Float32Array {
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) phases[i] = ((i % SLOT_COUNT) * GOLDEN_ANGLE) % TAU;
  return phases;
}
