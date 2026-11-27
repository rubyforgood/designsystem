// `<rfg-page-tabs>` — implements design.md's "Tabs" section, the **page-tabs** half: each tab is
// its own URL. Deliberately *not* the ARIA tablist pattern (see tabs.js for that, panel-tabs) —
// design.md is explicit that using `role="tab"` for something that navigates is an accessibility
// bug, not a style choice, because the tablist pattern promises an in-page panel swap and
// intercepts arrow keys a plain link list wouldn't. This is just a styled `<nav>` of real links;
// the host sets `aria-current="page"` on whichever `<a>` is current, since this element has no
// way to know the current URL itself.
import { LitElement, html, css } from "lit";

/**
 * Each tab is its own URL, styled as a `<nav>` of real links, not the ARIA tablist pattern —
 * design.md's "Tabs" section, the page-tabs half. The host sets `aria-current="page"` on
 * whichever link is current. See `<rfg-tabs>` for the panel-tabs half.
 *
 * @element rfg-page-tabs
 * @slot - The tab links (`<a>` elements), with `aria-current="page"` set by the host on the current one.
 */
export class RfgPageTabs extends LitElement {
  static properties = {
    /** The accessible name for the enclosing `<nav>`. */
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

    /* !important on every ::slotted declaration: a page's own stylesheet beats ::slotted, so a
       CSS reset like Tailwind's preflight (* { padding: 0; border: 0 solid }, a { color:
       inherit }) silently erased the tab look in SkillRx. Inside a shadow root, !important wins
       over the page's rules, even the page's own !important, so it's the one way a component keeps
       slotted styling. Restyle through the color tokens. */
    ::slotted(a) {
      display: inline-block !important;
      padding: 0.625rem 0.25rem !important;
      margin-bottom: -1px !important;
      border-bottom: 2px solid transparent !important;
      font-family: var(--font-sans) !important;
      font-size: 0.875rem !important;
      font-weight: 500 !important;
      color: var(--color-neutral-500) !important;
      text-decoration: none !important;
      white-space: nowrap !important;
    }
    ::slotted(a:hover) {
      color: var(--color-neutral-900) !important;
    }
    ::slotted(a[aria-current="page"]) {
      color: var(--color-brand-700) !important;
      border-bottom-color: var(--color-brand-600) !important;
    }
    ::slotted(a:focus-visible) {
      outline: 2px solid var(--color-brand-600) !important;
      outline-offset: 2px !important;
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
