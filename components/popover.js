// `<rfg-popover>` — implements design.md's "Popovers" section: an anchored floating panel (the
// account menu, a filter) sharing one implementation of the interaction contract — Escape closes
// and returns focus, outside click closes without moving focus, expanded state is a real ARIA
// attribute, the panel is actually removed from the accessibility tree while closed (`hidden`,
// not just visually hidden), and it repositions to stay in the viewport.
//
// That last rule — "repositions (flips, shifts) to stay within the viewport, computed from the
// trigger's actual position" — needs real collision-detection math to satisfy correctly. Rather
// than reimplement that poorly, this uses `@floating-ui/dom` (the maintained successor to
// Popper, used by Shoelace and Radix for exactly this): the same "prefer the platform/a
// battle-tested implementation over reimplementing a known-hard problem" reasoning design.md
// itself gives for `<dialog>` over a hand-rolled modal, applied to positioning instead of
// dialog mechanics. First new runtime dependency beyond `lit` for this library.
//
// Unlike modal.js, this is **not** a dialog: it must not trap focus or make the rest of the page
// inert (design.md is explicit that conflating the two is a functional bug, not a style miss).
//
// **Renders into light DOM, not a shadow root — found necessary while building this panel's
// portal-to-body fix (below), not for any of the reasons `<rfg-button>`/`<rfg-field>`/`<rfg-tabs>`
// already needed it.** A `<slot>` only projects its assigned content while it remains inside the
// physical DOM subtree of its own shadow host. Moving `.rfg-popover-panel` to `<body>` while it
// still contained a `<slot>` silently broke projection entirely — confirmed empirically, including
// against this element's own pre-existing `<rfg-date-range-picker>` consumer, which composes this
// component directly (no further nesting at all): its calendar inputs rendered nothing once the
// panel moved, even though the panel `<div>` itself still opened, positioned, and painted
// correctly. This follows `<rfg-button>`'s established fix for a different problem with the
// same shape: capture the host's real children once, track them through external mutation, and
// move them (never mirror, never project) into marker positions in the rendered template — real
// nodes can be relocated anywhere in the document and keep working; a `<slot>` cannot.
//
// **Also new: `role`, generalizing what this panel (and what its trigger's `aria-haspopup`)
// actually is.** Defaults to `dialog`, this element's original and only shape — zero change for
// an existing consumer. `<rfg-menu>` sets it to `menu` (its items carry `role="menuitem"`);
// `<rfg-combobox>` sets it to `listbox` (`role="option"`). `aria-haspopup`'s value is required to
// name the popup's own role, so the two can't be decided independently.
import { LitElement, html, css } from "lit";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";

const STYLE_ID = "rfg-popover-styles";

// Global, not `static styles` — this element renders into light DOM (see header comment), so
// there's no shadow root for a scoped stylesheet to attach to. One copy, injected once, serves
// every instance — the same reasoning and the same mechanism `<rfg-button>` already uses.
//
// The tag list in the first rule is a real cost of subclassing rather than composing: a CSS tag
// selector matches by the element's own tag name, which `<rfg-menu>`/`<rfg-combobox>` each have
// their own of, so each needs naming here explicitly. The alternative — a class name instead of a
// tag selector — would need every consumer to remember to add it; this way nothing to remember.
const STYLES = css`
  rfg-popover,
  rfg-menu,
  rfg-combobox {
    display: inline-block;
  }

  .rfg-popover-panel {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 30;
    background: white;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-surface);
    box-shadow: var(--shadow-overlay);
    padding: 0.75rem;
  }

  .rfg-popover-panel[hidden] {
    display: none;
  }

  /* Insertion-order anchors for placeInOrder (below) — real DOM nodes a moved child is
     positioned "before", never meant to be seen or take up space themselves. Same technique
     rfg-button uses for its icon/label markers. */
  .rfg-popover-trigger-position,
  .rfg-popover-panel-position {
    display: none;
  }
`;

function ensureStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES.cssText;
  document.head.appendChild(style);
}

// Moves `nodes` to sit, in order, immediately before `marker` — a no-op when already there, and
// drops any node that can no longer be placed (disconnected, or now containing `marker` itself).
// Identical to `<rfg-button>`'s own `placeInOrder` — copied rather than imported, matching this
// codebase's "each component is a self-contained, standalone-distributable file" rule (see
// components/README.md's "As a single standalone file").
function placeInOrder(nodes, marker) {
  const placeable = nodes.filter((node) => node.isConnected && node !== marker && !node.contains(marker));
  const alreadyPlaced = placeable.every((node, i) => {
    const next = i === placeable.length - 1 ? marker : placeable[i + 1];
    return node.nextSibling === next;
  });
  if (alreadyPlaced) return;
  placeable.forEach((node) => marker.before(node));
}

/**
 * An anchored floating panel (account menu, filter) sharing one interaction contract —
 * design.md's "Popovers" section: Escape closes and returns focus, outside click closes
 * without moving focus, it repositions to stay in the viewport (`@floating-ui/dom`), and it
 * portals to `<body>` while open so a `position: sticky`/`fixed` ancestor's own stacking context
 * can't trap it. Unlike `<rfg-modal>`, this does **not** trap focus or make the rest of the page
 * inert.
 *
 * @element rfg-popover
 * @slot trigger - The element that opens the panel (typically a `<rfg-button>`), marked `slot="trigger"`.
 * @slot - The panel content.
 * @fires rfg-open - Dispatched when the panel opens.
 * @fires rfg-close - Dispatched when the panel closes.
 */
export class RfgPopover extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    /** The accessible name for the panel. */
    label: { type: String },
    /** Preferred placement relative to the trigger, e.g. `bottom-end`; flips/shifts automatically to stay in the viewport. */
    placement: { type: String },
    /** The panel's ARIA role, and what `aria-haspopup` on the trigger names — `dialog` (default), `menu`, or `listbox`. */
    role: { type: String },
    /**
     * Skips portalling the panel to `<body>` while open. Set this when nothing in the ancestor
     * chain creates a stacking context the panel would otherwise need to escape (no
     * `position: sticky`/`fixed` ancestor) — portalling has a real cost this element cannot see
     * from inside itself: anything watching the panel's *own* subtree for changes (a framework's
     * own behavior layer attached to this element, tracking its descendants) stops seeing it the
     * moment it becomes a `<body>` child instead, since that is a different subtree entirely.
     * Found integrating this into a real app: Stimulus controllers attached to this element, with
     * `static targets` resolving inside the panel, silently lost every target the instant the
     * panel portalled out from under them.
     */
    noPortal: { type: Boolean, attribute: "no-portal" },
    /** @ignore */
    _open: { state: true },
  };

  constructor() {
    super();
    this.placement = "bottom-start";
    this.role = "dialog";
    this._open = false;
    /** @ignore */
    this._triggerNodes = [];
    /** @ignore */
    this._contentNodes = [];
    this._onDocPointerDown = this._onDocPointerDown.bind(this);
    this._onDocKeydown = this._onDocKeydown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    ensureStylesInjected();
    this._syncContent();
    // Not a one-time capture — a host's own direct children can change after this element has
    // already rendered once (a Turbo-frame-equivalent swap replacing content in place rather than
    // recreating this element), the same real case `<rfg-button>` hit. Re-derived from whatever
    // the host's current children actually are, instead of a stale snapshot.
    this._observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.type === "childList")) this._syncContent();
    });
    this._observer.observe(this, { childList: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._removeDocListeners();
    // A still-portalled panel means this element was torn down without going through close()
    // first — the panel is a child of <body> now, owned by nothing, and would otherwise sit
    // there forever. The placeholder comment goes with it; there's no position left to restore.
    if (this._placeholder) {
      this._panelEl?.remove();
      this._placeholder.remove();
      this._placeholder = null;
    }
  }

  _syncContent() {
    // Excluded by identity/class, not by selector — these are real, specific elements this
    // component itself created, not external content. `<rfg-button>`'s own version of this guard
    // only has to exclude one rendered element (`.control`) because all of its markers live
    // *inside* that one container; this element's trigger marker is a top-level sibling of the
    // panel instead, so it needs its own exclusion here too — missing it meant the marker got
    // misclassified as "content" on the very next resync (this component's own render inserting
    // it is itself a childList mutation the observer below watches) and dragged into the panel,
    // taking the real trigger with it. Same shape of self-triggered-resync risk `<rfg-button>`
    // already names, just with one more top-level element to account for.
    //
    // `this._placeholder` needs the same exclusion, found the same way: `_portal()` inserting it
    // as a sibling of the panel is *also* a childList mutation this observer watches, and without
    // this it got classified as content and moved inside the very panel it marks the position
    // of — so closing tried to replace an ancestor with itself (`replaceWith` throwing "the new
    // child element contains the parent").
    const original = [...this.childNodes].filter(
      (n) =>
        n !== this._panelEl &&
        n !== this._placeholder &&
        !(n.nodeType === 1 && n.classList.contains("rfg-popover-trigger-position")),
    );
    if (original.length === 0 && (this._triggerNodes.length > 0 || this._contentNodes.length > 0)) return;

    this._triggerNodes = original.filter((n) => n.nodeType === 1 && n.getAttribute("slot") === "trigger");
    this._contentNodes = original.filter((n) => !this._triggerNodes.includes(n));
    this.requestUpdate();
  }

  updated() {
    // Cached once, not re-queried — after the panel is portalled, `this.querySelector(...)` can
    // no longer find it (it's not inside `this` any more), but the JS reference stays valid
    // wherever the node currently lives, same as `<rfg-button>`'s `_controlEl`.
    this._panelEl ??= this.querySelector(".rfg-popover-panel");
    if (!this._panelEl) return;

    const triggerMarker = this.querySelector(".rfg-popover-trigger-position");
    if (triggerMarker) placeInOrder(this._triggerNodes, triggerMarker);

    // Queried on the cached panel element directly, not on `this` — correct regardless of
    // whether the panel is currently portalled, since `querySelector` on a specific element
    // searches its own subtree wherever that element currently sits.
    const panelMarker = this._panelEl.querySelector(".rfg-popover-panel-position");
    if (panelMarker) placeInOrder(this._contentNodes, panelMarker);

    this._wireTrigger();
  }

  _wireTrigger() {
    const trigger = this._triggerNodes[0];
    if (!trigger || trigger === this._trigger) return;
    this._trigger = trigger;
    trigger.setAttribute("aria-haspopup", this.role);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", this._panelId());
    trigger.addEventListener("click", () => (this._open ? this.close() : this.open()));
  }

  _panelId() {
    if (!this._uid) this._uid = Math.random().toString(36).slice(2, 8);
    return `rfg-popover-${this._uid}`;
  }

  // Public, read-only — a consumer wiring its own behavior to this element (a Stimulus controller
  // on the same host, say) needs to ask "is this open right now" without reaching into `_open`,
  // which is a Lit-internal convention (the leading underscore), not a contract. Named `isOpen`,
  // not `open`, so it can't collide with the method above.
  get isOpen() {
    return this._open;
  }

  async open() {
    if (this._open || !this._trigger) return;
    this._open = true;
    this._trigger.setAttribute("aria-expanded", "true");
    await this.updateComplete;
    this._portal();
    await this._reposition();
    this._addDocListeners();
    // Moves focus into the panel, same as the dialog pattern this panel shares the rest of its
    // contract with (Escape, outside-click, portal) already asks for. `<rfg-menu>` overrides this
    // method and focuses its own first item instead, afterward — this still runs first there, but
    // harmlessly, since nothing inside a menu panel matches `[role="menuitem"]` *and* this
    // selector at once by accident. `<rfg-combobox>` never reaches this at all with anything to
    // focus: its own panel holds `role="option"` rows with no tabindex, and real focus never
    // leaves its textbox in the first place (the WAI-ARIA combobox pattern's own reason), so the
    // query below simply finds nothing there.
    const first = this._panelEl?.querySelector(
      "input:not([type=hidden]), select, textarea, button, [href], [tabindex]:not([tabindex='-1'])",
    );
    first?.focus();
    this.dispatchEvent(new CustomEvent("rfg-open", { bubbles: true, composed: true }));
  }

  close({ returnFocus = true } = {}) {
    if (!this._open) return;
    this._open = false;
    this._trigger?.setAttribute("aria-expanded", "false");
    this._removeDocListeners();
    this._unportal();
    // Outside-click closing must not move focus — the click that closed it already put focus
    // wherever the user meant it to go. Escape closing *does* return focus to the trigger.
    if (returnFocus) this._trigger?.focus();
    this.dispatchEvent(new CustomEvent("rfg-close", { bubbles: true, composed: true }));
  }

  // Moves the already-rendered panel out to `<body>`, leaving a comment node marking exactly
  // where it came from. `position: fixed` already positions relative to the viewport regardless
  // of DOM nesting, so moving the element changes nothing about the positioning math below —
  // only the ancestor chain stacking contexts resolve against, which is the entire point.
  _portal() {
    if (!this._panelEl || this._placeholder || this.noPortal) return;
    this._placeholder = document.createComment("rfg-popover-panel");
    this._panelEl.before(this._placeholder);
    document.body.appendChild(this._panelEl);
  }

  _unportal() {
    if (!this._placeholder) return;
    this._placeholder.replaceWith(this._panelEl);
    this._placeholder = null;
  }

  async _reposition() {
    if (!this._panelEl || !this._trigger) return;
    const { x, y } = await computePosition(this._trigger, this._panelEl, {
      placement: this.placement,
      strategy: "fixed",
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    });
    Object.assign(this._panelEl.style, { left: `${x}px`, top: `${y}px` });
  }

  _addDocListeners() {
    document.addEventListener("pointerdown", this._onDocPointerDown, true);
    document.addEventListener("keydown", this._onDocKeydown, true);
  }

  _removeDocListeners() {
    document.removeEventListener("pointerdown", this._onDocPointerDown, true);
    document.removeEventListener("keydown", this._onDocKeydown, true);
  }

  _onDocPointerDown(e) {
    const path = e.composedPath();
    if (path.includes(this._trigger)) return;
    if (this._panelEl && path.includes(this._panelEl)) return;
    this.close({ returnFocus: false });
  }

  _onDocKeydown(e) {
    if (e.key === "Escape") this.close();
  }

  render() {
    return html`
      <span class="rfg-popover-trigger-position"></span>
      <div class="rfg-popover-panel" role=${this.role} aria-label=${this.label || "Popover"} id=${this._panelId()} ?hidden=${!this._open}>
        <span class="rfg-popover-panel-position"></span>
      </div>
    `;
  }
}

if (!customElements.get("rfg-popover")) {
  customElements.define("rfg-popover", RfgPopover);
}
