# ParticleCanvas Specification (Three.js morphing particle scene)

## Overview
- **Target files:**
  - `src/components/ParticleCanvas.tsx` — client component owning renderer + scene
  - `src/lib/particle-scene.ts` — imperative scene controller (create/morph/position APIs)
- **Interaction model:** scroll-driven (ScrollTriggers created here, choreography from BEHAVIORS.md §"Three.js particle scene")
- **Source of truth:** `docs/research/advida.com/BEHAVIORS.md` — the §"Three.js particle scene (fixed full-screen canvas, z-index -1)" section is the EXACT ported logic of the original site's inline script (also at `docs/research/advida.com/theme-src/inline-hero-animations.js`, bottom half). Follow it literally.

## Scene construction (modern three@>=0.160 — original used r6x-era APIs)
- `WebGLRenderer({ alpha: true })`, `setPixelRatio(devicePixelRatio)`, `setSize(innerWidth, innerHeight)`, `setClearColor(0x000000, 0)`; canvas styled `position:fixed; inset:0; z-index:-1;` (original appended to body; here render a `<canvas>` via ref inside a fixed div, or append renderer.domElement to a container div — either is fine as long as it's behind all content and does not intercept pointer events over interactive elements; original had `pointer-events: auto` but z-index -1).
- `PerspectiveCamera(35, aspect, 1, 10000)`, `camera.position.z = 36`. Resize handler updates aspect + renderer size.
- **COUNT = 10000** particles. Use `THREE.Points` with `BufferGeometry` + `Float32Array(COUNT*3)` position attribute (original used legacy `Geometry.vertices` — you must translate to buffer attributes).
- `PointsMaterial({ color: 0xffffff, size: 0.2, map: textureLoader.load('/images/particle-tiny.png'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })` (depthWrite false to avoid additive artifacts).
- All particles start at (0,0,0).

## Shape targets
Each shape = Float32Array(COUNT*3) of random points on the model surface:
- Load 6 OBJs from `/objects/`: `globe2.obj`, `Astronaut.obj`, `CartoonRocket.obj`, `bar-graph-001.obj`, `movie.obj`, `phone.obj` via `OBJLoader` from `three/examples/jsm/loaders/OBJLoader.js` (`three/addons/...` path per project resolution).
- Per width at mount — scales: >1024: [4.5, 3.6, 1.5, 150.1, 0.27, 1]; 576–1024: [4, 3, 1.2, 130.1, 0.2, 0.7]; ≤575: [3.5, 2.6, 1, 110.1, 0.18, 0.5].
- For each loaded object: traverse meshes; `mesh.geometry.scale(s,s,s)`; compute `new Box3().setFromObject(mesh)` BEFORE scaling and `yOffset = box.max.y * s / 2` (original: box from unscaled mesh, `t.max.y * scale / 2`); sample COUNT random surface points using `MeshSurfaceSampler` from `three/examples/jsm/math/MeshSurfaceSampler.js`; store `y - yOffset`.
- If a mesh has multiple submeshes, use the first (original overwrote per-traverse; keep behavior simple: sample from first mesh encountered).
- After EACH of the 6 loads completes decrement a counter; at 0 → `markPreloaderDone()` from `@/lib/site-events` + morph to **globe**.

## Morph engine (must feel identical)
```ts
morphTo(shape, colorHex = 0x8dd8f8) {
  gsap.to(speedRef, { duration: 0.3, ease: 'power4.in', speed: 0.02, onComplete: () =>
    gsap.to(speedRef, { duration: 4, ease: 'power2.out', speed: 0.005, delay: 1 }) });
  material.color.setHex(colorHex);
  for (let i = 0; i < COUNT; i++) {
    gsap.to(proxy[i], { duration: 4, ease: 'elastic.out(1, 0.75)', x, y, z, onUpdate: writeIntoBufferAttribute });
  }
}
```
- Original tweened 10k vertex objects (TweenMax Elastic.easeOut.config(1,0.75), 4s). With BufferGeometry keep a `positions: {x,y,z}[]` proxy array; tween each and copy into the attribute each frame (set `needsUpdate = true` once per RAF, not per tween tick — e.g. flag & write in the render loop).
- Render loop: `points.rotation.y += speed; renderer.render(scene, camera);` via RAF; speed starts 0.005.

## Scroll choreography (create AFTER shapes ready is fine; ScrollTriggers reference section class names; NO scroller option — SmoothScrollProvider sets defaults)
Per-breakpoint values (desktop >1024 / tablet 768–1024 / mobile):
- initial `scene.position.x` = 9 / 6 / 0
- sec2Target = -6 (mobile -4), sec3Target = 14 / 7 / 3, sec4Target = -6 / 0 / 0, contactTarget = 9 / 5 / 0
Triggers (copy from BEHAVIORS.md §"Scroll choreography" — exact starts/ends):
1. `gsap.to(scene.position, { x: sec2Target, scrollTrigger: { trigger: '.hp-sec-2', scrub: true, start: 'top bottom', end: 'top center' } })`
2. onEnter `.hp-sec-2` "top center"→"center center": morph **Astronaut**; onEnterBack `.hp-sec-1` "center center"→"bottom center": morph **globe**
3. `fromTo(scene.position, {x: sec2Target}, { x: sec3Target, scrollTrigger: { trigger: '.hp-sec-3', scrub: true, start: 'top bottom', end: 'bottom bottom' } })`
4. onEnter `.hp-sec-3` "top center": morph **Rocket**; onEnterBack `.hp-sec-2` "center center": morph **Astronaut**
5. `fromTo({x: sec3Target} → x: sec4Target, trigger '.hp-sec-4', scrub, 'top bottom'→'bottom bottom')`
6. onEnter `.hp-sec-4 .container .row-wrapper.first` "top center": morph **BarGraph**; onEnterBack `.hp-sec-3` "center center": morph **Rocket**
7. onEnter `.hp-sec-4 .container .row-wrapper.second` "top center": morph **Movie**; onEnterBack `.row-wrapper.first` "center center": morph **BarGraph**
8. `fromTo({x: sec4Target} → x: contactTarget, trigger '.hp-contact-section .container .contact', scrub, 'top bottom'→'bottom bottom')`
9. onEnter `.hp-contact-section` "top center": morph **Phone**; onEnterBack `.hp-sec-4 .container .row-wrapper.second` "center center": morph **Movie**
10. Footer starfield: `fromTo(scene.scale, {}, { x: 15, y: 15, z: 15, scrollTrigger: { trigger: '.footer', scrub: true, start: 'top bottom-=100px', end: 'bottom bottom' } })`
Create these in a `requestAnimationFrame` after mount so section DOM exists; the component mounts alongside sections in page.tsx.

## Assets
`/objects/*.obj` (6 files, already downloaded), `/images/particle-tiny.png`.

## Responsive
Width buckets read once at mount (match original: no re-bucketing on resize; only renderer resize).

## Notes
- Client component, `dynamic`-import-safe (no SSR): guard all three code behind mount effect.
- Dispose renderer/geometry/tweens on unmount; kill its ScrollTriggers (gsap.context).
- TS strict; three types via `@types/three`.
