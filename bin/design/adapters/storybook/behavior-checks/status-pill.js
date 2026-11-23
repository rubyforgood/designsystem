// Behavior checks for <rfg-status-pill>. Each check function runs inside the story page
// (page.evaluate), so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: that each tone actually paints its
// own token tint (with neutral-900 text on the four semantic tones, the documented contrast fix),
// that the pill is never focusable, and that an unknown tone warns.

const check = async () => {
  const el = document.querySelector("rfg-status-pill");
  if (!el) return [{ name: "story renders a status pill", ok: false, detail: "missing" }];
  await el.updateComplete;
  const pill = el.shadowRoot.querySelector(".pill");
  if (!pill) return [{ name: "pill renders", ok: false, detail: "no .pill" }];
  // Resolve a CSS value against the page's tokens, so expectations come from tokens/, not hex.
  const resolve = (prop, value) => {
    const d = document.createElement("div");
    d.style[prop] = value;
    document.body.append(d);
    const v = getComputedStyle(d)[prop];
    d.remove();
    return v;
  };
  const tone = el.getAttribute("tone") || "neutral";
  const semantic = ["info", "success", "warning", "danger"].includes(tone);
  const expected = {
    neutral: ["var(--color-neutral-100)", "var(--color-neutral-700)"],
    brand: ["var(--color-brand-100)", "var(--color-brand-700)"],
  }[tone] || [`color-mix(in oklch, var(--color-${tone}) 15%, white)`, "var(--color-neutral-900)"];
  const s = getComputedStyle(pill);
  const out = [];
  out.push({
    name: `${tone} pill uses its tone's tint as the background`,
    ok: s.backgroundColor === resolve("backgroundColor", expected[0]),
    detail: s.backgroundColor,
  });
  out.push({
    name: semantic ? `${tone} pill text is neutral-900, not the tone color` : `${tone} pill text is its tone's 700 shade`,
    ok: s.color === resolve("color", expected[1]),
    detail: s.color,
  });
  out.push({ name: "label doesn't wrap", ok: s.whiteSpace === "nowrap", detail: s.whiteSpace });
  const before = document.activeElement;
  el.focus();
  pill.focus();
  const focused = document.activeElement === el || el.shadowRoot.activeElement != null;
  out.push({ name: "pill is never focusable", ok: !focused && document.activeElement === before, detail: focused ? "took focus" : "no focus" });
  return out;
};

// The icon slot is decorative: hidden from assistive tech, and the icon really lands in it.
const iconCheck = async () => {
  const el = document.querySelector("rfg-status-pill");
  if (!el) return [{ name: "story renders a status pill", ok: false, detail: "missing" }];
  await el.updateComplete;
  const wrap = el.shadowRoot.querySelector(".icon-slot");
  const slot = el.shadowRoot.querySelector('slot[name="icon"]');
  const assigned = slot ? slot.assignedElements() : [];
  return [
    { name: "icon is assigned to the icon slot", ok: assigned.length === 1 && assigned[0].tagName === "svg", detail: assigned.map((a) => a.tagName).join(", ") || "none" },
    { name: "icon slot is hidden from assistive tech", ok: !!wrap && wrap.getAttribute("aria-hidden") === "true", detail: String(wrap && wrap.getAttribute("aria-hidden")) },
  ];
};

// An unknown tone warns (README: tones are a fixed vocabulary); a valid one doesn't.
const warnCheck = async () => {
  const el = document.querySelector("rfg-status-pill");
  if (!el) return [{ name: "story renders a status pill", ok: false, detail: "missing" }];
  await el.updateComplete;
  const warnings = [];
  const orig = console.warn;
  console.warn = (...a) => { warnings.push(a.join(" ")); orig.apply(console, a); };
  try {
    el.tone = "success";
    await el.updateComplete;
    const validWarned = warnings.length;
    el.tone = "purple";
    await el.updateComplete;
    const bad = warnings.slice(validWarned).some((w) => w.includes("rfg-status-pill") && w.includes("purple"));
    return [
      { name: "a valid tone doesn't warn", ok: validWarned === 0, detail: `${validWarned} warnings` },
      { name: "an unknown tone warns", ok: bad, detail: warnings.join(" | ") || "no warning" },
    ];
  } finally {
    console.warn = orig;
  }
};

const TONES = ["neutral", "info", "success", "warning", "danger", "brand"];
module.exports = [
  ...TONES.map((t) => ({ id: `components-status-pill--${t}`, tag: "rfg-status-pill", check })),
  { id: "components-status-pill--with-icon", tag: "rfg-status-pill", check: iconCheck },
  { id: "components-status-pill--neutral", tag: "rfg-status-pill", check: warnCheck },
];
