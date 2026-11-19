// `<rfg-tag-input>` — implements design.md's "Tag input" section: a free-form list of short
// values. Type a word and press Enter; comma and Tab also commit; Backspace on an empty box
// removes the last chip. Duplicates are refused case-insensitively.
//
// **The native form control remains the actual source of truth and the thing that submits; the
// chip layer only reflects and edits it.** Implemented as a form-associated custom element
// (`static formAssociated = true`, `ElementInternals.setFormValue()`) rather than a light-DOM
// native `<input>` the host has to wire up itself — this is the modern equivalent of "the
// underlying native control is exactly the control it always was," done through the platform's
// own form-participation API instead of a hidden input.
//
// **Not a disguised `<select>`** — design.md's own incident: free-tagging mode that resembled
// select2 got clicked expecting a dropdown to open, and nothing did. This element has no
// select-like chrome (no chevron, no dropdown affordance) at all; it's a text input with chips,
// and looks like one.
import { LitElement, html, css } from "lit";

export class RfgTagInput extends LitElement {
  static formAssociated = true;

  static properties = {
    label: { type: String },
    hint: { type: String },
    values: { type: Array },
    _draft: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    label {
      display: block;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-neutral-900);
      margin-bottom: 0.375rem;
    }

    .hint {
      font-family: var(--font-sans);
      font-size: 0.8125rem;
      color: var(--color-neutral-500);
      margin: 0 0 0.375rem;
    }

    .box {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem;
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-control);
    }
    .box:focus-within {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 1px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: var(--color-brand-50);
      color: var(--color-brand-700);
      border-radius: var(--radius-pill);
      padding: 0.1875rem 0.25rem 0.1875rem 0.625rem;
      font-family: var(--font-sans);
      font-size: 0.8125rem;
    }

    /* 24×24 remove target — WCAG 2.5.8, measured against a real prior incident (9×21). */
    .chip button {
      width: 1.5rem;
      height: 1.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      border-radius: var(--radius-pill);
      padding: 0;
    }
    .chip button:hover {
      background: var(--color-brand-100);
    }
    .chip button:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 1px;
    }

    input {
      flex: 1;
      min-width: 6rem;
      border: none;
      outline: none;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      padding: 0.25rem;
    }
  `;

  constructor() {
    super();
    this.values = [];
    this._draft = "";
    this._internals = this.attachInternals();
  }

  willUpdate(changed) {
    if (changed.has("values")) this._syncFormValue();
  }

  _syncFormValue() {
    // The native fallback this control replaces was a plain text input submitting one
    // comma-separated string — the form value matches exactly that, not a richer structure a
    // plain input could never have produced.
    this._internals.setFormValue(this.values.join(","));
  }

  _commit(raw) {
    const value = raw.trim();
    if (!value) return;
    const exists = this.values.some((v) => v.toLowerCase() === value.toLowerCase());
    if (exists) {
      this._draft = "";
      return;
    }
    this.values = [...this.values, value];
    this._draft = "";
    this.dispatchEvent(new CustomEvent("rfg-change", { detail: { values: this.values }, bubbles: true, composed: true }));
  }

  _removeAt(i) {
    this.values = this.values.filter((_, idx) => idx !== i);
    this.dispatchEvent(new CustomEvent("rfg-change", { detail: { values: this.values }, bubbles: true, composed: true }));
  }

  _onKeydown(e) {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      if (this._draft.trim()) {
        if (e.key !== "Tab") e.preventDefault();
        this._commit(this._draft);
      }
      return;
    }
    if (e.key === "Backspace" && this._draft === "" && this.values.length > 0) {
      this._removeAt(this.values.length - 1);
    }
  }

  render() {
    const id = this.label ? "tag-input" : undefined;
    return html`
      ${this.label ? html`<label for=${id}>${this.label}</label>` : null}
      ${this.hint ? html`<p class="hint" id="tag-input-hint">${this.hint}</p>` : null}
      <div class="box">
        ${this.values.map(
          (v, i) => html`
            <span class="chip">
              ${v}
              <button type="button" aria-label="Remove ${v}" @click=${() => this._removeAt(i)}>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </span>
          `,
        )}
        <input
          id=${id ?? "tag-input"}
          type="text"
          .value=${this._draft}
          aria-describedby=${this.hint ? "tag-input-hint" : undefined}
          @input=${(e) => (this._draft = e.target.value)}
          @keydown=${this._onKeydown}
        />
      </div>
    `;
  }
}

if (!customElements.get("rfg-tag-input")) {
  customElements.define("rfg-tag-input", RfgTagInput);
}
