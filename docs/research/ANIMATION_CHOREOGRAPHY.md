# Particle Choreography — Design Notes

## Status: per-page extension NOT shipped

A per-page particle shape vocabulary was designed and prototyped for the Group,
Businesses, Insights and Careers pages, extending the home-page morph system
(globe → vessel → container → ports globe → eagle).

**It was dropped.** Those pages already carry bespoke GLSL shader backgrounds
(`ShaderBackground`, `src/shaders/`, wired via `TrivoxaShell film="…"`, with 12+
variants — `group`, `careers`, `insights`, `fabrics`, `ai`, `design`, …).
`.shader-bg` renders at `position: fixed; inset: 0; z-index: -1` — the exact
layer the particle canvas uses. Running both would mean two WebGL contexts, two
rAF loops, and two ambient systems competing on every inner page, for a goal the
shader system already meets: giving each page its own visual identity.

What *did* ship is the refactor underneath it. The design work is recorded here
because the reasoning is reusable if the shader system is ever replaced.

## What shipped

- `src/lib/shapes/` — the globe / cargo-ship / container / eagle builders,
  extracted from `particle-scene.ts` verbatim, behind a keyed registry that
  builds only the shapes a choreography names.
- `src/lib/choreography.ts` — the home beat list, extracted from the scene.
- `particle-scene.ts` — `createParticleScene(config)` takes a beat list instead
  of hardcoding `.hp-*` selectors; `assembleGlobe()` generalised to
  `assembleInto(shape)`; the ports overlay is conditional.

**This is a structural refactor with no runtime gain.** Home names all four of
its shapes, so the lazy registry saves nothing today; likewise the conditional
ports overlay and the globe layer attribute, both of which home uses. The value
is organisational, and that a second choreography could be added cheaply.

## The design that was dropped

### The system rule

> **Thesis shape (hero) → development (1–2 beats) → resolve into the eagle (CTA).**

The eagle closing every page is what would have made separate animations read as
one site. The **globe stays exclusive to home + global-presence** — if it appears
everywhere it stops meaning "the world."

### Mobile constraints (drove half the choices)

The field runs on mobile as well as desktop, which is the binding constraint:

- **3,000 particles, not 7,000** (`COUNT_MOBILE`), at `S = 0.66` below 576px
- At `w <= 575` the scene **centres** (`side = 0`, `particle-scene.ts`) — the
  shape sits *directly behind the headline copy*, not parked beside it

Three rules follow:

1. **Volume beats line.** Points sample surfaces. Thin members — beams, twigs,
   wires, stair treads — degrade into sparse dotted lines at 3k.
2. **Portrait-friendly aspect.** Wide horizontal shapes scale down to fit a
   narrow viewport and end up tiny. Square or vertical survives.
3. **Bold silhouettes only.** Centred behind text means busy shapes read as noise.

Measured against these, the prototyped shapes all landed at 0.87–1.20 aspect,
while the two existing home shapes are 2.42 (cargo-ship) and 2.30 (container) —
i.e. the home vocabulary predates the mobile constraint and would not be chosen
the same way today.

### Vocabulary

| Page | Thesis | Development | Close |
|---|---|---|---|
| **Group** — endurance, many parts as one institution | Keystone arch (fragments lock in) | Stepped ziggurat mass; node lattice (8 nodes) | Eagle |
| **Businesses** — one source, two arms | Cleaving mass (a block split into two halves) | Funnel | Eagle |
| **Insights** — clarity from complexity | Three fanned planes (`flat: true`) | Solid triangular prism | Eagle |
| **Careers** — individuals becoming a team | Scatter converging into a ring | Concentric rings tightening | Eagle |

Group warranted 4 beats (vs 3) as the longest page — 9 sections, so the field
had room to appear, hide and return without crowding.

### Rejected, and why

- **Y-bifurcation** (Businesses hero) — three thin lines; dies at 3k.
- **Segmented pipeline** (Businesses process) — wide, thin, repetitive.
- **Refracted beams** (Insights hero) — long thin beams are the worst case for a
  point cloud. Only the solid forms in that family survive.
- **Branching tree** (Careers) — twigs are unrenderable at 3k.
- **Ascending staircase** (Careers) — thin treads, wide aspect, and it collided
  with Group's stepped ziggurat.
- **Wide strata bands** (Group foundation) — re-proportioned into a compact
  stepped mass for portrait.

### Build methods

| Shape | Method |
|---|---|
| keystone-arch | merged boxes + half-torus → `sampleGeometry()` |
| ziggurat | stacked boxes |
| node-lattice | custom builder — node spheres + interpolated edge points |
| cleaving-mass | two rotated, offset boxes |
| funnel | lathe profile |
| fanned-planes | three rotated planes, `flat: true` |
| prism | 3-radial-segment cylinder, axis rotated onto Z |
| ring | torus |
| concentric-rings | three tori of decreasing radius |

Only the node lattice needed sampling machinery beyond `sampleGeometry()`.

### Anchors that would be needed

Group's ecosystem, Businesses' process and Careers' hiring-process sections are
plain `<Section eyebrow="…">` with no `id` or class, so `Section` and `CtaBand`
would need an optional `className` prop to hang ScrollTriggers off.
