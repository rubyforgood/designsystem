# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What this repo is

An independent design system, forked from the `design` branch of
[rubyforgood/human-essentials](https://github.com/rubyforgood/human-essentials) as a starting
point. `design.md` is the normative reference document — it currently describes the Human
Essentials app it was written for (component patterns, a Bootstrap 4 CSS / Bootstrap 5 JS dialect
split, semantic colour mapping, WCAG 2.1 AA as the accessibility bar, etc.). The goal here is to
evolve it into a standalone system, decoupled from that specific Rails app.

Treat `design.md` the way its origin ADRs describe it (`docs/architecture/decisions/0010-*.md`,
`0011-*.md`): normative, and kept current in the same change that touches the UI it describes. Any
contributor who introduces a pattern updates `design.md` in the same pull request; anyone who finds
a documented pattern wrong corrects it there rather than letting drift accumulate.

## Layout

- `design.md` — the design system itself: components, patterns, copy conventions, accessibility
  rules, backlog.
- `docs/` — supporting reference material pulled over because `design.md` links to it directly:
  `onboarding.md`, `domain-model.md`, `migration-map.md`, `changelog.md`, `design-decisions.md`,
  `table-audit.md`, `todo.md`, the relevant ADRs under `architecture/decisions/`, and the mockup
  set under `mockups/`.
- `bin/design/` — the audit tooling the system was originally enforced with (~40 scripts: Ruby,
  JS/Playwright, Python). **These assume the Human Essentials Rails app** — routes, views,
  `bin/rails runner`, a seeded dev server — and will not run here as-is. They're a reference for
  the kind of check ("does every icon-only control have a tooltip", "does any table lack a
  `<caption>`") worth rebuilding against whatever this system ends up governing. `bin/design/README.md`
  documents what each one checks and why it's built the way it is.
- `.claude/skills/` — skills carried over from the origin project:
  - `design-system-migration` — the overall way of working: spec first, research industry
    precedent, preview before building, apply fixes broadly, enforce with executable audits.
  - `audit-suite` — writing checks you can actually trust (provenance, positive/negative controls,
    not trusting a green run).
  - `wcag-conformance` — WCAG 2.2 A/AA, including the criteria automated tools miss.
  - `evidence-discipline` — keeping claims in documentation true over time.
  - `session-durability` — not losing work across long sessions (commit/push discipline, detecting
    a reverted tree).

## Working here

- This is a fresh, empty git history — there is no app underneath `design.md` yet. Don't assume
  Rails, Bootstrap, or the Human Essentials domain model apply going forward; `design.md`'s current
  content reflects where it came from, not a constraint on where this goes.
- Because there's no running app or audit tooling wired up yet, changes to `design.md` can't be
  enforced automatically the way the origin project did. Flag that gap rather than silently
  skipping verification.
- Load `design-system-migration` before any nontrivial change to how the system is documented or
  organized — it's the playbook this whole repo's structure follows.
