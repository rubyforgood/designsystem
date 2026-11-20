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
        component:
          "The icon half of design.md's \"Icon tiles and avatars\" section — reuses " +
          '`<rfg-button>`\'s size vocabulary (sm/md) rather than inventing a second scale. ' +
          "Deliberately a separate element from `<rfg-avatar>`, so the two distinct visual " +
          'vocabularies ("a stat or status" vs. "a person") can\'t blur together by accident at ' +
          "a call site.",
      },
    },
  },
  render: (args) => html`<rfg-icon-tile tone=${args.tone} size=${args.size}>${BOX_ICON}</rfg-icon-tile>`,
  argTypes: {
    tone: {
      control: "select",
      options: ["brand", "neutral", "info", "success", "warning", "danger"],
      description: "Reuses the system's shared semantic tone vocabulary.",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Reuses `<rfg-button>`'s size vocabulary rather than a tile-specific scale.",
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
