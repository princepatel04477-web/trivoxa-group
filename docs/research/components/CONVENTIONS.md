# Builder Conventions — advida.com clone

Every builder follows these rules. Deviations break the merge.

## Source artifacts (authoritative, in your worktree)

- `docs/research/advida.com/sections/<name>.html` — verbatim DOM fragment from the live site. Reproduce structure, class names, and text EXACTLY (fix only HTML→JSX syntax: class→className, self-closing tags, `&amp;`…).
- `docs/research/advida.com/sections/<name>.css` — verbatim CSS for the fragment (includes @media blocks).
- `docs/research/advida.com/sections/shared.css` — `.left-text-wrapper` / `.scroll-to` / `.arrow-btn` shared rules (already ported globally — do NOT re-port; just use the class names).
- `docs/research/advida.com/BEHAVIORS.md` — exact animation/behavior spec extracted from the site's JS.
- `docs/research/advida.com/theme-src/` — full original main.css / index.html / inline JS if you need context.

## CSS porting rules

1. Create `src/app/styles/<section>.css` containing your section's CSS chunk, cleaned:
   - Drop vendor prefixes (-webkit-, -moz-, -ms-, -o-) when a standard property exists on the same rule.
   - Font families: `"Lufga-Thin"`→`font-family: var(--font-lufga); font-weight: 100`, ExtraLight→200, Light→300, Regular→400, Medium→500, SemiBold→600, Bold→700, ExtraBold→800, Black→900; `-Italic` variants add `font-style: italic`. `'Work Sans'`→`var(--font-work-sans)`. `Calisto-MT-Italic`→`var(--font-calisto); font-style: italic`.
   - Keep every selector, value, and @media query otherwise byte-faithful. Do NOT re-express in Tailwind. Do NOT "improve" values.
   - Asset URLs: `../images/icons/X.svg` → `/images/icons/X.svg`.
2. Do NOT edit `src/app/globals.css`, `src/app/layout.tsx`, or `src/app/page.tsx` — the orchestrator wires imports at merge.
3. Keep original class names on JSX elements — GSAP targets them.

## Asset URL map (already downloaded)

| Original | Local |
|---|---|
| `.../app/images/icons/<n>.svg` | `/images/icons/<n>.svg` |
| `.../app/images/logo.svg` | `/images/logo.svg` |
| `.../uploads/2024/01/microsoft.jpg` | `/images/case-studies/microsoft.jpg` |
| `.../uploads/2024/03/smartasset.jpg` | `/images/case-studies/smartasset.jpg` |
| `.../uploads/2024/03/Loop-Media-Inc...jpg` | `/images/case-studies/loop.jpg` |
| `.../uploads/2024/03/young-woman-doing-sport...jpg` | `/images/case-studies/vici-wellness.jpg` |
| `.../uploads/2024/01/{vivint,loop-lg,masterwork,microsoft-lg,smartasset-lg,vici-lg}.png` | `/images/brands/<same>.png` |
| `.../app/images/objects/<n>.obj` | `/objects/<n>.obj` |
| CodePen particle sprite | `/images/particle-tiny.png` |

## Shared code (already in repo — import, don't duplicate)

- `@/lib/gsap` → `{ gsap, ScrollTrigger, BP }` (plugin pre-registered; BP = {desktop:991, tablet:767, mobile:575})
- `@/lib/split-text` → `<TitleChars text="..."/>` (`span.word_inner` per char), `<PChars .../>` (`span.p_inner`)
- `@/lib/site-events` → `onPreloaderDone(fn)`, `markPreloaderDone()`, `on/emit` for `modal:open`/`modal:close`
- `@/lib/utils` → `cn()`
- `@/components/icons` → `CircleProgressIcon`, `iconPaths`
- Types in `@/types/advida`

## Component rules

- Components with animations are client components (`"use client"`); run GSAP inside `useGSAP`-style `useEffect` with `gsap.context(...)` scoped to a root ref, and kill ScrollTriggers on cleanup.
- **ScrollTrigger scroller:** the page uses smooth-scrollbar on `.surrounding` (desktop). `ScrollTrigger.defaults({ scroller: ... })` is set globally by `SmoothScrollProvider` BEFORE sections mount. Your section code just creates ScrollTriggers normally (no scroller option).
- Mount-order dependence: create ScrollTriggers inside `requestAnimationFrame`/`useEffect` after DOM paint.
- Use plain `<img>` for images (matches original DOM; no next/image layout surprises).
- Named exports, PascalCase files, TypeScript strict (no `any`).
- Finish only when `npx tsc --noEmit` passes.

## Verification

Run `npx tsc --noEmit` (and `npm run lint` if time permits). Do not run `npm run build` in worktrees (port/collision safe but slow); orchestrator builds after merge.
