import { html } from "lit";
import "./callout.js";

export default {
  title: "Components/Callout",
  component: "rfg-callout",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A notice about the page/record's *persistent* state (\"this is how things are here\") " +
          "— design.md's \"Callouts\" section — distinct from `<rfg-flash-message>`'s one-time, " +
          "per-event notice (\"that worked\"). No auto-dismiss, on purpose. Placement is " +
          "deliberately not this element's job: no margin is set here, the host positions it.",
      },
    },
  },
  render: (args) => html`
    <rfg-callout tone=${args.tone} heading=${args.heading || undefined}>${args.body}</rfg-callout>
  `,
  argTypes: {
    tone: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
      description: "Maps to the ARIA role: warning/danger interrupt (`role=\"alert\"`), info/success announce politely (`role=\"status\"`).",
    },
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
