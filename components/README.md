# Components

The installable implementation layer on top of `design.md`'s Components section — Web Components
built with [Lit](https://lit.dev), not a new design language. Each element implements a section
`design.md` already documents; if building one surfaces a gap the written spec doesn't cover,
that's a finding, and `design.md` gets updated in the same change, not after (see the
`design-system-migration` skill's "spec first" rule).

## Why Web Components

Any app at all needs to be able to use these with no build step: plain HTML, Rails ERB, Django
templates, React, Vue. A React-only or Vue-only library would be unusable by this project's own
origin app (Human Essentials — Rails/ERB/Stimulus, no Node build step, see ADR 0012) without
adopting a new toolchain, and Web Components work natively from React 19+, Vue, and server-rendered
markup already. See [ADR 13](../docs/architecture/decisions/0013-genericize-the-design-system.md)
for why "any app" is the actual goal here, not just a React app.

## Using a component

Every component needs the design tokens loaded first (`tokens/tokens.css`, or `tokens/theme.css`
if your app already uses Tailwind v4) — components consume tokens via CSS custom properties
(`var(--color-brand-600)`, etc.) and render unstyled without them.

**As an npm import**, sharing one copy of `lit` across every component you use:

```js
import "@rubyforgood/design-system/components/button";
```

```html
<link rel="stylesheet" href="node_modules/@rubyforgood/design-system/tokens/tokens.css" />
<rfg-button variant="primary">Save</rfg-button>
```

**As a single standalone file**, with `lit` bundled in — no package manager, mirroring
`bin/design/`'s existing "copy the file into your project" distribution pattern (see the root
`README.md`'s "Using the audits" section):

```html
<link rel="stylesheet" href="tokens.css" />
<script type="module" src="button.mjs"></script>
<rfg-button variant="primary">Save</rfg-button>
```

## `<rfg-button>`

Implements `design.md`'s Buttons section (variant × size as two independent axes) and the
link-vs-action distinction from "Where a button goes": with no `href`, it renders a real
`<button>`; with `href`, a real `<a>` — never a styled link pretending to submit a form, or vice
versa.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `primary` \| `secondary` \| `danger` \| `ghost` | `primary` | What the action means. |
| `size` | `sm` \| `md` | `md` | What context it's in — independent of variant. |
| `href` | a URL | — | Presence switches the element to link mode. |
| `type` | `button` \| `submit` \| `reset` | `button` | Button mode only. |
| `disabled` | boolean | `false` | See below — behaves differently in each mode. |
| `reason` | a string | — | Link mode only, used with `disabled` (see below). |

Slots: the default slot is the label; a named `icon` slot holds an icon graphic and is marked
`aria-hidden` automatically (design.md's Iconography rule — an icon beside a label is decorative).
No icon set is bundled; any icon set works, same as the rest of this system.

**`disabled` means different things in each mode, on purpose** (design.md's "inert on arrival"
accessibility rule):
- **Button mode** (`type="button"`/`submit`/`reset`, no `href`): `disabled` sets the native
  `disabled` attribute. Standard HTML, removed from the tab order.
- **Link mode** (`href` set): a real `<a>` has no native disabled state, and a control that costs
  something to press needs to stay focusable and announce *why* rather than just vanish from the
  tab order — so `disabled` here renders a focusable `<span aria-disabled="true">` instead, with
  `reason` surfaced as visually-hidden text for assistive tech. Do not reach for this when pressing
  the control again costs nothing (a calendar's "Today" when already on today) — design.md's rule
  is that a no-op is a smaller cost than a disabled control someone has to reason about; this mode
  is for when pressing actually would cost something.

**Icon-only buttons need their own accessible name.** Put `aria-label` on the host element
(`<rfg-button aria-label="Close">`); it's proxied onto the internal control. If there's no visible
text and no `aria-label`/`aria-labelledby`, the component logs a console warning in development
rather than silently shipping an inaccessible control.

**Known gap**, named rather than silently omitted: `aria-labelledby` (an id reference) can't cross
from the host's light DOM into this element's shadow DOM the way `aria-label` (a plain string)
can. Use `aria-label` with the label text directly until this is revisited with
`ElementInternals`/`ariaLabelledByElements`, which doesn't have solid cross-browser support yet.

## Preview

```bash
npm run storybook        # live dev server, http://localhost:6006
npm run build-storybook  # static site, storybook-static/
```

One story file per component (`components/<name>.stories.js`) covering every documented
variant/state — this is the "preview before building, as a rendered page" step the
`design-system-migration` skill already asks for, made durable instead of ad hoc. The
`@storybook/addon-a11y` addon runs axe-core against every story automatically
(`.storybook/preview.js` sets `a11y.test: "error"`, so a real violation fails the story, not just
logs a warning) — complementary to, not a replacement for, pointing `bin/design/`'s own audits
(`wcag-audit.js`, `keyboard-audit.js`, `button-audit.js`) at the built Storybook site, which is
still a later step (see [ADR 14](../docs/architecture/decisions/0014-add-an-installable-component-layer.md)).

## Building

```bash
npm run build
```

Produces two outputs per component via `tsup.config.js` — `dist/components/<name>.mjs` (`lit`
external, for npm consumers) and `dist/standalone/<name>.mjs` (`lit` bundled in, for the
copy-one-file path). Both are plain ESM; this repo intentionally has no `"type": "module"` in its
root `package.json` because `bin/design/`'s 24 existing audit scripts are CommonJS — `.mjs` is the
unambiguous extension that works alongside them without forcing a module-system choice onto files
that already made a different one.
