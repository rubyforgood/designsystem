# Ruby for Good — Design System

This repo holds the unified design system for Ruby for Good's Rails applications — **CASA**,
**Human Essentials**, and **Stocks in the Future** — synthesized from each project's own design
documentation.

- **[`design.md`](design.md)** is the master document: the synthesized design system, covering
  principles, color/typography/spacing foundations, components and patterns, accessibility
  standards, content/voice guidelines, and shared technical conventions. Where the three source
  projects agree, it states the rule once as the shared standard. Where a value is legitimately
  project-specific (a brand color, for instance), it's stated explicitly per project rather than
  papered over.
- **[`INCONSISTENCIES.md`](INCONSISTENCIES.md)** tracks the open, *real* contradictions between the
  three source projects — places they disagree about something that isn't supposed to legitimately
  vary (breakpoint tiers, accessibility conformance level, icon system, control height, modal
  implementation). This is separate from `design.md` on purpose: `design.md` is the settled
  synthesis, this file is the honest list of what hasn't been reconciled yet.
- **`sources/`** holds each project's original design documentation, copied verbatim for
  provenance. Every file below is exactly as it exists in the source repo at the time this synthesis
  was built:

  | File | From |
  |---|---|
  | `sources/casa/design.md` | rubyforgood/casa, `main` branch, `design.md` |
  | `sources/casa/design-todo.md` | rubyforgood/casa, `main` branch, `design-todo.md` |
  | `sources/human-essentials/design.md` | rubyforgood/human-essentials, `design` branch, `design.md` |
  | `sources/human-essentials/design-decisions.md` | rubyforgood/human-essentials, `design` branch, `docs/design-decisions.md` |
  | `sources/human-essentials/accessibility.md` | rubyforgood/human-essentials, `design` branch, `docs/accessibility.md` |
  | `sources/human-essentials/table-audit.md` | rubyforgood/human-essentials, `design` branch, `docs/table-audit.md` |
  | `sources/human-essentials/view-audit.md` | rubyforgood/human-essentials, `design` branch, `docs/view-audit.md` |
  | `sources/stocks-in-the-future/design.md` | rubyforgood/stocks-in-the-future, `stocksdesign` branch, `design.md` |
  | `sources/stocks-in-the-future/design-instructions.md` | rubyforgood/stocks-in-the-future, `stocksdesign` branch, `design-instructions.md` |
  | `sources/stocks-in-the-future/design-todo.md` | rubyforgood/stocks-in-the-future, `stocksdesign` branch, `design-todo.md` |
  | `sources/stocks-in-the-future/responsive-design-guidelines.md` | rubyforgood/stocks-in-the-future, `stocksdesign` branch, `docs/responsive-design-guidelines.md` |
  | `sources/stocks-in-the-future/type-ahead-and-multiselect.md` | rubyforgood/stocks-in-the-future, `stocksdesign` branch, `docs/type-ahead-and-multiselect.md` |

  The `table-audit.md`, `view-audit.md`, and `type-ahead-and-multiselect.md` files weren't in the
  original nine documents this synthesis started from — they were pulled in after checking each
  project's `docs/` directory for other design-relevant material (see `design.md` §9 for the
  reasoning on what was included vs. left out).
- **[`.claude/skills/`](.claude/skills/)** holds five Claude Code skills copied verbatim from
  Human Essentials' `design` branch (`.claude/skills/`) — the working method behind that branch's
  migration, not project-specific output like the `sources/` documents above. They're generic
  enough to apply to any design-system work, including this repo's own synthesis process:

  | Skill | Covers |
  |---|---|
  | `design-system-migration` | The end-to-end loop (spec → industry research → preview → sweep → decision log) for migrating an app onto a design system |
  | `audit-suite` | Writing automated design/accessibility checks you can actually trust — scope, positive/negative controls, the ways a check lies |
  | `wcag-conformance` | Auditing against WCAG 2.2 A/AA, including what automated tooling structurally cannot see |
  | `evidence-discipline` | Measuring before asserting, keeping provenance on a figure, correcting a claim without erasing it |
  | `session-durability` | Committing/pushing at every checkpoint, and detecting a working tree reverted out from under a long-running session |

If you're implementing or auditing against this design system, start with `design.md`. If you hit
a case it doesn't cover cleanly, check `INCONSISTENCIES.md` first — it may be a known open
question rather than an oversight. For full detail or original wording behind any rule, the
matching `sources/` document is the citable original.
