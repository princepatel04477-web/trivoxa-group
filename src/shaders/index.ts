import { PRELUDE } from "./prelude";

// Fragment-shader bodies (`void main(){…}`), composed with the shared PRELUDE.
// Cheap by design (fbm<=4 octaves, no raymarch, constant-bound loops). Midnight-
// Navy language: navy ground, restrained gold, pale-blue route lines. Each
// business category gets a distinct motif.

const GLOBAL_PRESENCE = /* glsl */ `
float node(vec2 uv, vec2 p, float phase, float t){ float pl=0.5+0.5*sin((t+phase)*6.2831); float d=length(uv-p); return smoothstep(0.012,0.0,d)+smoothstep(0.055,0.0,d)*(0.12+0.18*pl); }
float arc(vec2 uv, vec2 a, vec2 c, vec2 b, float t, out float gdot){ float d=1e3; vec2 pr=a; for(int i=1;i<=8;i++){ float k=float(i)/8.0; vec2 pt=mix(mix(a,c,k),mix(c,b,k),k); d=min(d,sdSeg(uv,pr,pt)); pr=pt; } float k=fract(t); vec2 hp=mix(mix(a,c,k),mix(c,b,k),k); gdot=smoothstep(0.018,0.0,length(uv-hp)); return smoothstep(0.006,0.0,d); }
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.12;
  vec3 col=ground(vUv,vec2(0.5,0.42));
  vec2 g=vUv; g.y+=0.02*sin(g.x*6.2831+t); vec2 gr=abs(fract(g*vec2(14.0,8.0))-0.5);
  col+=ROUTE*0.028*smoothstep(0.47,0.5,max(gr.x,gr.y));
  float line=0.0,dot=0.0,gd;
  line+=arc(uv,vec2(-0.42,0.02),vec2(-0.18,-0.16),vec2(0.02,0.06),t*0.5,gd);dot+=gd;
  line+=arc(uv,vec2(0.02,0.06),vec2(0.10,-0.14),vec2(0.16,-0.03),t*0.7+0.3,gd);dot+=gd;
  line+=arc(uv,vec2(0.16,-0.03),vec2(0.24,0.10),vec2(0.34,0.05),t*0.6+0.6,gd);dot+=gd;
  col+=ROUTE*line*0.5+GOLD_SOFT*dot*0.9;
  col+=GOLD*(node(uv,vec2(-0.42,0.02),0.0,t)+node(uv,vec2(0.02,0.06),0.8,t)+node(uv,vec2(0.16,-0.03),0.2,t)+node(uv,vec2(0.34,0.05),0.6,t));
  gl_FragColor=vec4(col,1.0);
}`;

// Group — flowing aurora ribbons rising (replaces the old constellation look).
const GROUP = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.08;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  for(int i=0;i<4;i++){
    float fi=float(i);
    float yy=(fi-1.5)*0.16 + fbm(vec2(uv.x*1.6+fi*3.0, t+fi))*0.14;
    float band=smoothstep(0.05,0.0,abs(uv.y-yy));
    col+=mix(GOLD,ROUTE,0.5+0.5*sin(t+fi))*band*0.06;
  }
  col+=GOLD_SOFT*smoothstep(0.88,0.98,fbm(uv*7.0+t))*0.05;
  gl_FragColor=vec4(col,1.0);
}`;

// Textile family — interlacing woven threads.
const WEAVE = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.08;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  float warp=sin(uv.x*70.0+sin(uv.y*6.0+t)*2.0);
  float weft=sin(uv.y*70.0+sin(uv.x*6.0-t)*2.0);
  float over=smoothstep(0.55,1.0,warp)*step(fract(uv.y*35.0),0.5);
  float under=smoothstep(0.55,1.0,weft)*step(0.5,fract(uv.x*35.0));
  col+=GOLD*(over+under)*0.05;
  col+=ROUTE*smoothstep(0.85,1.0,warp*weft)*0.03;
  gl_FragColor=vec4(col,1.0);
}`;

// Healthcare & pharmaceuticals — travelling ECG pulse + molecular lattice.
const HEALTH = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  float sp=fract(t*0.16)*1.8-0.9;
  float dx=uv.x-sp;
  float wave=sin(uv.x*3.0)*0.015 + exp(-dx*dx*300.0)*0.11*sin(dx*70.0);
  col+=ROUTE*smoothstep(0.012,0.0,abs(uv.y-wave))*0.7;
  vec2 hp=uv*6.5; hp.x+=mod(floor(hp.y),2.0)*0.5; vec2 hf=fract(hp)-0.5;
  col+=GOLD_SOFT*smoothstep(0.13,0.0,length(hf))*(0.35+0.3*sin(t+hp.x+hp.y))*0.06;
  gl_FragColor=vec4(col,1.0);
}`;

// Building materials — marble veining + horizontal stone courses.
const STONE = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.04;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  float v=fbm(uv*4.0+fbm(uv*2.0+t)*1.5);
  col+=ROUTE*(1.0-smoothstep(0.44,0.5,abs(v-0.5)))*0.05;
  col+=GOLD*smoothstep(0.02,0.0,abs(fract(vUv.y*10.0)-0.5)-0.46)*0.03;
  gl_FragColor=vec4(col,1.0);
}`;

// Agriculture & food — flowing grain field swaying in wind.
const FIELD = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.1;
  vec3 col=ground(vUv,vec2(0.5,0.6));
  float flow=fbm(uv*vec2(3.0,9.0)+vec2(sin(t)*0.3,t*0.5));
  col+=GOLD*smoothstep(0.55,0.82,flow)*0.08;
  col+=GOLD_SOFT*smoothstep(0.85,0.97,fbm(uv*11.0-t))*0.06;
  gl_FragColor=vec4(col,1.0);
}`;

// Engineering & industrial — blueprint grid + rotating gear rings.
const ENGINEERING = /* glsl */ `
float gear(vec2 uv, vec2 c, float r, float t){
  vec2 d=uv-c; float ang=atan(d.y,d.x); float ring=smoothstep(0.008,0.0,abs(length(d)-r));
  float teeth=smoothstep(0.008,0.0,abs(length(d)-(r+0.015*step(0.5,fract(ang/6.2831*14.0+t)))));
  return ring*0.6+teeth*0.6;
}
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.1;
  vec3 col=ground(vUv,vec2(0.55,0.5));
  vec2 g=abs(fract(vUv*22.0)-0.5);
  col+=ROUTE*0.02*smoothstep(0.47,0.5,max(g.x,g.y));
  col+=GOLD*gear(uv,vec2(0.18,0.05),0.11,t)*0.5;
  col+=GOLD*gear(uv,vec2(-0.05,-0.08),0.07,-t*1.6)*0.5;
  gl_FragColor=vec4(col,1.0);
}`;

// Furniture & interiors — receding perspective floor grid + warm glow.
const INTERIOR = /* glsl */ `
void main(){
  vec2 uv=vUv; float t=uTime*0.05;
  vec3 col=ground(uv,vec2(0.5,0.42));
  float hz=0.55;
  if(uv.y>hz){
    float depth=(uv.y-hz)/(1.0-hz);
    float persp=(uv.x-0.5)/max(0.06,depth);
    float vlines=smoothstep(0.04,0.0,abs(fract(persp*5.0)-0.5)-0.46);
    float hlines=smoothstep(0.03,0.0,abs(fract(1.0/max(0.06,depth)*0.4-t)-0.5)-0.46);
    col+=GOLD*(vlines+hlines)*0.04;
  }
  col+=GOLD*0.06*smoothstep(0.006,0.0,abs(uv.y-hz));
  gl_FragColor=vec4(col,1.0);
}`;

// Jewellery & precious — faceted caustics + sparkles.
const JEWEL = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.2;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  float f=fbm(uv*8.0+t*0.5);
  col+=GOLD*smoothstep(0.4,0.5,abs(fract(f*6.0)-0.5))*0.05;
  float s=hash21(floor(uv*34.0));
  col+=vec3(1.0,0.95,0.8)*step(0.975,fract(s+t*0.5))*0.5;
  gl_FragColor=vec4(col,1.0);
}`;

// Technology — data network of nodes + travelling packets.
const TECH = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.15;
  vec3 col=ground(vUv,vec2(0.5,0.45));
  vec2 n0=vec2(-0.3,0.05),n1=vec2(-0.05,-0.1),n2=vec2(0.15,0.08),n3=vec2(0.35,-0.05);
  float net=smoothstep(0.004,0.0,sdSeg(uv,n0,n1))+smoothstep(0.004,0.0,sdSeg(uv,n1,n2))+smoothstep(0.004,0.0,sdSeg(uv,n2,n3))+smoothstep(0.004,0.0,sdSeg(uv,n1,n3));
  col+=ROUTE*net*0.4;
  col+=GOLD_SOFT*(smoothstep(0.012,0.0,length(uv-mix(n0,n1,fract(t))))+smoothstep(0.012,0.0,length(uv-mix(n2,n3,fract(t+0.5)))))*0.8;
  col+=GOLD*(smoothstep(0.018,0.0,length(uv-n0))+smoothstep(0.018,0.0,length(uv-n1))+smoothstep(0.018,0.0,length(uv-n2))+smoothstep(0.018,0.0,length(uv-n3)));
  gl_FragColor=vec4(col,1.0);
}`;

// AI — layered neurons pulsing with signal.
const AI_BG = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.2;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  float acc=0.0,links=0.0;
  for(int L=0;L<3;L++){
    float lx=(-0.25)+float(L)*0.25;
    for(int k=0;k<3;k++){
      float ky=(float(k)-1.0)*0.16;
      float pulse=0.5+0.5*sin(t*2.0+lx*4.0+ky*6.0);
      acc+=smoothstep(0.02,0.0,length(uv-vec2(lx,ky)))*(0.5+0.5*pulse);
      if(L<2){ float ny=(float(k)-1.0)*0.16; links+=smoothstep(0.003,0.0,sdSeg(uv,vec2(lx,ky),vec2(lx+0.25,ny))); }
    }
  }
  col+=ROUTE*links*0.15+GOLD*acc*0.5;
  gl_FragColor=vec4(col,1.0);
}`;

// Software — abstract flowing code columns (no readable text).
const SOFTWARE = /* glsl */ `
void main(){
  vec2 uv=vUv; float t=uTime;
  vec3 col=ground(uv,vec2(0.5,0.45));
  float ci=floor(uv.x*44.0);
  float speed=0.3+hash21(vec2(ci,1.0))*0.7;
  float yy=uv.y+t*speed*0.25+hash21(vec2(ci,2.0));
  float glyph=step(0.5,fract(yy*28.0))*hash21(floor(vec2(uv.x*44.0,yy*28.0)));
  float head=fract(yy);
  col+=ROUTE*glyph*(1.0-smoothstep(0.0,0.6,head))*0.5;
  gl_FragColor=vec4(col,1.0);
}`;

// Design — sweeping colour-field ribbons.
const DESIGN = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.1;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  for(int i=0;i<3;i++){
    float fi=float(i);
    float r=uv.y-(sin(uv.x*(1.6+fi)+t+fi)*0.12+(fi-1.0)*0.14);
    col+=mix(GOLD,ROUTE,0.5+0.5*sin(t+fi*2.0))*smoothstep(0.04,0.0,abs(r))*0.14;
  }
  gl_FragColor=vec4(col,1.0);
}`;

// Marketing — radiating broadcast waves.
const MARKETING = /* glsl */ `
void main(){
  vec2 uv=aspectUv(); float t=uTime*0.3;
  vec3 col=ground(vUv,vec2(0.5,0.5));
  vec2 src=vec2(-0.3,0.0); float r=length(uv-src);
  col+=GOLD*smoothstep(0.02,0.0,abs(fract(r*4.0-t)-0.5)-0.46)*(1.0-smoothstep(0.0,0.8,r))*0.4;
  col+=GOLD*smoothstep(0.02,0.0,length(uv-src));
  gl_FragColor=vec4(col,1.0);
}`;

// Business support — steady interlocking grid with a slow sweep.
const SUPPORT = /* glsl */ `
void main(){
  vec2 uv=vUv; float t=uTime*0.1;
  vec3 col=ground(uv,vec2(0.5,0.5));
  vec2 g=abs(fract(uv*16.0)-0.5); float grid=smoothstep(0.46,0.5,max(g.x,g.y));
  col+=ROUTE*0.03*grid;
  col+=GOLD*grid*smoothstep(0.1,0.0,abs(fract(uv.x-t)-0.5)-0.4)*0.12;
  gl_FragColor=vec4(col,1.0);
}`;

const CONTACT = /* glsl */ `
void main(){ vec2 uv=aspectUv(); float t=uTime*0.2; vec3 col=ground(vUv,vec2(0.5,0.48)); float r=length(uv);
  col+=GOLD*0.04*smoothstep(0.5,0.46,abs(fract(r*8.0-t)-0.5));
  col+=ROUTE*smoothstep(0.015,0.0,abs(r-fract(t)*0.6))*0.22;
  float ang=atan(uv.y,uv.x); col+=GOLD_SOFT*smoothstep(0.08,0.0,abs(sin(ang-t*2.0)))*smoothstep(0.3,0.0,r)*0.3;
  gl_FragColor=vec4(col,1.0);
}`;

const INSIGHTS = /* glsl */ `
void main(){ vec2 uv=aspectUv(); float t=uTime*0.05; vec3 col=ground(vUv,vec2(0.4,0.4));
  col+=ROUTE*0.03*(1.0-smoothstep(0.47,0.5,abs(fract(vUv.y*22.0-t*2.0)-0.5)));
  col+=vec3(0.9,0.93,0.97)*smoothstep(0.82,0.96,fbm(uv*vec2(4.0,11.0)+vec2(0.0,t)))*0.04;
  col+=GOLD*0.07*smoothstep(0.008,0.0,abs(vUv.y-0.16))+GOLD*0.07*smoothstep(0.008,0.0,abs(vUv.y-0.84));
  gl_FragColor=vec4(col,1.0);
}`;

const CAREERS = /* glsl */ `
void main(){ vec2 uv=aspectUv(); float t=uTime*0.15; vec3 col=ground(vUv,vec2(0.7,0.5)); vec2 target=vec2(0.35,0.0); float streams=0.0;
  for(int i=0;i<10;i++){ float f=float(i)/9.0; vec2 a=vec2(-0.6,(f-0.5)*0.9); streams+=smoothstep(0.006,0.0,sdSeg(uv,a,target)); vec2 sp=mix(a,target,fract(t+f)); col+=GOLD_SOFT*smoothstep(0.012,0.0,length(uv-sp))*0.5; }
  col+=GOLD*streams*0.07+GOLD*smoothstep(0.03,0.0,length(uv-target));
  gl_FragColor=vec4(col,1.0);
}`;

const ABOUT = /* glsl */ `
void main(){ vec2 uv=aspectUv(); float t=uTime*0.05; vec3 col=ground(vUv,vec2(0.5,0.35));
  col+=GOLD*0.08*smoothstep(0.006,0.0,abs(vUv.y-0.62));
  float below=step(0.62,vUv.y);
  col+=GOLD*below*smoothstep(0.65,1.0,sin(uv.x*32.0+sin(uv.y*10.0+t)*1.5))*0.04;
  col+=GOLD_SOFT*(1.0-below)*smoothstep(0.82,0.97,fbm(uv*7.0+vec2(t,-t)))*0.1;
  gl_FragColor=vec4(col,1.0);
}`;

const DEFAULT_BG = /* glsl */ `
void main(){ vec2 uv=aspectUv(); float t=uTime*0.05; vec3 col=ground(vUv,vec2(0.5,0.45));
  col+=GOLD_SOFT*smoothstep(0.72,0.96,fbm(uv*6.5+vec2(t,-t*0.7)))*0.12;
  col+=GOLD*0.02*fbm(uv*2.0+t*0.3);
  gl_FragColor=vec4(col,1.0);
}`;

const BODIES: Record<string, string> = {
  "global-presence": GLOBAL_PRESENCE,
  group: GROUP,
  "product-exports": DEFAULT_BG,
  "service-digital": TECH,
  contact: CONTACT,
  insights: INSIGHTS,
  careers: CAREERS,
  about: ABOUT,
  "footer-drift": DEFAULT_BG,
  // Product categories
  "textile-apparel": WEAVE,
  fabrics: WEAVE,
  "home-textiles": WEAVE,
  accessories: WEAVE,
  "healthcare-pharmaceuticals": HEALTH,
  "building-materials": STONE,
  "agriculture-food": FIELD,
  "engineering-industrial": ENGINEERING,
  "furniture-interiors": INTERIOR,
  "jewellery-precious-products": JEWEL,
  // Service categories
  technology: TECH,
  ai: AI_BG,
  software: SOFTWARE,
  design: DESIGN,
  marketing: MARKETING,
  "business-support": SUPPORT,
  default: DEFAULT_BG,
};

/** Full fragment shader for a variant (falls back to the default drift). */
export function getFragment(variant: string): string {
  return PRELUDE + (BODIES[variant] ?? BODIES.default);
}
