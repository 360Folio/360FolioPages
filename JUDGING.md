# Judging Rubric

Written **before** any direction was reviewed, so the verdict isn't reverse-engineered
from whichever result happened to look nicest first.

Each direction scored /5 per criterion. Weights reflect what actually determines
whether this template succeeds as a WordPress site that wins work.

| # | Criterion | Weight | What earns a 5 |
|---|-----------|--------|----------------|
| 1 | **Conversion architecture** | ×3 | Every page has one obvious primary action with a stated consequence. Proof (named institutional clients, real delivered work) is placed where hesitation happens, not dumped in a logo strip. Contact page removes friction rather than adding fields. |
| 2 | **Dense-content handling** | ×3 | The VR page's feature matrix, capability breakdown and standard-vs-optional distinction stay scannable and legible. Doesn't collapse into a wall or get thinned out to avoid the problem. Survives 360px. |
| 3 | **WordPress fitness** | ×3 | Namespaced, byte-identical header/footer, single `<main>`, forms swappable, repeat units genuinely loopable, nav is a plain nested list, no index-dependent styling, no absolute paths. Cheap to cut into a theme. |
| 4 | **Animation slot judgement** | ×2 | Slot is placed where it serves the conversion goal, sized so the real scene drops in with zero layout shift, and the placeholder reads as designed intent. Placement is *argued*, not defaulted to "under the hero". |
| 5 | **Craft** | ×2 | Type scale, spacing rhythm, colour discipline, alignment. Looks like a studio that sells immersive work built it. No stock-template tells. |
| 6 | **Content integrity** | ×2 | Substance preserved, dead 2006-era references cut, **no invented statistics**, typos fixed, claims defensible to a procurement officer. |
| 7 | **Extensibility to 11 more pages** | ×1 | The remaining pages are obviously mechanical from the parts provided. Component set is complete enough. |
| 8 | **Accessibility & robustness** | ×1 | Keyboard paths, focus states, `prefers-reduced-motion`, semantics, landmarks, alt text. |

Max 85.

## Automatic deductions

- **−10** Wrote actual Three.js scene code in the animation slot (brief violated; the
  spec doesn't exist yet, so any scene built now is wasted work that must be undone).
- **−10** Fabricated a statistic or attributed a number to a source.
- **−5** Header/footer markup differs between pages.
- **−5** Any absolute or root-relative asset path.
- **−5** Lorem ipsum present.

## Verification method

Not judged on the agents' self-reports. For each direction I check directly:
`diff` the header/footer blocks across the three pages · grep for `data-anim-canvas`
contents, absolute paths, non-namespaced classes, `lorem` · grep for digit-bearing
claims and check them against `old-site-content.md` · read the CSS token block and
the densest section of `virtual-reality.html` · render all three at 360px and 1440px.

## Output

A comparison table with scores, the strongest single idea from each direction worth
salvaging regardless of which wins, and one recommendation with the case for it stated
in plain terms — including what picking it costs.
