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
// Known gap, named rather than silently shipped: ARIA relationship attributes that reference an
// *id* (`aria-labelledby`, `aria-describedby`) cannot cross from the host's light-DOM id into this
// element's shadow DOM without the id also existing in the same root — only `aria-label` (a string,
// not a reference) is proxied onto the internal control below. A host that needs
// `aria-labelledby` should attach its own label element as `aria-label` text instead, or this
// needs revisiting with `ElementInternals`/`ariaLabelledByElements` once that has solid cross-browser
// support.

import { LitElement, html, css } from "lit";

const VARIANTS = new Set(["primary", "secondary", "danger", "ghost"]);
const SIZES = new Set(["sm", "md"]);

export class RfgButton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    href: { type: String },
    disabled: { type: Boolean, reflect: true },
    reason: { type: String },
    type: { type: String },
  };

  static styles = css`
    :host {
      display: inline-flex;
    }

    .control {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-family: var(--font-sans);
      font-weight: 500;
      line-height: 1.25rem;
      border-radius: var(--radius-control);
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
    }

    .control:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }

    /* Size axis — independent of variant. */
    :host([size="md"]) .control,
    :host(:not([size])) .control {
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
    }

    :host([size="sm"]) .control {
      padding: 0.25rem 0.625rem;
      font-size: 0.8125rem;
    }

    /* Variant axis — what the action means. */
    :host([variant="primary"]) .control,
    :host(:not([variant])) .control {
      background: var(--color-brand-600);
      color: white;
    }
    :host([variant="primary"]) .control:hover,
    :host(:not([variant])) .control:hover {
      background: var(--color-brand-700);
    }

    :host([variant="secondary"]) .control {
      background: white;
      color: var(--color-neutral-900);
      border-color: var(--color-neutral-200);
    }
    :host([variant="secondary"]) .control:hover {
      background: var(--color-neutral-50);
    }

    :host([variant="danger"]) .control {
      background: var(--color-danger);
      color: white;
    }
    :host([variant="danger"]) .control:hover {
      filter: brightness(0.92);
    }

    :host([variant="ghost"]) .control {
      background: transparent;
      color: var(--color-neutral-700);
    }
    :host([variant="ghost"]) .control:hover {
      background: var(--color-neutral-100);
    }

    /* Native "disabled" (button mode only — anchors don't support this attribute). */
    .control:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    /* "Inert on arrival" (link mode): aria-disabled, not "disabled" — stays focusable. */
    .control[aria-disabled="true"] {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .icon-slot {
      display: inline-flex;
    }

    .icon-slot ::slotted(*) {
      width: 1em;
      height: 1em;
    }

    .sr-only {
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

  constructor() {
    super();
    this.variant = "primary";
    this.size = "md";
    this.disabled = false;
    this.type = "button";
    this._warnedMissingName = false;
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
  // accessible-name-bearing role — the shadow-rendered <a>/<button> is what assistive tech sees.
  updated() {
    const control = this.renderRoot.querySelector(".control");
    if (!control) return;

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
    const icon = html`<span class="icon-slot" aria-hidden="true"><slot name="icon"></slot></span>`;
    const label = html`<slot></slot>`;

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
