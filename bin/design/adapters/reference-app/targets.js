// The adapter for examples/reference-app -- Phase 2's second worked example of adapter.md,
// alongside ../../adapter-rails.md (well, bin/design/targets.js itself). Built to answer one
// question: does "swap the adapter and the audit runs unmodified" actually hold?
//
// Deliberately NOT a copy of targets.js with s/rails/node/. The reference app has two roles, not
// three -- there is no secondary-portal audience -- and SECONDARY below is an honest `() => false`
// rather than an invented third tier to make the shapes match.
//
// **The naming leak this file used to document is fixed.** Every audit imports a role predicate by
// the literal identifiers `PRIMARY`/`SECONDARY`/`ADMIN` now, not `BANK`/`PARTNER`/`ADMIN` -- see
// docs/portability/audit-tooling-classification.md and ADR-equivalent reasoning in the commit that
// renamed the contract. Both adapters (this one and bin/design/targets.js) and every audit that
// destructures these names by identifier were updated together, in one pass, specifically because
// a partial rename is worse than the leak it was meant to fix -- half the suite importing the old
// names and half the new would silently break rather than silently leak vocabulary.
const BASE = process.env.BASE_URL || "http://127.0.0.1:4100";
const PASSWORD = process.env.SEED_PASSWORD || "letmein";

const TARGETS_FILE = process.env.TARGETS || "/tmp/reference-app-targets.json";
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const ROOT = path.resolve(__dirname, "../../../../examples/reference-app");
const GENERATE = process.env.TARGETS_CMD ||
  `node ${path.join(__dirname, "route-targets.js")}`;

function stale() {
  if (!fs.existsSync(TARGETS_FILE)) return true;
  const built = fs.statSync(TARGETS_FILE).mtimeMs;
  const src = path.join(ROOT, "server.js");
  return fs.existsSync(src) && built < fs.statSync(src).mtimeMs;
}

let cached = null;

function targets() {
  if (cached) return cached;
  if (stale()) {
    fs.writeFileSync(TARGETS_FILE, execSync(GENERATE, { maxBuffer: 8 * 1024 * 1024 }));
  }
  cached = JSON.parse(fs.readFileSync(TARGETS_FILE, "utf8"));
  return cached;
}

// This app has one audience beyond ADMIN, not two. SECONDARY is an honest "no such role here"
// rather than a second invented tier -- the point of this exercise is to see what an audit does
// with a role that has zero pages, not to manufacture a third role to keep the shape familiar.
const ADMIN = (p) => p.startsWith("/admin");
const SECONDARY = () => false;
const PRIMARY = (p) => !ADMIN(p) && !SECONDARY(p);

const RUNS = [
  [process.env.PRIMARY_EMAIL || "member@example.org", PRIMARY],
  [process.env.ADMIN_EMAIL || "admin@example.org", ADMIN]
  // No SECONDARY entry -- RUNS only lists roles that exist. An audit iterating RUNS naturally gets
  // two passes instead of three; one that hardcodes "three roles" elsewhere would not.
];

async function signIn(page, email, password = PASSWORD) {
  await page.goto(BASE + "/sign-out", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.goto(BASE + "/sign-in", { waitUntil: "domcontentloaded" });
  // Field names deliberately differ from Devise's user[email]/user[password] -- id-based
  // selectors, not name="user[...]" -- so signIn only works here if it was written against the
  // seam's contract and not against Rails/Devise's specific markup.
  await page.fill("#identifier", email);
  await page.fill("#secret", password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes("/sign-in"), { timeout: 30000 });
}

async function visit(page, urlPath, { timeout = 30000 } = {}) {
  const res = await page.goto(BASE + urlPath, { waitUntil: "domcontentloaded", timeout })
    .catch(() => null);
  if (!res || res.status() >= 400) return null;
  await page.waitForLoadState("load", { timeout: 3000 }).catch(() => {});
  res.landed = new URL(page.url()).pathname;
  return res;
}

module.exports = { BASE, PASSWORD, targets, signIn, visit, RUNS, SECONDARY, ADMIN, PRIMARY };
