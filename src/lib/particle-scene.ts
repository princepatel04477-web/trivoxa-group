import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildGlobeGeometry } from "./globe-geometry";
import { latLonToVec3 } from "./geo-sphere";
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

// Density tiers (Phase 3.3): desktop 12–18k, mobile 5–7k instanced points.
const COUNT_DESKTOP = 14000;
const COUNT_MOBILE = 6000;
const MAX_DPR_DESKTOP = 1.5;
const MAX_DPR_MOBILE = 1.5;

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

interface ProxyVertex {
  x: number;
  y: number;
  z: number;
}

interface Shape {
  name: string;
  data: Float32Array;
  color: number;
  /** Flat silhouettes (the eagle) breathe + follow the cursor instead of spinning. */
  flat?: boolean;
}

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

// All particle rendering uses --gold-particle (#D4AF5E). Layer B is dimmed via
// opacity in the shader, never a different hue.
const GOLD = 0xd4af5e;

/** Sample `count` points off any BufferGeometry surface (for procedural import/export shapes). */
function sampleGeometry(geo: THREE.BufferGeometry, name: string, color: number, count: number): Shape {
  const mesh = new THREE.Mesh(geo);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const data = new Float32Array(count * 3);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sampler.sample(tmp);
    data[i * 3] = tmp.x;
    data[i * 3 + 1] = tmp.y;
    data[i * 3 + 2] = tmp.z;
  }
  geo.dispose();
  return { name, data, color };
}

/** Build the Trivoxa eagle logo as a flat point cloud from the mark's PNG alpha
 * channel — the brand mark itself, rendered in grains, for the final CTA. */
function loadEagle(url: string, name: string, targetWidth: number, color: number, count: number): Promise<Shape> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = 260;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const cx = cv.getContext("2d");
      const data = new Float32Array(count * 3);
      if (!cx) {
        resolve({ name, data, color, flat: true });
        return;
      }
      cx.drawImage(img, 0, 0, w, h);
      const px = cx.getImageData(0, 0, w, h).data;
      const opaque: number[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (px[(y * w + x) * 4 + 3] > 128) opaque.push(x, y);
        }
      }
      const unit = targetWidth / w;
      const n = opaque.length / 2 || 1;
      for (let i = 0; i < count; i++) {
        const s = (Math.floor((i / count) * n) % n) * 2;
        const jx = opaque[s] + Math.random();
        const jy = opaque[s + 1] + Math.random();
        data[i * 3] = (jx - w / 2) * unit;
        data[i * 3 + 1] = -(jy - h / 2) * unit;
        data[i * 3 + 2] = (Math.random() - 0.5) * targetWidth * 0.04;
      }
      resolve({ name, data, color, flat: true });
    };
    img.onerror = () => resolve({ name, data: new Float32Array(count * 3), color, flat: true });
    img.src = url;
  });
}

export async function createParticleScene(): Promise<ParticleScene> {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width <= 575;
  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;
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

  // Fibonacci two-layer globe (Phase 3): Layer A landmass first, Layer B shell.
  const globeGeo = buildGlobeGeometry(count, globeRadius);
  const globe: Shape = { name: "globe", data: globeGeo.positions, color: GOLD };

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // Per-particle random phase drives the idle shimmer entirely on the GPU —
  // each grain's opacity oscillates on its own phase (no synchronized "flat"
  // twinkle), and it costs zero per-frame CPU: only the uTime uniform ticks.
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) phases[i] = Math.random() * Math.PI * 2;
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  // Layer flag per particle (0 = landmass, 1 = shell). Fixed for the pool; the
  // shader only acts on it while the field is the globe (uGlobe), so flat shapes
  // are unaffected.
  geometry.setAttribute("aLayer", new THREE.BufferAttribute(globeGeo.layer, 1));

  const shimmerUniform = { value: 0 };
  // 1 while the field is the globe, 0 for flat formations — gates the globe-only
  // depth cueing and Layer-B dimming. Lerped in the render loop for smoothness.
  const uGlobeUniform = { value: 1 };
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
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aPhase;\nattribute float aLayer;\nuniform float uTime;\nuniform float uGlobe;\nvarying float vAlpha;"
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
    // Globe's on-screen radius (incl. the outer shell), so we can guarantee it
    // stays inside the frustum with margin.
    const onscreenR = globeRadius * fitScale() * 1.08;
    const frac = w <= 1024 ? 0.34 : 0.42; // how far right of centre it sits
    // Reserve enough room that even the enlarged ports globe (scaled 1.22× in
    // the render loop) stays fully on-screen when parked on the right.
    const maxRight = Math.max(0, halfW - onscreenR * 1.32);
    return Math.min(halfW * frac, maxRight);
  };
  let side = computeSide();
  scene.position.x = side; // hero: globe sits opposite the left-aligned headline

  const proxy: ProxyVertex[] = Array.from({ length: count }, () => ({ x: 0, y: 0, z: 0 }));
  const sourceX = new Float32Array(count);
  const sourceY = new Float32Array(count);
  const sourceZ = new Float32Array(count);
  const morphProgress = { value: 0 };

  let animId = 0;
  let paused = false;
  let needsUpdate = false;
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

  function writeIntoBufferAttribute() {
    needsUpdate = true;
  }

  const clock = new THREE.Clock();

  function renderLoop() {
    // Delta-time normalization: every idle motion below is scaled by real
    // elapsed seconds, so speed is identical at 30, 60, or 144fps. Clamp the
    // step so a background tab returning doesn't jump the animation.
    const delta = Math.min(clock.getDelta(), 0.05);
    const dt60 = delta * 60; // frames-equivalent, for the old per-frame rates
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
      const scaleTo1 = () =>
        points.scale.setScalar(points.scale.x + (1 - points.scale.x) * kSettle);
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
        // Enlarge the globe while the ports overlay is up so the world map and
        // its named hubs get more room; eases back to 1 for the hero globe.
        const globeScale = portsMode ? 1.22 : 1;
        points.scale.setScalar(points.scale.x + (globeScale - points.scale.x) * kSettle);
      } else if (currentFlat) {
        // LOCKED formation (trade map / eagle logo / cargo plane). The centroid
        // must not drift, rotate, or breathe — ease all residual motion to zero.
        points.rotation.y += (0 - points.rotation.y) * kSettle;
        points.rotation.x += (0 - points.rotation.x) * kSettle;
        holder.rotation.z += (0 - holder.rotation.z) * kSettle;
        holder.rotation.x += (0 - holder.rotation.x) * kSettle;
        holder.rotation.y += (0 - holder.rotation.y) * kSettle;
        scaleTo1();
      } else {
        // Ambient footer drift — slow single-axis wander, no tilt or parallax.
        points.rotation.y += IDLE_OMEGA * 0.35 * delta;
        points.rotation.x += (0 - points.rotation.x) * kSettle;
        holder.rotation.z += (0 - holder.rotation.z) * kSettle;
        holder.rotation.x += (0 - holder.rotation.x) * kSettle;
        holder.rotation.y += (0 - holder.rotation.y) * kSettle;
        scaleTo1();
      }
    }

    if (needsUpdate) {
      const posArr = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        posArr[idx] = proxy[i].x;
        posArr[idx + 1] = proxy[i].y;
        posArr[idx + 2] = proxy[i].z;
      }
      geometry.attributes.position.needsUpdate = true;
      needsUpdate = false;
    }
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
    animId = requestAnimationFrame(renderLoop);
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

  // scale multiplier per viewport (matches vpScale used for the globe radius)
  const S = width > 1024 ? 1 : width > 576 ? 0.82 : 0.66;
  const R = 7 * S; // nominal shape radius in world units (== globeRadius)

  // globe is built procedurally above (buildGlobeGeometry). Only the eagle mark
  // still needs async decode of its PNG alpha.
  const eagle = await loadEagle("/images/trivoxa-eagle.png", "eagle", 20 * S, GOLD, count);

  // Container ship (Global Presence) — maritime trade "across borders": long
  // hull, a grid of stacked deck containers, and a bridge tower at the stern.
  // flat:true → a stable, readable side profile facing the camera.
  const cargoShip = ((): Shape => {
    const parts: THREE.BufferGeometry[] = [];
    const hull = new THREE.BoxGeometry(R * 3.4, R * 0.55, R * 0.7, 60, 8, 8);
    hull.translate(0, -R * 0.35, 0);
    parts.push(hull);
    const cols = 7;
    const rows = 3;
    const cw = R * 0.42;
    const ch = R * 0.3;
    const gap = R * 0.05;
    const startX = -R * 1.3;
    for (let c = 0; c < cols; c++) {
      const stack = c === cols - 1 ? rows - 1 : rows; // taper the bow stack
      for (let r = 0; r < stack; r++) {
        const box = new THREE.BoxGeometry(cw, ch, R * 0.55, 6, 5, 6);
        box.translate(startX + c * (cw + gap), -R * 0.02 + r * (ch + gap * 0.6), 0);
        parts.push(box);
      }
    }
    const bridge = new THREE.BoxGeometry(R * 0.5, R * 0.75, R * 0.52, 6, 12, 6);
    bridge.translate(R * 1.2, R * 0.42, 0);
    parts.push(bridge);
    const merged = mergeGeometries(parts, false)!;
    parts.forEach((g) => g.dispose());
    const shape = sampleGeometry(merged, "cargo-ship", GOLD, count);
    shape.flat = true;
    return shape;
  })();

  // Small shipping container (About — "A Vision Beyond Business"): a single
  // corrugated box, sampled and held as a flat profile. Deliberately smaller
  // than the ship so the two maritime beats read as distinct moments.
  const container = ((): Shape => {
    const parts: THREE.BufferGeometry[] = [];
    const body = new THREE.BoxGeometry(R * 1.7, R * 0.74, R * 0.74, 46, 16, 16);
    parts.push(body);
    const ribs = 10;
    for (let i = 0; i < ribs; i++) {
      const rib = new THREE.BoxGeometry(R * 0.028, R * 0.74, R * 0.78, 2, 12, 8);
      rib.translate(-R * 0.82 + (i / (ribs - 1)) * R * 1.64, 0, 0);
      parts.push(rib);
    }
    const merged = mergeGeometries(parts, false)!;
    parts.forEach((g) => g.dispose());
    const shape = sampleGeometry(merged, "container", GOLD, count);
    shape.flat = true;
    return shape;
  })();

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
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        proxy[i].x = shape.data[idx];
        proxy[i].y = shape.data[idx + 1];
        proxy[i].z = shape.data[idx + 2];
      }
      writeIntoBufferAttribute();
      onProgress?.(1); // jump-cut still resolves any blend the caller drives off this call
      return;
    }

    for (let i = 0; i < count; i++) {
      sourceX[i] = proxy[i].x;
      sourceY[i] = proxy[i].y;
      sourceZ[i] = proxy[i].z;
    }

    morphProgress.value = 0;
    gsap.killTweensOf(morphProgress);
    gsap.to(morphProgress, {
      value: 1,
      duration: 4,
      ease: "elastic.out(1, 0.75)",
      onUpdate: () => {
        const easeVal = morphProgress.value;
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          proxy[i].x = sourceX[i] + (shape.data[idx] - sourceX[i]) * easeVal;
          proxy[i].y = sourceY[i] + (shape.data[idx + 1] - sourceY[i]) * easeVal;
          proxy[i].z = sourceZ[i] + (shape.data[idx + 2] - sourceZ[i]) * easeVal;
        }
        writeIntoBufferAttribute();
        onProgress?.(easeVal);
      },
    });
  }

  function smoothstep(edge0: number, edge1: number, x: number): number {
    const s = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1)));
    return s * s * (3 - 2 * s);
  }

  // Hero: scatter every grain into a chaotic shell, then let each fall into the
  // globe on its own 0–400ms-delayed track, so the sphere coalesces like
  // settling dust rather than snapping in on one synchronized keyframe (§2).
  function assembleGlobe() {
    material.color.setHex(globe.color);
    currentFlat = false;
    currentIsGlobe = true;
    if (reducedMotion) {
      for (let i = 0; i < count; i++) {
        proxy[i].x = globe.data[i * 3];
        proxy[i].y = globe.data[i * 3 + 1];
        proxy[i].z = globe.data[i * 3 + 2];
      }
      material.opacity = 1;
      writeIntoBufferAttribute();
      return;
    }
    const delays = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = R * 2.6 + Math.random() * R * 3.2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      sourceX[i] = r * Math.sin(ph) * Math.cos(th);
      sourceY[i] = r * Math.sin(ph) * Math.sin(th);
      sourceZ[i] = r * Math.cos(ph);
      proxy[i].x = sourceX[i];
      proxy[i].y = sourceY[i];
      proxy[i].z = sourceZ[i];
      delays[i] = Math.random() * 0.4; // 0–400ms per-particle stagger
    }
    material.opacity = 0;
    writeIntoBufferAttribute();
    gsap.to(material, { opacity: 1, duration: 1.4, ease: "power1.out" });
    morphProgress.value = 0;
    gsap.killTweensOf(morphProgress);
    gsap.to(morphProgress, {
      value: 1,
      duration: 2.1,
      ease: "none",
      onUpdate: () => {
        const g = morphProgress.value;
        for (let i = 0; i < count; i++) {
          const lt = smoothstep(delays[i], delays[i] + 0.55, g);
          const idx = i * 3;
          proxy[i].x = sourceX[i] + (globe.data[idx] - sourceX[i]) * lt;
          proxy[i].y = sourceY[i] + (globe.data[idx + 1] - sourceY[i]) * lt;
          proxy[i].z = sourceZ[i] + (globe.data[idx + 2] - sourceZ[i]) * lt;
        }
        writeIntoBufferAttribute();
      },
    });
  }

  // Assemble the hero globe. (Caller signals preloader-done once this
  // instance's promise resolves — see ParticleCanvas.tsx.)
  assembleGlobe();

  // Scroll choreography — a deliberate, sparse sequence. The field only forms a
  // shape at four narrative beats and is fully hidden everywhere else, so it
  // never competes with content-heavy sections:
  //   globe (hero) → vessel (trust) → container (about) → [hidden: business
  //   arms + industries] → ports globe (global presence) → [hidden: values /
  //   insights / careers] → eagle (CTA) → dimmed eagle (footer).
  // (Globe horizontal placement `side` is computed above via computeSide() and
  // kept current on resize — see handleResize.)

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

    // 1 · Trust ("A sourcing partner, not just a supplier directory") — a cargo
    //     vessel. The hero globe flies straight into the ship. Sits to the side.
    sweep(".hp-trust", side);
    on(".hp-trust", {
      onEnter: () => { fade(1); morphTo(cargoShip); },
      onEnterBack: () => { fade(1); morphTo(cargoShip); },
    });

    // 2 · About ("A Vision Beyond Business") — a single small container.
    sweep(".hp-about", side * 0.7);
    on(".hp-about", {
      onEnter: () => { fade(1); morphTo(container); },
      onEnterBack: () => { fade(1); morphTo(container); },
    });

    // 3 · Business Arms + Industries carousel — NO animation. Fade the field
    //     fully out and hold it hidden across both content-dense sections.
    on(".hp-sec-4", {
      onEnter: () => fade(0),
      onEnterBack: () => fade(0),
    });

    // 4 · Global Presence ("Connecting Opportunities Across Borders") — the big
    //     ports globe with named markers, parked on the RIGHT so the section's
    //     copy (left-aligned in CSS) sits clear of it.
    sweep(".hp-global", side);
    on(".hp-global", {
      onEnter: () => { fade(1); morphTo(globe); showPorts(); },
      onEnterBack: () => { fade(1); morphTo(globe); showPorts(); },
      onLeaveBack: () => { hidePorts(); fade(0); }, // scrolling up into carousel
    });

    // 5 · Values / Insights / Careers — NO animation. Keep the field hidden.
    on(".hp-values", {
      onEnter: () => { hidePorts(); fade(0); },
      onEnterBack: () => { hidePorts(); fade(0); },
    });

    // 6 · Final CTA — the Trivoxa eagle, in grains, behind the copy.
    sweep(".hp-cta", 0);
    on(".hp-cta", {
      onEnter: () => { hidePorts(); fade(1); morphTo(eagle); },
      onEnterBack: () => { hidePorts(); fade(1); morphTo(eagle); },
    });

    // 7 · Footer — hold the eagle but drop it to a dim wash so footer copy stays
    //     fully legible; scrolling back up restores full opacity.
    on(".footer", {
      onEnter: () => fade(0.18, 0.8),
      onLeaveBack: () => fade(1, 0.5),
    });

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
      gsap.killTweensOf(morphProgress);
      instanceScrollTriggers.forEach((st) => st.kill());
    },
  };
}

