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
// form's own submit doesn't apply here the way it did originally: these inputs render inside this
// element's own shadow DOM (not slotted from light DOM), and a native `change` event's `composed`
// flag is `false` by default — it already can't cross the shadow boundary to reach a host page's
// form listener. Same shadow-DOM-makes-a-documented-gotcha-moot shape as modal.js's `margin: auto`
// note.
import { LitElement, html, css } from "lit";
import "./popover.js";
import "./button.js";

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

    .panel {
      display: flex;
      gap: 1rem;
      font-family: var(--font-sans);
    }

    .presets {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 9rem;
      border-right: 1px solid var(--color-neutral-200);
      padding-right: 1rem;
    }

    .preset {
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
    .preset:hover {
      background: var(--color-neutral-100);
    }
    .preset[aria-current="true"] {
      background: var(--color-brand-50);
      color: var(--color-brand-700);
      font-weight: 500;
    }
    .preset:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: -2px;
    }

    .custom {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .custom label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--color-neutral-500);
    }

    .custom input {
      font-family: var(--font-sans);
      font-size: 0.875rem;
      padding: 0.375rem 0.5rem;
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-control);
    }
    .custom input:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }
  `;

  constructor() {
    super();
    this.presets = [];
    this.start = "";
    this.end = "";
    this._debounceHandle = null;
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
        <div class="panel">
          <div class="presets">
            ${this.presets.map(
              (p) => html`
                <button
                  class="preset"
                  type="button"
                  aria-current=${p === matching}
                  @click=${() => this._selectPreset(p)}
                >
                  ${p.label}
                </button>
              `,
            )}
          </div>
          <div class="custom">
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
