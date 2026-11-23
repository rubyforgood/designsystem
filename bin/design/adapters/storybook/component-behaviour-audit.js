// Behaviour checks that axe-core and keyboard-audit.js can't see, run against specific stories in
// the built Storybook. Each check exists because a real defect shipped without it:
//
//   - <rfg-table> (v0.1.0): every cell rule was written as `::slotted(table) td`, which matches
//     nothing, so top alignment, padding, borders and the column classes never applied.
//   - <rfg-filter-bar> (v0.1.0): its <form> was inside the shadow root and its controls were
//     slotted from light DOM, so no control belonged to the form and the bar submitted nothing.
//
// Both were invisible to axe (nothing inaccessible) and to the keyboard audit (everything
// focusable). See components/README.md's sections on both components.
//
// Exits 1 if any check fails, and also if a story it needs is missing or has nothing to check, so
// a renamed story or an emptied example fails loudly rather than passing vacuously.
//
// Negative control: run against a Storybook built from the v0.1.0 versions of table.js and
// filter-bar.js, this fails every check (see docs/portability/adapter-storybook.md).
//
// Usage: BASE_URL=http://127.0.0.1:4300 node component-behaviour-audit.js
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://127.0.0.1:4300";

const TABLE_CHECKS = () => {
  const out = [];
  const cell = (sel) => document.querySelector(`rfg-table ${sel}`);
  const numeric = cell("td.numeric");
  const plain = cell("td:not([class])");
  const date = cell("td.date");
  const notes = cell("td.notes");
  if (!numeric || !plain) return [{ name: "story has a numeric cell and a plain cell", ok: false, detail: "missing" }];
  const n = getComputedStyle(numeric);
  const p = getComputedStyle(plain);
  out.push({ name: "numeric cell is right-aligned", ok: n.textAlign === "right", detail: n.textAlign });
  out.push({ name: "numeric cell uses tabular digits", ok: n.fontVariantNumeric.includes("tabular-nums"), detail: n.fontVariantNumeric });
  out.push({ name: "cells align to the top", ok: p.verticalAlign === "top", detail: p.verticalAlign });
  // >= 8px, not > 0: browsers give table cells 1px of padding by default, which a > 0 check
  // passed even in v0.1.0, when none of the component's cell styles applied.
  out.push({ name: "cells have padding", ok: parseFloat(p.paddingTop) >= 8, detail: p.paddingTop });
  out.push({ name: "rows have a bottom border", ok: parseFloat(p.borderBottomWidth) > 0, detail: p.borderBottomWidth });
  if (date) {
    const d = getComputedStyle(date);
    out.push({ name: "date cell doesn't wrap", ok: d.whiteSpace === "nowrap", detail: d.whiteSpace });
  }
  if (notes) {
    const t = getComputedStyle(notes);
    out.push({ name: "notes cell clips with an ellipsis", ok: t.textOverflow === "ellipsis", detail: t.textOverflow });
  }
  return out;
};

const FILTER_BAR_CHECKS = async () => {
  const bar = document.querySelector("rfg-filter-bar");
  if (!bar) return [{ name: "story renders a filter bar", ok: false, detail: "missing" }];
  await bar.updateComplete;
  const controls = [...bar.querySelectorAll("input, select, textarea")];
  const named = controls.filter((c) => c.name);
  if (named.length === 0) return [{ name: "story has named controls to submit", ok: false, detail: "none" }];
  const form = bar.form;
  const out = [];
  out.push({ name: "bar exposes its form", ok: form instanceof HTMLFormElement, detail: String(form) });
  const orphans = controls.filter((c) => !c.form || c.form !== form).map((c) => c.name || c.id || c.tagName);
  out.push({ name: "every control belongs to the bar's form", ok: !!form && orphans.length === 0, detail: orphans.join(", ") || "all" });
  let submitted = null;
  if (form) {
    form.addEventListener("submit", (e) => { e.preventDefault(); submitted = [...new FormData(form).keys()]; }, { once: true });
    form.requestSubmit();
  }
  const missing = named.map((c) => c.name).filter((n) => !(submitted || []).includes(n));
  out.push({ name: "submitting sends every named control", ok: submitted !== null && missing.length === 0, detail: submitted === null ? "no submit" : `missing: ${missing.join(", ") || "none"}` });
  out.push({ name: "form submits with GET", ok: !!form && form.method === "get", detail: form ? form.method : "no form" });
  return out;
};

const STORIES = [
  { id: "components-table--default", tag: "rfg-table", check: TABLE_CHECKS },
  { id: "components-table--wrapping-cell-still-top-aligns", tag: "rfg-table", check: TABLE_CHECKS },
  { id: "components-filter-bar--two-controls-shown-inline", tag: "rfg-filter-bar", check: FILTER_BAR_CHECKS },
  { id: "components-filter-bar--four-controls-fold", tag: "rfg-filter-bar", check: FILTER_BAR_CHECKS },
];

(async () => {
  const browser = await chromium.launch();
  // A hung story fails the run instead of stalling it.
  const watchdog = setTimeout(() => { console.error("timed out after 120s"); process.exit(1); }, 120000);
  const page = await browser.newPage();
  let total = 0;
  let failed = 0;
  for (const story of STORIES) {
    const url = `${BASE}/iframe.html?id=${story.id}&viewMode=story`;
    let results;
    try {
      await page.goto(url);
      await page.waitForSelector("#storybook-root > *", { timeout: 10000 });
      // Wait only for this story's own element: a story loads just the components it imports, so
      // waiting on any other tag would never resolve.
      await page.waitForFunction((tag) => !!customElements.get(tag), story.tag, { timeout: 10000 });
      results = await page.evaluate(story.check);
    } catch (e) {
      results = [{ name: "story loads", ok: false, detail: e.message.split("\n")[0] }];
    }
    console.log(`\n${story.id}`);
    for (const r of results) {
      total++;
      if (!r.ok) failed++;
      console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name} (${r.detail})`);
    }
  }
  clearTimeout(watchdog);
  await browser.close();
  console.log(`\n${total} checks, ${failed} failed`);
  process.exit(failed || total === 0 ? 1 : 0);
})();
