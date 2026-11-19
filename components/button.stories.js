import { html } from "lit";
import "./button.js";

// One story file per component, covering every documented variant/state — see design.md's
// Buttons and "Where a button goes" sections, and components/README.md. This is the "preview
// before building, as a rendered page" surface the design-system-migration skill already asks
// for, made durable instead of ad hoc.

export default {
  title: "Components/Button",
  render: (args) =>
    html`
      <rfg-button
        variant=${args.variant}
        size=${args.size}
        ?disabled=${args.disabled}
        href=${args.href || undefined}
        reason=${args.reason || undefined}
      >
        ${args.label}
      </rfg-button>
    `,
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "danger", "ghost"] },
    size: { control: "select", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    href: { control: "text" },
    reason: { control: "text" },
    label: { control: "text" },
  },
  args: { variant: "primary", size: "md", disabled: false, label: "Button" },
};

// --- Variant axis — what the action means ---

export const Primary = {};
export const Secondary = { args: { variant: "secondary" } };
export const Danger = { args: { variant: "danger" }, name: "Danger" };
export const Ghost = { args: { variant: "ghost" } };

// --- Size axis — independent of variant ---

export const Small = { args: { size: "sm" } };

// --- Button mode: native disabled ---

export const DisabledButton = {
  args: { disabled: true, label: "Disabled button" },
  name: "Disabled (button mode)",
};

// --- Link mode: plain, and "inert on arrival" ---

export const Link = {
  args: { href: "#somewhere", variant: "secondary", label: "Link button" },
};

export const DisabledLink = {
  args: {
    href: "#somewhere",
    variant: "secondary",
    disabled: true,
    reason: "Not available right now",
    label: "Disabled link",
  },
  name: 'Disabled (link mode — "inert on arrival")',
  parameters: {
    docs: {
      description: {
        story:
          "A real `<a>` has no native disabled state, so a link that costs something to press " +
          "renders a focusable `aria-disabled` control with the reason as visually-hidden text, " +
          "instead of disappearing from the tab order. See design.md's Accessibility section.",
      },
    },
  },
};

// --- Icon usage ---

export const WithIcon = {
  render: () =>
    html`
      <rfg-button variant="primary">
        <svg slot="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 2a.75.75 0 0 1 .75.75V7.25H13a.75.75 0 0 1 0 1.5H8.75v4.5a.75.75 0 0 1-1.5 0v-4.5H3a.75.75 0 0 1 0-1.5h4.25V2.75A.75.75 0 0 1 8 2Z" />
        </svg>
        New donation
      </rfg-button>
    `,
};

export const IconOnlyWithLabel = {
  name: "Icon-only (with aria-label)",
  render: () =>
    html`
      <rfg-button variant="ghost" aria-label="Close">
        <svg slot="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </rfg-button>
    `,
};
