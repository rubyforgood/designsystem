# Ruby for Good — Design System

This is the unified design system for Ruby for Good's Rails applications: **CASA**
(rubyforgood/casa), **Human Essentials** (rubyforgood/human-essentials), and **Stocks in the
Future** (rubyforgood/stocks-in-the-future, "SIF"). All three are independently migrating from
Bootstrap to Tailwind CSS v4, and all three converged — mostly without coordinating — on the same
foundations, the same component shapes, and even the same audit methodology. This document is the
synthesis of that convergence: where the three agree, it states the rule once as the shared RFG
standard; where a value is legitimately project-specific (a brand color, a domain term), it says so
explicitly per project rather than picking a winner. Real contradictions between the three —
places where they disagree about something that isn't supposed to vary — are tracked separately in
[INCONSISTENCIES.md](INCONSISTENCIES.md), not folded in here.

Concrete values (hex codes, pixel/rem numbers, Tailwind class names, breakpoints) are quoted
exactly as the source projects state them. If you're implementing this system in a fourth app, or
reconciling drift in one of the three, treat this document as the reference and the per-project
`sources/` documents as the full, citable detail behind each rule.

## How the three projects relate

Human Essentials' `design.md` is the most extensively reconciled against its own codebase (measured
audits, before/after tables, multi-year decision log). CASA's `design.md` reads similarly and is
the document Stocks in the Future explicitly adopted as its starting point ("Adopted from this
document" is SIF's own framing). SIF then reconciled that inherited document against its own,
much smaller and more constrained app (a school-issued Chromebook at 1366×768 is its primary
target device), which is why SIF diverges the most — mainly on breakpoints, icon system, and
brand color — while still sharing the same foundations and component vocabulary. All three
maintain a running decision log (CASA and SIF have `design-todo.md`; HE has
`docs/design-decisions.md`) and treat their `design.md` as the single source of truth that
decisions eventually get promoted into.

---

## 1. Design principles

Themes stated independently across all three projects, converging on the same philosophy:

- **One document is the source of truth.** Each project's `design.md` (or equivalent) is
  authoritative; a decision log records one-off calls and promotes durable ones back into the main
  document. Code should never be treated as more authoritative than the documented rule — drift is
  a bug to fix, not evidence to update the doc toward.
- **A component earns its existence by being reused**, not by being theoretically nice. All three
  projects describe deleting or consolidating one-off styling in favor of a small shared set of
  components/helpers (button/badge/card/table/modal), and treat "one shape, one class" as a repeated
  fix pattern (CASA and SIF both independently converged on "one control shape" language for form
  fields — SIF measured "seven treatments before, one control" for its own inputs).
- **State is never carried by color alone.** A numeral, a table row, or an icon is never the sole
  signal of success/warning/danger — it's paired with an icon, a label, or a badge. This is stated
  explicitly and repeatedly in all three (WCAG 1.4.1, "use of color").
- **Sentence case, plain language, second person.** All UI copy is sentence case (not Title Case,
  not ALL CAPS), addresses the user as "you," and avoids filler ("please"), restated context, and
  vague link text. See [Tone & voice](#7-tone--voice--content) below.
- **Audit the system, not just the page.** Each project has built bespoke, automated
  design-conformance tooling (accessibility, copy, layout, icon usage, row-action weight) rather
  than relying on manual review. See [Design-conformance auditing](#84-design-conformance-auditing).
- **A breakpoint is for a change of layout, not a change of size.** Stated most explicitly in SIF's
  responsive guidelines, but consistent with how CASA and HE both reason about their own
  breakpoints (see [Breakpoints](#33-breakpoints--responsive-strategy)).

---

## 2. Foundations: color

### 2.1 Shared neutral & semantic palette

All three projects share the same Tailwind `slate` neutral scale and the same semantic hue
assignments:

| Role | Hue | Used for |
|---|---|---|
| Neutrals | `slate-50` … `slate-900` | text, borders, surfaces, page background (`bg-slate-50`) |
| Success | `emerald` | "on track," success states |
| Warning | `amber` | warnings, notices |
| Danger | `rose` | destructive actions, errors, "needs follow-up" |
| Info / accent variety | `sky`, `violet`, `teal` (CASA/HE) | avatar/accent variety, informational tone |

**Muted text is `slate-500`, never `slate-400`.** This is stated identically and independently in
CASA and HE, with the exact same reasoning: `slate-400` on white measures **2.63:1** contrast and
fails WCAG AA for text, while `slate-500` measures **4.77:1** and passes. `slate-400` is reserved
for disabled states, decorative icons, and placeholders on top of a tinted (non-white) surface —
never for text meant to be read. Both projects report having found and fixed live `slate-400`
text-color bugs this way (CASA: `lg:hidden` org-settings group labels; both: audited placeholder
text across all form fields to confirm `slate-500`).

Body/label text-color roles are identical across all three:
- Page body: `text-sm text-slate-600` (CASA) / `text-sm text-slate-700` (HE, "default reading
  size") — both projects use `slate-600`/`slate-700` for body copy, `slate-500` for secondary/meta.
- Label: `text-sm font-medium text-slate-700`.
- Meta/muted: `text-xs text-slate-500`.

**`text-xs` (12px) is for chrome, not content.** CASA states this explicitly: 12px is the size for
a status pill, a column header, a stacked field label, or an account line in the nav — short,
glanceable strings. Anything the user actually reads or transcribes (an email address, a date, a
name) stays at `text-sm`, even in a dense table row. WCAG sets no minimum font size, so 12px
`slate-500` is not a conformance failure on its own (4.77:1 passes 1.4.3 at any size) — this is a
legibility floor the team holds itself to, above the accessibility floor.

### 2.2 Brand color — legitimately project-specific

Each project has its own brand hue, declared as a custom Tailwind `@theme` token rather than reusing
a built-in Tailwind color. **This is not an inconsistency** — each brand color is the actual
organizational identity of that project:

| Project | Brand token | Value | Notes |
|---|---|---|---|
| CASA | `--color-brand-*` (`brand-50`…`brand-900`) | indigo, `brand-50` `#eef2ff` … `brand-900` `#312e81` | `bg-brand-600 text-white` primary buttons, active nav, focus rings |
| Human Essentials | `--color-brand-*` (`brand-50`…`brand-900`) | indigo | same role assignments as CASA: `brand-600` primary/active-nav/focus-ring, `brand-700` primary-hover/link-text-on-white, `brand-50`/`brand-100` tinted surfaces & icon tiles & pills |
| Stocks in the Future | `sitf-primary` / `sitf-primary-dark` / `sitf-accent` | `sitf-primary` **`#00698c`** (blue-teal), `sitf-accent` **`#d3df44`** (lime) | measured against `--sitf-background` `#f7f9f3`: `sitf-primary` 5.82:1, `sitf-primary-dark` 8.50:1, `sitf-accent` **1.37:1 — fill only, never foreground/text** |

CASA and Human Essentials happen to use the identical indigo brand scale and the identical
`brand-*` token naming convention — this is a genuine shared standard, not a coincidence to note as
an inconsistency. SIF's brand color is different by design (a different organization's visual
identity) and uses a different naming convention (`sitf-*` rather than `brand-*`) because it has no
`brand-*` scale at all.

**A hard rule specific to SIF, worth generalizing:** Tailwind's own built-in `teal-*` utility is a
*different* color (mint-green) from SIF's brand `sitf-primary` blue-teal. SIF's own codebase
confused the two five separate times before this was caught and swept. Any project introducing a
custom brand hue that happens to be teal/blue-adjacent should audit for the same confusion against
Tailwind's built-in `teal-*`, `cyan-*`, or `sky-*` scales.

---

## 3. Foundations: typography, spacing, layout

### 3.1 Typography

**Figtree**, self-hosted (no CDN), is the typeface across all three projects — confirmed
byte-for-byte identical usage:

```css
--font-sans: "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

Weights 400/500/600/700/800, latin + latin-ext subsets, `woff2` under `public/vendor/figtree/`,
declared once in each project's `@theme`/`@font-face` and set on `<body>`. SIF explicitly notes it
uses the *variable* font (one file covers weights 400–800, rather than one file per weight) and
that this was "Adopted" from CASA's document without modification.

**Type scale** — identical across all three, role for role:

| Role | Classes | Notes |
|---|---|---|
| Page title (`h1`) | `text-2xl font-bold tracking-tight text-slate-900` | Exactly one per page, emitted by a shared page-header partial/component in every project. |
| Card/section title (`h2`) | `text-base font-semibold text-slate-900` | |
| Sub-section title (`h3`, HE) | `text-sm font-semibold text-slate-900` | Inside a card body. |
| Body | `text-sm text-slate-600`/`text-slate-700` | |
| Field label | `text-sm font-medium text-slate-700` | |
| Meta/muted | `text-xs text-slate-500` | |

Heading *level* communicates document structure, not visual size — all three warn against picking a
heading tag for its default size (HE specifically flags AdminLTE's old habit of using `<h5>`/`<h6>`
for "small bold" text, which broke the heading outline for screen-reader users).

### 3.2 Spacing, radius, elevation

Shared across all three, exactly:

- **4px spacing base** — Tailwind's default scale, unmodified, in all three projects.
- **Radius scale**, tied to role, identical across all three:
  - Controls (buttons, inputs): `rounded-lg`
  - Cards/panels: `rounded-2xl`
  - Icon tiles: `rounded-xl`
  - Pills/avatars: `rounded-full`
- **Elevation — a two-step scale tied to layering, not decoration:**
  - In-page surfaces (cards, panels): `shadow-sm` (CASA/HE/SIF all state this identically; SIF's
    stat/table components additionally use `shadow-xs` for the same "resting" layer)
  - Anything rendered *over* the page (dialogs, modals, popovers): `shadow-xl` (CASA/HE) or the
    slightly heavier `shadow-2xl` in SIF's reconciled modal shell (see
    [Modals](#65-modals-confirmation-dialogs-popovers-disclosure))
  - The rule, stated identically in HE and SIF: nothing else in the app should carry a shadow. A
    shadow means "this is above the page."
- **Page background:** `bg-slate-50`, with cards/surfaces at `bg-white border border-slate-200`.
  Stated identically across all three.
- **Page vertical rhythm:** all three use a `px-4 py-6 sm:px-6 lg:px-8` (or SIF's equivalent)
  content wrapper with the page header inside it, and a consistent header-to-content gap (CASA:
  `mb-6`/24px between header and first section; a plain filter bar sits `mb-4`/16px above its
  table, while a *bordered* filter card keeps the full 24px section gap). Treat spacing between
  major page regions as a fixed rhythm, not a per-page judgment call — all three projects report
  finding and fixing drift here (CASA measured all roster filters converging on 16px, calling `mb-5`
  or `mb-6` on a plain filter "drift").

### 3.3 Breakpoints & responsive strategy

CASA and Human Essentials both use Tailwind's full, unmodified 5-tier breakpoint set:

| Tier | Width | Tailwind prefix |
|---|---|---|
| Small | 640px | `sm:` |
| Medium | 768px | `md:` |
| Large | 1024px | `lg:` |
| Extra-large | 1280px | `xl:` |
| 2x-large | 1536px | `2xl:` |

**Stocks in the Future deliberately overrides this to two tiers** — `base` (below 1024px) and
`lg:` (1024px and up) — and explicitly **bans** `sm:`, `md:`, `xl:`, and `2xl:` as well as any
custom breakpoint. This is a considered, documented decision (not an oversight): SIF's layout only
changes shape once, at the point where a 256px persistent sidebar does or doesn't fit beside the
content, and its target device is a school Chromebook at 1366×768 plus phones at 375px — a bimodal
audience with nothing meaningful in between. See
[INCONSISTENCIES.md](INCONSISTENCIES.md#1-breakpoint-tiers) — this is a genuine cross-project
contradiction, not a project-specific variation to treat as settled, because SIF's rule directly
forbids the tier set CASA/HE treat as their baseline.

**Container queries (Tailwind v4 native) — a technical convention worth adopting project-wide.**
SIF's `responsive-design-guidelines.md` documents a clean, generalizable rule that CASA/HE do not
yet use: reach for `@container`/`@lg:` (container-relative) when a *component* needs to respond to
the width of the space it's dropped into (a card that might render at full width or inside a narrow
sidebar), and reserve viewport `lg:` for *page-level* layout changes (does the sidebar fit). SIF
notes explicitly that nothing in its own codebase uses container queries yet, "and that is not an
oversight" — it's a rule waiting for the first component that needs it. Any of the three projects
building a genuinely reusable, width-agnostic component should reach for this instead of adding
another viewport breakpoint.

---

## 4. Accessibility standards

All three projects hold themselves to a **WCAG AA** baseline, verified with automated + manual
audits, but they do not all target the same version — see
[INCONSISTENCIES.md](INCONSISTENCIES.md#2-wcag-conformance-target). Shared practices across all
three, regardless of version target:

- **Automated auditing is table stakes, not a substitute for judgment.** Every project runs axe (or
  equivalent) in CI/system specs, but every project also documents specific defect classes an
  automated scan cannot catch (see [Design-conformance auditing](#84-design-conformance-auditing)).
- **Never signal state by color alone.** Pair every status color with an icon, label, or badge text.
- **Contrast floor: `slate-500` (4.77:1), never `slate-400` (2.63:1), for text.** See
  [§2.1](#21-shared-neutral--semantic-palette).
- **One `h1` per page**, in-order headings, no skipped levels, landmarks (`main`/`nav`/`aside`) —
  stated identically in CASA and HE.
- **Target size minimum 24px** (WCAG 2.5.8), with a documented 44px figure reserved for icon-only
  controls specifically (close buttons, kebab menus) across HE and SIF.
- **Keyboard-reachable everything**, including scrollable regions (`tabindex="0"` on a scrolling
  dialog body per WCAG 2.1.1, documented in HE) and table row actions that must not be dropped
  "per viewer" — SIF documents a year-long bug where an unlabeled actions column was silently
  dropped for some users because a narrower audience was assumed, rather than measuring the actual
  constraint width.
- **`aria-current="page"`** on the active sidebar nav item (SIF, and consistent with HE/CASA nav
  patterns).
- **Focus-visible, not just focus** — programmatic focus should not trigger a visible focus ring
  unless it's also keyboard focus (HE, Chrome's `:focus-visible` matching on programmatic focus).

Human Essentials additionally maintains a dedicated `docs/accessibility.md` describing its
axe-core + manual-audit methodology, exemption categories, and the "an audit is a floor, not a
certificate" framing that recurs across all three projects' audit philosophy.

---

## 5. Iconography, avatars, and the icon-tile pattern

### 5.1 Icon systems — a genuine cross-project difference

CASA and Human Essentials both use **Bootstrap Icons** (`bi-*`), self-hosted as a font
(`public/vendor/bootstrap-icons/`, vendored via npm at build time, no CDN). HE specifically
rebuilt its Trix rich-text-editor toolbar to swap Trix's default inline-SVG icons for Bootstrap
Icons "so it would have one icon set" — i.e., icon-system consistency is treated as a design rule
worth engineering effort in both projects.

Stocks in the Future uses **Lucide** instead, via the `lucide-rails` gem and a `lucide_icon` helper
that renders inline SVG, `aria-hidden` by default, inheriting `currentColor`. This is a genuine
cross-project inconsistency — see
[INCONSISTENCIES.md](INCONSISTENCIES.md#3-icon-system) — not just a different glyph style but a
different rendering mechanism (icon font vs. inline SVG).

### 5.2 Icon tile pattern — shared

All three projects use the same visual pattern for a status/stat icon sitting on a soft tinted
background — a shared RFG component, independently arrived at:

```
grid place-items-center h-9 w-9 rounded-xl bg-{hue}-50 text-{hue}-600
```

36px box (`h-9 w-9`), `rounded-xl`, tinted `{hue}-50` background with `{hue}-600` icon color. Used
for KPI cards, section headers, list-item leading icons, and (in HE) a smaller "compact" 28px
variant, and (in SIF) a "compact" 32px variant for a beside-text layout versus the default
36px/20px-glyph "on its own line" layout. The default/large size (36px) matches exactly across
projects; the compact-size figures differ slightly (28px HE vs. 32px SIF) and CASA's compact size
was not confirmed against either — treat 36px as the confirmed shared default and pick a compact
size deliberately if introducing one, rather than assuming either 28px or 32px is "the" RFG value.

**Icon tiles are for status/stats, never for people — and never mixed with avatars in the same
list.** CASA states this as an explicit rule: "Icon tiles for status, initial-avatars for people —
never mixed." A soft colored icon tile signals a state; an avatar (photo or initials) signals a
person. Using one in place of the other in the same list reads as inconsistent by design.

### 5.3 Person avatar

Initials-based avatar for people, distinct from the icon tile, present in both HE and SIF as a
named, reusable component. Use for anywhere a person (not a status) needs a compact visual anchor
— assignee lists, header account menus, "who did this" columns.

---

## 6. Components and patterns

### 6.1 Buttons

All three share the same variant taxonomy and the same underlying visual language — filled
primary, outlined secondary, and a danger treatment — built as a helper (`button_classes(:variant)`
in CASA and SIF; `essentials_button_classes`/`essentials_link_button` in HE) rather than
hand-written classes per call site.

| Variant | Treatment |
|---|---|
| `:primary` | Filled brand color, white text (`bg-brand-600 text-white font-semibold hover:bg-brand-700` in CASA/HE) |
| `:secondary` | Outlined (`border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50`) |
| `:danger` | Filled rose |
| `:danger_outline` (CASA) / `ghost_class(:danger)` | A **quiet** destructive treatment: identical to `:secondary` at rest, turns rose only on hover — used when a destructive action sits among bordered buttons, so nothing reads as "always-on red." No variant has red at rest by default. |

**One primary CTA per page.** Stated explicitly and identically in CASA and SIF: a view gets
exactly one filled `:primary` button — the page's main action. A modal/dialog is allowed its own
local primary (e.g. "Yes, send reminder"), visible only while it's open, and that doesn't count
against the page's one-primary rule. A destructive confirm dialog's single solid button is the only
red-at-rest control anywhere in the interface at that moment.

**Button height — see [INCONSISTENCIES.md](INCONSISTENCIES.md#4-button-and-control-height)** for a
genuine cross-project difference: CASA and SIF both use `h-10` (40px) buttons; Human Essentials
uses 38px.

### 6.2 Badges / status pills

Near-identical tone taxonomy across HE and SIF, both as a small reusable component
(`_badge`/status-pill), sharing the philosophy that **a badge marks an exception, not the norm** —
don't badge every row of a table if most rows are in the unremarkable state.

| | HE tones | SIF tones |
|---|---|---|
| Shared | `:neutral` `:info` `:success` `:warning` `:danger` | `:neutral` `:info` `:success` `:warning` `:danger` |
| HE only | `:brand` | — (deliberately removed; SIF found and deleted an unused `:brand` badge tone that had drifted to the wrong hue) |

Rendered `rounded-full`, tinted background + matched-hue text, never color alone (always paired with
the status label as text).

### 6.3 KPI stat cards and numeric display

A strong, near-identical shared pattern across HE (`essentials_stats`) and SIF
(`components/ui/_stat` + `_icon_tile`): **icon tile → large numeral → label → optional
meta/trend-delta line.**

**The load-bearing shared rule: a numeral is never colored to signal state.** The large stat number
is always neutral `slate-900`, full stop — state is carried by the icon tile's tint (or a ring
around it), never by coloring the digits themselves. A trend/delta line below the numeral may use
color (green up-arrow, red down-arrow) but is never color-only — it always pairs the color with an
arrow glyph and/or explicit text. SIF's design.md documents this as a rule reached only after
getting it wrong multiple times (a "ragged metrics" case study, and three iterations before landing
on today's shape).

**Numeric table columns follow the same discipline.** Right-aligned, `tabular-nums`, one uniform
color/weight for the whole column — no per-cell emphasis for "the interesting row." Any
drill-through action belongs in a dedicated actions column, never encoded via numeral color or an
implicit link on the number itself. HE parallels this with `.numeric`/`.quantity`/`.percent` column
classes for right-aligned tabular figures. SIF documents arriving at this only after three rounds of
getting it wrong; treat it as a hard rule, not a style preference.

### 6.4 Tables

Shared conventions across all three, independently arrived at:

- **A component class, not hand-rolled markup**, for the table shell (`.data-table` in HE; a
  `table-*` class set applied identically to header and body in SIF).
- **Row actions get one visual weight per table** — not a mix of filled/outlined/ghost buttons in
  the same actions column. HE's audit tooling (see [§8.4](#84-design-conformance-auditing))
  measured this at 100% conformance across 152 screens after a sweep of legacy `UiHelper` shims
  (`edit_button_to`, `delete_button_to`, etc.) that had been the source of the deviations.
- **Actions column pinned to the right edge.** HE freezes it (`.pin-col`/`.cell-actions`) with a
  scroll-shadow shown only when content is actually hidden off-screen; SIF frames the same concern
  differently — a hard column-width budget at its real constraint width (see below) — but both
  converge on "drop non-scannable columns rather than crowd them, and keep the dropped data
  reachable via CSV export or the detail page."
- **A column earns its width by being scanned, not just referenced.** SIF measures its real
  constraint width as **718px** (a 1024px `lg:` viewport minus a 256px sidebar) rather than the more
  comfortable 1366px full-Chromebook width, and drops/relocates columns that don't survive at that
  width. Distinguishes `wrap-anywhere` (an identifier that can break anywhere) from `break-words`
  (natural language that should break at word boundaries).
- **Selection/batch actions** (HE): a Carbon-style `TableBatchActions` shape — frozen selection
  column, shift-click range select, indeterminate checkbox state, a floating dark action bar that
  appears once anything is selected. Do not reserve a permanent height for this bar — let it push
  content down only once triggered (see the "bulk-action trigger" spacing rule in
  [§3.2](#32-spacing-radius-elevation)).
- **Row height**: SIF measures 48px/57px row heights depending on content; both HE and SIF align
  cell padding (not negative margins) to keep row-action icons centered on the row's center line.
- **Pagination**: CASA and HE both use **Pagy** (server-side, `params` + Pagy, rendered as a
  `shared/_pagination` footer inside the table card — its last child, not a detached bar below).
  SIF instead paginates with a fixed `ApplicationController::PER_PAGE = 25` and prev/next controls
  (no numbered pages), citing Stripe's page-size convention and Kaminari's own default. The exact
  Pagy per-page figure was not confirmed for CASA/HE in this synthesis pass.

### 6.5 Filter bars and date-range pickers

HE and SIF both use a **grid-based (not flex) filter bar**, submitting via **GET** so filtered
views are shareable URLs, with live-apply filtering (no separate Submit/Apply button) debounced on
text input (HE: 350ms). Both collapse into a summary-chip disclosure past a complexity threshold —
HE changed its own rule from "collapse at 5+ filters" to "always collapse, regardless of count," for
consistency across pages regardless of how many filters a given page happens to have.

CASA additionally documents a deliberate **role-based control-height tiering** inside its own
filter bar: filter controls are one step more compact than ordinary form fields — see
[INCONSISTENCIES.md](INCONSISTENCIES.md#4-button-and-control-height) for how this interacts with
the cross-project button-height question.

**Date range picker** (HE): a popover with common presets plus native `<input type=date>` fallback
fields, no explicit Apply button (applies live), 350ms debounce, and reorders (rather than refuses)
an end-date that's typed before the start date.

### 6.6 Forms and fields

All three converge on **one control shape used everywhere**, after each independently finding and
fixing drift toward multiple ad hoc field treatments:

- CASA's field base: `block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900
  shadow-sm placeholder:text-slate-500 focus:border-brand-500 focus:ring-2
  focus:ring-brand-500/30 focus:outline-none` — a 42px control.
- HE measured the same shape across its own forms: 1px border, 8px/14px padding, 44px height,
  `slate-300` border — describing its own fix as going from "seven treatments before, one control."
- SIF's field token is `rounded-lg` (not `rounded-md`, which one drifted view used and which is
  explicitly called an error in SIF's own document) with the same `slate-300`/`shadow-xs` language.

**Placeholder text is `slate-500`, never `slate-400`** — restated here because CASA specifically
audited and fixed all 50 placeholder call sites in its codebase to this value.

**Field-width philosophy**: HE documents reconciling two different schools explicitly — Carbon/
Material/Polaris/Fluent's "field width should hint at expected content length" versus GOV.UK/
USWDS's "fields should be full-width/consistent regardless of content" — and lands closer to the
GOV.UK/USWDS side for consistency's sake, while allowing narrower fields for genuinely short,
fixed-format content (e.g. a short numeric code).

### 6.7 Modals, confirmation dialogs, popovers, disclosure

**A genuine architectural split — see
[INCONSISTENCIES.md](INCONSISTENCIES.md#5-modal-implementation).** CASA and Human Essentials both
build modals on the **native `<dialog>` element** with `showModal()`, getting focus-trapping,
Escape-to-close, an inert background, and top-layer rendering for free from the browser — each
project needed only two of the same Preflight-CSS-reset fixes (restoring `margin: auto` for
centering, and `max-height`/`max-width` so a long dialog doesn't grow past the viewport). Stocks in
the Future instead built a **custom modal shell** (`shared/_modal`, a `bg-black/50` scrim behind a
`rounded-2xl shadow-2xl` panel) rather than wrapping the native element.

**Shared shell shape, regardless of implementation**, once reconciled:
- Header: title (`h2`, matching the card-title token `text-base font-semibold`) with an optional
  subtitle, and a `rounded-full` close control with an inline icon and an `sr-only` label — CASA and
  SIF both land on 32–44px for the close control depending on context (44px when it's the only
  target on the row, reserved for icon-only controls per [§4](#4-accessibility-standards)).
  - Note: CASA's own dialog title uses the page-level `h2`/`text-2xl font-bold` treatment for
    certain full-screen-feeling dialogs, while SIF's reconciled shell settled on the smaller
    `text-base font-semibold` card-title token for a dialog title — worth checking against
    project-specific need rather than assuming one figure universally.
- Body: scrolls independently, keeping header/footer fixed; a scrollable body needs `tabindex="0"`
  for keyboard reachability.
- Footer: right-aligned action row, `:secondary` (Cancel) before the primary/danger action.
- **A destructive confirm dialog's synchronous nature matters**: HE documents that its
  `confirm_dialog` had to resolve synchronously (true/false immediately) to serve as a drop-in
  replacement for the browser's native `window.confirm`, unlike an async `<dialog>` resolution.

**Popovers/dropdowns are explicitly not modals** — no focus trap, no inert background — in both HE
and SIF. Both build them as anchored floating panels, typically using a native disclosure mechanism
(`<details>/<summary>` for menus) enhanced with a Stimulus controller (`popover_controller.js` in
HE) for outside-click dismissal, Escape, and focus return. Elevation for anything "above the page"
follows the shared `shadow-xl`/`shadow-2xl` rule from [§3.2](#32-spacing-radius-elevation) — popovers
get exactly one elevation treatment, same as modals.

**Disclosure pattern** (SIF, documented in detail): a disclosure trigger's label names the
*content* it reveals, never the *action* of revealing it (per the WAI-ARIA Authoring Practices
Guide) — e.g. "Advanced options," not "Show more."

### 6.8 Alerts, flashes, callouts, and form-error summaries

A shared core rule across HE and SIF: **a transient success notice auto-dismisses; a
warning/error/alert never does.** HE: plain-glyph flash messages (never an icon tile for a flash),
`role="status"` for a dismissing notice vs. `role="alert"` for one that persists. SIF documents a
richer four-way taxonomy worth adopting more broadly:

1. **Flash banners** — `notice` auto-hides after 6 seconds; `alert` stays until dismissed or the
   page navigates.
2. **Callouts** — persistent, dismissible-with-server-roundtrip page-state banners (distinct from a
   one-off flash; the dismissal is remembered).
3. **A "staging band" exception** — dismissible, but deliberately recurs each session via a session
   flag, so it can't be permanently dismissed away on a non-production environment.
4. **Form error summaries** — never auto-dismiss; they clear only when the form is corrected and
   resubmitted successfully.

Both projects agree flashes/errors are never signaled by color alone — always paired with an icon
and/or explicit text (see [§4](#4-accessibility-standards)).

### 6.9 Page headers, app shell, and sidebar navigation

All three route every page's `h1` + optional subtitle + primary action through a **shared
page-header partial/component**, rather than hand-writing headers per page — explicitly to keep
title/subtitle/CTA spacing from drifting per page (CASA measured and fixed 19+ pages that had
drifted from hand-written headers back onto the shared partial).

**Sidebar navigation** (documented in most detail by SIF, consistent with CASA/HE's own shell
patterns):
- One light sidebar (not a dark "admin theme" sidebar) — both authenticated and admin contexts
  share the same visual treatment.
- `w-64` (256px) sidebar width.
- The active/selected nav row is indicated by more than color alone — SIF measures its selected-row
  contrast at 7.78:1.
- `aria-current="page"` on the active item.
- Icons rendered via the project's icon system (`lucide_icon`/`currentColor` in SIF; `bi-*` in
  CASA/HE), never a mix of icon systems within one nav.
- **Keep navigation one level deep.** SIF documents fixing a "Trading floor" nav item that had grown
  a nested row-counter as a symptom of trying to put too much into the nav itself; the fix was to
  move a growing list out of nav and into the page it names.
- **A catalogue does not belong in the nav.** For a growing list of items (not a fixed set of
  destinations), reach for search/filter, a command palette, a recently-viewed list, or pinning —
  in that preference order — before adding it as scrolling nav content.
- **One drawer mechanism** for the mobile nav (a `drawer_controller` Stimulus controller, not a
  checkbox+label CSS-only toggle) — needed for reliable outside-click/Escape handling and to avoid
  the drawer-testing gotchas that show up specifically at 375px viewport width.
- Nav-row density differs by context in SIF: 36px on desktop vs. 44px in the mobile drawer (a
  uniform 44px on desktop was measured to overflow the nav's row budget).

### 6.10 Empty states

Three recurring shapes, documented most fully by SIF: a **cold-start** empty state (no data at all
yet — centered icon tile + heading + one-line explainer + a primary action to create the first
item), a **filtered-to-nothing** empty state (results exist but the current filter excludes all of
them — offer to clear filters, don't repeat the cold-start CTA), and a **delight/nothing-to-report**
state used deliberately on dashboards (a positive absence — e.g. "nothing needs your attention right
now" — withheld entirely rather than shown as a bare "no data," and shown only when there is
genuinely nothing to say).

### 6.11 Charts and dashboards

Both HE and SIF use Chart.js for data visualization, layered with the same numeral-never-colored
discipline from [§6.3](#63-kpi-stat-cards-and-numeric-display) — a chart may use color for its data
series, but any adjacent KPI numeral stays neutral `slate-900`.

---

## 7. Tone & voice & content

Content rules are documented most exhaustively in Human Essentials' Copy section, and are
consistent with CASA's and SIF's own copy guidance where each states them. Treat HE's version as
the canonical detailed statement of an RFG-wide house style:

- **Sentence case everywhere** — headings, labels, buttons, nav — never Title Case, never ALL CAPS
  for emphasis. The one documented exception across all three: CSV/export column headers, which are
  titleized (a spreadsheet convention, not a UI one).
- **No "please."** Instructions and button labels are direct: "Save changes," not "Please save your
  changes."
- **Button labels are verb + object** ("Assign volunteer," "Generate report"), not a vague "Submit"
  or "OK," and not restating the whole page's context in the button.
- **Link text says its destination.** Never "click here" or "read more" alone — the link text
  itself should make sense out of context (a screen-reader users-navigating-by-links convention as
  well as a plain-language one).
- **No instruction should depend on visual position alone** ("the button on the right") — describe
  it by label/name instead, since position isn't reliable across viewport sizes or for
  screen-reader users.
- **No gendered or ableist language.**
- **Second person: "you," not "my" or "we"**, for anything describing the user's own data or
  actions — with three documented exception categories where "we"/"my" is acceptable: an onboarding
  welcome email, a privacy policy, and marketing copy. HE measured its own before/after counts when
  sweeping this rule across the app.
- **A page title is a phrase, not a question.**
- **A subtitle says something the title cannot** — it's not a restatement of the title in smaller
  text; if it doesn't add information, cut it. The right content for a subtitle differs by the kind
  of page (index vs. show vs. form), documented in HE.

---

## 8. Technical implementation conventions

### 8.1 Tailwind build tooling — shared, deliberate

All three projects use the **`tailwindcss-rails` gem** (a standalone Tailwind CLI wrapper) rather
than `cssbundling-rails`/Node-based builds. This is stated as an explicit, load-bearing choice in
both HE and SIF's documents (SIF's `design-instructions.md` goes as far as saying to "ignore any
instruction to run an npm CSS build"). Tailwind v4's CSS-first `@theme` block is used for all
custom tokens (brand colors, font family) rather than a JS config file; `@source` globs are
required for Tailwind v4 to find class names in view templates. Output builds via the Rails asset
pipeline (Propshaft in HE), watched via a `Procfile.dev` process in development.

### 8.2 Tailwind v4-specific gotchas worth knowing project-wide

- **`rotate-180` emits a standalone CSS `rotate` property**, not a `transform`, in Tailwind v4 —
  verify via `getComputedStyle().rotate`, not `.transform`, if testing a rotation-based disclosure
  indicator.
- **`hover:`/`group-hover:` are gated behind `@media (hover: hover)`** in Tailwind v4 — a
  hover-only reveal silently does nothing on touch/hybrid-pointer devices, and this cannot be
  caught by a headless-Chromium system test (which reports `(hover: none)`). Any hover-revealed
  affordance needs a non-hover fallback (a visible-on-focus state, a persistent lower-emphasis
  glyph, or a tap-to-reveal alternative) if it's meant to be usable on a touchscreen.

### 8.3 Component-class helper pattern

All three build small Ruby helper methods that return a fixed Tailwind class string for a given
variant, rather than hand-writing class strings at each call site: `button_classes(:variant)` /
`ghost_class(:variant)` / `alert_classes(:variant)` (CASA and SIF, nearly identical naming);
`essentials_button_classes` / `essentials_link_button` / `essentials_action_button` /
`essentials_form_for` / `essentials_error_summary` / `FilterHelper` (`filter_select` /
`filter_text` / `filter_date` / `filter_checkbox`) in HE; `Ui::FormBuilder`, `AvatarHelper`,
`NavHelper` (`nav_row_class` / `nav_indicator_class` / `nav_icon_class`) in SIF. This is the
mechanism by which "one shape, one class" is actually enforced in each codebase, and each project's
automated audits (below) check for call sites that bypass the helper with hand-written classes.

### 8.4 Design-conformance auditing

**Every project has built bespoke, automated scripts that check its own UI for conformance to its
design system** — a shared methodology across all three, even though the specific tools are
completely different implementations:

- **CASA**: `spec/system/accessibility/axe_spec.rb`, `bin/measure-responsive.mjs`,
  `bin/caret-map.rb`.
- **Human Essentials**: `bin/design/status.rb`, plus a large family of targeted audits —
  `audit.js`, `address-audit.js`, `icon-audit.js`, `page-audit.rb`, `wcag-audit.js`,
  `wcag-manual.js`, `overlay-audit.js`, `keyboard-audit.js`, `copy-audit.rb`,
  `row-actions-audit.js`, `citation-audit.py`, `layout-shift-audit.js`, `button-audit`,
  `form-validation-audit.js`, `tooltip-audit.js` — with companion methodology docs
  (`docs/table-audit.md`, `docs/view-audit.md`) describing a **DEFECT vs. debt** severity
  distinction (a defect is wrong now; debt renders correctly but is implemented in a way that can't
  receive a system-wide fix).
- **Stocks in the Future**: a family of Rails system tests doubling as design audits —
  `spacing_test.rb`, `page_rhythm_test.rb`, `environment_ribbon_test.rb`,
  `no_arbitrary_values_test.rb`, `button_variants_test.rb`, `one_primary_test.rb`,
  `icon_tile_test.rb`, `wcag_audit_test`, `table_stacking_test`, `reflow_test`,
  `row_action_alignment_test.rb`, `table_consistency_test.rb`, `dash_column_test`,
  `table_actions_reachable_test`, `flash_dismiss_test.rb`, `modal_standards_test.rb`.

**A shared "audit the audits" pattern**: both HE (documented in `docs/accessibility.md` and its
copy-audit methodology) and SIF independently describe deliberately planting a known violation and
confirming their own tooling catches it, as a self-test that the audit itself hasn't silently gone
stale.

**What an audit cannot see, documented independently by HE's `view-audit.md`**: unbalanced/
mismatched HTML tags the browser silently recovers from, duplicate `<h1>`s inside a loop, stray
template-expression output printing onto the page, and similar markup bugs that a class-name or
DOM-structure scan will not catch — caught only by actually opening the page in a browser. The
shared lesson: an automated audit is a floor, not a certificate: it catches known patterns, not
"the page is correct."

---

## 9. Supplementary source material folded into this synthesis

Beyond each project's primary `design.md`, the following supporting documents were read and folded
in above because they contain durable, transferable design rules (as opposed to one-off business
decisions or process/tooling notes, which were left out):

- `human-essentials/accessibility.md` — accessibility audit methodology, informs [§4](#4-accessibility-standards) and [§8.4](#84-design-conformance-auditing).
- `human-essentials/table-audit.md` — row-action-weight and badge-usage measured audits, informs [§6.4](#64-tables) and [§8.4](#84-design-conformance-auditing).
- `human-essentials/view-audit.md` — page-level conformance methodology, informs [§8.4](#84-design-conformance-auditing).
- `stocks-in-the-future/responsive-design-guidelines.md` — breakpoint and container-query rules, informs [§3.3](#33-breakpoints--responsive-strategy).
- `stocks-in-the-future/type-ahead-and-multiselect.md` — durable, framework-agnostic rules for a searchable multiselect control, worth knowing if any project builds one (not otherwise covered above since none of the three currently ships this control): clear the query on pick, address the control through its native `<select>` never the widget's own DOM, assert filtering by a decoy option's absence rather than reading the menu immediately after a keystroke, and never write "never" in an option's subtext hint.

Select durable rules from `human-essentials/design-decisions.md` (a 9,954-line running decision
log) are reflected above via HE's own "promote to design.md" workflow — the log explicitly states
its purpose is to record one-off decisions until they're promoted into `design.md`, so this
synthesis treats HE's `design.md` as already containing that log's generalizable content, and did
not re-derive rules directly from the log itself. The full log is preserved verbatim in
[sources/human-essentials/design-decisions.md](sources/human-essentials/design-decisions.md) for
provenance.

Each project's `design-todo.md` (CASA, SIF) is a migration backlog/status tracker, not a design
rule source, and was not mined for this synthesis beyond confirming it didn't contain undocumented
design decisions — preserved verbatim in `sources/` for provenance.

See [INCONSISTENCIES.md](INCONSISTENCIES.md) for the open cross-project contradictions this
synthesis deliberately did not paper over.
