# 13. Genericize the design system into an independent project

Date: 2026-09-23

## Status

Accepted.

Builds on [10. Adopt a documented design system](0010-adopt-a-documented-design-system.md) and
[11. Adopt the Ruby for Good design system](0011-adopt-the-ruby-for-good-design-system.md). Those
two decisions are unchanged and are Human Essentials' own — this ADR does not revise them. It
records a separate decision, taken in a new, independent repository forked from
`design.md` and its supporting tooling: to convert what those two ADRs describe into a design
system usable by other applications, not only this one.

## Context

`design.md`, the `bin/design/` audit suite, and their supporting docs were built entirely inside
Human Essentials, against Human Essentials' own screens, over the course of one migration.
Everything in them was correct by construction for that purpose: a normative spec doesn't need to
distinguish "true for this app" from "true for any app" when there is only one app.

Reusing that work elsewhere surfaces exactly the distinction its origin never needed to make. A
rule like "every interactive target is at least 24×24px" holds everywhere it came from — it's WCAG
2.2's own floor. A rule like "every control in an actions column is 28px" holds because 28px is
this app's kebab trigger's height, measured once and used everywhere since; a different app has no
reason to inherit that specific number, only the discipline of picking one and enforcing it. The
original documents didn't need to mark this distinction, and mostly didn't.

## Decision

1. Fork `design.md`, `bin/design/`, and the supporting `docs/` into an independent repository, and
   treat the result as its own project rather than a Human Essentials artifact — see that
   repository's own `CLAUDE.md`.
2. Tag every rule in `design.md` as **Portable** (holds regardless of stack) or **Local** (this
   project's own value; the *rule* to have a value may transfer, the *specific value* doesn't),
   per `docs/portability/design-md-tagging.md`'s pass and the convention in
   `.claude/skills/design-system-migration/reference/writing-rules.md`.
3. Extract Local values that are genuinely swappable (colour, type, spacing, radius) into a
   standalone token layer (`tokens/`), rather than leaving them stated only as prose and Tailwind
   classes inline in the spec.
4. Classify the audit suite the same way: which checks are portable via an adapter seam
   (`bin/design/targets.js` and its contract), which need genuine reimplementation against
   rendered output instead of Rails source, and which are Rails-specific reference
   implementations with no framework-agnostic equivalent worth guessing at. Prove portability by
   actually building and running a second adapter (`examples/reference-app/`,
   `docs/portability/adapter-reference-app.md`) rather than asserting it.
5. Keep the evidence — the measured numbers, the migration history, the decision log — intact and
   clearly dated and labelled as historical (`docs/field-notes.md`), rather than deleting it for
   being Local. The evidence is what makes the *portable* rules credible; discarding it to make the
   document "purely generic" would have thrown away the only thing distinguishing this system from
   an untested one.

## Consequences

A team adopting this design system now gets a document that tells them, section by section,
what's a rule to keep and what's a worked example to replace with their own answer — instead of a
spec that reads as uniformly authoritative and leaves them to guess which parts were arbitrary.

The cost is the same kind ADR 10 named for the original spec: upkeep. A Portable/Local tag is a
claim, and claims drift. The tagging pass was done once, in one project's judgement; the actual
test of a `Portable` tag is whether it survives contact with a stack that isn't Rails and Tailwind
— `docs/portability/adapter-reference-app.md` is the first such contact, not the last one this
project should expect to need.

This ADR does not claim the genericization is complete. `docs/portability/phase-3-source-audits.md`
names audits not yet reimplemented; `docs/portability/audit-tooling-classification.md` names a
real remaining gap in the adapter contract itself (its role names — `BANK`/`PARTNER`/`ADMIN` — are
still Human Essentials' vocabulary). Both are left as documented, known gaps rather than papered
over, the same discipline `design.md`'s own Backlog section asks of Human Essentials.
