import { html } from "lit";
import "./tooltip.js";
import "./button.js";

export default {
  title: "Components/Tooltip",
  component: "rfg-tooltip",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A small text label that appears when a control is hovered or focused. Its main job is naming icon-only buttons.",
          "",
          "**When to use**",
          "- On every icon-only control, so sighted users can see what the icon means.",
          "- On a control with visible text, only to add a short hint the text leaves out.",
          "",
          "**When not to use**",
          "- Never use the HTML `title` attribute instead. It can't be styled, doesn't show on keyboard focus, and disappears on a timer.",
          "- For content with links, buttons or anything else interactive, use Popover.",
          "- A menu trigger that opens an obvious menu, such as an overflow \"⋯\" button, usually doesn't need one.",
          "",
          "**Accessibility**",
          "- Shows on hover and on keyboard focus. Moving the pointer onto the tooltip keeps it open. Escape hides it without moving focus (WCAG 1.4.13).",
          "- If the control has no accessible name, `text` becomes its `aria-label`, so the tooltip and the name always match.",
          "- The tooltip itself is hidden from screen readers, so the name isn't read twice.",
          "- You provide `text` and a focusable control (such as a button) as the child.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#tooltips)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-tooltip text="Delete project">
      <rfg-button variant="ghost" size="xs" aria-label="Delete project">
        <i slot="icon" style="width: 1em; height: 1em; display: inline-block;">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M6 2a1 1 0 00-1 1v1H3.5a.5.5 0 000 1H4v8a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0012 13V5h.5a.5.5 0 000-1H11V3a1 1 0 00-1-1H6zm-1 3h6v8a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5V5z" />
          </svg>
        </i>
      </rfg-button>
    </rfg-tooltip>
  `,
};

export const Default = {};

export const NearViewportEdge = {
  name: "Near the viewport edge",
  parameters: {
    docs: { description: { story: "Next to the right edge, the tooltip flips to the left so it stays on screen." } },
  },
  render: () => html`
    <div style="display: flex; justify-content: flex-end; padding-right: 1rem;">
      <rfg-tooltip text="Restore project">
        <rfg-button variant="ghost" size="xs" aria-label="Restore project">↻</rfg-button>
      </rfg-tooltip>
    </div>
  `,
};

export const OnATriggerWithItsOwnLabel = {
  name: "On a button with text",
  parameters: {
    docs: {
      description: {
        story: "The button keeps its own visible text as its name. The tooltip adds a hint without replacing it.",
      },
    },
  },
  render: () => html`
    <rfg-tooltip text="Opens in a new tab">
      <rfg-button variant="secondary" size="sm">Export report</rfg-button>
    </rfg-tooltip>
  `,
};
