# StatisticsSection Specification (hp-sec-3)

## Overview
- **Target files:** `src/components/StatisticsSection.tsx`, `src/components/Odometer.tsx`, `src/app/styles/statistics.css`
- **Interaction model:** scroll-triggered (odometer counters + entrance reveals)
- **Source artifacts:** `docs/research/advida.com/sections/statistics.html`, `statistics.css`; behaviors: `BEHAVIORS.md` §"Odometers", §"Per-section entrance timelines"

## DOM (from statistics.html verbatim)
- `.left-text-wrapper` side text: "Statistics" (top: "Stat"?? — check fragment: `.top` line + word, `.left-side-title`)
- `.container > h2.title-anim` "We Take Pride In Driving Real Results"
- `.statistics` row with 3 stat blocks:
  1. `.odometer1` value 1→4, suffix "B +", label "YOUTUBE VIEWS"
  2. `.odometer2` 10→100, suffix "+", label "BRANDS GROWN"
  3. `.odometer3` "030"→"200" with prefix "$", suffix "M +", label "PROFITABLE AD SPEND"
  (fragment shows exact wrappers: prefix/suffix spans around the odometer element — reproduce)

## Odometer component
Build a self-contained `Odometer` (no external lib): digit columns that roll vertically from `from` to `to` over **4s** (transition-duration 4s, ease-out), imperative `start()` via ref or a `run` boolean prop. Digits stack `0-9` in a vertical ribbon; translateY to target digit; preserves digit count ("030" keeps leading zero → "200"). Outlined-number styling comes from the CSS chunk (stats use outlined/hollow digits via -webkit-text-stroke or color transparent — port from chunk; check `.statistics` rules).

## Behaviors
- `ScrollTrigger.create({ trigger: '.hp-sec-3 .statistics', onEnter: () => run all three odometers })` (fires once — keep a ran flag).
- Entrance: h2 scale→1 2s cubic-bezier(0.5,1,0.89,1); `.hp-sec-3 .word_inner` opacity 1, blur 0, stagger .03 — trigger `.hp-sec-3 .statistics`.
- Left-text parallax (>767): `.hp-sec-3 .left-text-wrapper .left-text .top` x→0, scrub, trigger `.hp-sec-3 .statistics`.

## Text content (verbatim)
"We Take Pride In Driving Real Results"; "4B +"/"YOUTUBE VIEWS"; "100 +"/"BRANDS GROWN"; "$200M +"/"PROFITABLE AD SPEND" (check fragment for exact spacing/casing — labels are uppercase letter-spaced).

## Responsive
Port statistics.css @media blocks verbatim.
