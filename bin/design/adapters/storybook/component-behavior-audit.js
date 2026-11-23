// Behavior checks that axe-core and keyboard-audit.js can't see, run against specific stories in
// the built Storybook. Each check exists because a real defect shipped without it:
//
//   - <rfg-table> (v0.1.0): every cell rule was written as `::slotted(table) td`, which matches
//     nothing, so top alignment, padding, borders and the column classes never applied.
//   - <rfg-filter-bar> (v0.1.0): its <form> was inside the shadow root and its controls were
//     slotted from light DOM, so no control belonged to the form and the bar submitted nothing.
//
// Both were invisible to axe (nothing inaccessible) and to the keyboard audit (everything
// focusable). See components/README.md's sections on both components.
//
// Exits 1 if any check fails, and also if a story it needs is missing or has nothing to check, so
// a renamed story or an emptied example fails loudly rather than passing vacuously.
//
// Negative control: run against a Storybook built from the v0.1.0 versions of table.js and
// filter-bar.js, this fails every check (see docs/portability/adapter-storybook.md).
//
// Usage: BASE_URL=http://127.0.0.1:4300 node component-behavior-audit.js
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://127.0.0.1:4300";
// Scales with the number of stories so a hung story still fails the run, just not prematurely.
const LIMIT_S = 60 + 15 * 40;

// One file per component in ./behavior-checks/, each exporting [{ id, tag, check | run }]: the
// story ID, the custom element to wait for, and either
//   - check: a function run in the page (page.evaluate) returning [{ name, ok, detail }]. It's
//     serialized into the page, so it can't close over Node variables. May be async.
//   - run: an async function (page) => [{ name, ok, detail }], run in Node with Playwright, for
//     real keyboard, mouse and focus. The page is freshly loaded for each story entry.
//
// Optional: ONLY=<component> (a file name without .js) runs just that component's checks.
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "behavior-checks");
const STORIES = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".js"))
  .filter((f) => !process.env.ONLY || f === `${process.env.ONLY}.js`)
  .sort()
  .flatMap((f) => require(path.join(DIR, f)).map((s) => ({ ...s, file: f })));

(async () => {
  const browser = await chromium.launch();
  // A hung story fails the run instead of stalling it.
  const watchdog = setTimeout(() => { console.error(`timed out after ${LIMIT_S}s`); process.exit(1); }, LIMIT_S * 1000);
  const page = await browser.newPage();
  let total = 0;
  let failed = 0;
  for (const story of STORIES) {
    const url = `${BASE}/iframe.html?id=${story.id}&viewMode=story`;
    let results;
    try {
      await page.goto(url);
      await page.waitForSelector("#storybook-root > *", { timeout: 10000 });
      // Wait only for this story's own element: a story loads just the components it imports, so
      // waiting on any other tag would never resolve.
      await page.waitForFunction((tag) => !!customElements.get(tag), story.tag, { timeout: 10000 });
      // `run(page)` drives the page from Node with real Playwright input (keyboard, mouse, focus),
      // for behavior a function evaluated in the page can't trigger faithfully; `check` runs in
      // the page. A story entry has one or the other.
      results = story.run ? await story.run(page) : await page.evaluate(story.check);
      if (!Array.isArray(results) || results.length === 0) {
        results = [{ name: "story has something to check", ok: false, detail: "no results" }];
      }
    } catch (e) {
      results = [{ name: "story loads", ok: false, detail: e.message.split("\n")[0] }];
    }
    console.log(`\n${story.id}`);
    for (const r of results) {
      total++;
      if (!r.ok) failed++;
      console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name} (${r.detail})`);
    }
  }
  clearTimeout(watchdog);
  await browser.close();
  console.log(`\n${total} checks, ${failed} failed`);
  process.exit(failed || total === 0 ? 1 : 0);
})();
