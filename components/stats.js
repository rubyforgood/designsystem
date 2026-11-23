// `<rfg-stats>` — implements design.md's "Stats" section: a figure/label pair is a description
// list relationship semantically (`<dt>`/`<dd>`), never a generic `<div>` pair or a heading on
// the value (a statistic is data, not a section name — a heading there puts it in the page's
// navigable outline).
//
// A summary band is one reading, not N separate cards: no filled box around each figure, and the
// separators are a `gap-px` grid showing a backdrop through every pair of neighbors — rows as
// well as columns, which `divide-x` alone can't do in a multi-row grid.
import { LitElement, html, css } from "lit";

/**
 * A figure/label pair as a real description list (`<dt>`/`<dd>`) — design.md's "Stats"
 * section — never a generic `<div>` pair or a heading on the value. The summary band reads
 * as one band, not N separate cards.
 *
 * @element rfg-stats
 */
export class RfgStats extends LitElement {
  static properties = {
    /** The band's heading text. */
    heading: { type: String },
    /** Shown below the heading (e.g. the date range the figures cover). */
    subtitle: { type: String },
    /** `[{ label, value }]` — one figure/label pair per entry. */
    figures: { type: Array },
    // Reflected so the stylesheet's `:host([count="n"])` selectors (below) can pick the right
    // column mapping — can't be done as an inline `style`, since the per-count rules need
    // `@media`, which an inline style attribute can't contain at all.
    /** Derived from `figures.length`; reflected only so the stylesheet's `:host([count="n"])` selectors can pick the right column mapping. Not meant to be set directly. */
    count: { type: Number, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .titles {
      margin-bottom: 0.75rem;
    }

    .heading {
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-neutral-900);
      margin: 0;
    }

    .subtitle {
      font-family: var(--font-sans);
      font-size: 0.8125rem;
      color: var(--color-neutral-500);
      margin: 0.125rem 0 0;
    }

    dl {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1px;
      background: var(--color-neutral-200);
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-surface);
      overflow: hidden;
      margin: 0;
    }

    /* Column mapping by figure count — never let one flat responsive class orphan a lone cell at
       a breakpoint it actually ships. design.md's own measured table. */
    @media (min-width: 640px) {
      :host([count="2"]) dl,
      :host([count="4"]) dl,
      :host([count="6"]) dl {
        grid-template-columns: repeat(2, 1fr);
      }
      :host([count="3"]) dl {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (min-width: 1024px) {
      :host([count="4"]) dl {
        grid-template-columns: repeat(4, 1fr);
      }
      :host([count="5"]) dl {
        grid-template-columns: repeat(5, 1fr);
      }
      :host([count="6"]) dl {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .cell {
      background: white;
      padding: 1rem 1.25rem;
    }

    /* A statistic is data, not a heading — no semantic heading tag on the value, regardless of
       how large it renders visually. */
    dd {
      font-family: var(--font-sans);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-neutral-900);
      margin: 0;
    }

    dt {
      font-family: var(--font-sans);
      font-size: 0.8125rem;
      color: var(--color-neutral-500);
      margin: 0.125rem 0 0;
    }
  `;

  constructor() {
    super();
    this.figures = [];
  }

  willUpdate(changed) {
    if (changed.has("figures")) this.count = Math.min(Math.max(this.figures.length, 1), 6);
  }

  render() {
    return html`
      ${this.heading || this.subtitle
        ? html`
            <div class="titles">
              ${this.heading ? html`<p class="heading">${this.heading}</p>` : null}
              ${this.subtitle ? html`<p class="subtitle">${this.subtitle}</p>` : null}
            </div>
          `
        : null}
      <dl>
        ${this.figures.map(
          (f) => html`
            <div class="cell">
              <dd>${f.value}</dd>
              <dt>${f.label}</dt>
            </div>
          `,
        )}
      </dl>
    `;
  }
}

if (!customElements.get("rfg-stats")) {
  customElements.define("rfg-stats", RfgStats);
}
