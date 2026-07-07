# Footer + ContactModal Specification

## Overview
- **Target files:** `src/components/SiteFooter.tsx`, `src/components/ContactModal.tsx`, `src/app/styles/footer.css`, `src/app/styles/contact-modal.css`
- **Interaction model:** click-driven (modal open/close, "and much more..." expander)
- **Source artifacts:** `docs/research/advida.com/sections/footer.html`, `footer.css`, `contact-modal.html`, `contact-modal.css`; behaviors: `BEHAVIORS.md` §"Contact modal", §"Footer"

## SiteFooter DOM (from footer.html verbatim)
- `<section class="footer">` — "Follow Us" heading row + divider + social circle icon links: facebook, linkedin, twitter (X) → `/images/icons/{facebook,linkedin,twitter}.svg`
- Logo `/images/logo.svg`; address "1343 Main Street, Suite 705", "Sarasota, FL 34236", "(941) 269-1512"
- `©<span id="year"></span> Advida. All Rights Reserved.` → render `©{new Date().getFullYear()} Advida. All Rights Reserved.` (client or suppressHydrationWarning); "Privacy Policy" link
- 4 link columns (keep hrefs from fragment):
  - Managed Services: Google Ads, YouTube Ads, Social Ads
  - Success Stories: Microsoft, SmartAsset, LoopTV, Vici Wellness
  - Technology Services: Landing Page Optimization, Publisher Partnerships
  - Creative Studio Services: Product & Lifestyle Photography, User-Generated Content, Video Production, Video Editing, Direct Response Copywriting + `li.view > a` "and much more..." — clicking toggles `.more` items (hidden extra links in fragment) with slide down/up 300ms; text switches to "view less" and back
- The starfield behind the footer is the particle scene (not this component).

## ContactModal DOM (from contact-modal.html)
- `.contact-modal#contact-modal > .close` (img `/images/icons/close.svg`) + `.container#contact-modal-container > .contact-form-wrapper > .contact-form`
- Original form is an external embed; CLONE AS STATIC FORM identical to ContactSection's: h4 "Drop us a line, and we'll get in touch." + Full Name / Company Name / Your email address / How could we help you? / Send Now (pill). If ContactSection exports a reusable `ContactForm`, import it; otherwise duplicate markup (coordinate via `src/components/ContactForm.tsx` — you own this file).
- Visibility: CSS chunk keys off `body.contact-modal-open` (opacity/pointer-events) — port verbatim.
- Open: listen `on('modal:open')` → add `contact-modal-open` to body. Close: `.close` click, or click on the modal backdrop (`event.target === modal || event.target === container`) → remove class + `emit('modal:close')`.
- (SmoothScrollProvider listens to the same events to freeze scroll.)

## Assets
`/images/logo.svg`, social icon SVGs, `/images/icons/close.svg`.

## Responsive
Port footer.css (24 @media rules) + contact-modal.css verbatim.
