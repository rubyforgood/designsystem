import { html } from "lit";
import "./pagination.js";

export default {
  title: "Components/Pagination",
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
