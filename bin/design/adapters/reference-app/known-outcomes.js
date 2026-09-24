// A control harness for what this repo can actually run in CI -- not the same thing as
// audit-selftest.js, and that difference is the point, not an oversight.
//
// audit-selftest.js (the original control harness, per the audit-suite skill) plants a defect and
// a benign look-alike directly into a live Human Essentials page and checks each audit reports on
// exactly the right one. It needs a running Rails app with seeded data and imports the Rails
// adapter (./targets, the sibling of this one) directly. There is no Rails app in this repo, so it
// cannot run here, and porting its mutation-injection pattern to be adapter-agnostic is real,
// unstarted work -- noted in docs/portability/, not silently worked around.
//
// What this repo *does* have is docs/portability/adapter-reference-app.md's documented, measured
// outcome for each audit run against examples/reference-app -- some clean, some catching a
// deliberately planted violation, some crashing on a known, written-up gap. Re-running them and
// diffing against that documented outcome is a real regression check: it fails the way a control
// harness should fail -- when behaviour drifts from what was actually verified -- rather than
// merely asserting "exit 0", which would be silently wrong for the three audits documented to
// exit non-zero on purpose.
//
// Usage: node known-outcomes.js
// Exit 0 if every audit's exit code matches its documented outcome; 1 if any drifted, printing
// which and how -- drift is data, not just a build failure, the same discipline the rest of this
// suite applies to its own findings.
const { execFileSync } = require("child_process");

// Documented in docs/portability/adapter-reference-app.md. Update both together.
const EXPECTED = {
  "keyboard-audit.js": { exit: 0, why: "genuinely portable, no findings" },
  "wcag-audit.js": { exit: 0, why: "genuinely portable, 0 axe violations" },
  "disclosure-audit.js": { exit: 1, why: "detection portable, Local pixel thresholds flag this app's different-but-reasonable CSS" },
  "table-audit.js": { exit: 0, why: "vacuous pass -- .data-table class coupling, not a real clean bill of health" },
  "row-actions-audit.js": { exit: 0, why: "same vacuous pass, same cause" },
  "copy-audit.js": { exit: 1, why: "catches the two deliberately planted copy violations" },
  "icon-audit.js": { exit: 1, why: "crash -- missing icon-lexicon.json, a content dependency, not adapter coupling" },
  "tooltip-audit.js": { exit: 1, why: "crash -- hardcoded /donations path plus an unguarded null deref" },

  // Second batch -- docs/portability/adapter-reference-app.md's "second batch" section.
  "address-audit.js": { exit: 0, why: "vacuous pass -- no address fields on this app" },
  "confirm-audit.js": { exit: 0, why: "vacuous pass -- no destructive/confirm actions on this app" },
  "flash-of-hidden-audit.js": { exit: 0, why: "clean -- no client-side JS to cause a flash" },
  "layout-shift-audit.js": { exit: 0, why: "clean -- every screen under Chrome's 0.02 CLS noise floor" },
  "overlay-audit.js": { exit: 0, why: "vacuous pass -- no dialogs/popovers on this app" },
  "responsive-audit.js": { exit: 0, why: "12 real findings (reflow, target size), but this audit doesn't gate exit code on findings" },
  "route-sweep.js": { exit: 0, why: "1 real finding (no brand font loaded), but this audit doesn't gate exit code on findings" },
  "tab-set-audit.js": { exit: 0, why: "vacuous pass -- no tab UI on this app" },
  "wayfinding-audit.js": { exit: 0, why: "clean -- every screen is a nav root or carries a breadcrumb" },
  "wcag-manual.js": { exit: 1, why: "real findings -- confirmed skip-link/tabindex defect, not coupling" },
  "wcag22-audit.js": { exit: 1, why: "real findings -- same skip-link defect wcag-manual.js finds" },
  "button-audit.js": { exit: 0, why: "fixed -- PRIMARY_ALT_EMAIL is now an optional adapter export" },
  "audit-selftest.js": { exit: 1, why: "fixed from a crash to a graceful run -- 8/13 controls skip (no rail fixture), 1 genuine FAIL (2.4.7, not yet investigated)" },
  "form-validation-audit.js": { exit: 0, why: "fixed -- MODALS is now an optional adapter export, this app has none" }
};

let drift = 0;
for (const [file, { exit: expected, why }] of Object.entries(EXPECTED)) {
  let actual = 0;
  try {
    execFileSync("node", [file], { stdio: "pipe" });
  } catch (e) {
    actual = e.status ?? 1;
  }
  const ok = actual === expected;
  console.log(`${ok ? "  ok " : "DRIFT"}  ${file.padEnd(24)} expected ${expected}, got ${actual}  (${why})`);
  if (!ok) drift++;
}

console.log(`\n${Object.keys(EXPECTED).length - drift}/${Object.keys(EXPECTED).length} match their documented outcome.`);
if (drift > 0) {
  console.log(`${drift} drifted. Update docs/portability/adapter-reference-app.md AND this file's`);
  console.log("EXPECTED map together, with a reason -- drift is worth understanding before silencing.");
}
process.exit(drift > 0 ? 1 : 0);
