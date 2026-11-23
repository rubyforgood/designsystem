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
        component: [
          "Buttons trigger an action or navigate. Every button picks a variant (what the action means) and a size (where it sits). The two are chosen separately, never per button.",
          "",
          "**When to use**",
          "- `primary` for the one action a page is for. Use it once per page or section.",
          "- `secondary` for every other action.",
          "- `danger` for an action that deletes or rejects something. `ghost_danger` for a repeated destructive action, such as one per table row, that shouldn't stand out at rest.",
          "- `ghost` for row and toolbar actions.",
          "- Set `href` when the button goes somewhere. It then renders a real link.",
          "",
          "**When not to use**",
          "- Don't use a link (`href`) for anything that changes data. Use a button inside a form.",
          "- For a link inside running text, use a plain `<a>`.",
          "- For a list of actions on one row, use Menu instead of a row of buttons.",
          "",
          "**Accessibility**",
          "- Renders a native `<button>` or `<a>`, so Enter and Space (buttons) and Enter (links) work as usual.",
          "- `disabled` on a button removes it from the tab order. `disabled` on a link keeps it focusable with `aria-disabled=\"true\"`, and reads out the `reason` you give.",
          "- Give an icon-only button an `aria-label`. The component warns in the console if a button has no accessible name.",
          "- Icons in the `icon` slot are hidden from assistive tech automatically.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#buttons)",
        ].join("\n"),
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
      options: ["primary", "secondary", "danger", "ghost", "ghost_danger"],
      description: "What the action means.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "xs"],
      description: "What context the button appears in: `sm` inside a table row or dense toolbar, `md` for page/section actions, `xs` for a fixed-size icon-only control.",
    },
    disabled: {
      control: "boolean",
      description:
        "Native `disabled` on a button. On a link (`href` set), the link stays focusable with `aria-disabled`, because a real `<a>` has no disabled state.",
    },
    href: {
      control: "text",
      description: "Renders a real `<a>` instead of a button. Use it for navigation only, never for an action that changes data.",
    },
    reason: {
      control: "text",
      description: "Why a disabled link is unavailable. Read by screen readers. Only used with `href` and `disabled`.",
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
export const GhostDanger = {
  args: { variant: "ghost_danger", label: "Remove" },
  name: "Ghost danger",
  parameters: {
    docs: {
      description: {
        story:
          "A destructive action with no fill. It looks like `ghost` at rest and turns red on hover and focus. Use it when the action repeats, such as once per row.",
      },
    },
  },
};

// --- Size axis — independent of variant ---

export const Small = { args: { size: "sm" } };

// --- Button mode: native disabled ---

export const DisabledButton = {
  args: { disabled: true, label: "Disabled button" },
  name: "Disabled button",
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
  name: "Disabled link with a reason",
  parameters: {
    docs: {
      description: {
        story:
          "A disabled link stays in the tab order and screen readers announce why it is unavailable. Keyboard users can still find it and learn the reason.",
      },
    },
  },
};

// --- Icon usage ---

export const WithIcon = {
  name: "With an icon",
  render: () =>
    html`
      <rfg-button variant="primary">
        <svg slot="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 2a.75.75 0 0 1 .75.75V7.25H13a.75.75 0 0 1 0 1.5H8.75v4.5a.75.75 0 0 1-1.5 0v-4.5H3a.75.75 0 0 1 0-1.5h4.25V2.75A.75.75 0 0 1 8 2Z" />
        </svg>
        New project
      </rfg-button>
    `,
};

export const IconOnlyWithLabel = {
  name: "Icon only",
  render: () =>
    html`
      <rfg-button variant="ghost" aria-label="Close">
        <svg slot="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </rfg-button>
    `,
};

// --- xs: a fixed, icon-only square (size="xs") ---

const TRASH_ICON = html`
  <svg slot="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M6 2a1 1 0 0 0-1 1v1H2.5a.5.5 0 0 0 0 1H3v8.5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5V5h.5a.5.5 0 0 0 0-1H11V3a1 1 0 0 0-1-1H6Zm0 1h4v1H6V3Zm-1.5 2h7.5v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5V5Z" />
  </svg>
`;

export const CompactIconOnly = {
  name: "Extra small, icon only",
  render: () => html`<rfg-button variant="ghost" size="xs" aria-label="Delete">${TRASH_ICON}</rfg-button>`,
  parameters: {
    docs: {
      description: {
        story:
          "`size=\"xs\"` is a fixed square for icon-only controls, 28px by default. Set `--rfg-button-xs-size` to change it.",
      },
    },
  },
};

export const CompactIconOnlyDanger = {
  name: "Extra small, danger",
  render: () => html`<rfg-button variant="ghost_danger" size="xs" aria-label="Delete">${TRASH_ICON}</rfg-button>`,
  parameters: {
    docs: {
      description: {
        story:
          "Use `ghost_danger`, not filled `danger`, for a small repeated destructive icon such as Delete in each row.",
      },
    },
  },
};

export const CompactIconOnlyOverriddenToken = {
  name: "Extra small, custom size",
  render: () => html`
    <rfg-button
      variant="ghost"
      size="xs"
      aria-label="Delete"
      style="--rfg-button-xs-size: 2.5rem;"
    >${TRASH_ICON}</rfg-button>
  `,
  parameters: {
    docs: {
      description: {
        story: "Sets `--rfg-button-xs-size: 2.5rem` on the element to match your own layout.",
      },
    },
  },
};
