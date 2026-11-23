// Behavior checks for <rfg-button>. `check` runs inside the story page (page.evaluate); `run`
// drives it from Node (Playwright) with real clicks, hover and focus. Both return
// [{ name, ok, detail }]. See ../component-behavior-audit.js. components/README.md and button.js
// promise: a real light-DOM <button> or <a> that the host's label and icon are moved into; a
// submit button that submits its ancestor form; variant fills from tokens (ghost_danger tinting
// red only on hover, a variant that once rendered unstyled); `href` + `disabled` rendering an
// "inert on arrival" focusable aria-disabled control that reads out `reason` and goes nowhere;
// aria-* proxied onto the real control; `focus()` on the host focusing the control; `size="xs"`
// a square of --rfg-button-xs-size; and console warnings for a missing accessible name or an
// unknown variant.

// Variant fills, read from the rendered control and compared with the tokens.
const variantCheck = async () => {
  const host = document.querySelector("rfg-button");
  if (!host) return [{ name: "story renders a button", ok: false, detail: "missing" }];
  await host.updateComplete;
  const token = (prop, value) => {
    const probe = document.createElement("span");
    probe.style[prop] = value;
    document.body.append(probe);
    const out = getComputedStyle(probe)[prop];
    probe.remove();
    return out;
  };
  const control = host.querySelector(".control");
  const out = [];
  const stray = [...host.childNodes].filter((n) => n !== control && (n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())));
  out.push({
    name: "the host's content is moved inside the real control",
    ok: !!control && stray.length === 0 && control.textContent.trim().length > 0,
    detail: control ? `${stray.length} stray node(s), control text ${JSON.stringify(control.textContent.trim())}` : "no control",
  });
  out.push({
    name: "renders a native <button type=\"button\">",
    ok: !!control && control.tagName === "BUTTON" && control.type === "button",
    detail: control ? `${control.tagName} type=${control.type}` : "no control",
  });
  const variant = host.getAttribute("variant") || "primary";
  const want = {
    primary: { bg: token("backgroundColor", "var(--color-brand-600)"), border: null },
    danger: { bg: token("backgroundColor", "var(--color-danger)"), border: null },
    secondary: { bg: token("backgroundColor", "white"), border: token("borderTopColor", "var(--color-neutral-200)") },
    ghost: { bg: "rgba(0, 0, 0, 0)", border: null },
    ghost_danger: { bg: "rgba(0, 0, 0, 0)", border: null },
  }[variant];
  const cs = control && getComputedStyle(control);
  out.push({
    name: `the ${variant} variant has its token fill`,
    ok: !!want && !!cs && cs.backgroundColor === want.bg && (!want.border || cs.borderTopColor === want.border),
    detail: cs ? `background ${cs.backgroundColor}, border ${cs.borderTopColor}` : "no control",
  });
  return out;
};

// ghost_danger: transparent and neutral at rest, danger-colored text and a danger tint on hover.
const runGhostDanger = async (page) => {
  const out = await page.evaluate(variantCheck);
  await page.locator("rfg-button .control").hover();
  const s = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-danger)";
    probe.style.backgroundColor = "color-mix(in oklch, var(--color-danger) 15%, white)";
    document.body.append(probe);
    const want = getComputedStyle(probe);
    const r = { color: want.color, bg: want.backgroundColor };
    probe.remove();
    const cs = getComputedStyle(document.querySelector("rfg-button .control"));
    return { want: r, color: cs.color, bg: cs.backgroundColor };
  });
  out.push({
    name: "hovering a ghost_danger button turns it danger-tinted with danger text",
    ok: s.color === s.want.color && s.bg === s.want.bg,
    detail: `color ${s.color}, background ${s.bg}`,
  });
  return out;
};

// A type="submit" rfg-button inside a form submits that form (the reason it renders in light DOM).
// The story has no form, so the check builds one around the story's button in the page.
// Also: unknown variants and a button with no accessible name each log one console warning.
const runPrimary = async (page) => {
  const out = await page.evaluate(variantCheck);
  await page.evaluate(async () => {
    const host = document.querySelector("rfg-button");
    const form = document.createElement("form");
    host.before(form);
    form.append(host);
    host.setAttribute("type", "submit");
    await host.updateComplete;
    window.__rfgSubmit = null;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.__rfgSubmit = e.submitter === host.querySelector(".control") ? "by the control" : `by ${e.submitter}`;
    });
  });
  await page.locator("rfg-button .control").click();
  const by = await page.evaluate(() => window.__rfgSubmit);
  out.push({ name: "a type=\"submit\" button submits its ancestor form", ok: by === "by the control", detail: String(by) });

  const warnings = [];
  const onConsole = (m) => { if (m.type() === "warning" && m.text().includes("<rfg-button>")) warnings.push(m.text()); };
  page.on("console", onConsole);
  const add = (html) => page.evaluate(async (h) => {
    const t = document.createElement("template");
    t.innerHTML = h;
    const el = t.content.firstElementChild;
    document.body.append(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    el.remove();
  }, html);
  await add('<rfg-button aria-label="Close"><svg slot="icon" aria-hidden="true"></svg></rfg-button>');
  await page.waitForTimeout(50);
  const labeled = warnings.length;
  await add('<rfg-button><svg slot="icon" aria-hidden="true"></svg></rfg-button>');
  await page.waitForTimeout(50);
  const unnamed = warnings.length - labeled;
  await add('<rfg-button variant="not-a-variant">Save</rfg-button>');
  await page.waitForTimeout(50);
  const unknown = warnings.length - labeled - unnamed;
  page.off("console", onConsole);
  out.push({
    name: "an icon-only button with no accessible name warns; one with aria-label doesn't",
    ok: labeled === 0 && unnamed === 1,
    detail: `labeled: ${labeled}, unnamed: ${unnamed}`,
  });
  out.push({ name: "an unknown variant warns", ok: unknown === 1, detail: `${unknown} warning(s)` });
  return out;
};

const checkDisabledButton = async () => {
  const host = document.querySelector("rfg-button");
  await host.updateComplete;
  const control = host.querySelector(".control");
  return [{
    name: "disabled reaches the native <button>",
    ok: !!control && control.tagName === "BUTTON" && control.disabled && control.matches(":disabled"),
    detail: control ? `${control.tagName} disabled=${control.disabled}` : "no control",
  }];
};

// A plain link button is a real <a href> that navigates.
const runLink = async (page) => {
  await page.evaluate(() => document.querySelector("rfg-button").updateComplete);
  const out = [];
  const info = await page.evaluate(() => {
    const c = document.querySelector("rfg-button .control");
    return { tag: c && c.tagName, href: c && c.getAttribute("href"), host: document.querySelector("rfg-button").getAttribute("href") };
  });
  out.push({ name: "href renders a real <a> with that href", ok: info.tag === "A" && info.href === info.host, detail: `${info.tag} href=${info.href}` });
  await page.locator("rfg-button .control").click();
  const hash = await page.evaluate(() => location.hash);
  out.push({ name: "clicking the link navigates to its href", ok: hash === info.host, detail: hash || "no hash" });
  return out;
};

// "Inert on arrival": focusable, announced as a disabled link with its reason, and goes nowhere.
const runDisabledLink = async (page) => {
  await page.evaluate(() => document.querySelector("rfg-button").updateComplete);
  const out = [];
  const info = await page.evaluate(() => {
    const host = document.querySelector("rfg-button");
    const c = host.querySelector(".control");
    const sr = c && c.querySelector(".sr-only");
    const r = sr && sr.getBoundingClientRect();
    return {
      tag: c && c.tagName,
      anyHref: !!host.querySelector("[href]"),
      role: c && c.getAttribute("role"),
      ariaDisabled: c && c.getAttribute("aria-disabled"),
      tabindex: c && c.getAttribute("tabindex"),
      reason: host.getAttribute("reason"),
      srText: sr ? sr.textContent.trim() : null,
      srTiny: !!r && r.width <= 1 && r.height <= 1,
    };
  });
  out.push({
    name: "a disabled link is a focusable role=link, aria-disabled, with no href",
    ok: info.tag !== "A" && !info.anyHref && info.role === "link" && info.ariaDisabled === "true" && info.tabindex === "0",
    detail: `${info.tag} role=${info.role} aria-disabled=${info.ariaDisabled} tabindex=${info.tabindex} href=${info.anyHref}`,
  });
  out.push({
    name: "the reason is inside the control, visually hidden",
    ok: !!info.reason && info.srText === info.reason && info.srTiny,
    detail: `${JSON.stringify(info.srText)}, hidden=${info.srTiny}`,
  });
  const before = await page.evaluate(() => location.href);
  // force: Playwright otherwise refuses to click an aria-disabled element, which is the point here.
  await page.locator("rfg-button .control").click({ force: true });
  const after = await page.evaluate(() => location.href);
  out.push({ name: "clicking a disabled link goes nowhere", ok: before === after, detail: after.split("#")[1] || "no hash" });
  return out;
};

const checkWithIcon = async () => {
  const host = document.querySelector("rfg-button");
  await host.updateComplete;
  const control = host.querySelector(".control");
  const svg = control && control.querySelector("svg");
  const slot = svg && svg.closest(".icon-slot");
  const stray = [...host.childNodes].filter((n) => n !== control && (n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())));
  const iconFirst = !!slot && [...control.childNodes].filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()))[0] === slot;
  return [
    {
      name: "the host's content is moved inside the real control",
      ok: !!control && stray.length === 0 && control.textContent.trim().length > 0,
      detail: control ? `${stray.length} stray node(s), control text ${JSON.stringify(control.textContent.trim())}` : "no control",
    },
    {
      name: "the icon sits in an aria-hidden icon slot ahead of the label",
      ok: !!slot && slot.getAttribute("aria-hidden") === "true" && iconFirst,
      detail: slot ? `aria-hidden=${slot.getAttribute("aria-hidden")}, first=${iconFirst}` : "icon not in .icon-slot",
    },
  ];
};

// aria-label set on the host lands on the real control, and host.focus() focuses the control.
const runIconOnly = async (page) => {
  await page.evaluate(() => document.querySelector("rfg-button").updateComplete);
  const r = await page.evaluate(() => {
    const host = document.querySelector("rfg-button");
    const c = host.querySelector(".control");
    host.focus();
    return { onControl: c && c.getAttribute("aria-label"), onHost: host.getAttribute("aria-label"), focused: document.activeElement === c };
  });
  return [
    { name: "aria-label moves from the host onto the real control", ok: r.onControl === "Close" && r.onHost === null, detail: `control=${r.onControl} host=${r.onHost}` },
    { name: "focus() on the host focuses the real control", ok: r.focused, detail: String(r.focused) },
  ];
};

// size="xs" is a square of --rfg-button-xs-size (1.75rem unless overridden).
const checkXs = async () => {
  const host = document.querySelector("rfg-button");
  await host.updateComplete;
  const control = host.querySelector(".control");
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const raw = getComputedStyle(host).getPropertyValue("--rfg-button-xs-size").trim() || "1.75rem";
  const want = raw.endsWith("rem") ? parseFloat(raw) * rem : parseFloat(raw);
  const r = control.getBoundingClientRect();
  return [{
    name: "size=\"xs\" is a square of --rfg-button-xs-size",
    ok: Math.abs(r.width - want) < 0.5 && Math.abs(r.height - want) < 0.5,
    detail: `${r.width}x${r.height}, want ${want} (${raw})`,
  }];
};

module.exports = [
  { id: "components-button--primary", tag: "rfg-button", run: runPrimary },
  { id: "components-button--secondary", tag: "rfg-button", check: variantCheck },
  { id: "components-button--danger", tag: "rfg-button", check: variantCheck },
  { id: "components-button--ghost", tag: "rfg-button", check: variantCheck },
  { id: "components-button--ghost-danger", tag: "rfg-button", run: runGhostDanger },
  { id: "components-button--disabled-button", tag: "rfg-button", check: checkDisabledButton },
  { id: "components-button--link", tag: "rfg-button", run: runLink },
  { id: "components-button--disabled-link", tag: "rfg-button", run: runDisabledLink },
  { id: "components-button--with-icon", tag: "rfg-button", check: checkWithIcon },
  { id: "components-button--icon-only-with-label", tag: "rfg-button", run: runIconOnly },
  { id: "components-button--compact-icon-only", tag: "rfg-button", check: checkXs },
  { id: "components-button--compact-icon-only-overridden-token", tag: "rfg-button", check: checkXs },
];
