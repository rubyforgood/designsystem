// `<rfg-field>` — implements design.md's "Forms: required fields and validation errors" section
// (one of the densest, most consistently-portable sections in the document — form validation UX
// barely varies by framework).
//
// Wraps a host-provided native control (an `<input>`, `<select>`, `<textarea>` — anything), not a
// reimplemented one: the spec's job here is the label/required-marker/error conventions *around*
// a control, not the control itself. The control gets an id (generated if it doesn't have one)
// and `aria-required`/`aria-invalid`/`aria-describedby` proxied onto it — the same pattern
// `<rfg-button>` uses for `aria-label`.
//
// Renders into **light DOM**, not a shadow root (same fix tabs.js needed, for the same reason):
// a shadow-rendered `<label for="...">` cannot label a light-DOM `<input id="...">` — axe-core's
// `label`/`select-name` checks failed on every field in a first version that used a shadow root
// and a `<slot>`. Both ends of the label/control association need to be in one scope.
import { LitElement, html, css } from "lit";

const STYLES = css`
  .rfg-field label {
    display: block;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-900);
    margin-bottom: 0.375rem;
  }

  /* A semantic abbr[title] carries its own browser default styling that can fight your own —
     style by this class, never by the literal text content (which also breaks on l10n). */
  .rfg-field .required-marker {
    color: var(--color-danger);
    text-decoration: none;
    margin-left: 0.125rem;
  }

  .rfg-field .optional-marker {
    color: var(--color-neutral-500);
    font-weight: 400;
    margin-left: 0.25rem;
  }

  .rfg-field > input,
  .rfg-field > select,
  .rfg-field > textarea {
    width: 100%;
    box-sizing: border-box;
  }

  .rfg-field .error {
    display: flex;
    align-items: flex-start;
    gap: 0.375rem;
    margin-top: 0.375rem;
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    /* Error text is neutral-700, not the danger color — only the glyph is rose-600/danger.
       "the glyph signals and the sentence reads" (design.md). Same reasoning as the status
       pill / flash message contrast fix: the danger token is only measured safe as a glyph
       color or against pure white, not assumed safe for every use. */
    color: var(--color-neutral-700);
  }

  .rfg-field .error svg {
    flex: none;
    margin-top: 0.125rem;
    color: var(--color-danger);
  }
`;

/**
 * Wraps a host-provided native control with the label/required-marker/error conventions
 * around it — design.md's "Forms: required fields and validation errors" section. Renders
 * into light DOM so a `<label for>` can reach a light-DOM `<input id>`.
 *
 * @element rfg-field
 * @slot - The native control to wrap (an `<input>`, `<select>`, `<textarea>` — anything).
 */
export class RfgField extends LitElement {
  static properties = {
    /** The field's label text. */
    label: { type: String },
    /** Adds the required marker and `aria-required` on the wrapped control. */
    required: { type: Boolean },
    /** Marks the field optional instead, for forms where most fields are required. */
    optional: { type: Boolean },
    /** Validation error text, associated to the control via `aria-describedby`/`aria-invalid`. */
    error: { type: String },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.required = false;
    this.optional = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncControl();
    this._observer = new MutationObserver(() => this._syncControl());
    this._observer.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  _syncControl() {
    // Not `:scope > input` — after the first render, `updated()` below moves the control from
    // being this element's own direct child into the rendered `.rfg-field` div (so it lands
    // between the label and the error message visually), one level deeper. A direct-child-only
    // query stopped finding it after that move, which is what broke the label/control
    // association on every render past the first — found empirically, by actually watching the
    // mutation sequence, not assumed from reading the code.
    const found = this.querySelector("input, select, textarea");
    if (!found || found === this._control) return;
    this._control = found;
    if (!this._control.id) this._control.id = this._idBase();
    this._applyToControl();
    this.requestUpdate();
  }

  updated(changed) {
    if (changed.has("required") || changed.has("error")) this._applyToControl();
    // Rendering into light DOM means a pre-existing child (the control, present before this
    // element's first render) isn't reordered by the template the way a shadow <slot> would
    // project it — it stays wherever it originally was, which left it after the whole rendered
    // card instead of between the label and the error message. Move it to the marker explicitly;
    // a no-op if it's already there, so this doesn't fight focus on every re-render.
    const marker = this.querySelector(".rfg-field-control-position");
    if (this._control && marker && this._control.nextSibling !== marker) {
      marker.before(this._control);
    }
  }

  _applyToControl() {
    const control = this._control;
    if (!control) return;
    if (this.required) control.setAttribute("aria-required", "true");
    else control.removeAttribute("aria-required");

    if (this.error) {
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", this._errorId());
    } else {
      control.removeAttribute("aria-invalid");
      control.removeAttribute("aria-describedby");
    }
  }

  _idBase() {
    if (!this._uid) this._uid = Math.random().toString(36).slice(2, 8);
    return `rfg-field-${this._uid}`;
  }

  _errorId() {
    return `${this._idBase()}-error`;
  }

  render() {
    return html`
      <style>
        ${STYLES}
      </style>
      <div class="rfg-field">
        ${this.label
          ? html`
              <label for=${this._control?.id || ""}>
                ${this.label}
                ${this.required ? html`<abbr class="required-marker" title="required">*</abbr>` : null}
                ${this.optional ? html`<span class="optional-marker">(optional)</span>` : null}
              </label>
            `
          : null}
        <span class="rfg-field-control-position"></span>
        ${this.error
          ? html`
              <p class="error" id=${this._errorId()}>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 011 1v4a1 1 0 01-2 0V5a1 1 0 011-1zm0 8.5a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                ${this.error}
              </p>
            `
          : null}
      </div>
    `;
  }
}

if (!customElements.get("rfg-field")) {
  customElements.define("rfg-field", RfgField);
}
