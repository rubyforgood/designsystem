// Behavior checks for <rfg-popover>. Each `run` drives the story page from Node with real
// Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// The interaction contract components/README.md and the story promise: the trigger gets
// aria-expanded/aria-controls kept in step with the panel, focus moves into the panel, Escape
// closes and returns focus to the trigger, an outside click closes without moving focus, the
// closed panel is really hidden, and the open panel stays inside the viewport. axe and the
// keyboard audit only ever see the closed panel.

const snapshot = (page) =>
  page.evaluate(() => {
    const pop = document.querySelector("rfg-popover");
    const trigger = document.querySelector('rfg-button[slot="trigger"]');
    // <rfg-button> moves aria-* attributes onto its inner .control, the element assistive tech
    // actually sees, so read the state from whichever one carries it.
    const aria = trigger.hasAttribute("aria-controls") ? trigger : trigger.querySelector("[aria-controls]") || trigger;
    const panelId = aria.getAttribute("aria-controls");
    const panel = panelId && document.getElementById(panelId);
    const active = document.activeElement;
    const r = panel ? panel.getBoundingClientRect() : null;
    return {
      expanded: aria.getAttribute("aria-expanded"),
      panelFound: !!panel,
      panelShown: !!panel && !panel.hidden && getComputedStyle(panel).display !== "none",
      focusInPanel: !!panel && panel.contains(active),
      focusOnTrigger: trigger.contains(active),
      active: `${active.tagName.toLowerCase()}${active.className ? "." + active.className : ""}`,
      rect: r && { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) },
      vw: innerWidth,
      vh: innerHeight,
      events: window.__events || [],
    };
  });

async function prepare(page) {
  await page.waitForSelector('rfg-button[slot="trigger"] .control');
  await page.evaluate(() => {
    window.__events = [];
    const pop = document.querySelector("rfg-popover");
    pop.addEventListener("rfg-open", () => window.__events.push("open"));
    pop.addEventListener("rfg-close", () => window.__events.push("close"));
  });
}

const clickTrigger = async (page) => {
  await page.locator('rfg-button[slot="trigger"] .control').click();
  await page.waitForTimeout(100);
};

const run = async (page) => {
  const out = [];
  await prepare(page);
  let s = await snapshot(page);
  out.push({ name: "panel is hidden and aria-expanded is false before opening", ok: !s.panelShown && s.expanded === "false", detail: `shown=${s.panelShown} aria-expanded=${s.expanded}` });

  await clickTrigger(page);
  s = await snapshot(page);
  out.push({ name: "clicking the trigger shows the panel its aria-controls names, with aria-expanded true", ok: s.panelFound && s.panelShown && s.expanded === "true", detail: `found=${s.panelFound} shown=${s.panelShown} aria-expanded=${s.expanded}` });
  out.push({ name: "focus moves into the panel on open", ok: s.focusInPanel, detail: s.active });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(50);
  s = await snapshot(page);
  out.push({ name: "Escape closes the panel and sets aria-expanded false", ok: !s.panelShown && s.expanded === "false", detail: `shown=${s.panelShown} aria-expanded=${s.expanded}` });
  out.push({ name: "Escape returns focus to the trigger", ok: s.focusOnTrigger, detail: s.active });

  await clickTrigger(page);
  await page.mouse.click(s.vw - 5, s.vh - 5);
  await page.waitForTimeout(50);
  s = await snapshot(page);
  out.push({ name: "an outside click closes the panel", ok: !s.panelShown && s.expanded === "false", detail: `shown=${s.panelShown} aria-expanded=${s.expanded}` });
  out.push({ name: "rfg-open and rfg-close fire once per open and close", ok: s.events.join(",") === "open,close,open,close", detail: s.events.join(",") || "none" });
  // Not checked: "an outside click closes without moving focus." The story has nothing focusable
  // outside the popover, and a click on plain page background moves focus to <body> natively
  // after pointerdown, whatever close() did, so no check here could tell the two apart.
  return out;
};

// "Repositions to stay within the viewport": the story puts the trigger at the right edge.
const inViewport = async (page) => {
  await prepare(page);
  await clickTrigger(page);
  const s = await snapshot(page);
  const ok = !!s.rect && s.panelShown && s.rect.left >= 0 && s.rect.right <= s.vw && s.rect.top >= 0 && s.rect.bottom <= s.vh;
  return [{ name: "the open panel stays inside the viewport", ok, detail: s.rect ? `panel ${s.rect.left}-${s.rect.right} x ${s.rect.top}-${s.rect.bottom}, viewport ${s.vw}x${s.vh}` : "no panel" }];
};

module.exports = [
  { id: "components-popover--default", tag: "rfg-popover", run },
  { id: "components-popover--near-viewport-edge", tag: "rfg-popover", run: inViewport },
];
