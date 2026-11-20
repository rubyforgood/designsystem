import { html } from "lit";
import "./disclosure.js";

export default {
  title: "Components/Disclosure",
  component: "rfg-disclosure",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A real, focusable, toggleable `<button>` with real ARIA state — design.md's " +
          '"Disclosures" section — never a link with a fragment identifier pretending to ' +
          "navigate. The trigger's accessible name describes what it controls, never its " +
          'current action or state (`aria-expanded` already carries open/closed state ' +
          'programmatically) — there\'s deliberately no separate "open label"/"closed label" API.',
      },
    },
  },
  render: () => html`
    <rfg-disclosure label="More filters">
      <div style="font-family: var(--font-sans); font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-control);">
        <label><input type="checkbox" /> Include inactive</label>
        <label><input type="checkbox" /> Include archived</label>
      </div>
    </rfg-disclosure>
  `,
};

export const Default = {};

export const OpenByDefault = {
  name: "Open by default",
  render: () => html`
    <rfg-disclosure label="More filters" open>
      <div style="font-family: var(--font-sans); font-size: 0.875rem;">Panel content, visible on load.</div>
    </rfg-disclosure>
  `,
};
