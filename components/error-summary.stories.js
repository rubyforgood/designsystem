import { html } from "lit";
import "./error-summary.js";

export default {
  title: "Components/Error summary",
  component: "rfg-error-summary",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A box at the top of a form that lists every field that failed validation, in one place.",
          "",
          "**When to use**",
          "- Above a form, after a submission fails validation.",
          "- Together with Field, which shows each message again next to its own field.",
          "",
          "**When not to use**",
          "- For a single field's error on its own, use Field's `error`.",
          "- For a one-time result of an action that isn't a form error, use Flash message.",
          "",
          "**Accessibility**",
          "- It has `role=\"alert\"`, so it is announced when it appears.",
          "- Messages are plain text, not links. Each one is also shown at its own field and connected to it with `aria-describedby`.",
          "- You provide the messages as a list (`<ul>` of `<li>`). Write each one so it names the field and says what to fix.",
          "- If a failed submit reloads the whole page, move keyboard focus to the summary yourself (give it `tabindex=\"-1\"` and call `focus()`).",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#forms-required-fields-and-validation-errors)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-error-summary heading="There is a problem">
      <ul>
        <li>Project name can't be blank</li>
        <li>Due date can't be blank</li>
      </ul>
    </rfg-error-summary>
  `,
};

export const Default = {};

export const SingleError = {
  name: "Single error",
  render: () => html`
    <rfg-error-summary>
      <ul>
        <li>Budget must be greater than 0</li>
      </ul>
    </rfg-error-summary>
  `,
};
