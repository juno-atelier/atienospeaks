# Atienospeaks — A Voice With Purpose

A single-page, animated portfolio for a legal professional, writer and founder.
Vanilla **HTML5 + CSS3 + ES6 modules**, enhanced with **GSAP ScrollTrigger**
and **Anime.js** (all self-hosted in `vendor/`). Navy/gold brand,
MODEL/DRY architecture — token-first CSS, plugin-registry JS, guarded
self-registering modules.

---

## Run it on Ubuntu

The JS uses ES modules and `fetch`-free progressive enhancement, but
`<script type="module">` still needs a web server (modules are blocked on
`file://`). The content and styling render fine from a file, but for the
animations you must serve it:

```bash
cd atienospeaks

# Option 1 — Python (already on Ubuntu)
python3 -m http.server 8000
# → open http://localhost:8000

# Option 2 — Node
npx serve .

# Option 3 — VS Code: right-click index.html → "Open with Live Server"
```

> Opening `index.html` by double-click shows the full styled page, but the
> browser disables ES modules on `file://`, so the motion stays off. Use a
> server to see everything.

---

## Structure

```
atienospeaks/
├── index.html              — the whole page (nav + 6 sections + footer inline)
├── css/
│   ├── tokens.css          — ★ ALL design values (retheme from here)
│   ├── reset.css           — normalisation
│   ├── global.css          — shared layout, buttons, cards, reveal base
│   ├── navbar.css          — sticky nav + mobile drawer
│   ├── footer.css          — footer + scroll-to-top FAB
│   └── home.css            — the six section layouts
├── js/
│   ├── utils.js            — ★ qs/qsa/on/debounce/ready/prefersReducedMotion
│   ├── plugins.js          — ★ register() + runAll() registry
│   ├── main.js             — orchestrator (one import line per module)
│   └── modules/
│       ├── nav.js          — sticky + drawer + scroll-spy
│       ├── reveal.js       — GSAP line-reveals + fade-ups  (the Anchor)
│       ├── parallax.js     — GSAP parallax drift (hero cut-out)
│       ├── journey.js      — GSAP pinned courthouse-corridor dolly (gallery fallback)
│       ├── counters.js     — GSAP stat count-up (dormant — no [data-count] yet)
│       ├── library.js      — Anime.js gentle book lift + tilt (fine pointers)
│       ├── micro.js        — Anime.js hero intro + swoosh draw-in
│       ├── fab.js          — scroll-to-top
│       └── sw.js           — service-worker registration
├── vendor/                 — gsap, ScrollTrigger, anime (self-hosted)
├── assets/
│   ├── img/                — logo, portrait (webp+jpg), books/ (4 cover cut-outs, webp+png)
│   └── textures/wood.svg   — procedural wood grain for Reflections
├── sw.js                   — service worker (bump CACHE_NAME on asset change)
├── _headers                — Cloudflare Pages security headers + CSP
├── robots.txt · sitemap.xml
└── README.md
```

### Architecture rules (same as your Daniels build)
- **tokens.css only** holds colour/space/type values — no raw hex elsewhere.
- Every JS module imports helpers from `utils.js`, self-registers via
  `plugins.js`, and has an **early-return guard**. Adding a module = one import
  line in `main.js`.
- All animation respects `prefers-reduced-motion`. The gavel cursor only applies
  on fine pointers (`hover:hover and pointer:fine`) and falls back to system
  cursors under `forced-colors`.

---

## ★ What you still need to fill in (`[USER]`)

Search the project for `[USER]` and `[your` / `[Your` / `[replace` — every spot
is marked. Nothing biographical was invented.

| Where | Replace |
|------|---------|
| `assets/img/atieno-cutout.webp` + `.png` | Transparent cut-out portrait for the hero (412×379; a ≥2× export is sharper) |
| `index.html` Journey | Six milestone **years** (`20—`) and titles |
| `index.html` Professional | Current role badge + the practice paragraph & list |
| `index.html` Enterprise | Venture names and descriptions |
| `index.html` Reflections | Your own quotes/snippets (placeholders are generic) |
| `index.html` Contact/footer | Real email + social URLs (currently `#`) |
| `index.html` `<head>` | Real domain in canonical/OG, and the commented JSON-LD |
| `assets/img/books/` | Real covers in place (WebP + PNG, 560px tall). Add per-book links by wrapping each `.book`'s contents in `<a class="book-link">` |
| `assets/img/logo.*` | A true **vector SVG** logo is ideal (current is a trimmed PNG→WebP) |

**Book covers:** transparent cut-outs in `assets/img/books/` (WebP + PNG). Keep each
`<img>` `width`/`height` equal to the file's pixel size to avoid layout shift.

---

## Deploy (Cloudflare Pages — matches your stack)

- Build command: *(none — static)*
- Output directory: `/`
- `_headers` carries the CSP. Because the libraries are **self-hosted**,
  `script-src 'self'` stays strict — no CDN origins to allow.
- After changing any cached file, bump `CACHE_NAME` in `sw.js`
  (`atieno-v1` → `atieno-v2`).

---

## Handover (you commit yourself)

```bash
git init
git add .
git commit -m "feat: Atienospeaks animated portfolio (navy/gold, GSAP/Three/Anime)"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then connect the repo in Cloudflare Pages.
