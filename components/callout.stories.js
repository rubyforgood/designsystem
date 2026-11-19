import { html } from "lit";
import "./callout.js";

export default {
  title: "Components/Callout",
  render: (args) => html`
    <rfg-callout tone=${args.tone} heading=${args.heading || undefined}>${args.body}</rfg-callout>
  `,
  argTypes: {
    tone: { control: "select", options: ["info", "success", "warning", "danger"] },
    heading: { control: "text" },
    body: { control: "text" },
  },
  args: { tone: "warning", heading: "This cannot be undone.", body: "You are cancelling the request made for this partner." },
};

export const Warning = {};
export const Info = { args: { tone: "info", heading: "", body: "This organization has two active storage locations." } };
export const Success = { args: { tone: "success", heading: "", body: "All requests for this period have been fulfilled." } };
export const Danger = { args: { tone: "danger", heading: "This organization is deactivated." } };

export const NoLiveRegion = {
  name: 'role="none" (plain page furniture, no live region)',
  render: () => html`<rfg-callout tone="info" role="none">Page furniture that should never interrupt or announce.</rfg-callout>`,
};
