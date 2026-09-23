// The adapter for examples/reference-app -- Phase 2's second worked example of adapter.md,
// alongside ../../adapter-rails.md (well, bin/design/targets.js itself). Built to answer one
// question: does "swap the adapter and the audit runs unmodified" actually hold?
//
// Deliberately NOT a copy of targets.js with s/rails/node/. The reference app has two roles, not
// three -- there is no partner-equivalent audience -- and PARTNER below is an honest `() => false`
// rather than an invented third tier to make the shapes match.
//
// **A naming leak, not fixed here.** Every audit that imports a role predicate does it by the
// literal identifiers `BANK`/`PARTNER`/`ADMIN` -- see
// docs/portability/audit-tooling-classification.md. Those names are Human Essentials' own
// (bank/partner/admin), not generic ones (e.g. primary/secondary/admin), and this adapter has to
// export under those same names for the unmodified audit copies below to resolve their imports at
// all. That's a second, separate portability problem from anything an adapter can fix on its own
// -- renaming the *contract itself* is a bigger, riskier change than swapping what a name points
// at, and is out of scope for this pass. Noted in the findings doc, not silently worked around.
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

// This app has one audience beyond ADMIN, not two. PARTNER is an honest "no such role here"
// rather than a second invented tier -- the point of this exercise is to see what an audit does
// with a role that has zero pages, not to manufacture a third role to keep the shape familiar.
const ADMIN = (p) => p.startsWith("/admin");
const PARTNER = () => false;
const BANK = (p) => !ADMIN(p) && !PARTNER(p);

const RUNS = [
  [process.env.MEMBER_EMAIL || "member@example.org", BANK],
  [process.env.ADMIN_EMAIL || "admin@example.org", ADMIN]
  // No PARTNER entry -- RUNS only lists roles that exist. An audit iterating RUNS naturally gets
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

module.exports = { BASE, PASSWORD, targets, signIn, visit, RUNS, PARTNER, ADMIN, BANK };
