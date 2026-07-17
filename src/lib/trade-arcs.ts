import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { latLonToVec3, latLonToFlatVec3 } from "./geo-sphere";

// Mirrors GlobalPresenceTicker.tsx's ORIGINS/DESTINATIONS/ARCS exactly so the
// 3D globe overlay and the 2D ticker map tell the same trade story.
const ORIGINS: Record<string, [number, number]> = {
  Mumbai: [72.8777, 19.076],
  Mundra: [69.7212, 22.8394],
  Kandla: [70.2208, 23.0333],
  "Nhava Sheva": [72.9425, 18.949],
};

const DESTINATIONS: Record<string, [number, number]> = {
  Rotterdam: [4.4777, 51.9244],
  Hamburg: [9.9937, 53.5511],
  "Jebel Ali": [55.0272, 25.0143],
  Singapore: [103.8198, 1.3521],
  "New York": [-74.006, 40.7128],
};

type ArcStatus = "in_transit" | "confirmed" | "delivered";

interface RouteDef {
  from: keyof typeof ORIGINS;
  to: keyof typeof DESTINATIONS;
  status: ArcStatus;
}

// Same 5 lane pairings as ARCS in GlobalPresenceTicker.tsx, tagged with a
// status drawn from the MANIFEST rows that reference each lane.
const ROUTES: RouteDef[] = [
  { from: "Mumbai", to: "Rotterdam", status: "in_transit" },
  { from: "Mundra", to: "Jebel Ali", status: "delivered" },
  { from: "Kandla", to: "Hamburg", status: "confirmed" },
  { from: "Nhava Sheva", to: "Singapore", status: "in_transit" },
  { from: "Mumbai", to: "New York", status: "delivered" },
];

// Midnight Navy palette (mirrors globals.css tokens): --route arc blue,
// --gold, --success, --text-2. No old ivory-era particle hues survive here.
const ROUTE = 0x8fb4e8; // --route: trade-route arc lines
const GOLD = 0xc9a24b; // --gold: origin port markers
const SILVER = 0x9facc4; // --text-2: destination port markers
const SUCCESS = 0x5fa97c; // --success: DELIVERED

const STATUS_COLOR: Record<ArcStatus, number> = {
  in_transit: ROUTE,
  confirmed: GOLD,
  delivered: SUCCESS,
};

const ARC_SEGMENTS = 64;
const PACKET_SPEED = 0.18; // loops per second along the arc

function lonLatOf(dict: Record<string, [number, number]>, name: string): [number, number] {
  const [lon, lat] = dict[name];
  return [lon, lat];
}

function buildArcCurve(radius: number, from: [number, number], to: [number, number]): THREE.QuadraticBezierCurve3 {
  const [lonA, latA] = from;
  const [lonB, latB] = to;
  const a = new THREE.Vector3(...latLonToVec3(latA, lonA, radius));
  const b = new THREE.Vector3(...latLonToVec3(latB, lonB, radius));
  const mid = a.clone().add(b).multiplyScalar(0.5);
  // Lift the control point above the chord along the shared midpoint normal
  // so the arc bulges outward off the sphere surface rather than cutting
  // through it.
  const lift = radius * (0.22 + a.distanceTo(b) / radius / 8);
  mid.normalize().multiplyScalar(radius + lift);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

/** Same lane, projected onto the flat equirectangular map — a shallow bow
 * rising off the plane toward the camera, like a flight-path map, instead of
 * the sphere version's outward bulge. */
function buildFlatArcCurve(
  flatWidth: number,
  flatHeight: number,
  from: [number, number],
  to: [number, number]
): THREE.QuadraticBezierCurve3 {
  const [lonA, latA] = from;
  const [lonB, latB] = to;
  const a = new THREE.Vector3(...latLonToFlatVec3(latA, lonA, flatWidth, flatHeight));
  const b = new THREE.Vector3(...latLonToFlatVec3(latB, lonB, flatWidth, flatHeight));
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.z += flatWidth * 0.06 + a.distanceTo(b) * 0.15;
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

interface PortMarker {
  group: THREE.Group;
  ring: THREE.Mesh;
  ringMaterial: THREE.MeshBasicMaterial;
  spherePos: THREE.Vector3;
  flatPos: THREE.Vector3;
}

interface Arc {
  curve: THREE.QuadraticBezierCurve3;
  flatCurve: THREE.QuadraticBezierCurve3;
  spherePoints: THREE.Vector3[];
  flatPoints: THREE.Vector3[];
  line: THREE.Line;
  lineMaterial: THREE.LineBasicMaterial;
  packet: THREE.Mesh;
  packetMaterial: THREE.MeshBasicMaterial;
  drawUniform: { value: number };
  phase: number;
}

export class TradeArcs {
  group: THREE.Group;
  private arcs: Arc[] = [];
  private ports: PortMarker[] = [];
  private clockStart = 0;
  private active = false;
  private tweens: gsap.core.Tween[] = [];
  private reducedMotion: boolean;
  /** 0 = sphere-mapped (default), 1 = fully flattened onto the trade map —
   * driven by setFlatBlend() as the particle globe unfurls. */
  private blend = 0;

  constructor(radius: number, reducedMotion = false, flatWidth = radius * 3.2, flatHeight = radius * 1.6) {
    this.reducedMotion = reducedMotion;
    this.group = new THREE.Group();
    this.group.visible = false;

    const portNames = new Set<string>();
    ROUTES.forEach((r) => {
      portNames.add(`o:${r.from}`);
      portNames.add(`d:${r.to}`);
    });

    portNames.forEach((key) => {
      const [kind, name] = key.split(":") as ["o" | "d", string];
      const [lon, lat] = kind === "o" ? lonLatOf(ORIGINS, name) : lonLatOf(DESTINATIONS, name);
      const spherePos = new THREE.Vector3(...latLonToVec3(lat, lon, radius * 1.002));
      const flatPos = new THREE.Vector3(...latLonToFlatVec3(lat, lon, flatWidth, flatHeight));
      this.ports.push(this.buildPortMarker(spherePos, flatPos, kind === "o" ? GOLD : SILVER));
    });

    ROUTES.forEach((route, i) => {
      const curve = buildArcCurve(radius, lonLatOf(ORIGINS, route.from), lonLatOf(DESTINATIONS, route.to));
      const flatCurve = buildFlatArcCurve(
        flatWidth,
        flatHeight,
        lonLatOf(ORIGINS, route.from),
        lonLatOf(DESTINATIONS, route.to)
      );
      this.arcs.push(this.buildArc(curve, flatCurve, STATUS_COLOR[route.status], i));
    });

    this.ports.forEach((p) => this.group.add(p.group));
    this.arcs.forEach((a) => this.group.add(a.line, a.packet));
  }

  private buildPortMarker(spherePos: THREE.Vector3, flatPos: THREE.Vector3, color: number): PortMarker {
    const group = new THREE.Group();
    group.position.copy(spherePos);
    // Face outward (away from the globe's center), matching setFlatBlend's
    // sphere-pose formula at blend=0 — lookAt(0,0,0) would orient the flat
    // dot's front face toward the center instead, making it invisible from
    // an external camera (MeshBasicMaterial defaults to FrontSide culling).
    group.lookAt(group.position.clone().add(spherePos.clone().normalize()));

    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.012, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.012, 0.015, 24), ringMaterial);

    group.add(dot, ring);
    return { group, ring, ringMaterial, spherePos, flatPos };
  }

  private buildArc(
    curve: THREE.QuadraticBezierCurve3,
    flatCurve: THREE.QuadraticBezierCurve3,
    color: number,
    index: number
  ): Arc {
    const spherePoints = curve.getPoints(ARC_SEGMENTS);
    const flatPoints = flatCurve.getPoints(ARC_SEGMENTS);
    const geometry = new THREE.BufferGeometry().setFromPoints(spherePoints);
    const drawUniform = { value: 0 };
    geometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.75,
    });
    const line = new THREE.Line(geometry, lineMaterial);
    (line as unknown as { userData: Record<string, unknown> }).userData = {
      drawUniform,
      totalPoints: spherePoints.length + 1,
    };

    const packetMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), packetMaterial);

    return {
      curve,
      flatCurve,
      spherePoints,
      flatPoints,
      line,
      lineMaterial,
      packet,
      packetMaterial,
      drawUniform,
      phase: index * 0.25,
    };
  }

  /** Current sphere<->flat blend (0..1) — read before starting a new blend
   * tween so it can interpolate from wherever the overlay currently sits,
   * rather than snapping if a prior transition was interrupted mid-flight. */
  getFlatBlend(): number {
    return this.blend;
  }

  /** Blend every arc/port between its sphere-mapped and flat-mapped position,
   * 0..1. Called on scroll as the particle globe unfurls into the flat map —
   * keeps the overlay visually attached to the point cloud it decorates. */
  setFlatBlend(blend: number): void {
    this.blend = Math.min(1, Math.max(0, blend));

    this.arcs.forEach((arc) => {
      const posAttr = arc.line.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i <= ARC_SEGMENTS; i++) {
        const s = arc.spherePoints[i];
        const f = arc.flatPoints[i];
        posAttr.setXYZ(
          i,
          s.x + (f.x - s.x) * this.blend,
          s.y + (f.y - s.y) * this.blend,
          s.z + (f.z - s.z) * this.blend
        );
      }
      posAttr.needsUpdate = true;
    });

    this.ports.forEach((port) => {
      port.group.position.lerpVectors(port.spherePos, port.flatPos, this.blend);
      // Sphere pose faces outward from the globe's center; flat pose faces
      // the camera along +z — blend the facing direction along with position.
      const sphereDir = port.spherePos.clone().normalize();
      const flatDir = new THREE.Vector3(0, 0, 1);
      const dir = sphereDir.lerp(flatDir, this.blend).normalize();
      port.group.lookAt(port.group.position.clone().add(dir));
    });
  }

  /** Reveal arcs/ports staggered, start the packet loop. Call on section enter. */
  playIn(): void {
    if (this.active) return;
    this.active = true;
    this.clockStart = performance.now();
    this.group.visible = true;
    this.tweens.forEach((t) => t.kill());
    this.tweens = [];

    if (this.reducedMotion) {
      // Jump-cut: land on the fully-revealed state instantly, no stagger and
      // no traveling packets — matches the morph engine's reduced-motion rule.
      this.arcs.forEach((arc) => {
        const total = (arc.line.geometry as THREE.BufferGeometry).getAttribute("position").count;
        arc.line.geometry.setDrawRange(0, total);
        arc.lineMaterial.opacity = 0.75;
        arc.packetMaterial.opacity = 0;
      });
      this.ports.forEach((port) => port.group.scale.setScalar(1));
      return;
    }

    this.arcs.forEach((arc, i) => {
      const total = (arc.line.geometry as THREE.BufferGeometry).getAttribute("position").count;
      const state = { n: 0 };
      const tween = gsap.to(state, {
        n: total,
        duration: 1.1,
        delay: i * 0.12,
        ease: "power2.out",
        onUpdate: () => arc.line.geometry.setDrawRange(0, Math.floor(state.n)),
      });
      this.tweens.push(tween);
      this.tweens.push(gsap.to(arc.lineMaterial, { opacity: 0.75, duration: 0.6, delay: i * 0.12 }));
      this.tweens.push(gsap.to(arc.packetMaterial, { opacity: 0.9, duration: 0.4, delay: i * 0.12 + 0.6 }));
    });

    this.ports.forEach((port, i) => {
      port.group.scale.setScalar(0.01);
      this.tweens.push(
        gsap.to(port.group.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.5,
          delay: i * 0.05,
          ease: "back.out(2)",
        })
      );
    });
  }

  /** Fade everything out. Call on section leave. */
  playOut(): void {
    if (!this.active) return;
    this.active = false;
    this.tweens.forEach((t) => t.kill());
    this.tweens = [];

    if (this.reducedMotion) {
      this.group.visible = false;
      return;
    }

    const group = this.group;
    const arcs = this.arcs;
    this.tweens.push(
      gsap.to(
        arcs.map((a) => a.lineMaterial),
        { opacity: 0, duration: 0.4, onComplete: () => (group.visible = false) }
      )
    );
    arcs.forEach((a) => this.tweens.push(gsap.to(a.packetMaterial, { opacity: 0, duration: 0.3 })));
    this.ports.forEach((p) =>
      this.tweens.push(gsap.to(p.ringMaterial, { opacity: 0, duration: 0.3 }))
    );
  }

  /** Advance packet travel + port pulse rings. Call once per rendered frame. */
  update(): void {
    if (!this.active || this.reducedMotion) return;
    const t = (performance.now() - this.clockStart) / 1000;

    this.arcs.forEach((arc) => {
      const u = ((t * PACKET_SPEED + arc.phase) % 1 + 1) % 1;
      if (this.blend === 0) {
        arc.packet.position.copy(arc.curve.getPointAt(u));
      } else {
        const sphereP = arc.curve.getPointAt(u);
        const flatP = arc.flatCurve.getPointAt(u);
        arc.packet.position.lerpVectors(sphereP, flatP, this.blend);
      }
    });

    this.ports.forEach((port, i) => {
      const cycle = (t * 0.5 + i * 0.3) % 1;
      const scale = 1 + cycle * 2.2;
      port.ring.scale.setScalar(scale);
      port.ringMaterial.opacity = this.active ? Math.max(0, 0.5 * (1 - cycle)) : port.ringMaterial.opacity;
    });
  }

  dispose(): void {
    this.tweens.forEach((t) => t.kill());
    this.arcs.forEach((a) => {
      a.line.geometry.dispose();
      a.lineMaterial.dispose();
      a.packet.geometry.dispose();
      a.packetMaterial.dispose();
    });
    this.ports.forEach((p) => {
      p.group.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
    });
  }
}
