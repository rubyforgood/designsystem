import { html } from "lit";
import "./modal.js";
import "./button.js";

function openModal(e) {
  const root = e.target.getRootNode();
  root.querySelector("rfg-modal")?.show();
}

export default {
  title: "Components/Modal",
  render: () => html`
    <rfg-button variant="primary" @click=${openModal}>Import CSV</rfg-button>
    <rfg-modal heading="Import vendors">
      <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0 0 0.75rem;">
        Upload a CSV of vendors to import. Escape closes this, focus trap and backdrop-click-to-close
        are native &lt;dialog&gt; behavior, not reimplemented here.
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
  name: "No footer actions",
  render: () => html`
    <rfg-button variant="primary" @click=${openModal}>Open modal</rfg-button>
    <rfg-modal heading="Just a message">
      <p style="font-family: var(--font-sans); font-size: 0.875rem; margin: 0;">No footer slot content, so no footer renders.</p>
    </rfg-modal>
  `,
};
