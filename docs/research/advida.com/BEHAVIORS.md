# advida.com — Behavior Bible

Source of truth: extracted from the site's own JS (`theme-src/inline-hero-animations.js`, `theme-src/inline-contact-modal.js`, `theme-src/main.js`). These are exact, not observed approximations.

## Global scroll model

- **Desktop (>991px):** `smooth-scrollbar` library on `.surrounding` wrapper:
  `Scrollbar.init(el, { damping: 0.05, delegateTo: document, alwaysShowTracks: true })`
  + custom `modal` ScrollbarPlugin: when `options.open` is true, `transformDelta` returns `{x:0,y:0}` (scroll frozen while contact modal open).
  + `ScrollTrigger.scrollerProxy('.surrounding', ...)`; `scrollbar.addListener(ScrollTrigger.update)`; `ScrollTrigger.defaults({ scroller: .surrounding })`.
- **Mobile (≤991px):** native window scroll; no smooth-scrollbar.
- `history.scrollRestoration = 'manual'` — always start at top.
- Always-visible custom scrollbar track/thumb (`.scrollbar-track-y`, cyan thumb).

## Three.js particle scene (fixed full-screen canvas, z-index -1)

- Renderer: `WebGLRenderer({alpha:true})`, clear color transparent, pixelRatio = devicePixelRatio, appended to `<body>`; `position: fixed; inset: 0; z-index: -1`.
- Camera: PerspectiveCamera(35, aspect, 1, 10000), `z = 36`.
- **10,000 particles** in a `PointCloud` (in modern three: `Points`). Material: size 0.2, additive blending, transparent, texture = radial glow sprite (`particle-tiny.png`), initial color white; morph color set to `0x8DD8F8` (light cyan).
- Render loop: `mesh.rotation.y += speed` each frame; base speed 0.005; during morph tweens to 0.02 (Power4.easeIn, 0.3s), then back to 0.005 over 4s (Power2.easeOut, delay 1s).
- **Shape targets** = 10,000 random points sampled on geometry surfaces:
  - `sphere` — THREE.SphereGeometry(5, 30, 30) (fallback shape, unused after load)
  - `globe2.obj` (scale 4.5 desktop / 4 tablet / 3.5 mobile)
  - `Astronaut.obj` (3.6 / 3 / 2.6)
  - `CartoonRocket.obj` (1.5 / 1.2 / 1)
  - `bar-graph-001.obj` (150.1 / 130.1 / 110.1)
  - `movie.obj` (0.27 / 0.2 / 0.18)
  - `phone.obj` (1 / 0.7 / 0.5)
  - OBJ geometry vertical centering: `y -= boundingBox.max.y * scale / 2`.
- **Morph:** for each of 10k vertices: `TweenMax.to(vertex, 4, {ease: Elastic.easeOut.config(1, 0.75), x,y,z})` toward target shape.
- **Preloader:** counts 6 OBJ loads; when done → fade `#preloader` opacity→0 over 1s, display none after 1s, morph to globe, play hero intro timeline.
- Scene position x per breakpoint (desktop / tablet 768-1024 / mobile):
  - initial: 9 / 6 / 0
  - vars: sec2Target = -6 (desktop; mobile -4), sec3Target = 14 / 7 / 3, sec4Target = -6 / 0 / 0, contactTarget = 9 / 5 / 0
- **Scroll choreography (all ScrollTriggers, scroller = .surrounding):**
  - `q.position.x → -6` scrub, trigger `.hp-sec-2`, start "top bottom", end "top center"
  - morph → **Astronaut** onEnter `.hp-sec-2` at "top center"; back to **globe** onEnterBack `.hp-sec-1` "center center"
  - `q.position.x -6 → 14` scrub, trigger `.hp-sec-3`, start "top bottom", end "bottom bottom"
  - morph → **Rocket** onEnter `.hp-sec-3` "top center"; back to **Astronaut** onEnterBack `.hp-sec-2` "center center"
  - `q.position.x 14 → -6` scrub, trigger `.hp-sec-4`, start "top bottom", end "bottom bottom"
  - morph → **Bar graph** onEnter `.hp-sec-4 .row-wrapper.first` "top center"; back to **Rocket** onEnterBack `.hp-sec-3` "center center"
  - morph → **Movie clapper** onEnter `.hp-sec-4 .row-wrapper.second` "top center"; back to **Bar graph** onEnterBack `.row-wrapper.first` "center center"
  - `q.position.x -6 → 9` scrub, trigger `.hp-contact-section .contact`, start "top bottom", end "bottom bottom"
  - morph → **Phone** onEnter `.hp-contact-section` "top center"; back to **Movie** onEnterBack `.row-wrapper.second` "center center"
  - **Footer starfield:** `q.scale → (15,15,15)` scrub, trigger `.footer`, start "top bottom-=100px", end "bottom bottom"

## Text splitting (on DOM ready)

- `.title-anim` → each char wrapped in `<span class="word_inner">C</span>` (word-grouped, space-joined)
- `.p-anim` → each char wrapped in `<span class="p_inner">C</span>`
- `.testimonial-anim` → each word wrapped in `<span class="testimonial_inner">`

## Hero intro timeline (plays after preloader done; paused until then)

- `.header` y→0, 2s
- `.hp-sec-1 .scroll-to .line > div` width→100%, 2s (at "<")
- `.hp-sec-1 .scroll-to .text` opacity→1, 2s (<)
- `.scroll-wrapper` opacity→1, y→0, 2s (<)
- `.hp-sec-1 h1` scale→1, 3s, ease cubic-bezier(0.5,1,0.89,1) (<)
- `.hp-sec-1 .word_inner` opacity→1, blur→0, stagger 0.045, delay 0.5, ease cubic-bezier(0.11,0,0.5,0) (<)
- `.hp-sec-1 .p_inner` opacity→1, stagger 0.02 (<)
- `.hp-sec-1 .scroll-to` fades out via scrub ScrollTrigger (trigger `.hp-sec-2`, end "top center") — width >575 only

## Pinned horizontal slider (hp-sec-2, desktop >991 only)

```
distance = sliderAnimationWrapWidth  (outerWidth of .slider .animation-wrap)
offset   = distance - containerWidth (.hp-sec-2 .container outerWidth)
gsap.timeline({scrollTrigger:{ trigger: '.slider', scrub: 0.5, pin: '.hp-sec-2',
  start: 'bottom bottom-=100px', end: '+=' + distance }})
  .to('.slider .animation-wrap', { x: -offset, ease: 'none' })
```

## Per-section entrance timelines (pattern repeats)

Headings: `scale→1, 2s, cubic-bezier(0.5,1,0.89,1)` (start scale from CSS, 0.95).
`word_inner`: opacity→1 + blur(0), stagger 0.03–0.04. `p_inner`: opacity→1, stagger 0.015–0.04.
Checks (`.check`): opacity→1, y→0, stagger 0.3, delay 0.5.
Triggered by ScrollTrigger on the section (default toggle, no scrub).

- hp-sec-2 `.upper` (+left-text parallax x→0, scrub, width>767)
- hp-sec-2 `.bottom h5`
- hp-sec-3 stats (+left-text `.top` x→0 scrub)
- hp-sec-4 row-wrapper.first / row-wrapper.second (+left-text scrub, width>767)
- hp-contact `.brands h2`, `.contact h4` (+left-text scrub)

## hp-sec-4 sticky left text follower (width>767)

```
ScrollTrigger.create({ trigger: container, start:'top center-=200px',
  endTrigger: rowWrapperSecond, end: 'top top',
  onUpdate(self){ leftTextWrapper.style.top = `${100 + self.progress * (firstH + secondH)}px` } })
```

## Odometers (hp-sec-3 .statistics onEnter)

- odometer1: "1" → "4"  (displayed "4B+", label YOUTUBE VIEWS)
- odometer2: "10" → "100" ("100+", BRANDS GROWN)
- odometer3: "030" → "200" ("$200M+", PROFITABLE AD SPEND)
- Uses Odometer.js library.

## Swipers

- `.swiper-1` (case studies): only initialized ≤991px; speed 1300; 320: 1/20gap, 576: 1.05/40gap. ScrollTrigger slideNext/slidePrev on enter/enterBack.
- `.swiper-2` (brand logos marquee): speed 5000, loop, autoplay delay 0 (continuous), slidesPerView 2/20 at 320, 3.2/30 at 767, 3.2/60 at 1400, 4.2/60 at 1921.

## Scroll-to-top widget (.scroll-wrapper, fixed left-bottom)

- SVG circle `.circle-fill` progress: `strokeDashoffset = C * (1 - scrollTop/limit)`
- Near footer (trigger .footer, scrub): arrow rotates 180°, `.scroll-top` label fades in, cursor pointer
- Click → scrollTo(0,0, 3000ms)

## Header & mega menu

- Header slides down (y→0) as part of hero intro.
- `#menu-item-53` (Services) + `.mega-menu`: mouseenter → `transform: translateY(0); opacity: 1; pointerEvents: all` (+ .menu-active on trigger); mouseleave → `translateY(70px); opacity: 0; pointerEvents: none`. CSS transition handles easing.

## Mobile nav (hamburger, ≤991px)

- GSAP timeline: `.mobile-nav` clipPath `circle(130% at 50% 0%)` + y→0, 1.5s; li items opacity→1, y→0, stagger 0.07, delay 1. Toggle on `.hamburger` click via body class `nav-active`; reverse on close.
- Submenu `#menu-item-85` (Services) click → slideToggle 300ms.

## Contact modal

- Open: any `.contact-open` click → body class `contact-modal-open`, scrollbar frozen (modal plugin) on desktop.
- Close: click on modal backdrop/container or `.close` → remove class, unfreeze.
- Form: HubSpot-style embed from learn.advida.com (clone: plain form fields Full Name / Company Name / Your email address / How could we help you? / Send Now).

## Footer

- `#year` filled with current year.
- "and much more..." link toggles `.more` items slideUp/slideDown 300ms, text switches to "view less".

## FAQ accordion (not on homepage — skip)

## JS width breakpoints

- \>991: smooth-scrollbar, pinned slider, mega menu
- \>767: left-text parallax, sec-4 follower
- \>575: hero scroll-to fade
- ≤991: swiper-1, native scroll, hamburger nav
