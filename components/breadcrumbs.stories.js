import { html } from "lit";
import "./breadcrumbs.js";

const ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Website redesign" },
];

export default {
  title: "Components/Breadcrumbs",
  component: "rfg-breadcrumbs",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Breadcrumbs show where the current page sits in the site's hierarchy, and link back to each level above it. Pass the trail as data: `[{ label, href? }]`. The entry with no `href` is the current page.",
          "",
          "**When to use**",
          "- On every page that isn't a top-level page in the main navigation. Place it above the page heading.",
          "",
          "**When not to use**",
          "- On top-level pages. The main navigation already shows where people are.",
          "- To switch between views of the same record, use Page tabs.",
          "",
          "**Accessibility**",
          "- Follows the WAI-ARIA breadcrumb pattern. It renders a `<nav aria-label=\"Breadcrumb\">` around an ordered list, because the order is the hierarchy.",
          "- The current page is plain text with `aria-current=\"page\"`, never a link to itself.",
          "- Set `label` to change the navigation landmark's name.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#breadcrumbs)",
        ].join("\n"),
      },
    },
  },
  render: () => html`<rfg-breadcrumbs .items=${ITEMS}></rfg-breadcrumbs>`,
};

export const Default = {};

export const TwoLevels = {
  name: "Two levels",
  render: () => html`<rfg-breadcrumbs .items=${[{ label: "Projects", href: "#projects" }, { label: "Website redesign" }]}></rfg-breadcrumbs>`,
};
