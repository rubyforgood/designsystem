# Open inconsistencies between the three projects

This tracks genuine contradictions between CASA, Human Essentials (HE), and Stocks in the Future
(SIF) — places where the three disagree about something that isn't supposed to legitimately vary.
It deliberately excludes per-project branding differences (brand color, domain terminology) that
are correct as-is and are documented in [design.md](design.md) instead. Each entry names the
concept, cites each project's position, and notes why it matters.

---

## 1. Breakpoint tiers

**CASA and Human Essentials** use Tailwind's full, unmodified 5-tier breakpoint set:
`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px. HE reconfirms this explicitly:
"Tailwind's breakpoints, unchanged: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536."

**Stocks in the Future** explicitly overrides this to two tiers:

> | **Large** | 1024px and up | `lg:` | Persistent sidebar, multi-column forms and layouts, full tables. |
>
> `sm:`, `md:`, `xl:` and `2xl:` are **not used**. Neither is a custom breakpoint.

**Why it matters:** these aren't just different choices about how many tiers to use on one
project — SIF's rule is stated as a ban on the exact tier set CASA/HE treat as their baseline. A
component or pattern written against one project's breakpoint assumptions (e.g. a 4-column grid
that steps down at `md:`/`lg:`/`xl:`) will not port to SIF without rework, and vice versa. If a
future shared component library is built across these apps, this has to be resolved or explicitly
parameterized per project — it can't be "the" RFG breakpoint set today.

---

## 2. WCAG conformance target

- **CASA**: targets **WCAG 2.1 AA**.
- **Human Essentials**: targets **WCAG 2.2 AA**.
- **Stocks in the Future**: `design.md` states **WCAG 2.1 AA** as the actual target.

**Why it matters:** WCAG 2.2 added new success criteria beyond 2.1 (e.g. target size minimum,
focus-not-obscured, dragging alternatives) — an app conforming to 2.1 AA is not automatically
conforming to 2.2 AA. A shared accessibility checklist or shared audit tooling built to one
project's target will either under- or over-check the other two.

*Note on a related but separate issue, not logged as a cross-project inconsistency here:* SIF's own
`design-instructions.md` (a different, less-reconciled document within SIF itself) states "WCAG 2.2
AA compliant" and includes an "Accessibility gate (WCAG 2.2 AA)" checklist, directly contradicting
SIF's own `design.md`. SIF's `design.md` documents itself as the reconciled, actually-adopted
version (with an explicit "Adopted from this document, and where it was overridden" table showing
what changed from the inherited CASA document), while `design-instructions.md` is judged to be an
earlier, stale draft — consistent with SIF's own stated document precedence order
(`responsive-design-guidelines.md` > `design.md` > `design-instructions.md` > code). This is an
intra-SIF documentation-staleness issue, not a cross-project contradiction, so it's not logged as
an item here — but it's worth SIF's own maintainers reconciling `design-instructions.md` against
`design.md` directly.

---

## 3. Icon system

**CASA and Human Essentials** both use **Bootstrap Icons** (`bi-*`), self-hosted as an icon font.
HE specifically rebuilt its Trix editor toolbar to replace Trix's own inline-SVG icons with
Bootstrap Icons, explicitly "so it would have one icon set" within the app.

**Stocks in the Future** uses **Lucide** instead, via the `lucide-rails` gem and a `lucide_icon`
helper that renders inline SVG (`aria-hidden` by default, inheriting `currentColor`).

**Why it matters:** this isn't just a different glyph style — it's a different rendering
mechanism (icon font vs. inline SVG) with different sizing, coloring, and accessibility-attribute
conventions. Any shared component that includes an icon (a badge, an icon tile, a button with a
leading icon) needs to be written against each project's own icon helper; there is no drop-in
shared icon component today.

---

## 4. Button and control height

**CASA and Stocks in the Future** both use `h-10` (40px) for buttons — CASA's shared button base
class is `inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm shadow-sm`,
explicitly citing this as "the mainstream medium-button height: Material 3, Chakra, shadcn." SIF's
buttons are likewise `h-10` (`min-h-10 py-2`, described as a minimum rather than a fixed height).

**Human Essentials'** buttons and general form controls are **38px** — not a Tailwind spacing-scale
step, but a value that falls out of `py-2` plus a 1px border plus the line-box height. HE measured
this drift across its own codebase before fixing it consistently to 38px (17 pages measured before
the fix: 25 controls at 38px "secondary," 16 primary + 4 ghost at 36px).

**This is not a clean two-value split, and needs to be stated carefully:** CASA *also* has a 38px
control tier, but for a different, narrower purpose — its filter-bar controls specifically. CASA
deliberately makes filter-bar controls "one step more compact than form fields": a filter-bar
`<select>` is `py-2 pl-3 pr-9` (38px), while CASA's ordinary form-field `<select>` is `py-2.5
pl-3.5 pr-9` (42px), and its buttons are 40px. So CASA actually runs a three-tier, role-based
control-height system (buttons 40px / form fields 42px / filter-bar controls 38px), where 38px
means "chrome above the data," not "the default control height."

**Why it matters:** HE's 38px is applied as its blanket button and form-control height, not
role-scoped the way CASA's 38px is. A component shared between CASA and HE that assumes "controls
are 38px" would be correct for HE's buttons but wrong for CASA's buttons (which are 40px) and would
misapply CASA's filter-specific compactness to contexts CASA never intended it for (ordinary
buttons and form fields). This should be resolved deliberately — either HE adopts CASA/SIF's 40px
button height, or all three agree explicitly that 38px is reserved for a "compact/chrome" role
rather than being the default control height.

---

## 5. Modal implementation architecture

**CASA and Human Essentials** both build modals on the **native `<dialog>` element** with
`showModal()`, getting focus-trapping, Escape-to-close, an inert background, and top-layer
rendering for free from the browser. Both needed the identical pair of Preflight-CSS-reset fixes:
restoring `margin: auto` (Tailwind's Preflight zeroes margins, which put every dialog in the
top-left corner until fixed — HE measured this across 28 files) and constraining `max-height`/
`max-width` so a long dialog can't grow past the viewport.

**Stocks in the Future** instead built a **custom modal shell** (`shared/_modal`, streamed into a
`#modal_frame`, a hand-built `bg-black/50` scrim behind a `rounded-2xl shadow-2xl` panel) rather
than wrapping the native `<dialog>` element.

**Why it matters:** this is an architectural difference, not just a styling one — SIF's custom
shell has to reimplement focus-trapping, Escape handling, and background inertness itself (or
accept not having them), which is exactly the class of behavior CASA and HE get for free from the
browser. If SIF's custom shell doesn't reimplement all of that, it may have accessibility gaps
(keyboard focus escaping the modal, background content remaining interactive/reachable by
assistive tech) that CASA and HE structurally cannot have. Worth a direct check of what SIF's
`shared/_modal` actually does for focus/keyboard handling, and whether migrating it to native
`<dialog>` is feasible.

---

## Considered but not logged

- **Icon-tile "compact" size** (28px in HE vs. 32px in SIF): a real numeric difference, but minor,
  and CASA's own compact-tile value was not confirmed during this synthesis pass — not logged as a
  firm inconsistency, noted instead in [design.md §5.2](design.md#52-icon-tile-pattern--shared) as
  an open question rather than a confirmed contradiction.
- **Pagination page size**: SIF's is a confirmed `PER_PAGE = 25`; CASA and HE both use Pagy but
  their exact per-page figure was not extracted from either source document during this pass — not
  logged here since no contradiction was actually confirmed (only an unconfirmed data gap on the
  CASA/HE side).
- **SIF's `design-instructions.md` vs. its own `design.md`** (WCAG version and Figtree-adoption
  wording) — see the note under [§2](#2-wcag-conformance-target) above; judged to be an intra-SIF
  documentation-staleness issue, not a cross-project inconsistency, and out of scope for this file.
