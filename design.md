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

---

## 1. Design principles

Themes stated independently across all three projects, converging on the same philosophy:

- **One document is the source of truth.** Each project's `design.md` (or equivalent) is
  authoritative; a decision log records one-off calls and promotes durable ones back into the main
  document. Code should never be treated as more authoritative than the documented rule — drift is
  a bug to fix, not evidence to update the doc toward.
- **A component earns its existence by being reused**, not by being theoretically nice. All three
  projects describe deleting or consolidating one-off styling in favor of a small shared set of
  components/helpers (button/badge/card/table/modal) — "one shape, one class."
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
never for text meant to be read. (For the rest of the neutral ladder, independently confirmed by
SIF: `slate-600` 7.58:1, `slate-700` 10.35:1, `slate-900` 17.85:1, all on white.)

**The same floor/ceiling split applies to the semantic hues, not just slate.** CASA measured
`amber-600` at **3.19:1** and `emerald-600` at **3.67:1** on white — both clear the 3:1 non-text
floor (an icon fill, a border) but fail the 4.5:1 text floor; `rose-600` clears text contrast only
barely, at **4.51:1**. The rule this implies: a status *word* — badge text, an inline "Overdue,"
a numeral's adjacent label — uses `-700` of its hue; `-600` is for a paired icon or border only,
never for the text itself.

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
*different* color (mint-green) from SIF's brand `sitf-primary` blue-teal. Any project introducing a
custom brand hue that happens to be teal/blue-adjacent should audit for the same confusion against
Tailwind's built-in `teal-*`, `cyan-*`, or `sky-*` scales.

---

## 3. Foundations: typography, spacing, layout

### 3.1 Typography

**Figtree**, self-hosted (no CDN), is the typeface across all three projects:

```css
--font-sans: "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

Weights 400/500/600/700/800, latin + latin-ext subsets, `woff2` under `public/vendor/figtree/`,
declared once in each project's `@theme`/`@font-face` and set on `<body>`. SIF uses the *variable*
font (one file covers weights 400–800, rather than one file per weight).

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
heading tag for its default size (e.g. using `<h5>`/`<h6>` purely for "small bold" text breaks the
heading outline for screen-reader users).

### 3.2 Spacing, radius, elevation

Shared across all three, exactly:

- **4px spacing base** — Tailwind's default scale, unmodified, in all three projects.
- **Radius scale**, tied to role, identical across all three:
  - Controls (buttons, inputs): `rounded-lg`
  - Cards/panels: `rounded-2xl`
  - Icon tiles: `rounded-xl`
  - Pills/avatars: `rounded-full`
- **Elevation — a two-step scale tied to layering, not decoration:**
  - In-page surfaces (cards, panels): `shadow-sm` (SIF's stat/table components additionally use
    `shadow-xs` for the same "resting" layer)
  - Anything rendered *over* the page (dialogs, modals, popovers): `shadow-xl` (CASA/HE) or the
    slightly heavier `shadow-2xl` in SIF's reconciled modal shell (see
    [Modals](#65-modals-confirmation-dialogs-popovers-disclosure))
  - The rule: nothing else in the app should carry a shadow. A shadow means "this is above the page."
- **Page background:** `bg-slate-50`, with cards/surfaces at `bg-white border border-slate-200`.
- **Explicit z-index ladder** (CASA): page content stays at `z-20` or below, a sticky top bar sits
  at `z-25`, a mobile-nav scrim at `z-30`, a sidebar drawer at `z-40` — and a native `<dialog>`
  needs no number at all, since it paints in the browser's own top layer regardless of any
  author z-index. Stated as a hard, numbered scale rather than a per-component judgment call,
  because any element that creates its own stacking context can otherwise silently paint over an
  "open" dropdown or popover.
- **Page vertical rhythm:** all three use a `px-4 py-6 sm:px-6 lg:px-8` (or SIF's equivalent)
  content wrapper with the page header inside it, and a consistent header-to-content gap (CASA:
  `mb-6`/24px between header and first section; a plain filter bar sits `mb-4`/16px above its
  table, while a *bordered* filter card keeps the full 24px section gap). Treat spacing between
  major page regions as a fixed rhythm, not a per-page judgment call.

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

SIF states the underlying principle as more than a project-specific carve-out: **a breakpoint
belongs where content breaks, not at a specific device width** — citing this as common ground
across the responsive-design field (Ethan Marcotte, Brad Frost, web.dev, and Tailwind's own docs
all state it the same way). CASA/HE's 5-tier scale isn't a competing philosophy so much as a
device-width shorthand for the same idea, applied to a wider range of layouts than SIF's two
contexts.

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
- **Target size minimum 24px** (WCAG 2.5.8). The 44px figure is reserved more narrowly than it
  might sound: HE reserves it specifically for controls that exist **only on touch** (the mobile
  drawer's open/close toggle, for instance) — its row-action icon buttons (edit/delete/kebab in a
  table row) are a uniform **28px** (`size-7`), matching the kebab trigger's own height, not the
  app's general 38px control height. Don't conflate "icon-only" with "gets 44px" — check whether
  the control is touch-only or sits in a dense, mouse-first row before picking a size.
- **Keyboard-reachable everything**, including scrollable regions (`tabindex="0"` on a scrolling
  dialog body per WCAG 2.1.1, documented in HE) and table row actions, which must not be dropped
  for a narrower audience without measuring the actual constraint width (SIF).
- **`aria-current="page"`** on the active sidebar nav item (SIF, and consistent with HE/CASA nav
  patterns).
- **Focus-visible, not just focus** — programmatic focus should not trigger a visible focus ring
  unless it's also keyboard focus (HE, Chrome's `:focus-visible` matching on programmatic focus).
- **An icon-only control must be a real `<button>`, never an anchor styled as one.** HE found a
  live bug from exactly this: a native `<a role="button">` fires on Enter but silently ignores
  Space, failing WCAG 4.1.2 (Name, Role, Value) for keyboard users who expect Space to activate a
  button.
- **`<label for>` cannot name a custom element or an ARIA-role widget** — a rich-text editor (Trix
  or similar) or any custom-element/ARIA-input-role control needs `aria-label` set directly on it,
  because `for` only binds to genuinely form-associated elements. A visually correct, properly
  wired-looking `<label>` can still fail this silently (CASA).
- **Heading order has traps beyond "one `h1`, no skipped levels."** A subtitle/caption under an
  `h1` is a `<p>`, never a small heading picked for its visual size; a `<dt>` is already the term
  and must never wrap a heading inside it; a card partial reused by both a grouped view and a flat
  view needs a caller-controlled heading level so it doesn't skip levels in whichever context
  nests it deeper (CASA).
- **A link inside running text needs an underline even when its color alone reads as "passing."**
  WCAG's `link-in-text-block` (G183) requires 3:1 contrast between link text and adjacent body
  text, not just 4.5:1 against the background — CASA measured `brand-600` against `slate-900` body
  copy at **2.83:1**, and HE independently measured its own brand blue on prose at **1.04–2.26:1**.
  The resulting rule, converged on by both: an inline link *within a sentence* gets a permanent
  underline (`underline underline-offset-2`) regardless of hue, since there's no adjacent non-link
  text to distinguish it by position; a link that is its own block (a table cell, a card, a nav
  item) doesn't need one.
- **A link cannot be disabled — only a form action can.** An unavailable link-triggered action
  renders as a non-interactive `<span aria-disabled="true">`, never a "disabled" `<a>` (an anchor
  has no disabled state the platform enforces); a genuinely `disabled <button>` is reserved for a
  real form submission (HE).
- **Disabling a control is for gating a task, not for marking a state that's merely inert.** HE's
  own test, arrived at after reversing itself once (dimming, then un-dimming, a calendar's "Today"
  button): disable when pressing the control would need a precondition the user hasn't met yet;
  leave it live when the action is idempotent and its result is already visible on screen, even if
  clicking it "does nothing new" (cites Adrian Roselli, the NSW Design System, and Polaris's own
  shift from `disabled` toward `aria-disabled`).
- **Gate the action, not the information.** An `if current_user.admin?` block hid an earnings
  summary from a teacher who could see everything else on the page but wasn't allowed to press one
  irreversible button next to it. Scope the permission check to the control, not the surrounding
  data the control sits beside (SIF).
- **A field the user must see or copy, but not edit, gets `readonly`, not `disabled`.** A disabled
  field is skipped by keyboard navigation entirely, putting a value someone needs to read or copy
  (a username, a generated ID) out of reach for a keyboard user (SIF).
- **`prefers-reduced-motion` applies to anything that moves** — a drawer transform, a fade — not
  just large animations (SIF). One real trap it creates: an element that auto-hides via a CSS
  transition and is removed from the DOM on `transitionend` can be stranded on screen forever if
  the transition never actually fires (reduced motion is honored, or a display change happens
  mid-fade). Remove it on a timer, not solely on the transition event.
- **Skip link** (WCAG 2.4.1, Bypass Blocks), documented in most detail by HE: a
  `<a class="skip-link" href="#main-content">Skip to main content</a>` as the first element inside
  `<body>`, targeting a `<main id="main-content" tabindex="-1">` (the `tabindex="-1"` matters —
  without it, Safari and other browsers scroll to the target but leave focus on the link itself, so
  the next Tab returns to the top of the nav instead of into the content). Styled hidden off-screen
  until `:focus` reveals it, deliberately **not** Bootstrap's `.sr-only-focusable`, which reveals
  with `position: static` and shoves the whole page down the moment the link takes focus —
  absolute positioning (what GOV.UK, USWDS, and the WAI pattern all use) avoids that reflow. Skip
  links are scoped to pages that actually have navigation ahead of their content; an auth/sign-in
  layout with nothing but a logo and a form gets none.

---

## 5. Iconography, avatars, and the icon-tile pattern

### 5.1 Icon systems — a genuine cross-project difference

CASA and Human Essentials both use **Bootstrap Icons** (`bi-*`), self-hosted as a font
(`public/vendor/bootstrap-icons/`, vendored via npm at build time, no CDN). HE rebuilt its Trix
rich-text-editor toolbar to swap Trix's default inline-SVG icons for Bootstrap Icons — icon-system
consistency is treated as a design rule worth engineering effort, not just a default.

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

### 5.4 Icon meaning and alignment discipline

**One glyph, one meaning, app-wide — enforced by an audited lexicon, not convention alone.** HE
documents a flagship bug this discipline is meant to prevent: import and export got their arrow
directions backwards because "upload/download" (the server's frame of reference) and
"import/export" (the app's frame of reference) don't share a mental model, and nobody had written
down which arrow meant which. The corollary rules: a generic form verb (Save, Cancel, Close,
Update) gets no icon at all — plain-text buttons already say what they do — while a *named* action
keeps its glyph even when it happens to be a submit button (a filter bar's "Filter" button, for
instance). A vertical arrow meaning "a value went up/down" and a two-headed vertical arrow meaning
"sort this column" must never be reused for an unrelated action button, and a navigation icon's
only job is to tell sidebar items apart — the same glyph must never label two different nav rows.

**Icon-to-text vertical alignment is a real measurement, not a matter of taste.** A leading icon's
bounding box can match the surrounding text's line-height exactly and still read as
misaligned, because glyph ink and text ink don't share a visual center — CASA found the fix (a
`mt-0.5` nudge) by measuring actual ink-density bands per row rather than eyeballing it. Related:
a leading icon beside a label that may wrap to multiple lines is top-aligned (`items-start`) to the
first line, never vertically centered against the whole wrapped block.

**A flash/alert message gets a plain glyph, inheriting the surrounding text color — never an icon
tile.** Both CASA and HE converged on this after trying the tile treatment and rejecting it: a
soft `-50` tile on a `-50` flash surface measures as low as **1.07:1** (invisible), and a filled,
higher-contrast tile technically passes but adds height and "shouts" for a message that's meant to
be read, not alarmed over. CASA's stated principle generalizes past flashes: **if the only way to
make an ornament visible is to make it loud, the ornament is wrong** — a left accent band was
tried and rejected too, for adding visual weight without adding information.

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

**At most one primary CTA per page — not "exactly one."** CASA and SIF state this as "exactly
one," but HE's own experience refines it: after measuring that 63 of its 101 pages have *zero*
header actions at all, HE dropped a requirement that every page have a primary, because forcing
one where none belongs produces a false primary — on one page, "Delete" inherited the primary slot
by default and became the single most destructive action on the page, styled as its main action. A
page either has one clear main action (filled `:primary`) or it has none; it never gets a red or
secondary action promoted to primary just to fill the slot. A modal/dialog is allowed its own local
primary (e.g. "Yes, send reminder"), visible only while it's open, and that doesn't count against
the page's own primary. A destructive confirm dialog's single solid button is the only red-at-rest
control anywhere in the interface at that moment.

**A destructive action nested inside a management card or sub-form is never `:primary`, even when
it's the only button in view.** CASA names this trap explicitly: an "Assign a case" or "Add note"
submit sitting inside a self-contained card still isn't the page's main action if a real Save
exists elsewhere on the page — it stays `:secondary` regardless of how isolated it looks.

**"No red-at-rest" applies to the container around a button, not just the button itself.** A
section outlined in `border-rose-200` purely to flag "the action inside is dangerous" is the same
always-on-red violation as a filled destructive button at rest — the danger belongs to the button's
own variant, icon, and confirm dialog, never to a tinted or bordered wrapper around it (CASA).

**A feature-gated action stays a real, live, clickable button in both states — never `disabled`.**
When an action needs an unmet prerequisite (e.g., a messaging integration isn't configured yet),
CASA keeps the same element and variant in both states and swaps only the icon (a "slashed"
variant) plus a `title` naming the missing prerequisite. A `disabled` button sitting among live
siblings reads as broken, gives no click feedback, and commonly breaks alignment with the buttons
next to it.

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

**Where a status pill goes depends on what the page's `<h1>` actually names.** HE's rule: if the
title *is* the subject the status describes (a case's own show page, titled with the case's name),
the pill rides the title line. If the title names a page rather than a subject (an index, a
dashboard section), a status doesn't belong beside it as decoration — it becomes a scoped callout
that states the actual consequence, or is removed from that spot entirely. A badge is never placed
next to a heading just because a heading happens to be nearby.

### 6.3 KPI stat cards and numeric display

A strong, near-identical shared pattern across HE (`essentials_stats`) and SIF
(`components/ui/_stat` + `_icon_tile`): **icon tile → large numeral → label → optional
meta/trend-delta line.**

**The load-bearing shared rule: a numeral is never colored to signal state.** The large stat number
is always neutral `slate-900`, full stop — state is carried by the icon tile's tint (or a ring
around it), never by coloring the digits themselves. A trend/delta line below the numeral may use
color (green up-arrow, red down-arrow) but is never color-only — it always pairs the color with an
arrow glyph and/or explicit text. Treat this as a hard rule, not a style preference.

**Numeric table columns follow the same discipline.** Right-aligned, `tabular-nums`, one uniform
color/weight for the whole column — no per-cell emphasis for "the interesting row." Any
drill-through action belongs in a dedicated actions column, never encoded via numeral color or an
implicit link on the number itself. HE parallels this with `.numeric`/`.quantity`/`.percent` column
classes for right-aligned tabular figures. CASA arrived at the same rule from the other direction,
after trying and rejecting both a colored digit and a weight-plus-link mix: if a count needs to
link somewhere, that's a row-level action in the actions column; if it needs status, that's a pill
in its own column — never encoded in the numeral's own color, weight, or an implicit link.

**A card header or panel behind a numeral is never a filled or tinted color band either.** SIF
extends the numeral-never-colored rule to the surface the numeral sits on: a live balance or stat
sits on a plain card with a neutral icon tile, not a tinted gradient panel. A `rounded-t-*` color
band on a card is usually the tell that two visually mismatched boxes are being fused together
where a real card component would do it correctly — a tint is for a *message* (a callout), never
for a *figure's* panel.

**A stat's stated time period must be named, and it must be true.** CASA found and fixed a "Time
completed this year" column that silently summed all-time totals (proven by planting a three-year-old
test record and watching it appear in the "this year" figure). The generalizable checklist: name the
period and its start date in the header itself; let the user change it if the page has any date
filtering at all; clamp a parsed/typed date to the domain's real valid range; when comparing a
`Date` range against a `datetime` column, widen the range to end-of-day before comparing (Postgres
reads a naive date's upper bound as midnight, silently excluding "today"); and settle one single
definition of "this year"/"this month" app-wide rather than letting each query reinvent it.

**A dashboard or worklist never gives each row its own tinted or bordered box.** CASA measured this
directly: six rose-tinted "urgent" row-boxes (528px tall) against the same content as one plain
divided list (483px tall) — applying an alert-style fill to a whole repeating collection stops
signaling urgency and just becomes visual noise. Pick a table (when a row has two or more genuine
data columns) or a divided list (`divide-y`, for a narrower single-column context) by the row's
actual measured width, not by taste.

### 6.4 Tables

Shared conventions across all three, independently arrived at:

- **A component class, not hand-rolled markup**, for the table shell (`.data-table` in HE; a
  `table-*` class set applied identically to header and body in SIF).
- **Row actions get one visual weight per table** — not a mix of filled/outlined/ghost buttons in
  the same actions column. HE enforces this by sweeping legacy `UiHelper` shims (`edit_button_to`,
  `delete_button_to`, etc.) in favor of the audited helper (see
  [§8.4](#84-design-conformance-auditing)).
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
  (no numbered pages), citing Stripe's page-size convention and Kaminari's own default. HE adds
  real nuance worth generalizing: **state the range, not the page number** ("Showing 31–45 of 272
  requests," never "Page 3 of 19") — a page number is a proxy that stops meaning the same thing the
  moment page size varies. Page size itself is banded by measured row height (HE uses three bands,
  targeting roughly 1.8–3.4 screens of content per page) rather than one global constant. Prev/Next
  render **disabled, not omitted**, when there's nowhere to go — SIF explicitly rejected GOV.UK's
  pattern of removing the control entirely, because that shifts the remaining button sideways
  between page 1 and page 2; Polaris/Stripe/GitHub's "present but disabled" keeps the control row's
  width constant under the cursor. And: **a report does not paginate — an index does.** A report
  bounded by the bank's own fixed catalogue is read, exported, and printed as a whole; a pager
  breaks all three of those uses, so a bounded report gets no pager at all (HE).
- **Two valid strategies for a table that doesn't fit a narrow viewport — pick by what the column
  holds.** SIF's default is dropping/relocating columns at the real constraint width (above). CASA
  documents a second, equally valid pattern for a dense table that can't afford to drop anything:
  render both a `hidden md:block` table and a `md:hidden` stacked-card twin (a `<dl>`-style
  label/value list per row) from one hoisted data array, not two separate queries — keeping
  `id`/`data-*` test hooks on the table copy only, to avoid duplicate-id collisions between the two
  renders. Within SIF's own narrow-viewport tables, the choice between **collapsing** a column
  (`hidden lg:table-cell`, its content folded into the primary cell as a stacked label/value line)
  and **reflowing** the whole table to `display: block` depends on what the cell holds: collapse
  when the secondary cells are text, badges, or links and there's an identifying primary column;
  reflow only when a cell holds a live form control, because restating that field in the primary
  cell would duplicate its `name` attribute (the second copy silently wins on submit) — reflowing
  keeps one DOM node and one real `<label for>` per input.
- **A column-visibility picker (DataTables-style "show/hide columns") is a rejected anti-pattern,
  independently, in two projects.** Both SIF and CASA tried this and rejected it in favor of a
  responsive layout — "a responsive layout is the better mobile investment" (CASA) — reinforcing
  it as a converged, load-bearing decision rather than one project's opinion.
- **Sortable column headers**: a concrete, accessible shape (CASA) — server-side `?sort=` query
  param, `aria-sort` on the active header cell, and a double-caret indicator showing both sort
  directions are available before a column is the active sort.
- **A destructive action's confirmation must be true, and only offered where it's relevant — never
  disabled purely for "the record's state."** HE's rule: disable a row action only when the reason
  is about *who the viewer is* (permissions); when the reason is about the record's own state
  (already archived, already sent), instead render the action live and **let the server explain**
  why it can't proceed, rather than either omitting the action (a ragged, inconsistent column) or
  disabling it with an `sr-only` reason a sighted user never sees. The parallel rule for the confirm
  dialog itself: never attach a `confirm:` prompt to a branch that can't actually succeed — a
  confirmation should guard only what's genuinely about to happen.
- **Row-action icon buttons stay visually subordinate to the page's primary button.** SIF
  deliberately sized its row-action ghost buttons at `min-h-8` (32px) rather than the 44px
  touch-target figure, specifically because 44px would make a secondary, receding row action
  *taller* than the 40px primary button — inverting the intended visual hierarchy.
- **Row actions collapse into a menu at three or more — but a set that *varies by row* (different
  actions depending on the row's status or the viewer's role) collapses regardless of count, even
  at two.** A genuinely fixed set of one or two actions stays inline (HE).
- **Long free-text and identifier columns get their own component classes with measured caps**, not
  an unbounded column: HE's `.notes` clips at 16rem (the widest value that doesn't trigger sideways
  scroll on its densest table) and `.name` caps at 18rem (set from the longest real value actually
  in the database, not a guess). Distinguish `wrap-anywhere` content from `break-words` content per
  the constraint-width rule above.
- **A long URL shown in a table renders host-only and linked**, not as a truncated raw string — the
  full URL lives in the link's `href`/`title`. SIF's `format_url` helper does this specifically to
  avoid an unwrappable long string forcing the whole table to overflow, matching how Stripe, Linear,
  and GitHub render URLs in a table cell.
- **A row-level list/index action (archive, restore, delete) redirects back to the list it was
  triggered from — never to the affected record's own page.** SIF's reasoning: the click happened
  on a row, so the answer to "did it work" belongs on the list, alongside a confirmation message.
  Create and update actions are the opposite: they redirect *to* the record, because the user needs
  to see the result of what they just made or changed. Cited as consistent across Gmail, GitHub,
  Linear, and Stripe.
- **A person-record index needs three tabs, not two — Active / Archived / All — and the All tab
  needs its own visible status column.** SIF's pairing of two rules: a person (has a login) is
  Deactivated/Reactivated while a thing (no login) is Archived/Restored — see
  [§6.9](#69-page-headers-app-shell-and-sidebar-navigation) — and once a tab mixes both states, a
  status label becomes real information (not a redundant echo of which tab you're on), so the All
  tab is the one place a status column belongs. A row's action verb is a control, not information,
  and shouldn't be read as a substitute for a status column on the tabs where every row already
  shares one state.

### 6.5 Filter bars and date-range pickers

HE and SIF both use a **grid-based (not flex) filter bar**, submitting via **GET** so filtered
views are shareable URLs, with live-apply filtering (no separate Submit/Apply button) debounced on
text input (HE: 350ms). Both collapse into a summary-chip disclosure past a complexity threshold.
HE's own rule on *when* to collapse went through two iterations, and the final one is the one worth
adopting: not "collapse at 5+ filters," and not "always collapse regardless of count" either —
HE's later, settled rule (which superseded "always collapse") is **collapse only when the controls
don't fit on one line at the card's own width** (measured: up to 2 controls fit inline at roughly
530px against a ~1078px filter card; more than that collapses behind a "Filters" disclosure). Treat
the count-based rules as intermediate steps, not the destination.

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
- HE's field shape: 1px border, 8px/14px padding, 44px height, `slate-300` border.
- SIF's field token is `rounded-lg` (not `rounded-md`, which one drifted view used and which is
  explicitly called an error in SIF's own document) with the same `slate-300`/`shadow-xs` language.

**Placeholder text is `slate-500`, never `slate-400`** (see [§2.1](#21-shared-neutral--semantic-palette)).

**Field-width philosophy**: HE documents reconciling two different schools explicitly — Carbon/
Material/Polaris/Fluent's "field width should hint at expected content length" versus GOV.UK/
USWDS's "fields should be full-width/consistent regardless of content" — and lands closer to the
GOV.UK/USWDS side for consistency's sake, while allowing narrower fields for genuinely short,
fixed-format content (e.g. a short numeric code).

**A form is not centered just because it's short.** HE measured the actual cost: every page's
`<h1>` sits at a fixed x-position set by the shared page-header partial, so centering a form's
content shifts its heading **144–256px** sideways relative to the index page the user just came
from. Centering is reserved for a standalone page with no surrounding chrome to stay aligned with
(sign-in, a checkout flow) — an ordinary new/edit form stays left-aligned with everything else on
the page.

**A form's action row sits directly below the card it belongs to, without a divider** — HE notes a
form often spans more than one card and belongs to none of them individually, so the action row is
its own element, not a "footer" nested inside the last card. The primary button's position follows
**the row's own alignment edge**, not a fixed left/right rule: a right-aligned row (a header's
action slot) puts the primary last; a left-aligned action row (a plain form's Save/Cancel pair)
puts the primary first. HE found and fixed a case where it had this backwards.

**Radio and checkbox row spacing**: HE settled on a 24px row height with an 8px gap between options
— explicitly not GOV.UK's 40px+10px or Material's 48dp touch-list spacing, because those figures
are sized for a full-page public form or a touch-first list, not a dense in-app options group. The
generalizable point isn't the number — it's picking a spacing comparator from a system that shares
your actual context before reusing its figures.

**No `<optgroup>` inside a `<select>`.** HE avoids it for two reasons: the browser draws the group
label itself, with contrast the app can't control (measured as low as ~2.6:1 on macOS), and
grouping implies a hierarchy most filter/option lists don't actually have.

**Address fields**: a concrete, WCAG 1.3.5–conformant pattern from HE. `autocomplete="street-address"`
is only correct for a *single-line* whole-address field — a form split into two lines needs
`address-line1`/`address-line2` instead. A ZIP/postal field is `type="text"` with
`inputmode="numeric"`, never `type="number"` — a number input silently drops the leading zero in
several states' ZIP codes (MA, RI, NH, ME, VT, CT, NJ, PR) and breaks ZIP+4 entirely.
`autocomplete="off"` is required specifically when the field collects someone *else's* address (not
the signed-in user's own).

**A field the user must see or copy but shouldn't edit is `readonly`, not `disabled`** — see
[§4](#4-accessibility-standards) for why (a disabled field drops out of the keyboard tab order
entirely). **A form must never render a field as editable that the authorization policy will
silently discard on save** (SIF) — what's shown as editable has to match what's actually permitted
to persist, or a save that looks successful has quietly lost data.

**Type-ahead / multiselect** (SIF, `type-ahead-and-multiselect.md`): past roughly 10 options, a
plain checkbox group should become a searchable multiselect with removable chips rather than
growing the checkbox list further. Four rules survived SIF's own iteration on this component,
all framework-agnostic: clear the search query on selection (a stale query hides the option the
user just picked); address the control programmatically through its native `<select>`, never
through the visual widget's positional DOM (the widget can re-render and reorder); assert that
filtering worked by checking a *named decoy option's absence*, never by reading the menu
immediately after a keystroke (a read taken right after a change can capture the pre-change state
— a race, not a measurement); and an option's subtext must never read "never" as a value — it
reads as broken UI, not as a deliberate unused state.

**Autosave** (SIF): a full pattern for a form that saves without an explicit Save button.
- Save on blur, with a timer as a backstop only — never a timer alone, which leaves a window where
  an edit that hasn't been saved yet can be acted on (paid against, committed) elsewhere as if it
  had.
- Bind one save listener on the `<form>` itself, never one per field — a per-field listener silently
  drops edits made in any field that didn't get one.
- Keep the steady state visually quiet: no recurring "saved" timestamp; show "Saving…" only if a
  save is still in flight after roughly 800ms; a failure is the one state that persists on screen
  rather than clearing itself.
- Replace derived/computed output by the specific element's id when a save completes, never by
  re-rendering the whole table or form — re-rendering loses focus position and cursor placement.
- **A form is either "everything autosaves" (no Cancel button, no unsaved-changes guard — leaving
  the page *is* the save) or "explicit save" (a Cancel button plus a `beforeunload` guard) — never a
  hybrid of the two.** A form that autosaves some fields and requires an explicit save for others is
  the state to avoid; pick one model for the whole form.

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
- **A confirm dialog needs a working path without JavaScript, and a `button_to` confirm cannot live
  nested inside another `<form>`.** CASA found two related bugs worth generalizing: (1) a delete
  confirm's button nested inside a page's main form is invalid HTML — the browser submits the
  *outer* form instead of the intended one — so the confirm button needs its own separate, bodyless
  form referenced via the `form="..."` attribute; (2) a non-JS test (or a non-JS browser path) can't
  reach an `aria-label`'d icon-only close control, so a per-row delete dialog needs both a visibly
  labeled "Close" and a real, directly submittable `button_to` as its only way to confirm.
- **A confirmation dialog's stated consequence has to be literally true, and the mechanism behind
  it has to be verified, not assumed.** SIF found confirmations that were wrong in both directions:
  one promised an immediate loss of access that a discard didn't actually cause, another claimed an
  archive would sign someone out when nothing in the code did. The fix was at the framework level
  (a live `active_for_authentication?` check on every request), not a copy edit — before shipping a
  confirmation's wording, verify the code path actually produces the consequence the dialog claims.
- **A disclosure's open/closed state must survive a server round-trip.** An auto-submitting filter
  panel, or a validation failure that re-renders the page, can silently snap an open disclosure shut
  from under the user unless its state is carried through the request (a hidden field, or checking
  which panel's own action just failed) — extending the trigger-labeling rule below with a
  state-persistence rule CASA found necessary in practice.

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
and/or explicit text (see [§4](#4-accessibility-standards)). See also [§5.4](#54-icon-meaning-and-alignment-discipline)
for why a flash gets a plain glyph, never an icon tile.

**An auto-dismiss timer pauses on hover and keyboard focus** (WCAG 2.2.1) — CASA adds this
mechanism on top of the ~6-second delay, so a message can't disappear mid-read. Its removal is
handled with an inline style plus its own timer, not a CSS-class/`transitionend` handoff — a missed
`transitionend` event leaves the message stuck on screen forever (see the related
`prefers-reduced-motion` trap in [§4](#4-accessibility-standards)).

**A callout's dismissal should be compared against the condition's onset, not stored as a plain
boolean.** SIF stores a callout's dismissal as a `dismissed_at` timestamp compared against a
`since:` value marking when the underlying condition actually began, rather than a flat
"dismissed forever" flag — a boolean would hide a *recurrence* of the same warning triggered by a
new, unrelated cause. Useful for any persistent, dismissible banner that can legitimately reappear.

**Callout placement follows the scope of what it's about, not just vertical position on the
page.** HE's rule, confirmed by auditing 26 real callouts and finding only one misplaced: a callout
about the whole page/task sits directly under the page header, before any of the work it concerns;
a callout about one specific section sits with that section, even if that means it appears below
other cards on the page.

### 6.9 Page headers, app shell, and sidebar navigation

All three route every page's `h1` + optional subtitle + primary action through a **shared
page-header partial/component**, rather than hand-writing headers per page — explicitly to keep
title/subtitle/CTA spacing from drifting per page.

**Every sub-page reached *from* another page needs exactly one way back — never zero, never
two.** CASA and SIF converge on the same rule from different angles: a breadcrumb trail (for an
admin/deeper hierarchy) or a `:secondary` "Back to X" placed in the page header's own action slot
(for the app side) — never both on the same page, since a "Back to X" button at the page's foot is
dead weight once a breadcrumb already exists above it. CASA found this by auditing for dead-end
pages and eventually standardized it into the shared `_page_header` partial specifically because
hand-written headers kept drifting on this exact point (with an audited, exact 8px gap between the
back-link and the title beneath it). A breadcrumb trail must wrap (`flex-wrap`) rather than force
the page to scroll horizontally.

**Breadcrumbs**, documented in full by HE, follow the WAI-ARIA Authoring Practices Guide shape: a
named `<nav>` landmark, an ordered list, every ancestor rendered as a real link, and the current
page rendered as plain text with `aria-current="page"` — with a generated, `aria-hidden` separator
between items. HE adopted this as a wholesale replacement for scattered "Back to X" links across 99
call sites with no change needed at each individual call site.

**A page header's action row collapses to one primary plus a single "More" overflow, not a flat
row of equal-weight buttons.** CASA notes a real cost to burying a *frequently used* action inside
"More": beyond the UX cost, a `rack_test`/non-JS test suite can't open a native `<details>`
disclosure, so an overflowed action becomes harder to test as well as slower to reach — weigh both
costs before moving an action into overflow.

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
- **Keep navigation one level deep.** Move a growing list out of nav and into the page it names,
  rather than nesting it under a nav item (SIF).
- **A catalogue does not belong in the nav.** For a growing list of items (not a fixed set of
  destinations), reach for search/filter, a command palette, a recently-viewed list, or pinning —
  in that preference order — before adding it as scrolling nav content.
- **One drawer mechanism** for the mobile nav (a `drawer_controller` Stimulus controller, not a
  checkbox+label CSS-only toggle) — needed for reliable outside-click/Escape handling and to avoid
  the drawer-testing gotchas that show up specifically at 375px viewport width.
- Nav-row density differs by context in SIF: 36px on desktop vs. 44px in the mobile drawer (a
  uniform 44px on desktop was measured to overflow the nav's row budget).

**An avatar/account menu is for the signed-in person, never for the organization or
workspace** (HE) — observed identically across Slack, GitHub, Linear, Notion, Stripe, Atlassian,
and Shopify. A related, more general rule from the same investigation: **a given destination
should exist in exactly one nav surface.** HE found "Organization" duplicated in both the sidebar
footer and the account menu — invisible to every automated audit, because each one only checks
"can this be reached," never "is this reachable from more than one place."

**Deactivate a person, archive a thing.** SIF's naming split, itself citing the field's own
convergence: a record with a login (a person) is Deactivated/Reactivated; a record without one (a
thing — a course, a listing) is Archived/Restored. Slack, Google Workspace, and Okta use
"deactivate" for people; Gmail, Shopify, GitHub, and Notion use "archive" for things. See
[§6.4](#64-tables) for the three-tab/status-column index pattern this naming implies.

**Two link treatments for two different kinds of subject in a table or list row** (CASA): a
person's *name* is identifying text — dark, underlined only when it's genuinely clickable, and with
a **persistent** underline (never hover-only) when it is — kept separate from a record identifier
(a case number, a court date), which uses the ordinary brand-colored link treatment. Paired with a
rule against routing someone out of their current flow via a name link unless there's a guaranteed
way back to where they were.

**Entity/detail-page composition** — a cluster of generalizable lessons from SIF's own rework of
its heaviest detail pages:
- Two side-by-side collections is a two-column layout applied to the wrong content — a narrow
  secondary column is for metadata only; two genuinely full collections belong stacked, not side
  by side.
- Adding content to the top of a page has a real, measurable cost: it pushes down the first row of
  the content the page actually exists to show. Measure that first row's position before and after
  adding anything above it, rather than assuming there's headroom.
- A setting is not a page-header action. A setting states its current value in words and lives on
  its own section's header line — it's never a color-only toggle placed beside an unrelated "Add
  X" button.
- A card per list item, for a list of genuinely similar rows, is "card soup" — that's one card
  containing a `divide-y` list, not N separate cards.

**Settings pages with many groups use a two-pane master-detail layout**, not a single long
scrolling form (CASA): a sticky sub-nav rail beside a content column that shows one section's
fields at a time. The JS-driven single-panel behavior is progressive enhancement only — with
JavaScript off, every section stays visible and scrollable in document order, so a no-JS or
`rack_test` spec still finds every field.

### 6.10 Empty states

Three recurring shapes, documented most fully by SIF: a **cold-start** empty state (no data at all
yet — centered icon tile + heading + one-line explainer + a primary action to create the first
item), a **filtered-to-nothing** empty state (results exist but the current filter excludes all of
them — offer to clear filters, don't repeat the cold-start CTA), and a **delight/nothing-to-report**
state used deliberately on dashboards (a positive absence — e.g. "nothing needs your attention right
now" — withheld entirely rather than shown as a bare "no data," and shown only when there is
genuinely nothing to say).

**Illustration belongs in empty states and onboarding, never beside a live figure.** SIF's rule:
decorative art competes with a real number for attention and reads as marketing the moment it sits
next to something the user actually came to check — a live balance or stat sits on a plain card
with a neutral icon tile, never a tinted gradient panel with illustration (see also
[§6.3](#63-kpi-stat-cards-and-numeric-display)).

### 6.11 Charts and dashboards

**Correction:** HE's own charts are built on **Highcharts** (`shared/_highcharts`), not Chart.js —
SIF is the Chart.js project. CASA takes a third technical approach: bespoke, server-rendered SVG,
built specifically to hit the same accessibility bar the other two reach with a JS charting
library — a distinct line style *and* marker per data series (so color is never the only way to
tell two series apart), a `<table>` twin rendered behind every chart for screen-reader and
no-JS access, and a heatmap rendered as a sequential-hue table with the actual count printed in
every cell rather than color alone. All three converge on the same requirement (state is never
color-only, even in a chart) through three different technical means — worth citing as a genuine
three-way convergence on the *what*, not just a HE/SIF agreement on the *how*.

Both HE and SIF use a charting library rather than hand-rolled markup, layered with the same
numeral-never-colored discipline from [§6.3](#63-kpi-stat-cards-and-numeric-display) — a chart may
use color for its data series, but any adjacent KPI numeral stays neutral `slate-900`.

**A chart's series count is a constant the design picks — never a number the data happens to
supply.** HE's richest single decision on this: its own trend chart went through three complete
rebuilds (47 auto-generated series → an unbounded category stack → a capped 4-item multi-select)
before landing on a fixed, deliberately chosen series cap. Cites GA4 (the underlying table drives
what the chart shows, not the reverse), Amplitude and Grafana (a top-N cutoff plus an explicit
"Other" bucket), and Stripe (certain breakdowns are never charted at all, only tabulated). Treat any
chart whose series count scales with the size of the underlying dataset as a bug, not a feature.

---

## 7. Tone & voice & content

Content rules are documented most exhaustively in Human Essentials' Copy section, and are
consistent with CASA's and SIF's own copy guidance where each states them. Treat HE's version as
the canonical detailed statement of an RFG-wide house style:

- **Sentence case everywhere** — headings, labels, buttons, nav — never Title Case, never ALL CAPS
  for emphasis. The one documented exception across all three: CSV/export column headers, which are
  titleized (a spreadsheet convention, not a UI one). **A plain view-template grep will not find
  every violation** (CASA): copy also lives in `content_for :page_title` calls, decorator methods,
  `config/locales` YAML (attribute names, mailer subjects), and app-shipped seed/constant data —
  the last of which needs an actual one-time data migration to rename, since seeds are typically
  `find_or_create`-by-name and won't retroactively fix existing rows. A literal audit grep worth
  reusing: `grep '<h[123][^>]*>[^<]*:</h'` to catch a trailing colon on a heading or subtitle
  (colons are reserved for an inline `<dt>` fact label, never a heading).
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
  welcome email, a privacy policy, and marketing copy.
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
- **`dark:` compiles to a live `@media (prefers-color-scheme: dark)` rule regardless of whether the
  app implements a theme switch at all** (SIF). None of the three RFG apps ship a dark theme, but a
  stray `dark:text-slate-400` still ships to production and goes live for any user whose OS is set
  to dark mode — SIF measured one such "audited, 6.99:1, justified" class actually rendering
  **2.45:1** (an AA failure) in the wild, since the background never actually darkens to match.
  Grep for `dark:` in any app without a real theme switch; there shouldn't be any.
- **Prefer logical properties over physical ones** — `ms-`/`me-`, `ps-`/`pe-`, `text-start`/
  `text-end` instead of `ml-`/`mr-`/`text-left`/`text-right` — even in an English-only app (SIF).
  Tailwind v4 supports the logical forms today at zero cost; retrofitting them later, once
  hundreds of call sites exist, is the expensive path.
- **`100vh` is wrong the instant mobile browser chrome collapses or expands** — use `dvh`/`svh`
  instead for any full-viewport-height layout, so the measurement tracks the browser's actual
  visible area rather than a stale value (SIF).

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
design system** — a shared methodology across all three (accessibility, copy, layout, icon usage,
row-action weight), even though the specific tools are completely different implementations. HE's
companion methodology docs (`docs/table-audit.md`, `docs/view-audit.md`) describe a **DEFECT vs.
debt** severity distinction worth adopting generally: a defect is wrong now; debt renders correctly
but is implemented in a way that can't receive a system-wide fix.

**A shared "audit the audits" pattern**: HE, CASA, and SIF all independently describe deliberately
planting a known violation and confirming their own tooling catches it, as a self-test that the
audit itself hasn't silently gone stale. HE's version of this goes further and names the specific
ways a *positive*-only self-test still misses real failure: a **vacuous pass** (the check ran but
matched nothing, and a zero was never distinguished from "everything's fine" — print a per-check
count; a check that examined nothing has not passed), **no baseline** (a check with nothing to
compare against can't tell "unchanged" from "coincidentally identical"), **read-before-settle** (a
value read immediately after a DOM change can capture the pre-change state — see the type-ahead
race condition in [§6.6](#66-forms-and-fields)), **order dependence** (a check that only passes
given a specific run order isn't actually verifying the property it claims to), a **fixture
assumption** baked silently into the check itself, and simply measuring the **wrong metric**
entirely. A negative control — confirming the check *fails* on a case it should fail on, not just
passes on cases it should pass on — is what separates a real self-test from a vacuous one.

**What an audit cannot see** goes well beyond markup bugs. In addition to unbalanced/mismatched
HTML tags the browser silently recovers from, duplicate `<h1>`s inside a loop, and stray
template-expression output printing onto the page:
- **A native browser dialog (`window.confirm`) is structurally invisible to any DOM-scanning
  audit** — there's no element in the tree to query. HE found this only by listening for
  Playwright's own `dialog` event; a Capybara spec using `accept_confirm` can pass while proving
  nothing, since it never inspects what the confirmation actually said.
- **A feature-flag-gated page is invisible to a route-walking audit** that simply gets redirected
  past it, and **an empty seeded collection** can make an unlabelled repeating region "audit clean"
  at zero rows — neither failure mode shows up until the flag is on or the table has data (HE).
- **Anything hidden by a `md:hidden`/`lg:hidden` class at a viewport you didn't actually test.**
  CASA's own full-app sweep passed cleanly at 1400px and then found 6 real violations at 390px, all
  of them living in markup that only renders below a breakpoint — audit at more than one viewport,
  not just the one the tooling happens to default to.
- **Verifying a rendered visual detail (a CSS-drawn icon, a focus ring) needs shape-matching, not
  color-sampling alone.** A "darkest pixel" contrast check produced a false pass by matching an
  unrelated focus-state "×" glyph instead of the intended chevron — the fix compares ink
  bounding-box, ink-pixel count, *and* shape against a known-good reference in the same screenshot
  (CASA).
- **Testing a genuinely narrow mobile width requires overriding the browser's device metrics
  directly (via CDP), not just requesting a small window.** Headless Chrome clamps its minimum
  window to roughly 500px, so a naive `--window-size=375` run silently measures 500px and reports a
  false pass (CASA).

The shared lesson: an automated audit is a floor, not a certificate: it catches known patterns, not
"the page is correct."

---

## 9. Methodology: scope, and verifying claims before they're stated

**What this synthesis includes.** The nine core documents named in [README.md](README.md) were the
starting point; `table-audit.md`, `view-audit.md`, and `type-ahead-and-multiselect.md` were pulled
in afterward, after checking each project's own `docs/` directory for other design-relevant
material that the original nine didn't already cover. The bar for inclusion, applied throughout
this document: a rule earns a place here by being either a genuine cross-project convergence (the
three projects agreeing without having coordinated) or a single project's decision detailed and
generalizable enough that a fourth RFG app would want to know it exists. Project-specific
implementation plumbing — file paths, framework internals, one-off bugfixes with no reusable
lesson — is deliberately left out even when a source document covers it in depth; the full detail
behind every rule here remains citable in the matching `sources/` document.

**Citing another system is itself a discipline, not a decoration** — directly relevant to a
document that, like this one, leans on "X does Y" claims throughout. HE audited its own 97
citations of other design systems/products and found 32 asserting a false unanimity: a claim like
"three of four keep it in the toolbar" was true of the *category* of thing being cited but false of
the *specific behavior* actually being claimed. Four rules follow: name the specific artifact being
cited, or say "observed," rather than citing a vague category; check the specific behavior in
question, not just whether the cited system belongs to the right general category; a number belongs
to whoever actually measured it, not to whoever repeats it next; and avoid an absolute claim
("always," "every") unless every case was actually checked, rather than assumed from a pattern.
This document's own citations (Stripe, GitHub, Linear, Polaris, GOV.UK, and the others named
throughout) are held to the same standard the source documents set for themselves.

---

See [INCONSISTENCIES.md](INCONSISTENCIES.md) for the open cross-project contradictions this
synthesis deliberately did not paper over.
