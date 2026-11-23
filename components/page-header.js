// `<rfg-page-header>` — implements design.md's "Page header" section. Owns the page's only
// `<h1>`; a host should not also render its own h1 elsewhere on the page.
//
// Shape rule, measured rather than eyeballed in design.md: the back link and title sit as one
// block with an 8px gap; the row uses `items-end` when there's no subtitle (so a 40px action
// button sits on the h1's baseline) and `items-start` when there is one (so the action can't be
// dragged down to the subtitle's baseline instead). That's why the alignment below is derived
// from whether `subtitle` is set, not a separate attribute to keep in sync by hand.

import { LitElement, html, css } from "lit";

/**
 * Owns the page's only `<h1>` — design.md's "Page header" section; the host should not also
 * render its own `<h1>` elsewhere on the page. Alignment is derived from whether `subtitle`
 * is set, rather than kept in sync by hand.
 *
 * @element rfg-page-header
 * @slot actions - Page-level actions, shown beside the title.
 */
export class RfgPageHeader extends LitElement {
  static properties = {
    /** The page's `<h1>` text. */
    heading: { type: String },
    /** When set, aligns the header row with `items-start`; absent, uses `items-end` so an action sits on the heading's own baseline. */
    subtitle: { type: String },
    /** Renders a breadcrumb-style back link above the `<h1>`. */
    backHref: { type: String, attribute: "back-href" },
    /** The back link's text, by convention `Back to <noun>`. */
    backLabel: { type: String, attribute: "back-label" },
    /** @ignore */
    _hasActions: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .row.no-subtitle {
      align-items: flex-end;
    }
    .row.has-subtitle {
      align-items: flex-start;
    }

    .titles {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .back {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      color: var(--color-neutral-500);
      text-decoration: none;
    }
    .back:hover {
      color: var(--color-neutral-700);
    }
    .back:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }

    /* The 8px gap to a preceding back link comes from .titles' \`gap\` alone. Fixed in v0.1.3:
       this also had \`margin-top: 0.5rem\`, which added to the gap and made it 16px. */
    .heading-block {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    h1 {
      font-family: var(--font-sans);
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--color-neutral-900);
      margin: 0;
    }

    .subtitle {
      font-family: var(--font-sans);
      font-size: 0.875rem;
      color: var(--color-neutral-500);
      margin: 0;
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

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    return html`
      <div class="row ${this.subtitle ? "has-subtitle" : "no-subtitle"}">
        <div class="titles">
          ${this.backHref
            ? html`
                <a class="back" href=${this.backHref}>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M10 13L5 8l5-5" />
                  </svg>
                  ${this.backLabel || "Back"}
                </a>
              `
            : null}
          <div class="heading-block">
            <h1>${this.heading}</h1>
            ${this.subtitle ? html`<p class="subtitle">${this.subtitle}</p>` : null}
          </div>
        </div>
        <div class="actions ${this._hasActions ? "" : "hidden"}">
          <slot name="actions" @slotchange=${this._onActionsSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("rfg-page-header")) {
  customElements.define("rfg-page-header", RfgPageHeader);
}
