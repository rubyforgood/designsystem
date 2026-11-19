// Serves `storybook-static/` (built via `npm run build-storybook`) so the adapter below has
// something to point `BASE_URL` at. Deliberately a plain `http` static server, not a new
// dependency — matches examples/reference-app/server.js's own zero-dependency style, and nothing
// here needs anything heavier than "read a file, guess its content-type, send it."
//
// Usage: node bin/design/adapters/storybook/serve.js [port]   (default 4300)
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../../../storybook-static");
const PORT = Number(process.argv[2] || process.env.PORT || 4300);

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
};

if (!fs.existsSync(ROOT)) {
  process.stderr.write(`${ROOT} does not exist — run \`npm run build-storybook\` first.\n`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(ROOT, urlPath === "/" ? "/index.html" : urlPath);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, "index.html");
    fs.readFile(filePath, (readErr, body) => {
      if (readErr) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { "content-type": TYPES[path.extname(filePath)] || "application/octet-stream" });
      res.end(body);
    });
  });
});

server.listen(PORT, () => {
  process.stdout.write(`Serving storybook-static/ at http://127.0.0.1:${PORT}\n`);
});
