// `<rfg-conditional-reveal>` — implements design.md's "conditional reveal" mechanism: a field
// that only applies to one answer in a set is revealed directly below/after the control that
// reveals it (DOM order, so keyboard focus reaches it next), never beside it in a parallel
// column, and carries a visual marker (here, a left rule + indent) tying it to the specific
// option that revealed it — unmarked, it reads as belonging to every option in the group.
//
// **Deliberately does not touch the trigger's own ARIA at all** — design.md's own caution:
// "verify which ARIA state attributes are actually valid for your trigger's specific role before
// applying one uniformly; `aria-expanded` is not allowed on some roles at all." A radio button, a
// checkbox, and a select option each have different valid states, and this element has no
// opinion on which one revealed it — the host wires its own trigger (whatever it is) to this
// element's `shown` property.
//
// **Render the state, don't correct it**: `shown` is read directly on first render, not defaulted
// to hidden-then-corrected after mount — a progressively-enhanced host should set the attribute
// to the real server-computed value from the start, the same render-the-state rule design.md
// applies to the flash-of-hidden case and the table rail.
import { LitElement, html, css } from "lit";

/**
 * Reveals a field that only applies to one answer in a set, directly below/after the control
 * that reveals it — design.md's "conditional reveal" mechanism. Deliberately doesn't touch
 * the trigger's own ARIA at all; the host wires its own trigger to `shown`.
 *
 * @element rfg-conditional-reveal
 * @slot - The revealed content.
 */
export class RfgConditionalReveal extends LitElement {
  static properties = {
    /** Whether the content is revealed. Read directly on first render, not defaulted hidden-then-corrected after mount. */
    shown: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host([shown]) {
      display: block;
      margin-top: 0.75rem;
      padding-left: 0.875rem;
      border-left: 2px solid var(--color-neutral-200);
    }
    :host(:not([shown])) {
      display: none;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get("rfg-conditional-reveal")) {
  customElements.define("rfg-conditional-reveal", RfgConditionalReveal);
}
