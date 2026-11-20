import { html } from "lit";
import "./button.js";

// One story file per component, covering every documented variant/state — see design.md's
// Buttons and "Where a button goes" sections, and components/README.md. This is the "preview
// before building, as a rendered page" surface the design-system-migration skill already asks
// for, made durable instead of ad hoc.

export default {
  title: "Components/Button",
  component: "rfg-button",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Implements design.md's \"Buttons\" and \"Where a button goes\" sections (variant × " +
          "size as two independent axes, never decided fresh per button) and the \"inert on " +
          "arrival\" accessibility rule from the Accessibility section. Renders into light DOM " +
          "— not a shadow root — found necessary while dogfooding this component on Human " +
          "Essentials (ADR 14): a shadow-rendered `<button type=\"submit\">` doesn't participate " +
          "in an ancestor `<form>`'s submission, a tag/attribute-CSS-selector progressive-" +
          "enhancement library (rails-ujs) can never match the custom element, and Capybara's " +
          "default finders can't see into a shadow root at all.",
      },
    },
  },
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
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "ghost"],
      description: "What the action means — not decided per-button. See design.md's Buttons table.",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "What context the button appears in: `sm` inside a table row or dense toolbar, `md` for page/section actions.",
    },
    disabled: {
      control: "boolean",
      description:
        "Native `disabled` in button mode. In link mode (`href` set), renders \"inert on arrival\" instead — a focusable `aria-disabled` control, since a real `<a>` has no native disabled state.",
    },
    href: {
      control: "text",
      description: "Switches the component to link mode: a real `<a>`, for navigation (a GET), never a state-changing action.",
    },
    reason: {
      control: "text",
      description: "Visually-hidden text explaining why a disabled link is unavailable — only meaningful alongside `href` and `disabled`.",
    },
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
