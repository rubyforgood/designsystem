// Behavior checks for <rfg-table>. Each check function runs inside the story page (page.evaluate),
// so it can only use browser APIs, and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// v0.1.0 shipped with none of these cell styles applying (`::slotted(table) td` matches nothing).

const check = () => {
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

module.exports = [
  { id: "components-table--default", tag: "rfg-table", check },
  { id: "components-table--wrapping-cell-still-top-aligns", tag: "rfg-table", check },
];
