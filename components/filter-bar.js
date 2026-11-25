// `<rfg-filter-bar>` — implements design.md's "Filter bar" section: filters submit as a real GET
// request (a filtered view is a shareable, bookmarkable URL — never client-only state or a POST),
// and a bar whose controls fit on one line shows them; only a bar that doesn't fold. Two is the
// threshold design.md measures and settles on — a disclosure in front of one or two controls is a
// click that buys nothing.
//
// Composes `<rfg-disclosure>` for the folded case (reuse, not a second accordion
// implementation) rather than inventing new fold/toggle behavior.
import { LitElement, html, css } from "lit";
import "./disclosure.js";

// The form lives in light DOM, not the shadow root. In v0.1.0 this element rendered
// `<form method="get">` inside its shadow root and slotted the controls in from light DOM, but a
// form only owns controls in its own tree: every slotted control's `.form` was `null`, so the bar
// submitted nothing (measured in the built Storybook). Now a hidden, empty `<form>` is appended
// as an unslotted light-DOM child (so it renders nothing), and every control inside the bar is
// pointed at it with the standard `form="<id>"` content attribute — the same mechanism that lets
// a control outside a form submit with it. Enter in a text field and a `type="submit"` button
// in the actions slot both submit it natively, and so does a form-associated custom element.
let formCount = 0;

// Whether a field wrapper holds a filter that's set: a text field with a value, a select whose
// chosen option isn't its first (the first is the "any" or default option), a multi-select with
// anything chosen, or a checked checkbox. Radios are left out: one is always checked.
function isSet(field) {
  return [...field.querySelectorAll("input, select, textarea")].some((c) => {
    if (c.tagName === "SELECT") return c.multiple ? c.selectedOptions.length > 0 : c.selectedIndex > 0;
    if (c.type === "checkbox") return c.checked;
    if (["radio", "hidden", "submit", "button", "reset"].includes(c.type)) return false;
    return c.value.trim() !== "";
  });
}
const CONTROLS = "input, select, textarea, button";

/**
 * Filters submit as a real GET request — design.md's "Filter bar" section. A bar whose
 * controls fit on one line shows them; only a bar that doesn't fold composes
 * `<rfg-disclosure>` for the folded case.
 *
 * @element rfg-filter-bar
 * @slot search - An always-visible field, e.g. a search box, first in the row. Never folds.
 * @slot fields - The filter controls, one wrapper element per field.
 * @slot actions - Trailing actions (e.g. an export button, or a `type="submit"` button).
 */
export class RfgFilterBar extends LitElement {
  static properties = {
    /** The form's `action` attribute, for a real GET submission. */
    action: { type: String },
    /** Start with the folded filters open. Without it, they start open when any field is already set. */
    open: { type: Boolean },
    /** @ignore */
    _count: { state: true },
    /** @ignore */
    _hasActions: { state: true },
    /** @ignore */
    _hasSearch: { state: true },
    /** @ignore */
    _filtered: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    /* One row: the search field (if any), the folded "Filters" trigger or the inline fields, then
       the actions. Bottoms align, so labels above controls don't push anything off the line. */
    .bar {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .search {
      display: block;
      flex: 0 1 20rem;
      min-width: 12rem;
    }
    .search.hidden {
      display: none;
    }

    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
      gap: 0.75rem 1rem;
      flex: 1 1 auto;
    }

    /* Folded: the disclosure's trigger sits in the row, 40px tall like the controls beside it, and
       its panel breaks onto its own full-width line below the row. Before v0.1.5 the disclosure was
       one shrink-to-fit block, so the trigger sat 10px below the controls' centers and the fields
       stacked in a single column inside it. */
    rfg-disclosure {
      display: contents;
    }
    rfg-disclosure::part(trigger) {
      min-height: 2.5rem;
      padding: 0 0.25rem;
    }
    rfg-disclosure::part(panel) {
      flex-basis: 100%;
      order: 1;
      margin-top: 0;
    }

    ::slotted(*) {
      min-width: 0;
    }

    .actions {
      flex: none;
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }
    .actions.hidden {
      display: none;
    }
  `;

  constructor() {
    super();
    this.action = "";
    this._count = 0;
    this._hasActions = false;
    this._hasSearch = false;
    this._filtered = false;
    this.open = false;
    this._form = document.createElement("form");
    this._form.method = "get";
    this._form.id = `rfg-filter-bar-form-${++formCount}`;
    this._form.hidden = true;
    this._observer = new MutationObserver(() => this._associateControls());
  }

  /** The light-DOM `<form>` the bar's controls submit with — e.g. `bar.form.requestSubmit()` to submit on change. */
  get form() {
    return this._form;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._form.parentNode !== this) this.appendChild(this._form);
    this._associateControls();
    this._observer.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
  }

  updated(changed) {
    if (changed.has("action")) {
      if (this.action) this._form.setAttribute("action", this.action);
      else this._form.removeAttribute("action");
    }
  }

  // Points every control in the bar at the light-DOM form. A control that already names a form
  // keeps its own; custom elements count only when they're form-associated. If the app has
  // wrapped the whole bar in its own <form> (the v0.1.0 workaround), its controls already belong
  // to that form, so leave them there.
  _associateControls() {
    if (this.parentElement?.closest("form")) return;
    const candidates = [...this.querySelectorAll("*")].filter(
      (el) => el.matches(CONTROLS) || el.constructor.formAssociated === true,
    );
    for (const el of candidates) {
      if (!el.hasAttribute("form")) el.setAttribute("form", this._form.id);
    }
    // A custom element that isn't defined yet can't say whether it's form-associated (scripts can
    // load in any order), so look again once it is.
    for (const el of this.querySelectorAll(":not(:defined)")) {
      customElements.whenDefined(el.localName).then(() => this._associateControls());
    }
  }

  _onFieldsSlotChange(e) {
    const fields = e.target.assignedElements({ flatten: true });
    this._count = fields.length;
    this._filtered = fields.some((f) => isSet(f));
  }

  _onSearchSlotChange(e) {
    this._hasSearch = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    const fields = html`<slot name="fields" @slotchange=${this._onFieldsSlotChange}></slot>`;
    // Two is the threshold: a bar whose controls fit on one line shows them; a disclosure in
    // front of one or two controls is a click that buys nothing.
    // Folded filters start open when one of them is already set (or the host says `open`), so a
    // filtered list never looks like the whole list. A property binding, so it's applied when the
    // state is found and not re-applied after someone closes the panel.
    const startOpen = this.open || this._filtered;
    const body = this._count > 2
      ? html`<rfg-disclosure label="Filters" .open=${startOpen}><div class="fields">${fields}</div></rfg-disclosure>`
      : html`<div class="fields">${fields}</div>`;

    return html`
      <div class="bar">
        <div class="search ${this._hasSearch ? "" : "hidden"}"><slot name="search" @slotchange=${this._onSearchSlotChange}></slot></div>
        ${body}
        <div class="actions ${this._hasActions ? "" : "hidden"}">
          <slot name="actions" @slotchange=${this._onActionsSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("rfg-filter-bar")) {
  customElements.define("rfg-filter-bar", RfgFilterBar);
}
