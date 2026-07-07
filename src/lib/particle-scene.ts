import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { markPreloaderDone } from "@/lib/site-events";

const COUNT = 10000;

interface ProxyVertex {
  x: number;
  y: number;
  z: number;
}

interface Shape {
  name: string;
  data: Float32Array;
  color: number;
}

export interface ParticleScene {
  domElement: HTMLCanvasElement;
  dispose(): void;
}

// Trivoxa particle palette
const GOLD = 0xd9b36c;
const SILVER = 0xcfd2d4;

function loadOBJ(url: string, name: string, scale: number, color: number): Promise<Shape> {
  return new Promise((resolve) => {
    const loader = new OBJLoader();
    loader.load(url, (obj) => {
      const firstMesh = obj.children.find((c): c is THREE.Mesh => c instanceof THREE.Mesh);
      if (!firstMesh) {
        resolve({ name, data: new Float32Array(COUNT * 3), color });
        return;
      }
      const mesh = firstMesh;
      const box = new THREE.Box3().setFromObject(obj);
      const yOffset = box.max.y * scale * 0.5;

      mesh.geometry.scale(scale, scale, scale);
      const sampler = new MeshSurfaceSampler(mesh).build();
      const shapeData = new Float32Array(COUNT * 3);
      const tmp = new THREE.Vector3();

      for (let i = 0; i < COUNT; i++) {
        sampler.sample(tmp);
        shapeData[i * 3] = tmp.x;
        shapeData[i * 3 + 1] = tmp.y - yOffset;
        shapeData[i * 3 + 2] = tmp.z;
      }
      resolve({ name, data: shapeData, color });
    });
  });
}

/** Sample COUNT points off any BufferGeometry surface (for procedural import/export shapes). */
function sampleGeometry(geo: THREE.BufferGeometry, name: string, color: number): Shape {
  const mesh = new THREE.Mesh(geo);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const data = new Float32Array(COUNT * 3);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < COUNT; i++) {
    sampler.sample(tmp);
    data[i * 3] = tmp.x;
    data[i * 3 + 1] = tmp.y;
    data[i * 3 + 2] = tmp.z;
  }
  geo.dispose();
  return { name, data, color };
}

/** Build the Trivoxa eagle silhouette as a point cloud from the logo PNG's alpha channel. */
function loadEagle(url: string, name: string, targetWidth: number, color: number): Promise<Shape> {
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
      const data = new Float32Array(COUNT * 3);
      if (!cx) {
        resolve({ name, data, color });
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
      const n = opaque.length / 2;
      for (let i = 0; i < COUNT; i++) {
        const s = (Math.floor((i / COUNT) * n) % n) * 2;
        const jx = opaque[s] + Math.random();
        const jy = opaque[s + 1] + Math.random();
        data[i * 3] = (jx - w / 2) * unit;
        data[i * 3 + 1] = -(jy - h / 2) * unit;
        data[i * 3 + 2] = (Math.random() - 0.5) * targetWidth * 0.04;
      }
      resolve({ name, data, color });
    };
    img.onerror = () => resolve({ name, data: new Float32Array(COUNT * 3), color });
    img.src = url;
  });
}

export async function createParticleScene(): Promise<ParticleScene> {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
  camera.position.z = 36;

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;";

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("/images/particle-tiny.png");

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    map: texture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const proxy: ProxyVertex[] = Array.from({ length: COUNT }, () => ({ x: 0, y: 0, z: 0 }));

  const speed = { value: 0.005 };
  let animId = 0;
  let needsUpdate = false;

  function writeIntoBufferAttribute() {
    needsUpdate = true;
  }

  function renderLoop() {
    points.rotation.y += speed.value;
    if (needsUpdate) {
      const posArr = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const idx = i * 3;
        posArr[idx] = proxy[i].x;
        posArr[idx + 1] = proxy[i].y;
        posArr[idx + 2] = proxy[i].z;
      }
      geometry.attributes.position.needsUpdate = true;
      needsUpdate = false;
    }
    renderer.render(scene, camera);
    animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", handleResize);

  // scale multiplier per viewport
  const S = width > 1024 ? 1 : width > 576 ? 0.82 : 0.66;
  const globeS = (width > 1024 ? 4.5 : width > 576 ? 4 : 3.5);
  const R = 7 * S; // nominal shape radius in world units

  // Import/export + brand shapes.
  // 0 globe (hero) · 1 eagle (brand/about) · 2 cargo container (businesses)
  // 3 globe (industries/reach) · 4 container stack (global presence) · 5 eagle (CTA outline)
  const container = () => {
    const g = new THREE.BoxGeometry(2.3 * R, 1.1 * R, 1.1 * R, 40, 20, 20);
    return sampleGeometry(g, "container", GOLD);
  };

  const [globe, eagle] = await Promise.all([
    loadOBJ("/objects/globe2.obj", "globe", globeS, GOLD),
    loadEagle("/images/trivoxa-eagle.png", "eagle", 20 * S, SILVER),
  ]);
  const eagle2: Shape = { name: "eagle-cta", data: eagle.data, color: SILVER };
  const globe2: Shape = { name: "globe-reach", data: globe.data, color: GOLD };

  const shapes: Shape[] = [globe, eagle, container(), globe2, container(), eagle2];

  function morphTo(shape: Shape) {
    gsap.to(speed, {
      duration: 0.3,
      ease: "power4.in",
      value: 0.02,
      onComplete: () => {
        gsap.to(speed, { duration: 4, ease: "power2.out", value: 0.005, delay: 1 });
      },
    });
    material.color.setHex(shape.color);
    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      gsap.to(proxy[i], {
        duration: 4,
        ease: "elastic.out(1, 0.75)",
        x: shape.data[idx],
        y: shape.data[idx + 1],
        z: shape.data[idx + 2],
        onUpdate: writeIntoBufferAttribute,
      });
    }
  }

  // Preloader done, animate to globe
  markPreloaderDone();
  morphTo(shapes[0]);

  // Scroll choreography
  const isMobile = width <= 575;
  const isTablet = width > 575 && width <= 1024;

  const sec2Target = isMobile ? -4 : -6;
  const sec3Target = isMobile ? 3 : isTablet ? 7 : 14;
  const sec4Target = isMobile ? 0 : isTablet ? 0 : -6;
  const contactTarget = isMobile ? 0 : isTablet ? 5 : 9;
  const initialX = isMobile ? 0 : isTablet ? 6 : 9;

  scene.position.x = initialX;

  // Defer ScrollTrigger creation so DOM exists
  requestAnimationFrame(() => {
    gsap.to(scene.position, {
      x: sec2Target,
      scrollTrigger: { trigger: ".hp-sec-2", scrub: true, start: "top bottom", end: "top center" },
    });

    ScrollTrigger.create({
      trigger: ".hp-sec-2",
      start: "top center",
      onEnter: () => morphTo(shapes[1]), // astronaut
    });
    ScrollTrigger.create({
      trigger: ".hp-sec-1",
      start: "center center",
      end: "bottom center",
      onEnterBack: () => morphTo(shapes[0]), // globe
    });

    gsap.fromTo(
      scene.position,
      { x: sec2Target },
      {
        x: sec3Target,
        scrollTrigger: { trigger: ".hp-sec-3", scrub: true, start: "top bottom", end: "bottom bottom" },
      }
    );

    ScrollTrigger.create({
      trigger: ".hp-sec-3",
      start: "top center",
      onEnter: () => morphTo(shapes[2]), // rocket
    });
    ScrollTrigger.create({
      trigger: ".hp-sec-2",
      start: "center center",
      onEnterBack: () => morphTo(shapes[1]), // astronaut
    });

    gsap.fromTo(
      scene.position,
      { x: sec3Target },
      {
        x: sec4Target,
        scrollTrigger: { trigger: ".hp-sec-4", scrub: true, start: "top bottom", end: "bottom bottom" },
      }
    );

    ScrollTrigger.create({
      trigger: ".hp-sec-4 .container .row-wrapper.first",
      start: "top center",
      onEnter: () => morphTo(shapes[3]), // bar graph
    });
    ScrollTrigger.create({
      trigger: ".hp-sec-3",
      start: "center center",
      onEnterBack: () => morphTo(shapes[2]), // rocket
    });

    ScrollTrigger.create({
      trigger: ".hp-sec-4 .container .row-wrapper.second",
      start: "top center",
      onEnter: () => morphTo(shapes[4]), // movie
    });
    ScrollTrigger.create({
      trigger: ".hp-sec-4 .container .row-wrapper.first",
      start: "center center",
      onEnterBack: () => morphTo(shapes[3]), // bar graph
    });

    gsap.fromTo(
      scene.position,
      { x: sec4Target },
      {
        x: contactTarget,
        scrollTrigger: { trigger: ".hp-contact-section .container .contact", scrub: true, start: "top bottom", end: "bottom bottom" },
      }
    );

    ScrollTrigger.create({
      trigger: ".hp-contact-section",
      start: "top center",
      onEnter: () => morphTo(shapes[5]), // phone
    });
    ScrollTrigger.create({
      trigger: ".hp-sec-4 .container .row-wrapper.second",
      start: "center center",
      onEnterBack: () => morphTo(shapes[4]), // movie
    });

    gsap.fromTo(
      scene.scale,
      { x: 1, y: 1, z: 1 },
      {
        x: 15, y: 15, z: 15,
        scrollTrigger: { trigger: ".footer", scrub: true, start: "top bottom-=100px", end: "bottom bottom" },
      }
    );
  });

  return {
    domElement: canvas,
    dispose() {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      gsap.killTweensOf(proxy);
      gsap.killTweensOf(speed);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    },
  };
}
