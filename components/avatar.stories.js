import { html } from "lit";
import "./avatar.js";

export default {
  title: "Components/Avatar",
  component: "rfg-avatar",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A circle showing a person's initials, worked out from their name.",
          "",
          "**When to use**",
          "- To represent a person, such as the signed-in user in an account menu, or the members of a team.",
          "",
          "**When not to use**",
          "- For a stat, a status or a thing, use Icon tile. Avatars mean \"a person\" and icon tiles mean \"a stat or status\". Keep the two apart.",
          "",
          "**Accessibility**",
          "- By default the avatar is announced as an image named after the person, because it is sometimes the only sign of who it represents.",
          "- Inside a control that already names the person, add `aria-hidden=\"true\"` to the avatar so the name isn't read twice.",
          "- When you do that, start the control's label with the visible initials, so a voice-control user can say what they see (WCAG 2.5.3 Label in Name).",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#icon-tiles-and-avatars)",
        ].join("\n"),
      },
    },
  },
  render: (args) => html`<rfg-avatar name=${args.name} size=${args.size}></rfg-avatar>`,
  argTypes: {
    name: {
      control: "text",
      description: "The person's full name — used to compute initials and the default accessible name.",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Reuses the shared sm/md size vocabulary.",
    },
  },
  args: { name: "Maya Chen", size: "md" },
};

export const Default = {};
export const Small = { args: { size: "sm" } };
export const OneWordName = { args: { name: "Priya" }, name: "One-word name" };

export const DecorativeInsideALabeledControl = {
  name: "Decorative inside a button",
  render: () =>
    html`
      <button
        type="button"
        aria-label="MC — account menu for Maya Chen"
        style="display:inline-flex; align-items:center; gap:0.5rem; border:1px solid var(--color-neutral-200); border-radius:var(--radius-control); padding:0.25rem 0.75rem 0.25rem 0.25rem; background:white; font-family:var(--font-sans); cursor:pointer;"
      >
        <rfg-avatar name="Maya Chen" size="sm" aria-hidden="true"></rfg-avatar>
      </button>
    `,
  parameters: {
    docs: {
      description: {
        story:
          "An account-menu button that names the person itself, so the avatar is hidden from " +
          'screen readers. The label starts with the visible initials ("MC") so voice-control ' +
          "users can say what they see.",
      },
    },
  },
};
