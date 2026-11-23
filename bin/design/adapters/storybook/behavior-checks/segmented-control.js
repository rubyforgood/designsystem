// Behavior checks for <rfg-segmented-control>. `run` drives the story with real clicks and key
// presses from Node (Playwright) and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. components/README.md promises plain toggle buttons with
// aria-pressed (not a radiogroup), `value` defaulting to the first segment, and an `rfg-change`
// event with `{ value }` when the selection changes.

const state = () => {
  const host = document.querySelector("rfg-segmented-control");
  const buttons = [...host.querySelectorAll("button")];
  const probe = document.createElement("span");
  probe.style.backgroundColor = "var(--color-neutral-100)";
  document.body.append(probe);
  const pressedBg = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return {
    value: host.value,
    attr: host.getAttribute("value"),
    pressed: buttons.map((b) => b.getAttribute("aria-pressed")),
    values: buttons.map((b) => b.getAttribute("value")),
    // Only the pressed segment should carry the pressed fill.
    filled: buttons.map((b) => getComputedStyle(b).backgroundColor === pressedBg),
    types: buttons.map((b) => b.type),
    events: (window.__rfgChanges || []).slice(),
  };
};

// aria-pressed, the visible fill and `value` all agree on exactly one segment.
const agrees = (s, value) =>
  s.value === value &&
  s.attr === value &&
  s.values.every((v, i) => s.pressed[i] === String(v === value) && s.filled[i] === (v === value));

const show = (s) => `value=${s.value} attr=${s.attr} pressed=${s.pressed.join(",")} filled=${s.filled.map(Number).join("")}`;

const run = async (page) => {
  await page.evaluate(async () => {
    const host = document.querySelector("rfg-segmented-control");
    await host.updateComplete;
    window.__rfgChanges = [];
    document.addEventListener("rfg-change", (e) => window.__rfgChanges.push(e.detail && e.detail.value));
  });
  const out = [];
  let s = await page.evaluate(state);
  if (s.values.length < 2) return [{ name: "story has at least two segments", ok: false, detail: String(s.values.length) }];
  const initial = await page.evaluate(() => document.querySelector("rfg-segmented-control").getAttribute("value"));
  // With no value set, the first segment is the default (README: "defaults to the first segment's").
  out.push({ name: "the current value's segment, and only it, is pressed and filled", ok: agrees(s, initial || s.values[0]), detail: show(s) });
  out.push({ name: "segments are type=button, so they never submit a form", ok: s.types.every((t) => t === "button"), detail: s.types.join(",") });

  const target = s.values.find((v) => v !== s.value);
  await page.locator(`rfg-segmented-control button[value="${target}"]`).click();
  s = await page.evaluate(state);
  out.push({ name: "clicking a segment selects it", ok: agrees(s, target), detail: show(s) });
  out.push({ name: "rfg-change fires once with detail.value", ok: s.events.length === 1 && s.events[0] === target, detail: JSON.stringify(s.events) });

  await page.locator(`rfg-segmented-control button[value="${target}"]`).click();
  s = await page.evaluate(state);
  out.push({ name: "clicking the pressed segment fires no rfg-change", ok: s.events.length === 1, detail: JSON.stringify(s.events) });

  // Keyboard: native buttons, so Space activates the focused segment.
  const back = s.values.find((v) => v !== target);
  await page.locator(`rfg-segmented-control button[value="${back}"]`).focus();
  await page.keyboard.press("Space");
  s = await page.evaluate(state);
  out.push({ name: "Space on a focused segment selects it", ok: agrees(s, back) && s.events[s.events.length - 1] === back, detail: show(s) });
  return out;
};

module.exports = [
  { id: "components-segmented-control--default", tag: "rfg-segmented-control", run },
  { id: "components-segmented-control--three-segments", tag: "rfg-segmented-control", run },
  { id: "components-segmented-control--no-initial-value", tag: "rfg-segmented-control", run },
];
