// Behavior checks for <rfg-page-tabs>. The check runs inside the story page (page.evaluate) and
// returns [{ name, ok, detail }]. See ../component-behavior-audit.js. Page tabs are real links in
// a <nav>; the current one is marked with aria-current="page" by the host app, and the component's
// ::slotted() styles must make that one look current. A slotted-style rule that matches nothing
// (the <rfg-table> v0.1.0 defect) would leave every tab looking the same.

const check = async () => {
  const host = document.querySelector("rfg-page-tabs");
  if (!host) return [{ name: "story renders page tabs", ok: false, detail: "missing" }];
  await host.updateComplete;
  // Resolve a token to the computed color the browser would use, so the comparison doesn't
  // hardcode a color value.
  const token = (name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  };
  const links = [...host.querySelectorAll(":scope > a")];
  const current = links.filter((a) => a.getAttribute("aria-current") === "page");
  const others = links.filter((a) => !current.includes(a));
  if (links.length < 2 || current.length !== 1) {
    return [{ name: "story has several tabs, exactly one current", ok: false, detail: `${links.length} links, ${current.length} current` }];
  }
  const out = [];
  const nav = host.shadowRoot && host.shadowRoot.querySelector("nav");
  const slot = nav && nav.querySelector("slot");
  const assigned = slot ? slot.assignedElements() : [];
  out.push({
    name: "every tab link is inside the <nav> landmark",
    ok: !!nav && links.every((a) => assigned.includes(a)),
    detail: nav ? `${assigned.length} of ${links.length} assigned` : "no nav",
  });
  out.push({
    name: "the nav is named by the label attribute",
    ok: !!nav && nav.getAttribute("aria-label") === host.getAttribute("label"),
    detail: nav ? `"${nav.getAttribute("aria-label")}"` : "no nav",
  });
  const brand700 = token("--color-brand-700");
  const brand600 = token("--color-brand-600");
  const cs = getComputedStyle(current[0]);
  out.push({
    name: "the current tab is brand-colored and underlined",
    ok: cs.color === brand700 && cs.borderBottomColor === brand600 && parseFloat(cs.borderBottomWidth) >= 2,
    detail: `color ${cs.color}, border ${cs.borderBottomWidth} ${cs.borderBottomColor}`,
  });
  const lookCurrent = others.filter((a) => {
    const s = getComputedStyle(a);
    return s.color === brand700 || s.borderBottomColor === brand600;
  });
  out.push({
    name: "no other tab looks current",
    ok: lookCurrent.length === 0,
    detail: lookCurrent.map((a) => a.textContent.trim()).join(", ") || "none",
  });
  const pad = parseFloat(getComputedStyle(others[0]).paddingTop);
  out.push({
    name: "tabs keep their padding (10px top)",
    ok: Math.abs(pad - 10) < 0.5,
    detail: `${pad}px`,
  });
  return out;
};

// The same checks on a page with a CSS reset (Tailwind's preflight): the page's rules beat
// ::slotted, so the component's slotted styles are !important.
module.exports = [
  { id: "components-page-tabs--default", tag: "rfg-page-tabs", check },
  { id: "components-page-tabs--under-a-css-reset", tag: "rfg-page-tabs", check },
];
