import { html } from "lit";
import "./tag-input.js";

export default {
  title: "Components/Tag input",
  render: () => html`
    <rfg-tag-input
      label="Custom request units"
      hint="Type a unit and press Enter."
      .values=${["Pack", "Box"]}
      @rfg-change=${(e) => console.log("rfg-change", e.detail)}
    ></rfg-tag-input>
  `,
};

export const Default = {};

export const Empty = {
  render: () => html`<rfg-tag-input label="Custom request units" hint="Type a unit and press Enter."></rfg-tag-input>`,
};

export const InARealForm = {
  name: "Inside a real <form> (form-associated)",
  render: () => html`
    <form @submit=${(e) => { e.preventDefault(); console.log([...new FormData(e.target).entries()]); }}>
      <rfg-tag-input name="request_unit_names" label="Custom request units" .values=${["Pack"]}></rfg-tag-input>
      <button type="submit" style="margin-top: 0.75rem; font-family: var(--font-sans);">Submit</button>
    </form>
  `,
};
