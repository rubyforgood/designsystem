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
        component:
          "Reveals a field that only applies to one answer in a set, directly below/after the " +
          "control that reveals it (DOM order, so keyboard focus reaches it next) — design.md's " +
          '"conditional reveal" mechanism. Deliberately doesn\'t touch the trigger\'s own ARIA at ' +
          "all (a radio, checkbox and select option each have different valid states); the host " +
          "wires its own trigger to this element's `shown` property, and `shown` is read " +
          "directly on first render rather than defaulted hidden-then-corrected after mount.",
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
  name: "Shown initially (server-rendered state)",
  render: () => html`
    <rfg-conditional-reveal shown>
      <div style="font-family: var(--font-sans); font-size: 0.875rem;">Revealed on first render, no flash.</div>
    </rfg-conditional-reveal>
  `,
};
