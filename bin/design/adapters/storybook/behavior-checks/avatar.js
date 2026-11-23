// Behavior checks for <rfg-avatar>. Each check function runs inside the story page
// (page.evaluate), so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: the initials are computed correctly
// from `name` (first + last initial; first two letters of a one-word name), the avatar is
// announced as an image named after the person by default, `aria-hidden` on the host really drops
// that name, and the sizes match the icon tile's (28px/36px).

const check = async () => {
  const el = document.querySelector("rfg-avatar");
  if (!el) return [{ name: "story renders an avatar", ok: false, detail: "missing" }];
  await el.updateComplete;
  const disc = el.shadowRoot.querySelector(".avatar");
  if (!disc) return [{ name: "avatar renders", ok: false, detail: "no .avatar" }];
  const name = el.name || "";
  // Literal expectations, not a re-implementation of the component's own algorithm.
  const initials = { "Maya Chen": "MC", Priya: "PR" }[name];
  if (!initials) return [{ name: "story uses a name this check knows", ok: false, detail: name }];
  const shown = disc.textContent.trim();
  const size = el.getAttribute("size") || "md";
  const px = size === "sm" ? 28 : 36;
  const r = disc.getBoundingClientRect();
  const out = [
    { name: `shows the initials of "${name}"`, ok: shown === initials, detail: shown },
    { name: `${size} avatar is a ${px}px circle`, ok: r.width === px && r.height === px && parseFloat(getComputedStyle(disc).borderTopLeftRadius) >= px / 2, detail: `${r.width}x${r.height}, radius ${getComputedStyle(disc).borderTopLeftRadius}` },
  ];
  if (el.hasAttribute("aria-hidden")) {
    out.push({
      name: "a host-hidden avatar carries no role or name of its own",
      ok: !disc.hasAttribute("role") && !disc.hasAttribute("aria-label"),
      detail: `role=${disc.getAttribute("role")} aria-label=${disc.getAttribute("aria-label")}`,
    });
  } else {
    out.push({
      name: "avatar is announced as an image named after the person",
      ok: disc.getAttribute("role") === "img" && disc.getAttribute("aria-label") === name,
      detail: `role=${disc.getAttribute("role")} aria-label=${disc.getAttribute("aria-label")}`,
    });
  }
  return out;
};

// The accessible name follows `name` when it changes, and a host `aria-label` wins over `name`.
const nameCheck = async () => {
  const el = document.querySelector("rfg-avatar");
  if (!el) return [{ name: "story renders an avatar", ok: false, detail: "missing" }];
  await el.updateComplete;
  const disc = () => el.shadowRoot.querySelector(".avatar");
  el.name = "Ada Lovelace";
  await el.updateComplete;
  const renamed = { text: disc().textContent.trim(), label: disc().getAttribute("aria-label") };
  el.setAttribute("aria-label", "Signed in as Ada");
  el.name = "Ada B Lovelace"; // trigger an update; the label attribute isn't a reactive property
  await el.updateComplete;
  const overridden = disc().getAttribute("aria-label");
  return [
    { name: "changing name updates initials and the accessible name", ok: renamed.text === "AL" && renamed.label === "Ada Lovelace", detail: `${renamed.text} / ${renamed.label}` },
    { name: "a host aria-label wins over name", ok: overridden === "Signed in as Ada", detail: String(overridden) },
  ];
};

module.exports = [
  { id: "components-avatar--default", tag: "rfg-avatar", check },
  { id: "components-avatar--small", tag: "rfg-avatar", check },
  { id: "components-avatar--one-word-name", tag: "rfg-avatar", check },
  { id: "components-avatar--decorative-inside-a-labeled-control", tag: "rfg-avatar", check },
  { id: "components-avatar--default", tag: "rfg-avatar", check: nameCheck },
];
