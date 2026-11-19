// `<rfg-error-summary>` — implements design.md's `essentials_error_summary`: sits above the
// form, `role="alert"`, naming every failing field in one place. Deliberately **not** GOV.UK's
// linked-error-summary pattern (each message a link to its field) — design.md borrows the
// pattern's reasoning, not its implementation, because this system's own established rule (no
// underline on block-level links) would turn the links into an unrelated third accent colour.
// The functional benefit (getting to the field) is preserved another way instead: every message
// is also duplicated at its own field via `<rfg-field>`'s `aria-describedby`, so nothing is lost
// by not linking.
//
// The host supplies the message list as plain content (typically a `<ul>` of `<li>` text, no
// anchors) in the default slot; this element only supplies the role=alert wrapper, the heading,
// and the glyph-in-its-own-column layout.
import { LitElement, html, css } from "lit";

export class RfgErrorSummary extends LitElement {
  static properties = {
    heading: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .summary {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 1rem;
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-control);
      font-family: var(--font-sans);
    }

    .icon {
      flex: none;
      color: var(--color-danger);
      margin-top: 0.125rem;
    }

    /* The glyph sits in its own column; heading and list share the next, so the bullets line up
       under the heading's text rather than the icon (design.md: structural, not left-padding
       measured against the icon, which goes stale the moment the type scale moves). */
    .content {
      flex: 1;
    }

    .heading {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-neutral-900);
      margin: 0 0 0.375rem;
    }

    ::slotted(ul) {
      margin: 0;
      padding-left: 1.125rem;
      font-size: 0.875rem;
      color: var(--color-neutral-700);
    }
  `;

  render() {
    return html`
      <div class="summary" role="alert">
        <svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 011 1v4a1 1 0 01-2 0V5a1 1 0 011-1zm0 8.5a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        <div class="content">
          <p class="heading">${this.heading || "There is a problem"}</p>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("rfg-error-summary")) {
  customElements.define("rfg-error-summary", RfgErrorSummary);
}
