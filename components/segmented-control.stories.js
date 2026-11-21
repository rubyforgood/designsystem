import { html } from "lit";
import "./segmented-control.js";

export default {
  title: "Components/Segmented control",
  component: "rfg-segmented-control",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A connected row of real buttons that switch between a few views without " +
          "navigating — ported from a real, in-production Human Essentials pattern " +
          "(`/distributions/schedule`'s calendar range/layout switches), not designed from " +
          "scratch. `role=\"group\"` with independently-focusable `aria-pressed` buttons, not " +
          "`role=\"radiogroup\"`: this toggles a state rather than submits a value, the " +
          "reference implementation's own reasoning. Dispatches `rfg-change`; the host decides " +
          "what the choice means — a URL parameter in the reference's own case, so the view " +
          "stays bookmarkable and answers \"why does mine look different from yours\", the " +
          "same argument design.md already settled for page tabs.",
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
  name: "No value set (defaults to the first segment)",
  render: () => html`
    <rfg-segmented-control label="Calendar range">
      <button type="button" value="month">Month</button>
      <button type="button" value="week">Week</button>
    </rfg-segmented-control>
  `,
};
