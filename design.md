# Design — Trivoxa Group

A locked design system for this app. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
editorial (premium, high editorial typographic rhythm, dark mode canvas).

## Macrostructure family
- Marketing pages: Marquee Hero (asymmetric hero + prominent headline + clean button CTAs)
- Division pages: Bento Grid (grid panels with structured card hierarchy)
- Content pages: Long Document (centered clean reading layouts)

## Theme
- `--color-paper`: `oklch(0.12 0.015 280)` (deep charcoal black canvas)
- `--color-paper-2`: `oklch(0.16 0.015 280)` (elevated charcoal surface)
- `--color-ink`: `oklch(0.96 0.005 60)` (high-contrast ivory white)
- `--color-ink-2`: `oklch(0.70 0.01 60)` (muted silver text)
- `--color-rule`: `oklch(0.24 0.015 280)` (subtle divider borders)
- `--color-accent`: `oklch(0.74 0.13 85)` (warm sunset gold)
- `--color-focus`: `oklch(0.74 0.13 85)` (warm focus ring)

## Typography
- Display: Lufga, weight 600, style normal
- Emphasis: Calisto MT, style italic
- Body: Work Sans, weight 300/400
- Mono: Space Mono / ui-monospace
- Display tracking: -0.02em

## Spacing
4-point named scale:
- `--space-3xs`: 0.25rem
- `--space-2xs`: 0.5rem
- `--space-xs`: 0.75rem
- `--space-sm`: 1rem
- `--space-md`: 1.5rem
- `--space-lg`: 2rem
- `--space-xl`: 3rem
- `--space-2xl`: 4.5rem
- `--space-3xl`: 7rem

## Motion
- Easings: `cubic-bezier(0.16, 1, 0.3, 1)` named `--ease-out`
- Reveal pattern: fade-in text stagger (GSAP word_inner/p_inner)
- Reduced-motion fallback: opacity-only, <= 150ms

## Microinteractions stance
- Hover delay: 200ms
- Focus delay: 0ms

## CTA voice
- Primary CTA: Solid gold accent fill, border-radius 2px, inline padding 1.5rem, text color: paper black.
- Secondary CTA: Outline gold accent border, transparent fill, border-radius 2px.

## Per-page allowances
- Marketing/Landing pages may use the animated particle eagle and success odometer counters.
- Division/Details pages: Static, highly typographic layout with clean grids.

## What pages MUST share
- The Trivoxa logo and tagline.
- Accent gold color for links, buttons, and focus frames.
- Display + body fonts.
- Header navigation bar and site footer.
