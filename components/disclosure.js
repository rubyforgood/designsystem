// `<rfg-disclosure>` — implements design.md's "Disclosures" section: a real, focusable, toggleable
// `<button>` with real ARIA state, never a link with a fragment identifier pretending to
// navigate.
//
// **The trigger's accessible name describes what it controls, never its current action or
// state** — the WAI-ARIA APG disclosure pattern's own naming rule. `aria-expanded` already
// carries open/closed state programmatically, so this element takes a single `label` that stays
// constant across both states ("More filters", not "Show"/"Hide") — there's deliberately no
// separate "open label"/"closed label" API, because that shape would invite exactly the mistake
// design.md calls out.
import { LitElement, html, css } from "lit";

/**
 * A real, focusable, toggleable `<button>` with real ARIA state — design.md's "Disclosures"
 * section. The trigger's accessible name describes what it controls, never its current state.
 *
 * @element rfg-disclosure
 * @slot - The panel content, shown when `open`.
 * @fires rfg-toggle - `{ open }`, dispatched whenever the panel opens or closes.
 */
export class RfgDisclosure extends LitElement {
  static properties = {
    /** The trigger's accessible name — stays constant across both states (e.g. "More filters", not "Show"/"Hide"). */
    label: { type: String },
    /** Whether the panel is currently expanded. */
    open: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: none;
      border: none;
      padding: 0;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-neutral-700);
      cursor: pointer;
    }
    .trigger:hover {
      color: var(--color-neutral-900);
    }
    .trigger:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }

    .chevron {
      transition: transform 0.15s ease;
    }
    :host([open]) .chevron {
      transform: rotate(90deg);
    }

    .panel {
      margin-top: 0.5rem;
    }
    .panel[hidden] {
      display: none;
    }
  `;

  constructor() {
    super();
    this.open = false;
  }

  _toggle() {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent("rfg-toggle", { detail: { open: this.open }, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <button class="trigger" type="button" aria-expanded=${this.open} @click=${this._toggle}>
        <svg class="chevron" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path d="M6 3l5 5-5 5" />
        </svg>
        ${this.label}
      </button>
      <div class="panel" ?hidden=${!this.open}>
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get("rfg-disclosure")) {
  customElements.define("rfg-disclosure", RfgDisclosure);
}
