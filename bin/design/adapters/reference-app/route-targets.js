// The reference-app equivalent of bin/design/route-targets.rb: prints every screen as JSON,
// [{path, controller, action}], per adapter.md's contract. No `:id` substitution needed -- this
// app has no dynamic segments -- so this is closer to "walk the app directory" (the Next.js case
// in adapter.md) than to Rails' router introspection.
const { ROUTES } = require("../../../../examples/reference-app/server.js");

const targets = ROUTES
  .filter((r) => r.method === "GET" && r.auth !== false)
  .map((r) => ({ path: r.path, controller: r.controller, action: r.action }));

process.stdout.write(JSON.stringify(targets));
