// Behavior checks for <rfg-conditional-reveal>. Each `run` drives the story page from Node with
// real Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// What components/README.md and the story promise: the revealed field is really hidden until its
// answer is chosen (not reachable by Tab), appears when it is and hides again when it isn't, sits
// next in keyboard order after the trigger, carries the left rule tying it to its option, adds
// no ARIA to the trigger, and renders visible on first paint when `shown` is set in the markup.

const state = (page) =>
  page.evaluate(() => {
    const el = document.querySelector("rfg-conditional-reveal");
    const cs = getComputedStyle(el);
    const field = el.querySelector("input, select, textarea");
    // The token's computed color, resolved the same way the browser resolves the border.
    const probe = document.createElement("div");
    probe.style.color = "var(--color-neutral-200)";
    document.body.append(probe);
    const token = getComputedStyle(probe).color;
    probe.remove();
    return {
      shown: el.checkVisibility() && el.getBoundingClientRect().height > 0,
      shownAttr: el.hasAttribute("shown"),
      borderWidth: cs.borderLeftWidth,
      borderColor: cs.borderLeftColor,
      token,
      fieldFocused: !!field && document.activeElement === field,
      active: document.activeElement.tagName.toLowerCase() + (document.activeElement.value ? `[value=${document.activeElement.value}]` : ""),
      triggerAria: [...document.querySelectorAll('input[type="radio"]')].flatMap((r) => [...r.attributes].map((a) => a.name).filter((n) => n.startsWith("aria-"))),
    };
  });

const run = async (page) => {
  const out = [];
  await page.waitForSelector('input[value="shipped"]');
  let s = await state(page);
  out.push({ name: "starts hidden while the revealing answer isn't chosen", ok: !s.shown, detail: `shown=${s.shown}` });

  // Hidden means out of the Tab order too, not just invisible.
  await page.locator('input[value="pickup"]').focus();
  await page.keyboard.press("Tab");
  s = await state(page);
  out.push({ name: "the hidden field isn't reachable by Tab", ok: !s.fieldFocused, detail: `Tab from the checked radio went to ${s.active}` });

  await page.locator('input[value="shipped"]').check();
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "choosing the revealing answer shows the field", ok: s.shown && s.shownAttr, detail: `shown=${s.shown} shown attribute=${s.shownAttr}` });
  out.push({ name: "the revealed field carries the 2px left rule in --color-neutral-200", ok: s.borderWidth === "2px" && s.borderColor === s.token, detail: `${s.borderWidth} ${s.borderColor} (token ${s.token})` });

  await page.locator('input[value="shipped"]').focus();
  await page.keyboard.press("Tab");
  s = await state(page);
  out.push({ name: "Tab from the revealing option goes straight to the revealed field", ok: s.fieldFocused, detail: `focus on ${s.active}` });
  out.push({ name: "no ARIA is added to the trigger radios", ok: s.triggerAria.length === 0, detail: s.triggerAria.join(", ") || "none" });

  await page.locator('input[value="pickup"]').check();
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "choosing another answer hides the field again", ok: !s.shown, detail: `shown=${s.shown}` });
  return out;
};

// The story's own promise: with `shown` in the markup, the field is visible once loaded. (Whether
// it was ever hidden for a frame first isn't observable after load, so isn't claimed here.)
const shownInitially = async (page) => {
  await page.waitForSelector("rfg-conditional-reveal", { state: "attached" });
  const s = await state(page);
  return [{ name: "`shown` in the markup renders it visible on load", ok: s.shown && s.borderWidth === "2px", detail: `shown=${s.shown} border ${s.borderWidth}` }];
};

module.exports = [
  { id: "components-conditional-reveal--default", tag: "rfg-conditional-reveal", run },
  { id: "components-conditional-reveal--shown-initially", tag: "rfg-conditional-reveal", run: shownInitially },
];
