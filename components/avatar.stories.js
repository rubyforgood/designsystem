import { html } from "lit";
import "./avatar.js";

export default {
  title: "Components/Avatar",
  component: "rfg-avatar",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Circular initials avatar — design.md's \"Icon tiles and avatars\" section, the " +
          "avatar half, kept as its own element rather than a `shape` switch on `<rfg-icon-tile>` " +
          "(\"reserve two distinct visual vocabularies ... and never let them overlap\"). Carries " +
          "an accessible name by default, computed from `name`, since an avatar is sometimes the " +
          "only visible indicator of who it represents.",
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
  args: { name: "Jamie Diaz", size: "md" },
};

export const Default = {};
export const Small = { args: { size: "sm" } };
export const OneWordName = { args: { name: "Madonna" }, name: "One-word name" };

export const DecorativeInsideALabeledControl = {
  name: "Decorative (inside a control that already names the person)",
  render: () =>
    html`
      <button
        type="button"
        aria-label="JD — account menu for Jamie Diaz"
        style="display:inline-flex; align-items:center; gap:0.5rem; border:1px solid var(--color-neutral-200); border-radius:var(--radius-control); padding:0.25rem 0.75rem 0.25rem 0.25rem; background:white; font-family:var(--font-sans); cursor:pointer;"
      >
        <rfg-avatar name="Jamie Diaz" size="sm" aria-hidden="true"></rfg-avatar>
      </button>
    `,
  parameters: {
    docs: {
      description: {
        story:
          "design.md's own example: an account-menu trigger whose avatar carries no accessible " +
          'name of its own, since the enclosing button already announces one. The aria-label ' +
          'leads with "JD" deliberately — axe-core\'s label-content-name-mismatch check (WCAG ' +
          "2.5.3 Label in Name) flagged a first draft that said only \"Account menu for Jamie " +
          'Diaz\": a voice-control user saying the visible label ("JD") wouldn\'t match an ' +
          "accessible name that doesn't contain it. design.md's own text describes the decorative" +
          "-avatar-plus-named-button shape but doesn't address this; worth folding into design.md" +
          " if this pattern gets used for real.",
      },
    },
  },
};
