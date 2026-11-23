import { html } from "lit";
import "./combobox.js";

export default {
  title: "Components/Combobox",
  component: "rfg-combobox",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A combobox is a dropdown you can type into to filter the options. Wrap a native `<select>` in it. The `<select>` still holds the value and submits with the form. Add `multiple` to the `<select>` to let people pick more than one option. Each choice then shows as a removable chip.",
          "",
          "**When to use**",
          "- For a long, fixed list of options, where typing to filter is faster than scrolling.",
          "- When people need to pick several options from that list.",
          "",
          "**When not to use**",
          "- For a short list of options, use a native `<select>` or radio buttons.",
          "- For free-text values people make up as they type, use Tag input.",
          "- For a list of actions, use Menu.",
          "",
          "**Accessibility**",
          "- Follows the WAI-ARIA combobox pattern. The text box has `role=\"combobox\"` and the list has `role=\"listbox\"`.",
          "- Focus stays in the text box while you type. Down Arrow and Up Arrow open the list and move through options. Enter picks the highlighted option. Escape closes the list.",
          "- With multiple selection, Backspace in an empty text box removes the last chip. Each chip's remove button has its own label, such as \"Remove Maya Chen\".",
          "- Give the combobox a `label`. It is shown above the box and names the list.",
          "- If the script never loads, the native `<select>` still works and submits.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#comboboxes)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-combobox label="Project">
      <select name="task[project_id]">
        <option value="1">Website redesign</option>
        <option value="2">Annual report</option>
        <option value="3">Volunteer onboarding</option>
        <option value="4">Spring newsletter</option>
      </select>
    </rfg-combobox>
  `,
};

export const SingleSelect = {};

export const SingleSelectPreSelected = {
  name: "With a value selected",
  render: () => html`
    <rfg-combobox label="Project">
      <select name="task[project_id]">
        <option value="1">Website redesign</option>
        <option value="2" selected>Annual report</option>
        <option value="3">Volunteer onboarding</option>
      </select>
    </rfg-combobox>
  `,
};

export const MultiSelect = {
  name: "Multiple selection",
  parameters: {
    docs: {
      description: {
        story: "Add `multiple` to the `<select>`. Each chosen option shows as a chip with its own remove button.",
      },
    },
  },
  render: () => html`
    <rfg-combobox label="Assignees">
      <select name="project[member_ids][]" multiple>
        <option value="1" selected>Maya Chen</option>
        <option value="2">Sam Rivera</option>
        <option value="3" selected>Priya Patel</option>
        <option value="4">Jordan Lee</option>
        <option value="5">Alex Kim</option>
      </select>
    </rfg-combobox>
  `,
};

export const LongList = {
  name: "Long list",
  parameters: {
    docs: {
      description: {
        story: "Type part of a name to narrow the list.",
      },
    },
  },
  render: () => html`
    <rfg-combobox label="Task">
      <select name="time_entry[task_id]">
        ${[
          "Draft homepage copy",
          "Review homepage design",
          "Update navigation",
          "Write annual report summary",
          "Collect annual report figures",
          "Design annual report cover",
          "Plan volunteer welcome session",
          "Write volunteer handbook",
          "Schedule volunteer training",
          "Draft spring newsletter",
          "Choose newsletter photos",
          "Send spring newsletter",
        ].map((name, i) => html`<option value=${i + 1}>${name}</option>`)}
      </select>
    </rfg-combobox>
  `,
};
