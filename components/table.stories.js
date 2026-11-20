import { html } from "lit";
import "./table.js";

export default {
  title: "Components/Table",
  component: "rfg-table",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Implements the clearly Portable core of design.md\'s "Tables" section: a scroll-' +
          "not-squeeze container (WCAG 1.4.10's data-table exemption) and top-aligned cells " +
          "(`vertical-align: middle` is invisible until a cell wraps, then every single-line " +
          "cell in the row floats off the baseline). The host provides the actual `<table>` " +
          "markup via the default slot; this element only wraps, scrolls, and supplies shared " +
          "classes the host's own cells opt into. Frozen columns, row selection/batch action " +
          "bars, and the scroll rail's own affordances are deliberately out of scope — see " +
          "design.md's Row actions / Tables sections.",
      },
    },
  },
  render: () => html`
    <rfg-table>
      <table>
        <caption>Donations received in the selected period</caption>
        <thead>
          <tr>
            <th class="date">Date</th>
            <th>Source</th>
            <th class="numeric">Quantity</th>
            <th class="notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="date">Jun 19, 2026</td>
            <td>Acme Donations</td>
            <td class="numeric">1,204</td>
            <td class="notes">A fairly long note that should clip to one line rather than wrapping the row.</td>
          </tr>
          <tr>
            <td class="date">Jun 18, 2026</td>
            <td>Local drive</td>
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
  name: "A wrapping cell still top-aligns the row",
  render: () => html`
    <rfg-table>
      <table>
        <caption>Example: top alignment survives a wrapping cell</caption>
        <thead>
          <tr>
            <th>Item</th>
            <th class="notes">Description</th>
            <th class="numeric">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Diapers, size 4</td>
            <td style="white-space: normal; max-width: 12rem;">
              A long description that genuinely wraps onto a second line, to check the row's other cells stay at the top instead of centering.
            </td>
            <td class="numeric">500</td>
          </tr>
        </tbody>
      </table>
    </rfg-table>
  `,
};

export const MissingCaptionWarns = {
  name: "Missing caption (logs a console warning)",
  render: () => html`
    <rfg-table>
      <table>
        <thead>
          <tr><th>Item</th></tr>
        </thead>
        <tbody>
          <tr><td>No caption on this table</td></tr>
        </tbody>
      </table>
    </rfg-table>
  `,
};
