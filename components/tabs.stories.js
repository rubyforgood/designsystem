import { html } from "lit";
import "./tabs.js";

export default {
  title: "Components/Tabs (panel)",
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
