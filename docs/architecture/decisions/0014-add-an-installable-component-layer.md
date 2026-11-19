# 14. Add an installable component layer, built as Web Components

Date: 2026-11-19

## Status

Accepted. Builds on [13. Genericize the design system into an independent
project](0013-genericize-the-design-system.md); does not revise it.

## Context

Through ADR 13, this repo had become a spec (`design.md`) plus a token layer (`tokens/`) plus a
conformance audit suite (`bin/design/`) — all aimed at an app that hand-builds its own UI and then
checks it against the spec. There was no installable component anywhere: no `.tsx`/`.jsx`/`.vue`,
no component dependency in `package.json`. Compared to Carbon, Material, or Primer — the systems
this project is explicitly trying to match the shape of — that's the real gap: those ship code you
import, not only a document you follow and an audit you run afterward.

The constraint that shaped the implementation choice: this project's own origin app, Human
Essentials, and its own contributor base (Ruby for Good, Rails/ERB-skewed volunteers) have no
React or Vue, and Human Essentials deliberately has no Node build step (its own ADR 0012). A
React-first or Vue-first component library would be unusable by this project's own flagship app
without adopting a new toolchain, and would raise the bar for the exact community that wrote
`design.md` to begin with. The stated goal — "any organization or application" — has to include
apps that look like Human Essentials, not only apps that already use a JS framework.

## Decision

1. Build the component layer as **Web Components, using [Lit](https://lit.dev)** for the reduced
   boilerplate over hand-written custom elements. This is a first for this repo: `lit` is its
   first runtime dependency, where `tokens/` and `bin/design/` have had none. The alternative
   (vanilla custom elements, zero dependencies) was rejected only because of how much more
   boilerplate it costs per component, not because Lit's output is any less portable — it compiles
   to standard custom elements, usable anywhere a custom element is.
2. Ship every component two ways: as an npm subpath import (`lit` external, shared across
   components) and as a single standalone file with `lit` bundled in, mirroring `bin/design/`'s
   existing "copy the file into your project" distribution pattern rather than inventing a new one.
3. Components consume design tokens exclusively as CSS custom properties
   (`tokens/tokens.css` — a new, plain, non-Tailwind-at-rule sibling to `tokens/theme.css`,
   generated from it, not hand-guessed) — never a hardcoded value — because custom properties are
   what Web Components can actually see across the shadow DOM boundary, and it's what makes
   `tokens/README.md`'s existing retheming checklist true for compiled components, not only for
   Tailwind classes in markup.
4. Build and prove exactly one component first — `<rfg-button>`, implementing `design.md`'s
   already-written Buttons and "Where a button goes" sections — before building a second, the same
   "one audit running end-to-end before a second" discipline `design-system-migration`'s own setup
   guidance already uses for the audit suite. React/Vue wrapper packages, a documentation/preview
   site, and pointing the existing audit suite at the new components are explicitly later work, not
   part of this decision.
5. Keep `package.json` without `"type": "module"`: `bin/design/`'s 24 existing audit scripts are
   CommonJS (`require`), and declaring the package ESM at the root would break every one of them.
   Build output uses the unambiguous `.mjs` extension instead.

## Consequences

An adopter can now `npm install` (or copy one file) and get a working, accessible control, instead
of hand-building one from prose and auditing it afterward — the gap this ADR exists to close.

The cost: this repo now has a real runtime dependency (`lit`) and a build step
(`tsup`/`esbuild`, plus `typescript` as a transitive tooling requirement) for the first time, where
everything before this was either zero-dependency audit scripts or a single CSS file. That's a
real increase in what "adopting this system" can mean, not a free addition.

This ADR does not claim the component layer is complete — one component exists. A
Storybook-based preview site (`@storybook/web-components-vite`, one story per documented
variant/state) is now in place, with the `@storybook/addon-a11y` addon running axe-core against
every story — verified against both a correct and a deliberately broken button (an icon-only
button with no `aria-label`) to confirm it actually catches the defect, not just that it's
configured. That gate is only enforced in the interactive dev server so far; CI
(`components-build`) only confirms the static build still compiles, not that every story stays
accessible — wiring `@storybook/test-runner` or an equivalent into CI is still open.

**Update, same day:** the audit suite is now pointed at the built Storybook site
(`bin/design/adapters/storybook/`), a third worked adapter alongside Rails and the reference app
— see `docs/portability/adapter-storybook.md`. Two of the three audits originally named here
(`wcag-audit.js`, `keyboard-audit.js`) are genuinely meaningful against an isolated component and
are wired into CI; the third (`button-audit.js`) turned out to audit page-header button-group
*composition*, which doesn't exist on a bare component story, so running it there is a vacuous
pass and it's deliberately left out, not hidden. Building this adapter also found and fixed a real
bug in `keyboard-audit.js` itself (a path/query-string comparison that silently skipped every
Storybook target) — a genuine adapter-contract gap, not something specific to this project,
verified non-regressing against the reference app's own 22/22 `known-outcomes.js` harness before
being trusted.

Still ahead: porting the rest of `design.md`'s ~25 documented components in roughly
Portable-tag-density order, and — eventually — migrating Human Essentials' own button-rendering
helper onto `<rfg-button>` as the real "any app" portability proof, the same role
`examples/reference-app` already played for the audit suite.

**Update, later the same project phase:** ten more components ported (status-pill, icon-tile,
avatar, card, flash-message, page-header, tabs, page-tabs, modal, popover — eleven total with
button). Two more real defects found by actually running axe-core against every story, not
assumed:

1. Status pill and flash message both put tone-coloured text on their own tone-tinted background,
   which drops below WCAG AA 4.5:1 for the four semantic tones — those tokens are measured to
   clear 4.5:1 against *pure* white only (danger by a 0.01 margin, `tokens/README.md`). Fixed to
   neutral-900 text, tone carried by the background/accent instead.
2. `<rfg-tabs>`'s `aria-controls`/`aria-labelledby` failed `aria-valid-attr-value`: the tablist
   was shadow-rendered, pointing at light-DOM `<rfg-tab-panel>` elements, and an ID reference
   can't reliably cross that boundary. Fixed by rendering `<rfg-tabs>` into light DOM instead
   (`createRenderRoot()` returns `this`) — the one component so far that doesn't use shadow DOM,
   and a real design constraint for any future component needing cross-element ARIA ID
   references, not a one-off.

`@floating-ui/dom` was added as a second runtime dependency, for `<rfg-popover>`'s viewport
flip/shift positioning — the same "prefer a correct, maintained implementation over reimplementing
a known-hard problem" reasoning this ADR already gives for `<dialog>` over a hand-rolled modal,
applied to collision detection instead of dialog mechanics.

**Update, next batch:** four more components (`field`, `error-summary`, `table`,
`date-range-picker` — fifteen total), covering `design.md`'s Forms, Tables, and Date range picker
sections. These three sections are the most Local-heavy remaining in the catalog, so each was
scoped deliberately rather than ported wholesale:

- `table` implements only the clearly Portable table primitives (scroll-not-squeeze, top-aligned
  cells, column-type classes); frozen columns, row selection, and batch-action bars are left out
  entirely, not merely unported — design.md's own tagging pass already calls that material "a
  single, fully-worked case study," not something to generalize.
- `date-range-picker` keeps the Portable interaction behaviors (commit-on-selection for presets,
  350ms debounce on custom edits, silent inversion correction) but takes `presets` as host-supplied
  data and emits a generic `rfg-change` event, rather than carrying over Human Essentials' specific
  server-computed presets and URL wire format.

The light-DOM fix from `<rfg-tabs>` recurred, with a new wrinkle: `<rfg-field>` needed the same
fix (a shadow-rendered `<label for>` can't label a light-DOM `<input>`), but the fix itself
introduced a second bug — `updated()` repositions the pre-existing control into the rendered
wrapper, which demotes it from a direct child to a grandchild, silently breaking a
`:scope > input`-scoped re-query watching for exactly that element. Fixed by querying the whole
subtree instead. Recorded as a general lesson for this codebase, not a one-off: a light-DOM
component that moves a pre-existing child must not assume that child stays at the same tree depth
on a later query.

`date-range-picker` also composes `<rfg-popover>` directly (rendering one in its own template)
rather than reimplementing anchored-panel behavior a third time — the first case of one component
in this layer reusing another's interaction logic rather than tokens/styling alone.

**Update, fourth batch:** five more components (`stats`, `numbered-step`, `callout`,
`disclosure`, `empty-state` — twenty total), covering design.md's Stats, Numbered steps,
Callouts, Disclosures, and Empty states sections, plus an explicit decision **not** to port
Charts: that section defers entirely to Highcharts ("Local: Highcharts, through
`shared/_highcharts`"), so there's no generic rule underneath it to extract — only usage
guidance (pair a chart with its table; one chart answers one question), which belongs in
`design.md`'s prose, not in a component.

Two more real defects found by axe-core, both fixed:

1. `<rfg-stats>`'s per-figure-count responsive column mapping was first written as an inline
   `style` binding containing `@media` rules — invalid; an inline `style` attribute can't contain
   an at-rule at all. Fixed by reflecting `count` as a host attribute and moving the `@media`
   rules into the component's real stylesheet, selected by `:host([count="n"])`.
2. `<rfg-callout>`'s `role="none"` case (opting out of the live-region role entirely, for plain
   page furniture) returned `undefined` from the role-computation method, which Lit's attribute
   binding turned into a literal `role=""` rather than removing the attribute — a different,
   wrong claim ("this has an empty role") from the intended one. Fixed with Lit's `nothing`
   sentinel, verified by checking `getAttribute("role")` actually returns `null`.

With this batch, every component in the originally-scoped Phase 5 ordering plus the newly
identified genuinely-portable remainder of the catalog is built, except Charts (out of scope by
design) and the handful of sections (Row actions, most of Filters, most of Conditional reveal)
this project's own tagging pass already calls worked case studies rather than generalizable
rules. Still ahead, named rather than assumed complete: Breadcrumbs, the conditional-reveal
show/hide mechanism, Filter bar, Pagination, and Tag input — concrete, buildable pieces
extracted from otherwise heavily-Local "mega-sections," not yet built.
