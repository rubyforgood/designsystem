// `<rfg-empty-state>` — implements design.md's "Empty states" section: never bare empty
// collection chrome (a table with headers and nothing else). Distinguishes the actual *cause* of
// emptiness and messages each deliberately — one generic "no results" conflates three situations
// that call for three different next steps.
//
// `kind` doesn't change rendering here beyond documenting intent (there's nothing visually
// different about "nothing exists yet" vs "a filter matched nothing" that this element should
// hardcode) — it exists so a host's own markup states which case it's handling, consistent with
// the three-flavor table design.md documents, and so a future audit can check the right action
// is present for the right kind (a create action for `cold-start`, not for `all-clear`).
import { LitElement, html, css } from "lit";

const KINDS = new Set(["cold-start", "no-results", "all-clear"]);

/**
 * Never a bare empty collection (table headers and nothing else) — design.md's "Empty
 * states" section. Distinguishes the actual *cause* of emptiness, so each case gets its own
 * message and next step.
 *
 * @element rfg-empty-state
 * @slot - An optional action (e.g. a `<rfg-button>`) appropriate to `kind`.
 */
export class RfgEmptyState extends LitElement {
  static properties = {
    /** `cold-start` | `no-results` | `all-clear` — documents intent for the host and future audits; doesn't itself change rendering. */
    kind: { type: String, reflect: true },
    /** The empty state's heading text. */
    heading: { type: String },
    /** The explanatory body text, naming the next step. */
    body: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .empty {
      text-align: center;
      padding: 2.5rem 1.5rem;
      font-family: var(--font-sans);
    }

    .heading {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-neutral-900);
      margin: 0 0 0.375rem;
    }

    .body {
      font-size: 0.875rem;
      color: var(--color-neutral-500);
      margin: 0;
    }

    .action {
      margin-top: 1rem;
    }
  `;

  willUpdate(changed) {
    if (changed.has("kind") && this.kind && !KINDS.has(this.kind)) {
      console.warn(`<rfg-empty-state> received unknown kind "${this.kind}"; expected one of ${[...KINDS].join(", ")}.`);
    }
  }

  render() {
    return html`
      <div class="empty">
        ${this.heading ? html`<p class="heading">${this.heading}</p>` : null}
        ${this.body ? html`<p class="body">${this.body}</p>` : null}
        <div class="action"><slot></slot></div>
      </div>
    `;
  }
}

if (!customElements.get("rfg-empty-state")) {
  customElements.define("rfg-empty-state", RfgEmptyState);
}
