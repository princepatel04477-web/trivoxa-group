// Renders every registered film to ../public/videos as:
//   bg-<id>.webm  (VP9, small)   bg-<id>.mp4 (H.264 fallback)   bg-<id>.jpg (poster)
// Usage: node render-all.mjs [id ...]   (no args = all)
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill, ensureBrowser } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/videos");
fs.mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
const ALL = [
  "global-presence",
  "product-exports",
  "group",
  "service-digital",
  "contact",
  "insights",
  "careers",
  "about",
  "footer-drift",
];
const ids = only.length ? ALL.filter((i) => only.includes(i)) : ALL;

console.log("Ensuring browser…");
await ensureBrowser();
console.log("Bundling…");
const serveUrl = await bundle({ entryPoint: path.resolve(__dirname, "src/index.ts") });

for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id });
  console.log(`\n▶ ${id} (${composition.durationInFrames} frames)`);

  await renderMedia({
    serveUrl,
    composition,
    codec: "vp9",
    crf: 40,
    outputLocation: path.join(OUT, `bg-${id}.webm`),
  });
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 30,
    outputLocation: path.join(OUT, `bg-${id}.mp4`),
  });
  await renderStill({
    serveUrl,
    composition,
    frame: Math.floor(composition.durationInFrames / 2),
    imageFormat: "jpeg",
    jpegQuality: 82,
    output: path.join(OUT, `bg-${id}.jpg`),
  });

  const kb = (f) => Math.round(fs.statSync(path.join(OUT, f)).size / 1024);
  console.log(`✓ ${id}  webm ${kb(`bg-${id}.webm`)}kB · mp4 ${kb(`bg-${id}.mp4`)}kB`);
}
console.log("\nAll done.");
