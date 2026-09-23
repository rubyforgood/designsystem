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
