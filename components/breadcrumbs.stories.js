import { html } from "lit";
import "./breadcrumbs.js";

const ITEMS = [
  { label: "Donations", href: "#donations" },
  { label: "Acme Donations", href: "#donations/1" },
  { label: "Edit" },
];

export default {
  title: "Components/Breadcrumbs",
  render: () => html`<rfg-breadcrumbs .items=${ITEMS}></rfg-breadcrumbs>`,
};

export const Default = {};

export const TwoLevels = {
  render: () => html`<rfg-breadcrumbs .items=${[{ label: "Items", href: "#items" }, { label: "Diapers, size 4" }]}></rfg-breadcrumbs>`,
};
