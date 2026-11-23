import { html } from "lit";
import "./conditional-reveal.js";

function onToggle(e) {
  const reveal = e.target.closest("div").querySelector("rfg-conditional-reveal");
  reveal.shown = e.target.value === "shipped";
}

export default {
  title: "Components/Conditional reveal",
  component: "rfg-conditional-reveal",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Shows an extra field only when the person picks the answer that needs it. The field appears directly below the option that revealed it, with a rule and an indent tying the two together.",
          "",
          "**When to use**",
          "- A follow-up question applies to exactly one answer in a set. For example, a shipping cost that only matters when the person chooses Shipped.",
          "",
          "**When not to use**",
          "- To hide optional content anyone might want to open. Use Disclosure instead.",
          "- To place the extra field beside the options in a second column. Keep it below, in reading order.",
          "",
          "**Accessibility**",
          "- The revealed field sits right after its trigger in the page order, so keyboard focus reaches it next.",
          "- The component doesn't add ARIA to your trigger. `aria-expanded` isn't valid on a radio button, and page order is what tells assistive tech about the new field.",
          "- You wire your own trigger (a radio, checkbox or select) to the `shown` property.",
          "- If the page loads with the answer already chosen, set `shown` in the markup so the field renders visible straight away.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#conditional-reveal)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <div style="font-family: var(--font-sans); font-size: 0.875rem; max-width: 18rem;">
      <fieldset style="border: none; padding: 0; margin: 0;">
        <legend style="font-weight: 500; margin-bottom: 0.5rem;">Delivery method</legend>
        <label style="display: block; margin-bottom: 0.25rem;">
          <input type="radio" name="delivery" value="pickup" checked @change=${onToggle} /> Pick up
        </label>
        <label style="display: block;">
          <input type="radio" name="delivery" value="shipped" @change=${onToggle} /> Shipped
        </label>
        <rfg-conditional-reveal>
          <label style="display: block; margin-top: 0.5rem;">
            Shipping cost
            <input type="text" style="display: block; margin-top: 0.25rem; width: 100%;" />
          </label>
        </rfg-conditional-reveal>
      </fieldset>
    </div>
  `,
};

export const Default = {};

export const ShownInitially = {
  name: "Shown on load",
  parameters: {
    docs: {
      description: {
        story: "Set the `shown` attribute when the page loads with the revealing answer already chosen, so the field is visible from the first render.",
      },
    },
  },
  render: () => html`
    <rfg-conditional-reveal shown>
      <div style="font-family: var(--font-sans); font-size: 0.875rem;">This field is visible as soon as the page loads.</div>
    </rfg-conditional-reveal>
  `,
};
