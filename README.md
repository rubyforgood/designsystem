# @rubyforgood/design-system

A design system extracted from [Human Essentials](https://github.com/rubyforgood/human-essentials),
being converted from one app's internal spec into a design system other applications can adopt.

Unlike most design systems you can install, this one was built the other way round: every rule in
[`design.md`](design.md) started as a real defect, found on a real, running application, fixed,
and enforced with an executable check — not derived from first principles and hoped to hold up.
`docs/field-notes.md` is the evidence trail; `docs/portability/` is the record of converting that
into something portable, including where it turned out *not* to be, yet.

## What's here

| | |
| --- | --- |
| [`design.md`](design.md) | The spec. Every rule is tagged **Portable** (holds on any app) or **Local** (this project's own answer — the practice of deciding may transfer, the specific value doesn't). See [`docs/portability/design-md-tagging.md`](docs/portability/design-md-tagging.md) for the full breakdown. |
| [`tokens/`](tokens/) | Design tokens as a Tailwind v4 `@theme` block — colour, type, spacing, radius, elevation — with the Portable rule and the Local default value stated separately for each. |
| [`bin/design/`](bin/design/README.md) | ~40 executable audits (WCAG conformance, copy quality, dead code, and more) built on an adapter seam: point one small file (`targets.js`) at your app and most of the suite runs unmodified. |
| [`examples/reference-app/`](examples/reference-app/) | A second, deliberately non-Rails adapter target — proof (and, honestly, some disproof) that the adapter claim holds. See [`docs/portability/adapter-reference-app.md`](docs/portability/adapter-reference-app.md). |
| [`docs/field-notes.md`](docs/field-notes.md) | The evidence index — what's measured, what's historical, and the rule for not citing Human Essentials' own numbers as claims about your app. |
| [`docs/portability/`](docs/portability/) | The genericization work itself: what's proven portable, what's still Local, what's an honest known gap. |
| `.claude/skills/` | The methodology as Claude Code skills — `design-system-migration`, `audit-suite`, `wcag-conformance`, `evidence-discipline`, `session-durability`. Not published to npm; available in this repository. |

## Using the tokens

```bash
npm install @rubyforgood/design-system
```

```css
/* your Tailwind entry point */
@import "@rubyforgood/design-system/tokens/theme.css";
```

That gives you the shipped default palette (Human Essentials' own — indigo, Figtree, a 4px
scale). Retheme by overriding the same token names; see [`tokens/README.md`](tokens/README.md)
for which parts are load-bearing rules and which are just this default's answer.

## Using the audits

The audits aren't a library you `import` — Node's module resolution plus the adapter pattern
means you **copy an audit file into your own project, next to your own adapter**. This is
deliberate, not a packaging shortcut: `bin/design/adapters/reference-app/` and
`bin/design/targets.js` are two full worked examples of exactly this.

1. Write a `targets.js` (or whatever you name it) implementing the nine-export contract —
   `BASE`, `PASSWORD`, `targets()`, `signIn()`, `visit()`, `RUNS`, `SECONDARY`, `ADMIN`, `PRIMARY`.
   See `bin/design/targets.js` (a Rails/Devise adapter) and
   `bin/design/adapters/reference-app/targets.js` (a zero-framework Node adapter) for two
   different real implementations of the same contract.
2. Copy the audit(s) you want from `bin/design/` into the same directory as your adapter.
3. Run them: `node keyboard-audit.js`, etc.

`bin/design/README.md` documents every audit — what it checks, why it's built the way it is, and
what false positives it already survived. Not every audit is confirmed portable yet — read
[`docs/portability/audit-tooling-classification.md`](docs/portability/audit-tooling-classification.md)
before assuming one that hasn't been tested against a second adapter will just work.

## Status

Early. `design.md` has been fully passed over once for the Portable/Local split; the audit suite
has real, measured portability evidence for 8 of ~40 scripts (see
[`docs/portability/adapter-reference-app.md`](docs/portability/adapter-reference-app.md)) and
documented, not-yet-attempted plans for the rest. `.github/workflows/checks.yml` runs syntax
checks, a doc-link audit, and a regression check against the reference app on every push.

This has not been published to the npm registry yet, and the `repository` field in
`package.json` is a placeholder — both need a decision about where this project actually lives
before that happens.

## License

MIT — see [`LICENSE`](LICENSE). Carried forward from
[Human Essentials](https://github.com/rubyforgood/human-essentials), also MIT, also Ruby for Good.
