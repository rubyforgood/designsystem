import { html } from "lit";
import "./page-header.js";
import "./button.js";

export default {
  title: "Components/Page header",
  render: (args) =>
    html`
      <rfg-page-header
        heading=${args.heading}
        subtitle=${args.subtitle || undefined}
        back-href=${args.backHref || undefined}
        back-label=${args.backLabel || undefined}
      ></rfg-page-header>
    `,
  argTypes: {
    heading: { control: "text" },
    subtitle: { control: "text" },
    backHref: { control: "text" },
    backLabel: { control: "text" },
  },
  args: { heading: "New donation" },
};

export const TitleOnly = { name: "Title only (no subtitle — items-end alignment)" };

export const WithSubtitle = {
  name: "With subtitle (items-start alignment)",
  render: () =>
    html`
      <rfg-page-header heading="New donation" subtitle="Record essentials coming in from a donor.">
        <rfg-button slot="actions" variant="secondary" size="sm">Import CSV</rfg-button>
      </rfg-page-header>
    `,
};

export const WithBackLink = {
  name: "With back link",
  render: () =>
    html`
      <rfg-page-header heading="New donation" subtitle="Record essentials coming in from a donor." back-href="#donations" back-label="Back to donations">
        <rfg-button slot="actions" variant="secondary" size="sm">Import CSV</rfg-button>
      </rfg-page-header>
    `,
};

export const WithActions = {
  name: "With page-level actions",
  render: () =>
    html`
      <rfg-page-header heading="Distributions">
        <rfg-button slot="actions" variant="secondary" size="sm">Export</rfg-button>
        <rfg-button slot="actions" variant="primary" size="sm">New distribution</rfg-button>
      </rfg-page-header>
    `,
};
