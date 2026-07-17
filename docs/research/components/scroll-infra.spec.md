# ScrollInfra Specification (SmoothScrollProvider, Preloader, ScrollTopWidget)

## Overview
- **Target files:**
  - `src/components/providers/SmoothScroll.tsx` — client provider wrapping page content
  - `src/components/Preloader.tsx` — full-screen loading cover
  - `src/components/ScrollTopWidget.tsx` — fixed bottom-left scroll-to-top widget
  - `src/app/styles/scroll-infra.css` — ported CSS (preloader + scroll-widget chunks)
- **Interaction model:** scroll-driven infrastructure
- **Source artifacts:** `docs/research/advida.com/sections/{preloader,scroll-widget}.html`, `{preloader,scroll-widget}.css`; behaviors: `docs/research/advida.com/BEHAVIORS.md` §"Global scroll model", §"Scroll-to-top widget", §"Preloader"

## SmoothScrollProvider
DOM contract (must match — GSAP + CSS depend on it):
```html
<div class="surrounding">          <!-- height:100vh; overflow:hidden (in globals) -->
  <div class="scroll-content">{children}</div>
</div>
```
- Desktop only (`window.innerWidth > 991` at mount):
  ```js
  import Scrollbar from 'smooth-scrollbar';
  // custom plugin: class ModalPlugin extends ScrollbarPlugin
  //   static pluginName = 'modal'; static defaultOptions = { open: false };
  //   transformDelta(delta) { return this.options.open ? { x: 0, y: 0 } : delta; }
  Scrollbar.use(ModalPlugin);
  const bar = Scrollbar.init(surroundingEl, { damping: 0.05, delegateTo: document, alwaysShowTracks: true, plugins: { modal: { open: false } } });
  ScrollTrigger.scrollerProxy(surroundingEl, {
    scrollTop(value) { if (arguments.length) bar.scrollTop = value!; return bar.scrollTop; },
  });
  bar.addListener(ScrollTrigger.update);
  ScrollTrigger.defaults({ scroller: surroundingEl });
  ```
- Listen to site-events `modal:open`/`modal:close` → set `bar.options.plugins.modal.open` (freezes wheel).
- ≤991px: no Scrollbar; native scroll; ScrollTrigger defaults untouched.
- Expose the Scrollbar instance via a module-level getter (e.g. `getScrollbar()`) so ScrollTopWidget & others can `scrollTo`.
- `history.scrollRestoration = 'manual'` on mount.
- IMPORTANT mount order: provider must set `ScrollTrigger.defaults` in a `useLayoutEffect` BEFORE child sections create their ScrollTriggers (children use plain `useEffect`; layout effects of parent run after children — so instead create the scrollbar in the provider's `useLayoutEffect` and have children defer their trigger creation to `requestAnimationFrame`; ALSO call `ScrollTrigger.refresh()` after init). Document this in code comments.

## Preloader
- Markup: `<div id="preloader"><div id="loader"></div></div>`
- CSS (ported from chunk): fixed full-screen, background #021222, z-index 1000, centered; `#loader` 70px circle, `border-top: 2px solid #00AEEF`, border-radius 50%, absolute top 50% left 50%, `animation: spin 1s linear infinite` (keyframes `spin` already in globals.css translate(-50%,-50%) rotate).
- Behavior: subscribe `onPreloaderDone` from `@/lib/site-events` → `style.transition='opacity 1s'; opacity=0;` then `display:none` after 1s. (ParticleCanvas calls `markPreloaderDone()` when its 6 OBJ models finish loading.)

## ScrollTopWidget
- Use verbatim markup from `scroll-widget.html`:
  `.scroll-wrapper > .scroll-top` ("scroll to top" vertical label) + `.scroll` (svg circle progress + `.arrow` with chevron-down-lg img... check fragment for exact img/arrow markup).
- Use `CircleProgressIcon` from `@/components/icons` for the inline SVG (circumference 153.93).
- Behaviors (desktop, via `getScrollbar()`; mobile falls back to window scroll):
  - progress: `circleFill.style.strokeDashoffset = C * (1 - scrollTop / limit)` on every scroll event (`bar.addListener` / window scroll listener)
  - GSAP timeline + ScrollTrigger (trigger `.footer`, start "top bottom", end "bottom bottom", scrub): `.arrow` rotate→180, `.scroll-top` opacity→1, wrapper cursor→pointer/pointerEvents→auto over 1.5s power1.inOut
  - click → `bar.scrollTo(0, 0, 3000)` (mobile: `window.scrollTo({top:0,behavior:'smooth'})`)
- Initial state from CSS chunk (opacity 0 etc.) — port faithfully.

## States & Behaviors
Covered above (progress ring, arrow flip near footer, click-to-top, modal freeze).

## Assets
- `/images/icons/chevron-down-lg.svg` (check fragment for which chevron the arrow uses)

## Text content (verbatim)
- "scroll to top"

## Responsive
- Per CSS chunk @media blocks (widget hidden/resized at small widths — port as-is).
- Scrollbar only >991px.

## Dependencies
`npm i` already done: `smooth-scrollbar`, `gsap`. Import `{ gsap, ScrollTrigger, BP }` from `@/lib/gsap`.
