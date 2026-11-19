import { html } from "lit";
import "./flash-message.js";

const CHECK_ICON = html`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.7 4.3a1 1 0 010 1.4l-6 6a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L7 9.6l5.3-5.3a1 1 0 011.4 0z"/></svg>`;

export default {
  title: "Components/Flash message",
  render: (args) =>
    html`<rfg-flash-message tone=${args.tone} ?dismissible=${args.dismissible}>${args.message}</rfg-flash-message>`,
  argTypes: {
    tone: { control: "select", options: ["info", "success", "warning", "danger"] },
    dismissible: { control: "boolean" },
    message: { control: "text" },
  },
  args: { tone: "info", dismissible: true, message: "Your changes have been saved." },
};

export const Info = {};
export const Success = {
  args: { tone: "success", message: "Donation recorded." },
  render: (args) =>
    html`
      <rfg-flash-message tone=${args.tone} ?dismissible=${args.dismissible}>
        <span slot="icon">${CHECK_ICON}</span>
        ${args.message}
      </rfg-flash-message>
    `,
};
export const Warning = { args: { tone: "warning", message: "This request is missing an item." } };
export const Danger = { args: { tone: "danger", message: "Could not save — check the highlighted fields." } };
export const NotDismissible = {
  name: "Not dismissible",
  args: { dismissible: false, message: "Session expires in 5 minutes." },
};

export const AutoDismiss = {
  name: "Auto-dismiss (pauses on hover/focus)",
  render: () =>
    html`<rfg-flash-message tone="success" dismiss-after="4000">
      Link copied to clipboard. Hover or focus this message to pause the timer.
    </rfg-flash-message>`,
};
