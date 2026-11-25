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

// Cell-level rules live in a light-DOM stylesheet, not the shadow root's `static styles`. The
// cells belong to the host's slotted <table>, and `::slotted()` only matches the slotted element
// itself: `::slotted(table) td` is invalid and matched nothing, so in v0.1.0 none of these rules
// applied (measured in the built Storybook: a `td.numeric` computed to `text-align: center` and
// `font-variant-numeric: normal`). Injected once per document, the same pattern `<rfg-button>`,
// `<rfg-menu>` and `<rfg-combobox>` use. Scoped by the `rfg-table` element selector, so it only
// touches tables inside one, and stays low-specificity so an app's own table CSS can override it.
const STYLE_ID = "rfg-table-styles";
const CELL_STYLES = css`
  /* Every cell aligns to the top of its row, not the browser default center — set table-wide,
     not row by row, since it's invisible until any cell in a row wraps. */
  rfg-table th,
  rfg-table td {
    vertical-align: top;
    padding: 0.625rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-neutral-200);
  }

  /* One visual treatment for a numeric column, applied uniformly — no per-cell emphasis. */
  rfg-table .numeric,
  rfg-table .quantity,
  rfg-table .percent {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  rfg-table .date {
    white-space: nowrap;
  }

  /* Free text of unbounded length clips to one line rather than breaking the row's height. */
  rfg-table .notes {
    max-width: 16rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

function ensureCellStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CELL_STYLES.cssText;
  document.head.appendChild(style);
}

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
    /* Positioned, so anything absolutely positioned in a cell (a visually hidden header label:
       Tailwind's sr-only is position: absolute) is measured against the table, not the page.
       Without it, such a label escapes the scroll box and widens the page; measured in SkillRx,
       a 390px phone scrolled sideways to 744px. Fixed in v0.1.6. */
    :host {
      display: block;
      position: relative;
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
  `;

  connectedCallback() {
    super.connectedCallback();
    ensureCellStylesInjected();
  }

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
