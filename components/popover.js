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
import { LitElement, html, css } from "lit";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";

/**
 * An anchored floating panel (account menu, filter) sharing one interaction contract —
 * design.md's "Popovers" section: Escape closes and returns focus, outside click closes
 * without moving focus, and it repositions to stay in the viewport (`@floating-ui/dom`).
 * Unlike `<rfg-modal>`, this does **not** trap focus or make the rest of the page inert.
 *
 * @element rfg-popover
 * @slot trigger - The element that opens the panel (typically a `<rfg-button>`).
 * @slot - The panel content.
 * @fires rfg-open - Dispatched when the panel opens.
 * @fires rfg-close - Dispatched when the panel closes.
 */
export class RfgPopover extends LitElement {
  static properties = {
    /** The accessible name for the panel. */
    label: { type: String },
    /** Preferred placement relative to the trigger, e.g. `bottom-end`; flips/shifts automatically to stay in the viewport. */
    placement: { type: String },
    /** @ignore */
    _open: { state: true },
  };

  static styles = css`
    :host {
      display: inline-block;
    }

    .panel {
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
  `;

  constructor() {
    super();
    this.placement = "bottom-start";
    this._open = false;
    this._onDocPointerDown = this._onDocPointerDown.bind(this);
    this._onDocKeydown = this._onDocKeydown.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeDocListeners();
  }

  firstUpdated() {
    const slot = this.renderRoot.querySelector('slot[name="trigger"]');
    slot.addEventListener("slotchange", () => this._wireTrigger());
    this._wireTrigger();
  }

  _wireTrigger() {
    const trigger = this.renderRoot.querySelector('slot[name="trigger"]').assignedElements()[0];
    if (!trigger || trigger === this._trigger) return;
    this._trigger = trigger;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", this._panelId());
    trigger.addEventListener("click", () => (this._open ? this.close() : this.open()));
  }

  _panelId() {
    if (!this._uid) this._uid = Math.random().toString(36).slice(2, 8);
    return `rfg-popover-${this._uid}`;
  }

  async open() {
    if (this._open || !this._trigger) return;
    this._open = true;
    this._trigger.setAttribute("aria-expanded", "true");
    await this.updateComplete;
    await this._reposition();
    this._addDocListeners();
    this.dispatchEvent(new CustomEvent("rfg-open", { bubbles: true, composed: true }));
  }

  close({ returnFocus = true } = {}) {
    if (!this._open) return;
    this._open = false;
    this._trigger?.setAttribute("aria-expanded", "false");
    this._removeDocListeners();
    // Outside-click closing must not move focus — the click that closed it already put focus
    // wherever the user meant it to go. Escape closing *does* return focus to the trigger.
    if (returnFocus) this._trigger?.focus();
    this.dispatchEvent(new CustomEvent("rfg-close", { bubbles: true, composed: true }));
  }

  async _reposition() {
    const panel = this.renderRoot.querySelector(".panel");
    if (!panel || !this._trigger) return;
    const { x, y } = await computePosition(this._trigger, panel, {
      placement: this.placement,
      strategy: "fixed",
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    });
    Object.assign(panel.style, { left: `${x}px`, top: `${y}px` });
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
    const panel = this.renderRoot.querySelector(".panel");
    if (panel && path.includes(panel)) return;
    this.close({ returnFocus: false });
  }

  _onDocKeydown(e) {
    if (e.key === "Escape") this.close();
  }

  render() {
    return html`
      <slot name="trigger"></slot>
      <div class="panel" role="dialog" aria-label=${this.label || "Popover"} id=${this._panelId()} ?hidden=${!this._open}>
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get("rfg-popover")) {
  customElements.define("rfg-popover", RfgPopover);
}
