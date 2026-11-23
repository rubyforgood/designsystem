// Behavior checks for <rfg-pagination>. `check` runs inside the story page (page.evaluate); `run`
// drives it from Node (Playwright) with real clicks. Both return [{ name, ok, detail }]. See
// ../component-behavior-audit.js. components/README.md promises: a "Showing 31–45 of 272 projects"
// range label; First/Prev/page numbers/Next/Last, with the current page marked aria-current="page";
// pages 1, last, and current ±1 with "…" for gaps; First/Prev disabled on page 1 and Next/Last on
// the last page (aria-disabled, no href); hrefs from `hrefFor`; an `rfg-navigate` event with
// `{ page }`; and no controls at all when everything fits on one page.

const check = async () => {
  const host = document.querySelector("rfg-pagination");
  if (!host) return [{ name: "story renders pagination", ok: false, detail: "missing" }];
  await host.updateComplete;
  const root = host.shadowRoot;
  const { total, page, pageSize, entryName } = host;
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  const out = [];
  // Range label, computed independently from the attributes.
  const text = root.textContent.replace(/\s+/g, " ").trim();
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const noun = total === 1 ? entryName : `${entryName}s`;
  const wantLabel = total === 0 ? `No ${entryName}s` : `Showing ${start}–${end} of ${total} ${noun}`;
  out.push({ name: "the range label matches total, page and page-size", ok: text.startsWith(wantLabel), detail: JSON.stringify(text.slice(0, 60)) });

  const nav = root.querySelector("nav");
  if (pages <= 1) {
    out.push({ name: "no page controls when everything fits on one page", ok: !nav && root.querySelectorAll("a").length === 0, detail: nav ? "nav rendered" : "none" });
    return out;
  }
  const links = [...nav.querySelectorAll("a")];
  const byLabel = (re) => links.find((a) => re.test(a.textContent.trim()));
  const numbered = links.filter((a) => /^\d+$/.test(a.textContent.trim()));
  const current = links.filter((a) => a.getAttribute("aria-current") === "page");
  out.push({
    name: "exactly the current page number is aria-current=\"page\"",
    ok: current.length === 1 && current[0].textContent.trim() === String(page),
    detail: current.map((a) => a.textContent.trim()).join(",") || "none",
  });
  // The page window: 1, last, and current ±1, with a gap marker wherever numbers skip.
  const want = [...new Set([1, pages, page - 1, page, page + 1])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const shown = numbered.map((a) => Number(a.textContent.trim()));
  const gapsWanted = want.filter((p, i) => i > 0 && p - want[i - 1] > 1).length;
  const gaps = (nav.textContent.match(/…/g) || []).length;
  out.push({
    name: "shows pages 1, last and current ±1, with … for each gap",
    ok: shown.join(",") === want.join(",") && gaps === gapsWanted,
    detail: `pages ${shown.join(",")}, ${gaps} gap(s)`,
  });
  // Disabled ends: no href (so not a link that goes anywhere) and aria-disabled.
  const ends = [
    [/First/, page === 1, 1], [/Prev/, page === 1, page - 1],
    [/Next/, page === pages, page + 1], [/Last/, page === pages, pages],
  ];
  const wrong = ends.filter(([re, disabled]) => {
    const a = byLabel(re);
    if (!a) return true;
    const isDisabled = a.getAttribute("aria-disabled") === "true" && !a.hasAttribute("href");
    const isLive = !a.hasAttribute("aria-disabled") && a.hasAttribute("href");
    return disabled ? !isDisabled : !isLive;
  });
  out.push({
    name: "First/Prev are disabled only on page 1, Next/Last only on the last page",
    ok: wrong.length === 0,
    detail: wrong.map(([re]) => re.source).join(",") || "all correct",
  });
  // Live links point where hrefFor says.
  const hrefWrong = [];
  if (host.hrefFor) {
    for (const [re, disabled, target] of ends) {
      const a = byLabel(re);
      if (a && !disabled && a.getAttribute("href") !== host.hrefFor(target)) hrefWrong.push(`${re.source}->${a.getAttribute("href")}`);
    }
    for (const a of numbered) if (a.getAttribute("href") !== host.hrefFor(Number(a.textContent.trim()))) hrefWrong.push(`${a.textContent.trim()}->${a.getAttribute("href")}`);
  }
  out.push({ name: "each link's href comes from hrefFor(its target page)", ok: !!host.hrefFor && hrefWrong.length === 0, detail: hrefWrong.join(", ") || "all correct" });
  return out;
};

// Clicking a live link fires rfg-navigate with its target page; clicking a disabled one does
// nothing (no event, no navigation).
const run = async (page) => {
  await page.evaluate(() => document.querySelector("rfg-pagination").updateComplete);
  const out = await page.evaluate(check);
  await page.evaluate(() => {
    window.__rfgNavigate = [];
    document.addEventListener("rfg-navigate", (e) => window.__rfgNavigate.push(e.detail && e.detail.page));
  });
  const current = await page.evaluate(() => document.querySelector("rfg-pagination").page);
  const nav = page.locator("rfg-pagination nav");
  await nav.getByText("Next", { exact: false }).click();
  const got = await page.evaluate(() => window.__rfgNavigate.slice());
  out.push({ name: "clicking Next fires rfg-navigate with the next page", ok: got.length === 1 && got[0] === current + 1, detail: JSON.stringify(got) });
  return out;
};

const runFirst = async (page) => {
  const out = await run(page);
  const before = await page.evaluate(() => location.href);
  await page.locator("rfg-pagination nav").getByText("Prev", { exact: false }).click();
  const after = await page.evaluate(() => ({ href: location.href, events: window.__rfgNavigate.length }));
  out.push({ name: "clicking disabled Prev does nothing", ok: after.events === 1 && after.href === before, detail: `${after.events} event(s), ${after.href.split("#")[1] || "no hash"}` });
  return out;
};

module.exports = [
  { id: "components-pagination--middle-of-many-pages", tag: "rfg-pagination", run },
  { id: "components-pagination--first-page", tag: "rfg-pagination", run: runFirst },
  { id: "components-pagination--last-page", tag: "rfg-pagination", check },
  { id: "components-pagination--fits-on-one-page", tag: "rfg-pagination", check },
  { id: "components-pagination--empty", tag: "rfg-pagination", check },
];
