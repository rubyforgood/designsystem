// Behavior checks for <rfg-icon-tile>. Each check function runs inside the story page
// (page.evaluate), so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: each tone paints its own token
// colors, the sm/md sizes match Button's (28px/36px), the tile is always hidden from assistive
// tech, and an unknown tone or size warns.

const check = async () => {
  const el = document.querySelector("rfg-icon-tile");
  if (!el) return [{ name: "story renders an icon tile", ok: false, detail: "missing" }];
  await el.updateComplete;
  const tile = el.shadowRoot.querySelector(".tile");
  if (!tile) return [{ name: "tile renders", ok: false, detail: "no .tile" }];
  const resolve = (prop, value) => {
    const d = document.createElement("div");
    d.style[prop] = value;
    document.body.append(d);
    const v = getComputedStyle(d)[prop];
    d.remove();
    return v;
  };
  const tone = el.getAttribute("tone") || "brand";
  const size = el.getAttribute("size") || "md";
  const expected = {
    brand: ["var(--color-brand-100)", "var(--color-brand-700)"],
    neutral: ["var(--color-neutral-100)", "var(--color-neutral-700)"],
  }[tone] || [`color-mix(in oklch, var(--color-${tone}) 15%, white)`, `var(--color-${tone})`];
  const s = getComputedStyle(tile);
  const r = tile.getBoundingClientRect();
  const px = size === "sm" ? 28 : 36;
  return [
    { name: `${tone} tile uses its tone's background`, ok: s.backgroundColor === resolve("backgroundColor", expected[0]), detail: s.backgroundColor },
    { name: `${tone} tile colors the icon with its tone`, ok: s.color === resolve("color", expected[1]), detail: s.color },
    { name: `${size} tile is ${px}px square`, ok: r.width === px && r.height === px, detail: `${r.width}x${r.height}` },
    { name: "tile is hidden from assistive tech", ok: tile.getAttribute("aria-hidden") === "true", detail: String(tile.getAttribute("aria-hidden")) },
  ];
};

// An unknown tone or size warns; valid ones don't.
const warnCheck = async () => {
  const el = document.querySelector("rfg-icon-tile");
  if (!el) return [{ name: "story renders an icon tile", ok: false, detail: "missing" }];
  await el.updateComplete;
  const warnings = [];
  const orig = console.warn;
  console.warn = (...a) => { warnings.push(a.join(" ")); orig.apply(console, a); };
  try {
    el.tone = "danger";
    el.size = "sm";
    await el.updateComplete;
    const valid = warnings.length;
    el.tone = "purple";
    await el.updateComplete;
    const toneWarned = warnings.some((w) => w.includes("rfg-icon-tile") && w.includes("purple"));
    el.tone = "brand";
    el.size = "xl";
    await el.updateComplete;
    const sizeWarned = warnings.some((w) => w.includes("rfg-icon-tile") && w.includes("xl"));
    return [
      { name: "a valid tone and size don't warn", ok: valid === 0, detail: `${valid} warnings` },
      { name: "an unknown tone warns", ok: toneWarned, detail: warnings.join(" | ") || "no warning" },
      { name: "an unknown size warns", ok: sizeWarned, detail: warnings.join(" | ") || "no warning" },
    ];
  } finally {
    console.warn = orig;
  }
};

const STORIES = ["brand", "neutral", "info", "success", "warning", "danger", "small"];
module.exports = [
  ...STORIES.map((s) => ({ id: `components-icon-tile--${s}`, tag: "rfg-icon-tile", check })),
  { id: "components-icon-tile--brand", tag: "rfg-icon-tile", check: warnCheck },
];
