// `<rfg-tabs>` + `<rfg-tab-panel>` — implements design.md's "Tabs" section, the **panel-tabs**
// half: panels swap in place at the same URL. Full ARIA Tabs pattern (WAI-ARIA APG), not a
// styled set of buttons — `role="tab"` makes a real promise to assistive tech ("activating this
// swaps a panel"), which only a true tablist keeps.
//
// For the other half — **page tabs**, where each tab is its own URL — see page-tabs.js. Using
// this element for URL-backed navigation would be the exact accessibility bug design.md calls
// out: a tablist intercepts arrow keys a normal link list wouldn't, promising an in-page panel
// swap that doesn't happen.
//
// Roving tabindex, automatic activation (arrow keys both move focus and select — the shape Ant
// Design, Material and Carbon's own Tabs components use, per design.md's citation), Home/End to
// jump to the first/last tab.
//
// Renders into **light DOM**, not a shadow root (`createRenderRoot()` returns `this`) — found,
// not assumed: a shadow-rendered tablist's `aria-controls`/`aria-labelledby` pointing at a
// light-DOM `<rfg-tab-panel>` (which must stay in light DOM so its content can be arbitrary host
// markup) failed axe-core's aria-valid-attr-value check, since an ID reference can't reliably
// cross the shadow boundary. Rendering the tabs themselves into light DOM puts both ends of every
// ID reference in one scope. The cost is no style encapsulation; styles are scoped by the
// `.rfg-tabs` wrapper class instead of `:host`.
import { LitElement, html, css } from "lit";

// Plain custom element, not Lit — it has no shadow DOM and no styling of its own, just the ARIA
// role/tabindex a tabpanel needs. Its content is the host's own light-DOM markup, rendered
// in-place; a shadow root here would add an unnecessary boundary for something that isn't
// rendering anything itself.
/**
 * A single panel inside `<rfg-tabs>`. Takes its tab label from a `label` attribute, read by
 * the parent `<rfg-tabs>` to build the tablist.
 *
 * @element rfg-tab-panel
 * @slot - The panel's content, shown when its tab is selected.
 */
export class RfgTabPanel extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "tabpanel");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
  }
}

const STYLES = css`
  .rfg-tabs .tablist {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid var(--color-neutral-200);
  }

  .rfg-tabs .tab {
    appearance: none;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0.625rem 0.25rem;
    margin-bottom: -1px;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-500);
    cursor: pointer;
    white-space: nowrap;
  }
  .rfg-tabs .tab + .tab {
    margin-left: 1rem;
  }
  .rfg-tabs .tab:hover {
    color: var(--color-neutral-900);
  }
  .rfg-tabs .tab[aria-selected="true"] {
    color: var(--color-brand-700);
    border-bottom-color: var(--color-brand-600);
  }
  .rfg-tabs .tab:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }

  .rfg-tabs .panels {
    padding-top: 1rem;
  }
`;

/**
 * Panels swap in place at the same URL, using the full ARIA Tabs pattern — design.md's
 * "Tabs" section, the panel-tabs half. Roving tabindex, automatic activation, Home/End. See
 * `<rfg-page-tabs>` for the URL-backed half.
 *
 * @element rfg-tabs
 * @slot - `<rfg-tab-panel>` children, each with a `label` attribute naming its tab.
 */
export class RfgTabs extends LitElement {
  static properties = {
    /** The accessible name for the tablist. */
    label: { type: String },
    /** @ignore */
    _selected: { state: true },
    /** @ignore */
    _panels: { state: true },
  };

  // Light DOM, not shadow — see the file header comment for why.
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this._selected = 0;
    this._panels = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncPanels();
    this._observer = new MutationObserver(() => this._syncPanels());
    this._observer.observe(this, { childList: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  _syncPanels() {
    // :scope > rfg-tab-panel would also match the <style> tag's siblings fine, but excludes it
    // explicitly by tag name anyway since <style> isn't an rfg-tab-panel.
    this._panels = [...this.querySelectorAll(":scope > rfg-tab-panel")];
    this._applySelection();
  }

  _applySelection() {
    this._panels.forEach((panel, i) => {
      const tabId = `${this._idBase()}-tab-${i}`;
      const panelId = `${this._idBase()}-panel-${i}`;
      panel.id = panelId;
      panel.setAttribute("aria-labelledby", tabId);
      panel.hidden = i !== this._selected;
    });
  }

  _idBase() {
    if (!this._uid) this._uid = Math.random().toString(36).slice(2, 8);
    return `rfg-tabs-${this._uid}`;
  }

  _select(i) {
    this._selected = i;
    this._applySelection();
    this.querySelectorAll(".tab")[i]?.focus();
  }

  _onKeydown(e, i) {
    const last = this._panels.length - 1;
    if (e.key === "ArrowRight") this._select(i === last ? 0 : i + 1);
    else if (e.key === "ArrowLeft") this._select(i === 0 ? last : i - 1);
    else if (e.key === "Home") this._select(0);
    else if (e.key === "End") this._select(last);
    else return;
    e.preventDefault();
  }

  render() {
    return html`
      <style>
        ${STYLES}
      </style>
      <div class="rfg-tabs">
        <div class="tablist" role="tablist" aria-label=${this.label || "Tabs"}>
          ${this._panels.map(
            (panel, i) => html`
              <button
                class="tab"
                role="tab"
                id="${this._idBase()}-tab-${i}"
                aria-controls="${this._idBase()}-panel-${i}"
                aria-selected=${i === this._selected}
                tabindex=${i === this._selected ? "0" : "-1"}
                @click=${() => this._select(i)}
                @keydown=${(e) => this._onKeydown(e, i)}
              >
                ${panel.getAttribute("label")}
              </button>
            `,
          )}
        </div>
        <div class="panels"><slot></slot></div>
      </div>
    `;
  }
}

if (!customElements.get("rfg-tab-panel")) customElements.define("rfg-tab-panel", RfgTabPanel);
if (!customElements.get("rfg-tabs")) customElements.define("rfg-tabs", RfgTabs);
