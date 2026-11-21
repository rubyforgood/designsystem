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
        component:
          "Names and shows a bubble for an icon-only (or any) control on hover and focus — " +
          "design.md's tooltip rules under \"Row actions\": never `title` (unstyleable, silent on " +
          "keyboard focus, gone on a timer, neither hoverable nor dismissible — three failures of " +
          "WCAG 1.4.13 at once), hoverable (moving the pointer onto the bubble doesn't dismiss " +
          "it), dismissible with Escape without moving focus away, and the bubble is " +
          "`aria-hidden` since the control's own `aria-label` already carries the same string. " +
          "Ported from Human Essentials' own `tooltip_controller.js` (640 icon-only controls " +
          "across 153 screens, 0 defects).",
      },
    },
  },
  render: () => html`
    <rfg-tooltip text="Delete donation">
      <rfg-button variant="ghost" size="xs" aria-label="Delete donation">
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
  name: "Near the right edge (flips left)",
  render: () => html`
    <div style="display: flex; justify-content: flex-end; padding-right: 1rem;">
      <rfg-tooltip text="Reactivate partner">
        <rfg-button variant="ghost" size="xs" aria-label="Reactivate partner">↻</rfg-button>
      </rfg-tooltip>
    </div>
  `,
};

export const OnATriggerWithItsOwnLabel = {
  name: "Trigger already has visible text (no auto aria-label)",
  render: () => html`
    <rfg-tooltip text="Opens in a new tab">
      <rfg-button variant="secondary" size="sm">Export report</rfg-button>
    </rfg-tooltip>
  `,
};
