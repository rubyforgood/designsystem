import { html } from "lit";
import "./icon-tile.js";

const BOX_ICON = html`
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1L1 4.5v7L8 15l7-3.5v-7L8 1zm0 2.2L12.8 5 8 7.2 3.2 5 8 3.2zM2.5 6.1l4.75 2.17v4.84L2.5 10.9V6.1zm6.25 7.11V8.27L13.5 6.1v4.8l-4.75 2.31z" />
  </svg>
`;

export default {
  title: "Components/Icon tile",
  render: (args) => html`<rfg-icon-tile tone=${args.tone} size=${args.size}>${BOX_ICON}</rfg-icon-tile>`,
  argTypes: {
    tone: { control: "select", options: ["brand", "neutral", "info", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md"] },
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
