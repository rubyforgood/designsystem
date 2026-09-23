// A deliberately small, deliberately non-Rails reference app.
//
// Built to test Phase 2 of the genericization plan: does the bin/design audit suite's "swap the
// adapter and the audit runs unmodified" claim actually hold against a different stack? Node's
// core `http` module only -- no framework, no ORM, no template engine, no Devise-shaped sign-in
// form, no Tailwind class vocabulary borrowed from design.md. If an audit's assertions turn out to
// only make sense against Human Essentials' own markup, this app is built to surface that plainly
// rather than accidentally passing by resembling it.
//
// Not a demo of the design system. A test fixture for the audit tooling.
const http = require("http");

const PORT = process.env.PORT || 4100;

const USERS = {
  "member@example.org": { password: "letmein", role: "member" },
  "admin@example.org": { password: "letmein", role: "admin" }
};

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header.split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
    })
  );
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      resolve(Object.fromEntries(new URLSearchParams(data)));
    });
  });
}

function layout(role, title, body) {
  const nav = role
    ? `<nav aria-label="Primary">
         <a href="/dashboard">Dashboard</a>
         <a href="/settings">Settings</a>
         ${role === "admin" ? '<a href="/admin">Admin</a>' : ""}
         <a href="/sign-out">Sign out</a>
       </nav>`
    : "";
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: sans-serif; margin: 0; }
  a:focus, button:focus { outline: 2px solid #2563eb; outline-offset: 2px; }
  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 200px; padding: 16px; border-right: 1px solid #ddd; }
  .sidebar a { display: block; padding: 6px 0; }
  main { flex: 1; padding: 24px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
  .icon-btn { width: 28px; height: 28px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
  .reveal { margin-left: 16px; padding-left: 4px; border-left: 2px solid #ddd; }
</style>
</head>
<body>
<a href="#main" class="skip-link">Skip to content</a>
<div class="layout">
  <div class="sidebar">${nav}</div>
  <main id="main">${body}</main>
</div>
</body>
</html>`;
}

function signInPage(error) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Sign in</title></head>
<body>
  <main>
    <h1>Sign in</h1>
    ${error ? `<p role="alert">${error}</p>` : ""}
    <form method="post" action="/sign-in">
      <label for="identifier">Email</label>
      <input id="identifier" name="identifier" type="email" autocomplete="username">
      <label for="secret">Password</label>
      <input id="secret" name="secret" type="password" autocomplete="current-password">
      <button type="submit">Sign in</button>
    </form>
  </main>
</body>
</html>`;
}

function dashboardPage(role) {
  const rows = [
    { name: "First item", status: "Active" },
    { name: "Second item", status: "Active" },
    { name: "Third item", status: "Archived" }
  ];
  const tableRows = rows.map((r) => `
    <tr>
      <td>${r.name}</td>
      <td>${r.status}</td>
      <td>
        <button class="icon-btn" data-tooltip="Edit ${r.name}" aria-label="Edit ${r.name}">&#9998;</button>
        <button class="icon-btn" data-tooltip="Delete ${r.name}" aria-label="Delete ${r.name}">&#10005;</button>
      </td>
    </tr>`).join("");
  return layout(role, "Dashboard", `
    <h1>Dashboard</h1>
    <table>
      <caption class="sr-only">Items</caption>
      <thead><tr><th scope="col">Name</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  `);
}

function settingsPage(role) {
  return layout(role, "Settings", `
    <h1>Settings</h1>
    <form>
      <fieldset>
        <legend>Notifications</legend>
        <input type="checkbox" id="notify" aria-controls="notify-panel">
        <label for="notify">Notify me by email</label>
        <div id="notify-panel" class="reveal">
          <label for="notify-email">Notification email</label>
          <input id="notify-email" type="email">
        </div>
      </fieldset>
    </form>
    <!-- Deliberate copy-quality violations -- a positive control for bin/design/copy-audit.js,
         same purpose as this file's icon buttons for tooltip-audit.js. Not a style mistake to
         someday "fix"; removing it would just make the live-crawl proof untested again. -->
    <p>Please contact support if you need help. <a href="/help">Click here</a> to learn more.</p>`);
}

function adminPage(role) {
  return layout(role, "Admin", `
    <h1>Admin</h1>
    <p>Administrative settings.</p>
    <button class="icon-btn">&#9881;</button>
  `);
}

const ROUTES = [
  { path: "/sign-in", controller: "sessions", action: "new", method: "GET", auth: false },
  { path: "/sign-in", controller: "sessions", action: "create", method: "POST", auth: false },
  { path: "/sign-out", controller: "sessions", action: "destroy", method: "GET", auth: false },
  { path: "/dashboard", controller: "dashboard", action: "index", method: "GET", auth: "any" },
  { path: "/settings", controller: "settings", action: "edit", method: "GET", auth: "any" },
  { path: "/admin", controller: "admin", action: "index", method: "GET", auth: "admin" }
];

module.exports.ROUTES = ROUTES;

if (require.main === module) {
  const server = http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const cookies = parseCookies(req);
    const role = cookies.session && USERS[cookies.session] ? USERS[cookies.session].role : null;
    const identity = cookies.session;

    const route = ROUTES.find((r) => r.path === pathname && r.method === req.method);

    if (pathname === "/sign-in" && req.method === "POST") {
      const body = await parseBody(req);
      const user = USERS[body.identifier];
      if (user && user.password === body.secret) {
        res.writeHead(302, {
          "Set-Cookie": `session=${encodeURIComponent(body.identifier)}; Path=/`,
          Location: "/dashboard"
        });
        return res.end();
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(signInPage("Incorrect email or password"));
    }

    if (pathname === "/sign-out") {
      res.writeHead(302, { "Set-Cookie": "session=; Path=/; Max-Age=0", Location: "/sign-in" });
      return res.end();
    }

    if (!route) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("<h1>404</h1>");
    }

    if (route.auth === "any" && !identity) {
      res.writeHead(302, { Location: "/sign-in" });
      return res.end();
    }
    if (route.auth === "admin" && role !== "admin") {
      res.writeHead(role ? 403 : 302, role ? {} : { Location: "/sign-in" });
      return res.end(role ? "<h1>403</h1>" : "");
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    if (pathname === "/sign-in") return res.end(signInPage());
    if (pathname === "/dashboard") return res.end(dashboardPage(role));
    if (pathname === "/settings") return res.end(settingsPage(role));
    if (pathname === "/admin") return res.end(adminPage(role));
    res.end("<h1>404</h1>");
  });

  server.listen(PORT, () => {
    console.log(`reference-app listening on http://127.0.0.1:${PORT}`);
  });
}
