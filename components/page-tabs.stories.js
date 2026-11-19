import { html } from "lit";
import "./page-tabs.js";

export default {
  title: "Components/Page tabs",
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
