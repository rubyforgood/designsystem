// Behavior checks for <rfg-error-summary>. Each check function runs inside the story page
// (page.evaluate) and returns [{ name, ok, detail }]. See ../component-behavior-audit.js. The
// summary is a role="alert" box whose heading defaults to "There is a problem" and whose slotted
// <ul> of messages is styled through ::slotted(ul). The messages must be inside the alert, or a
// screen reader announces the heading alone.

const check = async () => {
  const host = document.querySelector("rfg-error-summary");
  if (!host) return [{ name: "story renders an error summary", ok: false, detail: "missing" }];
  await host.updateComplete;
  const token = (prop, name) => {
    const probe = document.createElement("span");
    probe.style[prop] = `var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe)[prop];
    probe.remove();
    return value;
  };
  const root = host.shadowRoot;
  const list = host.querySelector(":scope > ul");
  if (!list || list.children.length === 0) return [{ name: "story has a list of messages", ok: false, detail: "none" }];
  const out = [];
  const alert = root && root.querySelector('[role="alert"]');
  const slot = alert && alert.querySelector("slot:not([name])");
  const assigned = slot ? slot.assignedElements() : [];
  out.push({
    name: "the message list is inside the role=\"alert\" region",
    ok: !!alert && assigned.includes(list),
    detail: alert ? `${assigned.length} element(s) slotted into the alert` : "no role=alert",
  });
  const heading = alert && alert.querySelector(".heading");
  const want = host.getAttribute("heading") || "There is a problem";
  out.push({
    name: "the heading is the heading attribute, or \"There is a problem\" by default",
    ok: !!heading && heading.textContent.trim() === want,
    detail: heading ? JSON.stringify(heading.textContent.trim()) : "no heading",
  });
  // The ::slotted(ul) rule actually reaches the list (the <rfg-table> v0.1.0 defect was a rule
  // that matched nothing).
  const ls = getComputedStyle(list);
  out.push({
    name: "the slotted list gets its margin, indent and neutral-700 text",
    ok: parseFloat(ls.marginTop) === 0 && parseFloat(ls.marginBottom) === 0 &&
      Math.abs(parseFloat(ls.paddingLeft) - 18) < 0.5 && ls.color === token("color", "--color-neutral-700"),
    detail: `margin ${ls.marginTop}/${ls.marginBottom}, padding-left ${ls.paddingLeft}, color ${ls.color}`,
  });
  const box = alert && getComputedStyle(alert);
  out.push({
    name: "the box has a danger-colored border",
    ok: !!box && parseFloat(box.borderTopWidth) >= 1 && box.borderTopColor === token("color", "--color-danger"),
    detail: box ? `${box.borderTopWidth} ${box.borderTopColor}` : "no box",
  });
  return out;
};

module.exports = [
  { id: "components-error-summary--default", tag: "rfg-error-summary", check },
  { id: "components-error-summary--single-error", tag: "rfg-error-summary", check },
];
