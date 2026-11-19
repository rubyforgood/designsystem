// `<rfg-page-tabs>` — implements design.md's "Tabs" section, the **page-tabs** half: each tab is
// its own URL. Deliberately *not* the ARIA tablist pattern (see tabs.js for that, panel-tabs) —
// design.md is explicit that using `role="tab"` for something that navigates is an accessibility
// bug, not a style choice, because the tablist pattern promises an in-page panel swap and
// intercepts arrow keys a plain link list wouldn't. This is just a styled `<nav>` of real links;
// the host sets `aria-current="page"` on whichever `<a>` is current, since this element has no
// way to know the current URL itself.
import { LitElement, html, css } from "lit";

export class RfgPageTabs extends LitElement {
  static properties = {
    label: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    /* Fixed height regardless of content — same "the strip does not move" rule tabs.js follows. */
    nav {
      display: flex;
      gap: 1rem;
      border-bottom: 1px solid var(--color-neutral-200);
    }

    ::slotted(a) {
      display: inline-block;
      padding: 0.625rem 0.25rem;
      margin-bottom: -1px;
      border-bottom: 2px solid transparent;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-neutral-500);
      text-decoration: none;
      white-space: nowrap;
    }
    ::slotted(a:hover) {
      color: var(--color-neutral-900);
    }
    ::slotted(a[aria-current="page"]) {
      color: var(--color-brand-700);
      border-bottom-color: var(--color-brand-600);
    }
    ::slotted(a:focus-visible) {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }
  `;

  render() {
    return html`
      <nav aria-label=${this.label || "Page sections"}>
        <slot></slot>
      </nav>
    `;
  }
}

if (!customElements.get("rfg-page-tabs")) {
  customElements.define("rfg-page-tabs", RfgPageTabs);
}
