# SuccessStoriesSection Specification (hp-sec-2, pinned horizontal slider)

## Overview
- **Target files:** `src/components/SuccessStoriesSection.tsx`, `src/app/styles/success-stories.css`
- **Interaction model:** SCROLL-DRIVEN pinned horizontal scrub on desktop (>991); swiper carousel on mobile (≤991). NOT click-driven.
- **Source artifacts:** `docs/research/advida.com/sections/success-stories.html`, `success-stories.css`; behaviors: `BEHAVIORS.md` §"Pinned horizontal slider", §"Per-section entrance timelines", §"Swipers" (.swiper-1)

## DOM (from success-stories.html — use verbatim; key structure)
- `<section class="hp-sec-2">` containing:
  - `.left-text-wrapper > .left-text` — `.top` (`.line` + "Success") + `.left-side-title` "Stories" (shared CSS already global)
  - `.container > .upper` — `.left`/`.right` with h-title (title-anim char split) "We've Driven Over $500 Million In Attributed Revenue For Our Clients" (+ p-anim text if present in fragment)
  - `.slider > .animation-wrap` — 4 case-study cards (desktop horizontal strip)
  - `.case-studies .swiper.swiper-1 > .swiper-wrapper > .swiper-slide` ×4 (mobile markup — check fragment; may be same cards duplicated or same node reused)
  - `.container > .bottom` — h5 + paragraph ("Experienced performance marketing experts …")
- Cards (each `Learn More` links to a success-story page; keep original hrefs):
  1. MSN/Microsoft — img `/images/case-studies/microsoft.jpg`, logo `/images/brands/microsoft-lg.png`, title "Increasing Native Ad Revenues On MSN", text "From optimizing native ad units to expanding to international geos"
  2. SmartAsset — `/images/case-studies/smartasset.jpg`, logo `/images/brands/smartasset-lg.png`, "Strategic Lead Generation Success Through Premium Advertising Platforms", "Expanding Outreach via High-Quality Advertising Channels"
  3. Loop — `/images/case-studies/loop.jpg`, logo `/images/brands/loop-lg.png`, "Advida Strategic Partnerships", "Expanding Outreach via High-Quality Advertising Channels"
  4. Vici Wellness — `/images/case-studies/vici-wellness.jpg`, logo `/images/brands/vici-lg.png`, "Paid Media & Beyond", "From optimizing paid media efforts and shaping the business model for success"
  (VERIFY against fragment — fragment is authoritative for order/copy/logos.)
- Use `<TitleChars/>`/`<PChars/>` for `.title-anim`/`.p-anim` elements.

## Behaviors (client)
- Desktop pin (innerWidth > 991), create after mount in rAF:
```js
const distance = animationWrap.offsetWidth;           // $('.slider .animation-wrap').outerWidth()
const offset = distance - container.offsetWidth;      // .hp-sec-2 .container
gsap.timeline({ scrollTrigger: { trigger: '.slider', scrub: 0.5, pin: '.hp-sec-2',
  start: 'bottom bottom-=100px', end: () => `+=${distance}` } })
  .to('.slider .animation-wrap', { x: -offset, ease: 'none' });
```
- `.upper` entrance timeline (trigger `.hp-sec-2 .container .upper`): word_inner opacity 1 stagger .04 blur 0 delay .4; `.right .title-anim` scale→1 2s; p_inner stagger .04.
- Left-text parallax (innerWidth > 767): `.left-text .top` x→0 and `> .left-side-title` x→0, scrubbed on `.upper` trigger.
- `.bottom` timeline (trigger `.hp-sec-2 .container > .bottom h5`): h5 scale→1 2s; word_inner stagger .03; p_inner stagger .015.
- Mobile (≤991): initialize Swiper (`import Swiper from 'swiper'`; css `swiper/css`) on `.swiper-1`: speed 1300, breakpoints {320:{slidesPerView:1,spaceBetween:20},576:{slidesPerView:1.05,spaceBetween:40}}; plus ScrollTrigger (trigger '.case-studies .swiper', start 'top center', end 'top center+=50px') onEnter slideNext / onEnterBack slidePrev.

## Assets
Case-study images + brand logos above; `/images/icons/arrow-right.svg` if in fragment.

## Responsive
Port success-stories.css verbatim (incl. its 40 @media rules). Desktop shows `.slider`; mobile shows `.case-studies .swiper` (visibility handled by CSS chunk).
