// Behavior checks for <rfg-field>. `run` drives the story from Node (Playwright) and returns
// [{ name, ok, detail }]. See ../component-behavior-audit.js. The field wraps the host's own native
// control and promises: the label is connected to the control (clicking it focuses the control),
// `required` sets aria-required and shows the marker, `optional` shows "(optional)", and `error`
// sets aria-invalid plus aria-describedby pointing at the rendered error text, all removed again
// when the error is cleared.

// The state of every field in the story, read in the page.
const fields = () =>
  [...document.querySelectorAll("rfg-field")].map((f) => {
    const control = f.querySelector("input, select, textarea");
    const label = f.querySelector("label");
    const describedBy = control && control.getAttribute("aria-describedby");
    const described = describedBy ? document.getElementById(describedBy) : null;
    return {
      label: f.getAttribute("label"),
      required: f.hasAttribute("required"),
      optional: f.hasAttribute("optional"),
      error: f.error || "",
      hasControl: !!control,
      // The control sits inside the rendered wrapper, after its label, so label-then-control is
      // the visual and reading order.
      ordered: !!control && !!label && control.parentElement === label.parentElement &&
        !!(label.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING),
      labelFor: !!control && !!label && control.labels && [...control.labels].includes(label),
      ariaRequired: control && control.getAttribute("aria-required"),
      marker: !!f.querySelector(".required-marker"),
      optionalText: (f.querySelector(".optional-marker") || {}).textContent || "",
      ariaInvalid: control && control.getAttribute("aria-invalid"),
      describedBy,
      describedText: described ? described.textContent.trim() : null,
      describedVisible: !!described && described.getClientRects().length > 0,
    };
  });

const checkStatic = (all) => {
  const out = [];
  out.push({
    name: "each control is moved into the field, after its label",
    ok: all.every((f) => f.hasControl && f.ordered),
    detail: all.map((f) => `${f.label}:${f.ordered}`).join(", "),
  });
  out.push({
    name: "each label is the control's own <label> (label.for = control.id)",
    ok: all.every((f) => f.labelFor),
    detail: all.map((f) => `${f.label}:${f.labelFor}`).join(", "),
  });
  const reqBad = all.filter((f) => (f.ariaRequired === "true") !== f.required || f.marker !== f.required);
  out.push({
    name: "required fields, and only those, get aria-required and the marker",
    ok: reqBad.length === 0,
    detail: all.map((f) => `${f.label}: required=${f.required} aria-required=${f.ariaRequired} marker=${f.marker}`).join("; "),
  });
  const optBad = all.filter((f) => f.optional !== (f.optionalText.trim() === "(optional)"));
  out.push({
    name: "optional fields, and only those, show \"(optional)\"",
    ok: optBad.length === 0,
    detail: all.map((f) => `${f.label}:"${f.optionalText.trim()}"`).join(", "),
  });
  return out;
};

const base = async (page) => {
  await page.evaluate(() => Promise.all([...document.querySelectorAll("rfg-field")].map((f) => f.updateComplete)));
  const all = await page.evaluate(fields);
  if (all.length === 0) return { all, out: [{ name: "story renders a field", ok: false, detail: "none" }] };
  const out = checkStatic(all);
  // Clicking the visible label text focuses the control (what the for/id link is for).
  await page.locator("rfg-field label").first().click();
  const focused = await page.evaluate(() => {
    const control = document.querySelector("rfg-field").querySelector("input, select, textarea");
    return document.activeElement === control;
  });
  out.push({ name: "clicking the label focuses the control", ok: focused, detail: String(focused) });
  return { all, out };
};

const run = async (page) => (await base(page)).out;

const runError = async (page) => {
  const { all, out } = await base(page);
  if (all.length === 0) return out;
  const f = all[0];
  out.push({ name: "an error sets aria-invalid on the control", ok: f.ariaInvalid === "true", detail: String(f.ariaInvalid) });
  out.push({
    name: "aria-describedby points at a visible element holding the error text",
    ok: !!f.error && f.describedText !== null && f.describedText.includes(f.error) && f.describedVisible,
    detail: `${f.describedBy} -> ${JSON.stringify(f.describedText)}`,
  });
  // Clearing the error removes it everywhere.
  const cleared = await page.evaluate(async () => {
    const field = document.querySelector("rfg-field");
    field.error = "";
    await field.updateComplete;
    const control = field.querySelector("input, select, textarea");
    return {
      invalid: control.getAttribute("aria-invalid"),
      describedBy: control.getAttribute("aria-describedby"),
      errorShown: !!field.querySelector(".error"),
    };
  });
  out.push({
    name: "clearing the error removes aria-invalid, aria-describedby and the message",
    ok: cleared.invalid === null && cleared.describedBy === null && !cleared.errorShown,
    detail: JSON.stringify(cleared),
  });
  return out;
};

module.exports = [
  { id: "components-field--default", tag: "rfg-field", run },
  { id: "components-field--with-error", tag: "rfg-field", run: runError },
  { id: "components-field--with-select-control", tag: "rfg-field", run },
  { id: "components-field--mixed-required-and-optional", tag: "rfg-field", run },
];
