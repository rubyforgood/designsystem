import { html } from "lit";
import "./combobox.js";

export default {
  title: "Components/Combobox",
  component: "rfg-combobox",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A searchable, single- or multi-select dropdown wrapping a native " +
          "`<select>`/`<select multiple>` — the real control stays the thing that submits; this " +
          "only reflects and edits it. `multiple` on the wrapped `<select>` decides the mode, " +
          "the same attribute that already means that natively. Built to retire select2, still " +
          "depended on for exactly this need in 14 Human Essentials views. Keyboard focus stays " +
          "on the textbox throughout — `aria-activedescendant`, not real focus moving between " +
          "options, the WAI-ARIA combobox pattern's own reason: typing *while* navigating " +
          "results is the whole point.",
      },
    },
  },
  render: () => html`
    <rfg-combobox label="Storage location">
      <select name="donation[storage_location_id]">
        <option value="1">Omaha warehouse</option>
        <option value="2">Lincoln warehouse</option>
        <option value="3">Grand Island depot</option>
        <option value="4">Kearney satellite site</option>
      </select>
    </rfg-combobox>
  `,
};

export const SingleSelect = {};

export const SingleSelectPreSelected = {
  name: "Single-select, a value already chosen",
  render: () => html`
    <rfg-combobox label="Storage location">
      <select name="donation[storage_location_id]">
        <option value="1">Omaha warehouse</option>
        <option value="2" selected>Lincoln warehouse</option>
        <option value="3">Grand Island depot</option>
      </select>
    </rfg-combobox>
  `,
};

export const MultiSelect = {
  name: "Multi-select, with chips",
  render: () => html`
    <rfg-combobox label="Assignees">
      <select name="partner[user_ids][]" multiple>
        <option value="1" selected>Jamie Diaz</option>
        <option value="2">Sam Lee</option>
        <option value="3" selected>Morgan Patel</option>
        <option value="4">Avery Chen</option>
        <option value="5">Riley Johnson</option>
      </select>
    </rfg-combobox>
  `,
};

export const LongList = {
  name: "Long list (type to filter)",
  render: () => html`
    <rfg-combobox label="Item">
      <select name="line_item[item_id]">
        ${[
          "Diapers, size 1",
          "Diapers, size 2",
          "Diapers, size 3",
          "Diapers, size 4",
          "Diapers, size 5",
          "Diapers, size 6",
          "Wipes, unscented",
          "Wipes, scented",
          "Formula, standard",
          "Formula, sensitive",
          "Training pants, size 2T-3T",
          "Training pants, size 3T-4T",
        ].map((name, i) => html`<option value=${i + 1}>${name}</option>`)}
      </select>
    </rfg-combobox>
  `,
};
