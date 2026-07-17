# HeroSection Specification (hp-sec-1)

## Overview
- **Target files:** `src/components/HeroSection.tsx`, `src/app/styles/hero.css`
- **Interaction model:** time-driven intro (post-preloader), scroll-driven fade of hint
- **Source artifacts:** `docs/research/advida.com/sections/hero.html`, `hero.css`; behaviors: `BEHAVIORS.md` §"Hero intro timeline"

## DOM (from hero.html, verbatim)
```html
<section class="hp-sec-1">
  <div class="container">
    <h1 class="title-anim">Powering Customer Acquisition For The World's Leading Brands</h1>
    <div class="subtitle p-anim">We combine the art of storytelling with technology and paid media to create highly effective advertising.</div>
  </div>
  <div class="scroll-to">
    <div class="line"><div></div></div>
    <div class="text">scroll to learn more</div>
  </div>
</section>
```
- Replace runtime text splitting with `<TitleChars text="Powering Customer Acquisition For The World's Leading Brands"/>` inside the h1 (curly apostrophe U+2019 in "World's" — copy from fragment) and `<PChars .../>` inside `.subtitle`.

## Intro timeline (client; create paused, play on `onPreloaderDone`)
```
tl.fromTo('.header', {}, { y: 0, duration: 2 })
tl.fromTo('.hp-sec-1 .scroll-to .line > div', {}, { width: '100%', duration: 2 }, '<')
tl.fromTo('.hp-sec-1 .scroll-to .text', {}, { opacity: 1, duration: 2 }, '<')
tl.fromTo('.scroll-wrapper', {}, { opacity: 1, y: 0, duration: 2 }, '<')
tl.fromTo('.hp-sec-1 h1', {}, { scale: 1, duration: 3, ease: 'cubic-bezier(0.5, 1, 0.89, 1)' }, '<')
tl.fromTo('.hp-sec-1 .word_inner', {}, { opacity: 1, stagger: 0.045, filter: 'blur(0px)', delay: 0.5, ease: 'cubic-bezier(0.11, 0, 0.5, 0)' }, '<')
tl.fromTo('.hp-sec-1 .p_inner', {}, { opacity: 1, stagger: 0.02, ease: 'cubic-bezier(0.11, 0, 0.5, 0)' }, '<')
```
(gsap accepts CSS cubic-bezier strings via CustomEase alternative: use `ease: "power2.out"`? NO — use gsap's `"circ"`-like equivalents are wrong. gsap core supports `ease: CSS strings` only with CustomEase plugin which is club-free since gsap 3.13 public — if unavailable, approximate: cubic-bezier(0.5,1,0.89,1)≈`"power2.out"`, cubic-bezier(0.11,0,0.5,0)≈`"power1.in"`. Prefer `CustomEase.create` if importable from `gsap/CustomEase`; otherwise use the approximations and note it.)
- Scroll hint fade (only if innerWidth > 575): `gsap.fromTo('.hp-sec-1 .scroll-to', {}, { opacity: 0, scrollTrigger: { trigger: '.hp-sec-2', scrub: true, end: 'top center' } })`
- Initial states come from CSS chunk (h1 scale 0.95, scroll-to line width 0, text opacity 0). Port faithfully.

## Assets
None (globe is ParticleCanvas).

## Responsive
Port hero.css @media blocks verbatim (h1 font sizes 50px desktop → smaller; .scroll-to left 125px etc.).
