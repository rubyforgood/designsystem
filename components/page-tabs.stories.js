import { html } from "lit";
import "./page-tabs.js";

export default {
  title: "Components/Page tabs",
  component: "rfg-page-tabs",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Each tab is its own URL, styled as a `<nav>` of real links — design.md\'s "Tabs" ' +
          "section, the page-tabs half — deliberately *not* the ARIA tablist pattern (see " +
          "`<rfg-tabs>`/page-tabs.js for that, the panel-tabs half), because using `role=\"tab\"` " +
          "for something that navigates is an accessibility bug, not a style choice: the " +
          "tablist pattern promises an in-page panel swap and intercepts arrow keys a plain " +
          'link list wouldn\'t. The host sets `aria-current="page"` on whichever `<a>` is ' +
          "current, since this element has no way to know the current URL itself.",
      },
    },
  },
  render: () => html`
    <rfg-page-tabs label="Item catalogue sections">
      <a href="#items" aria-current="page">Items</a>
      <a href="#item_categories">Categories</a>
      <a href="#quantity_and_location">Quantity &amp; location</a>
      <a href="#inventory">Inventory</a>
      <a href="#kits">Kits</a>
    </rfg-page-tabs>
  `,
};

export const Default = {};
