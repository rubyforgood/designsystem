import { html } from "lit";
import "./disclosure.js";

export default {
  title: "Components/Disclosure",
  component: "rfg-disclosure",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A button that shows and hides a section of content in place.",
          "",
          "**When to use**",
          "- To tuck away secondary content, such as extra filters, that most people don't need every time.",
          "",
          "**When not to use**",
          "- To go to another page or place, use a link. A disclosure toggles content, it doesn't navigate.",
          "- To switch between views of equal weight, use Tabs.",
          "",
          "**Accessibility**",
          "- The trigger is a real `<button>` with `aria-expanded`, so it works with Enter and Space and announces whether it is open.",
          "- Give it a `label` that says what it controls, such as \"More filters\". The label stays the same when open or closed. Don't use \"Show\" and \"Hide\".",
          "- Don't put other buttons or links inside the trigger. Place them beside it.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#disclosures)",
        ].join("\n"),
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
