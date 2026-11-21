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
rules. Still ahead at that point: Breadcrumbs, the conditional-reveal show/hide mechanism, Filter
bar, Pagination, and Tag input — concrete, buildable pieces extracted from otherwise
heavily-Local "mega-sections."

**Update, fifth and final batch:** those five built (`breadcrumbs`, `conditional-reveal`,
`filter-bar`, `pagination`, `tag-input` — twenty-five components total). This completes every
genuinely portable component in `design.md`'s catalog; Charts remains the one deliberate
exclusion.

Two things worth recording from this batch specifically:

1. `<rfg-filter-bar>` composes `<rfg-disclosure>` for its fold-behind-a-trigger case (>2
   controls) rather than reimplementing toggle behavior a second time — the same reuse pattern
   `<rfg-date-range-picker>` established with `<rfg-popover>`. Verified in a real browser: two
   controls render with no disclosure wrapper at all; four render behind one.
2. `<rfg-tag-input>` is this layer's first **form-associated custom element**
   (`static formAssociated = true`, `ElementInternals.setFormValue()`) — the modern,
   platform-native way to make a custom element participate in a real `<form>` submission, used
   here for design.md's "the native form control remains the actual source of truth" rule.
   Verified by actually submitting a real `<form>` and reading the result back from `FormData`,
   not just trusting the API exists: it returned exactly `[name, "comma,separated,values"]`, the
   same shape a plain native input would have produced.

A story-content bug (not a component bug) also surfaced here and is worth naming as a pattern to
watch for: `filter-bar`'s demo markup had a `<label>` floating next to a `<select>` with no
`for`/`id` connecting them, which `<rfg-filter-bar>` itself has no reason to touch (it only lays
out whatever the host provides) — axe caught it anyway, correctly, since the story's own markup
is real, rendered HTML like any other. Every story in this repo is real test material, not just
documentation; a demo that's wrong is a defect in the same sense a component bug is.

**Update, dogfooding on Human Essentials:** converted `<rfg-button>` to light DOM
(`createRenderRoot()` returns `this`), the same fix `<rfg-tabs>`/`<rfg-field>` already needed, but
found here for three further, more general reasons — measured against Human Essentials before any
of its real call sites were touched, not assumed:

1. A shadow-rendered `<button type="submit">` does not participate in an ancestor `<form>`'s
   submission at all. Confirmed with a real Chromium page: clicking a shadow-rendered submit
   button never fired the ancestor form's submit event; an identical light-DOM button did.
2. A tag/attribute-CSS-selector-based progressive-enhancement library never recognizes a custom
   element as the control it's enhancing. Confirmed against the actual pinned `@rails/ujs@7.0.4`
   build Human Essentials loads: its confirm-dialog and disable-with guards are wired via
   `Element.prototype.matches(el, "button[data-confirm]")`-style delegation, which a
   `<rfg-button>` tag can never match.
3. Capybara's default finders (`click_link`, `click_button`, `have_link`) cannot see into a shadow
   root. Confirmed against Human Essentials' own pinned `capybara`/`cuprite`/`ferrum` versions in
   an isolated harness: `has_link?` found a plain light-DOM anchor and missed an identical
   shadow-rendered one.

All three are real consequences of the shadow boundary itself, not Rails-specific or
Capybara-specific quirks — any adopter relying on native form participation, a tag-selector-based
JS library, or a shadow-blind test tool would hit the same wall. Light DOM resolves all three at
once, re-verified afterward with the same fix.

A naive flip wasn't enough on its own: Lit's light-DOM render leaves pre-existing slotted content
as an inert sibling, since `<slot>` only projects inside a real shadow root — the first attempt
produced an `<a>` with no text inside it at all, the real label sitting as a dangling sibling text
node instead. Fixed with `<rfg-field>`'s already-established technique: capture the host's
original children once (split into icon-slotted vs. label content) and re-parent them into the
rendered control via marker elements, generalized here from field's single node to an ordered list
— re-tested afterward and confirmed working even through the hardest case, the control's element
type switching entirely (disabled `<span role="link">` ↔ `<a>`) when `disabled` toggles at
runtime.

One further cost specific to button, not shared by `tabs`/`field`: those typically appear a
handful of times per page; a button can appear dozens of times on one table-heavy page. Rather
than inject a `<style>` tag per instance (which those two components do and accept), this injects
the stylesheet once per document, keyed by element id, checked idempotently in
`connectedCallback`.

Re-verified the full existing pipeline before any Human Essentials call site was touched: all 91
stories (including every other component that composes `<rfg-button>` —
`card`/`date-range-picker`/`empty-state`/`filter-bar`/`modal`/`popover`/`page-header`) still
render with zero console errors, `wcag-audit.js` and `keyboard-audit.js` both still exit clean
against the rebuilt Storybook site.

**Update, two real defects found running Human Essentials' own system-spec suite against the
migrated `essentials_link_button`** (not assumed from reading the diff — found by running the
app's full `rspec`/`rspec-system` suite, the actual regression gate, not a sample of it):

1. A real crash, `HierarchyRequestError: ... The new child element contains the parent`, thrown
   from the re-parenting code above under a genuine interaction this app uses throughout its
   filter bars: an AJAX response replacing an already-upgraded `<rfg-button>`'s content in place
   (jQuery's `.replaceWith`/a Turbo frame update), rather than disconnecting and recreating the
   element. The one-time capture in `connectedCallback` went stale the moment anything external
   touched the host's children afterward. Fixed the same way `<rfg-tabs>`/`<rfg-field>` already
   handle exactly this class of problem: a `MutationObserver` re-derives the captured content from
   the host's *current* children on every `childList` change instead of trusting a snapshot, and
   `placeInOrder` additionally drops any node that's disconnected or would itself contain the
   marker (the specific condition that throws), recovering on the next sync rather than crashing
   the render outright.
2. A real, measured layout regression: the insertion-order marker elements (`<span
   class="rfg-button-icon-position">`/`-label-position`) were never hidden after use, and the
   existing `.icon-slot > * { width: 1em; height: 1em }` rule matched the leftover icon marker too
   — an empty element forced to a full icon's box, silently doubling the icon-slot's width. Not
   hypothetical: this grew every icon-bearing button by ~20px, which was enough to tip a 3-button
   page header (`/partners`) onto a second line at Human Essentials' own 1200px system-spec
   viewport, reproducing the exact "tab strip moves depending on header content" bug this app had
   already fixed once (`tab_set_system_spec.rb`, cited in that file's own history). Fixed by
   excluding the markers from that sizing rule and giving them `display: none` directly — they're
   real DOM nodes used only as an insertion reference, never meant to be seen.

Both were caught because the full suite was run as the actual acceptance gate, not because either
was anticipated — worth recording as the reason "re-verify against a second real adopter's own
test suite," not just this repo's own Storybook stories, is load-bearing for a component this
central.

**Update, closing the gap between design.md and Storybook itself.** After the Human Essentials
dogfooding above, a review of how design.md's component guidance aligns with Storybook found that
`button.stories.js` was the *only* one of 24 story files that cross-linked back to design.md at
all — nothing enforced that a documented variant had a matching story, and 23 components' Docs
experience said nothing about why they're built the way they are. The fix, piloted before rolling
out, in two layers:

- **`tags: ["autodocs"]` plus a `parameters.docs.description.component` string on every story
  file** — one paragraph each, sourced from that component's own existing header-comment
  description of the design.md section it implements (which, it turned out, every one of the 25
  component files already carried, consistently, as its first comment block — this wasn't written
  fresh, just surfaced into Storybook). Zero new dependencies; this alone gives every component a
  real Docs page.
- **`@custom-elements-manifest/analyzer` generating a manifest from JSDoc on each component class**,
  for an auto-populated attributes/events/slots table on components that never had a hand-written
  `argTypes` controls matrix (16 of 24). Piloted on `button.js`/`field.js` first rather than
  assumed, because a web search surfaced a real, recent Storybook v10 regression
  (storybookjs/storybook#33038) in exactly this wiring. The pilot found it needs more than
  `setCustomElementsManifest()` alone in this version: `@storybook/addon-docs` has to be installed
  and registered in `.storybook/main.js`'s `addons` (not just bundled in core, as it is for
  React), and each story's default export needs a `component: "rfg-x"` field — the tag name
  string Storybook's web-components framework uses to look the element up in the manifest; without
  it the manifest loads but nothing on the page reads it. Confirmed via a Storybook-doesn't-error
  check this repo's own history has twice flagged as insufficient on its own ("auditing the
  audits," 2026-09-02): a Playwright pass that reads each Docs page's actual rendered text, not
  just its console.
- Also found in the pilot: a Lit `{ state: true }` property (the `_foo` convention for internal
  state) leaks into the generated manifest in *two* places (`members` and a separate top-level
  `attributes` array), and an `@ignore` JSDoc tag only suppresses the first when the property is a
  plain `static properties = {...}` object entry — found because `_draft`/`_hasActions`/etc. still
  showed up, undocumented, in the real rendered table after the tag was added. Fixed with a small
  `custom-elements-manifest.config.mjs` plugin that strips both arrays by the existing `_`-prefix
  convention after analysis, rather than depending on the tag.

`npm run storybook`/`build-storybook` now run `npm run analyze` first; the manifest
(`custom-elements.json`) is gitignored and regenerated on every build, the same way
`storybook-static/` already is, not hand-maintained. See `components/README.md`'s "Autodocs"
section for the how-to.

**Update, generalizing the host→control attribute proxy for the mutating half of the button
helper.** Phase 7 deferred `essentials_action_button` (the `button_to`/mutating half) because
`<rfg-button>` only proxied one host attribute (`aria-label`) onto its internal control, and that
half depends on several more: `data-confirm`, `data-disable-with`, `data-tooltip`. The question —
whether `<rfg-button>` should learn what these mean (bake in confirm-dialog/disable-with behavior
as first-class features) or stay a dumb pass-through — was decided in favor of staying dumb: the
component forwards any `data-*`, `aria-*`, or `role` attribute it doesn't itself own (not one of
`variant`/`size`/`href`/`disabled`/`reason`/`type`) onto the real control, without knowing or
caring what any of them mean. rails-ujs and the host app's own confirm-dialog/tooltip controllers
keep doing the actual work, exactly as they do for a plain `<button>` today; the component's only
job is to stop being an attribute trap, the same structural problem light DOM already solved for
tag-selector matching.

**A real bug found by reproducing the actual mechanism, not assumed to work from the design
alone.** The first version *copied* each attribute onto the control and left the original on the
host. Reproducing Human Essentials' `confirm_dialog_controller.js` verbatim against a real
`<rfg-button type="submit" data-confirm="...">` inside a real `<form>` — a document-capture
listener matching `closest("[data-confirm]")`, `stopImmediatePropagation`, strip the attribute,
`trigger.click()`, restore it — found that the *replay* click fails silently: the controller
matches the control (the real click target) on the first click, strips its copy, and clicks it
again — but the host's copy is still there, so `closest()` on the replayed click's bubble walks up
and re-matches the host, intercepting its own replay a second time. The dialog closes; the form
never submits. Fixed by moving the attribute instead of mirroring it (set on the control, remove
from the host, in the same pass) — there is then only ever one copy, so a replay can't re-match a
stale second one. Confirmed with the same reproduction, passing, before this was ever pointed at
Human Essentials.

The `MutationObserver` that already re-syncs content on external DOM mutation (the Turbo/jQuery
fix from Phase 7) now also watches `attributes: true`, so an attribute a Stimulus controller sets
on the host *after* first render still gets moved — not just the ones present at connect.

**Update, a token-based compact icon-only size (`size="xs"`).** Human Essentials' icon-only row
actions (`essentials_row_icon_link`/`essentials_row_icon_action`) were excluded from both migration
passes above as "a distinct 28px circular treatment, not `<rfg-button>`'s vocabulary." Re-examined
before building this: the reasoning was overstated. The danger tone is colour-identical to the
existing `ghost_danger` variant at rest and on hover (only the fixed size and, in the hand-built
version, the focus-ring colour differ — see below); design.md itself never calls this a protected
second vocabulary the way it explicitly does for `<rfg-icon-tile>`/`<rfg-avatar>`, framing the 28px
figure purely as a layout decision (it matches a menu-trigger's own height elsewhere on the page).

The real blocker was structural: `sm`/`md` are padding-based, sized for variable-width text+icon
content, and the icon itself is fixed at `1em` (tied to the control's `font-size`) — neither
produces a true, fixed, icon-only square. `<rfg-icon-tile>`'s own `sm` size (exactly `1.75rem`,
fixed `width`/`height`) was the precedent for how to build one correctly, though that element
itself is non-interactive and not reusable as-is.

This repo's own portability audit (`docs/portability/design-md-tagging.md`) had already concluded
the 28px figure itself is Local — derived from one specific app's own menu-trigger height, not a
portable fact. So the new size's exact dimension is a CSS custom property
(`--rfg-button-xs-size`, documented with `@cssprop`) with a sensible default (`1.75rem`), not a
hardcoded number: any consuming app sets its own value rather than inheriting one app's layout
constant. The icon's size is expressed as `calc(var(--rfg-button-xs-size, 1.75rem) * 0.571)` —
found necessary by actually overriding the token and looking at the result: a fixed icon size left
it visibly stuck at its default dimension while the box grew around it, which a fixed-ratio
`calc()` off the same token fixes, keeping the icon proportioned at any override.

Migrating onto the real `ghost`/`danger` variant CSS (rather than Human Essentials' own separate,
shared-outline-color `ROW_ICON_CLASSES` rule) fixes a real, pre-existing bug as a side effect: that
shared rule hardcodes one `focus-visible` outline colour for every tone, so a focused *destructive*
row-icon button currently shows a brand/indigo ring rather than rose, unlike every other
destructive control in the app. The component's own `danger` variant already gets this right.

**Correction, and two further bugs found by actually looking rather than trusting the above.**
The sentence just above — "the component's own `danger` variant already gets this right" — was
wrong, written before checking, not after: the component has only ever had one universal
`focus-visible` rule (`outline: 2px solid var(--color-brand-600)`), no per-variant override at
all, for *any* variant. A focused `danger`/`ghost_danger` control showed the same brand ring as
everything else. Found by actually focusing a real `ghost_danger` button in a real browser and
reading its computed `outline-color`, the same discipline this project has used throughout —
caught here only because this phase, unusually, involved checking it directly rather than
reasoning from the Ruby-side class strings. Fixed now: `danger`/`ghost_danger` get their own
`outline-color: var(--color-danger)`, cascading over the shared rule via normal specificity.

Two more, found the same way, in the same pass:

- **`ghost_danger` was not a real variant at all.** `VARIANTS` only ever listed `primary`,
  `secondary`, `danger`, `ghost` — never `ghost_danger`, even though design.md's own Buttons
  section names it explicitly ("a destructive action with no fill is `ghost_danger`") and
  Human Essentials' Ruby code has passed `variant: :ghost_danger` directly into `<rfg-button>`
  since the *first* `essentials_action_button` migration. Every such button rendered fully
  unstyled — transparent background, inherited text colour, no hover state — while silently
  logging `<rfg-button> received unknown variant "ghost_danger"...` on every page load. Missed
  for two migration passes because that line is a console *warning*, not an *error*, and every
  verification pass in both phases filtered for `console.type() === "error"` only. No Storybook
  story ever exercised this variant either, so the gap had no story, no audit, and no test to
  catch it. Fixed: `ghost_danger` is now a real fifth variant — `--color-neutral-700` at rest
  (matching plain `ghost`'s own rest colour, differing only on hover/focus), a 15%
  `color-mix()` rose tint on hover (the same tinting technique `<rfg-icon-tile>`'s own danger
  tone already uses, since `tokens/` exposes one value per semantic tone, not a tint scale) —
  and a Storybook story now exercises it, so a regression here would show up in the next
  full-sweep check.
- **`_warnIfNoAccessibleName` had a false-positive bug of its own**, introduced by this same
  phase's move-semantics fix (above): it checked `this.hasAttribute("aria-label")` — the host —
  but `aria-label` is *moved* onto the control, not mirrored, so the host never carries it once
  the proxy runs. Every icon-only button with a real, correct `aria-label` logged the
  "no accessible name" warning anyway. Fixed to check `control`, the parameter the method
  already receives.

All three were found by an unusually thorough live-browser pass for this phase: screenshotting
real rendered output at actual pixel dimensions, focusing real controls and reading computed
`outline-color`, and — critically — reading *all* console output, not just `type: "error"`. The
last habit is the one worth carrying forward: a `console.warn` is exactly as real a bug signal as
a `console.error`, and this phase's own two new findings were both warnings that had been running
silently for one to two prior "verified" migration passes.
