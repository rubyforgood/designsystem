import { html } from "lit";
import "./popover.js";
import "./button.js";

export default {
  title: "Components/Popover",
  render: () => html`
    <rfg-popover label="Filter options">
      <rfg-button slot="trigger" variant="secondary" size="sm">Filter</rfg-button>
      <div style="font-family: var(--font-sans); font-size: 0.875rem; min-width: 12rem;">
        <p style="margin: 0 0 0.5rem; font-weight: 600;">Filter by status</p>
        <label style="display: block; margin-bottom: 0.25rem;"><input type="checkbox" /> Open</label>
        <label style="display: block;"><input type="checkbox" /> Closed</label>
      </div>
    </rfg-popover>
  `,
};

export const Default = {};

export const NearViewportEdge = {
  name: "Near the right edge (flip/shift)",
  render: () => html`
    <div style="display: flex; justify-content: flex-end; padding-right: 1rem;">
      <rfg-popover label="Account menu" placement="bottom-end">
        <rfg-button slot="trigger" variant="secondary" size="sm">Account</rfg-button>
        <div style="font-family: var(--font-sans); font-size: 0.875rem; min-width: 10rem;">
          Jamie Diaz<br />jamie@example.org
        </div>
      </rfg-popover>
    </div>
  `,
};
