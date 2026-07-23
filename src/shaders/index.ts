import { PRELUDE } from "./prelude";

// Each entry is a fragment-shader body (the `void main(){…}`), composed with the
// shared PRELUDE. Cheap by design (fbm<=4 octaves, no raymarch, constant loops).
// Midnight-Navy language: navy ground, restrained gold, pale-blue route lines.

const GLOBAL_PRESENCE = /* glsl */ `
float node(vec2 uv, vec2 p, float phase, float t) {
  float pulse = 0.5 + 0.5 * sin((t + phase) * 6.2831);
  float d = length(uv - p);
  return smoothstep(0.012, 0.0, d) + smoothstep(0.055, 0.0, d) * (0.12 + 0.18 * pulse);
}
float arc(vec2 uv, vec2 a, vec2 c, vec2 b, float t, out float goldDot) {
  float d = 1e3; vec2 prev = a;
  for (int i = 1; i <= 8; i++) {
    float k = float(i) / 8.0;
    vec2 pt = mix(mix(a, c, k), mix(c, b, k), k);
    d = min(d, sdSeg(uv, prev, pt)); prev = pt;
  }
  float k = fract(t);
  vec2 hp = mix(mix(a, c, k), mix(c, b, k), k);
  goldDot = smoothstep(0.018, 0.0, length(uv - hp));
  return smoothstep(0.006, 0.0, d);
}
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.12;
  vec3 col = ground(vUv, vec2(0.5, 0.42));
  vec2 g = vUv; g.y += 0.02 * sin(g.x * 6.2831 + t);
  vec2 grid = abs(fract(g * vec2(14.0, 8.0)) - 0.5);
  col += ROUTE * 0.028 * smoothstep(0.47, 0.5, max(grid.x, grid.y));
  float line = 0.0, dot = 0.0, gd;
  line += arc(uv, vec2(-0.42, 0.02), vec2(-0.18, -0.16), vec2(0.02, 0.06), t * 0.5, gd); dot += gd;
  line += arc(uv, vec2(0.02, 0.06), vec2(0.10, -0.14), vec2(0.16, -0.03), t * 0.7 + 0.3, gd); dot += gd;
  line += arc(uv, vec2(0.16, -0.03), vec2(0.24, 0.10), vec2(0.34, 0.05), t * 0.6 + 0.6, gd); dot += gd;
  line += arc(uv, vec2(-0.42, 0.02), vec2(-0.30, -0.18), vec2(-0.22, -0.16), t * 0.5 + 0.2, gd); dot += gd;
  col += ROUTE * line * 0.5 + GOLD_SOFT * dot * 0.9;
  float n = node(uv, vec2(-0.42, 0.02), 0.0, t) + node(uv, vec2(-0.22, -0.16), 0.4, t)
          + node(uv, vec2(0.02, 0.06), 0.8, t) + node(uv, vec2(0.16, -0.03), 0.2, t)
          + node(uv, vec2(0.34, 0.05), 0.6, t);
  col += GOLD * n;
  gl_FragColor = vec4(col, 1.0);
}
`;

const PRODUCT_EXPORTS = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.06;
  vec3 col = ground(vUv, vec2(0.5, 0.5));
  float y = vUv.y * 7.0 + fbm(uv * 3.0 + t) * 0.7;
  float band = smoothstep(0.42, 0.5, abs(fract(y) - 0.5));
  col += mix(GOLD, ROUTE, step(0.5, fract(vUv.y * 3.5))) * (1.0 - band) * 0.05;
  col += ROUTE * smoothstep(0.62, 0.78, fbm(uv * vec2(9.0, 3.0) + vec2(t, 0.0))) * 0.06;
  col += GOLD * smoothstep(0.8, 0.96, fbm(uv * 5.0 - t)) * 0.05;
  gl_FragColor = vec4(col, 1.0);
}
`;

const GROUP = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.1;
  vec3 col = ground(vUv, vec2(0.5, 0.5));
  float warp = sin(uv.x * 42.0 + sin(uv.y * 8.0 + t) * 2.0);
  float weft = sin(uv.y * 42.0 + sin(uv.x * 8.0 - t) * 2.0);
  col += GOLD * (smoothstep(0.75, 1.0, warp) + smoothstep(0.75, 1.0, weft)) * 0.035;
  float pulse = 0.5 + 0.5 * sin(t * 2.0);
  col += ROUTE * smoothstep(0.05, 0.0, length(uv - vec2(0.12, 0.05))) * (0.15 + 0.2 * pulse);
  col += GOLD_SOFT * smoothstep(0.04, 0.0, length(uv - vec2(-0.2, -0.08))) * (0.2 + 0.2 * (1.0 - pulse));
  gl_FragColor = vec4(col, 1.0);
}
`;

const SERVICE_DIGITAL = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.18;
  vec3 col = ground(vUv, vec2(0.5, 0.45));
  vec2 gp = fract(vUv * vec2(32.0, 18.0)) - 0.5;
  col += ROUTE * 0.06 * smoothstep(0.14, 0.0, length(gp));
  // travelling data pulses along a few horizontal lanes
  for (int i = 0; i < 5; i++) {
    float ly = 0.2 + float(i) * 0.14;
    float onLine = smoothstep(0.008, 0.0, abs(vUv.y - ly));
    float head = fract(vUv.x - t - float(i) * 0.19);
    col += GOLD_SOFT * onLine * smoothstep(0.03, 0.0, head) * 0.9;
    col += ROUTE * onLine * 0.05;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

const CONTACT = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.2;
  vec3 col = ground(vUv, vec2(0.5, 0.48));
  float r = length(uv);
  col += GOLD * 0.04 * smoothstep(0.5, 0.46, abs(fract(r * 8.0 - t) - 0.5));
  col += ROUTE * smoothstep(0.015, 0.0, abs(r - fract(t) * 0.6)) * 0.22;
  float ang = atan(uv.y, uv.x);
  col += GOLD_SOFT * smoothstep(0.08, 0.0, abs(sin(ang - t * 2.0))) * smoothstep(0.3, 0.0, r) * 0.3;
  gl_FragColor = vec4(col, 1.0);
}
`;

const INSIGHTS = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.05;
  vec3 col = ground(vUv, vec2(0.4, 0.4));
  col += ROUTE * 0.03 * (1.0 - smoothstep(0.47, 0.5, abs(fract(vUv.y * 22.0 - t * 2.0) - 0.5)));
  col += vec3(0.9, 0.93, 0.97) * smoothstep(0.82, 0.96, fbm(uv * vec2(4.0, 11.0) + vec2(0.0, t))) * 0.04;
  col += GOLD * 0.07 * smoothstep(0.008, 0.0, abs(vUv.y - 0.16));
  col += GOLD * 0.07 * smoothstep(0.008, 0.0, abs(vUv.y - 0.84));
  gl_FragColor = vec4(col, 1.0);
}
`;

const CAREERS = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.15;
  vec3 col = ground(vUv, vec2(0.7, 0.5));
  vec2 target = vec2(0.35, 0.0);
  float streams = 0.0;
  for (int i = 0; i < 10; i++) {
    float f = float(i) / 9.0;
    vec2 a = vec2(-0.6, (f - 0.5) * 0.9);
    streams += smoothstep(0.006, 0.0, sdSeg(uv, a, target));
    vec2 sp = mix(a, target, fract(t + f));
    col += GOLD_SOFT * smoothstep(0.012, 0.0, length(uv - sp)) * 0.5;
  }
  col += GOLD * streams * 0.07;
  col += GOLD * smoothstep(0.03, 0.0, length(uv - target));
  gl_FragColor = vec4(col, 1.0);
}
`;

const ABOUT = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.05;
  vec3 col = ground(vUv, vec2(0.5, 0.35));
  col += GOLD * 0.08 * smoothstep(0.006, 0.0, abs(vUv.y - 0.62));
  float below = step(0.62, vUv.y);
  col += GOLD * below * smoothstep(0.65, 1.0, sin(uv.x * 32.0 + sin(uv.y * 10.0 + t) * 1.5)) * 0.04;
  col += GOLD_SOFT * (1.0 - below) * smoothstep(0.82, 0.97, fbm(uv * 7.0 + vec2(t, -t))) * 0.1;
  gl_FragColor = vec4(col, 1.0);
}
`;

const DEFAULT_BG = /* glsl */ `
void main() {
  vec2 uv = aspectUv();
  float t = uTime * 0.05;
  vec3 col = ground(vUv, vec2(0.5, 0.45));
  col += GOLD_SOFT * smoothstep(0.72, 0.96, fbm(uv * 6.5 + vec2(t, -t * 0.7))) * 0.12;
  col += GOLD * 0.02 * fbm(uv * 2.0 + t * 0.3);
  gl_FragColor = vec4(col, 1.0);
}
`;

const BODIES: Record<string, string> = {
  "global-presence": GLOBAL_PRESENCE,
  "product-exports": PRODUCT_EXPORTS,
  group: GROUP,
  "service-digital": SERVICE_DIGITAL,
  contact: CONTACT,
  insights: INSIGHTS,
  careers: CAREERS,
  about: ABOUT,
  "footer-drift": DEFAULT_BG,
  default: DEFAULT_BG,
};

/** Full fragment shader for a variant (falls back to the default drift). */
export function getFragment(variant: string): string {
  return PRELUDE + (BODIES[variant] ?? BODIES.default);
}
