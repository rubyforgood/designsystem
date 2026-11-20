// `<rfg-status-pill>` — implements design.md's "Status pills" section: communicates state, never
// an action. Never focusable, never looks pressable — see "a pill communicates state, not action"
// and the badge-exception discipline it cross-references.
//
// Tones reuse the same semantic vocabulary as the rest of the system (neutral/info/success/
// warning/danger/brand) rather than inventing a pill-specific palette.
//
// Known gap: design.md's own tint backgrounds come from Tailwind's `-50`/`-100` shade steps
// (e.g. `bg-emerald-50`), but tokens/ only exposes one value per semantic tone (--color-success,
// not a scale). `color-mix()` approximates a -50-equivalent tint (15% of the tone mixed into
// white) rather than a hand-picked shade — reasonable, but a real tint scale in tokens/ would be
// more faithful if more semantic colours end up needing one.

import { LitElement, html, css } from "lit";

const TONES = new Set(["neutral", "info", "success", "warning", "danger", "brand"]);

/**
 * Communicates state, never an action — design.md's "Status pills" section. Never focusable,
 * never looks pressable. Tones reuse the system's shared semantic vocabulary.
 *
 * @element rfg-status-pill
 * @slot icon - Optional icon (rare — see design.md).
 * @slot - The pill's label.
 */
export class RfgStatusPill extends LitElement {
  static properties = {
    /** Reuses the system's shared semantic tone vocabulary rather than a pill-specific palette. */
    tone: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: inline-flex;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 500;
      line-height: 1rem;
      padding: 0.125rem 0.625rem;
      border-radius: var(--radius-pill);
      white-space: nowrap; /* a wrapped pill centres its icon across two lines */
    }

    .icon-slot {
      display: inline-flex;
    }
    .icon-slot ::slotted(*) {
      width: 0.875em;
      height: 0.875em;
    }

    :host([tone="neutral"]) .pill,
    :host(:not([tone])) .pill {
      background: var(--color-neutral-100);
      color: var(--color-neutral-700);
    }
    /* Neutral-900 text, not the tone colour, for the four semantic tones: info/success/warning/
       danger's tokens are measured to clear WCAG AA 4.5:1 against *pure* white only (danger
       specifically by a 0.01 margin, per tokens/README.md), and any tint — even a light one —
       drops below that. Found by running axe-core against this element, not assumed; the same
       fix flash-message.js needed. The tone still shows in the background tint; neutral/brand
       aren't affected (their tokens have a much larger contrast margin) and keep tone-coloured
       text as before. */
    :host([tone="info"]) .pill {
      background: color-mix(in oklch, var(--color-info) 15%, white);
      color: var(--color-neutral-900);
    }
    :host([tone="success"]) .pill {
      background: color-mix(in oklch, var(--color-success) 15%, white);
      color: var(--color-neutral-900);
    }
    :host([tone="warning"]) .pill {
      background: color-mix(in oklch, var(--color-warning) 15%, white);
      color: var(--color-neutral-900);
    }
    :host([tone="danger"]) .pill {
      background: color-mix(in oklch, var(--color-danger) 15%, white);
      color: var(--color-neutral-900);
    }
    :host([tone="brand"]) .pill {
      background: var(--color-brand-100);
      color: var(--color-brand-700);
    }
  `;

  constructor() {
    super();
    this.tone = "neutral";
  }

  willUpdate(changed) {
    if (changed.has("tone") && !TONES.has(this.tone)) {
      console.warn(`<rfg-status-pill> received unknown tone "${this.tone}"; expected one of ${[...TONES].join(", ")}.`);
    }
  }

  render() {
    return html`
      <span class="pill">
        <span class="icon-slot" aria-hidden="true"><slot name="icon"></slot></span>
        <slot></slot>
      </span>
    `;
  }
}

if (!customElements.get("rfg-status-pill")) {
  customElements.define("rfg-status-pill", RfgStatusPill);
}
