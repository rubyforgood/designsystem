import { html } from "lit";
import "./status-pill.js";

export default {
  title: "Components/Status pill",
  component: "rfg-status-pill",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A small tinted label that shows the state of something, such as a project that is In review or Approved. A pill shows state. It is never an action.",
          "",
          "**When to use**",
          "- Showing a record's status in a table row, a card or a page header.",
          "",
          "**When not to use**",
          "- For anything people can click or select. Use Button instead.",
          "- For a message about the whole page. Use Callout instead.",
          "- As an emoji. A status is always a real pill or an icon with a word.",
          "",
          "**Accessibility**",
          "- Pills are never focusable and never look pressable.",
          "- The word carries the meaning, so the status doesn't rely on colour alone. Always write a clear label.",
          "- An icon in the `icon` slot is decorative and hidden from assistive tech.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#status-pills)",
        ].join("\n"),
      },
    },
  },
  render: (args) => html`<rfg-status-pill tone=${args.tone}>${args.label}</rfg-status-pill>`,
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger", "brand"],
      description: "The colour tone. Uses the same tone names as the rest of the system.",
    },
    label: { control: "text" },
  },
  args: { tone: "neutral", label: "Draft" },
};

export const Neutral = {};
export const Info = { args: { tone: "info", label: "In review" } };
export const Success = { args: { tone: "success", label: "Approved" } };
export const Warning = { args: { tone: "warning", label: "Overdue" } };
export const Danger = { args: { tone: "danger", label: "Rejected" } };
export const Brand = { args: { tone: "brand", label: "Featured" } };

export const WithIcon = {
  name: "With an icon",
  parameters: {
    docs: {
      description: {
        story: "Add an icon only when the pill is rare on the page. If every row in a column has a pill, leave the icon out.",
      },
    },
  },
  render: () =>
    html`
      <rfg-status-pill tone="warning">
        <svg slot="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 3.5v4l3 1.5-.6 1.3-3.9-2V4.5h1.5z" />
        </svg>
        Awaiting review
      </rfg-status-pill>
    `,
};
