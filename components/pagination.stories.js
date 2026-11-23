import { html } from "lit";
import "./pagination.js";

export default {
  title: "Components/Pagination",
  component: "rfg-pagination",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Shows which part of a long list is on screen, and links to the other pages. It states the range, such as \"Showing 31–45 of 272 projects\", not \"Page 3 of 19\".",
          "",
          "**When to use**",
          "- Any list or table that keeps growing as it's used.",
          "- Every non-empty list, even one that fits on a single page. The count is useful on its own.",
          "",
          "**When not to use**",
          "- When the list is empty. Show an Empty state instead.",
          "- For a fixed-size report. Show it in full.",
          "",
          "**Accessibility**",
          "- The page links sit in a `<nav>` labelled \"Pagination\". The current page has `aria-current=\"page\"`.",
          "- The controls are real links, so each page has its own URL. Pass `hrefFor` to build it.",
          "- First, Previous, Next and Last stay in place at the ends and are marked `aria-disabled`, so the controls don't shift.",
          "- Set `entry-name` to the singular noun for one item. It's pluralised for you.",
          "",
          "[Full guidelines in design.md](https://github.com/rubyforgood/designsystem/blob/main/design.md#pagination)",
        ].join("\n"),
      },
    },
  },
  render: () => html`<rfg-pagination total="272" page="3" page-size="15" entry-name="project" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const MiddleOfManyPages = {};

export const FirstPage = {
  render: () => html`<rfg-pagination total="272" page="1" page-size="15" entry-name="project" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const LastPage = {
  render: () => html`<rfg-pagination total="272" page="19" page-size="15" entry-name="project" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const FitsOnOnePage = {
  name: "Single page",
  parameters: {
    docs: {
      description: {
        story: "When everything fits on one page, only the count shows. There are no page links.",
      },
    },
  },
  render: () => html`<rfg-pagination total="12" page="1" page-size="25" entry-name="project" .hrefFor=${(p) => `#page=${p}`}></rfg-pagination>`,
};

export const Empty = {
  name: "Empty list",
  render: () => html`<rfg-pagination total="0" page="1" page-size="25" entry-name="project"></rfg-pagination>`,
};
