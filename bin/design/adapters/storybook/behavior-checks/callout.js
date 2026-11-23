// Behavior checks for <rfg-callout>. Each check function runs inside the story page
// (page.evaluate), so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: the live-region role follows the
// tone (warning/danger -> alert, info/success -> status), `role="none"` removes the attribute
// entirely (null, not ""; README's documented fix), the tone shows in the border, the icon slot
// is decorative, the heading renders only when set, and the callout sets no margin of its own.

const check = async () => {
  const el = document.querySelector("rfg-callout");
  if (!el) return [{ name: "story renders a callout", ok: false, detail: "missing" }];
  await el.updateComplete;
  const root = el.shadowRoot;
  const box = root.querySelector(".callout");
  if (!box) return [{ name: "callout renders", ok: false, detail: "no .callout" }];
  const resolve = (prop, value) => {
    const d = document.createElement("div");
    d.style[prop] = value;
    document.body.append(d);
    const v = getComputedStyle(d)[prop];
    d.remove();
    return v;
  };
  const tone = el.getAttribute("tone") || "info";
  const optOut = el.getAttribute("role") === "none";
  const role = box.getAttribute("role");
  const out = [];
  if (optOut) {
    out.push({ name: 'role="none" leaves no role attribute at all', ok: role === null, detail: JSON.stringify(role) });
  } else {
    const want = tone === "warning" || tone === "danger" ? "alert" : "status";
    out.push({ name: `${tone} callout is a role="${want}" live region`, ok: role === want, detail: JSON.stringify(role) });
  }
  const s = getComputedStyle(box);
  out.push({
    name: `${tone} callout's border uses its tone`,
    ok: s.borderTopColor === resolve("color", `color-mix(in oklch, var(--color-${tone}) 30%, white)`),
    detail: s.borderTopColor,
  });
  out.push({ name: "icon slot is hidden from assistive tech", ok: root.querySelector(".icon-slot")?.getAttribute("aria-hidden") === "true", detail: String(root.querySelector(".icon-slot")?.getAttribute("aria-hidden")) });
  const h = root.querySelector(".heading");
  out.push({
    name: el.heading ? "heading shows when set" : "no heading without one",
    ok: el.heading ? !!h && h.textContent.trim() === el.heading : !h,
    detail: h ? h.textContent.trim() : "none",
  });
  const m = getComputedStyle(el);
  out.push({ name: "callout sets no margin (placement is the caller's)", ok: [m.marginTop, m.marginRight, m.marginBottom, m.marginLeft].every((v) => v === "0px"), detail: `${m.marginTop} ${m.marginRight} ${m.marginBottom} ${m.marginLeft}` });
  return out;
};

// Changing tone moves the role with it (warning -> info turns alert into status).
const toneChange = async () => {
  const el = document.querySelector("rfg-callout");
  if (!el) return [{ name: "story renders a callout", ok: false, detail: "missing" }];
  await el.updateComplete;
  el.tone = "info";
  await el.updateComplete;
  const role = el.shadowRoot.querySelector(".callout").getAttribute("role");
  return [{ name: "changing tone to info turns the alert into a status", ok: role === "status", detail: JSON.stringify(role) }];
};

module.exports = [
  { id: "components-callout--warning", tag: "rfg-callout", check },
  { id: "components-callout--info", tag: "rfg-callout", check },
  { id: "components-callout--success", tag: "rfg-callout", check },
  { id: "components-callout--danger", tag: "rfg-callout", check },
  { id: "components-callout--no-live-region", tag: "rfg-callout", check },
  { id: "components-callout--warning", tag: "rfg-callout", check: toneChange },
];
