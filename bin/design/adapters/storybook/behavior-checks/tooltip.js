// Behavior checks for <rfg-tooltip>. Each `run` drives the story page from Node with real
// Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// What components/README.md and the story promise (WCAG 1.4.13): the bubble shows on hover and
// on keyboard focus, hides when the pointer or focus leaves, stays while the pointer is on the
// bubble itself, and Escape hides it without moving focus; the bubble is aria-hidden; it keeps
// on screen near the viewport edge; a trigger with its own visible text keeps its own name; and
// an empty `text` logs a console warning. The bubble doesn't exist until hover/focus, so axe and
// the keyboard audit never see any of it.

const TRIGGER = "rfg-tooltip rfg-button .control";

const bubble = (page) =>
  page.evaluate(() => {
    const b = document.querySelector(".rfg-tooltip-bubble");
    if (!b) return null;
    const r = b.getBoundingClientRect();
    const t = document.querySelector("rfg-tooltip rfg-button").getBoundingClientRect();
    return {
      text: b.textContent,
      ariaHidden: b.getAttribute("aria-hidden"),
      rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
      overlapsTrigger: !(r.right <= t.left || r.left >= t.right || r.bottom <= t.top || r.top >= t.bottom),
      vw: innerWidth,
      vh: innerHeight,
    };
  });

const center = async (page, selector) => {
  const r = await page.locator(selector).first().boundingBox();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};

const run = async (page) => {
  const out = [];
  await page.waitForSelector(TRIGGER);
  const text = await page.evaluate(() => document.querySelector("rfg-tooltip").text);

  const t = await center(page, TRIGGER);
  await page.mouse.move(t.x, t.y);
  await page.waitForTimeout(50);
  let b = await bubble(page);
  out.push({ name: "hovering the trigger shows the bubble with the tooltip's text", ok: !!b && b.text === text, detail: b ? `"${b.text}"` : "no bubble" });
  out.push({ name: "the bubble is aria-hidden (the name isn't read twice)", ok: !!b && b.ariaHidden === "true", detail: b ? `aria-hidden=${b.ariaHidden}` : "no bubble" });

  // Hiding waits 150ms after the pointer leaves (so it can cross to the bubble), so wait past that.
  await page.mouse.move(t.x + 300, t.y + 300);
  await page.waitForTimeout(300);
  b = await bubble(page);
  out.push({ name: "moving the pointer away from the trigger hides the bubble", ok: !b, detail: b ? "still shown" : "hidden" });

  // Hoverable: a pointer that lands on the bubble keeps it. The pointer jumps straight from the
  // trigger onto the bubble here.
  await page.mouse.move(t.x, t.y);
  await page.waitForTimeout(50);
  b = await bubble(page);
  if (b) {
    await page.mouse.move((b.rect.left + b.rect.right) / 2, (b.rect.top + b.rect.bottom) / 2);
    await page.waitForTimeout(50);
  }
  const kept = await bubble(page);
  out.push({ name: "moving the pointer onto the bubble keeps it open", ok: !!kept, detail: kept ? "still shown" : "hidden" });
  // WCAG 1.4.13 "hoverable", fixed in v0.1.3: a pointer traveling gradually from the trigger onto the
  // bubble crosses an 8px gap. The bubble used to vanish in that gap; hiding now waits 150ms.
  await page.mouse.move(t.x, t.y);
  await page.waitForTimeout(50);
  const g = await bubble(page);
  if (g) await page.mouse.move((g.rect.left + g.rect.right) / 2, (g.rect.top + g.rect.bottom) / 2, { steps: 20 });
  await page.waitForTimeout(300);
  const stayed = !!g && !!(await bubble(page));
  out.push({ name: "moving the pointer gradually onto the bubble keeps it open", ok: stayed, detail: g ? (stayed ? "still shown" : "hidden in the gap") : "no bubble" });
  // Fixed in v0.1.3: leaving the bubble hides it (before, only the trigger listened).
  await page.mouse.move(t.x + 300, t.y + 300); await page.waitForTimeout(300);
  const left = await bubble(page);
  out.push({ name: "moving the pointer off the bubble hides it", ok: stayed && !left, detail: left ? "still shown" : "hidden" });
  // Reset for the keyboard checks: re-hover the trigger and leave it, which does hide the bubble.
  await page.mouse.move(t.x, t.y);
  await page.mouse.move(t.x + 300, t.y + 300);
  await page.waitForTimeout(300);

  // Keyboard focus, then Escape.
  await page.locator(TRIGGER).focus();
  await page.waitForTimeout(50);
  b = await bubble(page);
  out.push({ name: "keyboard focus on the trigger shows the bubble", ok: !!b, detail: b ? "shown" : "no bubble" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(50);
  b = await bubble(page);
  const focusKept = await page.evaluate((sel) => document.activeElement === document.querySelector(sel), TRIGGER);
  out.push({ name: "Escape hides the bubble without moving focus", ok: !b && focusKept, detail: `bubble ${b ? "shown" : "hidden"}, focus on trigger=${focusKept}` });

  await page.evaluate(() => document.activeElement.blur());
  await page.waitForTimeout(50);
  await page.locator(TRIGGER).focus();
  await page.evaluate(() => document.activeElement.blur());
  await page.waitForTimeout(50);
  b = await bubble(page);
  out.push({ name: "blurring the trigger hides the bubble", ok: !b, detail: b ? "still shown" : "hidden" });

  // Documented warning: no text means nothing would be named or shown.
  const warnings = [];
  const onConsole = (m) => { if (m.type() === "warning") warnings.push(m.text()); };
  page.on("console", onConsole);
  await page.evaluate(async () => {
    const tt = document.querySelector("rfg-tooltip");
    tt.text = "";
    await tt.updateComplete;
  });
  await page.waitForTimeout(50);
  page.off("console", onConsole);
  const warned = warnings.some((w) => w.includes("<rfg-tooltip>") && w.includes("no text"));
  out.push({ name: "an empty text logs the documented console warning", ok: warned, detail: warnings.join(" | ") || "no warning" });
  return out;
};

// "Next to the right edge, the tooltip flips to the left so it stays on screen."
const edge = async (page) => {
  await page.waitForSelector(TRIGGER);
  const t = await center(page, TRIGGER);
  await page.mouse.move(t.x, t.y);
  await page.waitForTimeout(50);
  const b = await bubble(page);
  const inside = !!b && b.rect.left >= 0 && b.rect.right <= b.vw && b.rect.top >= 0 && b.rect.bottom <= b.vh;
  return [
    { name: "near the right edge the bubble stays inside the viewport", ok: inside, detail: b ? `bubble ${Math.round(b.rect.left)}-${Math.round(b.rect.right)}, viewport ${b.vw}` : "no bubble" },
    { name: "the bubble doesn't cover its own trigger", ok: !!b && !b.overlapsTrigger, detail: b ? `overlaps=${b.overlapsTrigger}` : "no bubble" },
  ];
};

// A trigger with visible text keeps its own accessible name; `text` must not overwrite it.
const ownLabel = async (page) => {
  await page.waitForSelector(TRIGGER);
  const s = await page.evaluate(() => {
    const host = document.querySelector("rfg-tooltip rfg-button");
    const control = host.querySelector(".control");
    return { host: host.getAttribute("aria-label"), control: control.getAttribute("aria-label"), visible: control.textContent.trim() };
  });
  return [{
    name: "a trigger with visible text gets no aria-label from the tooltip",
    ok: s.host === null && s.control === null && s.visible === "Export report",
    detail: `host aria-label=${s.host}, control aria-label=${s.control}, text="${s.visible}"`,
  }];
};

module.exports = [
  { id: "components-tooltip--default", tag: "rfg-tooltip", run },
  { id: "components-tooltip--near-viewport-edge", tag: "rfg-tooltip", run: edge },
  { id: "components-tooltip--on-a-trigger-with-its-own-label", tag: "rfg-tooltip", run: ownLabel },
];
