# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What this repo is

Ruby For Good's global design system: [`design.md`](design.md), Tailwind v4 design [tokens](tokens/),
and an executable audit suite, meant for any Ruby For Good app (or any app at all) to migrate its
UI onto — not just Human Essentials, the app it started inside. See [README.md](README.md) for the
adoption-facing pitch and [ADR 13](docs/architecture/decisions/0013-genericize-the-design-system.md)
for the fork-and-genericize decision and what it actually involved.

`design.md` is the normative reference document. Every rule in it is tagged **Portable** (holds on
any app) or **Local** (this project's own specific answer — the practice of deciding may transfer,
the value doesn't); see [`docs/portability/design-md-tagging.md`](docs/portability/design-md-tagging.md)
for the full breakdown. Treat it the way [ADR 0010](docs/architecture/decisions/0010-adopt-a-documented-design-system.md)
and [ADR 0011](docs/architecture/decisions/0011-adopt-the-ruby-for-good-design-system.md) describe
it: normative, and kept current in the same change that touches the UI it describes. Any
contributor who introduces a pattern updates `design.md` in the same pull request; anyone who finds
a documented pattern wrong corrects it there rather than letting drift accumulate.

## Layout

- `design.md` — the design system itself: components, patterns, copy conventions, accessibility
  rules, backlog. Fully passed over once for the Portable/Local split.
- `tokens/` — design tokens as a Tailwind v4 `@theme` block (colour, type, spacing, radius,
  elevation), with the Portable rule and the Local default value stated separately for each. See
  `tokens/README.md`.
- `bin/design/` — the audit suite (~40 scripts: Ruby, JS/Playwright, Python), built on an
  **adapter seam**: a small `targets.js`-shaped file per app implements a nine-export contract
  (`BASE`, `PASSWORD`, `targets()`, `signIn()`, `visit()`, `RUNS`, `SECONDARY`, `ADMIN`, `PRIMARY`,
  plus optional per-audit exports like `PRIMARY_ALT_EMAIL` or `MODALS`), and most of the JS audits
  run unmodified against whatever the adapter points at. `bin/design/targets.js` is the original
  Rails/Devise adapter (this suite's origin app); `bin/design/README.md` documents what every
  script checks and why it's built the way it is.
- `examples/reference-app/` — a second, deliberately non-Rails, zero-framework Node adapter target
  (`bin/design/adapters/reference-app/targets.js`), built specifically to test whether the adapter
  seam's portability claim actually holds, not just to have a demo app.
- `docs/portability/` — the genericization work itself and its evidence trail:
  `audit-tooling-classification.md` (Phase 0/1 sort of every script — likely portable vs.
  Rails/Ruby-source-coupled vs. deliberate exception), `adapter-reference-app.md` (the measured,
  per-script outcome of running each "likely portable" script against the reference app — 22 of
  ~40 as of this writing, including honest vacuous-pass and crash findings alongside clean ones),
  `design-md-tagging.md`, and related notes.
- `bin/design/adapters/reference-app/known-outcomes.js` — a pinned-outcome regression harness: it
  re-runs every audit documented in `adapter-reference-app.md` and diffs its exit code against that
  documented outcome, failing on drift. This is the closest thing this repo has to a control
  harness (there's no Rails app here for `audit-selftest.js`'s mutation-injection approach to run
  against) and is what `.github/workflows/checks.yml` actually runs in CI, alongside syntax checks
  and a doc-link audit.
- `docs/` — supporting reference material: `onboarding.md`, `domain-model.md`, `migration-map.md`,
  `changelog.md`, `design-decisions.md`, `table-audit.md`, `todo.md`, `field-notes.md` (the
  evidence index), `architecture/decisions/` (ADRs — 0010, 0011, and 0013 are this repo's own
  load-bearing decisions about the design system itself; 0001–0009 and 0012 are Human Essentials'
  own historical app-architecture ADRs, carried over only because `design.md` or other docs link to
  them, not because this repo's own direction depends on them), and the mockup set under
  `mockups/`.
- `videos/` — before/after reference material (e.g. a pre-migration recording of a sibling app).
- `.claude/skills/` —
  - `design-system-migration` — the overall way of working: spec first, research industry
    precedent, preview before building, apply fixes broadly, enforce with executable audits.
  - `audit-suite` — writing checks you can actually trust (provenance, positive/negative controls,
    not trusting a green run).
  - `wcag-conformance` — WCAG 2.2 A/AA, including the criteria automated tools miss.
  - `evidence-discipline` — keeping claims in documentation true over time.
  - `session-durability` — not losing work across long sessions (commit/push discipline, detecting
    a reverted tree).

## Working here

- This has real git history now, pushed to `https://github.com/rubyforgood/designsystem`. Don't
  treat it as a fresh scaffold — check `git log` and the docs above before assuming something is
  unstarted.
- The audit suite genuinely runs here, against `examples/reference-app/`, and is enforced in CI
  (`.github/workflows/checks.yml`). Not every script is proven portable yet: read
  `docs/portability/audit-tooling-classification.md` and `adapter-reference-app.md` before assuming
  an unverified script will just work against a third app — some of the "clean" results already on
  record are documented vacuous passes (a selector coupled to Human Essentials' own CSS classes),
  not evidence the check is actually portable.
- When a script fails against a new adapter, prefer the fix pattern already established for
  `button-audit.js`, `form-validation-audit.js`, and `audit-selftest.js` (see
  `docs/portability/adapter-reference-app.md`'s "second batch" section): reparameterize the Local
  value as an optional adapter export with a graceful fallback, rather than hardcoding it in the
  audit or silently swallowing the failure.
- This has not been published to npm yet (see `README.md`'s Status section for the current state).
- Load `design-system-migration` before any nontrivial change to how the system is documented or
  organized — it's the playbook this whole repo's structure follows.
