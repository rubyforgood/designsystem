// Behavior checks for <rfg-modal>. Each `run` drives the story page from Node with real
// Playwright input and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// The modal's promises (components/README.md, the story description): it opens as a real modal
// dialog, focus moves in and stays in, Escape / Close / backdrop all close it, focus returns to
// the opener, and it fires rfg-close. None of that is visible to axe or the keyboard audit, which
// only ever see the closed dialog.

// The deepest focused element, through shadow roots, described for a failure message.
const ACTIVE = () => {
  let a = document.activeElement;
  while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
  return a;
};

async function openFromTrigger(page) {
  await page.waitForSelector("rfg-button .control");
  await page.evaluate(() => {
    window.__rfgClose = 0;
    document.querySelector("rfg-modal").addEventListener("rfg-close", () => window.__rfgClose++);
  });
  // The first rfg-button on the page is the opener; the footer buttons are inside the modal.
  await page.locator("rfg-button:not([slot]) .control").first().click();
  await page.waitForTimeout(50);
}

const state = (page) =>
  page.evaluate((activeSrc) => {
    const active = new Function(`return (${activeSrc})()`)();
    const modal = document.querySelector("rfg-modal");
    const dialog = modal.shadowRoot.querySelector("dialog");
    const opener = document.querySelector("rfg-button:not([slot])");
    return {
      open: dialog.open,
      modal: dialog.matches(":modal"),
      inside: !!active && (modal.contains(active) || modal.shadowRoot.contains(active)),
      onOpener: !!active && opener.contains(active),
      tag: active ? active.tagName.toLowerCase() : "none",
      active: active ? `${active.tagName.toLowerCase()}${active.className ? "." + active.className : ""}` : "none",
      closes: window.__rfgClose,
    };
  }, ACTIVE.toString());

// Reopens from the trigger, first force-closing the native <dialog> directly so one failed close
// check can't block the next (the trigger is inert behind an open modal).
async function reopen(page) {
  await page.evaluate(() => {
    const d = document.querySelector("rfg-modal").shadowRoot.querySelector("dialog");
    if (d.open) HTMLDialogElement.prototype.close.call(d);
  });
  await page.locator("rfg-button:not([slot]) .control").first().click();
  await page.waitForTimeout(50);
}

const run = async (page) => {
  const out = [];
  await openFromTrigger(page);
  let s = await state(page);
  out.push({ name: "the trigger opens it as a modal dialog (showModal, not show)", ok: s.open && s.modal, detail: `open=${s.open} :modal=${s.modal}` });
  out.push({ name: "focus moves into the modal on open", ok: s.inside, detail: s.active });

  // Focus stays in: tab round the whole cycle and never land on the page behind.
  const escaped = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const t = await state(page);
    // Native <dialog> lets focus pass through the browser's own chrome (reported as <body>) at the
    // end of its cycle; that's not the page behind.
    if (!t.inside && t.tag !== "body") escaped.push(t.active);
  }
  out.push({ name: "Tab never reaches the page behind the modal", ok: escaped.length === 0, detail: escaped.join(", ") || "stayed inside" });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "Escape closes it", ok: !s.open, detail: `open=${s.open}` });
  out.push({ name: "focus returns to the opener on close", ok: s.onOpener, detail: s.active });
  out.push({ name: "rfg-close fires once on close", ok: s.closes === 1, detail: `fired ${s.closes}x` });

  // Close button.
  await reopen(page);
  await page.locator("rfg-modal button.close").click();
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "the Close button closes it", ok: !s.open, detail: `open=${s.open}` });

  // Backdrop click: a point inside the viewport but outside the dialog box.
  await reopen(page);
  await page.mouse.click(5, 5);
  await page.waitForTimeout(50);
  s = await state(page);
  out.push({ name: "a click on the backdrop closes it", ok: !s.open, detail: `open=${s.open}` });
  return out;
};

// The footer only renders when something is slotted into it.
const footer = (expectShown) => async (page) => {
  await openFromTrigger(page);
  const display = await page.evaluate(() => getComputedStyle(document.querySelector("rfg-modal").shadowRoot.querySelector(".footer")).display);
  return [{
    name: expectShown ? "the footer shows when footer actions are slotted" : "no footer renders when the footer slot is empty",
    ok: expectShown ? display !== "none" : display === "none",
    detail: `footer display: ${display}`,
  }];
};

module.exports = [
  { id: "components-modal--default", tag: "rfg-modal", run },
  { id: "components-modal--default", tag: "rfg-modal", run: footer(true) },
  { id: "components-modal--no-footer", tag: "rfg-modal", run: footer(false) },
];
