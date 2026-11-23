// `<rfg-segmented-control>` — a connected row of real `<button>`s that switch between a few
// views without navigating, ported from a real, in-production Human Essentials pattern
// (`/distributions/schedule`'s calendar range/layout switches, `essentials_view_toggle_classes`)
// rather than designed from scratch for this.
//
// That reference implementation already made, and wrote down, the two decisions that matter
// most here, and this component keeps both unchanged:
//
//   - **`role="group"` with real, independently-focusable `aria-pressed` buttons, not
//     `role="radiogroup"` with roving tabindex.** "These toggle a state rather than submit a
//     value" is the reference's own reasoning — a segmented control changes what's shown, a
//     radio group commits a choice for a form to read later. No arrow-key navigation between
//     segments for the same reason: there is nothing here modeled on the WAI-ARIA radio-group
//     pattern to begin with.
//   - **The component dispatches a generic event; it does not own what the choice means.**
//     `<rfg-date-range-picker>`'s own precedent: a `value`/`rfg-change` pair the host turns into
//     whatever it needs — a URL parameter, in the reference implementation's own case, since
//     design.md already settled "state lives in the URL, not localStorage" for page tabs and the
//     same argument applies here (bookmarkable, answers "why does mine look different from
//     yours").
//
// **Renders into light DOM, not a shadow root** — the same `<rfg-button>` fix, for the same
// reason: this owns the full connected-segments visual treatment (shared border, only the outer
// corners rounded, a divider between segments), which means moving real button children into one
// rendered container rather than leaving them to a shadow `<slot>`.
import { LitElement, html, css } from "lit";

const STYLE_ID = "rfg-segmented-control-styles";

const STYLES = css`
  rfg-segmented-control {
    display: inline-flex;
  }

  rfg-segmented-control .rfg-segmented-group {
    display: inline-flex;
    border-radius: var(--radius-control);
    border: 1px solid var(--color-neutral-200);
    overflow: hidden;
  }

  rfg-segmented-control .rfg-segmented-group > button {
    padding: 0.375rem 0.75rem;
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-neutral-700);
    background: none;
    border: none;
    cursor: pointer;
  }

  rfg-segmented-control .rfg-segmented-group > button:not(:first-child) {
    border-left: 1px solid var(--color-neutral-200);
  }

  rfg-segmented-control .rfg-segmented-group > button:hover {
    background: var(--color-neutral-50);
  }

  rfg-segmented-control .rfg-segmented-group > button[aria-pressed="true"] {
    background: var(--color-neutral-100);
    color: var(--color-neutral-900);
  }

  /* z-index so a focus ring on a middle segment isn't clipped by its neighbors' own
     overlapping border/background painting over it. */
  rfg-segmented-control .rfg-segmented-group > button:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -2px;
    z-index: 1;
    position: relative;
  }

  /* Insertion-order anchor for placeInOrder (below) — a real DOM node a moved child is
     positioned "before", never meant to be seen or take up space itself. Same technique
     <rfg-button> uses for its icon/label markers. */
  rfg-segmented-control .rfg-segmented-position {
    display: none;
  }
`;

function ensureStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES.cssText;
  document.head.appendChild(style);
}

// Moves `nodes` to sit, in order, immediately before `marker` — a no-op when already there.
// Identical to `<rfg-button>`'s own `placeInOrder` — copied rather than imported, matching this
// codebase's "each component is a self-contained, standalone-distributable file" rule.
function placeInOrder(nodes, marker) {
  const placeable = nodes.filter((node) => node.isConnected && node !== marker && !node.contains(marker));
  const alreadyPlaced = placeable.every((node, i) => {
    const next = i === placeable.length - 1 ? marker : placeable[i + 1];
    return node.nextSibling === next;
  });
  if (alreadyPlaced) return;
  placeable.forEach((node) => marker.before(node));
}

/**
 * A connected row of real `<button>`s that switch between a few views without navigating —
 * `role="group"` with independently-focusable `aria-pressed` buttons, not a radio group (this
 * toggles a state, it doesn't submit a value). Dispatches `rfg-change`; the host decides what
 * the choice means.
 *
 * @element rfg-segmented-control
 * @slot - The segment buttons — real `<button type="button" value="...">` elements, any count.
 * @fires rfg-change - `{ value }`, dispatched whenever the pressed segment changes.
 */
export class RfgSegmentedControl extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    /** The group's accessible name. */
    label: { type: String },
    /** The currently pressed segment's `value` — defaults to the first segment's if unset. */
    value: { type: String, reflect: true },
  };

  constructor() {
    super();
    /** @ignore */
    this._buttons = [];
    /** @ignore */
    this._wired = new WeakSet();
  }

  connectedCallback() {
    super.connectedCallback();
    ensureStylesInjected();
    this._syncContent();
    // Not a one-time capture — the same real case `<rfg-button>` already hit: a Turbo-equivalent
    // swap can replace this element's content in place rather than recreating it.
    this._observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.type === "childList")) this._syncContent();
    });
    this._observer.observe(this, { childList: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  _syncContent() {
    // Excluded by identity — the group div is a real, specific element this component itself
    // created, not external content. The guard below is against the same self-triggered-resync
    // risk `<rfg-button>` already names (moving a button into the group is itself a childList
    // mutation this same observer watches) — but checked by whether any *button* is left, not
    // by whether `original` is empty at all. A template literal's own whitespace between tags
    // becomes real, un-moved text nodes that are never buttons and never excluded by identity
    // either, so `original` is never actually empty once any markup has whitespace in it at all —
    // checking emptiness here made every post-move resync look like a genuine external change
    // with zero buttons, wiping `_buttons` back to `[]` on the very next mutation.
    const original = [...this.childNodes].filter((n) => n !== this._groupEl);
    const buttons = original.filter((n) => n.nodeType === 1 && n.tagName === "BUTTON");
    if (buttons.length === 0 && this._buttons.length > 0) return;

    this._buttons = buttons;
    if (!this.value && this._buttons[0]) this.value = this._buttons[0].getAttribute("value");
    this.requestUpdate();
  }

  updated() {
    this._groupEl ??= this.querySelector(".rfg-segmented-group");
    if (!this._groupEl) return;

    const marker = this._groupEl.querySelector(".rfg-segmented-position");
    if (marker) placeInOrder(this._buttons, marker);

    for (const button of this._buttons) {
      button.setAttribute("type", "button");
      button.setAttribute("aria-pressed", String(button.getAttribute("value") === this.value));
      if (this._wired.has(button)) continue;
      this._wired.add(button);
      button.addEventListener("click", () => this._select(button.getAttribute("value")));
    }
  }

  _select(value) {
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(new CustomEvent("rfg-change", { detail: { value }, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="rfg-segmented-group" role="group" aria-label=${this.label || "View options"}>
        <span class="rfg-segmented-position"></span>
      </div>
    `;
  }
}

if (!customElements.get("rfg-segmented-control")) {
  customElements.define("rfg-segmented-control", RfgSegmentedControl);
}
