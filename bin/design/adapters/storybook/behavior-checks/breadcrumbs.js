// Behavior checks for <rfg-breadcrumbs>. The check runs inside the story page (page.evaluate) and
// returns [{ name, ok, detail }]. See ../component-behavior-audit.js. components/README.md promises
// the WAI-ARIA breadcrumb pattern: a <nav aria-label="Breadcrumb"> around an ordered list in item
// order, every entry with an href a real link, the entry without one marked aria-current="page"
// and not a link (no self-link), and a separator drawn between entries (never before the first).

const check = async () => {
  const host = document.querySelector("rfg-breadcrumbs");
  if (!host) return [{ name: "story renders breadcrumbs", ok: false, detail: "missing" }];
  await host.updateComplete;
  const items = host.items || [];
  if (items.length < 2) return [{ name: "story has at least two items", ok: false, detail: String(items.length) }];
  const root = host.shadowRoot;
  const nav = root.querySelector("nav");
  const lis = [...root.querySelectorAll("nav > ol > li")];
  const out = [];
  out.push({
    name: "a nav named by label (default \"Breadcrumb\") holds an ordered list",
    ok: !!nav && nav.getAttribute("aria-label") === (host.label || "Breadcrumb") && lis.length > 0,
    detail: nav ? `aria-label=${nav.getAttribute("aria-label")}, ${lis.length} li` : "no nav",
  });
  const labels = lis.map((li) => li.textContent.trim());
  out.push({
    name: "one list item per entry, in order",
    ok: labels.join("|") === items.map((i) => i.label).join("|"),
    detail: labels.join(" > "),
  });
  const wrong = items.filter((item, i) => {
    const li = lis[i];
    if (!li) return true;
    const a = li.querySelector("a");
    const cur = li.querySelector('[aria-current="page"]');
    return item.href ? !(a && a.getAttribute("href") === item.href && !cur) : !(cur && !a);
  });
  out.push({
    name: "linked entries are links; the entry without href is aria-current=\"page\", not a link",
    ok: wrong.length === 0,
    detail: wrong.map((i) => i.label).join(", ") || "all correct",
  });
  // The separator is a ::before mask on every item but the first.
  const seps = lis.map((li) => {
    const b = getComputedStyle(li, "::before");
    return b.content !== "none" && b.content !== "normal" && parseFloat(b.width) > 0;
  });
  out.push({
    name: "a separator sits between entries, not before the first",
    ok: seps.length > 1 && !seps[0] && seps.slice(1).every(Boolean),
    detail: seps.map(Number).join(""),
  });
  return out;
};

module.exports = [
  { id: "components-breadcrumbs--default", tag: "rfg-breadcrumbs", check },
  { id: "components-breadcrumbs--two-levels", tag: "rfg-breadcrumbs", check },
];
