const { fieldEdge } = require("../field-edge");
// Behavior checks for <rfg-tag-input>. Each `run` drives the story page from Node with real
// Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// What components/README.md and the story promise: Enter, comma and Tab each add the typed value
// as a chip; duplicates are refused ignoring case; Backspace in an empty box removes the last
// chip; a chip's remove button removes it; rfg-change fires with { values }; the hint is linked to
// the field; and inside a <form> the values submit under `name` as one comma-separated value.

const INPUT = "rfg-tag-input input";

const state = (page) =>
  page.evaluate(() => {
    const el = document.querySelector("rfg-tag-input");
    const input = el.shadowRoot.querySelector("input");
    const describedBy = input.getAttribute("aria-describedby");
    const hintEl = describedBy && el.shadowRoot.getElementById(describedBy);
    const form = el.closest("form");
    let formValue = null;
    if (form) {
      const fd = new FormData(form);
      formValue = fd.has(el.getAttribute("name")) ? fd.getAll(el.getAttribute("name")) : [];
    }
    return {
      values: [...el.values],
      chips: [...el.shadowRoot.querySelectorAll(".chip")].map((c) => c.textContent.trim()),
      draft: input.value,
      hint: hintEl ? hintEl.textContent.trim() : null,
      hintAttr: el.hint,
      formValue,
      events: window.__changes || [],
    };
  });

async function prepare(page) {
  await page.waitForSelector(INPUT);
  await page.evaluate(() => {
    window.__changes = [];
    document.querySelector("rfg-tag-input").addEventListener("rfg-change", (e) => window.__changes.push(e.detail.values));
  });
  await page.locator(INPUT).focus();
}

const add = async (page, text, key) => {
  await page.locator(INPUT).focus();
  await page.keyboard.type(text);
  await page.keyboard.press(key);
  await page.waitForTimeout(50);
  return state(page);
};

const run = async (page) => {
  const out = [];
  await prepare(page);
  let s = await state(page);
  out.push({ name: "the hint is linked to the field with aria-describedby", ok: !!s.hint && s.hint === s.hintAttr, detail: s.hint === null ? "aria-describedby points at nothing" : `"${s.hint}"` });

  s = await add(page, "billing", "Enter");
  out.push({ name: "Enter adds the typed value as a chip and clears the box", ok: s.values.at(-1) === "billing" && s.chips.at(-1) === "billing" && s.draft === "", detail: `values=${s.values.join(",")} draft="${s.draft}"` });
  out.push({ name: "rfg-change fires with { values }", ok: s.events.length === 1 && s.events[0].join() === s.values.join(), detail: JSON.stringify(s.events) });

  s = await add(page, "ops", ",");
  out.push({ name: "comma adds the value (and isn't typed into it)", ok: s.values.at(-1) === "ops" && s.draft === "", detail: `values=${s.values.join(",")} draft="${s.draft}"` });

  s = await add(page, "q3", "Tab");
  out.push({ name: "Tab adds the value", ok: s.values.at(-1) === "q3", detail: `values=${s.values.join(",")}` });

  const before = s.values.length;
  s = await add(page, "URGENT", "Enter");
  out.push({ name: "a duplicate is refused, ignoring case", ok: s.values.length === before && !s.values.includes("URGENT") && s.draft === "", detail: `values=${s.values.join(",")}` });

  await page.locator(INPUT).focus();
  await page.keyboard.press("Backspace");
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "Backspace in the empty box removes the last chip", ok: s.values.length === before - 1 && !s.values.includes("q3"), detail: `values=${s.values.join(",")}` });

  await page.locator('rfg-tag-input button[aria-label="Remove urgent"]').click();
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "a chip's remove button removes that chip", ok: !s.values.includes("urgent") && !s.chips.includes("urgent"), detail: `values=${s.values.join(",")}` });
  return out;
};

const form = async (page) => {
  const out = [];
  await prepare(page);
  let s = await state(page);
  out.push({ name: "the values are in the form's FormData under `name`", ok: JSON.stringify(s.formValue) === '["design"]', detail: JSON.stringify(s.formValue) });
  s = await add(page, "research", "Enter");
  out.push({ name: "an added value submits as one comma-separated value", ok: JSON.stringify(s.formValue) === '["design,research"]', detail: JSON.stringify(s.formValue) });
  return out;
};

module.exports = [
  { id: "components-tag-input--default", tag: "rfg-tag-input", run },
  { id: "components-tag-input--in-a-real-form", tag: "rfg-tag-input", run: form },
  // WCAG 1.4.11: the field's edge is 3:1 against the page (../field-edge.js).
  { id: "components-tag-input--default", tag: "rfg-tag-input", run: async (page) => [await fieldEdge(page, () => { const t = document.querySelector("rfg-tag-input"); return (t.shadowRoot || t).querySelector(".box, .rfg-tag-input-box, [class*=box]"); })] },
];
