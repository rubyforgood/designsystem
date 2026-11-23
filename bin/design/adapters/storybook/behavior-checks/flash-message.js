// Behavior checks for <rfg-flash-message>. `check` runs inside the story page (page.evaluate);
// `run` drives it from Node (Playwright) with real mouse input. Both return [{ name, ok, detail }].
// See ../component-behavior-audit.js. components/README.md promises: warning/danger interrupt
// (role="alert", assertive), info/success announce politely (role="status"); the tone shows in the
// left border; the close button dispatches `rfg-dismiss` with `{ reason: "manual" }`;
// `dismiss-after` dispatches `{ reason: "auto" }`, and hovering or focusing pauses that timer
// (WCAG 2.2.1 Timing Adjustable); an unknown tone logs a console warning.

const check = async () => {
  const host = document.querySelector("rfg-flash-message");
  if (!host) return [{ name: "story renders a flash message", ok: false, detail: "missing" }];
  await host.updateComplete;
  const tone = host.getAttribute("tone") || "info";
  const probe = document.createElement("span");
  probe.style.color = `var(--color-${tone})`;
  document.body.append(probe);
  const toneColor = getComputedStyle(probe).color;
  probe.remove();
  const box = host.shadowRoot && host.shadowRoot.querySelector(".flash");
  if (!box) return [{ name: "the message box renders", ok: false, detail: "no .flash" }];
  const assertive = tone === "warning" || tone === "danger";
  const out = [];
  out.push({
    name: `a ${tone} message is ${assertive ? 'role="alert", assertive' : 'role="status", polite'}`,
    ok: box.getAttribute("role") === (assertive ? "alert" : "status") &&
      box.getAttribute("aria-live") === (assertive ? "assertive" : "polite"),
    detail: `role=${box.getAttribute("role")} aria-live=${box.getAttribute("aria-live")}`,
  });
  const cs = getComputedStyle(box);
  out.push({
    name: "the left border carries the tone color",
    ok: parseFloat(cs.borderLeftWidth) >= 2 && cs.borderLeftColor === toneColor,
    detail: `${cs.borderLeftWidth} ${cs.borderLeftColor} (token ${toneColor})`,
  });
  const dismiss = host.shadowRoot.querySelector("button.dismiss");
  out.push({
    name: "a close button is shown exactly when dismissible",
    ok: !!dismiss === host.dismissible,
    detail: `dismissible=${host.dismissible} button=${!!dismiss}`,
  });
  return out;
};

const listen = (page) =>
  page.evaluate(() => {
    window.__rfgDismiss = [];
    document.addEventListener("rfg-dismiss", (e) => window.__rfgDismiss.push(e.detail && e.detail.reason));
  });
const dismissals = (page) => page.evaluate(() => window.__rfgDismiss.slice());

// The close button dispatches one rfg-dismiss, with reason "manual", that bubbles to the document.
const runManual = async (page) => {
  await page.evaluate(() => document.querySelector("rfg-flash-message").updateComplete);
  await listen(page);
  const out = await page.evaluate(check);
  await page.locator("rfg-flash-message button.dismiss").click();
  const got = await dismissals(page);
  out.push({ name: "clicking Dismiss fires rfg-dismiss with reason \"manual\"", ok: got.length === 1 && got[0] === "manual", detail: JSON.stringify(got) });

  // An unknown tone is reported, not silently rendered unstyled.
  const warnings = [];
  const onConsole = (m) => { if (m.type() === "warning" && m.text().includes("rfg-flash-message")) warnings.push(m.text()); };
  page.on("console", onConsole);
  await page.evaluate(async () => {
    const host = document.querySelector("rfg-flash-message");
    host.tone = "not-a-tone";
    await host.updateComplete;
  });
  await page.waitForTimeout(100);
  page.off("console", onConsole);
  out.push({ name: "an unknown tone logs a console warning", ok: warnings.length === 1, detail: `${warnings.length} warning(s)` });
  return out;
};

// dismiss-after: hovering pauses the timer, leaving resumes it, and it then fires reason "auto".
const runAuto = async (page) => {
  await page.evaluate(() => document.querySelector("rfg-flash-message").updateComplete);
  await listen(page);
  const ms = await page.evaluate(() => document.querySelector("rfg-flash-message").dismissAfter);
  if (!ms) return [{ name: "story sets dismiss-after", ok: false, detail: String(ms) }];
  const out = [];
  await page.locator("rfg-flash-message").hover();
  await page.waitForTimeout(ms + 500);
  let got = await dismissals(page);
  out.push({ name: "hovering pauses the auto-dismiss timer", ok: got.length === 0, detail: `${got.length} dismissal(s) after ${ms + 500}ms hovered` });
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => window.__rfgDismiss.length > 0, null, { timeout: ms + 1000 }).catch(() => {});
  got = await dismissals(page);
  out.push({ name: "after the pointer leaves, the timer fires rfg-dismiss with reason \"auto\"", ok: got.length === 1 && got[0] === "auto", detail: JSON.stringify(got) });
  return out;
};

module.exports = [
  { id: "components-flash-message--info", tag: "rfg-flash-message", run: runManual },
  { id: "components-flash-message--success", tag: "rfg-flash-message", check },
  { id: "components-flash-message--warning", tag: "rfg-flash-message", check },
  { id: "components-flash-message--danger", tag: "rfg-flash-message", check },
  { id: "components-flash-message--not-dismissible", tag: "rfg-flash-message", check },
  { id: "components-flash-message--auto-dismiss", tag: "rfg-flash-message", run: runAuto },
];
