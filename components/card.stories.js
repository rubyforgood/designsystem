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
        component:
          "The surface everything sits on — design.md's \"Cards\" section: hairline border, " +
          "rounded, single elevation step — plus an optional title/subtitle/actions header and " +
          "footer. The header and footer regions render only when there's something to put in " +
          "them, checked via `slotchange`, not assumed from an attribute merely being declared.",
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
  name: "Surface only (no title/subtitle/actions)",
  render: () => html`<rfg-card>Just the surface — no header rendered at all.</rfg-card>`,
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
  name: "Unpadded (body meets the card edges)",
  render: () =>
    html`
      <rfg-card heading="Donations" ?padded=${false}>
        <div style="padding: 0.5rem 1.25rem; font-family: var(--font-sans); font-size: 0.875rem;">
          A table-shaped body that should reach the card's edges.
        </div>
      </rfg-card>
    `,
};

export const WithFooter = {
  name: "With footer",
  render: () =>
    html`
      <rfg-card heading="Donations">
        Card body content.
        <div slot="footer" style="font-family: var(--font-sans); font-size: 0.8125rem; color: var(--color-neutral-500);">
          Showing 1-10 of 42
        </div>
      </rfg-card>
    `,
};
