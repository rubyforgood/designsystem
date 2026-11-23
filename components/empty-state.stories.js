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
        component: [
          "A message shown in place of an empty list or table, saying why it's empty and what to do next.",
          "",
          "**When to use**",
          "- Any list that can be empty. Never show bare table headers with nothing under them.",
          "- Set `kind` to match the cause, because each one needs a different next step:",
          "  - `cold-start`: nothing exists yet. Offer to create the first item.",
          "  - `no-results`: a filter matched nothing. Offer to clear the filter.",
          "  - `all-clear`: there's nothing to do. Reassure, with no action.",
          "",
          "**When not to use**",
          "- For a list that can never be empty. Don't build a state that can't happen.",
          "- For an error or a warning. Use Callout instead.",
          "",
          "**Accessibility**",
          "- Put actions in the default slot as real buttons or links.",
          "- Leave the action out if the same button is already visible nearby, such as in a card footer.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#empty-states)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-empty-state kind="no-results" heading="No projects found" body="Nothing matched these filters.">
      <rfg-button variant="secondary" size="sm">Clear filters</rfg-button>
    </rfg-empty-state>
  `,
};

export const NoResults = {};

export const ColdStart = {
  name: "Nothing created yet",
  render: () => html`
    <rfg-empty-state kind="cold-start" heading="No projects yet" body="Create your first project to get started.">
      <rfg-button variant="primary" size="sm">New project</rfg-button>
    </rfg-empty-state>
  `,
};

export const AllClear = {
  name: "All clear",
  parameters: {
    docs: {
      description: {
        story: "Nothing needs doing, so the message reassures and offers no action.",
      },
    },
  },
  render: () => html`
    <rfg-empty-state kind="all-clear" heading="All tasks complete" body="There is nothing waiting on you right now."></rfg-empty-state>
  `,
};
