import { html } from "lit";
import "./tag-input.js";

export default {
  title: "Components/Tag input",
  component: "rfg-tag-input",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A text field for entering a list of short, free-form values. Each value becomes a chip with its own remove button.",
          "",
          "**When to use**",
          "- People type their own values, such as tags or keywords, and there's no fixed list to choose from.",
          "",
          "**When not to use**",
          "- When people pick from a known list of options. Use Combobox instead.",
          "",
          "**Accessibility**",
          "- Enter, comma or Tab adds the typed value. Backspace in an empty field removes the last chip.",
          "- Duplicates are refused, ignoring case.",
          "- Each chip's remove button is named \"Remove\" plus the value, and is at least 24 by 24 pixels.",
          "- Give it a `label`. Use `hint` to say how to add a value. The hint is linked to the field.",
          "- It has no dropdown arrow, on purpose. It shouldn't look like a select.",
          "- It works inside a normal `<form>`. Set `name` and it submits like any other field.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#tag-input)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-tag-input
      label="Tags"
      hint="Type a tag and press Enter."
      .values=${["urgent", "follow-up"]}
      @rfg-change=${(e) => console.log("rfg-change", e.detail)}
    ></rfg-tag-input>
  `,
};

export const Default = {};

export const Empty = {
  render: () => html`<rfg-tag-input label="Tags" hint="Type a tag and press Enter."></rfg-tag-input>`,
};

export const InARealForm = {
  name: "Inside a form",
  parameters: {
    docs: {
      description: {
        story: "The values submit with the form under the field's `name`, as one comma-separated value.",
      },
    },
  },
  render: () => html`
    <form @submit=${(e) => { e.preventDefault(); console.log([...new FormData(e.target).entries()]); }}>
      <rfg-tag-input name="tags" label="Tags" .values=${["design"]}></rfg-tag-input>
      <button type="submit" style="margin-top: 0.75rem; font-family: var(--font-sans);">Submit</button>
    </form>
  `,
};
