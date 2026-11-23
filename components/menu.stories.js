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
        component: [
          "A menu shows a short list of actions behind one trigger button, such as the ⋮ button at the end of a table row. It keeps a row tidy when there are several actions, or when which actions apply can change from row to row.",
          "",
          "**When to use**",
          "- For the actions on one record, such as Edit, Archive and Delete project.",
          "- When the set of actions can vary, even if only one or two show at a time.",
          "",
          "**When not to use**",
          "- For one or two fixed actions, show them as Buttons.",
          "- To pick a value for a form field, use Combobox.",
          "- For extra content that isn't a list of actions, use Popover.",
          "",
          "**Accessibility**",
          "- Follows the WAI-ARIA menu button pattern. The trigger gets `aria-haspopup=\"menu\"` and `aria-expanded`.",
          "- Down Arrow or Up Arrow on the trigger opens the menu on the first or last item. Inside the menu, Up Arrow, Down Arrow, Home and End move between items. Escape closes it and returns focus to the trigger. Choosing an item closes the menu.",
          "- Disabled items stay reachable by keyboard so people can read why they're unavailable. Choosing one does nothing.",
          "- You provide the items as real `<a role=\"menuitem\">` or `<button role=\"menuitem\">` elements. For a disabled link, use `<span role=\"menuitem\" aria-disabled=\"true\" tabindex=\"0\">`.",
          "- Give the menu a `label` and an icon-only trigger an `aria-label`, such as \"Actions for Website redesign\".",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#row-actions)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-menu label="Actions for Website redesign">
      <rfg-button slot="trigger" variant="ghost" size="xs" aria-label="Actions for Website redesign">⋮</rfg-button>
      <a role="menuitem" href="#edit" style=${ITEM_STYLE}>Edit</a>
      <a role="menuitem" href="#share" style=${ITEM_STYLE}>Share</a>
      <button role="menuitem" type="button" style=${ITEM_STYLE} @click=${() => {}}>
        Archive
      </button>
      <button role="menuitem" type="button" style=${DANGER_ITEM_STYLE}>Delete project</button>
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
  name: "Disabled items with a reason",
  parameters: {
    docs: {
      description: {
        story:
          "A disabled button and a disabled link, each with a visible reason. Both stay reachable by keyboard.",
      },
    },
  },
  render: () => html`
    <rfg-menu label="Actions for Annual report">
      <rfg-button slot="trigger" variant="ghost" size="xs" aria-label="Actions for Annual report">⋮</rfg-button>
      <a role="menuitem" href="#edit" style=${ITEM_STYLE}>Edit</a>
      <button role="menuitem" type="button" disabled style=${ITEM_STYLE + "opacity: 0.6; cursor: not-allowed;"}>
        Archive
        <span style="display: block; font-size: 0.75rem; font-weight: 400;">
          Can't archive a project with open tasks
        </span>
      </button>
      <span
        role="menuitem"
        aria-disabled="true"
        tabindex="0"
        style=${ITEM_STYLE + "opacity: 0.6; cursor: not-allowed;"}
      >
        Delete project
        <span style="display: block; font-size: 0.75rem; font-weight: 400;">
          Only the project owner can delete it
        </span>
      </span>
    </rfg-menu>
  `,
};

export const NearTheRightEdge = {
  name: "Near the viewport edge",
  parameters: {
    docs: {
      description: {
        story:
          "The trigger sits at the right edge, in a sticky column. The menu flips or shifts to stay on screen.",
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; justify-content: flex-end; padding-right: 1rem; position: sticky; right: 0; z-index: 20;"
    >
      <rfg-menu label="Actions for Spring newsletter" placement="bottom-end">
        <rfg-button slot="trigger" variant="ghost" size="xs" aria-label="Actions for Spring newsletter">⋮</rfg-button>
        <a role="menuitem" href="#view" style=${ITEM_STYLE}>View</a>
        <a role="menuitem" href="#edit" style=${ITEM_STYLE}>Edit</a>
        <button role="menuitem" type="button" style=${DANGER_ITEM_STYLE}>Delete project</button>
      </rfg-menu>
    </div>
  `,
};
