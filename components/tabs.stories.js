import { html } from "lit";
import "./tabs.js";

export default {
  title: "Components/Tabs (panel)",
  component: "rfg-tabs",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Panels swap in place at the same URL, using the full ARIA Tabs pattern — design.md\'s ' +
          '"Tabs" section, the panel-tabs half — not a styled set of buttons: `role="tab"` makes ' +
          "a real promise to assistive tech (\"activating this swaps a panel\") that only a true " +
          "tablist keeps. Roving tabindex, automatic activation (arrow keys both move focus and " +
          "select), Home/End jump to the first/last tab. See page-tabs.js for the URL-backed " +
          "half, where each \"tab\" is its own page rather than a panel swap.",
      },
    },
  },
  render: () => html`
    <rfg-tabs label="Donation views">
      <rfg-tab-panel label="Details">
        <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">
          Donation details panel. Arrow Left/Right moves between tabs, Home/End jumps to the first/last.
        </p>
      </rfg-tab-panel>
      <rfg-tab-panel label="Line items">
        <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">
          Line items panel — swaps in place, same URL.
        </p>
      </rfg-tab-panel>
      <rfg-tab-panel label="History">
        <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">History panel.</p>
      </rfg-tab-panel>
    </rfg-tabs>
  `,
};

export const Default = {};
