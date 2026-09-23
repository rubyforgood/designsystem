# Adapter: reference-app

The adapter for `examples/reference-app`, and the audit files copied here **byte-for-byte,
unmodified** from `bin/design/` to prove (or disprove) that swapping this file for the Rails one
is enough to point them at a different app.

Findings, method, and what to make of the results: `docs/portability/adapter-reference-app.md`.
Do not "fix" the copied audits in place here to make them pass — a failure here is data about the
original file, and belongs in that findings doc, not silently patched out of the copy.

```bash
node ../../../../examples/reference-app/server.js &     # start the target app
rm -f /tmp/reference-app-targets.json                    # force a fresh route list
node keyboard-audit.js                                   # run any copied audit
```
