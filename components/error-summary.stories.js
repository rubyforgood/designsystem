import { html } from "lit";
import "./error-summary.js";

export default {
  title: "Components/Error summary",
  component: "rfg-error-summary",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Sits above a form, `role="alert"`, naming every failing field in one place — ' +
          "design.md's `essentials_error_summary`. Deliberately not GOV.UK's linked-error-" +
          "summary pattern (each message a link to its field); the functional benefit is " +
          "preserved another way instead — every message is also duplicated at its own field " +
          "via `<rfg-field>`'s `aria-describedby`.",
      },
    },
  },
  render: () => html`
    <rfg-error-summary heading="There is a problem">
      <ul>
        <li>Source can't be blank</li>
        <li>Date received can't be blank</li>
      </ul>
    </rfg-error-summary>
  `,
};

export const Default = {};

export const SingleError = {
  render: () => html`
    <rfg-error-summary>
      <ul>
        <li>Quantity must be greater than 0</li>
      </ul>
    </rfg-error-summary>
  `,
};
