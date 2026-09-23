# Field notes

This design system's central claim — made throughout `design.md`, the `audit-suite` and
`design-system-migration` skills, and `docs/portability/` — is that it's *battle-tested*: built
by finding and fixing real defects on a real, running application, not derived from first
principles. That claim is only worth anything if the evidence behind it is checkable. This page
is the index to that evidence, and the rules for reading it correctly.

## What's here, and why it's kept

Five documents record the Human Essentials migration this design system was extracted from:

| Document | What it records |
| --- | --- |
| [`design-decisions.md`](design-decisions.md) | Every UI judgement call not already settled by `design.md` — decision, rationale, alternatives rejected. ~10,000 lines. |
| [`changelog.md`](changelog.md) | What changed, in order, with the commit that carries it. |
| [`migration-map.md`](migration-map.md) | What replaced the pre-migration Bootstrap/AdminLTE markup, and how to verify a page against it. |
| [`table-audit.md`](table-audit.md) | Measured findings on row-action weight and badge usage, re-run over time. |
| [`todo.md`](todo.md) | Gaps found, verified, and deliberately left unfixed at the time, with why. |

None of these were written for this repo. They're carried over intact from the source project
because the numbers in them — 54px of jump, 0.352 of layout shift, 640 icon-only controls with 0
defects — are what make `design.md`'s rules verifiable claims instead of assertions. Deleting them
would keep the rules and throw away the only thing that makes the rules credible.

## The rule for reading them

**Every fact in these five documents is true of Human Essentials, on the date it was measured. Not
one of them is a claim about this repo's generic system, or about an app that adopts it.**

Concretely:

- A number here (a pixel measurement, a screen count, a defect count) is evidence *that the
  methodology finds real things*, not a target to hit on a different app. `docs/portability/`'s
  own reference-app experiment found exactly this distinction matters — Phase 2 planted a
  deliberately different, reasonable CSS choice on a second app and had several of these documents'
  underlying audits flag it as a defect purely because it didn't match Human Essentials' specific
  numbers.
- A decision here (why a control is 28px, why a threshold is three) is Local by
  `docs/portability/design-md-tagging.md`'s own tagging convention — the *shape* of the decision
  (measure before choosing, cite real precedent, write down what was rejected) transfers; the
  specific number is this app's answer, not a universal one.
- `migration-map.md` and `todo.md` are specific to a migration that has already happened and a
  backlog that is specific to the app that accumulated it. An adopter with no legacy framework to
  retire has no equivalent migration map to write; an adopter starting fresh has their own empty
  backlog, not this one's — the same point `design.md`'s own [Backlog](../design.md#backlog)
  section makes about itself.

If you're adopting this design system and want to cite one of these numbers as evidence for a
decision on a different app: don't. Measure your own app, the way this one was measured — that's
the actual methodology, and `evidence-discipline` covers how.

## Corroboration from a sibling project isn't independent confirmation

A natural way to upgrade a Local tag toward Portable is finding that a second, unrelated project
reached the same conclusion on its own. Watch for the "unrelated" doing real work in that sentence.

[CASA](https://github.com/rubyforgood/casa), another Ruby for Good Rails app, has its own
`design.md` built with what reads as the same authoring methodology as this one — the same
rule-then-evidence-then-industry-citation structure, the same "measured, not eyeballed" phrasing,
the same section skeleton. A comparison pass against it (2026-09) found real, useful things: a
genuine bug in one of this document's own rules (see the `dt`/`dd` fix in `design.md`'s "A
record's details" section), several rules worth porting over, and a handful of places both
documents independently landed on the same answer (icon-tile-vs-avatar disjointness, at-most-one
primary CTA, opening an overlay before trusting an accessibility scan against it).

That last category is weaker evidence than it looks. Two Rails apps built by the same underlying
methodology converging on the same Foundations choices (Figtree, indigo, slate, Bootstrap Icons,
WCAG AA, a 4px scale) is evidence the *methodology reliably reproduces itself* — a real and useful
thing to know — not evidence that indigo-and-Figtree is independently the right default the way
two genuinely unrelated teams agreeing would be. Before citing a match with a sibling project as
the reason to upgrade a tag, check whether it's actually a second data point or the same process
running twice.

A second comparison, against [Stocks in the Future](https://github.com/rubyforgood/stocks-in-the-future)'s
`design.md` (2026-09), sharpened this further rather than just repeating it — that document states
its own provenance outright: it began as a reconciled copy of CASA's `design.md`, and explicitly
marks one closing section as *its own, not inherited*. Everything matching in the inherited
portion is the same caveat as above, not new evidence. But its `scroll-padding`/WCAG 2.4.11 (Focus
Not Obscured) mechanism — sized to fixed chrome's height via named CSS custom properties, the same
technique this repo's own `#focus-not-obscured` rule uses for the table rail — sits in that
explicitly-own section. If that self-report is accurate, this is the one genuinely independent
match found across both comparisons so far: two unrelated apps, in different domains, arriving at
the identical mechanism for the same WCAG 2.2 criterion without one copying the other. Worth
naming as the actual example of what real corroboration looks like, next to everything above that
isn't.

## Related, not migration-specific

Two more documents in `docs/` describe the Human Essentials *application* rather than the
migration — useful for understanding the worked examples throughout `design.md`, not part of the
evidence trail above:

- [`onboarding.md`](onboarding.md) — what the app does, for a contributor or a user.
- [`domain-model.md`](domain-model.md) — how its records relate.

## The genericization work itself

`docs/portability/` is the evidence trail for *this* repo's own methodology — the Phase 0–4 work
converting Human Essentials' design system into a generic one. Same rule applies in reverse: those
documents are dated, measured, and specific to the sessions that produced them, not a claim that
the genericization is finished or that every number in them still holds.
