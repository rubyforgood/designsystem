# Audit tooling: portability classification

Phase 0 of the genericization plan (see repo `CLAUDE.md` and the `design-system-migration` skill).
Measured against the actual `bin/design/` scripts in this repo on 2026-09-23, not assumed from
their descriptions in `bin/design/README.md`.

## The seam is already adopted — measured, not assumed

`bin/design/targets.js` is the adapter: it owns `targets()` (route enumeration), `signIn()`,
`visit()`, and the role predicates (`PRIMARY`/`SECONDARY`/`ADMIN` — renamed from this project's
original `BANK`/`PARTNER`/`ADMIN` on 2026-09-23; see `adapter-reference-app.md`'s "resolved" note
for why and how). Everything above that seam is a design rule; everything inside `targets.js` is
Rails.

```
$ ruby bin/design/seam-check.rb
audits with their own signIn: 0 (baseline 0)
no new copies
```

21 of the 22 JS audits `require("./targets")`. The one exception, `audit.js`, is deliberate —
`bin/design/README.md` documents it as a manual single-page debugging tool, not part of the
enumerated suite, so it hardcoding its own sign-in and a single path is by design, not neglect.

**This means Phase 1 of the genericization plan ("finish the seam") is essentially already done
in this codebase.** What's left is smaller than expected — see "Seam hygiene gaps" below — and the
bulk of Phase 1's effort should redirect to Phase 2 (proving the seam holds against a second,
non-Rails adapter).

## Classification

### Browser/rendered-output audits — likely portable via the adapter (21 files)

These read the DOM, computed CSS, and Playwright's own browser APIs. Their only coupling to Rails
runs through `targets.js`'s exports.

`address-audit.js`, `audit-selftest.js`, `button-audit.js`, `confirm-audit.js`,
`disclosure-audit.js`, `flash-of-hidden-audit.js`, `form-validation-audit.js`, `icon-audit.js`,
`keyboard-audit.js`, `layout-shift-audit.js`, `overlay-audit.js`, `responsive-audit.js`,
`route-sweep.js`, `row-actions-audit.js`, `tab-set-audit.js`, `table-audit.js`,
`tooltip-audit.js`, `wayfinding-audit.js`, `wcag-audit.js`, `wcag-manual.js`, `wcag22-audit.js`

Claim: **swap `targets.js` for a different adapter (different framework, different app) and these
should run unmodified.** Not yet verified against a second adapter — that's Phase 2. Treat as
"likely portable," not "portable," until that run happens.

### Deliberate exception (1 file)

`audit.js` — single-page manual tool, hardcodes sign-in and takes a path as a CLI argument by
design. Not part of the enumerated suite; not a seam gap.

### Source-reading audits — Rails-coupled by construction (9 files)

These read ERB templates, Ruby source, or `Rails.application` directly rather than rendered
output. Confirmed by grep, not inferred from naming:

| File | What it reads |
| --- | --- |
| `page-audit.rb` | `Dir.glob("app/views/**/*.html.erb")` |
| `copy-audit.rb` | `app/helpers`, `app/views` |
| `shell-first-audit.rb` | `Dir.glob(".../**/*.erb")` |
| `dead-code.rb` | `Rails.application`, `routes.rb` |
| `dead-routes.rb` | `app/views`, `Rails.root`, `routes.rb` |
| `route-shadow.rb` | `Rails.application`, `Rails.public_path` |
| `template-compile-audit.rb` | `app/views`, `Rails.root` |
| `undefined-classes.py` | `app/helpers`, `app/views` |
| `status.rb` | `app/views`, `app/controllers/**/*_controller.rb` |

These can't be made generic by swapping an adapter — reading ERB *is* the mechanism, the same way
reading JSX would be for a React source-reader. Per the plan's Phase 3, each gets one of two
treatments, decided per-audit rather than as a blanket policy:

- **Reimplement against rendered output**, where the rule doesn't actually need source. Best
  candidate: `undefined-classes.py` — "does this class exist in the compiled stylesheet" is
  answerable from rendered HTML + built CSS with no ERB in the loop.
- **Demote to a Rails reference implementation**, and promote the *rule* it encodes (not the code)
  into the portable spec/methodology, the same way `wcag-conformance` documents a criterion once
  regardless of implementation. A team on another stack inherits the tested rule and its
  false-positive history even without inheriting the Ruby.

`which-audits.rb` is infrastructure for the suite itself (it enumerates `bin/design/` and reads
`AUDIT-READS` declarations) — Rails-coupled the same way, same treatment applies if the suite is
ported.

### Self-contained, no app coupling at all (1 file)

`citation-audit.py` reads `design.md` and the decision log, not application source. Already
portable as-is — it would work unmodified on any spec file following the same citation convention.

## Seam hygiene gaps found during this pass

Two small things `seam-check.rb` doesn't catch, because it only checks for duplicated `signIn`:

1. **Fixed.** `BASE` was redefined independently in 20 files (`const BASE = process.env.BASE_URL
   || "http://127.0.0.1:3000";`) instead of imported from `targets.js`, which already exports it.
   All 20 now destructure `BASE` from `require("./targets")` instead of redeclaring it; verified
   with `node --check` on every edited file. `seam-check.rb` only ratchets `signIn` duplication —
   this class of drift had no ratchet at all.
2. **Found, not yet fixed — a real seam gap, not hygiene.** `wcag-audit.js` hardcodes
   `["sign in", "/users/sign_in"]` in its list of pages to scan while signed out
   (`SIGNED_OUT`, still live and used). A non-Rails adapter has no `/users/sign_in`. Needs a
   `signedOutTargets()`-shaped export on the adapter contract — deferred rather than done
   unilaterally, because it means extending the adapter *contract* itself (`adapter.md`), which is
   a design decision (what shape should "pages reachable while signed out" take across
   frameworks?) rather than a mechanical fix. Surface this again in Phase 2 once a second adapter
   makes the shape concrete.

**Bonus finding, same pass:** `wcag-audit.js` also carried three fully dead, hand-kept page lists —
`BANK` (36 HE routes), `ADMIN` (11 routes), `PARTNER` (10 routes) — superseded by the seam's
`allTargets()`/`forRole()` months ago per the file's own comment ("every screen the router knows,
not the four hand-kept lists below"), but never deleted. Confirmed zero references outside their
own declarations via grep, then removed (~72 lines). This is exactly the failure mode
`audit-suite` warns about — a stale list that looks like it's still doing something — and it was
also 57 HE-domain route strings (`/broadcast_announcements`, `/admin/ndbn_members`, etc.) that
had no business surviving into a generic system anyway. One less thing Phase 4 would've had to
notice and strip later.

## A third, larger gap found while building toward Phase 2: `RUNS`/role duplication

Before starting Phase 2's second adapter, a sweep for what would actually break against a
different app turned up something bigger than the two gaps above. `seam-check.rb` only measures
duplicated `signIn` *functions* — it says nothing about duplicated **credentials or role logic**,
and it turns out the two drifted independently.

**16 of the 21 seam-importing JS audits hardcoded their own copy of the three role emails
(`org_admin1@example.com`, `verified@example.com`, `superadmin@example.com`) and/or the
`/partners/`, `/admin` path-prefix predicates that `targets.js` already exports as `RUNS`,
`BANK`, `PARTNER`, `ADMIN`.** They correctly imported `signIn`/`targets`/`visit` from the seam —
so `seam-check.rb` read them as fully migrated — while independently re-deriving who to sign in
as. Three distinct shapes, all fixed the same session:

| Shape | Files | Fix |
| --- | --- | --- |
| Byte-identical `RUNS` array + local `PARTNER`/`ADMIN` predicates | `address-audit.js`, `confirm-audit.js`, `icon-audit.js`, `tooltip-audit.js`, `wcag-manual.js`, `wcag22-audit.js` | Import `RUNS` from the seam (aliased to each file's existing local name); delete the local predicates |
| `users`/`ROLES` object keyed by role name, built from the same three emails | `keyboard-audit.js`, `form-validation-audit.js`, `route-sweep.js`, `responsive-audit.js`, `layout-shift-audit.js`, `wayfinding-audit.js` | Derive the object from `RUNS` by matching each pair's predicate against `BANK`/`PARTNER`/`ADMIN`, instead of retyping the emails |
| A 2-role subset (`row-actions-audit.js`) or a single hardcoded `signIn` call (`audit-selftest.js`, `tab-set-audit.js`, one call inside `wcag22-audit.js`) | 4 files | Same derivation, filtered or reduced to the one email needed |

`wcag-audit.js` was a fourth, distinct shape — its own `forRole()` classifies by **controller
name** (`t.controller.startsWith("partners/")`), not by **path** like `targets.js`'s canonical
`PARTNER`/`ADMIN`. That's not just duplicated logic, it's a *second, independently-invented*
role-classification scheme, and the two are not obviously equivalent — `targets.js`'s `PARTNER`
predicate explicitly excludes `/partners/:id` as "a bank user looking at a partner record," and
it's not clear the controller-based version draws that same line. Fixed only the credential
sourcing (now pulled from `RUNS`) and left the classification logic alone, flagged in a comment —
unifying two role-classification schemes that might disagree on edge cases is a correctness
question, not a dedup, and not one to guess at without a live app to check against.

`button-audit.js` was the one file already doing this right: `const PASSES = [...RUNS, ["user_1@example.com", BANK]]` —
builds on the real `RUNS` import and adds one documented extra pass, rather than re-deriving the
whole thing. Left unchanged; it's the model the others now follow.

**Also centralized:** the `BANK_EMAIL`/`PARTNER_EMAIL`/`SUPER_EMAIL` env-var override capability
that four of the duplicated blocks had independently invented is now built into `targets.js`'s
`RUNS` itself, so consolidating the duplicates didn't silently drop functionality some of them had
and others didn't.

**Why this matters for Phase 2 specifically:** none of this would have been visible by just
swapping `targets.js` for a second adapter and seeing what breaks — it would have looked like a
break in the *audit's rule logic* (wrong page visited, wrong role) when the actual cause was a
credential the audit never got from the adapter at all. Finding it now, by grep rather than by a
confusing failure against an unfamiliar second app, is the cheaper way to have found it.

Verified: `node --check` on all 22 JS files, and `ruby bin/design/seam-check.rb` still reports
baseline (0 duplicated `signIn`). No live app exists in this repo to run the audits end-to-end
against, so this is verified at the syntax/static level, not by executing a full audit run — that
executable verification is exactly what Phase 2's second adapter is for.
