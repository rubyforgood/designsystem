# reference-app

A deliberately small, deliberately non-Rails test fixture — not a demo of the design system.

Built for Phase 2 of the genericization plan (see `docs/portability/adapter-reference-app.md`):
to test whether `bin/design`'s "swap the adapter and the audit runs unmodified" claim actually
holds, by giving it a second, genuinely different app to run against. Plain Node `http`, no
framework, no ORM, no template engine, different sign-in field names, two roles instead of three.

```bash
node server.js          # http://127.0.0.1:4100, PORT env var to override
```

Its adapter lives in `bin/design/adapters/reference-app/`.
