import { html } from "lit";
import "./numbered-step.js";

export default {
  title: "Components/Numbered step",
  component: "rfg-numbered-step",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A numbered step shows a step number in a circle beside the step's text. Use it inside an ordered list to walk people through a short task in order.",
          "",
          "**When to use**",
          "- For instructions that must be followed in order, such as setting up a project.",
          "",
          "**When not to use**",
          "- When order doesn't matter, use a plain bulleted list.",
          "- To show a person's initials in a circle, use Avatar. It looks similar but means something different.",
          "",
          "**Accessibility**",
          "- The number in the circle is hidden from screen readers. The list already announces each step's position, so showing it twice would repeat it.",
          "- You provide the list. Wrap steps in a real `<ol>`, with each `<rfg-numbered-step>` inside an `<li>`.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#numbered-steps)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <ol style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1rem;">
      <li><rfg-numbered-step number="1">Create a project.</rfg-numbered-step></li>
      <li><rfg-numbered-step number="2">Invite team members.</rfg-numbered-step></li>
      <li><rfg-numbered-step number="3">Set a due date and save.</rfg-numbered-step></li>
    </ol>
  `,
};

export const Default = {};
