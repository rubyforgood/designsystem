import { html } from "lit";
import "./numbered-step.js";

export default {
  title: "Components/Numbered step",
  render: () => html`
    <ol style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1rem;">
      <li><rfg-numbered-step number="1">Choose a storage location.</rfg-numbered-step></li>
      <li><rfg-numbered-step number="2">Scan or enter each item.</rfg-numbered-step></li>
      <li><rfg-numbered-step number="3">Confirm quantities and save.</rfg-numbered-step></li>
    </ol>
  `,
};

export const Default = {};
