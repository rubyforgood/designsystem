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
const SIZES = new Set(["sm", "md", "xs"]);

// Attributes the component manages itself as reactive properties — never proxied, since the
// host and the internal control would otherwise fight over them.
const OWN_ATTRS = new Set(["variant", "size", "href", "disabled", "reason", "type"]);

// A plain, generic pass-through: `data-*`, `aria-*` and `role`, whatever they are, forwarded
// verbatim onto the real control. The component deliberately does not know what any of these
// mean — e.g. it has no idea `data-confirm` triggers a confirm dialog, or that rails-ujs matches
// `data-disable-with` via a CSS attribute selector. Baking in that knowledge would make this
// component Rails-shaped; staying dumb keeps it useful to any consumer that needs an attribute to
// reach the real, light-DOM control rather than stop at the custom element's own tag. See ADR 14.
function isProxiedAttr(name) {
  return !OWN_ATTRS.has(name) && (name === "role" || name.startsWith("aria-") || name.startsWith("data-"));
}

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

  /* A fixed, icon-only square — not a third point on the padding-based sm/md scale, which is
     built for variable-width text+icon content and can't land on an exact box size. The box
     dimension is a token, not a hardcoded number: what size an icon-only control "should" be is
     app-specific (e.g. matched to a menu-trigger's own height elsewhere on the page), not a
     portable design-system fact, so this stays a sensible default a consuming app can override,
     the same way --radius-control etc. already are. No separate icon-size override needed: the
     control's own font-size, not the box, drives the existing 1em icon-slot rule above.
     See ADR 14. */
  rfg-button[size="xs"] .control {
    width: var(--rfg-button-xs-size, 1.75rem);
    height: var(--rfg-button-xs-size, 1.75rem);
    padding: 0;
    /* ~4:7 of the box, same ratio as the 1.75rem default's 1rem icon — found by actually
       overriding --rfg-button-xs-size and looking at the result, not assumed: a fixed font-size
       here left the icon visibly stuck at its default size while the box grew around it. */
    font-size: calc(var(--rfg-button-xs-size, 1.75rem) * 0.571);
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

  rfg-button .icon-slot > *:not(.rfg-button-icon-position) {
    width: 1em;
    height: 1em;
  }

  /* These two exist only as insertion-order anchors for placeInOrder (below) — real DOM nodes
     a moved child is positioned "before", never meant to be seen or take up space themselves.
     Measured: left unhidden, this icon-slot one still matched the ":not()"-less version of the
     rule above, forcing the (empty but real) marker to 1em square too and doubling the icon-slot's
     width — a real, measured 20px-per-button growth, not a hypothetical one, found because it
     tipped a 3-button page header onto a second line at this app's own 1200px test viewport. */
  rfg-button .rfg-button-icon-position,
  rfg-button .rfg-button-label-position {
    display: none;
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
// same guard `<rfg-field>` uses for its single control node, generalized for a list). Also drops
// any node that can no longer be placed at all (disconnected, or — found against a real Turbo
// frame update — one that now contains `marker` itself, which throws HierarchyRequestError):
// `_syncContent` re-derives `nodes` from the live tree on every mutation, but the two can still
// observe the DOM in different states for one tick during an external rewrite, and a dropped
// node is recovered on the very next sync rather than crashing the render entirely.
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
 * A button that renders as a real `<button>` or a real `<a>`, never a styled `<div>` —
 * design.md's "Buttons" and "Where a button goes" sections. Renders into light DOM so the
 * control participates in native form submission and is matchable by tag/attribute CSS
 * selectors (rails-ujs, Capybara's default finders).
 *
 * @element rfg-button
 * @slot icon - Decorative icon content, marked with `slot="icon"`; sized and positioned ahead of the label.
 * @slot - The button's label (default slot).
 * @cssprop [--rfg-button-xs-size=1.75rem] - The fixed width/height of `size="xs"`, a compact icon-only control. What this should be is app-specific (e.g. matched to a menu-trigger's own height elsewhere on the page) rather than a portable fact, so it's a token, not a hardcoded number.
 */
export class RfgButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    /** What the action means — not decided per-button. See design.md's Buttons table. */
    variant: { type: String, reflect: true },
    /** What context the button appears in: `sm` inside a table row or dense toolbar, `md` for page/section actions, `xs` for a fixed-size icon-only control (see `--rfg-button-xs-size`). */
    size: { type: String, reflect: true },
    /** Switches the component to link mode: a real `<a>`, for navigation (a GET), never a state-changing action. */
    href: { type: String },
    /** Native `disabled` in button mode. In link mode, renders "inert on arrival" instead — a focusable `aria-disabled` control. */
    disabled: { type: Boolean, reflect: true },
    /** Visually-hidden text explaining why a disabled link is unavailable — only meaningful alongside `href` and `disabled`. */
    reason: { type: String },
    /** The native `type` attribute in button mode (`button`/`submit`/`reset`). Ignored in link mode. */
    type: { type: String },
  };

  constructor() {
    super();
    this.variant = "primary";
    this.size = "md";
    this.disabled = false;
    this.type = "button";
    /** @ignore */
    this._warnedMissingName = false;
    /** @ignore */
    this._iconNodes = [];
    /** @ignore */
    this._labelNodes = [];
  }

  connectedCallback() {
    super.connectedCallback();
    ensureStylesInjected();
    this._syncContent();
    // Not a one-time capture: a host's own direct children can change after this element has
    // already rendered once — a Turbo frame update replacing this element's content in place,
    // rather than disconnecting and recreating it, is a real case this app hit. Re-deriving from
    // whatever the host's current direct children actually are, instead of trusting a stale
    // snapshot, is the same fix `<rfg-tabs>`/`<rfg-field>` already use for their own content.
    //
    // Also watches `attributes` — a Stimulus controller toggling `data-confirm` after first
    // render is exactly the kind of external mutation that needs to reach the real control too
    // (see `isProxiedAttr`/`updated()` below). `attributes: true` with no filter also fires for
    // this component's own `reflect: true` properties (`variant`/`size`/`disabled`) when Lit
    // writes them back as attributes; MutationObserver can't filter by pattern, only by exact
    // name, and the host-supplied `data-*`/`aria-*` names aren't known in advance. The cost is
    // one harmless extra no-op `requestUpdate()` on every such change — it converges immediately
    // since nothing changes on the second pass — rather than a real bug.
    this._observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.type === "childList")) {
        this._syncContent();
      } else {
        this.requestUpdate();
      }
    });
    this._observer.observe(this, { childList: true, attributes: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  _syncContent() {
    // :scope > * would also match the already-rendered .control, so it's excluded by identity,
    // not by selector — the control is a real, specific element this component itself created.
    const original = [...this.childNodes].filter((n) => n !== this._controlEl);
    this._iconNodes = original.filter((n) => n.nodeType === 1 && n.getAttribute("slot") === "icon");
    this._labelNodes = original.filter((n) => !this._iconNodes.includes(n));
    this.requestUpdate();
  }

  willUpdate(changed) {
    if (changed.has("variant") && !VARIANTS.has(this.variant)) {
      console.warn(`<rfg-button> received unknown variant "${this.variant}"; expected one of ${[...VARIANTS].join(", ")}.`);
    }
    if (changed.has("size") && !SIZES.has(this.size)) {
      console.warn(`<rfg-button> received unknown size "${this.size}"; expected one of ${[...SIZES].join(", ")}.`);
    }
  }

  // Proxies `data-*`/`aria-*`/`role` from the host onto the internal control (see
  // `isProxiedAttr`) — the host itself has no accessible-name-bearing role, and a progressive-
  // enhancement library (rails-ujs) or a delegated-listener controller (a confirm dialog, a
  // tooltip) matches against a real element's own attributes, not a custom element's tag. Also
  // re-parents the captured original content into the freshly rendered control — a light-DOM
  // render doesn't move pre-existing children into place the way a shadow <slot> would.
  updated() {
    const control = this.querySelector(".control");
    if (!control) return;
    this._controlEl = control;

    const iconMarker = control.querySelector(".rfg-button-icon-position");
    const labelMarker = control.querySelector(".rfg-button-label-position");
    if (iconMarker) placeInOrder(this._iconNodes, iconMarker);
    if (labelMarker) placeInOrder(this._labelNodes, labelMarker);

    // Moved, not mirrored: an earlier "copy and leave both" version left a stale duplicate on
    // the host, which broke exactly the thing this exists for. A delegated-listener controller
    // (confirm_dialog_controller.js) matches via `closest("[data-confirm]")` from the real click
    // target — the control, since that's the actual visible surface — strips the attribute,
    // replays with `trigger.click()`, then restores it. With a copy left on the host, that
    // replayed click still bubbles past a `data-confirm`-bearing ancestor, `closest()` matches
    // the host instead, and the controller intercepts its own replay a second time — the dialog
    // closes but the form silently never submits. Confirmed with a reproduction of that exact
    // controller's intercept/replay sequence against a real `<rfg-button type="submit">` before
    // this fix, and again after, passing. Moving instead of mirroring means there is never a
    // second copy for a replay to re-match, on this or any later externally-triggered attribute
    // (e.g. a Stimulus controller setting `data-confirm` on the host after first render).
    for (const attr of [...this.attributes]) {
      if (!isProxiedAttr(attr.name)) continue;
      control.setAttribute(attr.name, attr.value);
      this.removeAttribute(attr.name);
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
