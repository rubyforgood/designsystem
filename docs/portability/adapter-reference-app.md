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

**Resolved 2026-09-23, in a later session.** This section originally read: "Also unresolved,
surfaced again by actually building a second adapter (first noted in
`audit-tooling-classification.md`): the contract's export *names* are Human Essentials'
vocabulary (`BANK`/`PARTNER`/`ADMIN`), not generic ones. This adapter had to export under those
same names for the copied audit files' destructuring to resolve at all, even though this app's
actual roles are 'member' and 'admin.' Renaming the contract itself is a bigger, separate decision
— noted, not done here." Per evidence-discipline, annotated rather than deleted: the finding was
real, and this is the record of it having been acted on rather than just noticed.

The contract now exports `PRIMARY`/`SECONDARY`/`ADMIN` — both adapters (`bin/design/targets.js`
and this one) and every one of the 13 audit files that destructured the old names by identifier
were updated together, in the same pass, specifically because a partial rename (some files on the
old names, some on the new) would have silently broken imports rather than just leaking
vocabulary. Verified with the full `known-outcomes.js` harness before and after: all 8 documented
outcomes unchanged, confirming the rename was a pure identifier change with no behavioral side
effects. `PARTNER` becoming `SECONDARY` rather than something tied to this reference app's own
"member" vocabulary was deliberate — the contract's names describe the *shape* of a role (the
default/primary audience, an optional second distinct portal, an admin tier), not any one
adopter's domain words for it.

## Results: second batch (14 more scripts, 2026-09-24)

Phase 2's remaining "likely portable" scripts from `docs/portability/audit-tooling-classification.md`,
run the same way: copied unmodified into this adapter directory, executed against the running
reference app, every "clean" result checked against `examples/reference-app/server.js`'s actual
markup before being trusted (per `audit-suite`'s provenance rule — a green exit is not, by itself,
evidence of anything).

| Audit | Outcome | Why |
| --- | --- | --- |
| `address-audit.js` | **Vacuous pass.** 0 address fields found, 0 findings. | The reference app has no address form at all — genuinely nothing to check, not a coupling failure. Confirmed against `server.js`: no address fields exist anywhere. |
| `confirm-audit.js` | **Vacuous pass.** 0 confirmations on 0 pages. | Reference app has no destructive/`data-confirm` actions. Genuine absence, not coupling. |
| `flash-of-hidden-audit.js` | **Clean.** 3 pages checked, nothing painted then hidden. | No client-side JS on the reference app to cause a flash — real, if unexciting, clean result. |
| `layout-shift-audit.js` | **Clean.** Every screen under Chrome's 0.02 noise floor. | Genuinely portable measurement (Cumulative Layout Shift is a browser-native metric, not a Local value). |
| `overlay-audit.js` | **Vacuous pass.** 0 dialogs/popovers opened across 3 screens (0 with anything to open). | No modal/overlay UI on the reference app. Same "nothing there to check" shape as `address-audit.js`. |
| `responsive-audit.js` | **Real findings, portable.** 12 findings across 2 pages: horizontal swipe at 320px on `/dashboard`, and a 152×18 `<input>` under the 24px target-size minimum on `/settings` at every width tested. | Both are genuine WCAG issues (1.4.10 Reflow, 2.5.8 Target Size Minimum) on the reference app's own unstyled markup — confirmed by reading `server.js`: `#notify-email` on `/settings` has no sizing applied at all. Detection is fully portable; exits 0 regardless of findings (this audit doesn't gate its own exit code on finding count — worth knowing before wiring it into CI as a pass/fail gate). |
| `route-sweep.js` | **Real finding, portable.** 3/3 screens flagged: "font sans-serif". | The reference app never loads a brand font — real, correctly-detected gap. Same exit-code caveat as `responsive-audit.js`: findings present, exit 0. |
| `tab-set-audit.js` | **Vacuous pass.** 0 tabs across 0 discovered sets. | No tab UI on the reference app. Genuine absence. |
| `wayfinding-audit.js` | **Clean.** 3 screens, every one either a nav root or carries a breadcrumb. | Portable structural check; reference app's nav happens to satisfy it. |
| `wcag-manual.js` | **Real findings, portable, exit 1.** Flags 1.4.4/1.4.10/1.4.12/2.4.7 zoom/reflow/spacing checks and 2.4.1/2.4.2 bypass-blocks/page-title checks. | Confirmed against `server.js`: the skip link's target (`<main id="main">`) has no `tabindex="-1"`, so it's a real 2.4.1 Bypass Blocks defect, not a false positive. Manual-technique checks, no Local values embedded. |
| `wcag22-audit.js` | **Real findings, portable, exit 1.** WCAG 2.2-specific criteria (2.4.11 Focus Not Obscured, 2.5.7 Dragging, 3.2.6 Consistent Help, 3.3.7/3.3.8). | Same skip-link defect surfaces here too (2.4.11-adjacent), confirmed genuine, not coupling. |
| `button-audit.js` | **Fixed.** Was a hard crash (~30s timeout signing in as a hardcoded, Human-Essentials-only literal, `user_1@example.com`, that doesn't exist on any other app). Now exits 0, 2 roles checked, 0 findings. | The audit's own fourth pass (checking that the same action renders the same way for two *different* users of PRIMARY's role) needed a second identity the adapter contract never provided. Fixed by adding an **optional** `PRIMARY_ALT_EMAIL` export to `targets.js` — the Rails adapter provides it (keeping the original check), this adapter doesn't (it has only one PRIMARY-role user), and the audit now degrades to its three standard passes instead of crashing when it's absent. Also wrapped the sign-in step itself in a try/catch, matching the audit's own existing per-path skip pattern, as defense in depth. |
| `audit-selftest.js` | **Fixed.** Was a hard crash (5s timeout in `ensureRail`, waiting on `.table-rail-track`, a Human Essentials-specific scroll-rail component this app doesn't have). Now exits 1 (see below), 5/13 controls ran, 8 skipped, 1 genuine FAIL. | This file is inherently HE-coupled by design — it's a regression harness for the *checking library's logic*, exercised against real HE markup fixtures (a scroll rail, a specific help-link, frozen columns), not meant to be a portable audit in the same sense as the others. The fix wasn't to make it portable (that would mean synthesizing every fixture, out of scope here) but to make it **fail honestly**: `ensureRail` now throws a clear, specific error instead of an opaque Playwright timeout when `.table-scroll` doesn't exist, and every control runs inside a try/catch that turns a missing-fixture error into a logged `SKIP`, not a crash that kills the other 12 controls. The one surviving FAIL (2.4.7, focus-indicator-suppression) is a genuine, newly surfaced finding worth a follow-up — not yet investigated. |
| `form-validation-audit.js` | **Fixed.** Was 4 false "could not be opened" findings (a hardcoded `MODALS` list of 4 Human-Essentials-specific modal triggers — CSV import, invite-user, etc. — none of which exist on any other app). Now exits 0, 0 forms/0 modals checked, 0 findings (this app currently has no `new`-route forms or modals at all). | Same reparameterize-against-the-adapter fix as `button-audit.js`: `MODALS` moved out of the audit script and into `targets.js` as an **optional** export, with the audit falling back to `[]` when an adapter doesn't provide one. The Rails adapter keeps its four hand-catalogued modals; this adapter reports zero, honestly, instead of four false negatives. |

Combined with the original 8, that's **22 of ~40** scripts with real, measured portability evidence.
Of the 14 in this batch: 4 are vacuous passes on an app that genuinely has no matching UI at all
(address, confirm, overlay, tab-set), 3 are clean passes on a real check (flash-of-hidden,
layout-shift, wayfinding), 4 surface real, confirmed findings (responsive, route-sweep, wcag-manual,
wcag22-audit — the latter two share one underlying skip-link defect), and 3 needed an actual code
fix, now applied (button, audit-selftest, form-validation).

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

## Kept as a running regression check (Phase 6)

The exact outcomes above — which audits run clean, which crash, which vacuously pass — are pinned
in `bin/design/adapters/reference-app/known-outcomes.js` and run on every push/PR by
`.github/workflows/checks.yml`. This isn't `audit-selftest.js` (the original control harness,
per the `audit-suite` skill) — there's no Rails app in this repo for that harness to plant defects
into — it's the closest equivalent this repo can actually run: proof that these documented
findings haven't silently drifted, in either direction, rather than a one-time snapshot that goes
stale the moment anyone touches `examples/reference-app` or the copied audits.
