import { html } from "lit";
import "./page-tabs.js";

export default {
  title: "Components/Page tabs",
  component: "rfg-page-tabs",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Page tabs are a row of links styled as tabs. Each tab is its own page with its own URL. Use them to move between sections of one area, such as a project's overview, tasks and settings.",
          "",
          "**When to use**",
          "- When each tab is a separate page that people may want to link to, bookmark, or reach with the browser's back button.",
          "- When a tab needs its own page-level actions.",
          "",
          "**When not to use**",
          "- When the content swaps in place on the same page, use Tabs instead. Tabs uses the ARIA tab pattern. Page tabs must not, because a tab that loads a new page breaks that pattern's promise to screen reader users.",
          "",
          "**Accessibility**",
          "- Renders a `<nav>` of ordinary links. Tab moves between them, as with any links. There are no arrow-key shortcuts.",
          "- Set `aria-current=\"page\"` on the link for the current page. The component can't know the current URL.",
          "- Set `label` to name the navigation landmark. It defaults to \"Page sections\".",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#tabs)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-page-tabs label="Website redesign sections">
      <a href="#overview" aria-current="page">Overview</a>
      <a href="#tasks">Tasks</a>
      <a href="#documents">Documents</a>
      <a href="#members">Team members</a>
      <a href="#settings">Settings</a>
    </rfg-page-tabs>
  `,
};

export const Default = {};
