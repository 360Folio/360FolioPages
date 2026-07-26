# Verdict — three design directions

Scored against `JUDGING.md`, which was written before any direction was reviewed.

## Disclosure first

The three design agents were all killed mid-run by a monthly spend limit. Before
judging I repaired what that left behind:

- **B** shipped `virtual-reality.html` and `contact.html` with literal `@@HEADER@@`
  / `@@FOOTER@@` placeholders — no chrome at all. I substituted its own header and
  footer from `index.html`.
- **B** was missing the `.f360-spreads` rule; **C** was missing `.f360-head__bar`.
  Both added.
- **C** had no `contact.html`. **I wrote it**, not the agent.
- All three had invented placeholder logo SVGs. Replaced with the real brand
  lockup in every header and footer.
- **C**'s breadcrumbs rendered with visible list markers (`1. HOME2. / CONTACT`)
  because its reset only targets `ol[class]` and the breadcrumb `<ol>` is bare.
  Fixed in CSS.

So C's contact page is my work. Where that affects a score I have said so, and the
recommendation does not rest on it — C wins on the two pages its own agent wrote.

## Addendum — light/dark on all three

After judging, a light/dark switch was added to every direction, so there are six
looks to choose between rather than three. This did not change the ranking, because
it landed on all three equally:

- **C** already had a working control in its header. Untouched.
- **B** already had the palettes and the JavaScript, and a control — but only in the
  footer colophon, where nobody would find it. It gained a second control in the
  masthead, and its handler was widened from "the first toggle on the page" to
  "every toggle", so the two can never disagree.
- **A** had no theme system at all: dark shell, with a light `.f360-paper` region
  class. Since that paper palette was already just the light values of the semantic
  tokens, promoting it to `:root` turned the whole site over without touching a
  single component rule. Seven hard-coded night values had to be tokenised first —
  those were the only things preventing a clean inversion.

All three now default to the visitor's system setting, remember an explicit choice,
and apply it before first paint so the wrong edition never flashes.

## Scores

| # | Criterion | × | A cinematic | B editorial | C technical |
|---|-----------|---|---|---|---|
| 1 | Conversion architecture | 3 | 4 | 4 | **5** |
| 2 | Dense-content handling | 3 | 2 | 3 | **5** |
| 3 | WordPress fitness | 3 | 4 | 4 | **5** |
| 4 | Animation slot judgement | 2 | 3 | 3 | **5** |
| 5 | Craft | 2 | 4 | **5** | 4 |
| 6 | Content integrity | 2 | 3 | **5** | **5** |
| 7 | Extensibility to 11 more pages | 1 | 3 | 4 | **5** |
| 8 | Accessibility & robustness | 1 | **4** | **4** | 3 |
| | **Total /85** | | **57** | **67** | **81** |

No automatic deductions applied to any direction: no absolute paths, no lorem, no
Three.js scene code written into the animation slots, no fabricated statistics, and
after repair all three have byte-identical chrome across their pages.

## What decided it

**Dense-content handling was the separator, and it is the real problem this site
has.** The source VR Features page is roughly 40 accordion items split into standard
and optional; five hosting pages are nothing but pricing tiers.

- **A thinned the problem out** — 18 feature items against the source's 33, six
  accordions, and the standard-vs-optional distinction almost absent. The page reads
  well because it dropped the hard part.
- **B kept the substance** (41 feature items) but largely lost the standard-vs-
  optional distinction, which is exactly the thing a buyer needs in order to
  understand what a quote will cost.
- **C solved it.** All 33 features, each an accordion, inside a filterable matrix
  with a standard/optional legend, live per-group counts, an expand-all control and
  a comparison table — 23 standard and 24 optional markings. It is the only
  direction that treats the specification as a feature rather than a burden.

**C also thinks in WordPress natively.** Its form carries the comment "styled and
wired by class only — never by input index — because these fields get replaced
wholesale by Contact Form 7 / WPForms". Its `data-f360-repeat="office|client|feature"`
markers say exactly which units become loops. Its inline scheme script is annotated
with where it goes in `header.php`. That is a template built by someone imagining
the theme cut, not just the page.

**On the animation slots**, C is the only direction that *argues* placement rather
than defaulting to "under the hero" — and it does so on the page its own agent
wrote, not just mine. Its home slot sits under the hero with a stated reason: a spec
sheet has to prove the thing is worth specifying, so this is the one element felt
rather than read. All three reserve space, but only C states min/max bounds and
"no layout shift on canvas swap".

## What picking C costs you

C is cold. The company sells *immersive experience* and the tagline is "Experience
The Reality" — and C's aesthetic is an instrument panel: mono labels, crop marks,
readout tables. B's editorial layout and A's cinematic staging both sell the
*feeling* of the product better than C does. C sells the *rigour*.

That trade is defensible here, because the buyers in the client list are procurement
officers at heritage commissions, hospitals, universities and government
authorities. Those people are reassured by specifications. But it puts real weight
on the animation sections: they now carry the entire emotional load of the site. If
those scenes are not excellent, C reads like a datasheet vendor.

## Worth salvaging regardless of the winner

1. **From B — the "Sourced" figures panel.** It states plainly: *every number here
   describes 360Folio's own delivered work or published capability; we do not quote
   third-party market statistics we cannot stand behind* — then lists only
   verifiable figures (since 2013, 38 archived projects, 3.1 GP largest panorama,
   60 MP floor, 3 offices). The old site leaned on 2006-era Clickz and Pew
   statistics. This panel is the correct replacement and should go into C verbatim.
2. **From A — the `.f360-paper` token inversion.** A light "document" region nested
   inside the dark shell, where every component re-renders correctly with no
   per-component overrides, because they all read semantic tokens only. If C's
   spec-sheet density ever needs a warmer reading mode, this is the mechanism.
3. **From B — "If a quote is not what you came for."** A contact-page section for
   visitors who are not buying today. C's contact page does not have this yet.

## Recommendation

**Build on C.** Port B's sourced-figures panel into it, and treat C's coldness as a
brief for the animation sections rather than a flaw to design away.

Fix before extending: C has one `:focus-visible` rule against A's and B's four —
its keyboard focus story is the weakest of the three and needs work before eleven
more pages inherit it.
