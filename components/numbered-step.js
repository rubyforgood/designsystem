// `<rfg-numbered-step>` — implements design.md's "Numbered steps" section: a visual step number
// disc beside an ordered-list item is decorative and hidden from assistive tech, because the
// number is already carried by the list's own semantics (`<ol>`) — showing it to AT too would
// announce the position twice.
//
// Deliberately a separate element from `<rfg-avatar>`, even though both are a circular disc with
// short text: design.md keeps the step disc and the initials avatar apart on purpose — visual
// similarity alone isn't reason enough to share one implementation when merging them would need
// a size-and-semantics argument at every call site.
//
// The host wraps instances in a real `<ol>`; this element renders as a flex row (number + content)
// meant to sit inside an `<li>`, not as the `<li>` itself, so the host keeps control of the list
// item's own semantics.
import { LitElement, html, css } from "lit";

/**
 * A visual step number disc beside an ordered-list item — design.md's "Numbered steps"
 * section. Decorative and hidden from assistive tech, since the position is already carried
 * by the list's own `<ol>` semantics. Renders as a flex row meant to sit inside an `<li>`.
 *
 * @element rfg-numbered-step
 * @slot - The step's content.
 */
export class RfgNumberedStep extends LitElement {
  static properties = {
    /** The step number, shown in the disc. */
    number: { type: Number },
  };

  static styles = css`
    :host {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .disc {
      flex: none;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-pill);
      background: var(--color-brand-100);
      color: var(--color-brand-700);
      font-family: var(--font-sans);
      font-size: 0.8125rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .content {
      flex: 1;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      color: var(--color-neutral-900);
      padding-top: 0.25rem;
    }
  `;

  render() {
    return html`
      <span class="disc" aria-hidden="true">${this.number}</span>
      <div class="content"><slot></slot></div>
    `;
  }
}

if (!customElements.get("rfg-numbered-step")) {
  customElements.define("rfg-numbered-step", RfgNumberedStep);
}
