// `<rfg-callout>` — implements design.md's "Callouts" section: a notice about the page/record's
// *persistent* state ("this is how things are here"), distinct from `<rfg-flash-message>`'s
// one-time, per-event notice ("that worked") — conflating the two produces either a warning that
// disappears when it shouldn't, or a one-time confirmation that inexplicably persists. No
// auto-dismiss here at all, on purpose.
//
// The tone/role mapping mirrors flash-message's: `role="alert"` for warning/danger (interrupts),
// `role="status"` otherwise — except a callout can also opt all the way out of being a live
// region (`role="none"`, reflecting design.md's `role: nil` for plain page furniture with no
// live-region behavior wanted at all).
//
// Placement is explicitly **not** this element's job — design.md: "a reusable component
// shouldn't know or assume where it sits on the page; spacing relative to siblings stays the
// caller's responsibility." No margin is set here; the host positions it.
import { LitElement, html, css, nothing } from "lit";

const TONES = new Set(["info", "success", "warning", "danger"]);

/**
 * A notice about the page/record's *persistent* state ("this is how things are here") —
 * design.md's "Callouts" section — distinct from `<rfg-flash-message>`'s one-time, per-event
 * notice. No auto-dismiss, on purpose. Placement is deliberately not this element's job.
 *
 * @element rfg-callout
 * @slot icon - Optional decorative icon content.
 * @slot - The callout's body.
 */
export class RfgCallout extends LitElement {
  static properties = {
    /** Maps to the ARIA role: warning/danger interrupt (`role="alert"`), info/success announce politely (`role="status"`). */
    tone: { type: String, reflect: true },
    /** Optional heading text above the body. */
    heading: { type: String },
    /** Override the ARIA role entirely, e.g. `role="none"` to opt out of being a live region (plain page furniture). */
    role: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .callout {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-control);
      border: 1px solid transparent;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      /* Neutral text, tone-coloured border/icon only — same measured-contrast reasoning as
         status-pill/flash-message: the semantic tokens are only safe as a glyph/border colour or
         against pure white, not assumed safe as body text on any tint. */
      color: var(--color-neutral-700);
    }

    .icon-slot {
      flex: none;
      margin-top: 0.125rem;
    }
    .icon-slot ::slotted(*) {
      width: 1.125em;
      height: 1.125em;
    }

    .heading {
      font-weight: 600;
      color: var(--color-neutral-900);
      margin: 0 0 0.25rem;
    }

    :host([tone="info"]) .callout,
    :host(:not([tone])) .callout {
      background: color-mix(in oklch, var(--color-info) 6%, white);
      border-color: color-mix(in oklch, var(--color-info) 30%, white);
    }
    :host([tone="info"]) .icon-slot,
    :host(:not([tone])) .icon-slot {
      color: var(--color-info);
    }
    :host([tone="success"]) .callout {
      background: color-mix(in oklch, var(--color-success) 6%, white);
      border-color: color-mix(in oklch, var(--color-success) 30%, white);
    }
    :host([tone="success"]) .icon-slot {
      color: var(--color-success);
    }
    :host([tone="warning"]) .callout {
      background: color-mix(in oklch, var(--color-warning) 6%, white);
      border-color: color-mix(in oklch, var(--color-warning) 30%, white);
    }
    :host([tone="warning"]) .icon-slot {
      color: var(--color-warning);
    }
    :host([tone="danger"]) .callout {
      background: color-mix(in oklch, var(--color-danger) 6%, white);
      border-color: color-mix(in oklch, var(--color-danger) 30%, white);
    }
    :host([tone="danger"]) .icon-slot {
      color: var(--color-danger);
    }
  `;

  constructor() {
    super();
    this.tone = "info";
  }

  willUpdate(changed) {
    if (changed.has("tone") && !TONES.has(this.tone)) {
      console.warn(`<rfg-callout> received unknown tone "${this.tone}"; expected one of ${[...TONES].join(", ")}.`);
    }
  }

  _role() {
    // `nothing`, not `undefined` — found empirically: an `undefined` value in this attribute
    // binding position still set a literal `role=""`, not no attribute at all, which isn't the
    // same claim (an empty role is a different thing from the attribute being absent).
    if (this.role === "none") return nothing;
    if (this.role) return this.role;
    return this.tone === "warning" || this.tone === "danger" ? "alert" : "status";
  }

  render() {
    return html`
      <div class="callout" role=${this._role()}>
        <span class="icon-slot" aria-hidden="true"><slot name="icon"></slot></span>
        <div>
          ${this.heading ? html`<p class="heading">${this.heading}</p>` : null}
          <slot></slot>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("rfg-callout")) {
  customElements.define("rfg-callout", RfgCallout);
}
