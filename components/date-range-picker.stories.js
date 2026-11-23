import { html } from "lit";
import "./date-range-picker.js";

const PRESETS = [
  { label: "Last 7 days", start: "2026-11-12", end: "2026-11-19" },
  { label: "Last 30 days", start: "2026-10-20", end: "2026-11-19" },
  { label: "This year", start: "2026-01-01", end: "2026-11-19" },
];

export default {
  title: "Components/Date range picker",
  component: "rfg-date-range-picker",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A button that shows the current date range and opens a panel to change it. The panel lists preset ranges on one side and two date fields on the other.",
          "",
          "**When to use**",
          "- Filtering a list or report by a range of dates.",
          "",
          "**When not to use**",
          "- For a single date. Use a native date field instead.",
          "",
          "**How it behaves**",
          "- Choosing a preset applies it straight away and closes the panel.",
          "- Editing a custom date applies after a short pause and keeps the panel open, so both dates can be set in one go.",
          "- If the end date is before the start date, the two are swapped rather than showing an error.",
          "",
          "**Accessibility**",
          "- The panel follows Popover's keyboard rules. Escape closes it and returns focus to the trigger.",
          "- The custom dates are native `<input type=\"date\">` fields with visible labels.",
          "- The active preset is marked with `aria-current`.",
          "- The component fires `rfg-change` with `{ start, end, label }`. You decide how to apply it, for example as URL parameters.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#date-range-picker)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-date-range-picker
      .presets=${PRESETS}
      @rfg-change=${(e) => console.log("rfg-change", e.detail)}
    ></rfg-date-range-picker>
  `,
};

export const Default = {};

export const WithRangeAlreadySelected = {
  name: "Preset range selected",
  parameters: {
    docs: {
      description: {
        story: "The current range matches a preset, so the trigger shows the preset's name.",
      },
    },
  },
  render: () =>
    html`<rfg-date-range-picker .presets=${PRESETS} start="2026-10-20" end="2026-11-19"></rfg-date-range-picker>`,
};

export const WithCustomRange = {
  name: "Custom range selected",
  parameters: {
    docs: {
      description: {
        story: "The current range matches no preset, so the trigger shows the dates themselves.",
      },
    },
  },
  render: () =>
    html`<rfg-date-range-picker .presets=${PRESETS} start="2026-09-01" end="2026-09-15"></rfg-date-range-picker>`,
};
