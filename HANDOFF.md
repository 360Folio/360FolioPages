# 360Folio WordPress Template — Handoff / Recall Document

**Purpose:** everything needed to pick this work up on another computer after the
project folder is copied across. Read this first, then `BRIEF.md` (the design
brief the three directions were built to) and `VERDICT.md` (the scored comparison).

**Last updated:** 2026-07-30 · matches git commit `2660a81`.

---

## 1. What this is, in one paragraph

A **static HTML/CSS/JS template set** for the 360Folio website, to be cut into a
WordPress theme later. It is **not** the React/Vite app that occupies the rest of
this repo (`src/`, `public/`, etc.) — that is a separate, older track described in
the top-level `CLAUDE.md`. This work lives entirely under `wp-template/` and shares
no code with the React site. Three competing **design directions** were built, one
was recommended (C), and all three are being carried forward in parallel until the
client picks one.

---

## 2. How to run it (do this first on the new machine)

The pages are plain files, served by a throwaway static server. **No build step, no
npm install for this part.** From the repo root (`360folio-website/`):

```bash
python -m http.server 5191 --directory wp-template
```

Then open **http://localhost:5191** — that is the comparison hub (`wp-template/index.html`),
which links to every page in every direction.

- Python 3 is the only requirement. If `python` is not found, try `python3` or `py -3`.
- The server is disposable and **dies when the process stops** — restart it with the
  same command whenever the pages stop responding. It does not need to stay running
  to edit files.
- A launch config also exists at `.claude/launch.json` under the name `wp-template`
  (Claude Code's preview tooling uses it), but the raw command above is all a human needs.

**Cache gotcha:** browsers and preview panes cache the stylesheet aggressively. Every
`<link>`/`<script>` is versioned (`system.css?v=12`, `main.js?v=12`). After editing
CSS/JS, bump the version across all pages (see §7) or hard-reload (Ctrl+Shift+R). The
current version is **v=12**.

---

## 3. Git state — READ THIS

- The repo **is** under version control (`git init` was run mid-project). History is
  intact; the latest 360Folio work is on the current branch.
- **There is no remote.** Nothing has been pushed anywhere. The commits exist only in
  this folder. When you copy the folder, the `.git/` directory comes with it and the
  full history transfers — *as long as you copy the whole folder including hidden files.*
- Author identity used for commits: `360Folio <360folio@gmail.com>`.
- Line-ending warnings (`LF will be replaced by CRLF`) on every commit are harmless
  Windows noise.

**Why version control matters here:** early in the project, before git existed, all
nine direction HTML files were destroyed by a bad in-place script (`open(f,'w')`
truncates before the read runs). They were rebuilt from the surviving CSS/JS. Do not
work without committing between meaningful steps.

To see the history: `git log --oneline`. Commit sequence, oldest first:

```
3957c77  Baseline: surviving design systems before HTML rebuild
af013e0  Rebuild direction C (technical)
1a97b1b  Rebuild direction A (cinematic)
3af4cc4  Rebuild direction B (editorial)
183940a  Add legend rule to B, update verdict
4d9a334  Correct verdict narrative to match rebuilt pages
f8e0519  Add Services and Work pages to all three directions
8205e8a  Replace Wikipedia-derived project copy, label filter status, update hub
958490f  Fix work filter: hidden cards stayed visible
d91a3af  Fix one-word-per-line wrapping in the checks list
a908162  Give C's six capture formats alternating animated diagrams
8b62516  Hover-trigger C's format diagrams, swap its home section-head sizes
2660a81  Add the About page to all three directions   ← current HEAD
```

---

## 4. The three directions and the verdict

| Dir | Folder | Character | Score | Default edition |
|-----|--------|-----------|-------|-----------------|
| **A** | `direction-a-cinematic` | Dark, staged, atmospheric. Signature idea: a `.f360-paper` "lightbox" region for dense/checkable content, nested in the dark shell. | 63 / 85 | dark |
| **B** | `direction-b-editorial` | Serif, 12-column, numbered spreads, running head, live office clocks. Strongest craft. | 70 / 85 | light |
| **C** | `direction-c-technical` | **RECOMMENDED.** A specification sheet — mono labels, crop marks, readout tables. Only direction that solved the dense-content problem with a filterable feature matrix. | **81 / 85** | dark |

Full scoring rationale is in `VERDICT.md`. The recommendation is C; its weakness is
that it is cold, which puts weight on the (still-unbuilt) animation scenes. No
decision has been locked in — all three are maintained.

Each direction has its own **self-contained** `assets/css/system.css` and
`assets/js/main.js`. They share no files. Class names are all namespaced `f360-`.
The class *vocabulary differs per direction* — do not assume a class from C exists in
A. When extending a direction, read its own CSS to find the components it already has.

---

## 5. Page inventory — 18 pages, 6 per direction

Each direction has: `index.html` (Home), `services.html`, `virtual-reality.html`,
`work.html`, `about.html`, `contact.html`.

The brief defines a **14-page final site**. Built so far (×3 directions):

| Built | File | Notes |
|-------|------|-------|
| ✅ Home | `index.html` | |
| ✅ Services hub | `services.html` | 5 practices, 7 divisions |
| ✅ Virtual Reality | `virtual-reality.html` | The dense page — 33-feature spec |
| ✅ Work | `work.html` | Real 38-project archive from `projects.json` |
| ✅ About | `about.html` | From old "About Us" |
| ✅ Contact | `contact.html` | Form + 3 offices |
| ⬜ VR Benefits | `vr-benefits.html` | not built |
| ⬜ VR Features | `vr-features.html` | not built (VR page already carries the matrix) |
| ⬜ VR Process | `vr-process.html` | not built |
| ⬜ Interactive Software | `interactive-software.html` | not built |
| ⬜ Web Development | `web-development.html` | not built — **needs price confirmation** |
| ⬜ Web Hosting | `web-hosting.html` | not built — **needs Hilal Host + price confirmation** |
| ⬜ Careers | `careers.html` | not built — **needs job-listing confirmation** |
| ⬜ Clients | `clients.html` | not built — **needs client logo list** |

Nav links to the unbuilt pages already exist as dead hrefs, which is fine per the brief.

---

## 6. Architecture conventions — obey these when adding pages

These are non-negotiable because the pages become a WordPress theme.

1. **`f360-` namespace on every class.**
2. **Header and footer must be byte-identical across all pages in a direction** —
   they become `header.php` / `footer.php`. When generating a new page, the reliable
   method used all session is to **lift the chrome verbatim from that direction's
   `index.html`** (everything from after `</head>` up to `<main…>`, and from `</main>`
   to `</body>`) rather than retyping it. A verification snippet checks this by MD5.
3. **One `<main>`, one `<h1>` per page.**
4. **Animation slot contract:** every page has exactly one, marked (not built):
   ```html
   <section class="f360-anim" id="anim-<page>" data-anim-slot="<page>" aria-label="Interactive animation">
     <div class="f360-anim__stage">
       <canvas class="f360-anim__canvas" data-anim-canvas hidden></canvas>
       <div class="f360-anim__placeholder" data-anim-placeholder> …designed empty state… </div>
     </div>
   </section>
   ```
   `data-anim-slot` values in use: `home`, `services`, `virtual-reality`, `work`,
   `about`, `contact`. **Write no Three.js scene code** — the scenes are a later,
   per-page spec. Placement of each slot is argued in an HTML comment above it.
5. **Repeating content = one loopable unit** marked `data-f360-repeat="project|plan|feature|office|client"`.
   No styling that depends on `:nth-child` or sibling count (WordPress reorders/deletes).
6. **Forms:** styled by class only, never by input order (they get swapped for Contact
   Form 7 / WPForms). `name` attributes match the old fields: Full Name, E-mail, Phone,
   Division, Department, Message. `data-f360-form="contact|careers|quote"` on the `<form>`.
7. **Relative asset paths only**, all under `assets/`.
8. **Light + dark both handled.** Each direction has an edition/scheme toggle in its
   header. C uses `data-f360-scheme` on `<html>`; A and B use `data-f360-theme`. The
   choice is stored in localStorage and applied before first paint by a tiny inline
   `<head>` script. **When adding components, use semantic tokens (e.g. `var(--f360-bg)`),
   never raw palette values** — hard-coded near-black backgrounds were the single most
   common bug this session, invisible in the day edition.

---

## 7. Bumping the asset version (after any CSS/JS edit)

All 15 direction pages reference `?v=N`. To bump N (defeats the cache), from `wp-template/`:

```bash
python - <<'PY'
import glob
OLD, NEW = '?v=12', '?v=13'
for f in glob.glob('direction-*/*.html'):
    s=open(f,encoding='utf-8').read()
    if OLD in s: open(f,'w',encoding='utf-8',newline='\n').write(s.replace(OLD,NEW))
print('bumped', OLD, '->', NEW)
PY
```

Keep the number consistent across a direction's pages. Current value: **v=12**.

---

## 8. Data & content sources

- **`../old-site-content.md`** — scrape of the old site (`old.360folio.com`). Source
  of truth for all copy. Contains 26 site pages + 38 project pages. Read the relevant
  section before writing a page; **do not invent statistics** (the brief forbids it —
  the old site's 2006-era stats were dropped deliberately).
- **`wp-template/projects.json`** — the 38 projects, extracted and normalised (name,
  client, location, software, service, dates, `about`, and `tags`). Drives all three
  `work.html` pages. If you regenerate the work pages, the generator script logic is
  documented in the "Add Services and Work" commit; tags are `tour / cgi / objects /
  video / gigapixel` and counts are 28 / 5 / 4 / 3 / 3 (projects can carry several).
- **Logo assets** live in each direction's `assets/img/` and in `wp-template/shared/img/`.
  Six files each: `360folio-logo{,-dark}.png` (wordmark, headers),
  `360folio-lockup{,-dark}.png` (wordmark + tagline, footers), `360folio-icon{,-dark}.png`.
  The `-dark` variants lift the black "Folio" ink to near-white for dark backgrounds;
  brand red is untouched. Generated from `../public/Logo.png` and `../public/logotag_high.png`.

---

## 9. Notable implementation details / gotchas learned this session

- **`[hidden] { display: none !important; }`** is in every direction's reset. Reason:
  a bare `[hidden]` attribute selector loses to any class that sets `display` (e.g.
  `.f360-card { display:flex }`), so filtered-out cards stayed visible. If you add a
  JS filter that toggles `hidden`, this reset is what makes it work.
- **C's feature-matrix JS is generalised** to also drive the Work archive filter. In
  `direction-c-technical/assets/js/main.js`, the matrix reads `data-tier` (space-
  separated, multiple allowed), derives counts from the DOM, and takes an optional
  `data-f360-matrix-noun` (e.g. "projects") so the status line reads correctly. The
  filter button label is read from the button, not the raw slug.
- **`.f360-checks` items are flow text with an absolutely-positioned marker, not a grid.**
  Each item is `<b>Label</b> — description`; a two-column grid put the bare description
  text node into the 18px marker column and shredded it to one word per line. Don't
  convert it back to a grid.
- **C home page section-head sizes are swapped** (numbered label large, sentence small)
  scoped to `body.f360-body-home` and `.f360-sec__head` only — interior pages and the
  inline `.f360-sec__idx` labels in §04 keep the small size. About/Services pages carry
  their own body classes (`f360-body-about`, `f360-body-services`) which must NOT get
  the home swap.
- **C's six capture-format diagrams** (`.f360-fmt` rows on the VR page) animate **on
  hover / focus-within**, alternating sides via an explicit `.f360-fmt--flip` modifier
  (never `:nth-child`). Pure CSS, no canvas — this is ambient motion, distinct from the
  reserved animation slot. All animations stop under `prefers-reduced-motion`.
- **A had four hard-coded dark backgrounds** (submenu, mobile nav, header scrim, sticky
  header) fixed to use tokens so they invert in the day edition. If you touch A's header
  CSS, keep them token-based.
- **Verification standard:** test against *rendered* output (computed `display`, actual
  line counts, composited contrast), not the DOM/JS property. Two bugs reached the user
  because a check asserted on `element.hidden` / `element.className` rather than what
  painted. A reusable browser-side sweep (contrast in both editions at 1280/375px, grid-
  overflow risk, horizontal scroll, broken images, byte-identical chrome) was used
  throughout; last full run was clean across 36 page/width combos.

---

## 10. Open questions — these BLOCK the remaining pages

Nothing below can be answered from the code; they need the client/owner:

1. **Client logo list** — the old Clients page scraped empty. Needed for `clients.html`.
   Known clients reverse-engineered from projects: Saudi Commission for Antiques &
   National Heritage, King Fahad Medical City, Habib University, Indus Hospital, PAF
   Museum, Capital Development Authority, Saudi Post, Lok Virsa Museum, Albwardi, Dairyland.
2. **Are the prices current?** Web dev plans, maintenance (USD 300 / 1,500), hosting
   (0–8.99/mo), semi-dedicated (14.99–36.99), VPS (17.99–49.99), 6 SSL tiers (29.99–599.99).
   All carried verbatim from the old site, unverified. Blocks `web-development.html`
   and `web-hosting.html`. Placeholder `TODO` comments mark where these appear.
3. **Hilal Host partnership** — the entire hosting section is built on it. If lapsed,
   the 5 hosting pages collapse.
4. **Real contact emails** — old site masked them (spambot protection). `info@360folio.com`
   is used as a **marked placeholder** throughout. Per-office addresses may differ.
5. **Job listings still open?** — Android, iOS, XML, Unity developer. XML reads dated.
   Blocks `careers.html`.
6. **WordPress build target** — Elementor/Divi (page builder) vs classic/Gutenberg
   custom theme changes how the markup is cut. Cheaper to decide before building the
   remaining 8 pages than to retrofit. Same for the form plugin (CF7 / WPForms / Gravity).

---

## 11. What to build next

Once §10 is answered, the remaining 8 pages (×3 directions) are mechanical — the
component sets are complete. Natural order:

- **Careers** and **Clients** first (each blocked on one answer: listings / logos).
- Then the service detail pages: **Interactive Software**, **Web Development**,
  **Web Hosting**, and the VR sub-pages (**VR Benefits / Features / Process**) —
  though the VR page already carries the full spec, so those three may be thin or merged.

The animation-slot scenes (Three.js/GSAP) are a **separate future task**, specced
per page. All slots are reserved at final size so a scene drops in with zero layout shift.

---

## 12. File map

```
360folio-website/                 ← repo root; run the server from here
├── old-site-content.md           ← content source of truth (26 + 38 pages)
├── CLAUDE.md                      ← describes the OTHER (React) track; mostly not relevant here
├── .claude/launch.json           ← has a "wp-template" preview config
└── wp-template/                  ← ALL of this work
    ├── HANDOFF.md                 ← this file
    ├── BRIEF.md                   ← the shared design brief (read after this)
    ├── JUDGING.md                 ← scoring rubric (written before review)
    ├── VERDICT.md                 ← scored 3-way comparison + recommendation
    ├── projects.json              ← 38 projects, structured
    ├── index.html                 ← comparison hub (start page at :5191)
    ├── shared/img/                ← logo assets (also copied into each direction)
    ├── direction-a-cinematic/     ← 6 pages + assets/{css,js,img}
    ├── direction-b-editorial/     ← 6 pages + assets/{css,js,img}
    └── direction-c-technical/     ← 6 pages + assets/{css,js,img}   ← recommended
```

Note: there is also a top-level `plans/` directory belonging to the React track
(per `CLAUDE.md`'s planning convention). It is **not** part of the wp-template work.
