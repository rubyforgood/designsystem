#!/usr/bin/env node
// Every var() in tokens/theme.css must resolve to something Tailwind v4 actually defines.
//
// theme.css maps the design system's roles onto Tailwind's own theme variables
// (`--radius-pill: var(--radius-full)`). A reference to a variable Tailwind doesn't have is not an
// error anywhere: the custom property is just invalid at computed-value time, and the property
// that uses it falls back to its initial value. That is how v0.1.0 to v0.1.3 shipped
// `--radius-pill: var(--radius-full)`, and Tailwind v4 has no `--radius-full`, so every pill and
// avatar in a Tailwind app using theme.css rendered with square corners. Found 2026-11-24 while
// migrating SkillRx. tokens.css (no Tailwind) was right all along.
//
// Compiles theme.css with the real Tailwind CLI, `theme(static)` so every variable is emitted,
// then checks each var() reference against what came out.
//
// Usage: node bin/design/theme-tokens-audit.js    (exit 1 on any unresolved reference)
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const THEME = path.join(ROOT, "tokens/theme.css");
// Inside the repo, not the OS temp dir: the CLI resolves `tailwindcss` from the input file's folder.
const input = path.join(ROOT, "node_modules/.theme-tokens-audit.css");
fs.writeFileSync(input, `@import "tailwindcss" theme(static);\n@import "${THEME}" theme(static);\n`);
const cli = path.join(ROOT, "node_modules/.bin/tailwindcss");
const css = execFileSync(cli, ["-i", input], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

const defined = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const source = fs.readFileSync(THEME, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const refs = [...source.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
const missing = [...new Set(refs)].filter((r) => !defined.has(r));
// The tokens theme.css itself defines must come out too, or the check above proves nothing.
const own = [...source.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]);
const notEmitted = own.filter((t) => !defined.has(t));

if (!refs.length || !own.length) { console.log("Read no tokens from theme.css: the check is broken."); process.exit(1); }
if (missing.length || notEmitted.length) {
  for (const m of missing) console.log(`theme.css references ${m}, which Tailwind v4 doesn't define`);
  for (const m of notEmitted) console.log(`theme.css defines ${m}, but it wasn't emitted`);
  process.exit(1);
}
console.log(`${own.length} tokens in theme.css; all ${new Set(refs).size} var() references resolve in Tailwind v4.`);
