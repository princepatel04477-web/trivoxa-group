# ContactSection Specification (hp-contact-section)

## Overview
- **Target files:** `src/components/ContactSection.tsx`, `src/app/styles/contact-section.css`
- **Interaction model:** time-driven logo marquee (Swiper autoplay) + scroll entrances
- **Source artifacts:** `docs/research/advida.com/sections/contact-section.html`, `contact-section.css`; behaviors: `BEHAVIORS.md` §"Swipers" (.swiper-2), §"Per-section entrance timelines"

## DOM (from contact-section.html verbatim)
- `.container > .brands.d-flex`: h2.title-anim "Brands We've Helped Grow" + `.swiper.swiper-2 > .swiper-wrapper` with 12 `.swiper-slide`s (6 logos ×2): loop-lg, masterwork, microsoft-lg, smartasset-lg, vici-lg, vivint → `/images/brands/*.png`
- `.contact`: `.left-text-wrapper` ("Get" / "In Touch" — check fragment split) + `.row.d-flex`:
  - `.left > .contact-form.d-flex` — original embeds an external form script. CLONE AS STATIC FORM (matches rendered result):
    - heading: "Drop us a line, and we'll get in touch." (h4)
    - inputs: text "Full Name", text "Company Name", email "Your email address", textarea "How could we help you?" (~4 rows), submit button "Send Now"
    - Style to match screenshot: form card bg #10253e-ish rounded ~20px padding ~56px; inputs bg rgba(64,156,234,0.08) (fallback #16304f), border-radius 8px, padding ~20px 28px, white text, placeholder rgba(255,255,255,0.55); "Send Now" full-width pill (border-radius 40px), transparent bg, 1px solid rgba(255,255,255,0.44), padding ~20px, font 300; hover: border-color #00AEEF (any tasteful match). Submit does nothing (preventDefault).
    - NOTE: `.contact-form` wrapper rules exist in the CSS chunk — port those; inner form styles are yours to match the description.
  - `.information.d-flex` — "Schedule A Strategy Call With Our Team Of Customer Acquisition Experts" (p-anim h4? check fragment) + CTA button "Book Strategy Call" with `/images/icons/book-call.svg` + arrow-right icon; keep classes (`contact-open`? verify — if the button opens the modal, wire `emit('modal:open')`).

## Behaviors (client)
- Swiper marquee: `new Swiper('.swiper-2', { speed: 5000, loop: true, autoplay: { delay: 0, disableOnInteraction: false }, breakpoints: { 320: { slidesPerView: 2, spaceBetween: 20 }, 767: { slidesPerView: 3.2, spaceBetween: 30 }, 1400: { slidesPerView: 3.2, spaceBetween: 60 }, 1921: { slidesPerView: 4.2, spaceBetween: 60 } } })` — needs `Autoplay` module (`swiper/modules`) and `swiper/css`; linear easing comes from speed+delay 0 (add `.swiper-wrapper { transition-timing-function: linear }` for smooth marquee).
- Entrances: `.brands h2` scale→1 + word_inner stagger .03 (trigger `.hp-contact-section .container .brands`); `.contact h4` scale→1 + p_inner delay .3 stagger .02 (trigger `.hp-contact-section .container .contact`); left-text parallax (>767) scrub on `.contact` trigger.

## Assets
6 brand PNGs, `/images/icons/book-call.svg`, `/images/icons/arrow-right.svg`.

## Responsive
Port contact-section.css verbatim (16 @media rules).
