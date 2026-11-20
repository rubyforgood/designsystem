// `<rfg-avatar>` — implements design.md's "Icon tiles and avatars" section, the avatar half: a
// circular initials avatar, kept as its own element from `<rfg-icon-tile>` ("reserve two distinct
// visual vocabularies ... and never let them overlap").
//
// Unlike the icon tile (always decorative, next to a heading that already names it), an avatar is
// sometimes the *only* visible indicator of who it represents (design.md's own example: an
// account-menu trigger that shows initials with the name surfacing only once the panel opens). So
// this carries an accessible name by default — computed from `name` — rather than being
// unconditionally `aria-hidden`; a host embedding it inside a control that already announces the
// person's name can set `aria-hidden="true"` on this element itself to suppress the duplicate.

import { LitElement, html, css } from "lit";

function initialsFor(name) {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Circular initials avatar — design.md's "Icon tiles and avatars" section, the avatar half.
 * Carries an accessible name by default, computed from `name`, since an avatar is sometimes
 * the only visible indicator of who it represents.
 *
 * @element rfg-avatar
 */
export class RfgAvatar extends LitElement {
  static properties = {
    /** The person's full name — used to compute initials and the default accessible name. */
    name: { type: String },
    /** Reuses the shared sm/md size vocabulary. */
    size: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: inline-flex;
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      border-radius: var(--radius-pill);
      background: var(--color-brand-100);
      color: var(--color-brand-700);
      font-family: var(--font-sans);
      font-weight: 600;
      line-height: 1;
    }

    :host([size="md"]) .avatar,
    :host(:not([size])) .avatar {
      width: 2.25rem; /* 36px, matches the icon tile's md */
      height: 2.25rem;
      font-size: 0.8125rem;
    }
    :host([size="sm"]) .avatar {
      width: 1.75rem; /* 28px, matches the icon tile's sm */
      height: 1.75rem;
      font-size: 0.6875rem;
    }
  `;

  constructor() {
    super();
    this.size = "md";
  }

  updated() {
    const el = this.renderRoot.querySelector(".avatar");
    if (!el) return;
    const label = this.getAttribute("aria-label") || this.name;
    if (label && !this.hasAttribute("aria-hidden")) {
      el.setAttribute("aria-label", label);
      el.setAttribute("role", "img");
    } else {
      el.removeAttribute("aria-label");
      el.removeAttribute("role");
    }
  }

  render() {
    return html`<span class="avatar">${initialsFor(this.name)}</span>`;
  }
}

if (!customElements.get("rfg-avatar")) {
  customElements.define("rfg-avatar", RfgAvatar);
}
