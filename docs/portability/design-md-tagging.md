# design.md: Portable/Local tagging pass

Phase 0 of the genericization plan. Tagging convention from
`.claude/skills/design-system-migration/reference/writing-rules.md`: **Portable** holds on any
app (WCAG, semantics, audit discipline); **Local** is a decision this project made — the rule or
pattern may transfer, the specific value/name/component never does. When in doubt, Local.

This is an inventory only. `design.md` itself is untouched — reorganizing the normative spec is a
call for the human running this project, not something to execute unilaterally from an audit pass.

**Rough total: ~430 distinct testable rules/conventions tagged. ~150 Portable (35%), ~280 Local
(65%).** The split is lopsided toward Local because most of the document is a *record of decisions
made for one app* (exact pixel values, Rails helper names, Tailwind classes, Human Essentials
domain nouns) rather than restatable principles — which is exactly what a normative spec written
for one product during a live migration should look like. The Portable third is concentrated in
three places: the WCAG coverage table, the audit-discipline sections, and the "Citing another
system" methodology — none of which mention Human Essentials at all.

## Summary by section

| Section | Rules (approx) | Split | Characterization |
| --- | --- | --- | --- |
| What this app is / Status | 8 | ~0% Portable | Entirely HE domain description — organizations, partners, event sourcing |
| Foundations: Typography | 10 | ~20% Portable | Semantic rules (heading = structure not size) portable; exact classes/px Local |
| Foundations: Sentence case | 8 | ~60% Portable | The *rule* (sentence case, no shouting) is portable; HE's exact class/CSS enforcement is Local |
| Foundations: Colour | 10 | ~50% Portable | "Never colour alone" (WCAG 1.4.1) portable; indigo/slate palette, exact hex/oklch Local |
| Foundations: Spacing/radius/elevation | 6 | ~0% Portable | Pure Tailwind scale values, this app's picks |
| Foundations: A value is not a style | 4 | ~75% Portable | "No inline style except CSS custom properties" is a portable principle |
| Foundations: Address fields | 9 | ~55% Portable | WCAG 1.3.5 + autocomplete token rules portable; HE's specific fields (ZIP, `third_party:`) Local |
| Foundations: Iconography | 12 | ~40% Portable | "One glyph, one meaning", icon-only needs a name: portable. The lexicon itself: entirely Local |
| Foundations: Accessibility | 15 | ~85% Portable | Landmarks, skip link, focus visible, disabled-link handling — nearly all WCAG-grounded |
| Foundations: WCAG coverage table | 55 criteria | ~95% Portable | The criteria are WCAG itself; only "verified by which script" is Local |
| Foundations: Audit discipline (testing the audits) | 10 | 100% Portable | This *is* the audit-suite skill's content, already generic |
| Components: Buttons | 6 | ~15% Portable | Variant/size *concept* portable; `essentials_link_button`, exact px Local |
| Components: Row actions | 35 | ~10% Portable | Almost entirely HE measurements (349px, 28px, specific tables) and Rails helpers |
| Components: Charts/comparison (nested under Row actions) | 20 | ~10% Portable | "series count is a design decision not data-driven" is portable; rest is HE chart specifics |
| Components: Filters | 25 | ~15% Portable | "Debounce text input", "no Apply needed" portable-ish; grid widths/breakpoints Local |
| Components: Date range picker | 12 | ~20% Portable | "Commit on selection" pattern portable; wire format, presets Local |
| Components: Tables | 45 | ~10% Portable | WCAG-grounded bits (caption, `scope=row`, focus on clip) portable; rest is HE measurement |
| Components: Forms | 10 | ~30% Portable | "Field takes grid column width" principle portable; simple_form specifics Local |
| Components: Rich text editor | 6 | ~5% Portable | Entirely Trix/HE-toolbar specific |
| Components: Line item rows | 10 | ~15% Portable | "Label once not per-row" is portable; rest is HE's line-item UI |
| Components: Modals | 6 | ~40% Portable | `<dialog>`/`showModal()` semantics portable; HE class names Local |
| Components: Popovers | 8 | ~40% Portable | Popover contract (Escape, focus return, outside-click) portable |
| Components: Flash messages | 4 | ~30% Portable | `role="status"`/`role="alert"` split portable; HE tone mapping Local |
| Copy | 25 | ~55% Portable | WCAG 2.4.4/1.3.3, gendered/ableist language, second-person voice: portable principles. HE's exact strings Local |
| Responsive | 15 | ~55% Portable | Breakpoint *discipline* (straddle testing, reflow at 320) portable; HE's actual breakpoints Local |
| Keyboard | 6 | ~80% Portable | `inert` for closed drawers, no positive tabindex, focusable scroll regions: all WCAG-grounded |
| Forms: required fields/errors | 20 | ~45% Portable | Error-summary-plus-inline pattern, aria-describedby wiring: portable. HE copy/specs Local |
| Empty states / Tabs / Pagination / Callouts / Disclosures | 25 | ~35% Portable | Component *contracts* (ARIA tablist, breadcrumb pattern) portable; HE band widths/copy Local |
| App shell (sidebar, bank/partner/auth shells) | 20 | ~5% Portable | Entirely HE's information architecture and nav labels |
| Key patterns (Turbo, Stimulus, multi-tenancy, print) | 8 | ~10% Portable | "Show the tenant everywhere" principle portable; Turbo/Stimulus specifics Local |
| Build | 10 | 0% Portable | Rails/Tailwind/Propshaft toolchain, entirely this app's stack |
| Citing another system | 4 | 100% Portable | Pure methodology — cite artefacts not categories, provenance on every figure. Zero HE content |
| Building or changing a page (checklist) | 10 | ~60% Portable | The checklist steps are mostly portable; the audit script names are Local |
| Backlog | — | N/A | Not rules — a punch list, doesn't tag |

## Section-by-section detail

### What this app is, and what the UI has to do / Status

All **Local** — this is a description of Human Essentials' domain (banks, partners, distributions,
event-sourced inventory) and its migration status (63/65 controllers, specific commit states).
Portable shape: a generic system's equivalent section should describe *its own* domain shape and
migration status, not carry these facts forward. Nothing here generalizes as a rule.

### Foundations — Typography

- Figtree, self-hosted, one typeface, no CDN — **Local**. Portable shape: pick one typeface,
  self-host it, declare it once.
- Exact class table (h1 = `text-2xl font-bold tracking-tight text-slate-900`, etc.) — **Local**.
- **Heading level is document structure, not size** — **Portable**. WCAG-grounded (heading order),
  holds on any app.
- Destructive ghost button is slate at rest, rose on hover/focus only — **Local**. Portable shape:
  don't let a repeated destructive control shout at rest; the *reasoning* (repetition dilutes
  signal) transfers, the exact tone mapping doesn't.

### Foundations — Sentence case

- **Sentence case for everything a person reads** — **Portable** as a house-style rule (many
  systems pick one case convention and enforce it); the *specific choice* of sentence case over
  Title Case is **Local** — a downstream team could legitimately choose Title Case instead and
  still be internally consistent.
- **A `text-transform` breaks the rule exactly as much as typing the capitals would** — **Portable**
  principle (the enforcement point is presentation, not just source text).
- Cross-reference checking (`page-audit.rb` resolves every markdown anchor) — **Portable**
  practice (link-checking your own spec is generically good); the specific tool is Local.
- Column heading exact classes (`text-xs font-semibold text-slate-500`, no uppercase/tracking) —
  **Local**.

### Foundations — Colour

- **Never colour alone** — **Portable**. Direct restatement of WCAG 1.4.1.
- Indigo brand scale, slate neutrals, exact token table — **Local**.
- Semantic tone mapping (success=emerald, warning=amber, danger=rose, info=sky) — **Local**
  pattern, but the *concept* of "one meaning per tone, consistently applied" is **Portable**.
- Text tones use the -700 step for contrast — **Local** value; **Portable** principle (pick a step
  that clears your contrast floor and use it consistently for text).

### Foundations — Spacing, radius, elevation

All **Local**. Tailwind's 4px scale is a third-party convention this app adopted unmodified; the
specific picks (card padding `p-5`, `rounded-2xl`, `shadow-sm` on cards only) are this app's alone.
Portable shape: pick a spacing scale (any consistent one), and use elevation sparingly and
consistently — but the specific values don't transfer.

### Foundations — A value is not a style

- **No `style` attribute except a CSS custom property carrying a runtime-computed value** —
  **Portable**. This is a general principle about separating presentation (stylesheet) from
  runtime data (markup), applicable to any templating system.
- **Give the custom property a fallback that fails safe** — **Portable**.
- The two examples (share-fill percentage, chart height) — **Local**, illustrative of HE's own
  features.

### Foundations — Address fields

- WCAG 1.3.5 Identify Input Purpose, correct `autocomplete` tokens per address part — **Portable**.
  This is close to a direct WHATWG/WCAG restatement and holds on any app collecting addresses.
- **ZIP/postal code is text with `inputmode="numeric"`, never `type="number"`** — **Portable**
  (holds for any postal-code-shaped field, not just US ZIPs, modulo which pattern).
- **`third_party: true`/`autocomplete="off"` when filling someone else's address** — **Portable**
  principle.
- The specific HE helper (`address_field`), the five-part US-only breakdown, and the `#address`
  migration history (StructuredAddress, the 2026-09-01 column drop) — **Local**, entirely HE's own
  data-model history.

### Foundations — Iconography

- **An icon beside its own label is decorative** (`aria-hidden`); **icon-only needs `aria-label`**;
  **icon-only control is a `<button>` never an anchor** — **Portable**, WCAG 4.1.2-grounded.
- **One glyph, one meaning, enforced by a lexicon the audit reads** — **Portable** as a *practice*
  (keep a single source of truth mapping meaning→glyph, audit against it); the lexicon's actual
  content (which Bootstrap Icons glyph means "export") is **Local** and specific to this icon set.
- Import/export direction confusion (server-frame vs. app-frame) — **Local** case study, though the
  underlying lesson ("pick one frame of reference and apply it consistently") is **Portable**.
- Bootstrap Icons as the icon set, `IconHelper#fa_icon` legacy shim — **Local**.

### Foundations — Accessibility

Nearly everything here is **Portable** — it's WCAG 2.2 AA restated for a general audience, even
though every example is drawn from HE:

- One `<main>` landmark, labelled nav, no duplicate landmarks — **Portable**.
- Skip link, visible on focus, not `.sr-only-focusable` (because that shifts layout) — **Portable**.
- One `h1`, no skipped heading levels — **Portable**.
- Every control named (label/aria-label/aria-labelledby) — **Portable**.
- **A link cannot be disabled** — use `aria-disabled` span, not a disabled anchor — **Portable**.
- Focus always visible, nothing removes `outline` without replacing it — **Portable**.
- Link styling needs a non-color cue on hover/focus (WCAG G183, 3:1 contrast argument) —
  **Portable** principle; the specific `.link-brand` class and its measured ratios are **Local**.
- Underline-at-rest for links inside prose vs. block-level links — **Portable** (WCAG 1.4.1
  reasoning), specific class **Local**.
- **User-supplied URLs never go straight into `href`** (XSS/`javascript:` scheme guard) —
  **Portable**, this is a general web-security rule, not design-system-specific at all.
- **A control that costs nothing to press stays live even when it's a no-op; one that costs
  something gets disabled** — **Portable** principle (the specific "Today button" example is Local).
- `aria-expanded`/`aria-controls` on disclosure triggers — **Portable**.
- `lang` bound to locale, no zoom lock in viewport meta — **Portable**.

### Foundations — WCAG 2.2 AA coverage table (55 criteria)

**Portable** almost in its entirety — the left two columns (criterion, level) are WCAG itself, not
an HE decision. Only the third column ("verified by") names HE's specific audit scripts, which is
**Local**. The *idea* of maintaining a criterion-by-criterion coverage table, with "not
applicable" reasoned rather than assumed, is itself a **Portable** practice worth carrying forward
as a template.

### Foundations — Audit discipline ("every check is tested twice", positive/negative controls, "what did it look at")

**100% Portable.** This section is, almost verbatim, the content that later became the
`audit-suite` skill. It carries no HE-specific content — the six-criterion table of "ways a check
lies", the positive/negative control requirement, "a zero is a finding" — all hold on any audit
suite for any product. This is arguably the single most valuable portable asset in the whole
document.

### Components — Buttons

- **Variant carries meaning, size carries context** (one visual treatment per role) — **Portable**
  as a naming principle; HE's four variants (primary/secondary/danger/ghost) and their exact looks
  — **Local**.
- `essentials_link_button`/`essentials_action_button`, GET-vs-POST distinction — **Local**
  (Rails-specific), though **"a thing that changes state is never a link"** is **Portable**.
- `UiHelper` legacy API note — **Local**, HE migration history.

### Components — Row actions (the largest section, ~35 rules)

Overwhelmingly **Local** — this is dense with HE-specific pixel measurements (349px, 28px, 170px,
241px…), specific page names (`/distributions`, `/partners`), and Rails helper names
(`essentials_row_icon_link`, `row-actions-audit.js`). The rules with portable shape, stripped of
HE's numbers:

- **Uniform visual weight for every action in a table row; the threshold for collapsing into a
  menu is judged per table, not per row** — **Portable** principle. Local: the exact "3+" threshold
  and 28px size.
- **A control whose available actions vary by row state collapses into a menu regardless of
  count** — **Portable**.
- **An icon-only control is named by an accessible-name mechanism, never the `title` attribute**
  (WCAG 1.4.13: hoverable, dismissible, persistent) — **Portable**, this is a direct criterion
  restatement.
- **A fixed-position popover panel needs to escape its ancestor's stacking context**, not just its
  overflow — **Portable** technical principle (a real CSS gotcha, framework-agnostic).
- **Destructive confirmation is app-owned, not the browser's native `confirm()`** — **Portable**
  UX principle; the specific `<dialog>` implementation and rails-ujs interception mechanics —
  **Local**.
- **An action that will fail is offered anyway; the server explains why, with the next step** —
  **Portable** UX principle, one of the stronger portable ideas in this section.
- **Confirmation dialogs shouldn't gate an action that can't yet occur** — **Portable**.
- Everything else (exact widths, specific tables, `essentials_row_icon_link`, `size-7`,
  `ghost_danger`, the frozen-column CSS mechanics) — **Local**.

### Components — Charts and comparison controls (nested under "Row actions" in the doc's actual structure)

- **A chart's series count is a constant the design picks, never a number the data supplies** —
  **Portable**, a genuinely reusable data-viz principle (also central to this session's own
  `dataviz` skill).
- **Colour alone cannot distinguish more than ~3 series and clear a 3:1 contrast floor** —
  **Portable**, this is closer to a measured fact about human color perception than an HE opinion.
- **Every chart has a table of the same figures beside it** (accessibility: charts aren't
  screen-reader-readable) — **Portable**.
- **A period chart takes a period range matching its granularity** — **Portable** shape; HE's
  specific month-range picker implementation — **Local**.
- Specific palette (`CHART_BAND_COLOURS`), HE's trend-chart history, comparison-window math — all
  **Local**.

### Components — Filters

- **Debounce text filters; apply select/checkbox/date filters immediately; no Apply button needed
  for a single control** — **Portable** UX pattern (though "no Apply" is contested even within the
  doc's own citations — GA4 disagrees).
- **A filter bar that doesn't fit on one line folds behind a disclosure, consistently, rather than
  by a shifting threshold** — **Portable** principle; the specific two-control threshold and
  271px grid — **Local**.
- **Filters submit via GET so the view stays a shareable URL** — **Portable**.
- **A filter the UI can't see (arrived via bare query param) can't be reversed by the user** —
  **Portable** principle, a good general filter-design lesson.
- Grid breakpoints, `FILTER_CONTROL_CLASSES`, Turbo frame wiring — **Local**.

### Components — Date range picker

- **Commit on selection, no Apply button, for a two-field custom range** — **Local** decision (the
  doc's own citations show this splits the industry — GA4 keeps Apply); Portable shape: pick one
  and be consistent, argue it from your own measured friction cost.
- **An end date before a start date is silently reordered, not rejected with an error** —
  **Portable** UX principle.
- Wire format, presets, exact trigger copy — **Local**.

### Components — Tables

- **A wide table scrolls sideways rather than squeezing rows** (WCAG 1.4.10 Reflow exemption for
  data tables) — **Portable**, direct criterion application.
- **Every table gets a `<caption>`** — **Portable**, WCAG 1.3.1.
- **`<th scope="row">` for the column identifying the row** — **Portable**.
- **A clipped/truncated cell needs a hover+focus reveal, WCAG 1.4.13-compliant, not `title`** —
  **Portable**.
- **A column earns its width by being worth scanning, not by being worth recording** — **Portable**
  principle for any dense-table design.
- **Selection UI only where a real batch action exists; don't add a checkbox column that leads
  nowhere** — **Portable**.
- **A `box-shadow` on a `<td>` doesn't paint under `border-collapse: collapse`** — **Portable**
  technical fact (a real, reusable CSS gotcha).
- **The document must never scroll sideways even when a table inside it does** —
  `overflow-x: clip` on the root — **Portable** technical principle.
- Stacking table-to-cards below a breakpoint, with restored ARIA table roles — **Portable** shape
  (the *problem* — a table's semantics break when display changes — and the *fix* — explicit
  `role="table"` etc. — generalize); HE's exact breakpoints (449px/689px) — **Local**.
- Everything else — frozen-column mechanics with exact `--pin-width`, `.data-table` class
  conventions, HE's specific column semantics (`.numeric`, `.notes`), the scroll-rail component,
  all specific pixel measurements — **Local**. This is the largest concentration of Local content
  in the document because it's mostly a record of *this app's* table-scrolling bug history.

### Components — Forms

- **A field takes the width of its grid column; narrow it only when it has neighbours to align
  against** — **Portable** layout principle, one of the more nuanced and reusable ideas here.
- **Required is stated two ways** (visual marker + `aria-required`) — **Portable**, WCAG-grounded.
- simple_form wrapper names, `essentials_form_for` — **Local**.

### Components — Rich text editor, Line item rows, Modals, Popovers, Flash messages

- **Native `<dialog>` + `showModal()` for the focus trap/inert background/top-layer** —
  **Portable** technical recommendation (native dialog over a hand-rolled modal is broadly good
  advice).
- **A popover must not trap focus or make the page inert** (the modal/popover distinction) —
  **Portable**.
- **`role="status"` for informational messages, `role="alert"` for warnings/errors** — **Portable**,
  ARIA-grounded.
- **Label table columns once in a heading row, not per-row per-control** — **Portable** principle
  for any repeating-row form.
- Everything else (Trix toolbar restyling, `essentials_sparkline`, `remove_element_button`, HE's
  specific dialog IDs and Stimulus controllers) — **Local**.

### Copy

- **WCAG 2.4.4 Link Purpose** ("click here" fails; name the destination) — **Portable**.
- **WCAG 1.3.3 Sensory Characteristics** (no "the button on the right") — **Portable**.
- **No gendered/ableist wording** — **Portable**.
- **No all-caps for emphasis** (screen readers read letter-by-letter) — **Portable**.
- **Second-person voice, consistently** — **Portable** *as a practice* (pick a person and stay
  consistent); the specific choice of "you" over "we" is arguably **Local** house style, though
  weakly so — most consumer software converges here for the same reason.
- **A subtitle says something the title doesn't** — **Portable** content principle, one of the
  stronger reusable ideas in the Copy section.
- **No "please" in instructions** — **Local** house style (GOV.UK/Mailchimp/Shopify convention,
  not universal — some products do want a softer tone).
- **Verify a copy claim against the code that implements it, not by grepping for it** — **Portable**,
  belongs equally to the `evidence-discipline` skill.
- Specific button-label counts, HE's own strings, the "Reason Provided: N/A" case study — **Local**.

### Responsive

- **Test at both sides of every breakpoint** (639/641, not just 640) — **Portable** audit
  discipline, a genuinely reusable testing practice.
- **1.4.10 Reflow tested at 320px** (defined by the criterion itself) — **Portable**.
- **The document root must never scroll sideways; a wide table scrolls in its own container** —
  **Portable**.
- **Touch-only controls get 44×44, not the 24×24 floor** — **Portable**, matches platform HIG
  guidance broadly (not just WCAG's floor).
- Tailwind's specific breakpoint values (640/768/1024/1280/1536), HE's shell-switch point — **Local**.

### Keyboard

- **An off-canvas panel must be `inert` when closed**, not just visually hidden — **Portable**,
  a strong, broadly-applicable technical rule.
- **A scroll container needs `tabindex="0"` to be keyboard-reachable** — **Portable**, matches axe's
  own `scrollable-region-focusable` rule.
- **Never a positive `tabindex`** — **Portable**.
- **Decorative-but-clickable elements (scrims, backdrops) stay non-focusable** when their action is
  also reachable another way (Escape, a real button) — **Portable**.

### Forms: required fields and validation errors

- **Required stated on the `<legend>` for a group, not repeated per-field** — **Portable**.
- **An error belongs to its field** (`aria-invalid`, `aria-describedby`) **and to a summary above
  the form** — **Portable**, this is close to the GOV.UK error-summary pattern, itself citable.
- **The error summary takes focus on a failed re-render** (because a full-page re-render otherwise
  leaves focus at `<body>`) — **Portable** technical principle, a genuinely subtle and reusable fix.
- **A live region must be inside the focused element, not equal to it** (double-announcement bug) —
  **Portable** technical fact about ARIA live regions + focus interaction.
- **Re-render the record that actually failed, not a freshly-built one** (or errors vanish) —
  **Portable**.
- **A failure the user can't retry doesn't return them to the form** (state failures vs. validation
  failures get different destinations) — **Portable** principle.
- **Don't mark a field required unless something enforces it** — **Portable**.
- HE's specific error copy, `EssentialsInputAria`, simple_form wiring — **Local**.

### Empty states, Tabs, Pagination, Callouts, Disclosures

- **Distinguish "nothing exists yet" / "filter matched nothing" / "genuinely nothing to do"** as
  three different empty states — **Portable** content-design principle.
- **Panel tabs (`role="tab"`) vs. page tabs (plain nav links)** — pick based on whether the tab is
  a URL — **Portable**, this is a real and under-known ARIA distinction.
- **A tab strip's position must not move between tabs of the same set** — **Portable** UX
  principle.
- **The breadcrumb structure follows the ARIA APG breadcrumb pattern** (ordered list, current page
  as plain text with `aria-current`) — **Portable**, direct pattern citation.
- **Pagination states the range and total, not just a page number** ("Showing 31–45 of 272") —
  **Portable** content principle.
- **Prev/Next stay rendered but disabled at the ends** (control set doesn't change width as you
  page) — **Portable** UX principle.
- **A callout's placement follows its scope** (whole-task callouts above the work; section-scoped
  callouts sit with their section) — **Portable** principle.
- HE's exact band widths, `essentials_pagination_footer`, the three pagination-size bands (TALL/
  MEDIUM/COMPACT with HE's row counts) — **Local**.

### App shell (Sidebar rules, Bank/Partner/Auth shells)

Almost entirely **Local** — this is HE's specific information architecture (34 sidebar
destinations grouped into Operations/Inventory/Network/Reporting), its two audiences (bank vs.
partner), and its three shell layouts. The closest things to portable rules:

- **Icons mark the top level of a nav only, never nested items** — **Portable** principle for any
  multi-level nav.
- **A group holds at most ~7 items before it needs a landing page instead** — **Local** number,
  **Portable** shape (pick a ceiling, don't let a group become "a menu inside a menu").
- **A destination appears in exactly one navigation surface, not two** — **Portable**.
- **The tenant/workspace name is visible everywhere in a multi-tenant app** — **Portable** principle
  for any multi-tenant product, though phrased here entirely in HE's terms.

### Key patterns (Turbo, Stimulus, multi-tenancy, print)

- **Multi-tenancy is visible everywhere** — **Portable** principle (restated from the shell
  section).
- Turbo-opt-in-per-action, Stimulus controller list, print target list — **Local**, entirely
  Rails/Hotwire-specific implementation detail.

### Build

**100% Local.** Tailwind v4.3.3 via `tailwindcss-rails`, Propshaft, no Node — this is entirely
Human Essentials' specific toolchain and has no portable shape beyond "document your build
toolchain," which isn't really a design-system rule at all.

### Citing another system

**100% Portable**, and arguably the second most valuable section after the audit-discipline one:

- **Name the artefact, or say "observed"** — don't claim a system's rule if it never published one.
- **Check each cited system against the specific behaviour, not the category it belongs to.**
- **A number belongs to whoever measured it** — mark recalled/attributed figures as such.
- **Avoid absolutes ("all", "none") unless every case was actually checked.**

None of this mentions Human Essentials. It's a general methodology for writing an evidence-based
design document and reads as already-portable.

### Building or changing a page (the closing checklist)

Mostly **Portable** as a checklist shape (one h1, name every control, colour is never the only
signal, run an audit before shipping) — though several steps name HE's specific scripts
(`bin/design/audit.js`) which are **Local**. Good candidate for direct adaptation: keep the
checklist shape, swap in whatever this project's own audit tooling ends up being.

### Backlog

Not rules — a punch list of known gaps in Human Essentials specifically (Brakeman warnings, an
unmigrated stylesheet, missing dark mode). Doesn't tag; entirely **Local** by nature, and not
useful content to carry forward at all (it describes debt in a codebase the generic system won't
share).

## Rules that don't fit either bucket cleanly

- **Sentence case vs. Title Case** (Foundations). The *practice* of picking one case convention
  and enforcing it mechanically is Portable; the specific choice of sentence case is defensible
  either way and reads as a house-style call HE made rather than a fact about the world. Tagged
  Local above, but flagged here because the section spends real argumentative weight on it as if
  it were closer to settled — a downstream team might reasonably read it as Portable and inherit
  a preference that isn't actually load-bearing.
- **"No please" in instructions.** Cites GOV.UK, Mailchimp, and Shopify as agreeing, which by the
  document's own "Citing another system" standard is legitimate corroboration for *a* house style,
  but it's still a style choice, not a WCAG criterion. Tagged Local; a reasonable person could
  argue it belongs in a "strongly recommended default" tier between Portable and Local that the
  current binary tagging doesn't have room for.
- **Second-person voice ("you", never "we"/"my").** Very close to universal in consumer software,
  argued from six citations, but the document itself carves out three legitimate exceptions
  (marketing copy, legal text, a genuine letter) — which suggests the *rule* is actually "pick a
  voice deliberately, and know when a different one is warranted," which is Portable, while "always
  second person" as stated is a slight overclaim. Tagged Local above out of caution.
- **The 28px row-action icon size.** Explicitly flagged in the source text itself as "the 28 is
  ours, derived from [our] kebab trigger" — this is the document being honest about its own
  Local/Portable boundary already, and is the clearest example in the whole file of the pattern
  `writing-rules.md` asks for. Not ambiguous, but worth citing as the model example when writing
  the *next* version of this spec.
- **Chart series-count and colour-distinguishability rules.** These read as closer to Portable than
  typical Local component rules because they're grounded in measured facts about human colour
  perception and a documented, unsolvable-by-choice constraint (at most 3 mutually-3:1 colours on
  white) rather than in HE's taste. Tagged Portable above; flagging here because it's a judgment
  call whether "grounded in a hard constraint" is enough to promote something out of Local when it
  still lives inside a very HE-specific chart component.
