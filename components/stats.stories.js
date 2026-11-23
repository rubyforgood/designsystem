import { html } from "lit";
import "./stats.js";

const FIGURES_2 = [
  { label: "Tasks completed this month", value: "1,284" },
  { label: "Tasks scheduled for later", value: "310" },
];
const FIGURES_4 = [
  { label: "Active projects", value: "24" },
  { label: "Tasks completed", value: "1,284" },
  { label: "Team members", value: "18" },
  { label: "Overdue tasks", value: "56" },
];

export default {
  title: "Components/Stats",
  component: "rfg-stats",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A band of key figures, each a number with a label saying what it counts. The figures read as one summary, not a row of separate cards.",
          "",
          "**When to use**",
          "- Summarising a few headline numbers at the top of a dashboard or report.",
          "",
          "**When not to use**",
          "- For detailed or comparable data across many rows. Use Table instead.",
          "- For a single record's fields. Use a description list or Card instead.",
          "",
          "**Accessibility**",
          "- Each label and figure is a real description-list pair (`<dt>` and `<dd>`).",
          "- Figures are never headings. A number is data, not a section name.",
          "- Give the band a `heading`, and a `subtitle` for the period or scope it covers. A bare row of numbers is ambiguous.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#stats)",
        ].join("\n"),
      },
    },
  },
  render: () => html`<rfg-stats heading="Totals" subtitle="13 projects, from June 19, 2026 to September 19, 2026" .figures=${FIGURES_2}></rfg-stats>`,
};

export const TwoFigures = {};

export const FourFigures = {
  render: () => html`<rfg-stats heading="Totals" .figures=${FIGURES_4}></rfg-stats>`,
};

export const NoTitle = {
  name: "Without a heading",
  parameters: {
    docs: {
      description: {
        story: "Supported, but use it only when nearby content already says what the figures cover.",
      },
    },
  },
  render: () => html`<rfg-stats .figures=${FIGURES_2}></rfg-stats>`,
};
