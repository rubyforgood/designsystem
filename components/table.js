// `<rfg-table>` — implements the clearly Portable core of design.md's "Tables" section: a
// scroll-not-squeeze container (WCAG 1.4.10's data-table exemption), top-aligned cells
// (`vertical-align: middle` is invisible until a cell wraps, then every single-line cell in that
// row floats off the baseline), and the three column-type utility classes applied consistently
// instead of re-decided per table.
//
// **Deliberately out of scope**, named rather than silently omitted: frozen/pinned columns, row
// selection + batch action bars, and the scroll rail's own affordances (edge shadows, overflow
// indicators). design.md's own tagging pass already calls the Row actions / Table sections "a
// single, fully-worked case study" rather than something to generalize wholesale — these pieces
// are measured against one app's specific layout (pixel-exact scroll offsets, a dark floating
// bar's `bottom-12`) and aren't a good first candidate to port as-is. This element covers the
// part that *is* a stable, portable rule: the table primitive itself.
//
// The host provides the actual `<table>` markup (caption, thead, tbody) via the default slot —
// this element doesn't dictate column count or structure, only wraps, scrolls, and supplies the
// shared classes a host's own cells opt into.
import { LitElement, html, css } from "lit";

/**
 * The Portable core of design.md's "Tables" section: a scroll-not-squeeze container and
 * top-aligned cells. The host provides the actual `<table>` markup; this element only wraps,
 * scrolls, and supplies shared classes the host's own cells opt into.
 *
 * @element rfg-table
 * @slot - The host's own `<table>` markup (caption, thead, tbody).
 */
export class RfgTable extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .scroll {
      overflow-x: auto;
    }

    ::slotted(table) {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-sans);
      font-size: 0.875rem;
    }

    /* Every cell aligns to the top of its row, not the browser default centre — set table-wide,
       not row by row, since it's invisible until any cell in a row wraps. */
    ::slotted(table) th,
    ::slotted(table) td {
      vertical-align: top;
      padding: 0.625rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--color-neutral-200);
    }

    /* One visual treatment for a numeric column, applied uniformly — no per-cell emphasis. */
    ::slotted(table) .numeric,
    ::slotted(table) .quantity,
    ::slotted(table) .percent {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    ::slotted(table) .date {
      white-space: nowrap;
    }

    /* Free text of unbounded length clips to one line rather than breaking the row's height. */
    ::slotted(table) .notes {
      max-width: 16rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  firstUpdated() {
    const slot = this.renderRoot.querySelector("slot");
    const check = () => {
      const table = slot.assignedElements({ flatten: true })[0];
      if (table && table.tagName === "TABLE" && !table.querySelector("caption")) {
        console.warn(
          "<rfg-table> was given a <table> with no <caption> — every table needs one " +
            "(visually hidden is fine) naming what it lists; this is a WCAG/semantics " +
            "requirement, not a style choice.",
        );
      }
    };
    slot.addEventListener("slotchange", check);
    check();
  }

  render() {
    return html`<div class="scroll"><slot></slot></div>`;
  }
}

if (!customElements.get("rfg-table")) {
  customElements.define("rfg-table", RfgTable);
}
