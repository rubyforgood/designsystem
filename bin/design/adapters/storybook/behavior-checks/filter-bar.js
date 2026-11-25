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

// The folded bar's layout and starting state (fixed in v0.1.5). Measured on a 1280px page: the
// "Filters" trigger's vertical center against the search field's, and the folded fields' positions
// once open. Before the fix the trigger sat 10px low and the six fields stacked in one 160px column.
// Helpers are defined inside each check: checks are serialized into the page, so no closures.

const layout = async () => {
  const open = (bar) => bar.shadowRoot.querySelector("rfg-disclosure");
  const trigger = (bar) => open(bar)?.shadowRoot.querySelector(".trigger");
  const bar = document.querySelector("rfg-filter-bar");
  await bar.updateComplete;
  const d = open(bar);
  if (!d) return [{ name: "four filters fold behind a disclosure", ok: false, detail: "no disclosure" }];
  await d.updateComplete;
  const out = [];
  out.push({ name: "folded filters start closed when none is set", ok: d.open === false, detail: `open=${d.open}` });
  const search = bar.querySelector('[slot="search"] input').getBoundingClientRect();
  const t = trigger(bar).getBoundingClientRect();
  const gap = Math.abs((search.top + search.height / 2) - (t.top + t.height / 2));
  out.push({ name: "the Filters trigger lines up with the search field", ok: gap <= 1, detail: `${gap.toFixed(1)}px apart` });
  trigger(bar).click();
  await d.updateComplete;
  const boxes = [...bar.querySelectorAll('[slot="fields"]')].map((f) => f.getBoundingClientRect());
  const columns = new Set(boxes.map((b) => Math.round(b.left))).size;
  out.push({ name: "open filters lay out in columns, not one stack", ok: columns >= 3, detail: `${columns} column(s) across ${boxes.length} fields` });
  const below = boxes.every((b) => b.top > search.bottom);
  out.push({ name: "open filters sit on their own line below the row", ok: below, detail: below ? "below" : "overlapping the row" });
  return out;
};

const startsOpen = async () => {
  const open = (bar) => bar.shadowRoot.querySelector("rfg-disclosure");
  const trigger = (bar) => open(bar)?.shadowRoot.querySelector(".trigger");
  const bar = document.querySelector("rfg-filter-bar");
  await bar.updateComplete;
  const d = open(bar);
  if (!d) return [{ name: "four filters fold behind a disclosure", ok: false, detail: "no disclosure" }];
  await d.updateComplete;
  const panel = d.shadowRoot.querySelector(".panel");
  return [
    { name: "folded filters start open when one is set", ok: d.open === true && !panel.hidden, detail: `open=${d.open}` },
    { name: "the trigger says it's expanded", ok: trigger(bar).getAttribute("aria-expanded") === "true", detail: trigger(bar).getAttribute("aria-expanded") },
  ];
};

module.exports = [
  { id: "components-filter-bar--search-with-folded-filters", tag: "rfg-filter-bar", check: layout },
  { id: "components-filter-bar--a-filter-is-set", tag: "rfg-filter-bar", check: startsOpen },
  { id: "components-filter-bar--two-controls-shown-inline", tag: "rfg-filter-bar", check },
  { id: "components-filter-bar--four-controls-fold", tag: "rfg-filter-bar", check },
];
