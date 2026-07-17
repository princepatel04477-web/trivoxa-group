# Header Specification (Header, MegaMenu, MobileNav)

## Overview
- **Target files:** `src/components/Header.tsx` (includes mega menu markup), `src/components/MobileNav.tsx`, `src/app/styles/header.css`, `src/app/styles/mobile-nav.css`
- **Interaction model:** hover-driven (mega menu), click-driven (hamburger)
- **Source artifacts:** `docs/research/advida.com/sections/header.html`, `header.css`, `mobile-nav.html`, `mobile-nav.css`; behaviors in `BEHAVIORS.md` §"Header & mega menu", §"Mobile nav", §"Hero intro timeline" (header slides in as part of hero intro — implemented by HeroSection, header just has initial off-state from CSS).

## DOM structure
Use `header.html` verbatim (fix WordPress menu ids as class/id strings — keep `menu-item-53`, `menu-item-85` ids, GSAP/handlers reference them). Structure:
- `.header > .header-wrapper.d-flex` — logo link (img `/images/logo.svg`) + `.menu` nav (Services ▾ / Success Stories / Learn / Blog / FAQ's) + right block: "Contact Us" link + circular envelope button (img `/images/icons/envelope-send.svg`), both with class `contact-open`
- `.header > .mega-menu.d-flex` — 3 columns: Managed Services (Google Ads, YouTube Ads, Social Ads), Technology Services (Landing Page Optimization, Publisher Partnerships), Creative Studio Services (Product & Lifestyle Photography, User-Generated Content, Video Production, Video Editing, Direct Response Copywriting)
- Keep original hrefs (advida.com paths → keep as-is relative paths like `/managed-services/google-ads/`; dead links acceptable for clone)

## Behaviors
- Mega menu (desktop): on `mouseenter` of Services item (`#menu-item-53`) OR `.mega-menu`: `megaMenu.style.transform='translateY(0)'; opacity=1; pointerEvents='all'`; add `menu-active` class to the Services li. On `mouseleave` of both: `translateY(70px); opacity 0; pointerEvents none`; remove class. CSS chunk provides the transition + chevron rotation for `.menu-active`.
- `.contact-open` clicks: `emit('modal:open')` from `@/lib/site-events` + add `contact-modal-open` class to body (ContactModal handles display; keep both here for parity).
- Header initial state: per CSS chunk it sits translated up (y offset) until hero intro brings it in — do NOT animate here.
- MobileNav (≤991): hamburger button (`.hamburger` in header fragment) toggles body class `nav-active` and plays GSAP timeline:
  `tl.fromTo('.mobile-nav', {}, { clipPath: 'circle(130% at 50% 0%)', y: 0, duration: 1.5 })`
  `tl.fromTo('.mobile-nav .nav__content >ul >li', {}, { opacity: 1, delay: 1, stagger: 0.07, y: 0 }, '<')`
  paused; play on open, `reverse()` on close.
- Mobile Services submenu (`#menu-item-85 > a` click): toggle `.opened` + slideToggle 300ms (implement with gsap height auto tween or CSS grid-rows transition — visual result must match slide).

## Assets
`/images/logo.svg`, `/images/icons/envelope-send.svg`, `/images/icons/chevron-down.svg`, `/images/icons/close.svg` (check fragments for exact usage).

## Text content
Verbatim from fragments (note "FAQ's" apostrophe, "FAQs" in mobile nav).

## Responsive
Port CSS chunks verbatim including @media blocks (hamburger visibility, header paddings).
