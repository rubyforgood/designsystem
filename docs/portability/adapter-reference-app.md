# Adapter: examples/reference-app

Phase 2's second worked example of the adapter contract in
`.claude/skills/design-system-migration/templates/adapter.md`, alongside `adapter-rails.md`. That
file says outright: "whether this shape survives contact with Django or Next.js is unknown until
somebody tries." This is the first actual try.

**The question this answers:** the audit tooling classification (Phase 0) claimed 21 of 22 JS
audits are "likely portable via the adapter." This runs 7 of them, unmodified, against a real
second app, and reports what actually happened — not what was assumed.

## The target

`examples/reference-app/` — a ~230-line Node `http` server, zero dependencies, zero framework.
Deliberately unlike Rails on every axis an audit might quietly assume: no ERB, no Devise (sign-in
fields are `#identifier`/`#secret`, not `name="user[email]"`), no Tailwind class vocabulary copied
from `design.md`, two roles instead of three (no partner-equivalent audience at all, rather than
inventing one to keep the shapes familiar). Built to fail honestly rather than to pass by
resembling Human Essentials.

The adapter: `bin/design/adapters/reference-app/targets.js`, implementing the same nine exports as
`bin/design/targets.js`. Route enumeration reads the app's own dispatch table
(`route-targets.js` — the "walk the app directory" case from `adapter.md`, since there's no
framework router to introspect). `PARTNER` is an honest `() => false`, not a fabricated third
role.

## Method

Copy an audit file **byte-for-byte**, unmodified, into the adapter's directory so its
`require("./targets")` resolves to the new adapter instead of Rails's. Run it against the running
reference app. If the claim "swap the adapter and it runs unmodified" is true, this either works or
fails for reasons that are about the *audit's own assertions*, not about wiring.

7 of the 21 "likely portable" audits were run this way: `keyboard-audit.js`, `tooltip-audit.js`,
`table-audit.js`, `disclosure-audit.js`, `wcag-audit.js`, `icon-audit.js`, `row-actions-audit.js`.
Chosen to span the different shapes Phase 1 found (plain seam import, the RUNS-duplicate pattern,
the 2-role-subset pattern), not to be a random sample.

## Results

| Audit | Outcome | Why |
| --- | --- | --- |
| `keyboard-audit.js` | **Clean.** Ran unmodified, 3 screens, no findings. | Pure focus/tabindex/`inert` checks — genuinely portable, no Local values embedded. |
| `wcag-audit.js` | **Clean**, after one bug fix (below). 3 pages, 0 axe violations, gracefully skipped 5 hardcoded HE paths as 404. | The axe-core scan itself is fully portable. The hardcoded `SIGNED_OUT` path list (already flagged in Phase 1) degrades gracefully instead of crashing — the `audit()` function's own status check absorbs it. |
| `disclosure-audit.js` | **Partial.** Correctly *found* the reveal via `aria-controls` — no coupling there — then flagged it as defective: 22px indent (wants ≥20px, passes), no left rule, hangs 12px off its trigger (wants 6px), doesn't line up with its label. | Detection mechanism is portable; the exact pixel thresholds are Local (confirms Phase 0's tagging of this section almost exactly). My reference app's CSS is reasonable, just not HE's specific numbers. |
| `table-audit.js` | **Silent vacuous pass.** Exit 0, reported `rows: 0` on `/dashboard`, which has a real 3-row table. | Selector is `table.data-table tbody tr`. My table has no `data-table` class. This is the exact "vacuous pass" failure mode `audit-suite` warns about — a clean exit that means nothing was actually checked, not that nothing was wrong. |
| `row-actions-audit.js` | **Same vacuous pass**, same cause. "0 tables, 0 with row actions." | Corroborates `table-audit.js` — the `.data-table` class-name coupling isn't a one-off, it's load-bearing across multiple audits. |
| `tooltip-audit.js` | **Crash.** Uncaught `TypeError: Cannot read properties of null (reading 'focus')`, exit 1. | Its keyboard-focus verification is hardcoded to `page.goto(BASE + "/donations", ...)` — a literal Human Essentials route — then queries `main .cell-actions [data-tooltip]` and calls `.focus()` on the result with no null check. Neither the path nor the selector exist on a different app, and the audit doesn't check before dereferencing. |
| `icon-audit.js` | **Crash**, different kind. `ENOENT: icon-lexicon.json`. | Not adapter coupling at all — `icon-audit.js` reads `bin/design/icon-lexicon.json`, a **content dependency** co-located with the script (the app's own icon-to-meaning vocabulary), declared honestly in its own header (`AUDIT-READS: RENDER, bin/design/icon-lexicon.json`). A third coupling category, distinct from code-coupling-to-Rails and hardcoded-pixel-values. |

## Bugs this run found in Phase 1's own fixes

Two of the seven crashed not from the audit's original code but from **my own Phase 1
de-duplication**, before this run:

- `wcag-audit.js`'s new `emailFor` derivation did `RUNS.find(([, p]) => p === PARTNER)[0]` —
  correct against the Rails adapter (which has all three roles) and an unguarded crash against
  this one (which has two). Fixed with optional chaining (`?.[0]`); the existing
  `if (email) await signIn(...)` guard downstream already handled an undefined email correctly, so
  the only bug was the `[0]` access itself.
- The same pattern, same fix, applied proactively to three more call sites written in the same
  pass (`tab-set-audit.js`, `audit-selftest.js`, `wcag22-audit.js`) before they could fail the same
  way, even though those look for `BANK` rather than `PARTNER` and are lower risk.

**This is the actual value of Phase 2, stated plainly:** these four bugs were invisible by
inspection. `node --check` passed on all of them; `seam-check.rb` passed; reading the code, the
derivation looked obviously correct. They only surfaced by running against an app with a
genuinely different role count — which is exactly why Phase 0's "likely portable, not yet
verified" hedge on the classification doc mattered, and why asserting portability without a
second adapter would have been wrong in a way nothing short of running one would have caught.

## What this means for the plan

Three distinct portability problems, not one, now with real instances of each:

1. **Adapter/wiring coupling** — fixed by Phase 1's work (the seam) and now measured, not just
   claimed, to hold for at least `keyboard-audit.js` and `wcag-audit.js`.
2. **Local values embedded in an audit's own assertions** (exact classes, pixel thresholds, a
   hardcoded path) — `table-audit.js`, `row-actions-audit.js`, `disclosure-audit.js`'s thresholds,
   `tooltip-audit.js`'s `/donations` + `.cell-actions`. This is Phase 4's job (reparameterize
   against tokens/config), not Phase 1/2's.
3. **Content dependencies co-located with an audit** — `icon-audit.js`'s lexicon file. Different
   from #2: not a value baked into code, a whole reference file the audit expects to find beside
   itself. Needs its own treatment — likely: the adapter directory supplies its own version of the
   file, the same way it supplies its own `targets.js`.

Also unresolved, surfaced again by actually building a second adapter (first noted in
`audit-tooling-classification.md`): **the contract's export *names* are Human Essentials'
vocabulary** (`BANK`/`PARTNER`/`ADMIN`), not generic ones. This adapter had to export under those
same names for the copied audit files' destructuring to resolve at all, even though this app's
actual roles are "member" and "admin." Renaming the contract itself is a bigger, separate decision
— noted, not done here.

## Reproducing this

```bash
npm install                                   # playwright, once
npx playwright install chromium               # browser binary, once
npm install --no-save --prefix /tmp/axe axe-core   # for wcag-audit.js only

node examples/reference-app/server.js &       # PORT defaults to 4100
rm -f /tmp/reference-app-targets.json         # force a fresh route list

cd bin/design/adapters/reference-app
node keyboard-audit.js                        # etc.
```
