import { html } from "lit";
import "./popover.js";
import "./button.js";

export default {
  title: "Components/Popover",
  component: "rfg-popover",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A small floating panel anchored to a trigger button, such as an account menu or a set of filters. It stays next to what it acts on and keeps itself inside the viewport.",
          "",
          "**When to use**",
          "- Extra controls or details that belong to one button and should stay in context with the page, like filter options for a list you can still see.",
          "",
          "**When not to use**",
          "- For a task that must be finished before going back to the page. Use Modal instead.",
          "- For a list of actions. Use Menu instead.",
          "- For a short text hint on hover or focus. Use Tooltip instead.",
          "",
          "**Accessibility**",
          "- Escape closes the panel and returns focus to the trigger. A click outside closes it without moving focus.",
          "- The trigger gets `aria-haspopup`, `aria-expanded` and `aria-controls` for you.",
          "- While closed, the panel is hidden from assistive tech, not just visually.",
          "- It doesn't trap focus or make the rest of the page inert.",
          "- Put your own button in the `trigger` slot, and give the panel a `label` that names it.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#popovers)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-popover label="Filter options">
      <rfg-button slot="trigger" variant="secondary" size="sm">Filter</rfg-button>
      <div style="font-family: var(--font-sans); font-size: 0.875rem; min-width: 12rem;">
        <p style="margin: 0 0 0.5rem; font-weight: 600;">Filter by status</p>
        <label style="display: block; margin-bottom: 0.25rem;"><input type="checkbox" /> Active</label>
        <label style="display: block;"><input type="checkbox" /> Archived</label>
      </div>
    </rfg-popover>
  `,
};

export const Default = {};

export const NearViewportEdge = {
  name: "Near the viewport edge",
  parameters: {
    docs: {
      description: {
        story: "A trigger at the right edge of the screen. The panel aligns to the trigger's end and shifts to stay fully visible.",
      },
    },
  },
  render: () => html`
    <div style="display: flex; justify-content: flex-end; padding-right: 1rem;">
      <rfg-popover label="Account menu" placement="bottom-end">
        <rfg-button slot="trigger" variant="secondary" size="sm">Account</rfg-button>
        <div style="font-family: var(--font-sans); font-size: 0.875rem; min-width: 10rem;">
          Maya Chen<br />maya.chen@example.org
        </div>
      </rfg-popover>
    </div>
  `,
};
