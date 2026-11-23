// Behavior checks for <rfg-numbered-step>. Each check function runs inside the story page
// (page.evaluate), so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: each disc shows its own `number`,
// the disc is hidden from assistive tech (the <ol> already announces the position; README), the
// step renders inside an <li> rather than as one, and the disc sits beside the content as a circle.

const check = async () => {
  const steps = [...document.querySelectorAll("rfg-numbered-step")];
  if (steps.length === 0) return [{ name: "story renders numbered steps", ok: false, detail: "missing" }];
  await Promise.all(steps.map((s) => s.updateComplete));
  const discs = steps.map((s) => s.shadowRoot.querySelector(".disc"));
  const out = [];
  const shown = discs.map((d) => (d ? d.textContent.trim() : "?"));
  out.push({ name: "each disc shows its step's number", ok: steps.every((s, i) => shown[i] === s.getAttribute("number")), detail: shown.join(",") });
  out.push({ name: "every disc is hidden from assistive tech", ok: discs.every((d) => d && d.getAttribute("aria-hidden") === "true"), detail: discs.map((d) => d && d.getAttribute("aria-hidden")).join(",") });
  out.push({
    name: "step renders as content inside an <li>, not as the list item",
    ok: steps.every((s) => s.parentElement.tagName === "LI" && s.parentElement.parentElement.tagName === "OL" && getComputedStyle(s).display === "flex" && !s.hasAttribute("role")),
    detail: steps.map((s) => `${s.parentElement.tagName}>${getComputedStyle(s).display}`).join(", "),
  });
  const d = discs[0].getBoundingClientRect();
  const content = steps[0].shadowRoot.querySelector(".content").getBoundingClientRect();
  out.push({
    name: "disc is a 28px circle beside the step's content",
    ok: d.width === 28 && d.height === 28 && parseFloat(getComputedStyle(discs[0]).borderTopLeftRadius) >= 14 && content.left >= d.right && content.height > 0,
    detail: `${d.width}x${d.height}, radius ${getComputedStyle(discs[0]).borderTopLeftRadius}, content at ${Math.round(content.left)} vs disc right ${Math.round(d.right)}`,
  });
  return out;
};

module.exports = [{ id: "components-numbered-step--default", tag: "rfg-numbered-step", check }];
