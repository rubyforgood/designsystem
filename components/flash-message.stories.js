import { html } from "lit";
import "./flash-message.js";

const CHECK_ICON = html`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.7 4.3a1 1 0 010 1.4l-6 6a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L7 9.6l5.3-5.3a1 1 0 011.4 0z"/></svg>`;

export default {
  title: "Components/Flash message",
  component: "rfg-flash-message",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A short message about the result of something the user just did, such as saving or deleting.",
          "",
          "**When to use**",
          "- Once, right after an action, to confirm it worked or explain why it didn't.",
          "- Pick the tone by severity: `info`, `success`, `warning` or `danger`.",
          "",
          "**When not to use**",
          "- For a notice that must stay on the page until it no longer applies, use Callout.",
          "- For form validation errors, use Error summary and Field.",
          "",
          "**Accessibility**",
          "- `info` and `success` messages are announced politely (`role=\"status\"`). `warning` and `danger` messages interrupt (`role=\"alert\"`).",
          "- The close button is labeled \"Dismiss\". Listen for `rfg-dismiss` and remove the message.",
          "- An auto-dismiss timer (`dismiss-after`) pauses while the message is hovered or focused (WCAG 2.2.1 Timing Adjustable).",
          "- Only auto-dismiss a message the user won't need once the timer runs out. Decide per message, not per tone. A success message holding a one-time code must stay.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#flash-messages)",
        ].join("\n"),
      },
    },
  },
  render: (args) =>
    html`<rfg-flash-message tone=${args.tone} ?dismissible=${args.dismissible}>${args.message}</rfg-flash-message>`,
  argTypes: {
    tone: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
      description: "Decides the ARIA role: warning/danger interrupt (`role=\"alert\"`), info/success announce politely (`role=\"status\"`).",
    },
    dismissible: {
      control: "boolean",
      description: "Shows a manual close control, independent of the auto-dismiss timer.",
    },
    message: { control: "text" },
  },
  args: { tone: "info", dismissible: true, message: "Your changes have been saved." },
};

export const Info = {};
export const Success = {
  args: { tone: "success", message: "Project created." },
  render: (args) =>
    html`
      <rfg-flash-message tone=${args.tone} ?dismissible=${args.dismissible}>
        <span slot="icon">${CHECK_ICON}</span>
        ${args.message}
      </rfg-flash-message>
    `,
};
export const Warning = { args: { tone: "warning", message: "This project has no owner yet." } };
export const Danger = { args: { tone: "danger", message: "Could not save — check the highlighted fields." } };
export const NotDismissible = {
  name: "Not dismissible",
  args: { dismissible: false, message: "Session expires in 5 minutes." },
};

export const AutoDismiss = {
  name: "Auto-dismiss",
  parameters: {
    docs: { description: { story: "Disappears after 4 seconds. Hover or focus it to pause the timer." } },
  },
  render: () =>
    html`<rfg-flash-message tone="success" dismiss-after="4000">
      Link copied to clipboard. Hover or focus this message to pause the timer.
    </rfg-flash-message>`,
};
