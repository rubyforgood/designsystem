// Behavior checks for <rfg-card>. Each check function runs inside the story page (page.evaluate),
// so it can only use browser APIs, and returns [{ name, ok, detail }]. See
// ../component-behavior-audit.js. Covers what axe can't see: the header and footer render only
// when they have content (README: "each rendered only when there's something in it"), slotted
// actions and footer content actually show, the body is padded, and the surface uses its tokens.

const check = async () => {
  const el = document.querySelector("rfg-card");
  if (!el) return [{ name: "story renders a card", ok: false, detail: "missing" }];
  await el.updateComplete;
  const root = el.shadowRoot;
  const resolve = (prop, value) => {
    const d = document.createElement("div");
    d.style[prop] = value;
    document.body.append(d);
    const v = getComputedStyle(d)[prop];
    d.remove();
    return v;
  };
  const visible = (node) => !!node && node.getClientRects().length > 0 && node.getBoundingClientRect().height > 0;
  const host = getComputedStyle(el);
  const header = root.querySelector(".header");
  const footer = root.querySelector(".footer");
  const body = root.querySelector(".body");
  const wantsHeader = el.hasAttribute("heading") || el.hasAttribute("subtitle") || !!el.querySelector('[slot="actions"]');
  const footerContent = el.querySelector('[slot="footer"]');
  const action = el.querySelector('[slot="actions"]');
  const out = [];
  out.push({
    name: "surface has the token border, radius and shadow",
    ok: host.borderTopWidth === "1px"
      && host.borderTopColor === resolve("color", "var(--color-neutral-200)")
      && host.borderTopLeftRadius === resolve("borderTopLeftRadius", "var(--radius-surface)")
      && host.boxShadow === resolve("boxShadow", "var(--shadow-surface)"),
    detail: `${host.borderTopWidth} ${host.borderTopColor}, ${host.borderTopLeftRadius}, ${host.boxShadow}`,
  });
  out.push({
    name: wantsHeader ? "header renders when there's a heading, subtitle or action" : "no header renders without a heading, subtitle or action",
    ok: wantsHeader ? visible(header) : !header,
    detail: header ? (visible(header) ? "visible header" : "hidden header") : "no header",
  });
  if (el.hasAttribute("heading")) {
    const h = root.querySelector(".heading");
    out.push({ name: "header shows the heading text", ok: !!h && visible(h) && h.textContent.trim() === el.getAttribute("heading"), detail: h ? h.textContent.trim() : "none" });
  }
  if (action) {
    const a = action.getBoundingClientRect();
    const hr = header ? header.getBoundingClientRect() : null;
    const titles = root.querySelector(".titles").getBoundingClientRect();
    out.push({
      name: "slotted action shows in the header, to the right of the titles",
      ok: !!hr && a.height > 0 && a.top >= hr.top && a.bottom <= hr.bottom && a.left >= titles.right,
      detail: `action ${Math.round(a.left)},${Math.round(a.top)} ${Math.round(a.width)}x${Math.round(a.height)}`,
    });
  }
  out.push({
    name: footerContent ? "footer shows its slotted content" : "no footer shows without footer content",
    ok: footerContent ? visible(footer) && visible(footerContent) : !visible(footer),
    detail: visible(footer) ? "visible footer" : "hidden footer",
  });
  if (footerContent) {
    const f = getComputedStyle(footer);
    out.push({ name: "footer sits below the body, divided by a border", ok: footer.getBoundingClientRect().top >= body.getBoundingClientRect().bottom && parseFloat(f.borderTopWidth) > 0, detail: `border-top ${f.borderTopWidth}` });
  }
  // `padded` defaults to true: the body gets the 1.25rem padding.
  if (el.padded) {
    const b = getComputedStyle(body);
    out.push({ name: "padded body has 20px padding", ok: b.paddingTop === "20px" && b.paddingLeft === "20px", detail: `${b.paddingTop} ${b.paddingLeft}` });
  }
  return out;
};

// Unpadded body: `padded="false"` turns the padding off. Fixed in v0.1.3 (before, a Boolean
// attribute that defaults to true couldn't be turned off from markup, so this story stayed padded).
const unpaddedCheck = async () => {
  const el = document.querySelector("rfg-card");
  if (!el) return [{ name: "story renders a card", ok: false, detail: "missing" }];
  await el.updateComplete;
  const body = getComputedStyle(el.shadowRoot.querySelector(".body"));
  const header = el.shadowRoot.querySelector(".header");
  return [
    { name: "unpadded body has no padding, so it meets the card edges", ok: body.paddingTop === "0px" && body.paddingLeft === "0px", detail: `${body.paddingTop} ${body.paddingLeft}` },
    { name: "unpadded card divides header from body with a border", ok: !!header && parseFloat(getComputedStyle(header).borderBottomWidth) > 0, detail: header ? getComputedStyle(header).borderBottomWidth : "no header" },
  ];
};

module.exports = [
  { id: "components-card--default", tag: "rfg-card", check },
  { id: "components-card--surface-only", tag: "rfg-card", check },
  { id: "components-card--with-actions", tag: "rfg-card", check },
  { id: "components-card--with-footer", tag: "rfg-card", check },
  { id: "components-card--unpadded", tag: "rfg-card", check: unpaddedCheck },
];
