// `<rfg-combobox>` — a searchable, single- or multi-select dropdown, replacing the native
// `<select>`/`<select multiple>` it wraps. Human Essentials still depends on jQuery select2 for
// exactly this need in 14 views (storage locations, items, users — see this app's own CLAUDE.md),
// and design.md already names the friction: manual pixel-matching against `.select2-selection`,
// a stylesheet needing `!important` nothing else in the system does.
//
// **Wraps a host-provided `<select>`/`<select multiple>`, the same "wrap, don't reimplement"
// choice `<rfg-field>` already makes.** The real `<select>` stays in the DOM (hidden, not
// removed) as the actual form-submitting control — `<rfg-tag-input>`'s own principle, "the native
// form control stays the actual source of truth," applies here even though the mechanism differs:
// tag-input had no pre-existing native equivalent to lean on and became its own form-associated
// element; a `<select>` already *is* the native equivalent, so wrapping one works with
// `simple_form`'s `f.select`/`options_for_select` unchanged and degrades to something still
// submittable if this component's JS never loads at all. `multiple` on the wrapped `<select>`
// decides single- vs. multi-select mode — the same attribute that already means that natively,
// not a second API this component invents.
//
// **Extends `RfgPopover` (role="listbox")**, but overrides `_syncContent`/`updated`/`render`
// completely rather than inheriting `RfgPopover`'s move-real-content-into-markers mechanism. That
// mechanism exists to preserve *host-provided* markup intact; everything this panel shows (the
// filterable textbox, the option rows) is instead synthesized from the wrapped `<select>`'s own
// `<option>`s and regenerated on every render — there's no real content to lose by letting Lit
// re-render it, unlike `<rfg-popover>`'s general case. Only the real `<select>` itself is never
// recreated, just hidden in place.
//
// **Keyboard focus stays on the textbox throughout — `aria-activedescendant`, not real DOM focus
// moving between options.** This is the WAI-ARIA combobox pattern's own reason for existing: a
// combobox's whole point is typing *while* navigating results, which moving real focus away from
// the input would break. `<rfg-menu>` moves real focus between items instead, correctly for a
// menu — a combobox is a different interaction, not the same pattern reused by coincidence.
import { html, nothing } from "lit";
import { RfgPopover } from "./popover.js";

const STYLE_ID = "rfg-combobox-styles";

// Global, not `static styles` — see `<rfg-popover>`'s own header comment for why (light DOM, no
// shadow root to scope a stylesheet to). Chip/box styling matches `<rfg-tag-input>`'s own
// established classes as closely as this component's different job allows, rather than inventing
// a visually distinct second multi-value control.
const STYLES = `
  rfg-combobox {
    display: block;
  }

  .rfg-combobox-label {
    display: block;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-900);
    margin-bottom: 0.375rem;
  }

  .rfg-combobox-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem;
    border: 1px solid var(--color-neutral-500); /* 3:1+ field edge, WCAG 1.4.11 */
    border-radius: var(--radius-control);
    cursor: text;
  }

  .rfg-combobox-box:focus-within {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 1px;
  }

  .rfg-combobox-chip {
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

  /* 24×24 remove target — WCAG 2.5.8, the same measured minimum rfg-tag-input uses. */
  .rfg-combobox-chip button {
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
  .rfg-combobox-chip button:hover {
    background: var(--color-brand-100);
  }
  .rfg-combobox-chip button:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 1px;
  }

  .rfg-combobox-input {
    flex: 1;
    min-width: 6rem;
    border: none;
    outline: none;
    background: none;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    padding: 0.25rem;
  }

  /* Plain display: none, not the sr-only clip technique -- this control is also aria-hidden
     and tabindex=-1 (see _syncContent), so there's no reason for it to occupy even the usual
     1px by 1px "still reachable by assistive tech" box; the real accessible surface is the
     rendered textbox/listbox. display: none doesn't stop a form control from submitting its
     value, so this costs nothing for the thing this element exists to keep working. */
  .rfg-combobox-select-hidden {
    display: none;
  }

  /* .rfg-popover-panel[role=listbox], not rfg-combobox .rfg-popover-panel -- found live
     integrating this into a real app: RfgPopover.open() portals the panel straight to <body>
     unconditionally the moment it's actually visible, which makes it a sibling of <body>'s
     other children rather than a descendant of <rfg-combobox> at all from that point on. A
     descendant-combinator selector matches the DOM tree as it currently stands, so this rule
     silently stopped applying the instant any combobox opened -- confirmed by checking computed
     styles on a real, open panel (max-height: none, overflow-y: visible, every option rendered
     at once in an unbounded list) rather than assumed from the CSS alone. The panel's own role
     attribute travels with it wherever it's portalled, so an attribute selector on the panel
     itself is what actually matches reliably either way -- the same fix <rfg-menu>'s own
     identical bug needed. No backtick anywhere in this comment, on purpose: this file has hit
     the stray-backtick-inside-a-css-comment-truncates-the-template bug before.
     No min-width here: _reposition() sets a real pixel width directly once portalled, where a
     percentage has nothing meaningful left to resolve against -- a lingering min-width: 100%
     would just re-break the same thing, since min-width wins over an explicit width that's
     smaller than it. */
  .rfg-popover-panel[role="listbox"] {
    /* border-box, not the browser default content-box: _reposition() sets width to exactly
       the trigger's own rendered width (border and padding included), and without this that
       width would only cover this panel's content box, with its own border and padding then
       added on top -- measured 8px wider than the trigger before this was added. */
    box-sizing: border-box;
    max-height: 16rem;
    overflow-y: auto;
    padding: 0.25rem;
  }

  .rfg-combobox-option {
    padding: 0.5rem 0.625rem;
    border-radius: var(--radius-control);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--color-neutral-900);
    cursor: pointer;
  }
  .rfg-combobox-option[data-active="true"] {
    background: var(--color-neutral-100);
  }
  .rfg-combobox-option[aria-selected="true"] {
    font-weight: 600;
  }

  .rfg-combobox-empty {
    padding: 0.5rem 0.625rem;
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    color: var(--color-neutral-500);
  }
`;

function ensureStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES;
  document.head.appendChild(style);
}

/**
 * A searchable, single- or multi-select dropdown wrapping a native `<select>`/`<select
 * multiple>` — the real control stays the thing that submits; this only reflects and edits it.
 * Extends `<rfg-popover role="listbox">` for Escape, outside-click, positioning and the
 * portal-to-body fix.
 *
 * @element rfg-combobox
 * @slot - The `<select>`/`<select multiple>` to wrap — its `multiple` attribute decides the mode.
 * @fires rfg-change - Dispatched whenever the selection changes (also a real `change` event on the wrapped `<select>`).
 */
export class RfgCombobox extends RfgPopover {
  // Not spread from `RfgPopover.properties` — Lit already merges a subclass's own `static
  // properties` with every ancestor's declared properties automatically (confirmed working via
  // `<rfg-menu>`, which declares none of its own and still inherits `label`/`placement` fine).
  // Redeclared here only because its *meaning* differs enough to need its own doc string for
  // this element's own Storybook autodocs page — `RfgPopover`'s says "the panel's accessible
  // name"; this one is a visible field label shown above the box.
  static properties = {
    /** The field's label text, shown above the box. */
    label: { type: String },
  };

  constructor() {
    super();
    this.role = "listbox";
    this._query = "";
    this._activeIndex = -1;
    this._multiple = false;
    this._onInput = this._onInput.bind(this);
    this._onInputKeydown = this._onInputKeydown.bind(this);
    this._onSelectChange = this._onSelectChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    ensureStylesInjected();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._selectObserver?.disconnect();
    this._selectEl?.removeEventListener("change", this._onSelectChange);
  }

  // Overrides `RfgPopover`'s own version completely — see this file's header comment for why.
  // Finds the one real, host-provided `<select>`; everything else this renders is synthesized,
  // not moved.
  _syncContent() {
    const select = this.querySelector("select");
    if (!select) return;
    if (select !== this._selectEl) {
      this._selectEl?.removeEventListener("change", this._onSelectChange);
      this._selectEl = select;
      this._multiple = select.multiple;
      select.classList.add("rfg-combobox-select-hidden");
      select.setAttribute("tabindex", "-1");
      select.setAttribute("aria-hidden", "true");
      this._selectObserver?.disconnect();
      this._selectObserver = new MutationObserver(() => this.requestUpdate());
      this._selectObserver.observe(select, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["selected", "value"],
      });
      // The MutationObserver above only ever catches *attribute* mutations (a `selected`
      // attribute written onto an `<option>`, say) — never a plain `select.value = …`/
      // `.selectedIndex = …` assignment, which is a property write with no attribute mutation
      // to observe at all. That's exactly how jQuery's own `.val(x)` sets a select, and exactly
      // what Human Essentials' barcode scanner does to the item picker this wraps
      // (`$(select).val(itemId).trigger('change')`) — found by reproducing that call directly
      // against a real story, not assumed to work: the wrapped `<select>`'s own `.value` updated
      // correctly, but this element's visible textbox kept showing the native implicit first
      // option, silently stale. A real `change` event is the one signal every one of those paths
      // already fires (natively, for user interaction; explicitly, for jQuery's own — `.trigger`
      // dispatches a real DOM event, not a jQuery-only one), so listening for it directly, rather
      // than trying to infer "the value changed" from DOM mutations, covers every real cause at
      // once rather than enumerating them.
      select.addEventListener("change", this._onSelectChange);
    }
    this.requestUpdate();
  }

  _onSelectChange() {
    this.requestUpdate();
  }

  // Overrides `RfgPopover`'s own version — no real content to move into marker positions; the
  // panel's rows are plain Lit template output, regenerated on every render from the wrapped
  // `<select>`'s current options. Only `this._panelEl`/`this._trigger` need to be captured once,
  // the same caching `RfgPopover` itself relies on for the portal to keep working.
  //
  // `this._trigger` is the *box* (chips + input together), not the bare input — `RfgPopover`'s
  // inherited outside-click detection (`_onDocPointerDown`) checks whether the click path
  // includes `this._trigger`; anchoring it on the input alone meant clicking a chip (a sibling of
  // the input, not a descendant) read as an outside click and closed the panel the moment a user
  // tried to remove one. The input still carries the actual `role="combobox"`/ARIA state — that's
  // a separate concern from what counts as "inside the trigger" for the generic open/close logic.
  updated() {
    this._panelEl ??= this.querySelector(".rfg-popover-panel");
    this._trigger ??= this.querySelector(".rfg-combobox-box");
    const input = this.querySelector(".rfg-combobox-input");
    if (input && !this._wired) {
      this._wired = true;
      input.addEventListener("focus", () => this.open());
    }
  }

  _options() {
    if (!this._selectEl) return [];
    const q = this._query.trim().toLowerCase();
    const all = [...this._selectEl.options];
    return q ? all.filter((o) => o.textContent.toLowerCase().includes(q)) : all;
  }

  _optionId(i) {
    return `${this._panelId()}-option-${i}`;
  }

  _inputId() {
    return `${this._panelId()}-input`;
  }

  _selectedLabel() {
    const selected = this._selectEl?.selectedOptions?.[0];
    return selected ? selected.textContent : "";
  }

  // Falls back to the wrapped `<select>`'s own `aria-label`, not straight to the generic
  // "Options" — found wiring this into a real app's existing `f.input ..., label: false,
  // input_html: {"aria-label": "Item"}` pattern (a visible label suppressed in favor of a
  // specific accessible name, common wherever several of these repeat in one row): without this,
  // every such consumer's real, specific name was silently discarded and replaced with the same
  // generic "Options" on both the textbox and the panel, regardless of what the host actually
  // asked for.
  _selectAriaLabel() {
    return this._selectEl?.getAttribute("aria-label") || "Options";
  }

  // Overrides RfgPopover's own version to also pin the panel's width to the trigger's -- the
  // CSS `min-width: 100%` this panel's own stylesheet carries can only ever mean "100% of
  // whatever the panel's actual containing block is," and that stops being this element's own
  // box the moment the panel portals to `<body>` (a `position: fixed` element with no explicit
  // width resolves a percentage against the viewport, not the box it visually belongs to) --
  // found live, not assumed, after fixing the padding/max-height selector bug right next to this
  // one: the panel still opened at full viewport width, left edge included, because nothing
  // here had ever set a real pixel width to replace what the CSS could no longer express once
  // portalled. Matches `@floating-ui/dom`'s own documented pattern for exactly this (a `size()`
  // middleware doing the equivalent) rather than inventing a different mechanism, since this
  // element already depends on that library for everything else about where the panel goes.
  async _reposition() {
    await super._reposition();
    if (this._panelEl && this._trigger) {
      this._panelEl.style.width = `${this._trigger.getBoundingClientRect().width}px`;
    }
  }

  _onInput(e) {
    this._query = e.target.value;
    this._activeIndex = this._options().length ? 0 : -1;
    this.open();
    this.requestUpdate();
  }

  _onInputKeydown(e) {
    const options = this._options();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!this._open) return this.open();
      this._activeIndex = options.length ? (this._activeIndex + 1) % options.length : -1;
      this.requestUpdate();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!this._open) return this.open();
      this._activeIndex = options.length ? (this._activeIndex - 1 + options.length) % options.length : -1;
      this.requestUpdate();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const active = options[this._activeIndex];
      if (active) this._choose(active);
    } else if (e.key === "Backspace" && !this._query && this._multiple) {
      // Removes the last *selected* chip, not the last option in the list — mirrors
      // `<rfg-tag-input>`'s own Backspace-on-empty-box rule for the same reason: a box full of
      // chips with nothing typed reads as "edit the chips," not "edit the list."
      const selected = [...this._selectEl.selectedOptions];
      const last = selected[selected.length - 1];
      if (last) this._deselect(last);
    }
  }

  _choose(option) {
    if (this._multiple) {
      option.selected = !option.selected;
      this._query = "";
      this._activeIndex = -1;
      this._dispatchChange();
      this.requestUpdate();
      // Stays open — picking one option in a multi-select is rarely the only one wanted.
    } else {
      option.selected = true;
      this._query = "";
      this._dispatchChange();
      this.close();
    }
  }

  _deselect(option) {
    option.selected = false;
    this._dispatchChange();
    this.requestUpdate();
  }

  _dispatchChange() {
    this._selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    this.dispatchEvent(new CustomEvent("rfg-change", { bubbles: true, composed: true }));
  }

  // `?disabled=${this._selectEl?.disabled}` below is the one place this element reads the
  // wrapped `<select>`'s `disabled` property at all — found needed integrating a real app's
  // existing `f.input :item_id, disabled: requested.present? || …` field (an item pre-filled by
  // a partner request, meant to stay locked): a native `disabled` attribute on the synthesized
  // `<input>` is sufficient on its own, since a disabled input cannot receive focus at all (not
  // via a real click, not via this element's own `.focus()` call), and `open()` is only ever
  // reached through that same focus listener — so nothing else needed to change to make a
  // disabled wrapped select behave like a disabled control rather than a fully interactive one
  // that merely doesn't submit.
  render() {
    const options = this._options();
    const activeId = this._activeIndex >= 0 && this._activeIndex < options.length ? this._optionId(this._activeIndex) : undefined;
    const chips = this._multiple
      ? [...(this._selectEl?.selectedOptions ?? [])].map(
          (opt) => html`
            <span class="rfg-combobox-chip">
              ${opt.textContent}
              <button type="button" aria-label="Remove ${opt.textContent}" @click=${() => this._deselect(opt)}>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </span>
          `,
        )
      : null;
    const textValue = this._multiple ? this._query : this._open ? this._query : this._selectedLabel();

    return html`
      <span class="rfg-combobox-select-position"></span>
      ${this.label ? html`<label class="rfg-combobox-label" for=${this._inputId()}>${this.label}</label>` : null}
      <div class="rfg-combobox-box" @click=${() => this.querySelector(".rfg-combobox-input")?.focus()}>
        ${chips}
        <input
          id=${this._inputId()}
          class="rfg-combobox-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded=${this._open}
          aria-controls=${this._panelId()}
          aria-activedescendant=${activeId ?? nothing}
          aria-label=${this.label ? nothing : this._selectAriaLabel()}
          autocomplete="off"
          ?disabled=${this._selectEl?.disabled}
          .value=${textValue}
          @input=${this._onInput}
          @keydown=${this._onInputKeydown}
        />
      </div>
      <div
        class="rfg-popover-panel"
        role="listbox"
        aria-label=${this.label || this._selectAriaLabel()}
        aria-multiselectable=${this._multiple}
        id=${this._panelId()}
        ?hidden=${!this._open}
      >
        ${options.length === 0
          ? html`<div class="rfg-combobox-empty">No matches</div>`
          : options.map(
              (opt, i) => html`
                <div
                  id=${this._optionId(i)}
                  class="rfg-combobox-option"
                  role="option"
                  aria-selected=${opt.selected}
                  data-active=${i === this._activeIndex}
                  @mousedown=${(e) => e.preventDefault()}
                  @click=${() => this._choose(opt)}
                >
                  ${opt.textContent}
                </div>
              `,
            )}
      </div>
    `;
  }
}

if (!customElements.get("rfg-combobox")) {
  customElements.define("rfg-combobox", RfgCombobox);
}
