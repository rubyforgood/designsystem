import { html } from "lit";
import "./tabs.js";

export default {
  title: "Components/Tabs (panel)",
  component: "rfg-tabs",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A row of tabs that swaps between panels of content on the same page. The URL doesn't change.",
          "",
          "**When to use**",
          "- Related content about one thing, split into a few panels the reader moves between, like a project's details, tasks and history.",
          "",
          "**When not to use**",
          "- When each tab is its own page with its own URL, or needs its own page-level action. Use Page tabs instead.",
          "- To switch between views of the same data, like month or week. Use Segmented control instead.",
          "",
          "**Accessibility**",
          "- Uses the ARIA tabs pattern: a `tablist` of `tab`s, each linked to its panel.",
          "- Only the selected tab is a Tab stop. Left and Right arrow keys move between tabs and select them. Home and End jump to the first and last tab.",
          "- Give the tab set a `label`, and each `<rfg-tab-panel>` a `label` for its tab.",
          "- Keep the tab strip in the same place on every tab. Put per-tab controls inside the panel.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#tabs)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-tabs label="Project views">
      <rfg-tab-panel label="Details">
        <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">
          Website redesign. Owner: Maya Chen. Status: Active.
        </p>
      </rfg-tab-panel>
      <rfg-tab-panel label="Tasks">
        <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">
          12 open tasks, 30 completed.
        </p>
      </rfg-tab-panel>
      <rfg-tab-panel label="History">
        <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">Created by Sam Rivera on March 3, 2026.</p>
      </rfg-tab-panel>
    </rfg-tabs>
  `,
};

export const Default = {};
