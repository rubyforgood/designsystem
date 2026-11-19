// The adapter for the built Storybook site (`npm run build-storybook`, served by
// `bin/design/adapters/storybook/serve.js`) — a third worked example of adapter.md's contract,
// alongside bin/design/targets.js (Rails) and the reference-app adapter. Points the audit suite
// at the component layer (ADR 14) itself, the same way the other two point it at a whole app.
//
// Prerequisite: `npm run build-storybook` must have run first. Unlike the other two adapters,
// there is no generated-cache-file layer here — storybook-static/index.json already *is* the
// single source of truth for what stories exist, and it's cheap to read directly; the other
// adapters' caching exists to avoid re-spawning Rails/a route-walk on every audit run, which
// doesn't apply to reading one JSON file.
//
// One role only. A component story has no authentication and no audience split — PRIMARY is
// every story, SECONDARY and ADMIN are both an honest `() => false`, matching the reference
// adapter's pattern of not inventing roles that don't exist.
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://127.0.0.1:4300";
const PASSWORD = process.env.SEED_PASSWORD || "unused";

const INDEX_FILE = path.resolve(__dirname, "../../../../storybook-static/index.json");

function targets() {
  if (!fs.existsSync(INDEX_FILE)) {
    throw new Error(`${INDEX_FILE} not found — run \`npm run build-storybook\` first.`);
  }
  const index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  return Object.values(index.entries)
    .filter((e) => e.type === "story")
    .map((e) => ({
      path: `/iframe.html?id=${e.id}&viewMode=story`,
      controller: "stories",
      action: e.id,
    }));
}

const SECONDARY = () => false;
const ADMIN = () => false;
const PRIMARY = (p) => !ADMIN(p) && !SECONDARY(p);

// No real credential to sign in with, but the contract requires the export — every audit that
// calls `signIn()` does so unconditionally when an email is present in RUNS.
const RUNS = [["viewer", PRIMARY]];

async function signIn() {}

async function visit(page, urlPath, { timeout = 30000 } = {}) {
  const res = await page.goto(BASE + urlPath, { waitUntil: "domcontentloaded", timeout }).catch(() => null);
  if (!res || res.status() >= 400) return null;
  await page.waitForLoadState("load", { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(120);
  res.landed = new URL(page.url()).pathname;
  return res;
}

module.exports = { BASE, PASSWORD, targets, signIn, visit, RUNS, SECONDARY, ADMIN, PRIMARY };
