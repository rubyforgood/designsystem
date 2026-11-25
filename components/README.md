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

**In a Rails app with importmap**, vendor the standalone files. The root README's
["Using it in a Rails app"](../README.md#using-it-in-a-rails-app) has the full steps.

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

**Renders into light DOM, not a shadow root** — found necessary while dogfooding this component on
Human Essentials (ADR 14): a shadow-rendered `<button type="submit">` doesn't participate in an
ancestor `<form>`'s submission, a tag/attribute-CSS-selector progressive-enhancement library
(rails-ujs) can never match the custom element, and Capybara's default finders can't see into a
shadow root at all. See the header comment in `button.js` for how each was confirmed.

Two further values beyond the table above: `variant="ghost_danger"` (the same rest color as
`ghost`, rose on hover and focus only — design.md's "a repeated destructive control shouldn't
shout at rest"; the component had no CSS for this variant until a story exercised it) and
`size="xs"`, a fixed icon-only square sized by `--rfg-button-xs-size` (default `1.75rem`) rather
than a third point on the padding-based sm/md scale, which can't land on an exact box size.
`ghost_danger` is what Human Essentials' row-icon actions use for their destructive tone
(`essentials_row_icon_action`/`essentials_row_icon_link` map `tone: :danger` to
`variant: :ghost_danger`).

**Known gap**, named rather than silently omitted: `aria-labelledby` (an id reference) can't cross
from the host's light DOM into this element's shadow DOM the way `aria-label` (a plain string)
can. Use `aria-label` with the label text directly until this is revisited with
`ElementInternals`/`ariaLabelledByElements`, which doesn't have solid cross-browser support yet.

## `<rfg-tooltip>`

Implements design.md's tooltip rules (under "Row actions"): names and shows a bubble for an
icon-only (or any) control on hover and focus — never `title`, which is browser chrome:
unstyleable, silent on keyboard focus, gone on a timer, and neither hoverable nor dismissible
(three failures of WCAG 1.4.13 at once).

| Attribute | Values | Default |
| --- | --- | --- |
| `text` | text | — (required; nothing shows without it) |

Slot: default (the trigger element the tooltip is attached to).

**The bubble's text comes from the trigger's own `aria-label`, not a second, separately-declared
string** — if the slotted trigger has no accessible name of its own (no visible text, no existing
`aria-label`/`aria-labelledby`), this writes `text` onto it as `aria-label` automatically, the same
accessible-name check `<rfg-button>` already runs before it warns. design.md's own rule is that the
bubble and the accessible name "carry the same string"; making that structural, rather than a
convention to remember, closes off the two-copies-of-one-string mistake this codebase has hit
before (see `<rfg-button>`'s attribute-proxy history).

**The bubble is appended straight to `<body>`, never rendered through this element's own
template.** A shadow-root-rendered bubble would face the same `position: fixed`-trapped-by-a-
sticky-ancestor's-stacking-context problem `<rfg-popover>`'s panel needed a portal fix for (see
below); managing the bubble as a plain, imperatively-created DOM node that's never nested inside
this component's own tree sidesteps the problem by construction. Ported from Human Essentials' own
`tooltip_controller.js` — the proven reference this is built from (640 icon-only controls across
153 screens, 0 defects per its own audit), including the hoverable/dismissible interaction (Escape
dismisses without moving the pointer; moving the pointer onto the bubble itself doesn't dismiss it)
and the flip-left/flip-up positioning a frozen actions column makes routine.

**Fixed in v0.1.3: hoverable and dismissible for a real pointer.** v0.1.0–0.1.2 hid the bubble the
moment the pointer left the trigger. A test that jumped the pointer straight onto the bubble passed,
but a real pointer crosses the 8px gap between them and lost the bubble on the way (WCAG 1.4.13
"hoverable"). Also, only the trigger listened for the pointer leaving, so once the pointer was on
the bubble, moving off it never hid it. Now leaving the trigger or the bubble starts a 150ms hide,
entering the bubble cancels it, and the bubble hides when the pointer leaves it. Found by
`component-behavior-audit.js` moving the pointer in 20 steps rather than jumping; that check fails
against v0.1.2.

## `<rfg-status-pill>`

Implements the "Status pills" section: communicates state, never an action — never focusable,
never looks pressable.

| Attribute | Values | Default |
| --- | --- | --- |
| `tone` | `neutral` \| `info` \| `success` \| `warning` \| `danger` \| `brand` | `neutral` |

Default slot is the label; a named `icon` slot is decorative (`aria-hidden`) and, per design.md,
"only earns its place when the pill itself is rare" — most pills should just be a tinted word.

**Found by axe-core, fixed, not assumed:** the four semantic tones (info/success/warning/danger)
render `neutral-900` text, not the tone color — those tokens are measured to clear WCAG AA 4.5:1
against *pure* white (danger by a 0.01 margin, see `tokens/README.md`), and any background tint
drops below that. The tone still shows in the background; `neutral` and `brand` are unaffected
(their tokens have a larger margin) and keep tone-colored text.

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
axe-core against that exact story). design.md describes the decorative-avatar-inside-a-named-control shape but
doesn't yet address this label-in-name detail; worth folding into design.md if the pattern gets
used for real.

## `<rfg-card>`

Implements "Cards": the shared surface (hairline border, one elevation step), plus an optional
header (`heading`/`subtitle` attributes, an `actions` slot) and `footer` slot — each rendered only
when there's something in it, via `slotchange`, not assumed from attributes alone.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `heading` / `subtitle` | text | — | Header renders only if either is set or `actions` has content. |
| `padded` | `"false"` to turn off | on | `padded="false"` when the body (e.g. a table) should meet the card edges. (Fixed in v0.1.3: before, `padded="false"` left padding on; only setting the `.padded` property worked.) |

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
`neutral-900`, not the tone color; the tone shows in the background tint and a left border.

## `<rfg-page-header>`

Implements "Page header". Owns the page's only `<h1>` — a host shouldn't render its own elsewhere.

| Attribute | Values | Default |
| --- | --- | --- |
| `heading` | text | — |
| `subtitle` | text | — |
| `back-href` / `back-label` | a URL / text | — |

The back link and title sit as one block with an 8px gap. (Fixed in v0.1.3: it measured 16px, because a flex gap and a margin both added 8px.)

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

## `<rfg-segmented-control>`

A connected row of real `<button>`s that switch between a few views **without navigating** —
ported from a real, in-production Human Essentials pattern
(`/distributions/schedule`'s calendar range/layout switches, `essentials_view_toggle_classes`),
not designed from scratch.

| Attribute | Values | Default |
| --- | --- | --- |
| `label` | text | `"View options"` (the group's `aria-label`) |
| `value` | any segment's own `value` | the first segment's, if unset |

Slot: default (the segment buttons — real `<button type="button" value="...">` elements, any
count).

**`role="group"` with independently-focusable `aria-pressed` buttons, not `role="radiogroup"`.**
The reference implementation's own reasoning, kept unchanged: this toggles a state, it doesn't
submit a value — `<rfg-tabs>`'s roving-tabindex tablist above is the pattern for navigating
between panels; this is a different interaction for a different reason, not an inconsistency
between the two. No arrow-key navigation between segments for the same reason: there's nothing
here modeled on the ARIA radio-group pattern to begin with.

**The component dispatches `rfg-change`; it does not own what the choice means** —
`<rfg-date-range-picker>`'s own precedent, a plain event the host turns into whatever it needs (a
URL parameter, in the reference implementation's own case, so the view stays bookmarkable — the
same argument design.md already settled for page tabs).

**Renders into light DOM**, the same `<rfg-button>` fix, for the same reason: this owns the full
connected-segments visual treatment (shared border, a divider between segments, only the outer
corners rounded), which means moving real button children into one rendered container rather than
leaving them to a shadow `<slot>`.

**Found by actually clicking through the built story, not assumed working:** the self-triggered-
resync guard this borrows from `<rfg-button>` checked whether anything at all was left among this
element's direct children after a move — but a template literal's own whitespace between tags
becomes real, un-moved, un-excluded text nodes once the buttons move into the group, so that check
was never actually true once any real-world markup had whitespace in it. Every click after the
first looked like "found zero buttons, but I already have some — ignore it," silently wiping
tracking and leaving every subsequent `aria-pressed` update a no-op. Fixed by checking whether any
*button* was found, not whether anything was found at all.

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
`<dialog>`'s own centering `margin: auto` — can't actually happen here: the shadow boundary already
isolates this element's `<dialog>` from whatever reset the host page runs.

## `<rfg-popover>`

Implements "Popovers": an anchored floating panel (the account menu, a filter) sharing one
interaction contract — Escape closes and returns focus to the trigger; an outside click closes
*without* moving focus (the click already put focus wherever the user meant); expanded state is a
real `aria-expanded` attribute; the panel is actually removed from the accessibility tree while
closed (`hidden`, not just visually hidden); it repositions (flips/shifts) to stay inside the
viewport; and it portals to `<body>` while open.

| Attribute | Values | Default |
| --- | --- | --- |
| `label` | text | `"Popover"` (the panel's `aria-label`) |
| `placement` | any Floating UI placement (`bottom-start`, `bottom-end`, …) | `bottom-start` |
| `role` | `dialog` \| `menu` \| `listbox` | `dialog` |

Slots: `trigger` (the host's own button, marked `slot="trigger"` — `aria-haspopup`/`aria-expanded`/
`aria-controls` are proxied onto it, the same pattern `<rfg-button>` uses for `aria-label`) and
default (the panel body).

**Renders into light DOM, not a shadow root** — found necessary while building the portal fix
below, not for any of the reasons `<rfg-button>`/`<rfg-field>`/`<rfg-tabs>` already needed it: a
`<slot>` only projects its assigned content while it stays inside the physical DOM subtree of its
own shadow host, so moving the panel to `<body>` while it still contained one silently broke
projection entirely — real content (a date-range-picker's calendar inputs, a filter's checkboxes)
rendered nothing once the panel moved, even though the panel `<div>` itself still opened,
positioned, and painted. Follows `<rfg-button>`'s established fix for the same shape of problem:
real children are captured once and moved (never mirrored, never slot-projected) into marker
positions — a real node can be relocated anywhere in the document and keep working; a `<slot>`
cannot.

**Portals to `<body>` while open.** design.md's Row actions section names the exact failure this
fixes, found against a real frozen table column: `position: fixed` escapes an ancestor's
`overflow`, but not its *stacking context* — a `position: sticky` actions cell put this panel's
`z-30` behind a sibling the sticky cell itself created, even though nothing about the panel's own
markup changed. "The only reliable escape from an ancestor you do not control is not to be inside
it." A comment node marks the panel's original position so it returns there on close;
`disconnectedCallback` removes a still-portalled panel so a Turbo-equivalent render can't strand
one on `<body>`.

**`role`, generalizing what this panel (and what its trigger's `aria-haspopup`) actually is.**
Defaults to `dialog`, this element's original and only shape — zero change for a direct consumer.
`<rfg-menu>` sets it to `menu`; `<rfg-combobox>` sets it to `listbox`. `aria-haspopup`'s value is
required to name the popup's own role, so the two can't be decided independently.

**Not a modal**, and the distinction is functional, not visual: it must never trap focus or make
the rest of the page inert, since a popover's point is usually to stay in context with what it's
acting on.

**First new dependency beyond `lit`:** `@floating-ui/dom`, for the viewport flip/shift math.
design.md's own reasoning for `<dialog>` over a hand-rolled modal — prefer a correct, maintained
implementation over reimplementing a known-hard problem — applies just as directly to collision
detection; Floating UI is the maintained successor to Popper and what Shoelace/Radix use for the
same thing.

## `<rfg-menu>`

Implements design.md's Row actions section's kebab/overflow menu: a trigger that opens a list of
real `role="menuitem"` controls, following the WAI-ARIA menu-button pattern.

**Extends `RfgPopover` as a real JS subclass**, rather than composing an instance of it as a nested
child — the first version tried composing, and a `<slot>` re-exposed through a second, nested
`<slot>` (to forward `<rfg-popover>`'s own `trigger`/default slots out through this element's
shadow root) stopped projecting the moment the panel portalled, for the identical reason
`<rfg-popover>`'s own header comment above describes. Subclassing means there is only ever one
shadow boundary (none, since `RfgPopover` already renders into light DOM) and one real set of
tracked content nodes — no forwarding chain for the portal to break. Inherits every attribute and
slot `<rfg-popover>` has (`label`, `placement`, `trigger`); `role` is forced to `menu` in the
constructor rather than exposed as a settable property, since a menu that rendered as anything else
wouldn't be this component any more.

Adds, on top of the inherited popover behavior: arrow-key navigation between items (Up/Down/Home/
End), ArrowDown/ArrowUp on the trigger opening straight to the first/last item (the WAI-ARIA APG
menu-button pattern's own recommendation), and closing on selecting an item.

**Items are plain light-DOM children, any real markup** — real `<a role="menuitem">`/
`<button role="menuitem">`/a disabled `<span role="menuitem" aria-disabled="true">`, not a
declarative `<rfg-menu-item>` sub-component. Same split already used for `<rfg-table>` ("Portable
wrapper, Local markup"): design.md's row-actions case study has per-item logic this component has
no business knowing — ghost vs. ghost_danger tone, a disabled *form* action rendered as a real
disabled `<button>` vs. a disabled *link* rendered as a focusable `aria-disabled` `<span>` with
visible reason text.

**Keyboard focus lands on a disabled item, rather than skipping it** — a deliberate departure from
the plain WAI-ARIA APG menu default. design.md's own "inert on arrival" rule, already applied
elsewhere to a disabled link in `<rfg-button>`, is that a control which costs something to reason
about stays reachable and explains itself rather than vanishing. Selecting a disabled item
(Enter/Space/click) does nothing and does not close the menu.


**Use `aria-disabled="true"` for a disabled item, never the `disabled` attribute.** A natively
disabled button can't take focus, so the arrow keys skip it and nobody using a keyboard or screen
reader can find out why it's unavailable. `aria-disabled` keeps it reachable, and the menu ignores
clicks on it. Corrected 2026-11-23: the "Disabled items with a reason" story used `disabled` on its
button while its description said both items stayed reachable.
## `<rfg-field>` and `<rfg-error-summary>`

Implements "Forms: required fields and validation errors" — one of design.md's densest,
most-portable sections (form validation UX barely varies by framework).

`<rfg-field>` wraps a host-provided native control (any `<input>`, `<select>`, `<textarea>` — not
a reimplemented one; the spec's job here is the label/marker/error conventions *around* a
control). `aria-required`, `aria-invalid`, and `aria-describedby` are proxied onto the control
automatically.

| Attribute | Values | Notes |
| --- | --- | --- |
| `label` | text | |
| `required` | boolean | Renders a red `<abbr title="required">*</abbr>` in the label. |
| `optional` | boolean | Mark optional fields too on a form that mixes both — design.md's rule: a lone asterisk convention leaves every unmarked field ambiguous. |
| `error` | text | Renders the message (neutral-700 text, danger-colored glyph — "the glyph signals and the sentence reads") and wires `aria-invalid`/`aria-describedby`. |

`<rfg-error-summary>` is the page-level counterpart (`essentials_error_summary`): `role="alert"`,
a heading, and the host's own message list (plain `<li>` text, deliberately **not** links —
design.md borrows GOV.UK's linked-error-summary *reasoning*, not its implementation, since
underlined block-level links would violate this system's own established rule; every message is
still reachable at its own field via `<rfg-field>`'s `aria-describedby`, so nothing is lost).

**Found by axe-core, fixed, not assumed — the same lesson as `<rfg-tabs>`, with a new wrinkle:**
`<rfg-field>` renders into light DOM (a shadow-rendered `<label for>` can't label a light-DOM
`<input>`, the same shadow-boundary problem tabs.js already has a fix for). But a *second* bug
followed from that fix itself: `updated()` moves the pre-existing `<input>` child from being
`<rfg-field>`'s own direct child into the newly-rendered `.rfg-field` wrapper div (so it lands
between the label and the error message, not wherever it happened to originally sit). That move
itself fires the element's own `MutationObserver`, which was querying `:scope > input` — a
direct-child-only query that stopped matching the instant the control moved one level deeper,
clearing `aria-required`/the label's `for` on every render after the first. Fixed by relaxing the
query to search the whole subtree instead of direct children only. The general lesson for any
future light-DOM-rendered component here: if it repositions a pre-existing child, re-query for it
without assuming it stays at the same tree depth.

## `<rfg-table>`

Implements the clearly Portable core of "Tables": a scroll-not-squeeze container (WCAG 1.4.10's
data-table exemption), top-aligned cells (`vertical-align: middle` is invisible until a cell
wraps, then every single-line cell in that row floats off the baseline), and three column-type
utility classes (`.numeric`/`.quantity`/`.percent`, `.date`, `.notes`) applied consistently. Warns
in development if the host's `<table>` has no `<caption>` (WCAG/semantics requirement, not style).

**Deliberately out of scope**, named rather than silently omitted: frozen/pinned columns, row
selection with a batch-action bar, and the scroll rail's own affordances (edge shadows, overflow
indicators). design.md's own tagging pass already calls the Row actions/Table sections "a single,
fully-worked case study" rather than something to generalize wholesale — those pieces are measured
against one app's specific layout (pixel-exact scroll offsets, a dark floating bar's `bottom-12`)
and aren't a good first candidate to port as-is.

The host supplies the actual `<table>` markup (caption, thead, tbody) via the default slot; this
element doesn't dictate column count or structure, only wraps, scrolls, and supplies the shared
classes a host's own cells opt into.

**Cell styles are a light-DOM stylesheet, injected once per document** (`#rfg-table-styles`,
selectors scoped as `rfg-table td`, `rfg-table .numeric` and so on), not the shadow root's styles.
The cells belong to the host's slotted `<table>`, and `::slotted()` only matches the slotted
element itself. Fixed in v0.1.1: v0.1.0 wrote these rules as `::slotted(table) td`, which is
invalid and matched nothing, so top alignment, cell padding, row borders and all three column
classes silently never applied. Neither axe nor the keyboard audit could see that. Found while
rewriting the Storybook docs: a `td.numeric` measured `text-align: center` and
`font-variant-numeric: normal`. The selectors are kept low-specificity on purpose, so an app's own
table CSS overrides them (checked: an app rule `.app td.numeric { text-align: center }` wins).
Like `<rfg-button>`'s injected styles, this assumes the table lives in the main document, not
inside another component's shadow root.

## `<rfg-date-range-picker>`

Implements "Date range picker": one trigger showing the current range, a popover (composing
`<rfg-popover>` — reuse, not reimplementation) with presets on one side and two native
`<input type="date">` fields on the other.

| Attribute | Notes |
| --- | --- |
| `presets` | Array property: `[{ label, start, end }]` — see below for why this is data, not server logic. |
| `start` / `end` | Current range, ISO date strings. |

Dispatches `rfg-change` with `{ start, end, label }` (`label` is `null` for a custom range that
doesn't match a preset).

**Local in the original, made Portable here:** design.md's own implementation computes presets
server-side and serializes them into Human Essentials' specific wire format
(`filters[date_range]`, a single parsed string). None of that belongs in a generic component —
`presets` is just data the host supplies, and `rfg-change` is generic; turning that into a
specific backend's query params is the host's job, not this element's.

Portable behaviors kept and verified in a real browser: selecting a preset commits immediately and
closes the popover (a preset is a complete answer); editing a custom date debounces 350ms (so
setting From then To costs one commit, not two) and leaves the popover open; an inverted custom
range (End before Start) is silently swapped rather than blocked with an error — checked across
two separate inversions in the same session, not just one.

**The panel's styles are a light-DOM stylesheet, injected once per document**
(`#rfg-date-range-picker-styles`, classes prefixed `rfg-drp-`). Fixed in v0.1.3: `<rfg-popover>`
moves the panel to `<body>` while it's open, out of this element's shadow root, so styles in
`static styles` never reached it. In v0.1.0–0.1.2 the open panel was unstyled: measured as
`display: block` instead of presets beside the dates, no divider, and the current preset in the
browser's default button gray instead of `--color-brand-50`. Same class of bug as `<rfg-table>` in
v0.1.0.

design.md's documented fix for the From/To fields' `change` event bubbling into a wrapping filter
form's own submit doesn't apply here: while the panel is open it lives in `<body>`, outside any
form that wraps this element, so the inputs' `change` events can't reach that form's listeners.
(Corrected 2026-11-23: this used to credit the shadow boundary, which stopped being true once the
panel moved to `<body>`.)

## `<rfg-stats>`

Implements "Stats": a figure/label pair is a `<dt>`/`<dd>` description-list relationship, never a
generic `<div>` pair, and the value is never marked up as a heading — a statistic is data, not a
section name, and a heading on it puts the figure in the page's navigable outline.

| Attribute | Notes |
| --- | --- |
| `heading` / `subtitle` | Optional; a bare row of numbers with no header reads as ambiguous or as belonging to whatever's printed above it. |
| `figures` | Array property: `[{ label, value }]`. |

A `gap-px` grid shows a neutral-200 backdrop through every pair of neighbors — rows as well as
columns, which `divide-x` alone can't do once a band wraps to more than one row. The column count
maps to figure count (1/2/3/4/5/6 figures get their own breakpoint schedule, design.md's own
measured table) so a flat responsive class never orphans a lone cell at a breakpoint it actually
ships — reflected as a `count` host attribute, since the per-count rules need `@media`, which a
plain inline `style` binding can't contain at all (found by actually trying it).

## `<rfg-numbered-step>`

Implements "Numbered steps": a visual step-number disc is decorative and `aria-hidden` — the
number is already carried by the enclosing `<ol>`'s own semantics, so showing it to assistive tech
too would announce the position twice. The host wraps instances in a real `<ol>`/`<li>`; this
renders the number-plus-content row meant to sit *inside* an `<li>`, not as the list item itself.

Deliberately a separate element from `<rfg-avatar>`, even though both are a short circular label —
design.md keeps them apart on purpose: visual similarity alone isn't reason enough to share one
implementation when merging them would need a size-and-semantics argument at every call site.

## `<rfg-callout>`

Implements "Callouts": a notice about the page/record's *persistent* state ("this is how things
are here"), distinct from `<rfg-flash-message>`'s one-time, per-event notice ("that worked") — no
auto-dismiss here at all, on purpose. Same tone/role mapping as flash-message
(`warning`/`danger` → `alert`, otherwise `status`), plus a full opt-out: `role="none"` removes the
live-region role entirely, for plain page furniture that shouldn't announce.

**Placement is deliberately not this element's concern** — design.md: "a reusable component
shouldn't know or assume where it sits on the page; spacing relative to siblings stays the
caller's responsibility." No margin is set here.

**Found by axe-core, fixed, not assumed:** `role="none"` first returned `undefined` from the
internal role-computation method, which Lit's attribute binding turned into a literal `role=""`
rather than removing the attribute — a real, different claim ("this has an empty role") from the
intended one ("this has no role attribute"). Fixed by returning Lit's `nothing` sentinel instead,
verified by checking `getAttribute("role")` actually returns `null`, not `""`.

## `<rfg-disclosure>`

Implements "Disclosures": a real, focusable `<button>` with real ARIA state, never a link with a
fragment identifier pretending to navigate. **The trigger's accessible name describes what it
controls, never its current action or state** — the WAI-ARIA APG disclosure pattern's own naming
rule, and why this element takes a single `label` that stays constant across both states ("More
filters", never "Show"/"Hide" toggling against `aria-expanded`, which already carries that state
programmatically). There's deliberately no separate open/closed-label API, since that shape would
invite exactly the mistake design.md calls out.

| Attribute | Notes |
| --- | --- |
| `label` | Constant across open/closed. |
| `open` | Boolean, reflected. |

Dispatches `rfg-toggle` with `{ open }`.

## `<rfg-empty-state>`

Implements "Empty states": never bare empty collection chrome. `kind` (`cold-start` \|
`no-results` \| `all-clear`) doesn't change rendering — there's nothing visually different between
the three — it exists so a host's markup states which case it's handling, matching design.md's
own three-flavor table (nothing exists yet → offer to create; a filter matched nothing → offer to
clear it; genuinely nothing to do → reassurance, not an action), and so a future audit can check
the right action is present for the right kind.

## `<rfg-breadcrumbs>`

Implements the breadcrumb rule surfaced from "Conditional reveal": follows the real W3C ARIA APG
breadcrumb pattern rather than inventing a shape — an ordered list (order carries hierarchy),
ancestor links, the current page as plain text with `aria-current="page"`, never a link to
itself.

`items` is `[{ label, href? }]`; an entry with no `href` is the current page — presence of `href`
is the signal, not array position, so a host can't accidentally render the current page as a
self-link.

## `<rfg-conditional-reveal>`

Implements the conditional-reveal mechanism surfaced from the same section: a field that only
applies to one answer in a set is revealed directly below the control that reveals it (DOM order,
so keyboard focus reaches it next), with a visual marker (a left rule + indent) tying it to the
specific option — unmarked, it reads as belonging to every option in the group.

**Deliberately has no opinion on the trigger's ARIA at all** — design.md's own caution:
`aria-expanded` isn't valid on every role, so there's no single state attribute this element
could apply uniformly to a trigger it doesn't control. The host wires whatever triggered it (a
radio, a checkbox, a select) to this element's `shown` property directly.

## `<rfg-filter-bar>`

Implements "Filter bar": filters submit as a real GET request — a filtered view is a shareable,
bookmarkable URL, never client-only state — and a bar whose controls fit on one line shows them;
only a bar that doesn't fold. Two is design.md's own measured threshold: a disclosure in front of
one or two controls is a click that buys nothing.

Composes `<rfg-disclosure>` for the folded case (reuse, not a second accordion implementation).
Slots: `search` (an always-visible field such as a search box, first in the row, never folded),
`fields` (each filter control, counted via `slotchange` to decide fold vs. inline — verified
in a real browser: two controls render inline with no disclosure at all, four render behind one),
`actions` (right end of the row).

**Folded filters start open when any of them is set**, so a filtered list never looks like the
whole list. A field counts as set when a text field has a value, a select's chosen option isn't its
first (the first is the "any" or default option), a multi-select has anything chosen, or a checkbox
is checked. Add `open` to start open regardless. Once someone closes the panel, it stays closed.

**Layout (fixed in v0.1.5).** The row holds the search field, the "Filters" trigger (40px, the same
as the controls, so it lines up with them) and the actions; the open panel takes its own full-width
line below, with the fields in columns. Before, the disclosure was one shrink-to-fit block, so the
trigger sat 10px below the controls and the fields stacked in a single 160px column. Found migrating
SkillRx; `<rfg-disclosure>` gained `trigger` and `panel` parts so the bar could lay them out. Put a `type="submit"` button in `actions` to submit, or call
`bar.form.requestSubmit()` to submit on change.

**The form lives in light DOM.** The bar appends a hidden, empty `<form method="get">` as its own
unslotted child, and points every control inside it at that form with the standard `form="<id>"`
attribute. Native controls and form-associated custom elements (e.g. `<rfg-tag-input>`) both
submit with it, including controls added later and custom elements defined after the bar. Enter
in a text field submits too. If the app has already wrapped the bar in its own `<form>`, the bar
leaves its controls with that form.

Fixed in v0.1.1: v0.1.0 rendered `<form method="get">` inside the shadow root, but a form only owns
controls in its own tree, so every slotted control's `.form` was `null` and the bar submitted
nothing. Checked in Chromium against the built standalone file (2026-11-23): with four controls (so
the bar folds) and a submit button in `actions`, clicking it navigates to
`action?owner=…&q=…&status=…&tags=`. Enter in a text field submits the same way, a control added
later is included, and a bar inside an app's own `<form>` submits with that form. The same check
against the published v0.1.0 file fails.

## `<rfg-pagination>`

Implements "Pagination". **States the range, not the page** — "Showing 31–45 of 272", never "Page
3 of 19," because a page number's meaning changes with page size and answers a different question
than how big the result set actually is. Renders for every non-empty collection, including one
that fits on a single page (just the label, no pager chrome) — verified the single-page case
renders no `<nav>` at all, and the empty case renders "No {entries}".

| Attribute | Notes |
| --- | --- |
| `total` / `page` / `page-size` | |
| `entry-name` | Singular noun, e.g. `"project"` — pluralized automatically in the label. |
| `hrefFor` | Property (function `page => href`): real, bookmarkable per-page URLs. Without it, controls only dispatch `rfg-navigate`, a degraded mode, not the default path. |

**First/Last/Prev/Next don't change the control set's width** — present and disabled at the
boundaries rather than disappearing, except First/Last specifically, which are absent entirely on
a single-page collection (verified) and present-but-disabled on a longer one at the ends
(verified). An unavailable control is a real `<a>` with no `href` and `aria-disabled="true"` —
non-interactive by the absence of `href` itself, not a `disabled` attribute anchors don't have —
never a disabled-looking-but-still-functional link.

## `<rfg-tag-input>`

Implements "Tag input": a free-form list of short values. Enter, comma, or Tab commits the typed
word as a chip; Backspace on an empty box removes the last chip; duplicates are rejected
case-insensitively (`Pack` cannot join `pack`) — all verified against the real component, not
just read off the code.

**The native form control remains the actual source of truth and the thing that submits.**
Implemented as a *form-associated custom element* (`static formAssociated = true`,
`ElementInternals.setFormValue()`) — verified by actually submitting a real `<form>` containing
one and reading the result back from `FormData`, which returned exactly `[name, "comma,separated"]`
the way a plain native input would have. This is the modern, platform-native equivalent of "the
underlying control is exactly the control it always was," done through the browser's own
form-participation API instead of a hidden input a host has to wire up.

**Not a disguised `<select>`**, on purpose — design.md's own incident: a free-tagging control that
visually resembled select2 got clicked expecting a dropdown, and nothing opened. No chevron, no
dropdown affordance anywhere in this element. Each chip's remove button is a real 24×24px target
(WCAG 2.5.8), measured against the specific prior incident design.md records (9×21).

## `<rfg-combobox>`

A searchable, single- or multi-select dropdown, replacing the native `<select>`/`<select
multiple>` it wraps — built to retire select2, still depended on for exactly this need in 14 Human
Essentials views (design.md already names the friction: manual pixel-matching against
`.select2-selection`, a stylesheet needing `!important` nothing else in the system does).

| Attribute | Values | Default |
| --- | --- | --- |
| `label` | text | — (shown above the box; also the panel's `aria-label`) |

Slot: default (the `<select>`/`<select multiple>` to wrap — `multiple` decides single- vs.
multi-select mode, the same attribute that already means that natively).

**Wraps a host-provided `<select>`, the same "wrap, don't reimplement" choice `<rfg-field>`
already makes** — the real `<select>` stays in the DOM (hidden, not removed) as the actual
form-submitting control, so `simple_form`'s `f.select`/`options_for_select` keeps working
unchanged and the field still submits something if this component's JS never loads at all.
Contrast with this element's own `<rfg-tag-input>` neighbor above: that control has no
pre-existing native equivalent to lean on (free-form comma-separated text isn't a native input
type) and became its own form-associated element; a `<select>` already *is* the native equivalent
to this one's need, so wrapping is both less code and a real progressive-enhancement fallback.

**Extends `RfgPopover` (`role="listbox"`), but overrides its content-handling completely** —
unlike `<rfg-menu>`, which inherits `RfgPopover`'s move-real-content-into-markers mechanism
unchanged, this component's panel rows are synthesized from the wrapped `<select>`'s current
`<option>`s and regenerated on every render; there's no real host markup to preserve there the way
there is for a menu's items, so Lit's own re-rendering is simpler and sufficient.

**Keyboard focus stays on the textbox throughout** — `aria-activedescendant`, not real DOM focus
moving between options the way `<rfg-menu>` does. A combobox's whole point is typing *while*
navigating results, which moving real focus away from the input would break; this is the WAI-ARIA
combobox pattern's own reason for using `aria-activedescendant` rather than the menu-button
pattern's real-focus-movement, not an oversight carried over from building the menu first.

**Chips (multi-select) reuse `<rfg-tag-input>`'s exact visual vocabulary** — same box/chip
classes, same 24×24 remove-button target (WCAG 2.5.8) — rather than inventing a second multi-value
look. Backspace on an empty query removes the last selected chip, the same rule `<rfg-tag-input>`
already established for the same reason: a box full of chips with nothing typed reads as "edit the
chips," not "edit the list."

**Field edge contrast (fixed in v0.1.4).** Combobox, tag input and the date range picker's date
fields drew their border in `neutral-200` (1.23:1 on white). WCAG 1.4.11 asks 3:1 for the edge that
shows where a field is, so they now use `neutral-500` (4.76:1). Checked by `field-edge.js` in the
Storybook behavior audit.

## Preview

```bash
npm run storybook        # live dev server, http://localhost:6006
npm run build-storybook  # static site, storybook-static/
```

The same static build is hosted — **<https://rubyforgood.github.io/designsystem/>** — redeployed
by `.github/workflows/deploy-storybook.yml` on every push to `main`, so there's a live link to
browse without a local checkout.

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

### Autodocs

Every component gets a real "Docs" page — `@storybook/addon-docs`, `tags: ["autodocs"]` on each
story file, and `npm run analyze` (`@custom-elements-manifest/analyzer`, see
`custom-elements-manifest.config.mjs`) generating `custom-elements.json` from each component's own
JSDoc, wired in via `setCustomElementsManifest()` in `.storybook/preview.js`. `npm run storybook`
and `npm run build-storybook` both run `analyze` first; the manifest is gitignored and regenerated
on every build, not hand-maintained.

This exists because before it, exactly one of 24 story files (`button.stories.js`) cross-linked
back to design.md at all — nothing enforced that a documented variant had a story, or that a
component's Storybook entry said anything about *why* it's built the way it is. Every component's
default export now also carries `parameters.docs.description.component` (one paragraph, sourced
from that component's own header-comment description of what it implements in design.md) and a
`component: "rfg-x"` field — the latter is what tells Storybook's web-components framework which
tag to look up in the manifest; without it, `setCustomElementsManifest()` loads the data but
nothing on the page ever reads it.

Two things worth knowing if you're adding a component or touching this wiring:

- **Internal reactive state leaks into the generated table twice.** A `{ state: true }` property
  (Lit's `_foo` convention for state that isn't a public prop) shows up in *two* separate places
  in the raw manifest — `declarations[].members` and `declarations[].attributes` — and an
  `@ignore` JSDoc tag only suppresses the first when the property is declared as a plain
  `static properties = { ... }` object entry (it does work on a constructor-assigned
  `this._foo = ...` instance field). `custom-elements-manifest.config.mjs`'s
  `strip-private-members` plugin strips both by name convention (`_`-prefixed) after analysis,
  rather than relying on the tag — add a property that should stay internal, underscore it, done.
- **The plain `static properties = {...}` object form is correctly understood by `--litelement`**,
  including per-property JSDoc comments and `@slot`/`@fires`/`@csspart`/`@ignore` tags — this
  isn't a TypeScript-decorators-only feature. Confirmed by generating a real manifest from
  `button.js`/`field.js` (both use this form) before rolling JSDoc out to the rest.

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
