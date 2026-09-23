# Phase 3: the source-reading audits

Phase 0 classified 9 scripts as "Rails-coupled by construction" — they read ERB templates, Ruby
source, or `Rails.application` directly, rather than rendered output, so swapping an adapter
(Phase 1/2's fix) can't make them portable. This phase went through each one and decided, per
audit, between three treatments: **reimplement** against rendered output when the rule doesn't
actually need source, **demote** to a documented Rails reference implementation when it does, or
**retire** when the audit has no equivalent outside the migration it was built for.

## Reimplemented (2)

### `doc-link-audit.rb` — extracted, not rewritten

`page-audit.rb` had a doc cross-reference checker (dead `#anchor` links in `design.md`/`docs/*.md`)
bolted onto an otherwise ERB-specific file. It had **zero Rails coupling already** — pure
`File.read` and regex over `.md` files. Extracted verbatim to `bin/design/doc-link-audit.rb`,
generalized the glob from `docs/*.md` to `docs/**/*.md` (the original would have been blind to
this repo's own `docs/portability/*.md`), and removed the now-duplicated logic from
`page-audit.rb` (whose `AUDIT-READS` declaration dropped `DOCS` accordingly).

Run against this repo's actual 24 markdown files as its first real test:

```
$ ruby bin/design/doc-link-audit.rb
24 document(s) checked, no dead links.
```

### `copy-audit.js` — reimplemented, proven against the reference app

`copy-audit.rb`'s checks split cleanly: the *rules* (WCAG 2.4.4 vague links, WCAG 1.3.3 sensory
instructions, gendered/ableist wording, politeness filler, shouting) are plain English-language
regexes with no Human Essentials content in them at all. The *extraction* — grep `app/views` for
`label: "..."`, recognize `link_to`/`essentials_link_button` calls, walk
`config/locales/**/*.yml` — is entirely Rails-specific.

Rebuilt as `bin/design/copy-audit.js`: same regex rules, unmodified in substance, driven by the
adapter seam (`targets()`/`signIn()`/`visit()`/`RUNS`) instead of grepping ERB. Extraction reads
the *rendered* page instead of the source that produced it — every element's own direct text,
every `<a>`'s label, every `aria-label`. Works against whatever the adapter points at.

Dropped: the `hint without a full stop` check, which depended on Rails form builder's `hint:` key
— a Local semantic category with no generic DOM equivalent. Noted as droppable rather than forced.

**Proven, not assumed** — following the same discipline as Phase 2. Added one deliberate copy
violation to `examples/reference-app` (a "Please…" sentence and a "Click here" link, commented as
an intentional positive control, the same role the reference app's icon buttons already play for
`tooltip-audit.js`), then ran the unmodified probe-tested script against it:

```
$ node copy-audit.js --verbose
link text (WCAG 2.4.4)             1
    /settings                      Click here
sensory instruction (WCAG 1.3.3)   0
gendered wording                   0
ableist wording                    0
politeness filler                  1
    /settings                      Please contact support if you need help. to learn more.
shouting                           0

3 page(s) checked, 2 finding(s)
```

Both planted violations found; nothing else on the app's genuine content (sign-in form, table,
labels) flagged falsely. One known rough edge, not fixed: the reported text for the "Please…"
finding concatenates the `<p>`'s text nodes across the `<a>` inside it ("Please contact support if
you need help. to learn more."), losing "Click here" from the middle. Detection is correct — the
regex matched the right text — display is slightly garbled for text split by an inline element.
Documented rather than engineered around, on a two-page test app.

## Demoted to Rails reference implementation (6)

Read in full; each genuinely needs source access — a router's own resolution logic, ERB
compilation, ActiveSupport reflection — and reimplementing "the same rule, a different mechanism"
for an unspecified second framework isn't worth doing speculatively, unlike Phase 2 where a
concrete second adapter existed to build against. Left running exactly as before. What's captured
here is the *rule*, for whoever eventually builds the equivalent against a different stack.

| File | The portable rule | Why it can't just swap an adapter |
| --- | --- | --- |
| `dead-routes.rb` | Every declared route should resolve to a real, renderable action; a route another route shadows is a distinct defect from one that's simply dead. | Needs the framework's own router resolution (`recognize_path`) — which route wins when two could answer the same path is framework policy, not something a browser crawl can observe. |
| `route-shadow.rb` | A static file precedes the router and can silently substitute for a dynamic route. | Needs the framework's static-file-serving precedence rules and its own route list to cross-reference against. |
| `dead-code.rb` | Code with no route, no render, and no caller anywhere is a maintenance liability, and *every naive version of this check reports false positives first* — receiver methods vs. helpers, interpolated partial paths, transitive dependencies invisible to static analysis. | Needs full reflection over the framework's own dispatch (`ApplicationController.descendants`, `action_methods`) — this is the single most languagerelated of the six; a JS/Python equivalent would look structurally different, not just re-pointed. |
| `template-compile-audit.rb` | Lint passing and specs passing don't prove a template *compiles* — a sweep once interpolated Python's `None` into a helper call, and nothing but this caught it before it would 500 in production. | Needs the framework's own template compiler (`ActionView::Template::Handlers::ERB::Erubi`) — the rule ("actually compile every template, don't just check the tags are well-formed") transfers to JSX/Vue SFCs/Django templates; the compiler call doesn't. |
| `shell-first-audit.rb` | A page can pass every other check (no legacy class, clean console, proper header) while its *body* was never migrated — description-list-shaped content built from flat `<p>` pairs, a hand-rolled card header, doubled page gutters. | Detection is entirely keyed to this app's own Tailwind vocabulary (`.data-table`, `border-slate-200`, `essentials_button_classes`) — Local by construction, not by neglect. The *shape* of the rule ("passing the negative checks isn't the same as matching the positive pattern") is the reusable part. |
| `undefined-classes.py` | A class token nothing defines renders as nothing, silently — the CSS build and the markup can drift with no error anywhere. | **Partially reimplementable, not done this pass.** The "class in markup vs. class in compiled CSS" half could plausibly move to rendered output + `document.styleSheets`, the same shape as `copy-audit.js`'s move. The "class referenced only from JavaScript" half inherently needs to read JS source, though that part isn't actually Rails-specific — any `app/javascript/**/*.js` glob-and-grep works regardless of backend. Flagged as the next reimplementation candidate, not attempted here to avoid this pass sprawling into a third rebuild without proving the first two first. |

## Retired, not demoted (1)

**`status.rb`** — reports how much of Human Essentials' specific Bootstrap/AdminLTE→Tailwind
migration is done, using a hardcoded vocabulary of that migration's own legacy class names
(`btn`, `form-group`, `fa-`, `data-bs-`, …). Unlike the six above, there's no "equivalent on
another stack" to point a future adopter toward — this audit's entire reason to exist was one
project's one migration. Its methodology lesson is captured instead of its code: **a
positive-marker test ("does this view carry new-system markup?") can't finish, because the new
system's vocabulary grows with every component it gains, so the test is always one component
behind and reports finished work as outstanding.** Once a legacy vocabulary is *closed* — nobody
can add a new Bootstrap class once Bootstrap is gone — the question inverts to "does this still use
the old system," which has a stable answer. Worth knowing before building a similar tracker for a
future migration; not worth carrying the Human Essentials-specific regex list forward.

Left in `bin/design/` rather than deleted — it's real history, small, and does no harm sitting
there — but should not be treated as a template the way the six demoted files are.

## Left alone, with a documented reason (1)

**`which-audits.rb`** — the suite's own meta-tool (enumerates `bin/design/*.{js,rb,py}`, reads
each file's `AUDIT-READS` declaration, matches against a changed-file diff). Read in full: roughly
90% of it — the enumeration, the declaration parsing, the git diff logic, the "every file must
account for itself" enforcement — has no Rails coupling at all. The Rails-specific 10% is
narrow and already isolated: the `BUNDLES` hash's paths (`app/views/`, `config/routes.rb`, …) and
`runner_for()`'s one Rails-detection line (`bin/rails runner` vs. plain `ruby`, chosen by grepping
the audit file for `Rails.`).

Not genericized this pass. Unlike `copy-audit.rb` and `undefined-classes.py`, there's no concrete
second use case driving the shape a generic version should take — Phase 2 had a real second
adapter to build `copy-audit.js` against; here there's no second bundle-config format anyone's
asked for yet. Turning `BUNDLES` into a config file now would be guessing at a shape rather than
answering a real need, the same anti-pattern `design-system-migration`'s own notes warn against
("proposing your own prerequisite and then doing it"). Flagged as ready to genericize *when* a
second bundle configuration is actually needed — the seam to cut along is already obvious (the
`BUNDLES` hash and `runner_for`'s Rails check), which is most of the value of having looked.

## Updated audit inventory

Supersedes the "Source-reading audits" table in `audit-tooling-classification.md` for these files:

| File | Treatment | Status |
| --- | --- | --- |
| `doc-link-audit.rb` (new) | Reimplemented | Portable, tested against this repo's own docs |
| `copy-audit.js` (new) | Reimplemented | Portable, tested against `examples/reference-app` with a positive control |
| `copy-audit.rb` | Superseded by `copy-audit.js` for the portable checks | Kept — still the only one reading `config/locales/**/*.yml` and the `hint:` check |
| `page-audit.rb` | Narrowed (doc-link logic removed) | Rails reference; remaining checks are Local by construction |
| `dead-routes.rb`, `route-shadow.rb`, `dead-code.rb`, `template-compile-audit.rb`, `shell-first-audit.rb` | Demoted | Rails reference implementations; rule extracted above |
| `undefined-classes.py` | Demoted, partially reimplementable | Next candidate, not attempted this pass |
| `status.rb` | Retired | Historical; methodology captured, code not a template |
| `which-audits.rb` | Left alone | ~90% portable mechanism; genericize when a second config shape is actually needed |
