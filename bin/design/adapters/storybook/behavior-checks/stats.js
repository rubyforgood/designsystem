// Behavior checks for <rfg-stats>. Each check function runs inside the story page (page.evaluate),
// so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: every figure is a <dd> value with its
// <dt> label, no figure is a heading, the column count follows the figure count (README: "the
// column count maps to figure count"), and the heading/subtitle render only when set.
// The runner's viewport is 1280px wide, so the >=1024px column schedule applies.

const check = async () => {
  const el = document.querySelector("rfg-stats");
  if (!el) return [{ name: "story renders stats", ok: false, detail: "missing" }];
  await el.updateComplete;
  const root = el.shadowRoot;
  const figures = el.figures || [];
  if (figures.length === 0) return [{ name: "story has figures", ok: false, detail: "none" }];
  const out = [];
  const cells = [...root.querySelectorAll("dl > div")];
  const pairs = cells.map((c) => ({ dd: c.querySelector("dd"), dt: c.querySelector("dt") }));
  const mismatched = figures.filter((f, i) => !pairs[i] || !pairs[i].dd || !pairs[i].dt
    || pairs[i].dd.textContent.trim() !== String(f.value) || pairs[i].dt.textContent.trim() !== f.label);
  out.push({
    name: "each figure is a <dd> value paired with its <dt> label",
    ok: cells.length === figures.length && mismatched.length === 0,
    detail: `${cells.length} cells for ${figures.length} figures; mismatched: ${mismatched.map((f) => f.label).join(", ") || "none"}`,
  });
  const headings = root.querySelectorAll("h1, h2, h3, h4, h5, h6, [role=heading]");
  out.push({ name: "no figure or title is marked up as a heading", ok: headings.length === 0, detail: `${headings.length} headings` });

  // README/design.md column schedule at >= 1024px: 1->1, 2->2, 3->3, 4->4, 5->5, 6->3.
  const want = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 3 }[Math.min(figures.length, 6)];
  const cols = getComputedStyle(root.querySelector("dl")).gridTemplateColumns.split(" ").length;
  out.push({ name: `${figures.length} figures lay out in ${want} columns`, ok: cols === want, detail: `${cols} columns` });
  const dl = getComputedStyle(root.querySelector("dl"));
  out.push({ name: "figures are separated by 1px gaps, not boxed one by one", ok: dl.columnGap === "1px" && dl.rowGap === "1px" && getComputedStyle(cells[0]).borderTopWidth === "0px", detail: `gap ${dl.rowGap}/${dl.columnGap}` });

  const heading = root.querySelector(".heading");
  const subtitle = root.querySelector(".subtitle");
  out.push({
    name: el.heading ? "heading shows when set" : "no heading block without a heading",
    ok: el.heading ? !!heading && heading.textContent.trim() === el.heading : !heading && !root.querySelector(".titles"),
    detail: heading ? heading.textContent.trim() : "none",
  });
  out.push({
    name: el.subtitle ? "subtitle shows when set" : "no subtitle without one",
    ok: el.subtitle ? !!subtitle && subtitle.textContent.trim() === el.subtitle : !subtitle,
    detail: subtitle ? subtitle.textContent.trim() : "none",
  });
  return out;
};

module.exports = [
  { id: "components-stats--two-figures", tag: "rfg-stats", check },
  { id: "components-stats--four-figures", tag: "rfg-stats", check },
  { id: "components-stats--no-title", tag: "rfg-stats", check },
];
