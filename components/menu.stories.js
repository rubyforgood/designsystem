import { html } from "lit";
import "./menu.js";
import "./button.js";

export default {
  title: "Components/Menu",
  component: "rfg-menu",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A kebab/overflow menu following the WAI-ARIA menu-button pattern — design.md's Row " +
          "actions section. Composes `<rfg-popover role=\"menu\">` for positioning, Escape, " +
          "outside-click and the portal-to-body fix (a `position: sticky` actions column can't " +
          "trap this panel inside its own stacking context); adds arrow-key navigation (Up/Down/" +
          "Home/End) and closes on selecting an item. Items are plain light-DOM elements — real " +
          "`<a role=\"menuitem\">`/`<button role=\"menuitem\">`/a disabled `<span role=\"menuitem\" " +
          "aria-disabled=\"true\">` — not a declarative sub-component, the same \"portable " +
          "wrapper, local markup\" split `<rfg-table>` already uses.",
      },
    },
  },
  render: () => html`
    <rfg-menu label="Actions for Acme Food Bank">
      <rfg-button slot="trigger" variant="ghost" size="xs" aria-label="Actions for Acme Food Bank">⋮</rfg-button>
      <a role="menuitem" href="#edit" style=${ITEM_STYLE}>Edit</a>
      <a role="menuitem" href="#recertify" style=${ITEM_STYLE}>Request recertification</a>
      <button role="menuitem" type="button" style=${ITEM_STYLE} @click=${() => {}}>
        Deactivate
      </button>
      <button role="menuitem" type="button" style=${DANGER_ITEM_STYLE}>Delete</button>
    </rfg-menu>
  `,
};

const ITEM_STYLE =
  "display: flex; width: 100%; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; " +
  "text-align: left; font-family: var(--font-sans); font-size: 0.875rem; text-decoration: none; " +
  "color: var(--color-neutral-700); background: none; border: none; cursor: pointer; box-sizing: border-box;";

const DANGER_ITEM_STYLE = ITEM_STYLE + "color: var(--color-neutral-700);";

export const Default = {};

export const WithADisabledItem = {
  name: "A disabled form action and a disabled link, each with a visible reason",
  render: () => html`
    <rfg-menu label="Actions for a kit still allocated to a storage location">
      <rfg-button slot="trigger" variant="ghost" size="xs" aria-label="Actions for this kit">⋮</rfg-button>
      <a role="menuitem" href="#edit" style=${ITEM_STYLE}>Edit</a>
      <button role="menuitem" type="button" disabled style=${ITEM_STYLE + "opacity: 0.6; cursor: not-allowed;"}>
        Deactivate
        <span style="display: block; font-size: 0.75rem; font-weight: 400;">
          Unavailable while a storage location still has kits
        </span>
      </button>
      <span
        role="menuitem"
        aria-disabled="true"
        tabindex="0"
        style=${ITEM_STYLE + "opacity: 0.6; cursor: not-allowed;"}
      >
        Delete
        <span style="display: block; font-size: 0.75rem; font-weight: 400;">
          Unavailable while in use
        </span>
      </span>
    </rfg-menu>
  `,
};

export const NearTheRightEdge = {
  name: "Near the right edge (flip/shift), inside a frozen column",
  render: () => html`
    <div
      style="display: flex; justify-content: flex-end; padding-right: 1rem; position: sticky; right: 0; z-index: 20;"
    >
      <rfg-menu label="Actions for row" placement="bottom-end">
        <rfg-button slot="trigger" variant="ghost" size="xs" aria-label="Actions for row">⋮</rfg-button>
        <a role="menuitem" href="#view" style=${ITEM_STYLE}>View</a>
        <a role="menuitem" href="#edit" style=${ITEM_STYLE}>Edit</a>
        <button role="menuitem" type="button" style=${DANGER_ITEM_STYLE}>Delete</button>
      </rfg-menu>
    </div>
  `,
};
