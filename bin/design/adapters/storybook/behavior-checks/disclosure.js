// Behavior checks for <rfg-disclosure>. Each `run` drives the story page from Node with real
// Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// What components/README.md and the story promise: the trigger is a real button whose
// aria-expanded tracks whether the panel is actually shown, Enter and Space toggle it, the label
// stays the same in both states, `open` reflects, and rfg-toggle fires with { open }.


const state = (page) =>
  page.evaluate(() => {
    const el = document.querySelector("rfg-disclosure");
    const button = el.shadowRoot.querySelector("button");
    const content = el.firstElementChild; // the slotted panel content
    const r = content.getBoundingClientRect();
    return {
      expanded: button.getAttribute("aria-expanded"),
      // Rendered and taking up space, not just present in the DOM.
      shown: r.width > 0 && r.height > 0 && content.checkVisibility(),
      openAttr: el.hasAttribute("open"),
      name: button.textContent.trim(),
      toggles: window.__toggles || [],
    };
  });

async function prepare(page) {
  await page.waitForFunction(() => document.querySelector("rfg-disclosure")?.shadowRoot?.querySelector("button"));
  await page.evaluate(() => {
    window.__toggles = [];
    document.querySelector("rfg-disclosure").addEventListener("rfg-toggle", (e) => window.__toggles.push(e.detail));
  });
}

const focusTrigger = (page) => page.evaluate(() => document.querySelector("rfg-disclosure").shadowRoot.querySelector("button").focus());

const run = async (page) => {
  const out = [];
  await prepare(page);
  let s = await state(page);
  const closedName = s.name;
  out.push({ name: "starts closed: content hidden, aria-expanded false", ok: !s.shown && s.expanded === "false", detail: `shown=${s.shown} aria-expanded=${s.expanded}` });

  // Playwright's CSS locators pierce open shadow roots, so this is a real mouse click.
  await page.locator("rfg-disclosure button").click();
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "clicking shows the content and sets aria-expanded true", ok: s.shown && s.expanded === "true", detail: `shown=${s.shown} aria-expanded=${s.expanded}` });
  out.push({ name: "`open` reflects to the attribute", ok: s.openAttr, detail: `open attribute=${s.openAttr}` });
  out.push({ name: "the trigger's label stays the same when open", ok: s.name === closedName && s.name === "More filters", detail: `closed "${closedName}", open "${s.name}"` });
  out.push({ name: "rfg-toggle fires with { open: true }", ok: s.toggles.length === 1 && s.toggles[0].open === true, detail: JSON.stringify(s.toggles) });

  await focusTrigger(page);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "Enter toggles it closed (content hidden, aria-expanded false)", ok: !s.shown && s.expanded === "false" && !s.openAttr, detail: `shown=${s.shown} aria-expanded=${s.expanded} open=${s.openAttr}` });
  await page.keyboard.press("Space");
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "Space toggles it open again", ok: s.shown && s.expanded === "true", detail: `shown=${s.shown} aria-expanded=${s.expanded}` });
  out.push({ name: "rfg-toggle reports each state change", ok: s.toggles.map((t) => t.open).join() === "true,false,true", detail: JSON.stringify(s.toggles) });
  return out;
};

const openByDefault = async (page) => {
  await prepare(page);
  const s = await state(page);
  return [{ name: "`open` set in the markup renders the content shown with aria-expanded true", ok: s.shown && s.expanded === "true", detail: `shown=${s.shown} aria-expanded=${s.expanded}` }];
};

module.exports = [
  { id: "components-disclosure--default", tag: "rfg-disclosure", run },
  { id: "components-disclosure--open-by-default", tag: "rfg-disclosure", run: openByDefault },
];
