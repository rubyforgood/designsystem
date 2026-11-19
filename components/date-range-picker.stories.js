import { html } from "lit";
import "./date-range-picker.js";

const PRESETS = [
  { label: "Last 7 days", start: "2026-11-12", end: "2026-11-19" },
  { label: "Last 30 days", start: "2026-10-20", end: "2026-11-19" },
  { label: "This year", start: "2026-01-01", end: "2026-11-19" },
];

export default {
  title: "Components/Date range picker",
  render: () => html`
    <rfg-date-range-picker
      .presets=${PRESETS}
      @rfg-change=${(e) => console.log("rfg-change", e.detail)}
    ></rfg-date-range-picker>
  `,
};

export const Default = {};

export const WithRangeAlreadySelected = {
  name: "With a range already selected (matches a preset)",
  render: () =>
    html`<rfg-date-range-picker .presets=${PRESETS} start="2026-10-20" end="2026-11-19"></rfg-date-range-picker>`,
};

export const WithCustomRange = {
  name: "With a custom range (no matching preset)",
  render: () =>
    html`<rfg-date-range-picker .presets=${PRESETS} start="2026-09-01" end="2026-09-15"></rfg-date-range-picker>`,
};
