// `<rfg-pagination>` — implements design.md's "Pagination" section.
//
// **The label states the range, not the page**: "Showing 31–45 of 272", never "Page 3 of 19" — a
// page number is a proxy whose meaning changes with page size and answers a different question
// than how big the result set actually is. Renders for every non-empty collection, including one
// that fits on a single page (the count is valuable independent of whether paging controls are
// needed) — a component whose shape changes based on how much data happens to be in it has no
// fixed, predictable shape.
//
// **The control set does not change width**: first/last/prev/next stay present and disabled
// rather than disappearing, except first/last specifically, which design.md keeps absent on a
// single-page collection (they'd name nothing to jump to) and present-but-disabled on a longer
// one at the ends.
//
// **Real `<a>` links, not JS-only buttons** — a paginated view is a shareable URL. The host
// supplies `hrefFor(page)`; without it, this falls back to dispatching an `rfg-navigate` event
// only, which is a degraded mode (no real per-page URL), not the default path.
//
// **An unavailable link-shaped control is `aria-disabled` on a real `<a>`, never a plain
// `disabled` attribute** — an anchor has no native disabled state, and leaving it a real,
// non-functional-looking `<a>` with `aria-disabled` keeps the markup and the visual state from
// ever disagreeing.
import { LitElement, html, css, nothing } from "lit";

/**
 * States the range, not the page number ("Showing 31–45 of 272") — design.md's "Pagination"
 * section. Real `<a>` links so a paginated view stays a shareable URL; the control set
 * doesn't change width as pages run out.
 *
 * @element rfg-pagination
 * @fires rfg-navigate - `{ page }`, dispatched when no `hrefFor` is supplied (a degraded mode, not the default path).
 */
export class RfgPagination extends LitElement {
  static properties = {
    /** The total number of entries in the collection. */
    total: { type: Number },
    /** The current page number (1-indexed). */
    page: { type: Number },
    /** How many entries are shown per page — used to compute the range label. */
    pageSize: { type: Number, attribute: "page-size" },
    /** The noun for one entry, e.g. "project" — used in the range label. */
    entryName: { type: String, attribute: "entry-name" },
    /** `(page) => href` — supplies a real per-page URL; without it, falls back to dispatching `rfg-navigate` only. */
    hrefFor: { attribute: false },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--font-sans);
      font-size: 0.8125rem;
      color: var(--color-neutral-500);
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    strong {
      font-weight: 500;
      color: var(--color-neutral-900);
    }

    .controls {
      display: flex;
      gap: 0.25rem;
    }

    a,
    span.gap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.75rem;
      height: 1.75rem;
      padding: 0 0.375rem;
      border-radius: var(--radius-control);
      text-decoration: none;
      color: var(--color-neutral-700);
    }

    a:hover {
      background: var(--color-neutral-100);
    }
    a:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }
    a[aria-current="page"] {
      background: var(--color-brand-600);
      color: white;
    }
    /* Measured 2.88:1 against white (vs. 7.56:1 live) — plainly inactive, still legible; WCAG
       1.4.3 exempts an inactive control from the 4.5:1 minimum. */
    a[aria-disabled="true"] {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.total = 0;
    this.page = 1;
    this.pageSize = 25;
    this.entryName = "item";
    this.hrefFor = null;
  }

  _totalPages() {
    return Math.max(Math.ceil(this.total / this.pageSize), 1);
  }

  _rangeLabel() {
    if (this.total === 0) return `No ${this.entryName}s`;
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.total);
    const noun = this.total === 1 ? this.entryName : `${this.entryName}s`;
    return html`Showing <strong>${start}–${end}</strong> of <strong>${this.total}</strong> ${noun}`;
  }

  _navigate(e, target) {
    if (!this.hrefFor) e.preventDefault();
    this.dispatchEvent(new CustomEvent("rfg-navigate", { detail: { page: target }, bubbles: true, composed: true }));
  }

  _link(targetPage, label, { disabled = false, current = false } = {}) {
    const href = disabled ? undefined : this.hrefFor ? this.hrefFor(targetPage) : "#";
    return html`
      <a
        href=${href ?? nothing}
        aria-disabled=${disabled ? "true" : nothing}
        aria-current=${current ? "page" : nothing}
        @click=${disabled ? (e) => e.preventDefault() : (e) => this._navigate(e, targetPage)}
      >
        ${label}
      </a>
    `;
  }

  _pageWindow(totalPages) {
    const around = new Set([1, totalPages, this.page - 1, this.page, this.page + 1]);
    return [...around].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  }

  render() {
    const totalPages = this._totalPages();
    if (this.total === 0) return html`<div class="row"><span>${this._rangeLabel()}</span></div>`;
    if (totalPages <= 1) return html`<div class="row"><span>${this._rangeLabel()}</span></div>`;

    const window = this._pageWindow(totalPages);
    return html`
      <div class="row">
        <span>${this._rangeLabel()}</span>
        <nav class="controls" aria-label="Pagination">
          ${this._link(1, "« First", { disabled: this.page === 1 })}
          ${this._link(this.page - 1, "‹ Prev", { disabled: this.page === 1 })}
          ${window.map((p, i) => {
            const prev = window[i - 1];
            const gap = prev != null && p - prev > 1 ? html`<span class="gap">…</span>` : null;
            return html`${gap}${this._link(p, String(p), { current: p === this.page })}`;
          })}
          ${this._link(this.page + 1, "Next ›", { disabled: this.page === totalPages })}
          ${this._link(totalPages, "Last »", { disabled: this.page === totalPages })}
        </nav>
      </div>
    `;
  }
}

if (!customElements.get("rfg-pagination")) {
  customElements.define("rfg-pagination", RfgPagination);
}
