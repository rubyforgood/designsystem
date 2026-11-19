# 14. Add an installable component layer, built as Web Components

Date: 2026-11-19

## Status

Accepted. Builds on [13. Genericize the design system into an independent
project](0013-genericize-the-design-system.md); does not revise it.

## Context

Through ADR 13, this repo had become a spec (`design.md`) plus a token layer (`tokens/`) plus a
conformance audit suite (`bin/design/`) — all aimed at an app that hand-builds its own UI and then
checks it against the spec. There was no installable component anywhere: no `.tsx`/`.jsx`/`.vue`,
no component dependency in `package.json`. Compared to Carbon, Material, or Primer — the systems
this project is explicitly trying to match the shape of — that's the real gap: those ship code you
import, not only a document you follow and an audit you run afterward.

The constraint that shaped the implementation choice: this project's own origin app, Human
Essentials, and its own contributor base (Ruby for Good, Rails/ERB-skewed volunteers) have no
React or Vue, and Human Essentials deliberately has no Node build step (its own ADR 0012). A
React-first or Vue-first component library would be unusable by this project's own flagship app
without adopting a new toolchain, and would raise the bar for the exact community that wrote
`design.md` to begin with. The stated goal — "any organization or application" — has to include
apps that look like Human Essentials, not only apps that already use a JS framework.

## Decision

1. Build the component layer as **Web Components, using [Lit](https://lit.dev)** for the reduced
   boilerplate over hand-written custom elements. This is a first for this repo: `lit` is its
   first runtime dependency, where `tokens/` and `bin/design/` have had none. The alternative
   (vanilla custom elements, zero dependencies) was rejected only because of how much more
   boilerplate it costs per component, not because Lit's output is any less portable — it compiles
   to standard custom elements, usable anywhere a custom element is.
2. Ship every component two ways: as an npm subpath import (`lit` external, shared across
   components) and as a single standalone file with `lit` bundled in, mirroring `bin/design/`'s
   existing "copy the file into your project" distribution pattern rather than inventing a new one.
3. Components consume design tokens exclusively as CSS custom properties
   (`tokens/tokens.css` — a new, plain, non-Tailwind-at-rule sibling to `tokens/theme.css`,
   generated from it, not hand-guessed) — never a hardcoded value — because custom properties are
   what Web Components can actually see across the shadow DOM boundary, and it's what makes
   `tokens/README.md`'s existing retheming checklist true for compiled components, not only for
   Tailwind classes in markup.
4. Build and prove exactly one component first — `<rfg-button>`, implementing `design.md`'s
   already-written Buttons and "Where a button goes" sections — before building a second, the same
   "one audit running end-to-end before a second" discipline `design-system-migration`'s own setup
   guidance already uses for the audit suite. React/Vue wrapper packages, a documentation/preview
   site, and pointing the existing audit suite at the new components are explicitly later work, not
   part of this decision.
5. Keep `package.json` without `"type": "module"`: `bin/design/`'s 24 existing audit scripts are
   CommonJS (`require`), and declaring the package ESM at the root would break every one of them.
   Build output uses the unambiguous `.mjs` extension instead.

## Consequences

An adopter can now `npm install` (or copy one file) and get a working, accessible control, instead
of hand-building one from prose and auditing it afterward — the gap this ADR exists to close.

The cost: this repo now has a real runtime dependency (`lit`) and a build step
(`tsup`/`esbuild`, plus `typescript` as a transitive tooling requirement) for the first time, where
everything before this was either zero-dependency audit scripts or a single CSS file. That's a
real increase in what "adopting this system" can mean, not a free addition.

This ADR does not claim the component layer is complete — one component exists. The plan this
decision came from names the rest explicitly: a Storybook-based preview site, pointing the
already-portable audits (`wcag-audit.js`, `keyboard-audit.js`, `button-audit.js`) at the new
components the same way they're already pointed at `examples/reference-app/`, porting the rest of
`design.md`'s ~25 documented components in roughly Portable-tag-density order, and — eventually —
migrating Human Essentials' own button-rendering helper onto `<rfg-button>` as the real "any app"
portability proof, the same role `examples/reference-app` already played for the audit suite.
