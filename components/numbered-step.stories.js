import { html } from "lit";
import "./numbered-step.js";

export default {
  title: "Components/Numbered step",
  component: "rfg-numbered-step",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A visual step number disc beside an ordered-list item — design.md's \"Numbered " +
          'steps" section. The number is decorative and hidden from assistive tech, because the ' +
          "position is already carried by the list's own `<ol>` semantics — showing it to AT " +
          "too would announce the position twice. The host wraps instances in a real `<ol>`; " +
          "this element renders as a flex row meant to sit inside an `<li>`, not as the `<li>` " +
          "itself.",
      },
    },
  },
  render: () => html`
    <ol style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1rem;">
      <li><rfg-numbered-step number="1">Choose a storage location.</rfg-numbered-step></li>
      <li><rfg-numbered-step number="2">Scan or enter each item.</rfg-numbered-step></li>
      <li><rfg-numbered-step number="3">Confirm quantities and save.</rfg-numbered-step></li>
    </ol>
  `,
};

export const Default = {};
