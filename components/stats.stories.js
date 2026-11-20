import { html } from "lit";
import "./stats.js";

const FIGURES_2 = [
  { label: "Items distributed this month", value: "1,284" },
  { label: "Scheduled for future distribution", value: "310" },
];
const FIGURES_4 = [
  { label: "Donations", value: "1,284" },
  { label: "Purchases", value: "412" },
  { label: "Distributions", value: "908" },
  { label: "Transfers", value: "56" },
];

export default {
  title: "Components/Stats",
  component: "rfg-stats",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A figure/label pair as a real description list relationship (`<dt>`/`<dd>`) — " +
          'design.md\'s "Stats" section — never a generic `<div>` pair or a heading on the ' +
          "value (a statistic is data, not a section name). The summary band reads as one " +
          "band, not N separate cards: no filled box around each figure, and separators are a " +
          "`gap-px` grid showing the backdrop through, which `divide-x` alone can't do across " +
          "multiple rows.",
      },
    },
  },
  render: () => html`<rfg-stats heading="Totals" subtitle="13 donations, from June 19, 2026 to September 19, 2026" .figures=${FIGURES_2}></rfg-stats>`,
};

export const TwoFigures = {};

export const FourFigures = {
  render: () => html`<rfg-stats heading="Totals" .figures=${FIGURES_4}></rfg-stats>`,
};

export const NoTitle = {
  name: "No heading/subtitle",
  render: () => html`<rfg-stats .figures=${FIGURES_2}></rfg-stats>`,
};
