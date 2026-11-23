import { html } from "lit";
import "./card.js";
import "../components/button.js";

export default {
  title: "Components/Card",
  component: "rfg-card",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A bordered, rounded surface that groups related content. It can have an optional header (heading, subtitle and actions) and an optional footer.",
          "",
          "**When to use**",
          "- To group a self-contained block of content, such as a table, a form section or a summary.",
          "- Set `padded` to false when the body, such as a table, should run to the card's edges.",
          "- Leave out the heading, subtitle and actions when you only need the surface. No header is drawn.",
          "",
          "**When not to use**",
          "- For a filter bar that sits directly above the table it filters, leave it unwrapped. Use a card only when the filters are a section in their own right.",
          "- For a status message, use Flash message (one-time) or Callout (persistent) instead.",
          "",
          "**Accessibility**",
          "- The header and footer only render when they have content, so an empty card adds nothing extra for screen readers.",
          "- The card heading is styled text, not a heading element. If the card is a page section that should appear in the heading outline, put a real heading in the body.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#cards)",
        ].join("\n"),
      },
    },
  },
  render: (args) =>
    html`
      <rfg-card heading=${args.heading || undefined} subtitle=${args.subtitle || undefined} ?padded=${args.padded}>
        Card body content goes here.
      </rfg-card>
    `,
  argTypes: {
    heading: { control: "text" },
    subtitle: { control: "text" },
    padded: {
      control: "boolean",
      description: "When false, the body meets the card edges (e.g. a table) instead of relying on whitespace alone.",
    },
  },
  args: { heading: "Filters", subtitle: "Narrow this list down.", padded: true },
};

export const Default = {};

export const SurfaceOnly = {
  name: "Surface only",
  render: () => html`<rfg-card>Just the surface. No header is rendered.</rfg-card>`,
};

export const WithActions = {
  name: "With header actions",
  render: () =>
    html`
      <rfg-card heading="Filters" subtitle="Narrow this list down.">
        Card body content goes here.
        <rfg-button slot="actions" variant="secondary" size="sm">Export</rfg-button>
      </rfg-card>
    `,
};

export const Unpadded = {
  name: "Unpadded body",
  parameters: {
    docs: { description: { story: "The body runs to the card's edges, which suits a table." } },
  },
  render: () =>
    html`
      <rfg-card heading="Projects" ?padded=${false}>
        <div style="padding: 0.5rem 1.25rem; font-family: var(--font-sans); font-size: 0.875rem;">
          A table-shaped body that should reach the card's edges.
        </div>
      </rfg-card>
    `,
};

export const WithFooter = {
  name: "With a footer",
  render: () =>
    html`
      <rfg-card heading="Projects">
        Card body content.
        <div slot="footer" style="font-family: var(--font-sans); font-size: 0.8125rem; color: var(--color-neutral-500);">
          Showing 1–10 of 42 projects
        </div>
      </rfg-card>
    `,
};
