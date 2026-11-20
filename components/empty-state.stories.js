import { html } from "lit";
import "./empty-state.js";
import "./button.js";

export default {
  title: "Components/Empty state",
  component: "rfg-empty-state",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Never a bare empty collection (table headers and nothing else) — design.md's " +
          '"Empty states" section. Distinguishes the actual *cause* of emptiness and messages ' +
          'each deliberately, since one generic "no results" conflates three situations that ' +
          '`kind` (`cold-start`/`no-results`/`all-clear`) calls for three different next steps.',
      },
    },
  },
  render: () => html`
    <rfg-empty-state kind="no-results" heading="No donations found" body="Nothing matched these filters.">
      <rfg-button variant="secondary" size="sm">Clear filters</rfg-button>
    </rfg-empty-state>
  `,
};

export const NoResults = {};

export const ColdStart = {
  name: "Cold start (nothing exists yet)",
  render: () => html`
    <rfg-empty-state kind="cold-start" heading="No donations yet" body="Record your first donation to get started.">
      <rfg-button variant="primary" size="sm">New donation</rfg-button>
    </rfg-empty-state>
  `,
};

export const AllClear = {
  name: "All clear (reassurance, no action)",
  render: () => html`
    <rfg-empty-state kind="all-clear" heading="All requests fulfilled" body="There is nothing waiting on you right now."></rfg-empty-state>
  `,
};
