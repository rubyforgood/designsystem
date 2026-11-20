import { html } from "lit";
import "./field.js";

export default {
  title: "Components/Field",
  component: "rfg-field",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Wraps a host-provided native control (an `<input>`, `<select>`, `<textarea>` — " +
          "anything) with the label/required-marker/error conventions around it — design.md's " +
          '"Forms: required fields and validation errors" section. The control gets an id ' +
          "(generated if it doesn't have one) and `aria-required`/`aria-invalid`/" +
          "`aria-describedby` proxied onto it. Renders into light DOM, not a shadow root: a " +
          'shadow-rendered `<label for="...">` cannot label a light-DOM `<input id="...">`.',
      },
    },
  },
  render: (args) => html`
    <rfg-field label=${args.label} ?required=${args.required} ?optional=${args.optional} error=${args.error || undefined}>
      <input type="text" />
    </rfg-field>
  `,
  argTypes: {
    label: { control: "text" },
    required: {
      control: "boolean",
      description: "Adds the required marker and `aria-required` on the wrapped control.",
    },
    optional: {
      control: "boolean",
      description: "Marks the field optional instead — for forms where most fields are required and marking every one would be noise.",
    },
    error: {
      control: "text",
      description: "Validation error text, associated to the control via `aria-describedby` and `aria-invalid`.",
    },
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
