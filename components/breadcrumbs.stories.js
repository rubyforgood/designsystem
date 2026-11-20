import { html } from "lit";
import "./breadcrumbs.js";

const ITEMS = [
  { label: "Donations", href: "#donations" },
  { label: "Acme Donations", href: "#donations/1" },
  { label: "Edit" },
];

export default {
  title: "Components/Breadcrumbs",
  component: "rfg-breadcrumbs",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Breadcrumb trail following the W3C ARIA APG breadcrumb pattern — design.md's " +
          "breadcrumb rule under \"Conditional reveal\". An ordered list because order carries " +
          "hierarchy: ancestor links, and the current page as plain text carrying " +
          '`aria-current="page"`, never a link to itself. The host supplies items as data ' +
          "(`[{ label, href? }]`); an entry with no `href` is the current page.",
      },
    },
  },
  render: () => html`<rfg-breadcrumbs .items=${ITEMS}></rfg-breadcrumbs>`,
};

export const Default = {};

export const TwoLevels = {
  render: () => html`<rfg-breadcrumbs .items=${[{ label: "Items", href: "#items" }, { label: "Diapers, size 4" }]}></rfg-breadcrumbs>`,
};
