import { html } from "lit";
import "./modal.js";
import "./button.js";

function openModal(e) {
  const root = e.target.getRootNode();
  root.querySelector("rfg-modal")?.show();
}

export default {
  title: "Components/Modal",
  component: "rfg-modal",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A dialog that sits on top of the page and holds the person's attention until they finish or dismiss it. Built on the browser's native `<dialog>` element.",
          "",
          "**When to use**",
          "- A short, focused task that has to be finished or cancelled before going back to the page, such as importing a file or confirming a destructive action.",
          "",
          "**When not to use**",
          "- For a menu or filter panel that should stay in context with the page. Use Popover instead.",
          "- For a message about the page's state. Use Callout instead.",
          "- For a one-time confirmation after an action. Use Flash message instead.",
          "",
          "**Accessibility**",
          "- Focus moves into the modal and stays there while it's open. The rest of the page is inert.",
          "- Escape, the Close button and a click on the backdrop all close it.",
          "- The `heading` labels the dialog for assistive tech. Always set one.",
          "- A long body scrolls on its own and can be reached by keyboard.",
          "- Open and close it with `.show()` and `.close()`. It fires `rfg-close` when it closes.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#modals)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-button variant="primary" @click=${openModal}>Import CSV</rfg-button>
    <rfg-modal heading="Import team members">
      <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0 0 0.75rem;">
        Upload a CSV file of team members. Each row adds one person to the Northwind workspace.
      </p>
      <rfg-button slot="footer" variant="secondary" size="sm" @click=${(e) => e.target.closest("rfg-modal").close()}>
        Cancel
      </rfg-button>
      <rfg-button slot="footer" variant="primary" size="sm" @click=${(e) => e.target.closest("rfg-modal").close()}>
        Import
      </rfg-button>
    </rfg-modal>
  `,
};

export const Default = {};

export const NoFooter = {
  name: "Without footer actions",
  parameters: {
    docs: {
      description: {
        story: "When the `footer` slot is empty, no footer renders. The Close button and Escape still close the modal.",
      },
    },
  },
  render: () => html`
    <rfg-button variant="primary" @click=${openModal}>Open modal</rfg-button>
    <rfg-modal heading="Keyboard shortcuts">
      <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">Press N to create a new project.</p>
    </rfg-modal>
  `,
};
