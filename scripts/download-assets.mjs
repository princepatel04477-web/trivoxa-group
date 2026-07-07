// Downloads all advida.com assets needed for the clone into public/ and src/fonts.
// Usage: node scripts/download-assets.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const THEME = "https://advida.com/wp-content/themes/Advida/app";
const UPLOADS = "https://advida.com/wp-content/uploads";

const LUFGA_WEIGHTS = [
  "Thin", "Thin-Italic", "ExtraLight", "ExtraLight-Italic", "Light", "Light-Italic",
  "Regular", "Medium", "Medium-Italic", "SemiBold", "SemiBold-Italic",
  "Bold", "Bold-Italic", "ExtraBold", "ExtraBold-Italic", "Black", "Black-Italic",
];

const assets = [
  // fonts (next/font/local expects them under src/)
  ...LUFGA_WEIGHTS.map((w) => [`${THEME}/fonts/lufga/Lufga-${w}.woff`, `src/fonts/lufga/Lufga-${w}.woff`]),
  [`${THEME}/fonts/calisto/Calisto-MT-Italic.woff`, "src/fonts/calisto/Calisto-MT-Italic.woff"],
  // icons
  ...["arrow-right", "book-call", "chevron-down", "chevron-down-lg", "close", "envelope-send",
      "facebook", "linkedin", "tick-circle", "twitter", "check"].map(
    (n) => [`${THEME}/images/icons/${n}.svg`, `public/images/icons/${n}.svg`]),
  [`${THEME}/images/logo.svg`, "public/images/logo.svg"],
  [`${THEME}/images/favicon.ico`, "public/seo/favicon.ico"],
  // 3D objects
  ...["globe2", "Astronaut", "CartoonRocket", "bar-graph-001", "movie", "phone"].map(
    (n) => [`${THEME}/images/objects/${n}.obj`, `public/objects/${n}.obj`]),
  // particle sprite
  ["https://s3-us-west-2.amazonaws.com/s.cdpn.io/605067/particle-tiny.png", "public/images/particle-tiny.png"],
  // case study images
  [`${UPLOADS}/2024/01/microsoft.jpg`, "public/images/case-studies/microsoft.jpg"],
  [`${UPLOADS}/2024/03/smartasset.jpg`, "public/images/case-studies/smartasset.jpg"],
  [`${UPLOADS}/2024/03/Loop-Media-Inc.-Announces-Partnership-With-TiVo-to-Add-18-New-Music-Video-Channels-to-the-TiVo-Content-Network.jpg`, "public/images/case-studies/loop.jpg"],
  [`${UPLOADS}/2024/03/young-woman-doing-sport-exercises-sunrise-beach-morning.jpg`, "public/images/case-studies/vici-wellness.jpg"],
  // brand logos
  [`${UPLOADS}/2024/01/vivint.png`, "public/images/brands/vivint.png"],
  [`${UPLOADS}/2024/01/loop-lg.png`, "public/images/brands/loop-lg.png"],
  [`${UPLOADS}/2024/01/masterwork.png`, "public/images/brands/masterwork.png"],
  [`${UPLOADS}/2024/01/microsoft-lg.png`, "public/images/brands/microsoft-lg.png"],
  [`${UPLOADS}/2024/01/smartasset-lg.png`, "public/images/brands/smartasset-lg.png"],
  [`${UPLOADS}/2024/01/vici-lg.png`, "public/images/brands/vici-lg.png"],
];

const root = new URL("..", import.meta.url).pathname;
let ok = 0, fail = [];

async function grab([url, dest]) {
  const path = join(root, dest);
  await mkdir(dirname(path), { recursive: true });
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
    ok++;
  } catch (e) {
    fail.push(`${url} -> ${e.message}`);
  }
}

for (let i = 0; i < assets.length; i += 4) {
  await Promise.all(assets.slice(i, i + 4).map(grab));
}
console.log(`downloaded ${ok}/${assets.length}`);
if (fail.length) { console.log("FAILED:"); fail.forEach((f) => console.log("  " + f)); }
