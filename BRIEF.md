# 360Folio WordPress Template — Shared Design Brief

**This is the single source of truth for all competing design directions.**
Read it fully before writing any code. Source content: `../old-site-content.md`
(read the sections for the pages you are building; do not read the 38 project pages).

---

## 1. The company

**360Folio** — Immersive Media & Creative Technology Studio.
Tagline: **"Experience The Reality"**

A 360°/VR production and creative-technology studio operating since ~2013.
Real, delivered work: national museums, universities, hospitals, government
bodies, hotels, festivals. Clients include the Saudi Commission for Antiques &
National Heritage, King Fahad Medical City, Habib University, Indus Hospital,
Pakistan Air Force Museum, Capital Development Authority, Saudi Post.

**Offices (all three are real and should appear):**
- Karachi, PK — Suite # B-2/1 Maymar Flats, Sector ZA, Gulshan-e-Maymar · +92 333 389 4668 · +92 333 212 2470
- Riyadh, SA — 2nd Floor, Building No. 2869, Dammam Road, Ash Shuhada, Riyadh 13241 · +966 530 500 757
- Dallas, US — 11325 Pegasus St, Ste S201-15, Dallas, TX 75238 · +1 469 650 1458

**Divisions** (used in every form's Division dropdown):
Virtual Reality · VR Headsets · Augmented Reality · Interactive Software ·
Web Development · Web Hosting · Mobile Applications

**Departments** (form dropdown): Sales · Technical Support · Billing · Marketing · Management

**Brand assets available:** `../public/Logo.png`, `../public/icon_crop.png`
(icon_crop is the camera-icon "0" cut from the wordmark — usable as a standalone mark).

---

## 2. What you are building

A **static HTML/CSS/JS template set** that will later be cut up into a WordPress
theme. Not a React app. Not a build step. Plain files that open in a browser.

**Stack you may use:** HTML5, CSS (hand-written, no framework), vanilla JS,
**GSAP** (+ ScrollTrigger), **Three.js**. Load GSAP/Three from CDN `<script>` tags.

### Your deliverable (exactly this, nothing more)

```
wp-template/<your-direction-folder>/
├── DIRECTION.md              ← your rationale (see §7)
├── assets/
│   ├── css/system.css        ← design tokens + all shared components
│   ├── js/main.js            ← nav, scroll, accordions, form UX, GSAP setup
│   └── img/                  ← only if you generate SVGs; do not copy binaries
├── index.html                ← Home
├── virtual-reality.html      ← the densest service page (stress-tests the system)
└── contact.html              ← the conversion page
```

Three pages only. They must prove the design system handles: a marketing hero,
dense feature/spec content, pricing-style cards, long-form persuasion copy,
a multi-office contact block, and a form. Build them so the remaining 11 pages
are obviously mechanical to produce from the same parts.

---

## 3. The full page set (context — you build only 3 of these)

The old 26-page site is consolidated to **14 pages**:

| # | Page | File | Sourced from |
|---|------|------|--------------|
| 1 | Home | `index.html` | new — synthesised |
| 2 | Services overview | `services.html` | new — hub for 5 service pillars |
| 3 | **Virtual Reality** | `virtual-reality.html` | VR Overview + 360° Virtual Tours + CGI Virtual Tours + 360° Objects + 360° Videos + Gigapixels + Large-Format |
| 4 | VR Benefits | `vr-benefits.html` | VR Benefits |
| 5 | VR Features | `vr-features.html` | VR Features (the big 6-category accordion) |
| 6 | VR Process | `vr-process.html` | VR Process + quote form |
| 7 | Interactive Software | `interactive-software.html` | Interactive Software |
| 8 | Web Development | `web-development.html` | Design & Development + Web-Based Solutions + Maintenance & Upgrades |
| 9 | Web Hosting | `web-hosting.html` | Shared + Semi-Dedicated + VPS + Domain Names + SSL Certificates |
| 10 | Work | `work.html` | Works listing (project cards — grid of 38, data comes later) |
| 11 | About | `about.html` | About Us |
| 12 | Careers | `careers.html` | Careers + CV form |
| 13 | Clients | `clients.html` | Our Clients (logo wall) |
| 14 | **Contact** | `contact.html` | Contact + contact form |

Your nav must reflect all 14. Links to pages you didn't build are fine as dead hrefs.

---

## 4. THE ANIMATION SECTION — read this carefully

**Every page gets exactly one interactive animation section.** The specific
animation for each page will be designed later. Right now you **mark the slot**
and make it structurally correct — do NOT build the actual animation.

Use this exact markup contract on all three pages:

```html
<section class="f360-anim" id="anim-home" data-anim-slot="home" aria-label="Interactive animation">
  <div class="f360-anim__stage">
    <canvas class="f360-anim__canvas" data-anim-canvas hidden></canvas>
    <div class="f360-anim__placeholder" data-anim-placeholder>
      <span class="f360-anim__eyebrow">Interactive Animation Slot</span>
      <h2 class="f360-anim__title">Home — spec to be defined</h2>
      <p class="f360-anim__note">Three.js / GSAP scene mounts to [data-anim-canvas]. Full-bleed, ~90vh.</p>
    </div>
  </div>
</section>
```

Rules for the slot:
- `data-anim-slot` values: `home`, `virtual-reality`, `contact`.
- The placeholder must be **visibly and deliberately styled** — it is a designed
  empty state, not a grey box. It should read as "this is where the centrepiece
  goes" and should already sit correctly in the page rhythm at its final size.
- Reserve the real dimensions now (fixed aspect or vh-based) so nothing reflows
  when the canvas is dropped in later. No layout shift on swap.
- Place it where it earns the most: it is the page's single most expensive
  element, so it should support the primary conversion goal, not decorate.
  Argue your placement in DIRECTION.md.
- The canvas is `hidden` and empty. **Write no Three.js scene code.**

Ambient motion elsewhere on the page (GSAP scroll reveals, counters, hover
states, marquees, parallax) is encouraged and is *not* the animation section.

---

## 5. WordPress integration constraints (non-negotiable)

These pages get cut into a theme. Design accordingly.

1. **Namespace every class `f360-`.** Theme and plugin CSS will collide otherwise.
2. **Identical header and footer markup on all pages**, byte-for-byte — they
   become `header.php` / `footer.php`. No per-page variations in that markup.
3. Wrap page-unique content in a single `<main class="f360-main">…</main>`.
   Everything inside becomes the page template body.
4. **No CSS/JS build step.** One stylesheet, one script, plus CDN GSAP/Three.
   They will be `wp_enqueue_*`'d as-is.
5. **Relative asset paths only**, all under `assets/`. No absolute or root-relative
   paths — WordPress installs in subdirectories.
6. **Forms**: real semantic markup with `<label>`, `name` attributes matching the
   old fields (Full Name, E-mail, Phone, Division, Department, Message), plus
   `data-f360-form="contact|careers|quote"` on the `<form>`. They will be swapped
   for Contact Form 7 / WPForms — so style by class, never by DOM position, and
   never rely on JS that assumes a specific input order.
7. **Repeating content = one repeatable unit.** Project cards, pricing plans,
   feature rows, office cards, team members, client logos must each be a single
   self-contained block that a loop can output N times. Mark them
   `data-f360-repeat="project|plan|feature|office|client"`. No card whose styling
   depends on its index or on a sibling count.
8. Headings must be a clean single-`<h1>` outline — WP SEO plugins audit this.
9. Nav must survive becoming a `wp_nav_menu()`: a plain `<ul><li><a>` tree,
   with dropdowns as nested `<ul>`. No exotic nav DOM.
10. Content that would live in the WP editor must not be positioned by CSS that
    breaks when an editor adds an extra paragraph. Flow, don't pin.

---

## 6. Content rules

**Rewrite the copy for conversion; keep all the substance.**

- Preserve every service, capability, feature, plan name and price from the source.
- **Cut the dead references**: Adobe Flash, Internet Explorer, "presentation CDs",
  CD-ROM/DVD deliverables, Oculus Rift / Samsung Gear VR / Razer OSVR / Google
  Cardboard as current hardware, 2006 Pew/ClickZ statistics, "over 50% of adult
  Internet users have taken a virtual tour".
- **The stats block on VR Benefits is the biggest liability** — nearly all of it
  is 2006-era and some is self-contradictory. Replace it with credible,
  non-fabricated framing: outcome claims tied to the studio's own delivered work,
  or clearly-attributed current-era framing. **Do not invent statistics or
  attribute numbers to sources.** If you drop a claim, note it in DIRECTION.md.
- Modern hardware framing: Meta Quest, Apple Vision Pro, HTC Vive, WebXR in-browser.
- Fix the source's typos (`incorportated`, `Similrly`, `Cradboard`, `ofline`,
  `Match 2015`, `Dairlyland`, `mozaic`).
- Voice: confident, specific, concrete. This studio has shot national museums and
  a 3.1-gigapixel panorama of Islamabad — lead with proof, not adjectives.
- Every page needs a clear primary CTA and a stated secondary path. Say what
  happens after the click ("we reply the same day with a fixed quote" — the old
  site's own promise on VR Process, which is a strong, usable one).

---

## 7. DIRECTION.md — what to write

Keep it under 400 words. Cover:
1. **Name and one-line thesis** for your direction.
2. **Who it's optimised for** and the conversion logic — what the page is trying
   to make happen, and the mechanism.
3. **Where you placed the animation section and why.**
4. **Type scale, colour system, spacing rhythm** — the tokens, briefly.
5. **What you cut or changed factually** from the source copy.
6. **The riskiest decision you made**, stated plainly.

---

## 8. Quality bar

- Responsive: 360px → 1920px. Test the dense page hardest.
- Light **and** dark handled, or a single committed scheme you justify.
- Keyboard-navigable; visible focus states; `prefers-reduced-motion` respected
  on every GSAP animation you write.
- Semantic HTML. Real landmarks. Alt text.
- No lorem ipsum anywhere.
- No external requests except the GSAP/Three CDN and nothing else — no web fonts
  from Google; use system font stacks or a single self-hostable choice declared
  in DIRECTION.md.
- It must look like a studio that sells immersive experiences built it.
