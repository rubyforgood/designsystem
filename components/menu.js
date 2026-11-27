// `<rfg-menu>` — implements design.md's Row actions section's kebab/overflow menu: a trigger that
// opens a list of real `role="menuitem"` controls, following the WAI-ARIA menu-button pattern.
//
// **Extends `RfgPopover` (a real JS subclass) rather than composing an instance of it as a nested
// child.** The first version of this tried composing — rendering `<rfg-popover>` inside this
// element's own shadow root and re-exposing its `trigger`/default slots by forwarding through a
// second, nested pair of `<slot>` elements. That doesn't work: a `<slot>` only projects content
// while it remains inside the physical DOM subtree of its own shadow host, and `<rfg-popover>`'s
// panel needs to leave that subtree entirely to portal to `<body>` (see popover.js's own header
// comment for the empirical confirmation — it broke even popover's *existing*, non-chained
// `<rfg-date-range-picker>` consumer, not just this one). Subclassing instead means there is only
// ever one shadow boundary (none, since `RfgPopover` already renders into light DOM) and one real
// set of tracked content nodes — no forwarding chain for the portal to break.
//
// This adds only what's specific to a *menu* on top of the inherited popover behavior:
// `role="menu"`/`"menuitem"` semantics (via the forced `role`), arrow-key navigation between
// items, ArrowDown/ArrowUp opening straight to the first/last item from the trigger, and closing
// on selection.
//
// **Items are plain light-DOM children, any real markup** — not a declarative `<rfg-menu-item>`
// sub-component. Same split already used for `<rfg-table>` ("Portable wrapper, Local markup") and
// `<rfg-popover>`'s own panel content: design.md's row-actions case study has per-item logic this
// component has no business knowing — ghost vs. ghost_danger tone, a disabled *form* action
// rendered as a real disabled `<button>` vs. a disabled *link* rendered as a focusable
// `aria-disabled` `<span>` with visible reason text. The host supplies real
// `<a role="menuitem">`/`<button role="menuitem">`/disabled `<span role="menuitem"
// aria-disabled="true">` elements; this only gives them `role="menu"` (inherited from
// `<rfg-popover>`'s own `role` property) and makes them keyboard-navigable.
//
// **Keyboard focus lands on a disabled item, rather than skipping it** — a deliberate departure
// from the plain WAI-ARIA APG menu default (which typically excludes disabled items from
// navigation entirely). design.md's own "inert on arrival" rule, already applied elsewhere to a
// disabled link in `<rfg-button>`, is that a control which costs something to reason about stays
// reachable and explains itself rather than vanishing — the same reasoning applies here. Selecting
// a disabled item (Enter/Space/click) does nothing and does not close the menu; its own disabled-
// ness already carries that.
import { css } from "lit";
import { RfgPopover } from "./popover.js";

const STYLE_ID = "rfg-menu-styles";

// Own small stylesheet, injected alongside `<rfg-popover>`'s — same pattern `<rfg-combobox>`
// already uses for the same reason: this panel's content (menu items) needs edge-to-edge rows a
// reader can click anywhere across, not `<rfg-popover>`'s generic 0.75rem inset built for
// arbitrary dialog-shaped content. Found integrating this component into a real app for the first
// time: Human Essentials' own hand-built kebab/account menus use `py-1` (a 4px vertical-only
// inset) with items flush to the panel's left/right edges, and `<rfg-popover>`'s uniform padding
// would have inset every item's hover background from the edge instead, a real visible regression
// from what this component was supposed to replace. `min-width` is this component's own sensible
// default (a short single-word item, "Edit", looked cramped at `0.75rem`'s implied width with
// nothing else constraining it) — a consuming app can still make an individual menu wider with its
// own CSS; this is a floor, not a fixed size the way `<rfg-segmented-control>`'s token is.
//
// **`.rfg-popover-panel[role="menu"]`, not `rfg-menu .rfg-popover-panel`** — found live, not
// assumed, integrating this into the same real app a second time: the panel only ever sits
// inside `<rfg-menu>` *before* it opens. `RfgPopover.open()` portals it straight to `<body>`
// unconditionally (the entire point of the portal — see popover.js's own header comment), which
// makes it a sibling of `<body>`'s other children, not a descendant of `<rfg-menu>` at all, the
// instant it's actually visible. A descendant-combinator selector matches the DOM tree as it
// currently stands, so this rule silently stopped applying the moment any menu was opened,
// invisibly falling back to `<rfg-popover>`'s own generic padding/no-min-width instead —
// confirmed by checking computed styles on a real, open account menu, not by eyeballing a
// screenshot (which looked close enough at a glance to not raise suspicion). The panel's own
// `role` attribute is set unconditionally and travels with the element wherever it's portalled,
// so an attribute selector on the panel itself is the one thing that still matches reliably
// either way.
//
// **Items have a default look, in `@layer base`** (added after SkillRx's account menu shipped a bare
// "Sign out" button: no padding, no hover, in a 16px-radius bubble). The header above said items are
// any markup, and every app had to restyle them by hand; one that didn't got the browser's button.
// The defaults sit in the `base` cascade layer on purpose. Tailwind's preflight is in `base` too, so
// these beat it (same layer, higher specificity), while an app's own item classes (utilities, or any
// unlayered CSS) still beat these. An app that styles its items keeps its look. Weight is regular
// (400), as in the original story and Human Essentials' menus; 0.1.9 shipped 500, which made every
// item heavier in an app whose classes set no weight. A `<form>` holding an
// item (Rails' `button_to`, a sign-out) is a block, so the item spans the menu.
//
// **The panel takes `--radius-control`**, the token for "buttons, inputs, menus" (tokens/theme.css),
// not `<rfg-popover>`'s `--radius-surface`, which is for cards and dialogs. At 16px, a one-item menu
// read as a speech bubble.
const STYLES = css`
  .rfg-popover-panel[role="menu"] {
    padding: 0.25rem 0;
    min-width: 12rem;
    border-radius: var(--radius-control);
  }

  @layer base {
    .rfg-popover-panel[role="menu"] form {
      display: block;
      margin: 0;
    }

    .rfg-popover-panel[role="menu"] [role="menuitem"] {
      display: block;
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: 0.5rem 0.75rem;
      border: 0;
      background: none;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.25rem;
      color: var(--color-neutral-700);
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }

    .rfg-popover-panel[role="menu"] [role="menuitem"]:hover,
    .rfg-popover-panel[role="menu"] [role="menuitem"]:focus-visible {
      background: var(--color-neutral-100);
      color: var(--color-neutral-900);
    }

    .rfg-popover-panel[role="menu"] [role="menuitem"]:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: -2px;
    }

    .rfg-popover-panel[role="menu"] [role="menuitem"][aria-disabled="true"] {
      color: var(--color-neutral-500);
      background: none;
      cursor: not-allowed;
    }
  }
`;

function ensureMenuStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES.cssText;
  document.head.appendChild(style);
}

/**
 * A kebab/overflow menu: a trigger that opens a list of `role="menuitem"` controls — design.md's
 * Row actions section. Extends `<rfg-popover role="menu">` for positioning, Escape,
 * outside-click and the portal-to-body fix; adds arrow-key navigation and close-on-select.
 *
 * @element rfg-menu
 * @slot trigger - The element that opens the menu (typically an icon-only `<rfg-button size="xs">`), marked `slot="trigger"`.
 * @slot - The menu's items — real `<a role="menuitem">`/`<button role="menuitem">`/disabled `<span role="menuitem" aria-disabled="true">` elements, any markup. They get a default look (8px 12px, 14px regular, gray hover); an item inside a `<form>` spans the menu. An app's own classes override it.
 * @fires rfg-open - Dispatched when the menu opens.
 * @fires rfg-close - Dispatched when the menu closes.
 */
export class RfgMenu extends RfgPopover {
  constructor() {
    super();
    this.role = "menu";
    this._onKeydown = this._onKeydown.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onTriggerKeydown = this._onTriggerKeydown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    ensureMenuStylesInjected();
  }

  _wireTrigger() {
    const previous = this._trigger;
    super._wireTrigger();
    if (this._trigger && this._trigger !== previous) {
      previous?.removeEventListener("keydown", this._onTriggerKeydown);
      // ArrowDown/ArrowUp open the menu straight to its first/last item — the WAI-ARIA APG
      // menu-button pattern's own recommendation, on top of the plain click `RfgPopover`'s
      // trigger wiring already provides.
      this._trigger.addEventListener("keydown", this._onTriggerKeydown);
    }
  }

  _onTriggerKeydown(e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const toLast = e.key === "ArrowUp";
    this.open().then(() => this._focusItem(toLast ? -1 : 0));
  }

  _items() {
    // `this._panelEl`, not `this` — once open, the panel (and the real items moved inside it,
    // see `RfgPopover`'s own content-placement) lives on `<body>`, not inside this element's own
    // subtree, so `this.querySelectorAll(...)` would find nothing from the moment it portals.
    return [...(this._panelEl?.querySelectorAll('[role="menuitem"]') ?? [])];
  }

  // A native `disabled` button can't receive focus at all — nothing special to do for it beyond
  // not landing there. An `aria-disabled` link/span is deliberately still a real focus target;
  // see this file's own header comment.
  _focusableItems() {
    return this._items().filter((item) => item.disabled !== true);
  }

  _focusItem(index) {
    const items = this._focusableItems();
    if (items.length === 0) return;
    const i = ((index % items.length) + items.length) % items.length;
    items[i].focus();
  }

  async open() {
    await super.open();
    // On `this._panelEl`, not `this` — once open, the panel (and the real items inside it) lives
    // on `<body>`, no longer a DOM descendant of `<rfg-menu>` itself, so a keydown/click dispatched
    // on a focused/clicked item would never bubble up to a listener placed on this element.
    this._panelEl.addEventListener("keydown", this._onKeydown);
    this._panelEl.addEventListener("click", this._onClick);
    this._focusItem(0);
  }

  close(opts) {
    this._panelEl?.removeEventListener("keydown", this._onKeydown);
    this._panelEl?.removeEventListener("click", this._onClick);
    super.close(opts);
  }

  _onKeydown(e) {
    const items = this._focusableItems();
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this._focusItem(current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._focusItem(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      this._focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      this._focusItem(-1);
    }
  }

  _onClick(e) {
    const item = e.target.closest?.('[role="menuitem"]');
    if (!item) return;
    if (item.getAttribute("aria-disabled") === "true" || item.disabled) {
      // Inert on arrival: reachable and explained, but activating it does nothing — the browser
      // would otherwise still navigate a real `aria-disabled` `<a href>`.
      e.preventDefault();
      return;
    }
    this.close();
  }
}

if (!customElements.get("rfg-menu")) {
  customElements.define("rfg-menu", RfgMenu);
}
