// Behavior checks for <rfg-page-header>. Each check function runs inside the story page
// (page.evaluate), so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: the heading is the page's one <h1>,
// the back link is a real link to `back-href`, the actions region shows only when it has content,
// and the row's alignment follows `subtitle` (README: no subtitle aligns actions to the heading's
// bottom; a subtitle aligns them to the top).

const check = async () => {
  const el = document.querySelector("rfg-page-header");
  if (!el) return [{ name: "story renders a page header", ok: false, detail: "missing" }];
  await el.updateComplete;
  const root = el.shadowRoot;
  const out = [];
  // Scoped to the story root: Storybook's own hidden error/no-preview screens carry h1s too.
  const h1s = [...root.querySelectorAll("h1"), ...document.querySelectorAll("#storybook-root h1")];
  out.push({
    name: "heading is the page's only <h1>",
    ok: h1s.length === 1 && h1s[0].textContent.trim() === el.getAttribute("heading"),
    detail: `${h1s.length} h1: ${h1s.map((h) => h.textContent.trim()).join(" | ")}`,
  });

  const href = el.getAttribute("back-href");
  const back = root.querySelector("a.back");
  if (href) {
    out.push({
      name: "back link is a real link to back-href, labeled back-label",
      ok: !!back && back.getAttribute("href") === href && back.textContent.trim() === el.getAttribute("back-label"),
      detail: back ? `${back.getAttribute("href")} "${back.textContent.trim()}"` : "no link",
    });
    // Fixed in v0.1.3: the gap was 16px (a flex gap plus a margin-top, both 0.5rem).
    const gap = root.querySelector("h1").getBoundingClientRect().top - back.getBoundingClientRect().bottom;
    out.push({ name: "back link sits 8px above the heading", ok: Math.round(gap) === 8, detail: `${gap}px` });
  } else {
    out.push({ name: "no back link without back-href", ok: !back, detail: back ? "link rendered" : "none" });
  }

  const actions = root.querySelector(".actions");
  const slotted = [...el.querySelectorAll('[slot="actions"]')];
  const shown = !!actions && actions.getClientRects().length > 0;
  out.push({
    name: slotted.length ? "actions region shows its slotted actions" : "actions region is hidden when empty",
    ok: slotted.length ? shown && slotted.every((a) => a.getBoundingClientRect().height > 0) : !shown,
    detail: shown ? "shown" : "hidden",
  });

  if (slotted.length) {
    const titles = root.querySelector(".titles").getBoundingClientRect();
    const box = actions.getBoundingClientRect();
    const sub = el.hasAttribute("subtitle");
    const delta = sub ? box.top - titles.top : box.bottom - titles.bottom;
    out.push({
      name: sub ? "with a subtitle, actions align to the top of the titles" : "without a subtitle, actions align to the bottom of the heading",
      ok: Math.abs(delta) < 1,
      detail: `${sub ? "top" : "bottom"} offset ${delta.toFixed(1)}px`,
    });
    out.push({ name: "actions sit to the right of the titles", ok: box.left >= titles.right, detail: `${Math.round(box.left)} vs ${Math.round(titles.right)}` });
  }
  return out;
};

module.exports = [
  { id: "components-page-header--title-only", tag: "rfg-page-header", check },
  { id: "components-page-header--with-subtitle", tag: "rfg-page-header", check },
  { id: "components-page-header--with-back-link", tag: "rfg-page-header", check },
  { id: "components-page-header--with-actions", tag: "rfg-page-header", check },
];
