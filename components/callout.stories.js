import { html } from "lit";
import "./callout.js";

export default {
  title: "Components/Callout",
  component: "rfg-callout",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A notice about how things stand on this page or record, such as a warning that an action is final. It shows on every visit for as long as the condition holds.",
          "",
          "**When to use**",
          "- A lasting condition the reader should know about before acting, like an archived project or an irreversible step.",
          "- Place it with what it's about. A callout about the whole page goes at the top, before the content. A callout about one section sits with that section.",
          "",
          "**When not to use**",
          "- For a one-time confirmation after an action (\"Saved\"). Use Flash message instead.",
          "- For an empty list. Use Empty state instead.",
          "",
          "**Accessibility**",
          "- `warning` and `danger` callouts use `role=\"alert\"` and are announced right away. `info` and `success` use `role=\"status\"` and are announced politely.",
          "- Set `role=\"none\"` for a callout that is part of the page layout and shouldn't be announced.",
          "- It never dismisses itself. The callout sets no margin, so you control its spacing.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#callouts)",
        ].join("\n"),
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
      description: "Sets the colour and the ARIA role: warning/danger interrupt (`role=\"alert\"`), info/success announce politely (`role=\"status\"`).",
    },
    heading: { control: "text" },
    body: { control: "text" },
  },
  args: { tone: "warning", heading: "This cannot be undone.", body: "Deleting this project also deletes its tasks and documents." },
};

export const Warning = {};
export const Info = { args: { tone: "info", heading: "", body: "This project is shared with the Northwind workspace." } };
export const Success = { args: { tone: "success", heading: "", body: "All tasks in this project are complete." } };
export const Danger = { args: { tone: "danger", heading: "This project is archived." } };

export const NoLiveRegion = {
  name: "Not announced",
  parameters: {
    docs: {
      description: {
        story: "With `role=\"none\"` the callout is not a live region, so screen readers don't announce it when the page loads.",
      },
    },
  },
  render: () => html`<rfg-callout tone="info" role="none">Projects are visible to everyone in the workspace.</rfg-callout>`,
};
