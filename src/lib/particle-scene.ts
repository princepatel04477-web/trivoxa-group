import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { latLonToVec3 } from "./geo-sphere";
import { buildGlobeShape, buildShapes, type Shape, type ShapeKey } from "./shapes";
import { createPerfHud, isPerfHudEnabled } from "./perf-hud";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  VignetteEffect,
  ChromaticAberrationEffect,
  NoiseEffect,
  BlendFunction,
  type Effect,
} from "postprocessing";

// Density tiers — halved from the original 14k/6k (perf gate, July 2026):
// the prior density exceeded frame budget on mid-range hardware, producing an
// unresponsive tab under sustained load. See the frame-budget monitor below
// for the runtime fallback if this still isn't enough on a given device.
const COUNT_DESKTOP = 7000;
const COUNT_MOBILE = 3000;
const MAX_DPR_DESKTOP = 1.5;
const MAX_DPR_MOBILE = 1.5;

// Frame-budget gate: 20ms/frame is the 50fps floor. 10 consecutive frames
// over budget (not one-off jank from GC or a tab switch) triggers the static
// fallback via the onDegrade callback. warmupSeconds skips the shader-compile
// / first-texture-upload spike every scene has on its first paint, which
// would otherwise false-positive on every load regardless of device.
const FRAME_BUDGET_MS = 20;
const FRAME_BUDGET_STREAK = 10;
const WARMUP_SECONDS = 1.5;

// Globe motion (Phase 3.2)
const IDLE_OMEGA = (2 * Math.PI) / 26; // rad/s — single-axis idle spin, 26s/rev
const AXIAL_TILT = (23.4 * Math.PI) / 180; // Earth-accurate axial tilt
const PARALLAX_MAX = (4 * Math.PI) / 180; // max ±4° mouse parallax offset

// Overall formation size. FORMATION_SCALE enlarges the hero globe and the flat
// shapes (ship / container / eagle) 1.6×. The ports globe holds at PORTS_SCALE
// (its prior size) so it stays beside the global-presence copy rather than
// overrunning it. Both are applied via points.scale in the render loop.
const FORMATION_SCALE = 1.6;
const PORTS_SCALE = 1.22;

/** One trade lane on the ports globe: a bulging arc from Surat to a hub plus a
 * light "packet" sprite that travels along it, looping. */
interface ArcAnim {
  line: THREE.Line;
  packet: THREE.Sprite;
  curve: THREE.QuadraticBezierCurve3;
  speed: number;
  off: number;
}

export interface ParticleScene {
  domElement: HTMLCanvasElement;
  dispose(): void;
}

/**
 * One beat of a page's scroll choreography: at `trigger`, morph the field into
 * `shape` (or fade it out if `shape` is omitted) and sweep it to `sweep`.
 *
 * The field forms a shape at a handful of narrative beats and is faded to 0
 * everywhere else — that sparseness is deliberate, so it never competes with
 * content-dense sections.
 */
export interface Beat {
  /** CSS selector the ScrollTrigger hangs off. */
  trigger: string;
  /** Shape to morph into. Omit to hold the current shape (usually with opacity 0). */
  shape?: ShapeKey;
  /**
   * Horizontal placement as a multiple of the computed side offset: 1 parks it
   * at the edge, 0 centres it. Omit to leave the field where it is. Always 0 on
   * mobile, where computeSide() returns 0.
   */
  sweep?: number;
  /** Target field opacity (default 1). */
  opacity?: number;
  /** Fade duration in seconds (default 0.7). */
  fadeDuration?: number;
  /** Show the named-port overlay. Requires ports:true on the scene config. */
  ports?: boolean;
  /** ScrollTrigger start (default "top center"). */
  start?: string;
  /** Applied on scroll-up past the trigger, if the beat needs to undo itself. */
  onLeaveBack?: Pick<Beat, "opacity" | "ports" | "fadeDuration">;
}

export interface SceneConfig {
  /** Shape assembled on load, behind the hero. */
  hero: ShapeKey;
  beats: Beat[];
  /** Build the named-port overlay + trade arcs. Home / global-presence only. */
  ports?: boolean;
  /**
   * Cap on field opacity below 576px, where the field centres *behind* the
   * headline copy instead of parking beside it. Defaults to 1 (no cap).
   */
  mobileOpacityCap?: number;
  onDegrade?: () => void;
}

export async function createParticleScene(config: SceneConfig): Promise<ParticleScene> {
  const { hero, beats, ports: wantsPorts = false, mobileOpacityCap = 1, onDegrade } = config;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width <= 575;
  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;
  // Below 576px computeSide() returns 0, so the field sits centred *behind* the
  // headline copy rather than beside it. Pages that put a beat under a heading
  // pass a cap so the text stays legible.
  const capOpacity = (o: number) => (isMobile ? Math.min(o, mobileOpacityCap) : o);
  const heroOpacity = capOpacity(1);
  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
  camera.position.z = 36;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false, // round point sprites don't benefit; MSAA costs fill rate
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;";

  // Postprocessing is desktop-only — mipmap bloom + chromatic aberration are
  // the first things to cost frames on mid-range mobile GPUs.
  const composer = isMobile ? null : new EffectComposer(renderer);
  if (composer) {
    composer.addPass(new RenderPass(scene, camera));
    // height caps the bloom mip chain's working resolution — visually
    // indistinguishable for a soft glow, roughly halves the effect's GPU cost.
    const bloom = new BloomEffect({ intensity: 0.4, luminanceThreshold: 0.7, radius: 0.6, height: 360 });
    const vignette = new VignetteEffect({ darkness: 0.6, offset: 0.3 });
    const chromaticAberration = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.0005, 0.0005),
      radialModulation: false,
      modulationOffset: 0.15,
    });
    const effects: Effect[] = [bloom, vignette, chromaticAberration];
    // Grain flickers every frame — a non-essential animation, so it's the one
    // effect skipped under prefers-reduced-motion (the rest are static-look).
    if (!reducedMotion) {
      const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
      grain.blendMode.opacity.value = 0.08;
      effects.push(grain);
    }
    composer.addPass(new EffectPass(camera, ...effects));
  }

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("/images/particle-tiny.png");

  // Nominal shape radius (shared scale system, see S/R below). Built here so the
  // globe geometry and its per-particle layer attribute exist before first paint.
  const vpScale = width > 1024 ? 1 : width > 576 ? 0.82 : 0.66;
  const globeRadius = 7 * vpScale;

  // Every shape this page's choreography actually names — the registry builds
  // only these, so a page showing three shapes doesn't pay to sample thirteen.
  const shapeCtx = { count, R: globeRadius, S: vpScale };
  const shapeKeys = new Set<ShapeKey>([hero]);
  for (const b of beats) if (b.shape) shapeKeys.add(b.shape);

  // The globe is built here rather than through the registry because it also
  // produces the per-particle layer attribute the shader's Layer-B dimming and
  // depth cueing read. Pages that never show it skip the work entirely — it is
  // the most expensive shape by far (tens of thousands of Fibonacci points
  // tested against the continent rings).
  const globeBuilt = shapeKeys.has("globe") ? buildGlobeShape(shapeCtx) : null;

  const geometry = new THREE.BufferGeometry();

  // GPU morph (see morphTo): the field interpolates between two stage buffers
  // inside the vertex shader, driven by a single uProgress uniform. `position`
  // is the FROM stage and aTo is the TO stage; the CPU writes one float per
  // frame instead of count*3, and only rewrites the attributes when a new morph
  // begins (rare) rather than every frame.
  const positions = new Float32Array(count * 3); // FROM stage
  const targets = new Float32Array(count * 3); // TO stage
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aTo", new THREE.BufferAttribute(targets, 3));

  // Per-particle arrival delay, used only by the hero assemble (uStagger=1) so
  // the form coalesces like settling dust instead of snapping in on one
  // synchronized keyframe. Zero-cost for ordinary morphs, which run uStagger=0.
  const delays = new Float32Array(count);
  geometry.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));

  // The field is always on screen and its bounds are driven by a shader-side
  // mix that Three can't see, so the auto-computed bounding sphere (derived
  // from `position` alone) would be wrong and could cull the whole cloud
  // mid-morph. One draw call, always visible — just skip culling.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);

  // Per-particle random phase drives the idle shimmer entirely on the GPU —
  // each grain's opacity oscillates on its own phase (no synchronized "flat"
  // twinkle), and it costs zero per-frame CPU: only the uTime uniform ticks.
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) phases[i] = Math.random() * Math.PI * 2;
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  // Layer flag per particle (0 = landmass, 1 = shell). Fixed for the pool; the
  // shader only acts on it while the field is the globe (uGlobe), so flat shapes
  // are unaffected — which is also why pages without a globe bind zeros rather
  // than building the geometry just to source this.
  geometry.setAttribute(
    "aLayer",
    new THREE.BufferAttribute(globeBuilt?.layer ?? new Float32Array(count), 1)
  );

  const shimmerUniform = { value: 0 };
  // 1 while the field is the globe, 0 for flat formations — gates the globe-only
  // depth cueing and Layer-B dimming. Lerped in the render loop for smoothness.
  const uGlobeUniform = { value: 1 };
  // GPU morph drivers. uProgress is the ONLY thing the CPU touches per frame —
  // GSAP tweens it for a discrete morph, ScrollTrigger scrubs it for a staged
  // sequence. uStagger blends between a uniform lerp (0) and the per-particle
  // delayed arrival used by the hero assemble (1).
  const uProgress = { value: 1 };
  const uStagger = { value: 0 };
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    map: texture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shimmerUniform;
    shader.uniforms.uGlobe = uGlobeUniform;
    shader.uniforms.uProgress = uProgress;
    shader.uniforms.uStagger = uStagger;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aPhase;\nattribute float aLayer;\nattribute vec3 aTo;\nattribute float aDelay;\nuniform float uTime;\nuniform float uGlobe;\nuniform float uProgress;\nuniform float uStagger;\nvarying float vAlpha;"
      )
      // THE morph. `position` is the FROM stage, aTo the TO stage. Ordinary
      // morphs run uStagger=0 so t == uProgress and the easing curve stays
      // wholly owned by whatever drives the uniform (GSAP tween or scroll
      // scrub). The hero assemble runs uStagger=1, giving each grain its own
      // 0–400ms-delayed arrival window.
      .replace(
        "#include <begin_vertex>",
        `float staggered = smoothstep(aDelay, aDelay + 0.55, uProgress);
        float t = mix(uProgress, staggered, uStagger);
        vec3 transformed = mix(position, aTo, t);`
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        // Depth cueing (Phase 3.2.5): fade + shrink the far hemisphere so the
        // globe reads as a sphere, not a flat disc of dots. Frontness is the
        // view-space z of this particle's offset from the object centre.
        vec3 vCenter = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 vOff = mvPosition.xyz - vCenter;
        float frontness = length(vOff) > 0.0001 ? normalize(vOff).z : 0.0;
        float f01 = frontness * 0.5 + 0.5;               // 0 (far) .. 1 (near)
        float depthSize = mix(0.6, 1.0, f01);            // far 60% .. near 100% size
        float depthOpac = mix(0.35, 1.0, f01);            // far 35% .. near 100% opacity
        depthSize = mix(1.0, depthSize, uGlobe);          // no cueing on flat shapes
        depthOpac = mix(1.0, depthOpac, uGlobe);
        float layerDim = mix(1.0, 0.4, aLayer * uGlobe);  // Layer B shell dimmer, globe only
        float shimmer = 0.68 + 0.32 * sin(uTime + aPhase);
        vAlpha = shimmer * depthOpac * layerDim;`
      )
      // Fold the far-hemisphere size cue into PointsMaterial's own size
      // assignment (which runs after <project_vertex>, so an earlier
      // gl_PointSize *= would be overwritten). depthSize is in scope here.
      .replace("gl_PointSize = size;", "gl_PointSize = size * depthSize;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vAlpha;")
      .replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        "vec4 diffuseColor = vec4( diffuse, opacity * vAlpha );"
      );
  };

  const points = new THREE.Points(geometry, material);
  // Holder carries the globe's axial tilt + mouse parallax so those never touch
  // the flat formations (which live on `points` and stay upright). The idle spin
  // is on `points.rotation.y`; the tilt on `holder.rotation.z`.
  const holder = new THREE.Group();
  holder.add(points);
  scene.add(holder);

  // Responsive fit — the globe (and every formation) scales with the viewport
  // so the field never dominates a smaller laptop screen the way a fixed
  // world-space size does. Keyed off the shorter viewport dimension and
  // recomputed on resize (see handleResize).
  const fitScale = () => {
    const vpMin = Math.min(window.innerWidth, window.innerHeight);
    return THREE.MathUtils.clamp(vpMin / 1200, 0.5, 0.82);
  };
  holder.scale.setScalar(fitScale());
  // Start at the formation size so the hero globe doesn't visibly grow in from
  // 1× on load (the render loop only eases toward this target).
  points.scale.setScalar(FORMATION_SCALE);

  // Horizontal offset for the globe / formations. Placed at a consistent
  // fraction of the visible half-width (so the composition reads the same on
  // every aspect ratio) AND clamped so the globe is always fully on-screen —
  // never cut off on a narrow laptop, never stranded in dead space on an
  // ultrawide. Recomputed on resize so opening the site at any window size (or
  // resizing it) lands the field in the right place instead of a stale offset.
  const computeSide = (): number => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w <= 575) return 0; // mobile: centred, no side offset
    // Visible half-width in world units at the globe's depth.
    const halfW = Math.tan((35 * Math.PI) / 180 / 2) * camera.position.z * (w / h);
    // Globe's on-screen radius (incl. the outer shell) at the LARGEST formation
    // size, so we can guarantee it stays inside the frustum with margin. Uses
    // FORMATION_SCALE because that's the biggest the field ever gets — the ports
    // globe (PORTS_SCALE) is smaller, so it clears comfortably too.
    const onscreenR = globeRadius * fitScale() * FORMATION_SCALE * 1.08;
    const frac = w <= 1024 ? 0.34 : 0.42; // how far right of centre it sits
    const maxRight = Math.max(0, halfW - onscreenR * 1.12); // fully-visible cap
    return Math.min(halfW * frac, maxRight);
  };
  let side = computeSide();
  scene.position.x = side; // hero: globe sits opposite the left-aligned headline

  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const toAttr = geometry.attributes.aTo as THREE.BufferAttribute;
  const delayAttr = geometry.attributes.aDelay as THREE.BufferAttribute;

  /**
   * Freeze the field's CURRENT on-screen positions into the FROM buffer and
   * point the TO buffer at `target`, so a morph that interrupts one already in
   * flight starts from where the grains actually are rather than snapping back
   * to the last stage.
   *
   * This is the only place the position buffers are rewritten — once per morph,
   * not once per frame. Everything between morphs is a single uniform write.
   */
  function setStage(target: Float32Array, stagger = false) {
    const t = uProgress.value;
    const wasStaggered = uStagger.value > 0.5;
    for (let i = 0; i < count; i++) {
      // Mirror the vertex shader's blend exactly, or an interrupted morph
      // would visibly jump.
      const local = wasStaggered ? smoothstep(delays[i], delays[i] + 0.55, t) : t;
      const idx = i * 3;
      positions[idx] += (targets[idx] - positions[idx]) * local;
      positions[idx + 1] += (targets[idx + 1] - positions[idx + 1]) * local;
      positions[idx + 2] += (targets[idx + 2] - positions[idx + 2]) * local;
    }
    targets.set(target);
    posAttr.needsUpdate = true;
    toAttr.needsUpdate = true;
    uStagger.value = stagger ? 1 : 0;
    uProgress.value = 0;
  }

  /** Drop the field onto `stage` with no travel — used under reduced motion. */
  function snapTo(stage: Float32Array) {
    positions.set(stage);
    targets.set(stage);
    posAttr.needsUpdate = true;
    toAttr.needsUpdate = true;
    uStagger.value = 0;
    uProgress.value = 1;
  }

  const morphProgress = uProgress; // GSAP tweens the uniform directly

  let animId = 0;
  let paused = false;
  let currentFlat = false; // hero starts on the spinning globe
  let currentIsGlobe = true; // drives axial tilt, parallax and depth cueing
  // Named-port overlay for the Global Presence globe. Declared before the render
  // loop (which references them) but populated later once R/globeRadius exist.
  let portGroup: THREE.Group | null = null;
  let portsMode = false; // true only while the ports globe is the active field
  const portSprites: THREE.Sprite[] = [];
  const arcs: ArcAnim[] = []; // Surat → hub trade lanes on the ports globe
  const _wp = new THREE.Vector3();
  const _cp = new THREE.Vector3();
  // Pointer parallax — the globe subtly leans toward the cursor.
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  function handlePointer(e: PointerEvent) {
    pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener("pointermove", handlePointer);

  const clock = new THREE.Clock();

  // Frame-budget monitor (perf gate): tracks real, unclamped frame time.
  // Sustained >20ms frames (sub-50fps) for FRAME_BUDGET_STREAK in a row —
  // not a single GC pause or tab-switch stutter — means this device can't
  // hold the field at an acceptable rate, and it hands off to the caller's
  // static fallback exactly once. warmupElapsed skips the shader-compile /
  // first-texture-upload spike on frame one so that alone can't trip it.
  let overBudgetStreak = 0;
  let warmupElapsed = 0;
  let degraded = false;

  // Opt-in only (?perf=1) — the 60fps budget can only be confirmed on real
  // hardware, so this is the readout for doing that. Null in normal sessions.
  const perfHud = isPerfHudEnabled()
    ? createPerfHud({
        particles: count,
        dpr: renderer.getPixelRatio(),
        tier: isMobile ? "mobile" : width > 1024 ? "desktop" : "tablet",
      })
    : null;

  function renderLoop() {
    // Delta-time normalization: every idle motion below is scaled by real
    // elapsed seconds, so speed is identical at 30, 60, or 144fps. Clamp the
    // step so a background tab returning doesn't jump the animation — but
    // keep the raw value too, for the frame-budget monitor below, which needs
    // to see genuinely slow frames rather than a clamped-away view of them.
    const rawDelta = clock.getDelta();
    perfHud?.sample(rawDelta);
    const delta = Math.min(rawDelta, 0.05);
    const dt60 = delta * 60; // frames-equivalent, for the old per-frame rates

    if (onDegrade && !degraded) {
      warmupElapsed += rawDelta;
      if (warmupElapsed > WARMUP_SECONDS) {
        if (rawDelta * 1000 > FRAME_BUDGET_MS) {
          overBudgetStreak++;
          if (overBudgetStreak >= FRAME_BUDGET_STREAK) {
            degraded = true;
            onDegrade();
          }
        } else {
          overBudgetStreak = 0;
        }
      }
    }
    // prefers-reduced-motion: freeze the per-particle twinkle too, not just spin.
    if (!reducedMotion) shimmerUniform.value += delta * 2.2; // GPU per-particle shimmer clock

    const kSettle = 1 - Math.pow(0.9, dt60);
    const kParallax = 1 - Math.pow(0.95, dt60); // ~0.05 per 60fps frame
    pointer.x += (pointerTarget.x - pointer.x) * kParallax;
    pointer.y += (pointerTarget.y - pointer.y) * kParallax;

    // uGlobe eases 0..1 so depth cueing / Layer-B dimming fade in and out with
    // the formation rather than popping on a morph.
    uGlobeUniform.value += ((currentIsGlobe ? 1 : 0) - uGlobeUniform.value) * kSettle;

    // prefers-reduced-motion: no idle spin/breathing — the object still
    // relocates and reshapes as the user scrolls (see morphTo/sweep below),
    // it just doesn't move on its own between scroll events.
    if (!reducedMotion) {
      if (currentIsGlobe) {
        // Idle rotation: single Y-axis, constant velocity, 26s/rev (Phase 3.2.1).
        // Tilt lives on the holder (23.4°); no secondary-axis wobble on points.
        // Keeps rotating while ports are up so every city cycles into view; only
        // gently eased below full speed so labels stay readable as they pass.
        points.rotation.y += IDLE_OMEGA * (portsMode ? 0.75 : 1) * delta;
        points.rotation.x += (0 - points.rotation.x) * kSettle;
        holder.rotation.z += (AXIAL_TILT - holder.rotation.z) * kSettle;
        holder.rotation.x += (pointer.y * PARALLAX_MAX - holder.rotation.x) * kParallax;
        holder.rotation.y += (pointer.x * PARALLAX_MAX - holder.rotation.y) * kParallax;
      } else if (currentFlat) {
        // LOCKED formation (trade map / eagle logo / cargo plane). The centroid
        // must not drift, rotate, or breathe — ease all residual motion to zero.
        points.rotation.y += (0 - points.rotation.y) * kSettle;
        points.rotation.x += (0 - points.rotation.x) * kSettle;
        holder.rotation.z += (0 - holder.rotation.z) * kSettle;
        holder.rotation.x += (0 - holder.rotation.x) * kSettle;
        holder.rotation.y += (0 - holder.rotation.y) * kSettle;
      } else {
        // Ambient footer drift — slow single-axis wander, no tilt or parallax.
        points.rotation.y += IDLE_OMEGA * 0.35 * delta;
        points.rotation.x += (0 - points.rotation.x) * kSettle;
        holder.rotation.z += (0 - holder.rotation.z) * kSettle;
        holder.rotation.x += (0 - holder.rotation.x) * kSettle;
        holder.rotation.y += (0 - holder.rotation.y) * kSettle;
      }
    }

    // Formation size (kept outside the motion branches so it also applies under
    // prefers-reduced-motion, just without the easing). The hero globe and the
    // flat shapes render at FORMATION_SCALE; the ports globe holds at the
    // smaller PORTS_SCALE so it stays clear of the global-presence copy.
    const targetScale = currentIsGlobe && portsMode ? PORTS_SCALE : FORMATION_SCALE;
    if (reducedMotion) points.scale.setScalar(targetScale);
    else points.scale.setScalar(points.scale.x + (targetScale - points.scale.x) * kSettle);

    // No per-frame position write: the morph is a vertex-shader mix of the two
    // stage buffers, so the only per-frame CPU cost is the uProgress uniform
    // that GSAP or the scroll scrub already set.

    // Port labels: fade each toward its target only when it faces the camera
    // (front hemisphere), so labels on the far side of the globe don't show
    // through. Cheap — at most ~7 sprites. Hides the group once fully faded.
    if (portGroup && portGroup.visible) {
      points.getWorldPosition(_cp);
      _cp.project(camera);
      let anyVisible = false;
      for (const s of portSprites) {
        s.getWorldPosition(_wp);
        _wp.project(camera);
        const front = _wp.z < _cp.z; // nearer to camera than the globe centre
        const want = portsMode && front ? 1 : 0;
        const m = s.material as THREE.SpriteMaterial;
        m.opacity += (want - m.opacity) * kSettle;
        if (m.opacity > 0.01) anyVisible = true;
      }
      // Trade-lane arcs + travelling packets. Arcs fade in with the globe; each
      // packet advances along its curve and fades by hemisphere so back-of-globe
      // dots don't show through.
      const arcTarget = portsMode ? 1 : 0;
      for (const a of arcs) {
        const lm = a.line.material as THREE.LineBasicMaterial;
        lm.opacity += (arcTarget * 0.42 - lm.opacity) * kSettle;
        a.off = (a.off + delta * a.speed) % 1;
        a.curve.getPoint(a.off, _wp);
        a.packet.position.copy(_wp);
        a.packet.getWorldPosition(_wp);
        _wp.project(camera);
        const pFront = _wp.z < _cp.z;
        const pm = a.packet.material as THREE.SpriteMaterial;
        pm.opacity += ((arcTarget && pFront ? 1 : 0) - pm.opacity) * kSettle;
        if (lm.opacity > 0.01 || pm.opacity > 0.01) anyVisible = true;
      }
      if (!portsMode && !anyVisible) portGroup.visible = false;
    }

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    // Once degraded, stop self-scheduling — the caller's onDegrade handler
    // owns teardown (dispose() also cancels animId, this just avoids one more
    // wasted frame in between).
    if (!degraded) animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  function handleVisibilityChange() {
    if (document.hidden) {
      paused = true;
      cancelAnimationFrame(animId);
    } else if (paused) {
      paused = false;
      renderLoop();
    }
  }
  document.addEventListener("visibilitychange", handleVisibilityChange);

  function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer?.setSize(w, h);
    holder.scale.setScalar(fitScale()); // keep the globe proportionate on resize
    // Re-place the field for the new viewport. Only snap it while the hero is on
    // screen (before the first scroll formation) so a mid-page resize doesn't
    // yank the field sideways under the reader; deeper sections re-place on
    // their next scroll trigger.
    side = computeSide();
    if (window.scrollY < window.innerHeight * 0.6) scene.position.x = side;
  }
  window.addEventListener("resize", handleResize);

  // Same value as globeRadius above, aliased under the name the port overlay
  // and hero assembly below already use.
  const R = globeRadius; // nominal shape radius in world units

  // Build this page's shapes. Async only because the eagle decodes its PNG
  // alpha channel; every other builder resolves immediately.
  const shapes = await buildShapes(shapeKeys, shapeCtx);
  if (globeBuilt) shapes.set("globe", globeBuilt.shape);

  const heroShape = shapes.get(hero);
  if (!heroShape) throw new Error(`particle-scene: hero shape "${hero}" failed to build`);

  // Major world trade hubs for the "Connecting Opportunities Across Borders"
  // globe. Surat is the single origin; shipment packets flow from it out to
  // every hub along a connecting arc. Each pins to its real lat/lon on the same
  // sphere the land particles use, so labels track the continents as it turns.
  const CITIES: { name: string; lat: number; lon: number; origin?: boolean }[] = [
    { name: "Surat", lat: 21.1702, lon: 72.8311, origin: true },
    { name: "Dubai", lat: 25.2048, lon: 55.2708 },
    { name: "Jeddah", lat: 21.4858, lon: 39.1925 },
    { name: "Singapore", lat: 1.3521, lon: 103.8198 },
    { name: "Shanghai", lat: 31.2304, lon: 121.4737 },
    { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "Rotterdam", lat: 51.9244, lon: 4.4777 },
    { name: "New York", lat: 40.7128, lon: -74.006 },
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "Santos", lat: -23.9608, lon: -46.3336 },
    { name: "Durban", lat: -29.8587, lon: 31.0218 },
    { name: "Mombasa", lat: -4.0435, lon: 39.6682 },
    { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  ];

  const makePortSprite = (name: string, origin: boolean): THREE.Sprite => {
    const dpr = 2;
    // Surat (origin) is the standout — larger + warm gold. Destinations are
    // small and muted (a soft slate, NOT bright white) so they don't read as
    // neon and don't fight each other for attention.
    const fontPx = origin ? 21 : 15;
    const weight = origin ? 700 : 500;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const fontStack = `${weight} ${fontPx}px 'Lufga','Inter',system-ui,sans-serif`;
    ctx.font = fontStack;
    const textW = ctx.measureText(name).width;
    const padX = 5;
    const dotR = origin ? 6 : 4;
    const gap = 8;
    const w = Math.ceil(dotR * 2 + gap + textW + padX * 2);
    const h = Math.ceil(fontPx + 12);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.font = fontStack;
    ctx.textBaseline = "middle";
    // marker dot
    ctx.fillStyle = origin ? "#F2C24A" : "#8894AC";
    ctx.beginPath();
    ctx.arc(padX + dotR, h / 2, dotR, 0, Math.PI * 2);
    ctx.fill();
    // city name — faint shadow so it reads over the grains without glowing
    ctx.shadowColor = "rgba(6,12,26,0.9)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = origin ? "#F3D488" : "#9BA6BC";
    ctx.fillText(name, padX + dotR * 2 + gap, h / 2 + 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0,
    });
    const sprite = new THREE.Sprite(mat);
    // Local size (the whole globe scales up in ports mode — see render loop —
    // so these stay small on screen even though the globe grows).
    const worldH = origin ? R * 0.3 : R * 0.19;
    sprite.scale.set(worldH * (w / h), worldH, 1);
    sprite.center.set(0, 0.5); // anchor at the dot, so text reads to the right
    return sprite;
  };

  // The overlay is home / global-presence only: fourteen canvas-texture label
  // sprites plus thirteen arc geometries and their packet sprites. Pages whose
  // choreography never shows the ports globe skip building any of it.
  if (wantsPorts) {
    portGroup = new THREE.Group();
    portGroup.visible = false;
    const cityVecs: Record<string, THREE.Vector3> = {};
    for (const c of CITIES) {
      const sprite = makePortSprite(c.name, !!c.origin);
      const [x, y, z] = latLonToVec3(c.lat, c.lon, globeRadius * 1.045);
      sprite.position.set(x, y, z);
      sprite.renderOrder = c.origin ? 4 : 3; // labels over arcs; Surat over labels
      portGroup.add(sprite);
      portSprites.push(sprite);
      cityVecs[c.name] = new THREE.Vector3(...latLonToVec3(c.lat, c.lon, globeRadius * 1.01));
    }

    // Connecting arcs + travelling packets: one lane from Surat to every hub. Each
    // arc bulges off the sphere (higher for longer lanes) and a gold "packet"
    // sprite runs Surat → hub along it, looping — the trade flowing outward.
    const surat = cityVecs["Surat"];
    for (const c of CITIES) {
      if (c.origin) continue;
      const dest = cityVecs[c.name];
      const mid = surat.clone().add(dest).multiplyScalar(0.5);
      const lift = globeRadius * (1.1 + surat.distanceTo(dest) / (globeRadius * 4.2));
      mid.setLength(lift);
      const curve = new THREE.QuadraticBezierCurve3(surat.clone(), mid, dest.clone());
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xd4af5e,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.renderOrder = 1;
      portGroup.add(line);
      const packetMat = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffe3a6,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });
      const packet = new THREE.Sprite(packetMat);
      packet.scale.setScalar(globeRadius * 0.05); // small flowing dots
      packet.renderOrder = 2;
      portGroup.add(packet);
      arcs.push({ line, packet, curve, speed: 0.16 + Math.random() * 0.12, off: Math.random() });
    }
    points.add(portGroup);
  }

  const showPorts = () => {
    if (portGroup) portGroup.visible = true;
    portsMode = true;
  };
  const hidePorts = () => {
    portsMode = false; // render loop fades the sprites out, then hides the group
  };

  function morphTo(shape: Shape, onProgress?: (eased: number) => void) {
    currentFlat = !!shape.flat;
    currentIsGlobe = shape.name === "globe";
    material.color.setHex(shape.color);

    if (reducedMotion) {
      // Jump-cut: land on the target shape immediately, no elastic travel
      // and no speed pulse — the object stays static between scroll steps.
      snapTo(shape.data);
      onProgress?.(1); // jump-cut still resolves any blend the caller drives off this call
      return;
    }

    gsap.killTweensOf(morphProgress);
    setStage(shape.data);
    gsap.to(morphProgress, {
      value: 1,
      duration: 4,
      ease: "elastic.out(1, 0.75)",
      onUpdate: onProgress ? () => onProgress(morphProgress.value) : undefined,
    });
  }

  function smoothstep(edge0: number, edge1: number, x: number): number {
    const s = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1)));
    return s * s * (3 - 2 * s);
  }

  // Hero: scatter every grain into a chaotic shell, then let each fall into the
  // hero shape on its own 0–400ms-delayed track, so the form coalesces like
  // settling dust rather than snapping in on one synchronized keyframe (§2).
  // On Careers this convergence *is* the beat — the motion carries the idea, so
  // it survives the mobile particle budget better than any silhouette.
  function assembleInto(shape: Shape) {
    material.color.setHex(shape.color);
    currentFlat = !!shape.flat;
    currentIsGlobe = shape.name === "globe";
    if (reducedMotion) {
      snapTo(shape.data);
      material.opacity = heroOpacity;
      return;
    }

    // Scatter shell — written straight into the FROM buffer, with each grain
    // given its own arrival delay in aDelay. uStagger=1 makes the shader honour
    // those delays, so the form settles like dust instead of snapping in.
    for (let i = 0; i < count; i++) {
      const r = R * 2.6 + Math.random() * R * 3.2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const idx = i * 3;
      positions[idx] = r * Math.sin(ph) * Math.cos(th);
      positions[idx + 1] = r * Math.sin(ph) * Math.sin(th);
      positions[idx + 2] = r * Math.cos(ph);
      delays[i] = Math.random() * 0.4; // 0–400ms per-particle stagger
    }
    targets.set(shape.data);
    posAttr.needsUpdate = true;
    toAttr.needsUpdate = true;
    delayAttr.needsUpdate = true;
    uStagger.value = 1;
    uProgress.value = 0;

    material.opacity = 0;
    gsap.to(material, { opacity: heroOpacity, duration: 1.4, ease: "power1.out" });
    gsap.killTweensOf(morphProgress);
    gsap.to(morphProgress, { value: 1, duration: 2.1, ease: "none" });
  }

  // Assemble the hero shape. (Caller signals preloader-done once this
  // instance's promise resolves — see ParticleCanvas.tsx.)
  assembleInto(heroShape);

  // Scroll choreography — a deliberate, sparse sequence, supplied per page as
  // a beat list (see SceneConfig). The field only forms a shape at a handful of
  // narrative beats and is faded out everywhere else, so it never competes with
  // content-heavy sections. Every page follows the same grammar: a thesis shape
  // in the hero, one or two development beats, then a resolve into the eagle at
  // the CTA — which is what makes five separate choreographies read as one site.
  // See docs/research/ANIMATION_CHOREOGRAPHY.md.
  // (Horizontal placement `side` is computed above via computeSide() and kept
  // current on resize — see handleResize.)

  // ScrollTriggers created by this scene instance, so dispose() can kill only
  // its own — a blanket ScrollTrigger.getAll() kill would also wipe out
  // triggers owned by other parts of the app.
  const instanceScrollTriggers: ScrollTrigger[] = [];

  // Defer ScrollTrigger creation so the DOM exists.
  requestAnimationFrame(() => {
    const sweep = (trigger: string, to: number) => {
      const tween = gsap.to(scene.position, {
        x: to,
        scrollTrigger: { trigger, scrub: true, start: "top bottom", end: "top center" },
      });
      if (tween.scrollTrigger) instanceScrollTriggers.push(tween.scrollTrigger);
      return tween;
    };

    // Fade the whole field's opacity (used to fully hide it over content-heavy
    // sections and bring it back for the next formation).
    const fade = (opacity: number, dur = 0.7) => {
      gsap.killTweensOf(material);
      gsap.to(material, { opacity, duration: dur, ease: "power2.out" });
    };

    const on = (
      trigger: string,
      {
        start = "top center",
        ...handlers
      }: {
        start?: string;
        onEnter?: () => void;
        onEnterBack?: () => void;
        onLeave?: () => void;
        onLeaveBack?: () => void;
      }
    ) => {
      const st = ScrollTrigger.create({ trigger, start, ...handlers });
      instanceScrollTriggers.push(st);
      return st;
    };

    // Drive the page's beat list. Each beat is idempotent — the same handler
    // runs on scroll-down (onEnter) and scroll-up (onEnterBack) so the field
    // lands in the same state whichever direction the reader arrives from.
    for (const beat of beats) {
      const shape = beat.shape ? shapes.get(beat.shape) : undefined;
      if (beat.shape && !shape) {
        // A beat naming a shape the registry didn't build would silently show
        // the previous formation — loud enough to catch in dev, harmless live.
        console.warn(`particle-scene: beat "${beat.trigger}" wants unbuilt shape "${beat.shape}"`);
      }

      if (beat.sweep !== undefined) sweep(beat.trigger, side * beat.sweep);

      const apply = () => {
        if (beat.ports) showPorts();
        else hidePorts();
        fade(capOpacity(beat.opacity ?? 1), beat.fadeDuration);
        if (shape) morphTo(shape);
      };

      const leaveBack = beat.onLeaveBack;
      on(beat.trigger, {
        start: beat.start,
        onEnter: apply,
        onEnterBack: apply,
        ...(leaveBack && {
          onLeaveBack: () => {
            if (!leaveBack.ports) hidePorts();
            fade(capOpacity(leaveBack.opacity ?? 0), leaveBack.fadeDuration);
          },
        }),
      });
    }

    ScrollTrigger.refresh();
  });

  // ── Initial-load robustness ────────────────────────────────────────────────
  // The canvas mounts asynchronously and the page keeps reflowing after first
  // paint (web fonts swap in, images/hero pin resize, the preloader releases
  // scroll). So the canvas size and every scroll-trigger position computed above
  // are stale on load — which is exactly why a manual window resize "fixed" the
  // globe. Replay that resize automatically at each moment the layout can still
  // change, so it lands correct on load at any display size, no interaction.
  let disposed = false;
  const settleTimers: number[] = [];
  const resync = () => {
    if (disposed) return;
    handleResize(); // camera aspect + renderer size + fitScale + re-place globe
    ScrollTrigger.refresh(); // recompute every pin/scrub start–end position
  };
  if (document.readyState === "complete") {
    settleTimers.push(window.setTimeout(resync, 0));
  } else {
    window.addEventListener("load", resync, { once: true });
  }
  // Web fonts reflow headings (which move the pinned sections) — refresh once
  // they're ready.
  document.fonts?.ready.then(resync).catch(() => {});
  // Safety net for anything that settles slightly later (images, preloader).
  settleTimers.push(window.setTimeout(resync, 400));
  settleTimers.push(window.setTimeout(resync, 1200));

  return {
    domElement: canvas,
    dispose() {
      disposed = true;
      settleTimers.forEach((t) => clearTimeout(t));
      window.removeEventListener("load", resync);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Not composer.dispose(): it also disposes Pass.fullscreenGeometry, a
      // static triangle shared by every EffectComposer on the page — doing
      // so here would break any composer created after this one remounts
      // (e.g. navigating back to this route). Dispose only what this
      // instance owns.
      if (composer) {
        composer.passes.forEach((pass) => pass.dispose());
        composer.inputBuffer?.dispose();
        composer.outputBuffer?.dispose();
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      // Port-globe overlay: dispose each label/arc's own geometry + material
      // (and its unique canvas texture — but not the shared particle `texture`,
      // freed once below).
      portGroup?.traverse((o) => {
        const obj = o as THREE.Mesh & THREE.Line & THREE.Sprite;
        obj.geometry?.dispose?.();
        const m = obj.material as THREE.Material & { map?: THREE.Texture | null };
        if (m) {
          if (m.map && m.map !== texture) m.map.dispose();
          m.dispose();
        }
      });
      texture.dispose();
      perfHud?.dispose();
      gsap.killTweensOf(morphProgress);
      instanceScrollTriggers.forEach((st) => st.kill());
    },
  };
}

