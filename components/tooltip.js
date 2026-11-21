// `<rfg-tooltip>` — implements design.md's "Row actions" section's tooltip rules (anchored under
// `#tooltips`): an icon-only control is named by a real `aria-label`, never `title` — `title` is
// browser chrome, unstyleable, silent on keyboard focus, gone on a timer, and neither hoverable
// nor dismissible, which is three failures of WCAG 1.4.13 at once. This ships the component that
// rule asks for, generalized from Human Essentials' own `tooltip_controller.js`: that
// implementation is the proven reference this ports from (640 icon-only controls across 153
// screens, 0 defects per its own audit), not a fresh design.
//
// **The bubble is appended straight to `<body>`, never rendered through this element's own
// template.** This isn't a workaround — it's simpler than the alternative. A shadow-root-rendered
// bubble would face the exact `position: fixed`-trapped-by-a-sticky-ancestor's-stacking-context
// problem design.md documents for the row-action menu (see `<rfg-popover>`'s portal fix), needing
// the same portal-and-restore machinery. Managing the bubble as a plain, imperatively-created DOM
// node that's never nested inside this component's own tree sidesteps the problem by construction
// rather than solving it after the fact — exactly how `tooltip_controller.js` already does it.
//
// **The bubble's text comes from the trigger's own `aria-label`, not a second, separately-declared
// string.** design.md says the bubble and the accessible name "carry the same string" — making
// that structural rather than a convention to remember matters, since this codebase has hit the
// two-copies-of-one-string mistake before (`<rfg-button>`'s attribute proxy originally *copied*
// instead of moved `data-confirm`, which broke `confirm_dialog_controller.js`'s replay step; see
// designsystem ADR 14). If the slotted trigger has no accessible name of its own (no visible text,
// no existing `aria-label`/`aria-labelledby`), this writes `text` onto it as `aria-label` — the
// same accessible-name check `<rfg-button>` already does before warning. A trigger that already
// has its own name (visible text, or a caller-set `aria-label` for some other reason — e.g.
// showing a full value a truncated label hides) keeps it untouched; `text` only ever backs the
// bubble's content in that case, which is a real, named exception, not silent divergence.
import { LitElement, html } from "lit";

const STYLE_ID = "rfg-tooltip-styles";

// Kept as a plain string, injected once globally, for the same reason `<rfg-button>`'s styles
// are: the bubble this targets lives outside any shadow root by the time it's visible at all, so
// a shadow-scoped `static styles` sheet would never reach it.
const STYLES = `
  .rfg-tooltip-bubble {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    max-width: 22rem;
    border-radius: var(--radius-control);
    background: var(--color-neutral-900);
    color: white;
    padding: 0.375rem 0.625rem;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    line-height: 1.45;
    white-space: normal;
    box-shadow: var(--shadow-overlay);
    pointer-events: auto;
  }
`;

function ensureStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES;
  document.head.appendChild(style);
}

/**
 * Names and shows a bubble for an icon-only (or any) control on hover and focus — design.md's
 * tooltip rules under "Row actions": never `title`, hoverable and dismissible (WCAG 1.4.13), the
 * bubble `aria-hidden` since the control's own `aria-label` already carries the same string.
 *
 * @element rfg-tooltip
 * @slot - The trigger element the tooltip is attached to (typically an icon-only `<rfg-button>`).
 * @fires rfg-tooltip-show - Dispatched when the bubble appears.
 * @fires rfg-tooltip-hide - Dispatched when the bubble disappears.
 */
export class RfgTooltip extends LitElement {
  static properties = {
    /** The bubble's text — also written onto the trigger's `aria-label` if it has no accessible name of its own. */
    text: { type: String },
  };

  constructor() {
    super();
    this._bubble = null;
    this._trigger = null;
    this._escapeDismissed = false;
    this._onOver = this._onOver.bind(this);
    this._onOut = this._onOut.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    ensureStylesInjected();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unwireTrigger();
    this._hide();
  }

  firstUpdated() {
    const slot = this.renderRoot.querySelector("slot");
    slot.addEventListener("slotchange", () => this._wireTrigger());
    this._wireTrigger();
  }

  willUpdate(changed) {
    if (changed.has("text") && !this.text) {
      console.warn("<rfg-tooltip> has no text — nothing would be named or shown.");
    }
  }

  updated(changed) {
    if (changed.has("text") && this._bubble) this._bubble.textContent = this.text;
  }

  _wireTrigger() {
    const trigger = this.renderRoot.querySelector("slot").assignedElements()[0];
    if (!trigger || trigger === this._trigger) return;
    this._unwireTrigger();
    this._trigger = trigger;

    // Same accessible-name check <rfg-button> already runs before it warns — only a trigger with
    // neither visible text nor its own aria-label/aria-labelledby gets this one written onto it.
    const hasVisibleText = trigger.textContent.trim().length > 0;
    const hasOwnName = trigger.hasAttribute("aria-label") || trigger.hasAttribute("aria-labelledby");
    if (!hasVisibleText && !hasOwnName && this.text) {
      trigger.setAttribute("aria-label", this.text);
    }
    // Browser chrome's own tooltip is a second tooltip for one control, and draws a beat after
    // ours — removed, not left alongside, the same rule tooltip_controller.js already applies.
    trigger.removeAttribute("title");

    trigger.addEventListener("mouseover", this._onOver);
    trigger.addEventListener("mouseout", this._onOut);
    trigger.addEventListener("focusin", this._onFocus);
    trigger.addEventListener("focusout", this._onBlur);
  }

  _unwireTrigger() {
    if (!this._trigger) return;
    this._trigger.removeEventListener("mouseover", this._onOver);
    this._trigger.removeEventListener("mouseout", this._onOut);
    this._trigger.removeEventListener("focusin", this._onFocus);
    this._trigger.removeEventListener("focusout", this._onBlur);
    this._trigger = null;
  }

  _onOver() {
    // A real browser can re-fire a trusted mouseover for an element the pointer never actually
    // moved to or off of — found live, against Human Essentials' own tooltip_controller.js:
    // focusing/blurring a control can make Chrome recompute what is "under the pointer" and
    // resend enter/leave for it with no real pointer movement. Without this guard, a keyboard user
    // whose mouse happens to already rest on a control they Tab to would press Escape, dismiss the
    // bubble, and immediately get it back — exactly what WCAG 1.4.13 "dismissible" promises can't
    // happen. Cleared on the next genuine leave, so a real subsequent hover still works normally.
    if (this._escapeDismissed) {
      this._escapeDismissed = false;
      return;
    }
    this._show();
  }

  _onOut(e) {
    // WCAG 1.4.13 "hoverable": moving the pointer onto the bubble itself must not dismiss it.
    if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".rfg-tooltip-bubble")) return;
    this._escapeDismissed = false;
    this._hide();
  }

  _onFocus() {
    this._show();
  }

  _onBlur() {
    this._hide();
  }

  // WCAG 1.4.13 "dismissible": without moving the pointer.
  _onKeydown(e) {
    if (e.key === "Escape" && this._bubble) {
      this._escapeDismissed = true;
      this._hide();
    }
  }

  _onScroll() {
    if (!this._bubble || !this._trigger) return;
    if (!this._trigger.isConnected) return this._hide();
    this._place();
  }

  _show() {
    if (!this.text || !this._trigger || this._bubble) return;
    this._bubble = document.createElement("div");
    this._bubble.className = "rfg-tooltip-bubble";
    this._bubble.setAttribute("aria-hidden", "true");
    this._bubble.textContent = this.text;
    document.body.appendChild(this._bubble);
    this._place();
    document.addEventListener("keydown", this._onKeydown);
    window.addEventListener("scroll", this._onScroll, true);
    window.addEventListener("resize", this._onScroll);
    this.dispatchEvent(new CustomEvent("rfg-tooltip-show", { bubbles: true, composed: true }));
  }

  _place() {
    const anchor = this._trigger.getBoundingClientRect();
    const bubble = this._bubble.getBoundingClientRect();
    const gap = 8;

    let left = anchor.left + anchor.width / 2 - bubble.width / 2;
    let top = anchor.bottom + gap;

    // Flips left rather than running off the window — a frozen/sticky actions column routinely
    // leaves nothing to the right of the trigger.
    if (left + bubble.width > window.innerWidth - gap) {
      left = anchor.left - bubble.width - gap;
      top = anchor.top + anchor.height / 2 - bubble.height / 2;
    }
    // And above rather than below when there's no room under it.
    if (top + bubble.height > window.innerHeight - gap) {
      top = anchor.top - bubble.height - gap;
    }

    this._bubble.style.left = `${Math.max(gap, left)}px`;
    this._bubble.style.top = `${Math.max(gap, top)}px`;
  }

  _hide() {
    if (!this._bubble) return;
    this._bubble.remove();
    this._bubble = null;
    document.removeEventListener("keydown", this._onKeydown);
    window.removeEventListener("scroll", this._onScroll, true);
    window.removeEventListener("resize", this._onScroll);
    this.dispatchEvent(new CustomEvent("rfg-tooltip-hide", { bubbles: true, composed: true }));
  }

  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get("rfg-tooltip")) {
  customElements.define("rfg-tooltip", RfgTooltip);
}
