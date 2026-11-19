import { html } from "lit";
import "./error-summary.js";

export default {
  title: "Components/Error summary",
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
