// `<rfg-date-range-picker>` — implements design.md's "Date range picker" section: one trigger
// showing the current range, a popover with presets on one side and two native
// `<input type="date">` fields on the other. No calendar widget, no third-party dependency —
// composes `<rfg-popover>` (reuse, not reimplementation of positioning/Escape/outside-click).
//
// **Local in the original, made Portable here:** design.md's own implementation computes presets
// server-side and serializes the result into Human Essentials' specific wire format
// (`filters[date_range]`, a `"<start> - <end>"` string parsed by a specific helper). None of that
// belongs in a generic component. This element instead takes `presets` as data (an array the host
// supplies) and dispatches a generic `rfg-change` event with `{ start, end, label }` — the host
// decides how to turn that into its own query params.
//
// Portable behaviors kept: commit-on-selection for presets (a preset is a complete answer, closes
// the popover); the panel stays open while custom dates are edited; a 350ms debounce so setting
// From then To costs one request, not two; silently swapping an inverted range rather than
// blocking with an error.
//
// design.md's documented fix for the From/To fields' `change` bubbling into a wrapping filter
// form's own submit doesn't apply here: while the panel is open, `<rfg-popover>` has moved it to
// <body>, outside any form that wraps this element, so the inputs' `change` events can't reach
// that form's listeners. (An earlier version of this comment credited the shadow boundary; that
// stopped being the reason once the panel moved to <body>.)
import { LitElement, html, css } from "lit";
import "./popover.js";
import "./button.js";

// The panel's styles live in a light-DOM stylesheet, injected once per document, not in
// `static styles`. `<rfg-popover>` moves its panel content to <body> while open (so a sticky or
// overflow-hidden ancestor can't clip it), which takes it out of this element's shadow root and
// out of reach of its styles. Fixed in v0.1.3: v0.1.0–0.1.2 kept these rules in `static styles`,
// so the open panel had none of them (measured: `.panel` was `display: block`, the presets had no
// divider, and the current preset showed the browser's default button gray, not --color-brand-50).
// The same pattern as <rfg-menu>'s panel styles; class names are prefixed `rfg-drp-` so they can't
// collide with the host app's.
const STYLE_ID = "rfg-date-range-picker-styles";
const PANEL_STYLES = css`
  .rfg-drp-panel {
    display: flex;
    gap: 1rem;
    font-family: var(--font-sans);
  }

  .rfg-drp-presets {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 9rem;
    border-right: 1px solid var(--color-neutral-200);
    padding-right: 1rem;
  }

  .rfg-drp-preset {
    appearance: none;
    background: none;
    border: none;
    text-align: left;
    padding: 0.375rem 0.5rem;
    border-radius: var(--radius-control);
    font-size: 0.8125rem;
    color: var(--color-neutral-700);
    cursor: pointer;
  }
  .rfg-drp-preset:hover {
    background: var(--color-neutral-100);
  }
  .rfg-drp-preset[aria-current="true"] {
    background: var(--color-brand-50);
    color: var(--color-brand-700);
    font-weight: 500;
  }
  .rfg-drp-preset:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -2px;
  }

  .rfg-drp-custom {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .rfg-drp-custom label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--color-neutral-500);
  }

  .rfg-drp-custom input {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    padding: 0.375rem 0.5rem;
    border: 1px solid var(--color-neutral-500); /* 3:1+ field edge, WCAG 1.4.11 */
    border-radius: var(--radius-control);
  }
  .rfg-drp-custom input:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }
`;

function ensurePanelStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = PANEL_STYLES.cssText;
  document.head.appendChild(style);
}

/**
 * One trigger showing the current range, a popover of presets and two native date inputs —
 * design.md's "Date range picker" section. No calendar widget; composes `<rfg-popover>`.
 *
 * @element rfg-date-range-picker
 * @fires rfg-change - `{ start, end, label }`, dispatched on commit; the host decides how to turn it into its own query params.
 */
export class RfgDateRangePicker extends LitElement {
  static properties = {
    /** `[{ label, start, end }]` — selecting one commits immediately and closes the popover. */
    presets: { type: Array },
    /** The range start, ISO `YYYY-MM-DD`. */
    start: { type: String },
    /** The range end, ISO `YYYY-MM-DD`. */
    end: { type: String },
    /** @ignore */
    _draftStart: { state: true },
    /** @ignore */
    _draftEnd: { state: true },
  };

  static styles = css`
    :host {
      display: inline-block;
    }
  `;

  constructor() {
    super();
    this.presets = [];
    this.start = "";
    this.end = "";
    this._debounceHandle = null;
  }

  connectedCallback() {
    super.connectedCallback();
    ensurePanelStylesInjected();
  }

  willUpdate(changed) {
    if (changed.has("start") || changed.has("end")) {
      this._draftStart = this.start;
      this._draftEnd = this.end;
    }
  }

  _matchingPreset() {
    return this.presets.find((p) => p.start === this.start && p.end === this.end) || null;
  }

  _triggerLabel() {
    const preset = this._matchingPreset();
    if (preset) return preset.label;
    if (!this.start || !this.end) return "Select a date range";
    return `${this._formatDate(this.start)} – ${this._formatDate(this.end)}`;
  }

  _formatDate(iso) {
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(d);
  }

  _selectPreset(preset) {
    this.start = preset.start;
    this.end = preset.end;
    this._commit(preset.label);
    // A preset is a complete answer — unlike a custom edit, this closes the popover.
    this.renderRoot.querySelector("rfg-popover")?.close({ returnFocus: false });
  }

  _onCustomInput() {
    clearTimeout(this._debounceHandle);
    // 350ms debounce: setting From then To costs one commit, not two.
    this._debounceHandle = setTimeout(() => {
      let [start, end] = [this._draftStart, this._draftEnd];
      // Silently correct an inversion rather than blocking with an error — it has exactly one
      // sensible interpretation.
      if (start && end && start > end) [start, end] = [end, start];
      this.start = start;
      this.end = end;
      this._commit(null);
      // The panel stays open while custom dates are edited.
    }, 350);
  }

  _commit(label) {
    this.dispatchEvent(
      new CustomEvent("rfg-change", {
        detail: { start: this.start, end: this.end, label: label ?? this._matchingPreset()?.label ?? null },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const matching = this._matchingPreset();
    return html`
      <rfg-popover label="Date range">
        <rfg-button slot="trigger" variant="secondary" size="sm">${this._triggerLabel()}</rfg-button>
        <div class="rfg-drp-panel">
          <div class="rfg-drp-presets">
            ${this.presets.map(
              (p) => html`
                <button
                  class="rfg-drp-preset"
                  type="button"
                  aria-current=${p === matching}
                  @click=${() => this._selectPreset(p)}
                >
                  ${p.label}
                </button>
              `,
            )}
          </div>
          <div class="rfg-drp-custom">
            <label>
              From
              <input type="date" .value=${this._draftStart || ""} @input=${(e) => { this._draftStart = e.target.value; this._onCustomInput(); }} />
            </label>
            <label>
              To
              <input type="date" .value=${this._draftEnd || ""} @input=${(e) => { this._draftEnd = e.target.value; this._onCustomInput(); }} />
            </label>
          </div>
        </div>
      </rfg-popover>
    `;
  }
}

if (!customElements.get("rfg-date-range-picker")) {
  customElements.define("rfg-date-range-picker", RfgDateRangePicker);
}
