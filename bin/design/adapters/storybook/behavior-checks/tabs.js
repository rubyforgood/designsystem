// Behavior checks for <rfg-tabs> / <rfg-tab-panel>. `run` drives the story with real key presses
// and clicks from Node (Playwright) and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. components/README.md promises the WAI-ARIA APG tabs pattern with
// automatic activation: arrow keys move and select (wrapping), Home/End jump, a roving tabindex,
// and only the selected panel shown.

// Snapshot of the widget's state, taken in the page.
const state = () => {
  const host = document.querySelector("rfg-tabs");
  const tabs = [...host.querySelectorAll('[role="tab"]')];
  const panels = [...host.querySelectorAll("rfg-tab-panel")];
  return {
    selected: tabs.map((t) => t.getAttribute("aria-selected") === "true"),
    tabindex: tabs.map((t) => t.getAttribute("tabindex")),
    focused: tabs.indexOf(document.activeElement),
    // What a user actually sees: a panel counts as shown only if it renders a box.
    shown: panels.map((p) => getComputedStyle(p).display !== "none" && p.getClientRects().length > 0),
    pairs: tabs.map((t, i) => {
      const p = document.getElementById(t.getAttribute("aria-controls"));
      return !!p && p === panels[i] && p.getAttribute("aria-labelledby") === t.id;
    }),
    count: tabs.length,
  };
};

// Selection, focus, roving tabindex and the visible panel all agree on index `i`.
const agrees = (s, i, wantFocus = true) =>
  s.selected.every((v, j) => v === (j === i)) &&
  s.tabindex.every((v, j) => v === (j === i ? "0" : "-1")) &&
  s.shown.every((v, j) => v === (j === i)) &&
  (!wantFocus || s.focused === i);

const show = (s) => `selected=${s.selected.indexOf(true)} focus=${s.focused} shown=${s.shown.map(Number).join("")} tabindex=${s.tabindex.join(",")}`;

const run = async (page) => {
  await page.evaluate(() => document.querySelector("rfg-tabs").updateComplete);
  const out = [];
  let s = await page.evaluate(state);
  if (s.count < 3) return [{ name: "story has at least three tabs", ok: false, detail: String(s.count) }];
  const last = s.count - 1;
  out.push({ name: "first tab starts selected, with only its panel shown", ok: agrees(s, 0, false), detail: show(s) });
  out.push({ name: "each tab's aria-controls names its own panel, which is labeled by it", ok: s.pairs.every(Boolean), detail: s.pairs.map(Number).join("") });

  await page.locator('rfg-tabs [role="tab"]').first().focus();
  await page.keyboard.press("ArrowRight");
  s = await page.evaluate(state);
  out.push({ name: "ArrowRight selects, focuses and shows the next tab", ok: agrees(s, 1), detail: show(s) });

  await page.keyboard.press("Home");
  s = await page.evaluate(state);
  out.push({ name: "Home selects the first tab", ok: agrees(s, 0), detail: show(s) });

  await page.keyboard.press("ArrowLeft");
  s = await page.evaluate(state);
  out.push({ name: "ArrowLeft on the first tab wraps to the last", ok: agrees(s, last), detail: show(s) });

  await page.keyboard.press("Home");
  await page.keyboard.press("End");
  s = await page.evaluate(state);
  out.push({ name: "End selects the last tab", ok: agrees(s, last), detail: show(s) });

  await page.locator('rfg-tabs [role="tab"]').nth(1).click();
  s = await page.evaluate(state);
  out.push({ name: "clicking a tab selects it and shows its panel", ok: agrees(s, 1), detail: show(s) });
  return out;
};

module.exports = [{ id: "components-tabs-panel--default", tag: "rfg-tabs", run }];
