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

## `<rfg-status-pill>`

Implements the "Status pills" section: communicates state, never an action — never focusable,
never looks pressable.

| Attribute | Values | Default |
| --- | --- | --- |
| `tone` | `neutral` \| `info` \| `success` \| `warning` \| `danger` \| `brand` | `neutral` |

Default slot is the label; a named `icon` slot is decorative (`aria-hidden`) and, per design.md,
"only earns its place when the pill itself is rare" — most pills should just be a tinted word.

**Found by axe-core, fixed, not assumed:** the four semantic tones (info/success/warning/danger)
render `neutral-900` text, not the tone colour — those tokens are measured to clear WCAG AA 4.5:1
against *pure* white (danger by a 0.01 margin, see `tokens/README.md`), and any background tint
drops below that. The tone still shows in the background; `neutral` and `brand` are unaffected
(their tokens have a larger margin) and keep tone-coloured text.

## `<rfg-icon-tile>` and `<rfg-avatar>`

Implements "Icon tiles and avatars" — two separate elements, not one with a `shape` switch,
because design.md reserves two visual vocabularies ("a stat or status" vs. "a person") and says
never let them overlap.

`<rfg-icon-tile>` (`tone`: `brand` default \| `neutral` \| `info` \| `success` \| `warning` \|
`danger`; `size`: `md` default \| `sm`, reusing `<rfg-button>`'s size names) holds one icon in its
default slot, always `aria-hidden` — it's always paired with a heading/figure that already names
it.

`<rfg-avatar>` (`name`, `size`) computes initials from `name` and, unlike the icon tile, carries
an accessible name *by default* (`aria-label`, falling back to `name`) — design.md's own example
uses a bare avatar as an account-menu trigger with no visible name nearby, so it can't be
unconditionally decorative. Set `aria-hidden="true"` on the host when embedding it inside a
control that already announces the person's name (see the `Decorative` story) — and if that
control's own label doesn't contain the avatar's *visible* initials text, a voice-control user
saying the visible label won't match it (WCAG 2.5.3 Label in Name, found the same way, via
axe-core against that exact story).

## `<rfg-card>`

Implements "Cards": the shared surface (hairline border, one elevation step), plus an optional
header (`heading`/`subtitle` attributes, an `actions` slot) and `footer` slot — each rendered only
when there's something in it, via `slotchange`, not assumed from attributes alone.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `heading` / `subtitle` | text | — | Header renders only if either is set or `actions` has content. |
| `padded` | boolean | `true` | `false` when the body (e.g. a table) should meet the card edges. |

Slots: default (body), `actions` (header, right-aligned), `footer`.

design.md separates the bare surface (`.card-surface`, visual-only) from the full component on
purpose — something that only needs the look shouldn't be forced through a header it doesn't want.
This element doesn't yet expose that lighter surface-only primitive separately; reach for the
default slot with no `heading`/`subtitle`/`actions` in the meantime (see the `SurfaceOnly` story).

## `<rfg-flash-message>`

Implements "Flash messages": severity decides the ARIA role (`warning`/`danger` → `role="alert"`,
interrupts; `info`/`success` → `role="status"`, announces politely), and an optional auto-dismiss
timer pauses on hover and on focus (WCAG 2.2.1 Timing Adjustable).

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `tone` | `info` \| `success` \| `warning` \| `danger` | `info` | |
| `dismissible` | boolean | `true` | Shows a close button; firing it dispatches `rfg-dismiss`. |
| `dismiss-after` | milliseconds | — | Absent = stays until dismissed. See below before setting it. |

Dispatches `rfg-dismiss` (detail: `{ reason: "manual" \| "auto" }`) for the host to remove the
element from the DOM / a Turbo frame — removal itself is silent for sighted users, only arrival is
worth interrupting for.

**Judgment call this component does not make for you:** design.md's rule is that whether a message
may auto-dismiss depends on whether its *content* stays needed for as long as the timer runs, not
its tone — a "success" message carrying a one-time credential must not auto-dismiss even though
success messages usually can. Decide per message, not per tone, before setting `dismiss-after`.

**Same `color-mix` contrast fix as the status pill**, for the same reason: message text is
`neutral-900`, not the tone colour; the tone shows in the background tint and a left border.

## `<rfg-page-header>`

Implements "Page header". Owns the page's only `<h1>` — a host shouldn't render its own elsewhere.

| Attribute | Values | Default |
| --- | --- | --- |
| `heading` | text | — |
| `subtitle` | text | — |
| `back-href` / `back-label` | a URL / text | — |

Slot: `actions` (right-aligned). Alignment is derived from whether `subtitle` is set, not a
separate attribute to keep in sync by hand: no subtitle aligns the row to `flex-end` (a 40px
action button sits on the `h1`'s baseline); a subtitle aligns it to `flex-start` (so the action
can't be dragged down to the subtitle's baseline instead) — design.md's own measured shape rule.

## `<rfg-tabs>` + `<rfg-tab-panel>`, and `<rfg-page-tabs>`

Implements "Tabs" — design.md documents **two** components here, not one, and using the wrong
one for a given case is an accessibility bug, not a style choice: `role="tab"` promises assistive
tech that activating it swaps a panel in the current document, so a tab that actually navigates
must not use it (it would also steal arrow keys from what should be a plain link list).

`<rfg-tabs>` (wrapping `<rfg-tab-panel>` children, each with a `label` attribute) is the real ARIA
Tabs pattern for **panel tabs** — panels swap in place, same URL: a true tablist, roving tabindex,
arrow keys move *and* activate (automatic activation, the shape Ant Design/Material/Carbon's own
Tabs components use), Home/End jump to the first/last tab.

`<rfg-page-tabs>` is a styled `<nav>` of real `<a>` links for **page tabs** — each tab its own
URL. No ARIA tab roles, no keyboard management: it's just a `<nav>`, and the host sets
`aria-current="page"` on whichever link is current (this element has no way to know the current
URL itself).

**Found by axe-core, fixed, not assumed:** `<rfg-tabs>` renders into **light DOM**
(`createRenderRoot()` returns `this`), not a shadow root. A first version rendered the tablist in
shadow DOM with `aria-controls`/`aria-labelledby` pointing at the light-DOM `<rfg-tab-panel>`
elements (which must stay in light DOM so their content can be arbitrary host markup) — axe-core's
`aria-valid-attr-value` check failed, because an ID reference can't reliably cross the shadow
boundary. Rendering the tabs themselves into light DOM puts both ends of every ID reference in one
scope; styles are scoped by a `.rfg-tabs` wrapper class instead of `:host`.

## `<rfg-modal>`

Implements "Modals": wraps native `<dialog>` + `showModal()` rather than reimplementing focus
trapping, Escape handling, background inertness and top-layer stacking — all of which `<dialog>`
gives correctly for free. Public API mirrors what it wraps: `.show()` / `.close()`, not an `open`
attribute a host toggles (a plain attribute can't invoke `showModal()`, which is what actually
grants the top-layer/focus-trap behavior).

| Attribute | Default |
| --- | --- |
| `heading` | — |

Slots: default (body, scrollable — `tabindex="0"` for WCAG 2.1.1 keyboard reachability), `footer`
(renders only if it has content). Clicking the backdrop closes it; so does Escape, natively.
Dispatches `rfg-close` (re-dispatched from the native, non-composed `close` event so it's audible
from outside the shadow root).

design.md's one documented gotcha for this pattern — a global CSS reset's `margin: 0` defeating
`<dialog>`'s own centring `margin: auto` — can't actually happen here: the shadow boundary already
isolates this element's `<dialog>` from whatever reset the host page runs.

## `<rfg-popover>`

Implements "Popovers": an anchored floating panel (the account menu, a filter) sharing one
interaction contract — Escape closes and returns focus to the trigger; an outside click closes
*without* moving focus (the click already put focus wherever the user meant); expanded state is a
real `aria-expanded` attribute; the panel is actually removed from the accessibility tree while
closed (`hidden`, not just visually hidden); and it repositions (flips/shifts) to stay inside the
viewport.

| Attribute | Values | Default |
| --- | --- | --- |
| `label` | text | `"Popover"` (the panel's `aria-label`) |
| `placement` | any Floating UI placement (`bottom-start`, `bottom-end`, …) | `bottom-start` |

Slots: `trigger` (the host's own button — `aria-haspopup`/`aria-expanded`/`aria-controls` are
proxied onto it, the same pattern `<rfg-button>` uses for `aria-label`) and default (the panel
body).

**Not a modal**, and the distinction is functional, not visual: it must never trap focus or make
the rest of the page inert, since a popover's point is usually to stay in context with what it's
acting on.

**First new dependency beyond `lit`:** `@floating-ui/dom`, for the viewport flip/shift math.
design.md's own reasoning for `<dialog>` over a hand-rolled modal — prefer a correct, maintained
implementation over reimplementing a known-hard problem — applies just as directly to collision
detection; Floating UI is the maintained successor to Popper and what Shoelace/Radix use for the
same thing.

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
logs a warning) — complementary to, not a replacement for, `bin/design/adapters/storybook/`, which
points `wcag-audit.js` and `keyboard-audit.js` (not `button-audit.js` — see
[docs/portability/adapter-storybook.md](../docs/portability/adapter-storybook.md) for why) at the
*built* Storybook site in CI. The a11y addon catches a regression locally while you're building;
the CI job is what actually gates a push.

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
