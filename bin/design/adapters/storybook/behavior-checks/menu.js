// Behavior checks for <rfg-menu>. Each `run` drives the story page from Node with real
// Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// What components/README.md and the story promise on top of <rfg-popover>: Down/Up Arrow on the
// trigger open the menu on the first/last item; Up/Down Arrow, Home and End move between items
// (wrapping); Escape closes and returns focus to the trigger; choosing an item closes the menu; a
// disabled aria-disabled item stays reachable and choosing it does nothing; the open panel keeps
// its menu padding/min-width even after it portals to <body> (a shipped regression, see menu.js).

const TRIGGER = 'rfg-menu rfg-button[slot="trigger"] .control';

const state = (page) =>
  page.evaluate(() => {
    const control = document.querySelector('rfg-menu rfg-button[slot="trigger"] .control');
    const panel = document.getElementById(control.getAttribute("aria-controls"));
    const a = document.activeElement;
    return {
      open: !!panel && !panel.hidden,
      expanded: control.getAttribute("aria-expanded"),
      focus: a.getAttribute("role") === "menuitem" ? a.textContent.trim().split("\n")[0].trim() : a === control ? "(trigger)" : a.tagName.toLowerCase(),
      minWidth: panel ? getComputedStyle(panel).minWidth : null,
      paddingLeft: panel ? getComputedStyle(panel).paddingLeft : null,
    };
  });

const press = async (page, key) => {
  await page.keyboard.press(key);
  await page.waitForTimeout(50);
  return state(page);
};

async function openWith(page, key) {
  await page.waitForSelector(TRIGGER);
  await page.locator(TRIGGER).focus();
  return press(page, key);
}

const run = async (page) => {
  const out = [];
  let s = await openWith(page, "ArrowDown");
  out.push({ name: "Down Arrow on the trigger opens the menu on the first item", ok: s.open && s.expanded === "true" && s.focus === "Edit", detail: `open=${s.open} aria-expanded=${s.expanded} focus=${s.focus}` });
  // 0.25rem 0 padding and a 12rem min-width, from the [role=menu] rule, measured on the portalled panel.
  out.push({ name: "the open (portalled) panel keeps the menu's min-width and flush rows", ok: s.minWidth === "192px" && s.paddingLeft === "0px", detail: `min-width ${s.minWidth}, padding-left ${s.paddingLeft}` });

  const seq = [];
  for (const k of ["ArrowDown", "End", "ArrowDown", "ArrowUp", "Home"]) seq.push((await press(page, k)).focus);
  const want = ["Share", "Delete project", "Edit", "Delete project", "Edit"];
  out.push({ name: "Down/Up Arrow, Home and End move between items, wrapping at the ends", ok: seq.join("|") === want.join("|"), detail: seq.join(" > ") });

  s = await press(page, "Escape");
  out.push({ name: "Escape closes the menu and returns focus to the trigger", ok: !s.open && s.expanded === "false" && s.focus === "(trigger)", detail: `open=${s.open} aria-expanded=${s.expanded} focus=${s.focus}` });

  s = await press(page, "ArrowUp");
  out.push({ name: "Up Arrow on the trigger opens the menu on the last item", ok: s.open && s.focus === "Delete project", detail: `open=${s.open} focus=${s.focus}` });

  s = await press(page, "Enter");
  out.push({ name: "choosing an item closes the menu", ok: !s.open && s.expanded === "false", detail: `open=${s.open} aria-expanded=${s.expanded}` });
  return out;
};

const disabled = async (page) => {
  const out = [];
  let s = await openWith(page, "ArrowDown");
  const seq = [s.focus];
  for (let i = 0; i < 2; i++) seq.push((await press(page, "ArrowDown")).focus);
  out.push({ name: "an aria-disabled item stays reachable by arrow key", ok: seq.includes("Delete project"), detail: seq.join(" > ") });
  // Fixed in v0.1.3 (story and docs): the disabled button item now uses aria-disabled, as the docs
  // say a disabled item must, so it stays reachable. A native `disabled` button is skipped by design.
  out.push({ name: "a disabled button item stays reachable by arrow key", ok: seq.includes("Archive"), detail: seq.join(" > ") });

  const box = await page.evaluate(() => {
    const r = document.querySelector('[role="menuitem"][aria-disabled="true"]').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "clicking an aria-disabled item does nothing and leaves the menu open", ok: s.open, detail: `open=${s.open}` });
  return out;
};

// Items keep their default look under a page's reset (Tailwind's preflight, in @layer base), a form's
// item spans the menu, and the panel takes the control radius. Found on SkillRx's account menu.
const underReset = async (page) => {
  const out = [];
  await page.waitForSelector(TRIGGER);
  await page.locator(TRIGGER).click();
  await page.waitForTimeout(100);
  const m = await page.evaluate(() => {
    const control = document.querySelector('rfg-menu rfg-button[slot="trigger"] .control');
    const panel = document.getElementById(control.getAttribute("aria-controls"));
    const items = [...panel.querySelectorAll('[role="menuitem"]')];
    const box = (el) => el.getBoundingClientRect();
    return {
      radius: getComputedStyle(panel).borderTopLeftRadius,
      panelWidth: box(panel).width - 2,
      items: items.map((el) => ({ text: el.textContent.trim(), padding: getComputedStyle(el).padding, width: box(el).width, size: getComputedStyle(el).fontSize, weight: getComputedStyle(el).fontWeight })),
    };
  });
  out.push({ name: "the panel takes the control radius (8px), not the surface radius", ok: m.radius === "8px", detail: `radius ${m.radius}` });
  out.push({ name: "items keep 8px 12px padding and 14px text under a reset", ok: m.items.every((i) => i.padding === "8px 12px" && i.size === "14px"), detail: JSON.stringify(m.items) });
  // Regular weight, as Human Essentials' items (which set none) have always been.
  out.push({ name: "items are regular weight (400)", ok: m.items.every((i) => i.weight === "400"), detail: m.items.map((i) => i.weight).join(", ") });
  out.push({ name: "an item inside a form spans the menu", ok: m.items.every((i) => Math.abs(i.width - m.panelWidth) <= 1), detail: `panel ${m.panelWidth}px, items ${m.items.map((i) => i.width).join(", ")}px` });
  return out;
};

module.exports = [
  { id: "components-menu--default", tag: "rfg-menu", run },
  { id: "components-menu--with-a-disabled-item", tag: "rfg-menu", run: disabled },
  { id: "components-menu--under-a-css-reset", tag: "rfg-menu", run: underReset },
];
