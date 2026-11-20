import { html } from "lit";
import "./status-pill.js";

export default {
  title: "Components/Status pill",
  component: "rfg-status-pill",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Communicates state, never an action — design.md\'s "Status pills" section. Never ' +
          "focusable, never looks pressable. Tones reuse the same semantic vocabulary as the " +
          "rest of the system (neutral/info/success/warning/danger/brand) rather than a pill-" +
          "specific palette.",
      },
    },
  },
  render: (args) => html`<rfg-status-pill tone=${args.tone}>${args.label}</rfg-status-pill>`,
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger", "brand"],
      description: "Reuses the system's shared semantic tone vocabulary rather than a pill-specific palette.",
    },
    label: { control: "text" },
  },
  args: { tone: "neutral", label: "Pending" },
};

export const Neutral = {};
export const Info = { args: { tone: "info", label: "In review" } };
export const Success = { args: { tone: "success", label: "Approved" } };
export const Warning = { args: { tone: "warning", label: "Awaiting review" } };
export const Danger = { args: { tone: "danger", label: "Rejected" } };
export const Brand = { args: { tone: "brand", label: "Featured" } };

export const WithIcon = {
  name: "With icon (rare only — see design.md)",
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
