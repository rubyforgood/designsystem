import { html } from "lit";
import "./filter-bar.js";
import "./button.js";

const labelStyle = "display:block; font-family: var(--font-sans); font-size: 0.75rem; color: var(--color-neutral-500); margin-bottom:0.25rem;";
const fieldStyle = "width:100%; font-family: var(--font-sans); padding: 0.375rem;";

export default {
  title: "Components/Filter bar",
  render: () => html`
    <rfg-filter-bar>
      <div slot="fields">
        <label for="filter-bar-source" style=${labelStyle}>Source</label>
        <select id="filter-bar-source" style=${fieldStyle}>
          <option>All sources</option>
        </select>
      </div>
      <div slot="fields">
        <label for="filter-bar-range" style=${labelStyle}>Date range</label>
        <input id="filter-bar-range" type="text" style=${fieldStyle} value="Last 30 days" />
      </div>
      <rfg-button slot="actions" variant="secondary" size="sm">Export</rfg-button>
    </rfg-filter-bar>
  `,
};

export const TwoControlsShownInline = {};

export const FourControlsFold = {
  name: "Four controls (folds behind a disclosure)",
  render: () => html`
    <rfg-filter-bar>
      ${["Source", "Date range", "Status", "Storage location"].map(
        (label, i) => html`
          <div slot="fields">
            <label for="filter-bar-fold-${i}" style=${labelStyle}>${label}</label>
            <select id="filter-bar-fold-${i}" style=${fieldStyle}><option>All</option></select>
          </div>
        `,
      )}
    </rfg-filter-bar>
  `,
};
