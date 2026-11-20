// `<rfg-flash-message>` — implements design.md's "Flash messages" section: severity decides the
// ARIA role (info announces politely, warning/danger interrupt), and an auto-dismiss timer, if
// used at all, pauses on hover and on focus (WCAG 2.2.1 Timing Adjustable).
//
// Judgment call the host must make, not this component: design.md's own rule is that whether a
// message may auto-dismiss depends on whether its *content* stays needed for as long as the timer
// runs, not its tone — a "success" message carrying a one-time credential must not auto-dismiss
// even though success messages usually can. This element only provides the mechanism
// (`dismiss-after`, pausable); deciding whether to set it for a given message is the host's call,
// not something inferable from `tone` alone.

import { LitElement, html, css } from "lit";

const TONES = new Set(["info", "success", "warning", "danger"]);

/**
 * A one-time, per-event notice ("that worked") — design.md's "Flash messages" section.
 * Severity decides the ARIA role; an auto-dismiss timer, if used, pauses on hover/focus
 * (WCAG 2.2.1 Timing Adjustable).
 *
 * @element rfg-flash-message
 * @slot icon - Optional decorative icon content.
 * @slot - The message body.
 * @fires rfg-dismiss - `{ reason }`, dispatched when the message is dismissed (manually or by the timer).
 */
export class RfgFlashMessage extends LitElement {
  static properties = {
    /** Decides the ARIA role: warning/danger interrupt (`role="alert"`), info/success announce politely (`role="status"`). */
    tone: { type: String, reflect: true },
    /** Shows a manual close control, independent of the auto-dismiss timer. */
    dismissible: { type: Boolean },
    /** Milliseconds before auto-dismiss; a judgment call for the host, since it depends on whether the message's content stays needed that long, not its tone. */
    dismissAfter: { type: Number, attribute: "dismiss-after" },
    /** @ignore */
    _remaining: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .flash {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-control);
      border-left: 3px solid transparent;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      /* Neutral-900 text, not the tone colour: rose-600 (the danger token) only clears WCAG AA
         4.5:1 against pure white, by a 0.01 margin (tokens/README.md's own measured note) — any
         tint, even a light one, drops it below threshold. Found by actually running axe-core
         against this element, not assumed. The tone shows in the left border and the icon
         instead, neither of which carries the same text-contrast requirement. */
      color: var(--color-neutral-900);
    }

    .icon-slot {
      display: inline-flex;
      flex: none;
      margin-top: 0.125rem;
    }
    .icon-slot ::slotted(*) {
      width: 1.125em;
      height: 1.125em;
    }

    .message {
      flex: 1;
    }

    .dismiss {
      flex: none;
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      padding: 0;
      display: inline-flex;
    }
    .dismiss:hover {
      opacity: 1;
    }
    .dismiss:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }

    :host([tone="info"]) .flash,
    :host(:not([tone])) .flash {
      background: color-mix(in oklch, var(--color-info) 8%, white);
      border-left-color: var(--color-info);
    }
    :host([tone="info"]) .icon-slot ::slotted(*),
    :host(:not([tone])) .icon-slot ::slotted(*) {
      color: var(--color-info);
    }
    :host([tone="success"]) .flash {
      background: color-mix(in oklch, var(--color-success) 8%, white);
      border-left-color: var(--color-success);
    }
    :host([tone="success"]) .icon-slot ::slotted(*) {
      color: var(--color-success);
    }
    :host([tone="warning"]) .flash {
      background: color-mix(in oklch, var(--color-warning) 8%, white);
      border-left-color: var(--color-warning);
    }
    :host([tone="warning"]) .icon-slot ::slotted(*) {
      color: var(--color-warning);
    }
    :host([tone="danger"]) .flash {
      background: color-mix(in oklch, var(--color-danger) 8%, white);
      border-left-color: var(--color-danger);
    }
    :host([tone="danger"]) .icon-slot ::slotted(*) {
      color: var(--color-danger);
    }
  `;

  constructor() {
    super();
    this.tone = "info";
    this.dismissible = true;
    this.dismissAfter = undefined;
    this._timerStart = null;
    this._timerHandle = null;
  }

  willUpdate(changed) {
    if (changed.has("tone") && !TONES.has(this.tone)) {
      console.warn(`<rfg-flash-message> received unknown tone "${this.tone}"; expected one of ${[...TONES].join(", ")}.`);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.dismissAfter) this._armTimer(this.dismissAfter);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimer();
  }

  _armTimer(ms) {
    this._clearTimer();
    this._timerStart = Date.now();
    this._timerHandle = setTimeout(() => this._dismiss("auto"), ms);
  }

  _clearTimer() {
    if (this._timerHandle) clearTimeout(this._timerHandle);
    this._timerHandle = null;
  }

  // Pauses on hover and on focus (within the message), per WCAG 2.2.1 — resumes with whatever
  // time was left, not a fresh full duration.
  _pause() {
    if (!this._timerHandle || !this.dismissAfter) return;
    this._remaining = this.dismissAfter - (Date.now() - this._timerStart);
    this._clearTimer();
  }

  _resume() {
    if (this._remaining == null) return;
    this._armTimer(Math.max(this._remaining, 0));
    this._remaining = null;
  }

  _dismiss(reason) {
    this._clearTimer();
    // Removal itself stays silent for sighted users (design.md: "a message disappearing is not
    // new information worth interrupting anyone for") — this event is for the host to remove the
    // element from the DOM / Turbo frame, not an announcement.
    this.dispatchEvent(new CustomEvent("rfg-dismiss", { detail: { reason }, bubbles: true, composed: true }));
  }

  render() {
    const assertive = this.tone === "warning" || this.tone === "danger";
    return html`
      <div
        class="flash"
        role=${assertive ? "alert" : "status"}
        aria-live=${assertive ? "assertive" : "polite"}
        @mouseenter=${this._pause}
        @mouseleave=${this._resume}
        @focusin=${this._pause}
        @focusout=${this._resume}
      >
        <span class="icon-slot" aria-hidden="true"><slot name="icon"></slot></span>
        <div class="message"><slot></slot></div>
        ${this.dismissible
          ? html`
              <button class="dismiss" type="button" aria-label="Dismiss" @click=${() => this._dismiss("manual")}>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            `
          : null}
      </div>
    `;
  }
}

if (!customElements.get("rfg-flash-message")) {
  customElements.define("rfg-flash-message", RfgFlashMessage);
}
