---
name: arville-design
description: Design system skill for arville. Activate when building UI components, pages, or any visual elements. Provides exact color tokens, typography scale, spacing grid, component patterns, and craft rules. Read references/DESIGN.md before writing any CSS or JSX.
---

# arville Design System

You are building UI for **arville**. Dark-themed, warm palette, sans-serif typography (Value Regular Arville), compact density on a 4px grid, expressive motion.

## Visual Reference

**IMPORTANT**: Study ALL screenshots below before writing any UI. Match colors, typography, spacing, layout, and motion exactly as shown.

### Homepage

![arville Homepage](screenshots/homepage.png)

> Read `references/DESIGN.md` for full token details.

## Design Philosophy

- **Layered depth** — use shadow tokens to create a sense of physical layering. Each elevation level has a specific shadow.
- **Gradient accents** — gradients are used thoughtfully for emphasis, not decoration.
- **Type pairing** — Value Regular Arville for body/UI text, swiper-icons for headings/display. Never introduce a third typeface.
- **compact density** — 4px base grid. Every dimension is a multiple of 4.
- **warm palette** — the color temperature runs warm, matching the sans-serif typography.
- **Restrained accent** — `#ffff00` is the only pop of color. Used exclusively for CTAs, links, focus rings, and active states.
- **Expressive motion** — animations are an integral part of the experience. Use spring physics and layout animations.

## Color System

### Core Palette

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Background | `--background` | `#000000` | Page/app background |
| Surface | `--surface` | `#333333` | Cards, panels, modals |
| Text Primary | `--text-primary` | `#ffffff` | Headings, body text |
| Text Muted | `--text-muted` | `#474141` | Captions, placeholders |
| Accent | `--accent` | `#ffff00` | CTAs, links, focus rings |
| Border | `--border` | `#242424` | Dividers, card borders |

### Status Colors

| Status | Hex | Use |
|--------|-----|-----|
| Success | `#7bdcb5` | Confirmations, positive trends |
| Warning | `#fcb900` | Caution states, pending items |
| Danger | `#f78da7` | Errors, destructive actions |

### Extended Palette

- **f-spinner-color-2:** `#11181c` — Deep background layer or shadow color
- **f-button-color:** `#374151`
- **fancybox-color:** `#dbdbdb`
- `#4d4d4d`
- **f-spinner-color-2:** `#bbbbbb`
- `#0091ff`
- **swiper-theme-color:** `#007aff`
- **wp--preset--color--cyan-bluish-gray:** `#abb8c3`

### CSS Variable Tokens

```css
--f-button-border: 0;
--f-button-border-radius: 0;
--f-button-border-radius: 4px;
--f-button-border-radius: 50%;
--f-button-border: 0;
--f-button-border-radius: 50%;
--f-thumb-border-radius: 2px;
--f-thumb-border-radius: 2px;
--f-button-border-radius: 0;
--primary-font: "Value Regular Arville";
--primary-font-medium: "Value Medium Arville";
--primary-font-bold: "Value Bold Arville";
--border-radius: 30px;
--border-radius: 15px;
--f-button-border: 0;
--f-button-border-radius: 0;
--f-button-border-radius: 4px;
--f-button-border-radius: 50%;
--f-button-border: 0;
--f-button-border-radius: 50%;
```

## Typography

### Font Stack

- **Value Regular Arville** — Heading 1, Heading 2, Heading 3
- **swiper-icons** — Body, Caption

### Font Sources

```css
@font-face {
  font-family: "Value Regular Arville";
  src: url("fonts/ValueRegularArville-Regular.otf") format("opentype");
  font-weight: 400;
}
@font-face {
  font-family: "Value Medium Arville";
  src: url("fonts/ValueMediumArville-500.otf") format("opentype");
  font-weight: 500;
}
@font-face {
  font-family: "Value Bold Arville";
  src: url("fonts/ValueBoldArville-600.otf") format("opentype");
  font-weight: 600;
}
@font-face {
  font-family: "swiper-icons";
  src: url("data:application/font-woff;charset=utf-8;base64, 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");
  font-weight: 400;
}
```

### Type Scale

| Role | Family | Size | Weight |
|------|--------|------|--------|
| Heading 1 | Value Regular Arville | 130px | 700 |
| Heading 2 | Value Regular Arville | 95px | 700 |
| Heading 3 | Value Regular Arville | 80px | 700 |
| Body | swiper-icons | 18px | 400 |
| Caption | swiper-icons | 16px | 400 |

### Typography Rules

- Body/UI: **Value Regular Arville**, Headings: **swiper-icons** — these are the only display fonts
- Max 3-4 font sizes per screen
- Headings: weight 600-700, body: weight 400
- Use color and opacity for text hierarchy, not additional font sizes
- Line height: 1.5 for body, 1.2 for headings

## Spacing & Layout

### Base Grid: 4px

Every dimension (margin, padding, gap, width, height) must be a multiple of **4px**.

### Spacing Scale

`2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 30` px

### Spacing as Meaning

| Spacing | Use |
|---------|-----|
| 4-8px | Tight: related items (icon + label, avatar + name) |
| 12-16px | Medium: between groups within a section |
| 24-32px | Wide: between distinct sections |
| 48px+ | Vast: major page section breaks |

### Border Radius

Scale: `1.4375rem, 2px, 4px, 26px, 30px, 36px`
Default: `26px`

### Container

Max-width: `1040px`, centered with auto margins.

### Breakpoints

| Name | Value |
|------|-------|
| md | 42.5rem |
| md | 47.5rem |
| md | 48rem |
| lg | 53.75rem |
| lg | 62rem |
| xl | 65rem |
| xl | 65.0625rem |
| xl | 75rem |
| xl | 80rem |
| 2xl | 100rem |
| xs | 400px |
| xs | 480px |
| sm | 512px |
| sm | 600px |
| sm | 601px |
| sm | 640px |
| md | 680px |
| md | 760px |
| md | 768px |
| lg | 769px |
| lg | 800px |
| lg | 960px |
| lg | 992px |
| lg | 993px |
| lg | 1024px |
| xl | 1040px |
| xl | 1041px |
| xl | 1080px |
| xl | 1181px |
| xl | 1200px |
| xl | 1240px |
| xl | 1260px |
| xl | 1280px |
| 2xl | 1420px |
| 2xl | 1460px |
| 2xl | 1480px |
| 2xl | 1530px |
| 2xl | 1920px |
| 2xl | 2200px |

Mobile-first: design for small screens, layer on responsive overrides.

## Component Patterns

### Card

```css
.card {
  background: #333333;
  border: 1px solid #242424;
  border-radius: 26px;
  padding: 16px;
  box-shadow: var(--f-button-shadow);
}
```

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</div>
```

### Button

```css
/* Primary */
.btn-primary {
  background: #ffff00;
  color: #ffffff;
  border-radius: 26px;
  padding: 8px 16px;
  font-weight: 500;
  transition: opacity 150ms ease;
}
.btn-primary:hover { opacity: 0.9; }

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid #242424;
  color: #ffffff;
  border-radius: 26px;
  padding: 8px 16px;
}
```

```html
<button class="btn-primary">Get Started</button>
<button class="btn-ghost">Learn More</button>
```

### Input

```css
.input {
  background: #000000;
  border: 1px solid #242424;
  border-radius: 26px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 14px;
}
.input:focus { border-color: #ffff00; outline: none; }
```

```html
<input class="input" type="text" placeholder="Search..." />
```

### Badge / Chip

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background: #333333;
  color: #474141;
}
```

```html
<span class="badge">New</span>
<span class="badge">Beta</span>
```

### Modal / Dialog

```css
.modal-backdrop { background: rgba(0, 0, 0, 0.6); }
.modal {
  background: #333333;
  border: 1px solid #242424;
  border-radius: 36px;
  padding: 24px;
  max-width: 480px;
  width: 90vw;
  box-shadow: 0 0 0 5px #19f;
}
```

```html
<div class="modal-backdrop">
  <div class="modal">
    <h2>Dialog Title</h2>
    <p>Dialog content.</p>
    <button class="btn-primary">Confirm</button>
    <button class="btn-ghost">Cancel</button>
  </div>
</div>
```

### Table

```css
.table { width: 100%; border-collapse: collapse; }
.table th {
  text-align: left;
  padding: 8px 12px;
  font-weight: 500;
  font-size: 12px;
  color: #474141;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #242424;
}
.table td {
  padding: 12px;
  border-bottom: 1px solid #242424;
}
```

```html
<table class="table">
  <thead><tr><th>Name</th><th>Status</th><th>Date</th></tr></thead>
  <tbody>
    <tr><td>Item One</td><td>Active</td><td>Jan 1</td></tr>
    <tr><td>Item Two</td><td>Pending</td><td>Jan 2</td></tr>
  </tbody>
</table>
```

### Navigation

```css
.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #242424;
}
.nav-link {
  color: #474141;
  padding: 8px 12px;
  border-radius: 26px;
  transition: color 150ms;
}
.nav-link:hover { color: #ffffff; }
.nav-link.active { color: #ffff00; }
```

```html
<nav class="nav">
  <a href="/" class="nav-link active">Home</a>
  <a href="/about" class="nav-link">About</a>
  <a href="/pricing" class="nav-link">Pricing</a>
  <button class="btn-primary" style="margin-left: auto">Get Started</button>
</nav>
```

### Extracted Components

These components were found in the codebase:

**Button** (`html`)

**Navigation** (`html`)

**Modal** (`html`)

## Page Structure

The following page sections were detected:

- **Navigation** — Top navigation bar (9 items)
- **Hero** — Hero/banner section with headline and CTAs
- **Footer** — Page footer with links and info (13 items)
- **Cta** — Call-to-action section
- **Testimonials** — Testimonials/reviews section

When building pages, follow this section order and structure.

## Animation & Motion

This project uses **expressive motion**. Animations are part of the design language.

### CSS Animations

- `f-spinner-rotate`
- `f-spinner-dash`
- `f-throwOutUp`
- `f-throwOutDown`
- `f-zoomInUp`

### Motion Tokens

- **Duration scale:** `150ms`, `200ms`, `250ms`, `330ms`, `350ms`, `400ms`, `600ms`, `700ms`, `800ms`, `1000ms`
- **Easing functions:** `ease`, `cubic-bezier(0.23,1,0.32,1)`, `linear`, `ease-out`

### Motion Guidelines

- **Duration:** Use values from the duration scale above. Short (150ms) for micro-interactions, long (1000ms) for page transitions
- **Easing:** Use `ease` as the default easing curve
- **Direction:** Elements enter from bottom/right, exit to top/left
- **Reduced motion:** Always respect `prefers-reduced-motion` — disable animations when set

## Depth & Elevation

### Shadow Tokens

- Subtle: `inset 0 0 0 var(--f-button-outline,2px) var(--f-button-outline-color,var(--f-button-color))`
- Raised (cards, buttons): `var(--f-button-shadow)`
- Raised (cards, buttons): `0 0 0 5px #19f`

### Z-Index Scale

`0, 1, 2, 3, 4, 5, 9, 10, 20, 30, 40, 99, 999, 9999`

Use these exact values — never invent z-index values.

## Anti-Patterns (Never Do)

- **No blur effects** — no backdrop-blur, no filter: blur()
- **No zebra striping** — tables and lists use borders for separation
- **No invented colors** — every hex value must come from the palette above
- **No arbitrary spacing** — every dimension is a multiple of 4px
- **No extra fonts** — only Value Regular Arville and swiper-icons are allowed
- **No arbitrary border-radius** — use the scale: 1.4375rem, 2px, 4px, 26px, 30px, 36px
- **No opacity for disabled states** — use muted colors instead

## Workflow

1. **Read** `references/DESIGN.md` before writing any UI code
2. **Pick colors** from the Color System section — never invent new ones
3. **Set typography** — Value Regular Arville, swiper-icons only, using the type scale
4. **Build layout** on the 4px grid — check every margin, padding, gap
5. **Match components** to patterns above before creating new ones
6. **Apply elevation** — use shadow tokens
7. **Validate** — every value traces back to a design token. No magic numbers.

## Brand Spec

- **Favicon:** `https://arville.com/wp-content/uploads/2025/01/favicon.svg`
- **Site URL:** `https://arville.com/`
- **Brand color:** `#ffff00`
- **Brand typeface:** Value Regular Arville

## Quick Reference

```
Background:     #000000
Surface:        #333333
Text:           #ffffff / #474141
Accent:         #ffff00
Border:         #242424
Font:           Value Regular Arville
Spacing:        4px grid
Radius:         26px
Components:     8 detected
```

## When to Trigger

Activate this skill when:
- Creating new components, pages, or visual elements for arville
- Writing CSS, Tailwind classes, styled-components, or inline styles
- Building page layouts, templates, or responsive designs
- Reviewing UI code for design consistency
- The user mentions "arville" design, style, UI, or theme
- Generating mockups, wireframes, or visual prototypes

---

# Full Reference Files

> Every output file is embedded below. Claude has full design system context from /skills alone.

## Design System Tokens (DESIGN.md)

# arville DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 20 · Fonts: 2 · Components: 8
> Icon library: not detected · State: not detected
> Primary theme: dark · Dark mode toggle: no · Motion: expressive

## Visual Reference

**Match this design exactly** — study colors, fonts, spacing, and component shapes before writing any UI code.

![arville Homepage](../screenshots/homepage.png)

---

## 1. Visual Theme & Atmosphere

This is a **dark-themed** interface with a warm tone. Depth is expressed through layered shadows and subtle surface color variation. Typography pairs **swiper-icons** for display/headings with **Value Regular Arville** for body text, creating clear visual hierarchy through type contrast. Spacing follows a **4px base grid** (compact density), with scale: 2, 4, 6, 8, 10, 12, 14, 16px. The accent color **#ffff00** anchors interactive elements (buttons, links, focus rings). Motion is expressive — spring physics, layout animations, and staggered reveals are part of the visual language.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| f-spinner-color-1 | `#000000` | background | Page background, darkest surface |
| surface | `#333333` | surface | Card and panel backgrounds |
| fancybox-hover-color | `#ffffff` | text-primary | Headings and body text |
| text-muted | `#474141` | text-muted | Captions, placeholders, secondary info |
| border | `#242424` | border | Dividers, card borders, outlines |
| accent | `#ffff00` | accent | CTAs, links, focus rings, active states |
| wp--preset--color--pale-pink | `#f78da7` | danger | Error states, destructive actions |
| wp--preset--color--light-green-cyan | `#7bdcb5` | success | Success states, positive indicators |
| wp--preset--color--luminous-vivid-amber | `#fcb900` | warning | Warning states, caution indicators |
| info | `#0091ff` | info | Informational highlights |
| f-spinner-color-2 | `#11181c` | unknown | Palette color |
| f-button-color | `#374151` | unknown | Palette color |
| fancybox-color | `#dbdbdb` | unknown | Palette color |
| unknown | `#4d4d4d` | unknown | Palette color |
| f-spinner-color-2 | `#bbbbbb` | unknown | Palette color |
| swiper-theme-color | `#007aff` | unknown | Palette color |
| wp--preset--color--cyan-bluish-gray | `#abb8c3` | unknown | Palette color |
| wp--preset--color--vivid-red | `#cf2e2e` | unknown | Palette color |
| wp--preset--color--luminous-vivid-orange | `#ff6900` | unknown | Palette color |
| wp--preset--color--vivid-green-cyan | `#00d084` | unknown | Palette color |

### CSS Variable Tokens

```css
--f-button-border: 0;
--f-button-border-radius: 0;
--f-button-border-radius: 4px;
--f-button-border-radius: 50%;
--f-button-border: 0;
--f-button-border-radius: 50%;
--f-thumb-border-radius: 2px;
--f-thumb-border-radius: 2px;
--f-button-border-radius: 0;
--primary-font: "Value Regular Arville";
--primary-font-medium: "Value Medium Arville";
--primary-font-bold: "Value Bold Arville";
--border-radius: 30px;
--border-radius: 15px;
--f-button-border: 0;
--f-button-border-radius: 0;
--f-button-border-radius: 4px;
--f-button-border-radius: 50%;
--f-button-border: 0;
--f-button-border-radius: 50%;
```


---

## 3. Typography Rules

**Font Stack:**
- **Value Regular Arville** — Heading 1, Heading 2, Heading 3
- **swiper-icons** — Body, Caption

**Font Sources:**

```css
@font-face {
  font-family: "Value Regular Arville";
  src: url("fonts/ValueRegularArville-Regular.otf") format("opentype");
  font-weight: 400;
}
@font-face {
  font-family: "Value Medium Arville";
  src: url("fonts/ValueMediumArville-500.otf") format("opentype");
  font-weight: 500;
}
@font-face {
  font-family: "Value Bold Arville";
  src: url("fonts/ValueBoldArville-600.otf") format("opentype");
  font-weight: 600;
}
@font-face {
  font-family: "swiper-icons";
  src: url("data:application/font-woff;charset=utf-8;base64, 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");
  font-weight: 400;
}
```

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | Value Regular Arville | 130px | 700 |
| Heading 2 | Value Regular Arville | 95px | 700 |
| Heading 3 | Value Regular Arville | 80px | 700 |
| Body | swiper-icons | 18px | 400 |
| Caption | swiper-icons | 16px | 400 |

**Typographic Rules:**
- Limit to 2 font families max per screen
- Use **Value Regular Arville** for body/UI text, **swiper-icons** for display/headings
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

### Layout (1)

**Footer** — `html`

### Navigation (1)

**Navigation** — `html`

### Data Display (1)

**List** — `html`

### Data Input (2)

**Button** — `html`
- Animation: 

**Input** — `html`
- State: :focus, :placeholder

### Overlay (1)

**Modal** — `html`

### Media (2)

**Image** — `html`

**Icon** — `html`



---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 30
- **Border radius:** 1.4375rem, 2px, 4px, 26px, 30px, 36px
- **Max content width:** 1040px

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

### Flat — subtle depth hints

- `inset 0 0 0 var(--f-button-outline,2px) var(--f-button-outline-color,var(--f-button-color))`

### Raised — cards, buttons, interactive elements

- `var(--f-button-shadow)`
- `0 0 0 5px #19f`

### Z-Index Scale

`0, 1, 2, 3, 4, 5, 9, 10, 20, 30, 40, 99, 999, 9999`



---

## 7. Animation & Motion

This project uses **expressive motion**. Animations are an integral part of the experience.

### CSS Animations

- `@keyframes f-spinner-rotate`
- `@keyframes f-spinner-dash`
- `@keyframes f-throwOutUp`
- `@keyframes f-throwOutDown`
- `@keyframes f-zoomInUp`
- `@keyframes f-zoomOutDown`
- `@keyframes f-fadeIn`
- `@keyframes f-fadeOut`

### Animated Components

- **Button**: 

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use `#ffff00` for interactive elements (buttons, links, focus rings)
- Use `#000000` as the primary page background
- Pair **Value Regular Arville** (body) with **swiper-icons** (display) — these are the only allowed fonts
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use the defined shadow tokens for elevation — see Section 6
- Use border-radius from the scale: 1.4375rem, 2px, 4px, 26px, 30px
- Reuse existing components from Section 4 before creating new ones

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't introduce additional font families beyond Value Regular Arville and swiper-icons
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't create custom box-shadow values outside the system tokens
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't duplicate component patterns — check Section 4 first
- Don't use backdrop-blur or blur effects

### Anti-Patterns (detected from codebase)

- No blur or backdrop-blur effects
- No zebra striping on tables/lists


---

## 9. Responsive Behavior

| Name | Value | Source |
|---|---|---|
| md | 42.5rem | css |
| md | 47.5rem | css |
| md | 48rem | css |
| lg | 53.75rem | css |
| lg | 62rem | css |
| xl | 65rem | css |
| xl | 65.0625rem | css |
| xl | 75rem | css |
| xl | 80rem | css |
| 2xl | 100rem | css |
| xs | 400px | css |
| xs | 480px | css |
| sm | 512px | css |
| sm | 600px | css |
| sm | 601px | css |
| sm | 640px | css |
| md | 680px | css |
| md | 760px | css |
| md | 768px | css |
| lg | 769px | css |
| lg | 800px | css |
| lg | 960px | css |
| lg | 992px | css |
| lg | 993px | css |
| lg | 1024px | css |
| xl | 1040px | css |
| xl | 1041px | css |
| xl | 1080px | css |
| xl | 1181px | css |
| xl | 1200px | css |
| xl | 1240px | css |
| xl | 1260px | css |
| xl | 1280px | css |
| 2xl | 1420px | css |
| 2xl | 1460px | css |
| 2xl | 1480px | css |
| 2xl | 1530px | css |
| 2xl | 1920px | css |
| 2xl | 2200px | css |

**Approach:** Use `@media (min-width: ...)` queries matching the breakpoints above.


---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: #333333
Border: 1px solid #242424
Radius: 26px
Padding: 16px
Font: Value Regular Arville
Use shadow tokens from Section 6.
```

### Build a Button

```
Primary: bg #ffff00, text white
Ghost: bg transparent, border #242424
Padding: 8px 16px
Radius: 26px
Hover: opacity 0.9 or lighter shade
Focus: ring with #ffff00
```

### Build a Page Layout

```
Background: #000000
Max-width: 1040px, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: #333333
Label: #474141 (muted, 12px, uppercase)
Value: #ffffff (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: #000000
Input border: 1px solid #242424
Focus: border-color #ffff00
Label: #474141 12px
Spacing: 16px between fields
Radius: 26px
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: Value Regular Arville, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: shadow tokens
```

## Bundled Fonts (fonts/)

The following font files are bundled in the `fonts/` directory:

- `fonts/ValueBoldArville-600.otf`
- `fonts/ValueMediumArville-500.otf`
- `fonts/ValueRegularArville-Regular.otf`

Use these local font files in `@font-face` declarations instead of fetching from Google Fonts.

## Homepage Screenshots (screenshots/)

![homepage.png](screenshots/homepage.png)

