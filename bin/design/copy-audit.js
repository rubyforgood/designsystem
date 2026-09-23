// AUDIT-READS: RENDER
// Copy audit, reimplemented against rendered pages instead of Rails/ERB source.
//
// Phase 3 of the genericization plan. copy-audit.rb's checks split cleanly into two halves: the
// *rules* (WCAG 2.4.4 vague links, WCAG 1.3.3 sensory instructions, gendered/ableist wording,
// politeness filler, shouting) are plain English-language regexes with zero Human Essentials
// content in them at all -- and the *extraction* (grep app/views for `label: "..."`, recognize
// Rails helper calls like `link_to`/`essentials_link_button`, walk config/locales/**/*.yml) is
// entirely Rails-specific.
//
// This keeps the rules, unmodified in substance, and replaces the extraction: crawl every screen
// the adapter knows about, in a real browser, and read the *rendered* text -- link labels,
// aria-labels, and every element's own direct text. Works against any app the adapter points at,
// because "what does the page say" doesn't care what rendered it.
//
// What's deliberately not carried over: the `hint without a full stop` check, which depended on
// Rails form builder's `hint:` key -- a Local semantic category with no generic DOM equivalent.
// A team adopting this could reinstate it by convention (e.g. `[data-hint]`) if they want it.
//
// Usage: pw bin/design/copy-audit.js [--verbose]
const { chromium } = require("playwright");
const { targets, signIn, visit, RUNS, BASE } = require("./targets");

const VERBOSE = process.argv.includes("--verbose");

// WCAG 2.4.4 Link Purpose. Unmodified from copy-audit.rb.
const VAGUE_LINK = /^[\s"'(]*(?:click here|here|this link|read more|learn more|more info(?:rmation)?|see more|more|details|click|link|this|go here|continue)[\s"'.,!)]*$/i;

// WCAG 1.3.3 Sensory Characteristics: instructions must not depend on shape, size or position.
// A comparative "below/above" ("items below their recommended quantity") is not spatial; the
// lookahead is what tells them apart -- unmodified from copy-audit.rb.
const COMPARATIVE = String.raw`(?!\s+(?:the|their|its|his|her|your|our|an?|\d|minimum|maximum|recommended|average|target|cost|zero)\b)`;
const SENSORY = new RegExp(
  String.raw`\b(?:link|button|field|form|table|box|section|menu|item|list|option|row|card|step|question|answer|column|panel|tab|chart)s?\s+(?:below|above)\b` + COMPARATIVE +
  `|` + String.raw`\b(?:see|shown|listed|click|choose|select|pick|enter|fill|use|check|review|complete)\s+(?:below|above)\b` + COMPARATIVE +
  `|` + String.raw`\bthe\s+\w+s?\s+(?:below|above)\b` + COMPARATIVE +
  `|` + String.raw`\bto\s+the\s+(?:left|right)\b` +
  `|` + String.raw`\bthe\s+(?:green|red|blue|round|square)\s+(?:button|link|box)\b`,
  "i"
);

const GENDERED = /\b(?:he\/she|s\/he|his\/her|him\/her|he\s+or\s+she|his\s+or\s+her)\b|\b(?:chairman|chairwoman|manpower|man-hours|mankind|manned|salesman|salesmen)\b|\bguys\b/i;

const ABLEIST = /\b(?:crazy|insane|insanely|lame|dumb|idiotic|moronic|psycho|schizophrenic|spaz)\b|\bsanity[\s-]check\b|\b(?:blind|deaf|tone-deaf)\s+to\b|\bcripple[sd]?\b|\bfalls?\s+on\s+deaf\s+ears\b|\bdummy\b/i;

const POLITENESS = /\bplease\b/i;

// Generic only -- deliberately not carrying HE's domain acronyms (NDBN, PDX, FPL...) into a
// system with no such domain. Extend this per adoption, the same way copy-audit.rb's ACRONYMS
// list was this project's memory of which shouting was real.
const ACRONYMS = new Set(["CSV", "PDF", "URL", "URLS", "ID", "IDS", "FAQ", "FAQS", "US", "USA",
  "UK", "ZIP", "API", "UPC", "HTML", "CSS", "JS", "OK", "NO", "YES", "ASAP", "QR", "AM", "PM",
  "UTC", "GMT"]);

function shouting(text) {
  return (text.match(/\b[A-Z]{3,}\b/g) || []).filter((w) => !ACRONYMS.has(w));
}

const CHECKS = {
  "link text (WCAG 2.4.4)": (t, kind) => kind === "link" && VAGUE_LINK.test(t),
  "sensory instruction (WCAG 1.3.3)": (t) => SENSORY.test(t),
  "gendered wording": (t) => GENDERED.test(t),
  "ableist wording": (t) => ABLEIST.test(t),
  "politeness filler": (t) => POLITENESS.test(t),
  "shouting": (t) => shouting(t).length > 0
};

// Proof before trust, same discipline as copy-audit.rb's PROBES and page-audit.rb's detector
// tables. A check that has never been shown to fire might be correct or might be inert.
const PROBES = [
  ["Choose the items below", "sensory instruction (WCAG 1.3.3)", true],
  ["Items below their recommended on-hand quantity", "sensory instruction (WCAG 1.3.3)", false],
  ["Fill out the details below about your bank", "sensory instruction (WCAG 1.3.3)", true],
  ["click here", "link text (WCAG 2.4.4)", true, "link"],
  ["Add another item", "link text (WCAG 2.4.4)", false, "link"],
  ["Details", "link text (WCAG 2.4.4)", false, "copy"],
  ["Ask him/her to confirm", "gendered wording", true],
  ["The other bank", "gendered wording", false],
  ["That would be crazy", "ableist wording", true],
  ["Blind Item", "ableist wording", false],
  ["Please try again", "politeness filler", true],
  ["Pleasant Valley", "politeness filler", false],
  ["SAVE CHANGES", "shouting", true],
  ["Export to CSV", "shouting", false]
];

for (const [text, check, expected, kind] of PROBES) {
  const actual = CHECKS[check](text, kind || "copy");
  if (actual !== expected) {
    console.error(`copy-audit.js: the ${JSON.stringify(check)} check is wrong.`);
    console.error(`  ${JSON.stringify(text)} (${kind || "copy"}) => ${actual}, expected ${expected}`);
    process.exit(2);
  }
}

// Each element's own direct text, not its descendants' -- avoids double-counting a <p> and the
// <span> inside it as two findings over the same words.
const EXTRACT = () => {
  const out = [];
  const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (el) => skip.has(el.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  let node;
  while ((node = walker.nextNode())) {
    const direct = [...node.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (direct) out.push({ tag: node.tagName.toLowerCase(), text: direct, kind: "copy" });
  }
  for (const a of document.querySelectorAll("a")) {
    const text = (a.textContent || "").replace(/\s+/g, " ").trim();
    if (text) out.push({ tag: "a", text, kind: "link" });
  }
  for (const el of document.querySelectorAll("[aria-label]")) {
    const text = (el.getAttribute("aria-label") || "").trim();
    if (text) out.push({ tag: el.tagName.toLowerCase(), text, kind: "copy" });
  }
  return out;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const findings = {};
  for (const name of Object.keys(CHECKS)) findings[name] = [];
  const seen = new Set();
  let pagesChecked = 0;

  for (const [email, wants] of RUNS) {
    await signIn(page, email);
    for (const t of targets().filter((x) => wants(x.path))) {
      const res = await visit(page, t.path);
      if (!res) continue;
      pagesChecked += 1;
      const items = await page.evaluate(EXTRACT);
      for (const { text, kind } of items) {
        if (text.length > 400) continue;
        for (const [name, test] of Object.entries(CHECKS)) {
          if (!test(text, kind)) continue;
          const key = `${name}|${t.path}|${text}`;
          if (seen.has(key)) continue;
          seen.add(key);
          findings[name].push({ path: t.path, text });
        }
      }
    }
  }
  await browser.close();

  let total = 0;
  for (const [name, hits] of Object.entries(findings)) {
    console.log(`${name.padEnd(34)} ${hits.length}`);
    total += hits.length;
    if (!hits.length) continue;
    const shown = VERBOSE ? hits : hits.slice(0, 6);
    for (const h of shown) console.log(`    ${h.path.padEnd(30)} ${h.text.slice(0, 74)}`);
    if (hits.length > shown.length) console.log(`    ... ${hits.length - shown.length} more (--verbose)`);
  }
  console.log(`\n${pagesChecked} page(s) checked, ${total} finding(s)`);
  process.exit(total > 0 ? 1 : 0);
})();
