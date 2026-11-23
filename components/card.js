// `<rfg-card>` — implements design.md's "Cards" section: the surface everything sits on (hairline
// border, rounded, a single elevation step), plus the optional title/subtitle/actions header and
// footer slots.
//
// design.md separates "the surface" (`.card-surface`, a bare visual treatment) from "the
// component" (title/subtitle/actions structure) on purpose — something that only needs the look,
// not the structure, shouldn't be forced through a header it doesn't want. This element always
// renders the surface; the header and footer regions render only when there's something to put in
// them (a `heading`/`subtitle` attribute, or actual content in the `actions`/`footer`/default
// slots) — checked via `slotchange`, not assumed from whether the attribute was merely declared.
//
// Judgment call, not literally stated in design.md: the header gets a bottom divider only when
// `padded="false"` (the body meets the card edges, e.g. a table — the divider replaces the visual
// separation padding would otherwise provide). A padded body relies on whitespace alone, matching
// how design.md's own example cards read.

import { LitElement, html, css } from "lit";

/**
 * The surface everything sits on — design.md's "Cards" section: hairline border, rounded,
 * single elevation step — plus an optional title/subtitle/actions header and footer. The
 * header and footer regions render only when there's something to put in them.
 *
 * @element rfg-card
 * @slot - The card body.
 * @slot actions - Header actions, shown beside the title when present.
 * @slot footer - Footer content, shown below the body when present.
 */
export class RfgCard extends LitElement {
  static properties = {
    /** The card's heading text; the header region doesn't render at all without one (or actions/subtitle/footer content). */
    heading: { type: String },
    /** Shown below the heading. */
    subtitle: { type: String },
    /** When false, the body meets the card edges (e.g. a table) instead of relying on whitespace alone. */
    // Defaults to true, so a plain Boolean attribute could never turn it off: an absent attribute
    // keeps the default, and `padded="false"` is "present", so true. Fixed in v0.1.3 with a
    // converter that reads the attribute's value: `padded="false"` turns padding off, and any
    // other value (or `padded` alone) leaves it on. Setting the property still works as before.
    padded: {
      converter: {
        fromAttribute: (value) => value !== "false",
        toAttribute: (value) => (value ? "" : "false"),
      },
    },
    /** @ignore */
    _hasActions: { state: true },
    /** @ignore */
    _hasFooter: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      background: white;
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-surface);
      box-shadow: var(--shadow-surface);
      overflow: hidden;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.25rem 0;
    }

    .header.no-body-padding {
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--color-neutral-200);
    }

    .titles {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .heading {
      font-family: var(--font-sans);
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-neutral-900);
      margin: 0;
    }

    .subtitle {
      font-family: var(--font-sans);
      font-size: 0.8125rem;
      color: var(--color-neutral-500);
      margin: 0;
    }

    .actions {
      flex: none;
    }

    .body {
      padding: 1.25rem;
    }

    .body.unpadded {
      padding: 0;
    }

    .footer {
      padding: 1.25rem;
      border-top: 1px solid var(--color-neutral-200);
    }

    .hidden {
      display: none;
    }
  `;

  constructor() {
    super();
    this.padded = true;
    this._hasActions = false;
    this._hasFooter = false;
  }

  _onSlotChange(slotName, stateKey) {
    const slot = this.renderRoot.querySelector(`slot[name="${slotName}"]`);
    this[stateKey] = !!slot && slot.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    const hasTitleBlock = this.heading || this.subtitle;
    const showHeader = hasTitleBlock || this._hasActions;

    return html`
      ${showHeader
        ? html`
            <div class="header ${!this.padded ? "no-body-padding" : ""}">
              <div class="titles">
                ${this.heading ? html`<p class="heading">${this.heading}</p>` : null}
                ${this.subtitle ? html`<p class="subtitle">${this.subtitle}</p>` : null}
              </div>
              <div class="actions ${this._hasActions ? "" : "hidden"}">
                <slot name="actions" @slotchange=${() => this._onSlotChange("actions", "_hasActions")}></slot>
              </div>
            </div>
          `
        : html`<div class="hidden">
            <slot name="actions" @slotchange=${() => this._onSlotChange("actions", "_hasActions")}></slot>
          </div>`}
      <div class="body ${this.padded ? "" : "unpadded"}"><slot></slot></div>
      <div class="footer ${this._hasFooter ? "" : "hidden"}">
        <slot name="footer" @slotchange=${() => this._onSlotChange("footer", "_hasFooter")}></slot>
      </div>
    `;
  }
}

if (!customElements.get("rfg-card")) {
  customElements.define("rfg-card", RfgCard);
}
