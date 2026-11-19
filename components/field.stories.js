import { html } from "lit";
import "./field.js";

export default {
  title: "Components/Field",
  render: (args) => html`
    <rfg-field label=${args.label} ?required=${args.required} ?optional=${args.optional} error=${args.error || undefined}>
      <input type="text" />
    </rfg-field>
  `,
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    optional: { control: "boolean" },
    error: { control: "text" },
  },
  args: { label: "Source", required: false, optional: false, error: "" },
};

export const Default = {};
export const Required = { args: { required: true } };
export const Optional = { args: { optional: true } };

export const WithError = {
  name: "With a validation error",
  args: { required: true, error: "Source can't be blank" },
};

export const WithSelectControl = {
  name: "Wrapping a <select>",
  render: () => html`
    <rfg-field label="Storage location" required>
      <select>
        <option>Main warehouse</option>
        <option>Overflow unit</option>
      </select>
    </rfg-field>
  `,
};

export const MixedRequiredAndOptional = {
  name: "Mixed required/optional (both marked)",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 20rem;">
      <rfg-field label="Source" required><input type="text" /></rfg-field>
      <rfg-field label="Notes" optional><input type="text" /></rfg-field>
    </div>
  `,
};
