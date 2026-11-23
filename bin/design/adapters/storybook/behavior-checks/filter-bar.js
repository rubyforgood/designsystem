// Behavior checks for <rfg-filter-bar>. Each check function runs inside the story page (page.evaluate),
// so it can only use browser APIs, and returns [{ name, ok, detail }]. See ../component-behavior-audit.js.
// v0.1.0 shipped with no control belonging to the bar's form, so it submitted nothing.

const check = async () => {
  const bar = document.querySelector("rfg-filter-bar");
  if (!bar) return [{ name: "story renders a filter bar", ok: false, detail: "missing" }];
  await bar.updateComplete;
  const controls = [...bar.querySelectorAll("input, select, textarea")];
  const named = controls.filter((c) => c.name);
  if (named.length === 0) return [{ name: "story has named controls to submit", ok: false, detail: "none" }];
  const form = bar.form;
  const out = [];
  out.push({ name: "bar exposes its form", ok: form instanceof HTMLFormElement, detail: String(form) });
  const orphans = controls.filter((c) => !c.form || c.form !== form).map((c) => c.name || c.id || c.tagName);
  out.push({ name: "every control belongs to the bar's form", ok: !!form && orphans.length === 0, detail: orphans.join(", ") || "all" });
  let submitted = null;
  if (form) {
    form.addEventListener("submit", (e) => { e.preventDefault(); submitted = [...new FormData(form).keys()]; }, { once: true });
    form.requestSubmit();
  }
  const missing = named.map((c) => c.name).filter((n) => !(submitted || []).includes(n));
  out.push({ name: "submitting sends every named control", ok: submitted !== null && missing.length === 0, detail: submitted === null ? "no submit" : `missing: ${missing.join(", ") || "none"}` });
  out.push({ name: "form submits with GET", ok: !!form && form.method === "get", detail: form ? form.method : "no form" });
  return out;
};

module.exports = [
  { id: "components-filter-bar--two-controls-shown-inline", tag: "rfg-filter-bar", check },
  { id: "components-filter-bar--four-controls-fold", tag: "rfg-filter-bar", check },
];
