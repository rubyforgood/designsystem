import { html } from "lit";
import "./table.js";

export default {
  title: "Components/Table",
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
