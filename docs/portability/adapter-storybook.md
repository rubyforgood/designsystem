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
accessible. Two real v0.1.0 defects got past both audits:

- **`<rfg-table>`**: no cell style applied at all (`::slotted(table) td` matches nothing).
- **`<rfg-filter-bar>`**: no control belonged to its form, so it submitted nothing.

It runs 20 checks across 4 stories (two of each component): computed alignment, digits, padding,
borders, `white-space` and `text-overflow` for the table; for the filter bar, that every control
belongs to `bar.form`, that submitting includes every named control, and that the method is GET.
It exits 1 on any failure, and also when a story is missing or has nothing to check, so renaming a
story or emptying an example can't make it pass vacuously. It's wired into CI after the keyboard
audit.

**Controls, measured 2026-11-23:**
- **Positive:** against the current Storybook, 20 checks, 0 failed.
- **Negative:** Storybook rebuilt with `table.js` and `filter-bar.js` from the `v0.1.0` tag. The
  first version of the check failed 18 of 20. The two that passed were both "cells have padding"
  with a threshold of `> 0`: browsers give a table cell 1px of padding by default, so that check
  passed while every component style was missing. The threshold is now `>= 8px` (the component
  sets 10px), and with that change all 20 checks fail against v0.1.0.

Adding a check for another component: give its story the state the check needs (the filter bar
stories' controls gained `name` attributes for this), add a check function, and repeat the
negative control against a build that has the defect.

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
