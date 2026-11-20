import { html } from "lit";
import "./pagination.js";

export default {
  title: "Components/Pagination",
  component: "rfg-pagination",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'States the range, not the page number ("Showing 31–45 of 272", never "Page 3 of ' +
          '19") — design.md\'s "Pagination" section, since the page number is a proxy whose ' +
          "meaning changes with page size. Renders on every non-empty collection, including " +
          "one that fits on a single page. Real `<a>` links, not JS-only buttons, so a " +
          "paginated view stays a shareable URL; the control set doesn't change width as pages " +
          'run out — first/last/prev/next stay present and `aria-disabled`, never a plain ' +
          "`disabled` attribute, which an anchor doesn't support anyway.",
      },
    },
  },
  render: () => html`<rfg-pagination total="272" page="3" page-size="15" entry-name="donation" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const MiddleOfManyPages = {};

export const FirstPage = {
  render: () => html`<rfg-pagination total="272" page="1" page-size="15" entry-name="donation" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const LastPage = {
  render: () => html`<rfg-pagination total="272" page="19" page-size="15" entry-name="donation" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const FitsOnOnePage = {
  name: "Fits on one page (no pager chrome, label only)",
  render: () => html`<rfg-pagination total="12" page="1" page-size="25" entry-name="distribution" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const Empty = {
  name: "Empty collection",
  render: () => html`<rfg-pagination total="0" page="1" page-size="25" entry-name="distribution"></rfg-pagination>`,
};
