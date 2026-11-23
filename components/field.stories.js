import { html } from "lit";
import "./field.js";

export default {
  title: "Components/Field",
  component: "rfg-field",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Wraps your own native form control (an `<input>`, `<select>` or `<textarea>`) with a label, a required or optional marker, and an error message.",
          "",
          "**When to use**",
          "- Around every form control that needs a visible label.",
          "- Mark fields `optional` as well as `required` when a form mixes both, so no field is left ambiguous.",
          "",
          "**When not to use**",
          "- To list every error at the top of a form, use Error summary as well. It doesn't replace the message at each field.",
          "",
          "**Accessibility**",
          "- The label is connected to the control. The control gets an id if it doesn't have one.",
          "- `aria-required`, `aria-invalid` and `aria-describedby` are set on the control for you, so the required state and the error message are announced.",
          "- The required marker is shown visually and set programmatically, never only one of the two.",
          "- You provide the native control as the child, and an error message that says what to fix.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#forms-required-fields-and-validation-errors)",
        ].join("\n"),
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
  args: { label: "Project name", required: false, optional: false, error: "" },
};

export const Default = {};
export const Required = { args: { required: true } };
export const Optional = { args: { optional: true } };

export const WithError = {
  name: "With an error",
  args: { required: true, error: "Project name can't be blank" },
};

export const WithSelectControl = {
  name: "With a select",
  render: () => html`
    <rfg-field label="Office" required>
      <select>
        <option>Main office</option>
        <option>Remote</option>
      </select>
    </rfg-field>
  `,
};

export const MixedRequiredAndOptional = {
  name: "Required and optional together",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 20rem;">
      <rfg-field label="Project name" required><input type="text" /></rfg-field>
      <rfg-field label="Notes" optional><input type="text" /></rfg-field>
    </div>
  `,
};
