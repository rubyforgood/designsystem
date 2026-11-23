// Behavior checks for <rfg-empty-state>. Each check function runs inside the story page
// (page.evaluate), so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: `kind` is reflected so the host's
// markup states which case it handles (README), the heading and body show, a slotted action
// actually shows, and an unknown kind warns.

const check = async () => {
  const el = document.querySelector("rfg-empty-state");
  if (!el) return [{ name: "story renders an empty state", ok: false, detail: "missing" }];
  await el.updateComplete;
  const root = el.shadowRoot;
  const out = [];
  out.push({ name: "kind is reflected as an attribute", ok: !!el.kind && el.getAttribute("kind") === el.kind, detail: `${el.kind} / ${el.getAttribute("kind")}` });
  const h = root.querySelector(".heading");
  const b = root.querySelector(".body");
  out.push({ name: "heading shows", ok: !!h && h.textContent.trim() === el.heading && h.getBoundingClientRect().height > 0, detail: h ? h.textContent.trim() : "none" });
  out.push({ name: "body shows", ok: !!b && b.textContent.trim() === el.body && b.getBoundingClientRect().height > 0, detail: b ? b.textContent.trim() : "none" });
  out.push({ name: "message is centered", ok: getComputedStyle(root.querySelector(".empty")).textAlign === "center", detail: getComputedStyle(root.querySelector(".empty")).textAlign });
  const actions = [...el.children];
  const slot = root.querySelector(".action slot");
  const assigned = slot ? slot.assignedElements() : [];
  // design.md: cold-start and no-results offer a next step; all-clear reassures with no action.
  if (el.kind !== "all-clear") {
    out.push({
      name: "slotted action shows below the message",
      ok: actions.length > 0 && assigned.length === actions.length && actions.every((a) => a.getBoundingClientRect().height > 0 && !!b && a.getBoundingClientRect().top >= b.getBoundingClientRect().bottom),
      detail: `${assigned.length} assigned, ${actions.map((a) => Math.round(a.getBoundingClientRect().height)).join(",")}px tall`,
    });
  } else {
    out.push({ name: "all-clear offers no action", ok: actions.length === 0 && assigned.length === 0, detail: `${el.kind}, ${assigned.length} actions` });
  }
  return out;
};

// An unknown kind warns; a valid one doesn't.
const warnCheck = async () => {
  const el = document.querySelector("rfg-empty-state");
  if (!el) return [{ name: "story renders an empty state", ok: false, detail: "missing" }];
  await el.updateComplete;
  const warnings = [];
  const orig = console.warn;
  console.warn = (...a) => { warnings.push(a.join(" ")); orig.apply(console, a); };
  try {
    el.kind = "cold-start";
    await el.updateComplete;
    const valid = warnings.length;
    el.kind = "nothing-here";
    await el.updateComplete;
    return [
      { name: "a valid kind doesn't warn", ok: valid === 0, detail: `${valid} warnings` },
      { name: "an unknown kind warns", ok: warnings.some((w) => w.includes("rfg-empty-state") && w.includes("nothing-here")), detail: warnings.join(" | ") || "no warning" },
    ];
  } finally {
    console.warn = orig;
  }
};

module.exports = [
  { id: "components-empty-state--no-results", tag: "rfg-empty-state", check },
  { id: "components-empty-state--cold-start", tag: "rfg-empty-state", check },
  { id: "components-empty-state--all-clear", tag: "rfg-empty-state", check },
  { id: "components-empty-state--no-results", tag: "rfg-empty-state", check: warnCheck },
];
