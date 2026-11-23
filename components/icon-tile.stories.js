import { html } from "lit";
import "./icon-tile.js";

const BOX_ICON = html`
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1L1 4.5v7L8 15l7-3.5v-7L8 1zm0 2.2L12.8 5 8 7.2 3.2 5 8 3.2zM2.5 6.1l4.75 2.17v4.84L2.5 10.9V6.1zm6.25 7.11V8.27L13.5 6.1v4.8l-4.75 2.31z" />
  </svg>
`;

export default {
  title: "Components/Icon tile",
  component: "rfg-icon-tile",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A soft-colored square that holds one icon, placed beside a figure or a heading to mark what it is about.",
          "",
          "**When to use**",
          "- Beside a stat, a card heading or a status, to give it a quick visual anchor.",
          "",
          "**When not to use**",
          "- To represent a person. Use Avatar instead. Tiles mean \"a stat or status\" and avatars mean \"a person\", and the two never mix.",
          "- Repeated with the same icon on every row of a list. Put it once in the header instead.",
          "",
          "**Accessibility**",
          "- The tile is always hidden from assistive tech. It must sit next to a heading or figure that already says what it means.",
          "",
          "**Sizes**",
          "- `md` (default) sits beside a figure or a regular heading. `sm` suits a compact card header. The size names match Button's.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#icon-tiles-and-avatars)",
        ].join("\n"),
      },
    },
  },
  render: (args) => html`<rfg-icon-tile tone=${args.tone} size=${args.size}>${BOX_ICON}</rfg-icon-tile>`,
  argTypes: {
    tone: {
      control: "select",
      options: ["brand", "neutral", "info", "success", "warning", "danger"],
      description: "The color tone. Uses the same tone names as the rest of the system.",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "The tile size. Uses the same size names as Button.",
    },
  },
  args: { tone: "brand", size: "md" },
};

export const Brand = {};
export const Neutral = { args: { tone: "neutral" } };
export const Info = { args: { tone: "info" } };
export const Success = { args: { tone: "success" } };
export const Warning = { args: { tone: "warning" } };
export const Danger = { args: { tone: "danger" } };
export const Small = { args: { size: "sm" } };
