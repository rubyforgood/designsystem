import { html } from "lit";
import "./filter-bar.js";
import "./button.js";

const labelStyle = "display:block; font-family: var(--font-sans); font-size: 0.75rem; color: var(--color-neutral-500); margin-bottom:0.25rem;";
const fieldStyle = "width:100%; font-family: var(--font-sans); padding: 0.375rem;";

export default {
  title: "Components/Filter bar",
  component: "rfg-filter-bar",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A row of filter controls above a list or table, with room for actions such as Export at the end.",
          "",
          "**When to use**",
          "- To narrow down a list or table.",
          "- Up to two controls are shown in a row. With three or more, they fold behind a \"Filters\" disclosure.",
          "- Submit filters with a GET request (set `action`), so every filtered view has a URL people can share, bookmark and return to with the Back button.",
          "",
          "**When not to use**",
          "- Don't wrap it in a Card when it sits directly above the table it filters. Use a card only when the filters are a section in their own right.",
          "- Don't keep filter state only in the page or send it as a POST. It breaks sharing and the Back button.",
          "",
          "**Accessibility**",
          "- Give every control a visible `<label>`.",
          "- When folded, the controls sit behind a Disclosure button, which announces whether it is open.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#filter-bar)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-filter-bar>
      <div slot="fields">
        <label for="filter-bar-source" style=${labelStyle}>Owner</label>
        <select id="filter-bar-source" style=${fieldStyle}>
          <option>All owners</option>
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

export const TwoControlsShownInline = { name: "Two controls, shown in a row" };

export const FourControlsFold = {
  name: "Four controls, folded",
  parameters: {
    docs: { description: { story: "With more than two controls, they fold behind a \"Filters\" disclosure." } },
  },
  render: () => html`
    <rfg-filter-bar>
      ${["Owner", "Date range", "Status", "Team"].map(
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
