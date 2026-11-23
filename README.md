# Ruby For Good Design System

A shared design system for Ruby For Good apps, and for any other app that wants it. It gives
nonprofit software, mostly built by volunteers, one consistent and accessible way to look and
behave, so each team doesn't have to work out forms, tables, buttons and WCAG conformance from
scratch.

Adopting it gets an app:

- **A written spec** ([`design.md`](design.md)) for components, layout, copy and accessibility.
  Each rule says whether it holds on any app or is just this system's default choice.
- **Design tokens** for colour, type, spacing and so on, as plain CSS variables or a Tailwind v4
  theme.
- **Twenty-nine ready-made components** as Web Components. They work in Rails views, plain HTML,
  React or Vue, with or without a JavaScript build step. You can
  [see every one live in Storybook](https://rubyforgood.github.io/designsystem/).
- **Automated audits** that check your running app against the rules, so a fixed problem can't
  quietly come back.
- **A migration playbook** as Claude Code skills, for moving an existing UI onto the system one
  rule at a time.

To start, install the package (`npm install @rubyforgood/design-system`, or see
[Using it in a Rails app](#using-it-in-a-rails-app) for importmap apps without Node), load the
tokens, and swap in one component. [Migrating an app onto this system](#migrating-an-app-onto-this-system)
covers the rest.

**How it was built.** Most design systems start from principles and hope they hold up. This one
was built the other way round: every rule in `design.md` started as a real defect, found on a real,
running application, fixed, and enforced with an executable check.
`docs/field-notes.md` is the evidence trail; `docs/portability/` is the record of proving each rule
portable beyond the app it was first found on, including where it turned out *not* to be, yet.

## What's here

| | |
| --- | --- |
| [`design.md`](design.md) | The spec. Every rule is tagged **Portable** (holds on any app) or **Local** (this project's own answer: the practice of deciding may transfer, the specific value doesn't). See [`docs/portability/design-md-tagging.md`](docs/portability/design-md-tagging.md) for the full breakdown. |
| [`tokens/`](tokens/) | Design tokens as a Tailwind v4 `@theme` block: colour, type, spacing, radius, elevation, with the Portable rule and the Local default value stated separately for each. |
| [`components/`](components/README.md) | An installable Web Components layer (Lit) implementing `design.md`'s Components section in code — `npm install`-able or copy a single standalone file. Twenty-nine components, every portable one in `design.md`'s catalog except Charts. See [ADR 14](docs/architecture/decisions/0014-add-an-installable-component-layer.md). |
| [Storybook](https://rubyforgood.github.io/designsystem/) | Every component, live and previewable in a browser — no clone required. Redeployed on every push to `main`. |
| [`bin/design/`](bin/design/README.md) | ~40 executable audits (WCAG conformance, copy quality, dead code, and more) built on an adapter seam: point one small file (`targets.js`) at your app and most of the suite runs unmodified. |
| [`examples/reference-app/`](examples/reference-app/) | A second, deliberately non-Rails adapter target: proof (and, honestly, some disproof) that the adapter claim holds. See [`docs/portability/adapter-reference-app.md`](docs/portability/adapter-reference-app.md). |
| [`docs/field-notes.md`](docs/field-notes.md) | The evidence index: what's measured, what's historical, and the rule for not citing another app's own numbers as claims about your app. |
| [`docs/portability/`](docs/portability/) | The genericization work itself: what's proven portable, what's still Local, what's an honest known gap. |
| [`plugin/`](plugin/) | The methodology as a Claude Code plugin with five skills: `design-system-migration`, `audit-suite`, `wcag-conformance`, `evidence-discipline`, `session-durability`. Install it without cloning this repo (see below). Inside this repo, `.claude/skills/` links to the same files. |

## Migrating an app onto this system

The skills are the step-by-step way of working for a migration. They're optional: the spec,
tokens, components and audits all work without them, and without Claude Code. To use them in
Claude Code, install them as a plugin, from inside any project:

```
/plugin marketplace add https://raw.githubusercontent.com/rubyforgood/designsystem/main/.claude-plugin/marketplace.json
/plugin install design-system@rubyforgood
```

This downloads only the `plugin/` folder, about 150 KB. (`/plugin marketplace add
rubyforgood/designsystem` also works, but it clones the whole repository, about 58 MB, to get
there.) The skills appear as `design-system:design-system-migration`, `design-system:audit-suite` and so on. To get
updates later, run `/plugin marketplace update rubyforgood`.

Then load the `design-system-migration` skill in Claude Code and point it at the app you're migrating.
It works from `design.md` as the normative spec, researches how the app's current UI compares,
previews changes before building them, applies fixes app-wide rather than screen-by-screen, and
wires up an executable audit so a fixed defect can't silently come back. `audit-suite` and
`wcag-conformance` are the supporting skills it leans on for building checks you can trust and for
WCAG 2.2 conformance specifically.

### Without the Claude Code plugin

The skills are plain Markdown files in [`plugin/skills/`](plugin/skills/), one folder each, so
there are other ways to use them:

- **In Claude Code, without the plugin:** copy the folders from `plugin/skills/` into
  `~/.claude/skills/` (for all your projects) or into your app's `.claude/skills/` (for that app
  only). You'll need to copy them again to get updates.
- **With another AI coding tool:** each skill is a folder with a `SKILL.md` file (a short header
  saying what it's for, then instructions). Tools that read that format can use the same folders.
  Only Claude Code has been tested.
- **With no AI at all:** read them as a guide. Start with
  [`plugin/skills/design-system-migration/SKILL.md`](plugin/skills/design-system-migration/SKILL.md);
  its `reference/` and `templates/` folders hold the detail. A developer can follow it like any
  other how-to.

## Using the tokens

```bash
npm install @rubyforgood/design-system
```

```css
/* your Tailwind entry point */
@import "@rubyforgood/design-system/tokens/theme.css";
```

`npm install github:rubyforgood/designsystem` still works too, if you want a specific commit
rather than a released version.

That gives you the shipped default palette (indigo, Figtree, a 4px scale). Retheme by overriding
the same token names; see [`tokens/README.md`](tokens/README.md) for which parts are load-bearing
rules and which are just this default's answer.

## Using it in a Rails app

Most Ruby For Good apps are Rails with importmap and no Node build step. You don't need one: every
component ships as a **standalone file** with `lit` bundled in and no imports of its own, so you can
vendor it like any other file. Download the tokens and the components you use, at a pinned version:

```bash
V=https://cdn.jsdelivr.net/npm/@rubyforgood/design-system@0.1.1
curl -fo app/assets/stylesheets/rfg-tokens.css $V/tokens/tokens.css
curl -fo vendor/javascript/rfg-button.js       $V/dist/standalone/button.mjs
curl -fo vendor/javascript/rfg-modal.js        $V/dist/standalone/modal.mjs
```

Pin them in `config/importmap.rb`:

```ruby
pin "rfg-button", to: "rfg-button.js"
pin "rfg-modal",  to: "rfg-modal.js"
```

Import them once in `app/javascript/application.js`:

```js
import "rfg-button"
import "rfg-modal"
```

Load the tokens before anything else in your layout, then use the elements in any view:

```erb
<%= stylesheet_link_tag "rfg-tokens" %>
```

```erb
<rfg-button variant="primary" type="submit">Save</rfg-button>
```

**If the app uses `tailwindcss-rails` (Tailwind v4)**, download `$V/tokens/theme.css` instead of
`tokens.css` into `app/assets/tailwind/` and `@import` it from `application.css` there. That
gives you the tokens as Tailwind utilities (`bg-brand-600` and so on) as well as CSS variables.

Things to know:

- **Upgrading** means changing the version in `V` and downloading again. The version is in the URL
  on purpose, so you can't pick up a new release without choosing to.
- **Each standalone file carries its own copy of `lit`**, so each one is about 60 KB unminified
  (`button.mjs`, v0.1.0). Vendor the components you actually use, not all twenty-nine. If the app
  has a JS bundler (`jsbundling-rails`, Vite), use the npm import in
  [`components/README.md`](components/README.md) instead: it shares one copy of `lit`.
- **The tokens name Figtree but don't ship the font.** Self-host it, or set `--font-sans` to the
  app's existing typeface (see [`tokens/README.md`](tokens/README.md)).
- **Don't `bin/importmap pin` the package's npm build.** Those files import shared chunks by
  relative path, so vendoring a single file breaks them. Use the standalone files above.

How far this has been tested: Human Essentials (Rails, importmap, no Node) vendors six components
this way: button, segmented-control, tooltip, menu, combobox and popover. On 2026-11-23 they were
re-vendored from the published v0.1.0 files exactly as above. The 13 specs that touch them, 379
examples including 7 system specs in headless Chrome, all pass. This is on Human Essentials'
`design` branch, not yet merged into its `main`. The `tailwindcss-rails` variant hasn't been tried
in a real app yet.

## Using the audits

The audits aren't a library you `import`: Node's module resolution plus the adapter pattern
means you **copy an audit file into your own project, next to your own adapter**. This is
deliberate, not a packaging shortcut: `bin/design/adapters/reference-app/` and
`bin/design/targets.js` are two full worked examples of exactly this.

1. Write a `targets.js` (or whatever you name it) implementing the nine-export contract:
   `BASE`, `PASSWORD`, `targets()`, `signIn()`, `visit()`, `RUNS`, `SECONDARY`, `ADMIN`, `PRIMARY`.
   See `bin/design/targets.js` (a Rails/Devise adapter) and
   `bin/design/adapters/reference-app/targets.js` (a zero-framework Node adapter) for two
   different real implementations of the same contract.
2. Copy the audit(s) you want from `bin/design/` into the same directory as your adapter.
3. Run them: `node keyboard-audit.js`, etc.

`bin/design/README.md` documents every audit: what it checks, why it's built the way it is, and
what false positives it already survived. Not every audit is confirmed portable yet; read
[`docs/portability/audit-tooling-classification.md`](docs/portability/audit-tooling-classification.md)
before assuming one that hasn't been tested against a second adapter will just work.

## Status

Early. `design.md` has been fully passed over once for the Portable/Local split; the audit suite
has real, measured portability evidence for 22 of ~40 scripts (see
[`docs/portability/adapter-reference-app.md`](docs/portability/adapter-reference-app.md)) and
documented, not-yet-attempted plans for the rest. `.github/workflows/checks.yml` runs syntax
checks, a doc-link audit, a regression check against the reference app, and (since the component
layer) a components/Storybook build plus a real accessibility/keyboard audit run — all on every
push. The
component layer is newer still: twenty-nine components built — `button`, `status-pill`,
`icon-tile`, `avatar`, `card`, `flash-message`, `page-header`, `tabs`/`page-tabs`,
`segmented-control`, `modal`, `popover`, `menu`, `combobox`, `tooltip`, `field`, `error-summary`,
`table`, `date-range-picker`, `stats`, `numbered-step`, `callout`, `disclosure`, `empty-state`,
`breadcrumbs`, `conditional-reveal`, `filter-bar`, `pagination`, `tag-input` — every genuinely
portable component in `design.md`'s catalog except Charts (deliberately not ported; it defers
entirely to Highcharts itself, so there's no generic rule to extract beyond usage guidance).
`menu`, `tooltip` and `segmented-control` are the newest kind of addition here: a Material/Carbon/
Primer comparison sweep, followed by a targeted evidence pass over Human Essentials, found each
one either already specified and audited here against a Local-only implementation (the
Row-actions kebab menu, the icon-only tooltip) or already hand-built and reasoned about carefully
but never written into this document at all (`/distributions/schedule`'s calendar range/layout
switches) — promoted to portable components for the first time, not ported from a prior
portable-but-unbuilt catalog entry the way the rest of this list was. The same sweep also
surveyed a toggle switch, a progress bar and a grouped-accordion component and found no real
evidence for any of the three in this app today — named, not built; see
[ADR 14](docs/architecture/decisions/0014-add-an-installable-component-layer.md)'s own account.
Each is verified in a real browser against the
accessibility rules its own `design.md` section documents, previewable via Storybook
(`npm run storybook`) with an axe-core a11y gate on every story, and audited for real —
`wcag-audit.js` and `keyboard-audit.js` run against the built Storybook site in CI (a third
adapter, `bin/design/adapters/storybook/`, see `docs/portability/adapter-storybook.md`). The same
build is also hosted — **<https://rubyforgood.github.io/designsystem/>** — redeployed by
`.github/workflows/deploy-storybook.yml` on every push to `main`, so there's a live link to browse
without cloning. See `components/README.md` and
[ADR 14](docs/architecture/decisions/0014-add-an-installable-component-layer.md).

Published to the npm registry; the current version is **v0.1.1**
(<https://www.npmjs.com/package/@rubyforgood/design-system>), cut through
`.github/workflows/release.yml` ([ADR 15](docs/architecture/decisions/0015-publish-to-npm-via-a-tag-triggered-release-workflow.md)):
pushing a `vX.Y.Z` tag builds and publishes. Each version's changes are in its [release
notes](https://github.com/rubyforgood/designsystem/releases).

## History

This system began inside [Human Essentials](https://github.com/rubyforgood/human-essentials),
Ruby For Good's inventory-management app, as that app's own internal design system, built rule by
rule against real defects on real screens. It was forked out and genericized into this independent,
adoptable project; see [ADR 13](docs/architecture/decisions/0013-genericize-the-design-system.md)
for that decision and what genericizing it actually involved.

## Contributing

Issues and pull requests are welcome, from any app. [CONTRIBUTING.md](CONTRIBUTING.md) has the
rules for a pull request and the versioning policy for 0.x releases.

## License

MIT, see [`LICENSE`](LICENSE). Carried forward from
[Human Essentials](https://github.com/rubyforgood/human-essentials), also MIT, also Ruby for Good.
