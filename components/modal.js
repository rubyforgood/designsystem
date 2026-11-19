// `<rfg-modal>` — implements design.md's "Modals" section: wraps native `<dialog>` +
// `showModal()` rather than reimplementing focus trapping, Escape handling, background inertness
// and top-layer stacking by hand — all of which `<dialog>` gives correctly for free.
//
// Shadow DOM means the one documented gotcha in design.md (a global CSS reset's `margin: 0`
// defeats `<dialog>`'s own centering `margin: auto`) can't actually happen here — the shadow
// boundary already isolates this element's `<dialog>` from whatever reset the host page runs.
// `margin: auto`/`max-height`/`max-width` are still set explicitly below, as sane defaults, not
// as a restoration of something broken.
//
// Public API mirrors the native element it wraps: `.show()` / `.close()`, not a `open` attribute
// a host is expected to toggle — `showModal()` is what actually gives the top-layer/focus-trap
// behavior, and a plain attribute toggle can't invoke it.
import { LitElement, html, css } from "lit";

export class RfgModal extends LitElement {
  static properties = {
    heading: { type: String },
    _hasFooter: { state: true },
  };

  static styles = css`
    dialog {
      margin: auto;
      max-width: min(32rem, calc(100vw - 2rem));
      max-height: calc(100vh - 2rem);
      padding: 0;
      border: none;
      border-radius: var(--radius-surface);
      box-shadow: var(--shadow-overlay);
      display: none;
      flex-direction: column;
    }
    dialog[open] {
      display: flex;
    }
    dialog::backdrop {
      background: rgb(15 23 42 / 0.5); /* same elevation treatment as the popover's overlay */
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.25rem 1rem;
      flex: none;
    }

    h2 {
      font-family: var(--font-sans);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-neutral-900);
      margin: 0;
    }

    .close {
      flex: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-neutral-500);
      padding: 0.25rem;
      display: inline-flex;
      border-radius: var(--radius-control);
    }
    .close:hover {
      color: var(--color-neutral-900);
      background: var(--color-neutral-100);
    }
    .close:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }

    /* The body scrolls, not the whole dialog, so the header/footer stay put — needs tabindex so
       a scrollable region is keyboard-reachable (WCAG 2.1.1). */
    .body {
      padding: 0 1.25rem 1.25rem;
      overflow: auto;
    }

    .footer {
      padding: 1rem 1.25rem 1.25rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      flex: none;
    }
    .footer.hidden {
      display: none;
    }
  `;

  constructor() {
    super();
    this._hasFooter = false;
  }

  show() {
    this.renderRoot.querySelector("dialog")?.showModal();
  }

  close() {
    this.renderRoot.querySelector("dialog")?.close();
  }

  firstUpdated() {
    const dialog = this.renderRoot.querySelector("dialog");
    // Backdrop click closes it: a click lands on the <dialog> element itself only when it hits
    // the backdrop, never when it hits anything inside (which stops propagation to this element
    // by virtue of hitting a descendant target instead).
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) this.close();
    });
    dialog.addEventListener("close", () => {
      this.dispatchEvent(new CustomEvent("rfg-close", { bubbles: true, composed: true }));
    });
  }

  _onFooterSlotChange(e) {
    this._hasFooter = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    const headingId = "heading";
    return html`
      <dialog aria-labelledby=${this.heading ? headingId : undefined}>
        <div class="header">
          ${this.heading ? html`<h2 id=${headingId}>${this.heading}</h2>` : html`<span></span>`}
          <button class="close" type="button" aria-label="Close" @click=${this.close}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <div class="body" tabindex="0"><slot></slot></div>
        <div class="footer ${this._hasFooter ? "" : "hidden"}">
          <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
        </div>
      </dialog>
    `;
  }
}

if (!customElements.get("rfg-modal")) {
  customElements.define("rfg-modal", RfgModal);
}
