// `<rfg-breadcrumbs>` — implements design.md's breadcrumb rule from "Conditional reveal":
// follows the real standard where one exists (the W3C ARIA APG breadcrumb pattern) rather than
// inventing a shape — an ordered list, because order carries hierarchy; ancestor links; the
// current page as plain text with `aria-current="page"`, not a link to itself. Visual variation
// (separator, spacing) is decoration on top of that standard shape, not the part that matters.
//
// The host supplies items as data (`[{ label, href? }]`) — the last entry with no `href`, or
// simply the last entry regardless, renders as the current page. Rather than infer "current" from
// array position implicitly, the href's presence is the signal: an entry with no `href` is the
// current page, any entry with one is an ancestor link. This also means a host can't accidentally
// render the current page as a link to itself.
import { LitElement, html, css } from "lit";

/**
 * Breadcrumb trail following the W3C ARIA APG breadcrumb pattern — design.md's breadcrumb
 * rule under "Conditional reveal". An ordered list because order carries hierarchy: ancestor
 * links, and the current page as plain text carrying `aria-current="page"`.
 *
 * @element rfg-breadcrumbs
 */
export class RfgBreadcrumbs extends LitElement {
  static properties = {
    /** `[{ label, href? }]` — an entry with no `href` is the current page. */
    items: { type: Array },
    /** The accessible name for the enclosing `<nav>`. */
    label: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    ol {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin: 0;
      padding: 0;
      list-style: none;
      font-family: var(--font-sans);
      font-size: 0.8125rem;
    }

    li {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    li:not(:first-child)::before {
      content: "";
      display: inline-block;
      width: 0.875em;
      height: 0.875em;
      background: currentColor;
      opacity: 0.35;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M6 3l5 5-5 5' fill='none' stroke='black' stroke-width='1.75'/%3E%3C/svg%3E") center / contain no-repeat;
    }

    a {
      color: var(--color-neutral-500);
      text-decoration: none;
    }
    a:hover {
      color: var(--color-neutral-900);
      text-decoration: underline;
    }
    a:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }

    .current {
      color: var(--color-neutral-900);
      font-weight: 500;
    }
  `;

  constructor() {
    super();
    this.items = [];
  }

  render() {
    return html`
      <nav aria-label=${this.label || "Breadcrumb"}>
        <ol>
          ${this.items.map(
            (item) => html`
              <li>
                ${item.href
                  ? html`<a href=${item.href}>${item.label}</a>`
                  : html`<span class="current" aria-current="page">${item.label}</span>`}
              </li>
            `,
          )}
        </ol>
      </nav>
    `;
  }
}

if (!customElements.get("rfg-breadcrumbs")) {
  customElements.define("rfg-breadcrumbs", RfgBreadcrumbs);
}
