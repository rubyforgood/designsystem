import { html } from "lit";
import "./page-header.js";
import "./button.js";

export default {
  title: "Components/Page header",
  component: "rfg-page-header",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "The top of a page: its title, an optional subtitle, an optional back link, and page-level actions.",
          "",
          "**When to use**",
          "- Once per page, at the top.",
          "- Add a back link when the page sits under a parent page, labeled `Back to <noun>`.",
          "",
          "**When not to use**",
          "- For a heading inside a page section, use a Card heading or a plain heading instead.",
          "",
          "**Accessibility**",
          "- The title is the page's `<h1>`. Don't render another `<h1>` anywhere else on the page.",
          "- The back link is a real link, so it works with the keyboard, middle-click and the browser's history.",
          "- Give the back link a label that names where it goes, such as \"Back to projects\".",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#page-header)",
        ].join("\n"),
      },
    },
  },
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
    subtitle: {
      control: "text",
      description: "A line under the heading. When set, actions line up with the top of the header instead of the heading's baseline.",
    },
    backHref: { control: "text" },
    backLabel: { control: "text" },
  },
  args: { heading: "New project" },
};

export const TitleOnly = { name: "Title only" };

export const WithSubtitle = {
  name: "With a subtitle",
  render: () =>
    html`
      <rfg-page-header heading="New project" subtitle="Set up a project for your team.">
        <rfg-button slot="actions" variant="secondary" size="sm">Import CSV</rfg-button>
      </rfg-page-header>
    `,
};

export const WithBackLink = {
  name: "With a back link",
  render: () =>
    html`
      <rfg-page-header heading="New project" subtitle="Set up a project for your team." back-href="#projects" back-label="Back to projects">
        <rfg-button slot="actions" variant="secondary" size="sm">Import CSV</rfg-button>
      </rfg-page-header>
    `,
};

export const WithActions = {
  name: "With page actions",
  render: () =>
    html`
      <rfg-page-header heading="Projects">
        <rfg-button slot="actions" variant="secondary" size="sm">Export</rfg-button>
        <rfg-button slot="actions" variant="primary" size="sm">New project</rfg-button>
      </rfg-page-header>
    `,
};
