import { html } from "lit";
import "./segmented-control.js";

export default {
  title: "Components/Segmented control",
  component: "rfg-segmented-control",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A connected row of buttons that switches between a few views of the same data, in place. For example, a calendar shown by month or by week.",
          "",
          "**When to use**",
          "- Two to a few views of the same content, where the person flips between them and stays on the page.",
          "- Each group answers one question. If you need to choose both a time range and a layout, use two controls, not one row of mixed options.",
          "",
          "**When not to use**",
          "- To move between different screens or sections. Use Page tabs instead.",
          "- To swap between different panels of content. Use Tabs instead.",
          "- To pick a value a form submits later. Use radio buttons instead.",
          "",
          "**Accessibility**",
          "- The row is a `role=\"group\"` of real buttons. Each button is its own Tab stop and shows its state with `aria-pressed`.",
          "- There's no arrow-key navigation between segments. This toggles a view, it isn't a radio group.",
          "- Give the group a `label` that names what it switches (\"Calendar range\").",
          "- The control fires `rfg-change`. Store the choice in the URL (a query parameter) so the view can be linked to and bookmarked.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#segmented-controls)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-segmented-control label="Calendar range" value="month">
      <button type="button" value="month">Month</button>
      <button type="button" value="week">Week</button>
    </rfg-segmented-control>
  `,
};

export const Default = {};

export const ThreeSegments = {
  name: "Three segments",
  render: () => html`
    <rfg-segmented-control label="Calendar layout" value="grid">
      <button type="button" value="grid">Grid</button>
      <button type="button" value="list">List</button>
      <button type="button" value="agenda">Agenda</button>
    </rfg-segmented-control>
  `,
};

export const NoInitialValue = {
  name: "No initial value",
  parameters: {
    docs: {
      description: {
        story: "When no `value` is set, the first segment is selected.",
      },
    },
  },
  render: () => html`
    <rfg-segmented-control label="Calendar range">
      <button type="button" value="month">Month</button>
      <button type="button" value="week">Week</button>
    </rfg-segmented-control>
  `,
};
