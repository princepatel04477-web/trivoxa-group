# advida.com — Page Topology

Single-page scroll experience. Dark navy (#071022-ish) background throughout. A fixed, full-screen Three.js particle canvas sits behind everything (z-index -1) and morphs shapes per section. Virtual scroll height ≈ 10,119px at 1536×690 viewport (scroll limit 9429).

## Fixed / overlay layers (top → bottom z-order)

1. `#preloader` — full-screen dark cover, fades out when 6 OBJ models are loaded
2. `#contact-modal` — modal overlay (hidden until `.contact-modal-open` on body)
3. `.header` — fixed top bar: logo (particle-dot mark + ADVIDA wordmark), nav (Services ▾ with mega-menu, Success Stories, Learn, Blog, FAQ's), right: "Contact Us" text link + circular envelope icon button (both `.contact-open`)
4. `.mega-menu` — full-width dropdown panel under header (3 columns: Managed Services / Technology Services / Creative Studio Services)
5. `.mobile-nav` — full-screen circle-clip menu (≤991px)
6. `.scroll-wrapper` — fixed bottom-left: "scroll to top" vertical label + circular progress ring with chevron (rotates 180° near footer)
7. Custom scrollbar track/thumb right edge (cyan thumb, always visible)
8. Three.js `<canvas>` — fixed, z-index -1

## Flow sections (inside .surrounding > .scroll-content)

| # | Section | Offset(px) | Height | Interaction model |
|---|---------|-----------|--------|-------------------|
| 1 | `hp-sec-1` Hero | 0 | 690 | time-driven intro (post-preloader char reveal); globe particles right; "scroll to learn more" bottom |
| 2 | `hp-sec-2` (pinned via pin-spacer) | 790 | 4890 | **scroll-driven**: pinned; "Success Stories" vertical side text; `.upper` intro text; horizontal card slider scrubs x; `.bottom` outro text (Experienced…) ; astronaut particles |
| 3 | `hp-sec-3` Statistics | 5680 | 598 | scroll-triggered odometer counters (4B+ / 100+ / $200M+); "Statistics" side text; rocket particles |
| 4 | `hp-sec-4` Core Services | 6427 | 1490 | two `.row-wrapper`s (first: "We'll help you:" + checks + "See How It's Done"; second: checks + "Tour Our Studio"); sticky left-text follower; bar-graph → movie-clapper particles |
| 5 | `hp-contact-section` | 8097 | 1557 | `.brands` heading + swiper-2 logo marquee (vivint, loop, Masterworks, Microsoft, smartasset…); `.contact` form card (Full Name / Company / Email / Message / Send Now); "Get In Touch" side text; "Follow Us" + social icons row; phone particles |
| 6 | `footer` | 9654 | 466 | starfield (particles scaled 15x); logo, address (1343 Main Street, Suite 705, Sarasota, FL 34236, (941) 269-1512), 4 link columns (Managed Services / Success Stories / Technology Services / Creative Studio Services), ©{year}, Privacy Policy, "and much more..." expander |

## Left rail pattern (sections 2–5)

Each major section has a `.left-text-wrapper` with huge outlined/thin vertical rotated text (e.g. "Success Stories", "Statistics", "Core Services", "Get In Touch") + a vertical line; slides in horizontally with scrubbed parallax; in sec-4 it also follows scroll via a `top` updater.

## Responsive summary (from source CSS/JS)

- ≤991: native scroll, hamburger + full-screen circle nav, no pinned slider (cards become swiper-1 carousel), mega-menu hidden
- ≤767: left-text parallax off, sec-4 follower off, single-column rows
- ≤575: hero scroll-to hint fade disabled (element likely hidden)

## Clone architecture (Next.js)

- `ParticleCanvas` (client) — three@latest, Points + BufferGeometry morphs, OBJ sampling via MeshSurfaceSampler; listens to section triggers
- `SmoothScrollProvider` (client) — smooth-scrollbar + ScrollTrigger scrollerProxy (desktop only)
- `Header` / `MegaMenu` / `MobileNav`
- `HeroSection`, `SuccessStoriesSection` (pinned slider), `StatisticsSection`, `CoreServicesSection`, `ContactSection`, `SiteFooter`
- `ContactModal`, `ScrollTopWidget`, `Preloader`
- Shared: `SideText` (left rail), text-split reveal util, `useSectionTimeline`
