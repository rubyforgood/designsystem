# Adapter: the built Storybook site

A third worked example of `adapter.md`'s contract, alongside `bin/design/targets.js` (Rails) and
`bin/design/adapters/reference-app/`. Where the other two point the audit suite at a whole running
*app*, this one points it at the component layer itself (ADR 14) — proving (and, same as the
reference-app adapter, disproving in one case) that audits written against pages carry over to
audits run against isolated component stories.

## The target

`storybook-static/` (`npm run build-storybook`), served by `bin/design/adapters/storybook/serve.js`
— a plain Node `http` static server, no new dependency, matching `examples/reference-app/server.js`'s
own style. The adapter (`bin/design/adapters/storybook/targets.js`) reads `storybook-static/index.json`
directly for the list of stories rather than adding a generated-cache layer like the other two
adapters have — there's no expensive command to cache against here, just one already-fresh JSON
file.

One role only (`PRIMARY`; `SECONDARY`/`ADMIN` are both an honest `() => false`) — a component story
has no authentication and no audience split.

## Method

Same as the reference-app adapter: copy an audit file byte-for-byte into the adapter's directory
so its `require("./targets")` resolves here instead of Rails's, run it against the running
Storybook server, and report what actually happened.

## Results

| Audit | Outcome | Why |
| --- | --- | --- |
| `wcag-audit.js` | **Clean.** 10 pages (= 10 `<rfg-button>` stories) audited, 0 violations. 5 hardcoded Human-Essentials-specific `SIGNED_OUT` paths (`/users/sign_in`, etc.) gracefully skipped as 404, same as the reference-app run. | Real, meaningful evidence: axe-core's checks apply to a single rendered component exactly as well as to a whole page. |
| `keyboard-audit.js` | **Found and fixed a real bug, then clean.** First run: "0 screens checked" — not because there was nothing to check, but because the audit compares `new URL(page.url()).pathname` against the adapter's `t.path`, and Storybook addresses a story by query string (`/iframe.html?id=...`), which `.pathname` strips. The comparison could never succeed, so every target was silently skipped rather than erroring. | **Adapter-contract gap, not Storybook-specific**: nothing in `adapter.md`'s contract says a target's `path` can't contain a query string — it happened to be true for the Rails and reference-app adapters, and the audit quietly assumed it as if it were a rule. Fixed in `bin/design/keyboard-audit.js` by comparing `pathname + search` instead of `pathname` alone (see the code comment there). Verified non-regression with the reference-app adapter's own `known-outcomes.js` (22/22 still match, including `keyboard-audit.js`'s own documented "3 screens, no findings") before trusting the fix. Re-run after the fix: 10 screens checked, no findings. |
| `button-audit.js` | **Vacuous pass — not meaningful at this level, and said so rather than hidden.** "0 page headers checked", "10 headers carrying no action", "0 findings". | This audit checks **page-header button-group composition** — at most three actions, exactly one primary, primary last — which is a property of a *page layout*, not of one component. A bare component story has no `[data-page-header="actions"]` container at all, so the audit finds nothing to count on every single story. The 0 findings is not evidence `<rfg-button>` is correct; it's evidence this particular audit has nothing to check in isolation. It belongs in the suite that eventually audits a *page built from* these components, not in the gate for the component library itself. |

## A third, Storybook-only check: component behavior (added 2026-11-23)

`component-behavior-audit.js` lives in this adapter directory, not in `bin/design/`, because it
checks specific component stories rather than running against any app's targets. It covers what
axe and the keyboard audit can't see: whether a component *works*, not only whether it's
accessible. Two real v0.1.0 defects got past both audits and prompted it:

- **`<rfg-table>`**: no cell style applied at all (`::slotted(table) td` matches nothing).
- **`<rfg-filter-bar>`**: no control belonged to its form, so it submitted nothing.

**How it's organized.** One file per component in `behavior-checks/`, each exporting story entries
with either a `check` (run inside the page) or a `run(page)` (driven from Node with Playwright, for
real key presses, clicks and pointer movement). `ONLY=<component>` runs one file. It exits 1 on any
failure, and also when a story is missing or a check returns nothing, so renaming a story or
emptying an example can't make it pass vacuously. It's in CI after the keyboard audit.

**Coverage, measured 2026-11-23:** 29 files, one per component, 436 checks, 0 failed, in about 50
seconds (the flash-message auto-dismiss checks wait in real time).

**2026-11-24: three more checks, one more bug class.** Combobox, tag input and date range picker
drew a field's edge in `neutral-200`, 1.23:1 on white, below WCAG 1.4.11's 3:1 for the boundary
that identifies a control. Found while migrating SkillRx, not by a check: axe doesn't test 1.4.11
for borders. Fixed to `neutral-500` (4.76:1, like Material 3's outlined field and IBM Carbon), and
`field-edge.js` now measures each one's computed border against the background behind it.
Negative control: against the old borders all three fail at 1.23:1. 439 checks, 0 failed.

**Every check has a negative control.** Each was shown to report a failure when its behavior was
broken in the page (a method replaced with a no-op, an attribute stripped, a stylesheet removed),
without editing source. The table and filter bar checks were also run against Storybook rebuilt
from the v0.1.0 code: the first version failed 18 of 20, and the two that passed were a padding
check satisfied by the browser's default 1px, so its threshold is now `>= 8px` and all 20 fail.

**Bugs it found** (writing the checks for all 29 components), all fixed in v0.1.3:

- **`<rfg-tooltip>`**: not hoverable by a real pointer (the bubble vanished crossing the 8px gap to
  it), and once on the bubble, leaving it never hid it. WCAG 1.4.13.
- **`<rfg-date-range-picker>`**: the open panel was unstyled, because `<rfg-popover>` moves it to
  `<body>`, out of reach of the picker's shadow styles.
- **`<rfg-card>`**: `padded="false"` couldn't turn padding off.
- **`<rfg-page-header>`**: the gap between the back link and the title was 16px, not 8px.
- **`<rfg-menu>`** (story and docs): the disabled-items story used `disabled` on a button, which
  can't take focus, while its description said every item stayed reachable.

The five re-enabled checks were run against Storybook rebuilt from the v0.1.2 code, in a separate
worktree. Each one fails there and passes on v0.1.3.

Adding a check for a new component: give its story the state the check needs, add a file to
`behavior-checks/`, and show that each check fails when the behavior is broken.

## What this means for the plan

Two of the three audits originally slated for this phase (`wcag-audit.js`, `keyboard-audit.js`)
are genuinely meaningful against isolated components and are wired into CI
(`.github/workflows/checks.yml`'s `components-build` job). `button-audit.js` is deliberately **not**
wired in here — running it would produce a permanently-green, permanently-uninformative check,
which is worse than not running it at all (a false signal of coverage). It's the right audit to
revisit once a *page* is assembled from more than one component (Phase 5+), not before.

## Reproducing this

```bash
npm run build-storybook
node bin/design/adapters/storybook/serve.js 4300 &
npm install --no-save --prefix /tmp/axe axe-core   # wcag-audit.js's hardcoded path, see its own header
cp bin/design/wcag-audit.js bin/design/keyboard-audit.js bin/design/adapters/storybook/
cd bin/design/adapters/storybook
BASE_URL=http://127.0.0.1:4300 node wcag-audit.js
BASE_URL=http://127.0.0.1:4300 node keyboard-audit.js
BASE_URL=http://127.0.0.1:4300 node component-behavior-audit.js
```
