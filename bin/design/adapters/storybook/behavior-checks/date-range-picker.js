const { fieldEdge } = require("../field-edge");
// Behavior checks for <rfg-date-range-picker>. Each `run` drives the story page from Node with
// real Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// What components/README.md and the story promise: choosing a preset applies it at once (rfg-change
// with { start, end, label }), closes the panel and renames the trigger; the matching preset carries
// aria-current; a custom range shows its dates on the trigger; editing the custom dates commits
// once after a pause (debounced), keeps the panel open, and swaps an inverted range rather than
// erroring; Escape closes and returns focus to the trigger.

const TRIGGER = "rfg-date-range-picker rfg-button .control";

const state = (page) =>
  page.evaluate(() => {
    const picker = document.querySelector("rfg-date-range-picker");
    const host = picker.shadowRoot.querySelector('rfg-button[slot="trigger"]');
    const control = host.querySelector(".control");
    const panel = control.getAttribute("aria-controls") && (document.getElementById(control.getAttribute("aria-controls")) || picker.shadowRoot.getElementById(control.getAttribute("aria-controls")));
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    const presets = panel ? [...panel.querySelectorAll(".rfg-drp-preset")] : [];
    return {
      open: !!panel && !panel.hidden,
      label: control.textContent.trim(),
      current: presets.filter((p) => p.getAttribute("aria-current") === "true").map((p) => p.textContent.trim()),
      focusOnTrigger: a === control,
      start: picker.start,
      end: picker.end,
      events: window.__changes || [],
    };
  });

async function prepare(page) {
  await page.waitForSelector(TRIGGER);
  await page.evaluate(() => {
    window.__changes = [];
    document.querySelector("rfg-date-range-picker").addEventListener("rfg-change", (e) => window.__changes.push(e.detail));
  });
}

const openPanel = async (page) => {
  await page.locator(TRIGGER).click();
  await page.waitForTimeout(100);
};

const preset = async (page) => {
  const out = [];
  await prepare(page);
  let s = await state(page);
  out.push({ name: "with no range the trigger asks for one", ok: s.label === "Select a date range", detail: `"${s.label}"` });

  await openPanel(page);
  await page.locator(".rfg-drp-preset", { hasText: "Last 7 days" }).click();
  await page.waitForTimeout(50);
  s = await state(page);
  const d = s.events[0] || {};
  out.push({
    name: "choosing a preset fires one rfg-change with { start, end, label }",
    ok: s.events.length === 1 && d.start === "2026-11-12" && d.end === "2026-11-19" && d.label === "Last 7 days",
    detail: JSON.stringify(s.events),
  });
  out.push({ name: "choosing a preset closes the panel and renames the trigger", ok: !s.open && s.label === "Last 7 days", detail: `open=${s.open} label="${s.label}"` });

  await openPanel(page);
  s = await state(page);
  out.push({ name: "aria-current marks the chosen preset, and only it", ok: s.current.join("|") === "Last 7 days", detail: s.current.join(", ") || "none" });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "Escape closes the panel and returns focus to the trigger", ok: !s.open && s.focusOnTrigger, detail: `open=${s.open} focusOnTrigger=${s.focusOnTrigger}` });

  // The open panel is moved to <body> by <rfg-popover>, out of reach of the picker's shadow styles.
  // Fixed in v0.1.3 by injecting the panel styles into the document; before, none of them applied.
  // Reopen it (Escape just closed it): "Last 7 days" is still the current preset.
  await openPanel(page);
  const look = await page.evaluate(() => {
    const p = document.querySelector(".rfg-drp-panel");
    const presets = document.querySelector(".rfg-drp-presets");
    const current = document.querySelector('.rfg-drp-preset[aria-current="true"]');
    const probe = document.createElement("div");
    probe.style.background = "var(--color-brand-50)";
    document.body.appendChild(probe);
    const brand50 = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      display: p ? getComputedStyle(p).display : "no panel",
      divider: presets ? getComputedStyle(presets).borderRightWidth : "no presets",
      currentBg: current ? getComputedStyle(current).backgroundColor : "no current preset",
      brand50,
    };
  });
  out.push({ name: "the open panel lays presets beside the date fields", ok: look.display === "flex", detail: look.display });
  out.push({ name: "a divider separates the presets from the date fields", ok: parseFloat(look.divider) >= 1, detail: look.divider });
  out.push({ name: "the current preset is tinted brand-50", ok: look.currentBg === look.brand50, detail: `${look.currentBg} vs ${look.brand50}` });
  await page.keyboard.press("Escape");
  return out;
};

const selected = async (page) => {
  await prepare(page);
  await openPanel(page);
  const s = await state(page);
  return [
    { name: "a range matching a preset shows the preset's name on the trigger", ok: s.label === "Last 30 days", detail: `"${s.label}"` },
    { name: "aria-current marks the matching preset on load", ok: s.current.join("|") === "Last 30 days", detail: s.current.join(", ") || "none" },
  ];
};

const custom = async (page) => {
  const out = [];
  await prepare(page);
  let s = await state(page);
  // Formatted with the runtime locale, so check it's the dates, not their exact spelling.
  out.push({ name: "a range matching no preset shows its dates on the trigger", ok: /2026/.test(s.label) && s.label.includes("–"), detail: `"${s.label}"` });

  await openPanel(page);
  s = await state(page);
  out.push({ name: "no preset is aria-current for a custom range", ok: s.current.length === 0, detail: s.current.join(", ") || "none" });

  // Set From after To (inverted), then To, within the debounce window.
  const inputs = page.locator('input[type="date"]');
  await inputs.nth(0).fill("2026-10-05");
  await inputs.nth(1).fill("2026-10-01");
  await page.waitForTimeout(150);
  s = await state(page);
  out.push({ name: "custom edits don't commit before the pause", ok: s.events.length === 0, detail: `${s.events.length} rfg-change after 150ms` });
  await page.waitForTimeout(500);
  s = await state(page);
  const d = s.events[0] || {};
  out.push({ name: "two quick edits commit once", ok: s.events.length === 1, detail: `${s.events.length} rfg-change` });
  out.push({ name: "an inverted range is swapped, not rejected", ok: d.start === "2026-10-01" && d.end === "2026-10-05", detail: JSON.stringify(d) });
  out.push({ name: "the panel stays open while custom dates are edited", ok: s.open, detail: `open=${s.open}` });
  out.push(await fieldEdge(page, () => document.querySelector('.rfg-drp-custom input[type="date"]'), "custom range date fields have a 3:1 edge (WCAG 1.4.11)"));
  return out;
};

module.exports = [
  { id: "components-date-range-picker--default", tag: "rfg-date-range-picker", run: preset },
  { id: "components-date-range-picker--with-range-already-selected", tag: "rfg-date-range-picker", run: selected },
  { id: "components-date-range-picker--with-custom-range", tag: "rfg-date-range-picker", run: custom },
];
