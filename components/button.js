// `<rfg-button>` — implements design.md's "Buttons" and "Where a button goes" sections
// (variant × size as two independent axes, never decided per-button) and the "inert on arrival"
// accessibility rule from the Accessibility section.
//
// Spec sources, reused rather than re-derived — see design.md:
//   - Buttons (variant/size table)
//   - "Where a button goes" (the link-vs-action-vs-span distinction this component encodes)
//   - Accessibility: "inert on arrival" (a link that costs something to press, when disabled,
//     becomes a focusable, announced `aria-disabled` control with a reason — never a plain
//     `disabled` attribute, which anchors don't support and which would also remove it from the
//     tab order for a native `<button>`, defeating the rule's own point)
//   - Iconography: icon beside a label is decorative; icon-only needs its own accessible name.
//
// Renders into **light DOM**, not a shadow root (`createRenderRoot()` returns `this`), the same
// fix tabs.js/field.js already needed, but found here for three further, more general reasons —
// measured, not assumed, while dogfooding this component on Human Essentials (ADR 14):
//
//   1. A shadow-rendered `<button type="submit">` does not participate in an ancestor <form>'s
//      submission — form participation across a shadow boundary needs `ElementInternals`, which
//      this component doesn't implement. Confirmed with a real Chromium page: a shadow-rendered
//      submit button never fired the ancestor form's submit event; an identical light-DOM button
//      did.
//   2. A tag/attribute-CSS-selector-based progressive-enhancement library never recognizes a
//      custom element as the control it's enhancing. Confirmed against the actual pinned
//      `@rails/ujs@7.0.4` build Human Essentials loads: its confirm-dialog and disable-with
//      guards are wired via `Element.prototype.matches(el, "button[data-confirm]")`-style
//      delegation, which a `<rfg-button>` tag can never match — those guards would silently stop
//      firing on every button moved behind a shadow boundary.
//   3. Capybara's default finders (`click_link`, `click_button`, `have_link`) cannot see into a
//      shadow root at all. Confirmed against this repo's own pinned `capybara`/`cuprite`/`ferrum`
//      versions in an isolated harness: `has_link?` found a plain light-DOM anchor and missed an
//      identical shadow-rendered one.
//
// A naive light-DOM flip isn't enough on its own: Lit's light-DOM render leaves pre-existing
// slotted content as an inert sibling, because `<slot>` only projects inside a real shadow root.
// This follows `<rfg-field>`'s already-established fix instead: capture the host's original
// children once, and re-parent them into the rendered control via a marker element, the same
// "move a pre-existing child into the rendered wrapper" technique `<rfg-field>` uses for its
// `<input>`.
//
// The cost is no style encapsulation (styles are injected once, globally, keyed by element id —
// see `_ensureStylesInjected` below — rather than scoped by `:host`/adopted stylesheets, which
// don't exist outside a shadow root). Unlike `<rfg-tabs>`/`<rfg-field>`, which typically appear a
// handful of times per page, a button can appear dozens of times on one table-heavy page, so this
// injects its stylesheet once per document rather than once per instance.
//
// Known gap, still true in light DOM: ARIA relationship attributes that reference an *id*
// (`aria-labelledby`, `aria-describedby`) still need the id to exist in the same scope as the
// reference — only `aria-label` (a string, not a reference) is proxied onto the internal control
// below. A host that needs `aria-labelledby` should attach its own label element as `aria-label`
// text instead.
import { LitElement, html, css } from "lit";

const VARIANTS = new Set(["primary", "secondary", "danger", "ghost"]);
const SIZES = new Set(["sm", "md"]);

const STYLE_ID = "rfg-button-styles";

const STYLES = css`
  rfg-button {
    display: inline-flex;
  }

  rfg-button .control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    font-family: var(--font-sans);
    font-weight: 500;
    line-height: 1.25rem;
    border-radius: var(--radius-control);
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    box-sizing: border-box;
    /* The host (rfg-button) is inline-flex and sizes to content by default, so this changes
       nothing in the common case — 100% of "exactly as wide as my content" stays that width.
       A caller who wants a full-width button sets a width on the host itself (e.g. a "w-full"
       utility class) and the control follows it, rather than needing its own special case. */
    width: 100%;
  }

  rfg-button .control:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }

  /* Size axis — independent of variant. */
  rfg-button[size="md"] .control,
  rfg-button:not([size]) .control {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  rfg-button[size="sm"] .control {
    padding: 0.25rem 0.625rem;
    font-size: 0.8125rem;
  }

  /* Variant axis — what the action means. */
  rfg-button[variant="primary"] .control,
  rfg-button:not([variant]) .control {
    background: var(--color-brand-600);
    color: white;
  }
  rfg-button[variant="primary"] .control:hover,
  rfg-button:not([variant]) .control:hover {
    background: var(--color-brand-700);
  }

  rfg-button[variant="secondary"] .control {
    background: white;
    color: var(--color-neutral-900);
    border-color: var(--color-neutral-200);
  }
  rfg-button[variant="secondary"] .control:hover {
    background: var(--color-neutral-50);
  }

  rfg-button[variant="danger"] .control {
    background: var(--color-danger);
    color: white;
  }
  rfg-button[variant="danger"] .control:hover {
    filter: brightness(0.92);
  }

  rfg-button[variant="ghost"] .control {
    background: transparent;
    color: var(--color-neutral-700);
  }
  rfg-button[variant="ghost"] .control:hover {
    background: var(--color-neutral-100);
  }

  /* Native "disabled" (button mode only — anchors don't support this attribute). */
  rfg-button .control:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  /* "Inert on arrival" (link mode): aria-disabled, not "disabled" — stays focusable. */
  rfg-button .control[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.55;
  }

  rfg-button .icon-slot {
    display: inline-flex;
  }

  rfg-button .icon-slot > * {
    width: 1em;
    height: 1em;
  }

  rfg-button .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

function ensureStylesInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES.cssText;
  document.head.appendChild(style);
}

// Moves `nodes` to sit, in order, immediately before `marker` — a no-op when they're already
// there, so this doesn't fight focus or re-trigger transitions on every unrelated re-render (the
// same guard `<rfg-field>` uses for its single control node, generalized for a list).
function placeInOrder(nodes, marker) {
  const alreadyPlaced = nodes.every((node, i) => {
    const next = i === nodes.length - 1 ? marker : nodes[i + 1];
    return node.nextSibling === next;
  });
  if (alreadyPlaced) return;
  nodes.forEach((node) => marker.before(node));
}

export class RfgButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    href: { type: String },
    disabled: { type: Boolean, reflect: true },
    reason: { type: String },
    type: { type: String },
  };

  constructor() {
    super();
    this.variant = "primary";
    this.size = "md";
    this.disabled = false;
    this.type = "button";
    this._warnedMissingName = false;
    this._captured = false;
  }

  connectedCallback() {
    super.connectedCallback();
    ensureStylesInjected();
    if (!this._captured) {
      // Captured once, before any render has happened, so this never mistakes Lit's own
      // rendered markup (the control, its icon-slot wrapper, the markers) for original content.
      const original = [...this.childNodes];
      this._iconNodes = original.filter((n) => n.nodeType === 1 && n.getAttribute("slot") === "icon");
      this._labelNodes = original.filter((n) => !this._iconNodes.includes(n));
      this._captured = true;
    }
  }

  willUpdate(changed) {
    if (changed.has("variant") && !VARIANTS.has(this.variant)) {
      console.warn(`<rfg-button> received unknown variant "${this.variant}"; expected one of ${[...VARIANTS].join(", ")}.`);
    }
    if (changed.has("size") && !SIZES.has(this.size)) {
      console.warn(`<rfg-button> received unknown size "${this.size}"; expected one of ${[...SIZES].join(", ")}.`);
    }
  }

  // Proxy `aria-label` from the host onto the internal control, since the host itself has no
  // accessible-name-bearing role — the rendered <a>/<button> is what assistive tech sees. Also
  // re-parents the captured original content into the freshly rendered control — a light-DOM
  // render doesn't move pre-existing children into place the way a shadow <slot> would.
  updated() {
    const control = this.querySelector(".control");
    if (!control) return;

    const iconMarker = control.querySelector(".rfg-button-icon-position");
    const labelMarker = control.querySelector(".rfg-button-label-position");
    if (iconMarker) placeInOrder(this._iconNodes, iconMarker);
    if (labelMarker) placeInOrder(this._labelNodes, labelMarker);

    const hostLabel = this.getAttribute("aria-label");
    if (hostLabel) {
      control.setAttribute("aria-label", hostLabel);
    } else {
      control.removeAttribute("aria-label");
    }

    this._warnIfNoAccessibleName(control);
  }

  _warnIfNoAccessibleName(control) {
    if (this._warnedMissingName) return;
    const hasVisibleText = this.textContent.trim().length > 0;
    const hasLabel = this.hasAttribute("aria-label") || this.hasAttribute("aria-labelledby");
    if (!hasVisibleText && !hasLabel) {
      console.warn(
        "<rfg-button> has no visible text and no aria-label/aria-labelledby — an icon-only " +
          "button needs its own accessible name (design.md's Iconography rule).",
      );
      this._warnedMissingName = true;
    }
  }

  render() {
    const icon = html`<span class="icon-slot" aria-hidden="true"><span class="rfg-button-icon-position"></span></span>`;
    const label = html`<span class="rfg-button-label-position"></span>`;

    if (this.href) {
      if (this.disabled) {
        // "Inert on arrival": focusable, announced via aria-disabled, reason as sr-only text —
        // never a plain `disabled` attribute, which anchors don't support anyway.
        return html`
          <span class="control" role="link" aria-disabled="true" tabindex="0">
            ${icon}${label}
            ${this.reason ? html`<span class="sr-only">${this.reason}</span>` : null}
          </span>
        `;
      }
      return html`<a class="control" href=${this.href}>${icon}${label}</a>`;
    }

    return html`
      <button class="control" type=${this.type} ?disabled=${this.disabled}>${icon}${label}</button>
    `;
  }
}

if (!customElements.get("rfg-button")) {
  customElements.define("rfg-button", RfgButton);
}
