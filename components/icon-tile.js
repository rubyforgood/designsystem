// `<rfg-icon-tile>` — implements design.md's "Icon tiles and avatars" section, the tile half.
// Reuses the button size vocabulary (sm/md) rather than inventing a second scale — "reuse the
// same size vocabulary across related components" is the Portable rule this follows.
//
// Deliberately a separate element from `<rfg-avatar>` (icon-tile.js vs avatar.js), not one
// element with a `shape` switch: design.md reserves two distinct visual vocabularies ("a stat or
// status" vs. "a person") and says never let them overlap — giving them separate tags makes that
// impossible to blur by accident at a call site.

import { LitElement, html, css } from "lit";

const TONES = new Set(["brand", "neutral", "info", "success", "warning", "danger"]);
const SIZES = new Set(["sm", "md"]);

export class RfgIconTile extends LitElement {
  static properties = {
    tone: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: inline-flex;
    }

    .tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
    }

    :host([size="md"]) .tile,
    :host(:not([size])) .tile {
      width: 2.25rem; /* 36px */
      height: 2.25rem;
      border-radius: var(--radius-control);
    }
    :host([size="sm"]) .tile {
      width: 1.75rem; /* 28px */
      height: 1.75rem;
      border-radius: 0.5rem;
    }

    ::slotted(*) {
      width: 1.125em;
      height: 1.125em;
    }

    :host([tone="brand"]) .tile,
    :host(:not([tone])) .tile {
      background: var(--color-brand-100);
      color: var(--color-brand-700);
    }
    :host([tone="neutral"]) .tile {
      background: var(--color-neutral-100);
      color: var(--color-neutral-700);
    }
    :host([tone="info"]) .tile {
      background: color-mix(in oklch, var(--color-info) 15%, white);
      color: var(--color-info);
    }
    :host([tone="success"]) .tile {
      background: color-mix(in oklch, var(--color-success) 15%, white);
      color: var(--color-success);
    }
    :host([tone="warning"]) .tile {
      background: color-mix(in oklch, var(--color-warning) 15%, white);
      color: var(--color-warning);
    }
    :host([tone="danger"]) .tile {
      background: color-mix(in oklch, var(--color-danger) 15%, white);
      color: var(--color-danger);
    }
  `;

  constructor() {
    super();
    this.tone = "brand";
    this.size = "md";
  }

  willUpdate(changed) {
    if (changed.has("tone") && !TONES.has(this.tone)) {
      console.warn(`<rfg-icon-tile> received unknown tone "${this.tone}"; expected one of ${[...TONES].join(", ")}.`);
    }
    if (changed.has("size") && !SIZES.has(this.size)) {
      console.warn(`<rfg-icon-tile> received unknown size "${this.size}"; expected one of ${[...SIZES].join(", ")}.`);
    }
  }

  // The tile's icon is decorative chrome, same reasoning as an icon beside a label (design.md's
  // Iconography rule) — the tile never carries meaning on its own that isn't already stated by
  // whatever heading/figure it sits beside.
  render() {
    return html`<span class="tile" aria-hidden="true"><slot></slot></span>`;
  }
}

if (!customElements.get("rfg-icon-tile")) {
  customElements.define("rfg-icon-tile", RfgIconTile);
}
