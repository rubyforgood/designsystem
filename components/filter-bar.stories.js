import { html } from "lit";
import "./filter-bar.js";
import "./button.js";

const labelStyle = "display:block; font-family: var(--font-sans); font-size: 0.75rem; color: var(--color-neutral-500); margin-bottom:0.25rem;";
const fieldStyle = "width:100%; box-sizing:border-box; min-height:2.5rem; font-family: var(--font-sans); padding: 0 0.5rem; border:1px solid var(--color-neutral-500); border-radius: var(--radius-control); background:#fff;";

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
          "- Up to two controls are shown in a row. With three or more, they fold behind a \"Filters\" disclosure, which starts open when any of them is already set, so a filtered list never looks like the whole list.",
          "- Put a search box in the `search` slot: it stays visible, first in the row, and never folds. A filter people change on most visits (which provider, which team) can go there too, beside the search box.",
          "- Put Sort, and anything else that changes how the list is shown rather than what's in it, in the `end` slot. It isn't a filter: it never folds, and Clear filters leaves it alone.",
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
        <select id="filter-bar-source" name="owner" style=${fieldStyle}>
          <option>All owners</option>
        </select>
      </div>
      <div slot="fields">
        <label for="filter-bar-range" style=${labelStyle}>Date range</label>
        <input id="filter-bar-range" name="range" type="text" style=${fieldStyle} value="Last 30 days" />
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
            <select id="filter-bar-fold-${i}" name=${label.toLowerCase().replace(" ", "_")} style=${fieldStyle}><option>All</option></select>
          </div>
        `,
      )}
    </rfg-filter-bar>
  `,
};

const filterFields = (selected = {}) =>
  [
    ["Language", ["Any language", "English", "Spanish"]],
    ["Year published", ["Any year", "2026", "2025"]],
    ["State", ["Any state", "Active", "Archived"]],
    ["Tags", ["Any tag", "Hygiene", "Nutrition"]],
  ].map(
    ([label, options], i) => html`
      <div slot="fields">
        <label for="filter-bar-s-${label}" style=${labelStyle}>${label}</label>
        <select id="filter-bar-s-${label}" name=${label.toLowerCase().replace(" ", "_")} style=${fieldStyle}>
          ${options.map((o) => html`<option ?selected=${selected[label] === o}>${o}</option>`)}
        </select>
      </div>
    `,
  );

const searchField = (value = "") => html`
  <div slot="search">
    <label for="filter-bar-q" style=${labelStyle}>Search</label>
    <input id="filter-bar-q" name="query" type="search" style=${fieldStyle} .value=${value} placeholder="Title or description" />
  </div>
`;

export const SearchWithFoldedFilters = {
  name: "Search, with filters folded",
  parameters: {
    docs: { description: { story: "A search box in the `search` slot stays visible. The four filters fold behind \"Filters\", which opens its panel on a full-width line below the row." } },
  },
  render: () => html`
    <rfg-filter-bar>
      ${searchField()} ${filterFields()}
      <rfg-button slot="actions" variant="ghost">Clear filters</rfg-button>
    </rfg-filter-bar>
  `,
};

export const AFilterIsSet = {
  name: "A filter is set, so they start open",
  parameters: {
    docs: { description: { story: "\"State\" is set to Archived, so the folded filters start open: someone looking at the list can see it's filtered." } },
  },
  render: () => html`
    <rfg-filter-bar>
      ${searchField()} ${filterFields({ State: "Archived" })}
      <rfg-button slot="actions" variant="ghost">Clear filters</rfg-button>
    </rfg-filter-bar>
  `,
};

const selectField = (slot, id, label, options) => html`
  <div slot=${slot}>
    <label for=${id} style=${labelStyle}>${label}</label>
    <select id=${id} name=${id} style=${fieldStyle}>${options.map((o) => html`<option>${o}</option>`)}</select>
  </div>
`;

export const LeadFilterAndSort = {
  name: "A lead filter beside search, with sort at the end",
  parameters: {
    docs: {
      description: {
        story:
          "Provider is changed on most visits, so it stays visible beside Search instead of folding. Sort sits at the far end: it changes the order, not what's listed, so it isn't one of the filters. Opening \"Filters\" leaves the row where it is and opens the panel below it, from the left edge.",
      },
    },
  },
  render: () => html`
    <rfg-filter-bar>
      ${selectField("search", "provider", "Provider", ["All providers", "Ministry of Health", "Community health clinic"])}
      ${searchField()} ${filterFields()}
      <rfg-button slot="actions" variant="ghost">Clear filters</rfg-button>
      ${selectField("end", "order", "Sort", ["Newest first", "Oldest first"])}
    </rfg-filter-bar>
  `,
};
