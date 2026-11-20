// `<rfg-filter-bar>` — implements design.md's "Filter bar" section: filters submit as a real GET
// request (a filtered view is a shareable, bookmarkable URL — never client-only state or a POST),
// and a bar whose controls fit on one line shows them; only a bar that doesn't fold. Two is the
// threshold design.md measures and settles on — a disclosure in front of one or two controls is a
// click that buys nothing.
//
// Composes `<rfg-disclosure>` for the folded case (reuse, not a second accordion
// implementation) rather than inventing new fold/toggle behavior.
import { LitElement, html, css } from "lit";
import "./disclosure.js";

/**
 * Filters submit as a real GET request — design.md's "Filter bar" section. A bar whose
 * controls fit on one line shows them; only a bar that doesn't fold composes
 * `<rfg-disclosure>` for the folded case.
 *
 * @element rfg-filter-bar
 * @slot fields - The filter controls, one wrapper element per field.
 * @slot actions - Trailing actions (e.g. an export button).
 */
export class RfgFilterBar extends LitElement {
  static properties = {
    /** The form's `action` attribute, for a real GET submission. */
    action: { type: String },
    /** @ignore */
    _count: { state: true },
    /** @ignore */
    _hasActions: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    form {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: 0.75rem;
      flex: 1;
    }

    ::slotted(*) {
      min-width: 0;
    }

    .actions {
      flex: none;
      display: flex;
      gap: 0.5rem;
    }
    .actions.hidden {
      display: none;
    }
  `;

  constructor() {
    super();
    this.action = "";
    this._count = 0;
    this._hasActions = false;
  }

  _onFieldsSlotChange(e) {
    this._count = e.target.assignedElements({ flatten: true }).length;
  }

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    const fields = html`<slot name="fields" @slotchange=${this._onFieldsSlotChange}></slot>`;
    // Two is the threshold: a bar whose controls fit on one line shows them; a disclosure in
    // front of one or two controls is a click that buys nothing.
    const body = this._count > 2 ? html`<rfg-disclosure label="Filters"><div class="fields">${fields}</div></rfg-disclosure>` : html`<div class="fields">${fields}</div>`;

    return html`
      <form method="get" action=${this.action || undefined}>
        ${body}
        <div class="actions ${this._hasActions ? "" : "hidden"}">
          <slot name="actions" @slotchange=${this._onActionsSlotChange}></slot>
        </div>
      </form>
    `;
  }
}

if (!customElements.get("rfg-filter-bar")) {
  customElements.define("rfg-filter-bar", RfgFilterBar);
}
