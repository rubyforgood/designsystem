import { html } from "lit";
import "./table.js";

export default {
  title: "Components/Table",
  component: "rfg-table",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "A table lays out records in rows and columns so people can scan and compare them. Wrap your own `<table>` in `<rfg-table>`. It scrolls sideways on narrow screens instead of squeezing columns, and top-aligns every cell.",
          "",
          "**When to use**",
          "- To list records that share the same fields, such as projects, tasks or invoices.",
          "- Add a class to cells to format a column the same way every time. `numeric`, `quantity` and `percent` right-align with even-width digits. `date` never wraps. `notes` clips long text to one line.",
          "",
          "**When not to use**",
          "- For a few headline numbers, use Stats.",
          "- For a single record's details, use a Card.",
          "- It doesn't freeze columns, select rows or add batch actions. Build those in your app if you need them.",
          "",
          "**Accessibility**",
          "- Give every table a `<caption>` that names what it lists. It can be visually hidden. The component warns in the console if it is missing.",
          "- Use real `<th>` header cells.",
          "- Wide tables scroll horizontally instead of reflowing, which WCAG allows for data tables.",
          "",
          "**Known issue (v0.1.0):** the `numeric`, `quantity`, `percent`, `date` and `notes` column classes don't take effect yet. The component's styles can't reach cells inside the slotted table. Until a fix ships, style these columns in your own CSS.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#tables)",
        ].join("\n"),
      },
    },
  },
  render: () => html`
    <rfg-table>
      <table>
        <caption>Projects updated this week</caption>
        <thead>
          <tr>
            <th class="date">Date</th>
            <th>Project</th>
            <th class="numeric">Tasks completed</th>
            <th class="notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="date">Jun 19, 2026</td>
            <td>Website redesign</td>
            <td class="numeric">1,284</td>
            <td class="notes">A fairly long note that should clip to one line rather than wrapping the row.</td>
          </tr>
          <tr>
            <td class="date">Jun 18, 2026</td>
            <td>Annual report</td>
            <td class="numeric">88</td>
            <td class="notes">—</td>
          </tr>
        </tbody>
      </table>
    </rfg-table>
  `,
};

export const Default = {};

export const WrappingCellStillTopAligns = {
  name: "Wrapping cell",
  parameters: {
    docs: {
      description: {
        story: "When one cell wraps onto a second line, the other cells in the row stay at the top.",
      },
    },
  },
  render: () => html`
    <rfg-table>
      <table>
        <caption>Tasks for Website redesign</caption>
        <thead>
          <tr>
            <th>Task</th>
            <th class="notes">Description</th>
            <th class="numeric">Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Draft homepage copy</td>
            <td style="white-space: normal; max-width: 12rem;">
              A long description that genuinely wraps onto a second line, to check the row's other cells stay at the top instead of centering.
            </td>
            <td class="numeric">12</td>
          </tr>
        </tbody>
      </table>
    </rfg-table>
  `,
};

export const MissingCaptionWarns = {
  name: "Missing caption",
  parameters: {
    docs: {
      description: {
        story: "A table with no `<caption>`. The component logs a console warning so you can fix it.",
      },
    },
  },
  render: () => html`
    <rfg-table>
      <table>
        <thead>
          <tr><th>Task</th></tr>
        </thead>
        <tbody>
          <tr><td>No caption on this table</td></tr>
        </tbody>
      </table>
    </rfg-table>
  `,
};
