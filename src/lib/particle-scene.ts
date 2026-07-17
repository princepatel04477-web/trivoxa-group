import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildGlobeGeometry } from "./globe-geometry";
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
        points.rotation.y += IDLE_OMEGA * delta;
        points.rotation.x += (0 - points.rotation.x) * kSettle;
        holder.rotation.z += (AXIAL_TILT - holder.rotation.z) * kSettle;
        holder.rotation.x += (pointer.y * PARALLAX_MAX - holder.rotation.x) * kParallax;
        holder.rotation.y += (pointer.x * PARALLAX_MAX - holder.rotation.y) * kParallax;
        scaleTo1();
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
  }
  window.addEventListener("resize", handleResize);

  // scale multiplier per viewport (matches vpScale used for the globe radius)
  const S = width > 1024 ? 1 : width > 576 ? 0.82 : 0.66;
  const R = 7 * S; // nominal shape radius in world units (== globeRadius)

  // Cargo plane (Services) — side-profile silhouette flying +X, with a subset
  // of grains pulled into trailing streaks behind the tail to read as speed.
  // flat:true so it holds a stable, readable profile facing the camera.
  const cargoPlane = ((): Shape => {
    const fuselage = new THREE.BoxGeometry(R * 3.4, R * 0.5, R * 0.2, 60, 8, 6);
    const fin = new THREE.BoxGeometry(R * 0.5, R * 0.95, R * 0.18, 8, 16, 4);
    fin.translate(-R * 1.3, R * 0.55, 0);
    const stab = new THREE.BoxGeometry(R * 0.85, R * 0.14, R * 0.18, 12, 4, 4);
    stab.translate(-R * 1.4, R * 0.12, 0);
    const wing = new THREE.BoxGeometry(R * 1.9, R * 0.16, R * 0.95, 24, 4, 12);
    wing.rotateZ(-0.3);
    wing.translate(R * 0.05, -R * 0.05, 0);
    const merged = mergeGeometries([fuselage, fin, stab, wing], false)!;
    [fuselage, fin, stab, wing].forEach((g) => g.dispose());
    const shape = sampleGeometry(merged, "cargo-plane", GOLD, count);
    shape.flat = true;
    for (let i = 0; i < count; i++) {
      if (i % 7 === 0) {
        const idx = i * 3;
        shape.data[idx] = -R * 1.7 - Math.random() * R * 2.4; // trail behind tail
        shape.data[idx + 1] = (Math.random() - 0.5) * R * 0.55;
        shape.data[idx + 2] = (Math.random() - 0.5) * R * 0.25;
      }
    }
    return shape;
  })();

  // Ambient footer drift — a wide, sparse cloud filling the viewport; combined
  // with a low material opacity it reads as low-density wandering grains behind
  // the footer copy without competing for legibility.
  const driftCloud: Shape = ((): Shape => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (Math.random() * 2 - 1) * R * 3.7;
      data[i * 3 + 1] = (Math.random() * 2 - 1) * R * 2.2;
      data[i * 3 + 2] = (Math.random() * 2 - 1) * R * 0.9;
    }
    return { name: "drift", data, color: GOLD };
  })();

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

  // Scroll choreography — one calm, meaningful formation per zone, held across
  // neighbouring sections so the field never reads as a per-section shape
  // grab-bag: globe (hero) → cargo plane (exports) → flat trade map, locked
  // (global) → globe again (why-choose-us hold) → eagle logo (CTA) → drift (footer).
  const isTablet = width > 575 && width <= 1024;
  // Horizontal offset scales with the visible world-width at the globe's depth
  // so it sits at a consistent fraction of the screen on any aspect ratio,
  // rather than a fixed world offset that shoves it off a narrower display.
  const halfH = Math.tan((35 * Math.PI) / 180 / 2) * camera.position.z; // ~11.3
  const halfW = halfH * (width / height);
  const side = isMobile ? 0 : Math.min(isTablet ? 5 : 8, halfW * 0.34);

  scene.position.x = side; // hero: globe sits opposite the left-aligned headline

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

    const morphAt = (trigger: string, shape: Shape) => {
      const fire = () => morphTo(shape);
      const st = ScrollTrigger.create({ trigger, start: "top center", onEnter: fire, onEnterBack: fire });
      instanceScrollTriggers.push(st);
      return st;
    };

    // Hero globe holds through About (only recentres — no re-form).
    sweep(".hp-about", 0);
    morphAt(".hp-about", globe);

    // Exports → cargo plane, held through Industries. Sits to the right,
    // opposite the left-aligned "PRODUCT EXPORTS" headline.
    sweep(".hp-sec-4", side * 0.9);
    morphAt(".hp-sec-4", cargoPlane);
    sweep(".hp-sec-2", side * 0.9);
    morphAt(".hp-sec-2", cargoPlane);

    // Global Presence — a container ship (maritime trade "across borders"),
    // centered behind the copy. Grains fly from the plane straight into the
    // ship; re-forms to the globe on the way out.
    sweep(".hp-global", 0);
    morphAt(".hp-global", cargoShip);

    const reGlobeTrigger = ScrollTrigger.create({
      trigger: ".hp-global",
      start: "bottom center",
      onEnter: () => morphTo(globe),
      onEnterBack: () => morphTo(cargoShip),
    });
    instanceScrollTriggers.push(reGlobeTrigger);

    // Why-Choose-Us hold zone (Values / Certifications / Insights / Careers):
    // no new formation — the globe holds and drifts side to side.
    sweep(".hp-insights", -side * 0.7);
    morphAt(".hp-insights", globe);
    sweep(".hp-careers", side * 0.7);
    morphAt(".hp-careers", globe);

    // Contact / CTA — the Trivoxa eagle logo, in grains, behind the copy.
    sweep(".hp-cta", 0);
    morphAt(".hp-cta", eagle);

    // Footer — merges with the CTA: the field drops to a sparse, dim ambient
    // drift so footer copy stays fully legible. Scrolling back up restores the
    // eagle logo at full opacity.
    const footerTrigger = ScrollTrigger.create({
      trigger: ".footer",
      start: "top center",
      onEnter: () => {
        morphTo(driftCloud);
        gsap.to(material, { opacity: 0.24, duration: 0.8, ease: "power2.out" });
      },
      onLeaveBack: () => {
        gsap.to(material, { opacity: 1, duration: 0.5, ease: "power2.out" });
        morphTo(eagle);
      },
    });
    instanceScrollTriggers.push(footerTrigger);

    ScrollTrigger.refresh();
  });

  return {
    domElement: canvas,
    dispose() {
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
      texture.dispose();
      gsap.killTweensOf(morphProgress);
      instanceScrollTriggers.forEach((st) => st.kill());
    },
  };
}

