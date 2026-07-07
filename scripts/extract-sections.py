#!/usr/bin/env python3
"""Split advida.com theme sources into per-section HTML fragments and CSS chunks.

Reads docs/research/advida.com/theme-src/{index.html,main.css} and writes
docs/research/advida.com/sections/<name>.html and <name>.css so each builder
agent gets exactly the markup + styles for its section.
"""
import re, os, sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "docs", "research", "advida.com")
SRC = os.path.join(ROOT, "theme-src")
OUT = os.path.join(ROOT, "sections")
os.makedirs(OUT, exist_ok=True)

html = open(os.path.join(SRC, "index.html")).read()
css = open(os.path.join(SRC, "main.css")).read()

# ---------- HTML fragment extraction (balanced tag scan) ----------

def extract_block(html, start_pat):
    m = re.search(start_pat, html)
    if not m:
        return None
    start = m.start()
    tag = re.match(r"<(\w+)", html[start:]).group(1)
    depth = 0
    for m2 in re.finditer(r"<(/?)%s\b[^>]*?(/?)>" % tag, html[start:]):
        if m2.group(2) == "/":
            continue
        if m2.group(1) == "/":
            depth -= 1
            if depth == 0:
                return html[start : start + m2.end()]
        else:
            depth += 1
    return None

FRAGMENTS = {
    "header": r'<div class="header"',
    "mobile-nav": r'<div class="mobile-nav"',
    "preloader": r'<div id="preloader"',
    "scroll-widget": r'<div class="scroll-wrapper"',
    "contact-modal": r'<div id="contact-modal"',
    "hero": r'<section class="hp-sec-1',
    "success-stories": r'<section class="hp-sec-2',
    "statistics": r'<section class="hp-sec-3',
    "core-services": r'<section class="hp-sec-4',
    "contact-section": r'<section class="hp-contact-section',
    "footer": r'<section class="footer',
}

for name, pat in FRAGMENTS.items():
    frag = extract_block(html, pat)
    if frag is None:
        print(f"!! {name}: NOT FOUND", file=sys.stderr)
        continue
    open(os.path.join(OUT, f"{name}.html"), "w").write(frag)
    print(f"{name}.html: {len(frag)} bytes")

# ---------- CSS chunk extraction ----------
# Tokenize top-level css into (selector, body) rules, preserving @media wrappers.

def parse_rules(text):
    rules = []  # (media_or_None, selector, full_rule_text)
    i, n = 0, len(text)
    while i < n:
        j = text.find("{", i)
        if j == -1:
            break
        sel = text[i:j].strip()
        # find matching close brace
        depth = 1
        k = j + 1
        while k < n and depth:
            if text[k] == "{":
                depth += 1
            elif text[k] == "}":
                depth -= 1
            k += 1
        body = text[j + 1 : k - 1]
        if sel.startswith("@media"):
            for m, s, r in parse_rules(body):
                rules.append((sel, s, r))
        elif sel.startswith("@"):
            rules.append((None, sel, text[i:k]))
        else:
            rules.append((None, sel, text[i:k]))
        i = k
    return rules

ALL_RULES = parse_rules(css)

CSS_CHUNKS = {
    "header": [".header", ".mega-menu", ".menu-active", ".hamburger"],
    "mobile-nav": [".mobile-nav", "body.nav-active"],
    "preloader": ["#preloader", "#loader"],
    "scroll-widget": [".scroll-wrapper", ".circle-fill", ".circle-bg"],
    "contact-modal": [".contact-modal", "body.contact-modal-open"],
    "hero": [".hp-sec-1", ".scroll-to"],
    "success-stories": [".hp-sec-2", ".slider", ".animation-wrap", ".case-studies", ".swiper-1"],
    "statistics": [".hp-sec-3", ".statistics", ".odometer"],
    "core-services": [".hp-sec-4", ".check"],
    "contact-section": [".hp-contact-section", ".swiper-2", ".brands", ".follow"],
    "footer": [".footer"],
    "shared": [".left-text-wrapper", ".container", ".word_inner", ".p_inner", ".btn", ".arrow-btn", ".title-anim"],
}

def sel_matches(selector, tokens):
    return any(re.search(re.escape(t) + r"(?![\w-])", selector) for t in tokens)

for name, tokens in CSS_CHUNKS.items():
    out_plain, out_media = [], {}
    for media, sel, rule in ALL_RULES:
        if sel and sel_matches(sel, tokens):
            if media:
                out_media.setdefault(media, []).append(rule)
            else:
                out_plain.append(rule)
    parts = out_plain[:]
    for media, rs in out_media.items():
        parts.append(media + " {\n" + "\n".join(rs) + "\n}")
    chunk = "\n".join(parts)
    open(os.path.join(OUT, f"{name}.css"), "w").write(chunk)
    print(f"{name}.css: {len(chunk)} bytes, {len(out_plain)} rules + {sum(len(v) for v in out_media.values())} media rules")
