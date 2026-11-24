const { fieldEdge } = require("../field-edge");
// Behavior checks for <rfg-combobox>. Each `run` drives the story page from Node with real
// Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// What components/README.md and the story promise: the wrapped native <select> stays the value
// that submits; focus stays in the textbox while Down/Up Arrow move a highlighted option
// (aria-activedescendant); typing filters; Enter picks (updating the <select>, firing a real
// `change` and rfg-change, and closing in single-select); Escape closes; in multi-select each
// selected option is a chip and Backspace in an empty box removes the last one; a `change` from
// outside (jQuery's .val().trigger('change')) updates what the textbox shows.

const INPUT = "rfg-combobox .rfg-combobox-input";

const state = (page) =>
  page.evaluate(() => {
    const cb = document.querySelector("rfg-combobox");
    const input = cb.querySelector(".rfg-combobox-input");
    const select = cb.querySelector("select");
    const panel = document.getElementById(input.getAttribute("aria-controls"));
    const activeId = input.getAttribute("aria-activedescendant");
    const activeEl = activeId && document.getElementById(activeId);
    const options = panel ? [...panel.querySelectorAll('[role="option"]')] : [];
    return {
      open: !!panel && !panel.hidden,
      expanded: input.getAttribute("aria-expanded"),
      focusOnInput: document.activeElement === input,
      activeText: activeEl ? activeEl.textContent.trim() : null,
      activeMarked: !!activeEl && activeEl.dataset.active === "true" && panel.contains(activeEl),
      optionTexts: options.map((o) => o.textContent.trim()),
      ariaSelected: options.filter((o) => o.getAttribute("aria-selected") === "true").map((o) => o.textContent.trim()),
      selectValues: [...select.selectedOptions].map((o) => o.value),
      selectTexts: [...select.selectedOptions].map((o) => o.textContent.trim()),
      chips: [...cb.querySelectorAll(".rfg-combobox-chip")].map((c) => c.textContent.trim()),
      inputValue: input.value,
      events: window.__events || [],
    };
  });

async function prepare(page) {
  await page.waitForSelector(INPUT);
  await page.evaluate(() => {
    window.__events = [];
    const cb = document.querySelector("rfg-combobox");
    cb.querySelector("select").addEventListener("change", () => window.__events.push("change"));
    cb.addEventListener("rfg-change", () => window.__events.push("rfg-change"));
  });
}

const press = async (page, key) => {
  await page.keyboard.press(key);
  await page.waitForTimeout(50);
  return state(page);
};

const single = async (page) => {
  const out = [];
  await prepare(page);
  await page.locator(INPUT).focus();
  await page.waitForTimeout(100);
  let s = await state(page);
  out.push({ name: "focusing the textbox opens the listbox (aria-expanded true)", ok: s.open && s.expanded === "true", detail: `open=${s.open} aria-expanded=${s.expanded}` });

  await press(page, "ArrowDown");
  s = await press(page, "ArrowDown");
  out.push({ name: "Down Arrow moves the highlighted option via aria-activedescendant, focus staying in the textbox", ok: s.activeText === "Annual report" && s.activeMarked && s.focusOnInput, detail: `active=${s.activeText} marked=${s.activeMarked} focusOnInput=${s.focusOnInput}` });

  s = await press(page, "Enter");
  out.push({ name: "Enter picks the option into the wrapped <select>", ok: s.selectValues.join() === "2", detail: `select value=${s.selectValues.join()}` });
  out.push({ name: "picking fires a real change on the <select> and rfg-change", ok: s.events.includes("change") && s.events.includes("rfg-change"), detail: s.events.join(",") || "none" });
  out.push({ name: "picking closes a single-select and the textbox shows the choice", ok: !s.open && s.expanded === "false" && s.inputValue === "Annual report", detail: `open=${s.open} text="${s.inputValue}"` });

  await press(page, "ArrowDown");
  s = await state(page);
  out.push({ name: "aria-selected marks the option the <select> holds", ok: s.ariaSelected.join() === "Annual report", detail: s.ariaSelected.join(", ") || "none" });
  s = await press(page, "Escape");
  out.push({ name: "Escape closes the listbox", ok: !s.open && s.expanded === "false", detail: `open=${s.open} aria-expanded=${s.expanded}` });

  // The documented jQuery path: set the <select>'s value from outside, then fire `change`.
  await page.evaluate(() => {
    const select = document.querySelector("rfg-combobox select");
    select.value = "4";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    document.activeElement.blur();
  });
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "a change made to the <select> from outside shows in the textbox", ok: s.inputValue === "Spring newsletter", detail: `text="${s.inputValue}"` });
  return out;
};

const filter = async (page) => {
  await prepare(page);
  await page.locator(INPUT).focus();
  await page.keyboard.type("annual");
  await page.waitForTimeout(100);
  const s = await state(page);
  const ok = s.optionTexts.length === 3 && s.optionTexts.every((t) => t.toLowerCase().includes("annual"));
  return [{ name: "typing filters the options to those containing the text", ok, detail: `${s.optionTexts.length} shown: ${s.optionTexts.join(", ")}` }];
};

const preselected = async (page) => {
  await prepare(page);
  const s = await state(page);
  return [{ name: "the textbox shows the <select>'s pre-selected option on load", ok: s.inputValue === "Annual report", detail: `text="${s.inputValue}"` }];
};

const multi = async (page) => {
  const out = [];
  await prepare(page);
  let s = await state(page);
  out.push({ name: "one chip per selected <option>", ok: s.chips.join("|") === s.selectTexts.join("|") && s.chips.length === 2, detail: `chips: ${s.chips.join(", ")}; selected: ${s.selectTexts.join(", ")}` });

  await page.locator(INPUT).focus();
  await press(page, "ArrowDown");
  await press(page, "ArrowDown");
  s = await press(page, "Enter");
  out.push({ name: "Enter adds to a multi-select and keeps the listbox open", ok: s.selectTexts.includes("Sam Rivera") && s.chips.includes("Sam Rivera") && s.open, detail: `selected: ${s.selectTexts.join(", ")}; open=${s.open}` });

  const before = s.selectTexts.length;
  s = await press(page, "Backspace");
  out.push({ name: "Backspace in the empty textbox removes the last chip from the <select>", ok: s.selectTexts.length === before - 1 && s.chips.length === s.selectTexts.length, detail: `selected: ${s.selectTexts.join(", ")}; chips: ${s.chips.join(", ")}` });
  return out;
};

module.exports = [
  { id: "components-combobox--single-select", tag: "rfg-combobox", run: single },
  { id: "components-combobox--long-list", tag: "rfg-combobox", run: filter },
  { id: "components-combobox--single-select-pre-selected", tag: "rfg-combobox", run: preselected },
  { id: "components-combobox--multi-select", tag: "rfg-combobox", run: multi },
  // WCAG 1.4.11: the field's edge is 3:1 against the page (../field-edge.js).
  { id: "components-combobox--single-select", tag: "rfg-combobox", run: async (page) => [await fieldEdge(page, () => document.querySelector("rfg-combobox .rfg-combobox-box"))] },
];
