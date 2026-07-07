# CoreServicesSection Specification (hp-sec-4)

## Overview
- **Target files:** `src/components/CoreServicesSection.tsx`, `src/app/styles/core-services.css`
- **Interaction model:** scroll-driven (entrance timelines + sticky left-text follower)
- **Source artifacts:** `docs/research/advida.com/sections/core-services.html`, `core-services.css`; behaviors: `BEHAVIORS.md` §"hp-sec-4 sticky left text follower", §"Per-section entrance timelines"

## DOM (from core-services.html verbatim)
- `.left-text-wrapper` side text "Core Services" (absolute; `top` updated by follower JS)
- `.container` with TWO `.row-wrapper`s:
  - `.row-wrapper.first`: h2.title-anim "Paid Media"; intro p-anim "Ready to increase your revenue and grow your business with performance marketing?"; arrow CTA "See How It's Done" (circle arrow img `/images/icons/arrow-right.svg`); `.right .checks` — "We'll help you:" heading + 5 `.check` items (tick-circle icon + text):
    1. Get Google and YouTube ads profitable.
    2. Optimize and scale Facebook ads.
    3. Tap into TikTok, SnapChat, and Twitter.
    4. Develop engaging creatives that stand out.
    5. Lower CPCs and decrease customer acquisition costs.
  - `.row-wrapper.second`: h2 "In-House Creative Studio"; p "Leverage our content creation services to develop engaging content that turns views into new customers."; CTA "Tour Our Studio"; checks: "Professional lifestyle and product videography." / "High quality UGC content." / "World class animation." / (verify full list in fragment — includes "Experience..." more items)
- Fragment is authoritative for exact markup, hrefs, headings ("We'll help you:" may appear per row).

## Behaviors (client)
- Sticky follower (innerWidth > 767):
```js
const first = q('.row-wrapper.first'), second = q('.row-wrapper.second');
const total = first.offsetHeight + second.offsetHeight;
ScrollTrigger.create({ trigger: container, start: 'top center-=200px', endTrigger: second, end: 'top top',
  onUpdate(self) { leftTextWrapper.style.top = `${100 + self.progress * total}px`; } });
```
- Left-text parallax (>767): `.top` x→0 + `.left-side-title` x→0, scrub, trigger `.hp-sec-4 .container .left-text-wrapper`.
- Entrance per row-wrapper (trigger = that wrapper): h2 scale→1 2s; word_inner opacity 1 blur 0 stagger .03; p_inner stagger .015; `.row > div.right .checks > .check` opacity→1 y→0 stagger .3 delay .5.
- Check initial state (opacity 0, translated) comes from CSS chunk.

## Assets
`/images/icons/arrow-right.svg`, `/images/icons/tick-circle.svg` (or `check.svg` — match fragment).

## Responsive
Port core-services.css verbatim (22 @media rules; single column ≤767).
