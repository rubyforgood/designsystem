# 15. Publish to npm via a tag-triggered release workflow

Date: 2026-11-22

## Status

Accepted. Builds on [14. Add an installable component layer, built as Web
Components](0014-add-an-installable-component-layer.md); does not revise it.

## Context

ADR 14 made this repo an installable package in shape — `package.json` already has a scoped name,
an `exports` map per component, `publishConfig.access: public` for the scope, and a `files` list —
but not in fact: `@rubyforgood/design-system` has never been published, confirmed by a plain `npm
view` returning 404. The only install path that has ever worked is `npm install
github:rubyforgood/designsystem`, which pins a commit rather than a version and gives a consumer
no semver, no changelog, and no signal that a breaking change happened. There was also no release
workflow at all — publishing, had anyone tried it, would have meant running `npm publish` by hand
from a laptop, with whatever `dist/` and `custom-elements.json` happened to be sitting there
locally.

This surfaced while answering a direct question — a consuming app's own maintainer asking "do we
have everything needed for other apps to migrate to this design system, and if not, what's
missing" — not from a backlog item. The answer was no, and this and ADR 16 (migrating a second
real app) are the two gaps named.

## Decision

1. **Tag-triggered, not continuous.** `deploy-storybook.yml` already redeploys the docs site on
   every push to `main`; a release is a different kind of event — a deliberate, versioned
   publish — and ties to a `vX.Y.Z` git tag rather than a branch push. The maintainer bumps
   `package.json`'s `version`, commits it, and pushes a matching tag; the workflow does the rest.
   `workflow_dispatch` is also wired up, but only as the recovery path for a release that failed
   partway (see the idempotent release-creation step below) — not a second way to cut one.
2. **A version-match guard is the first real step**, before any build or publish: it compares the
   pushed tag against `package.json`'s own version and fails fast, with a specific message, if
   they disagree. The alternative — letting `npm publish` be the thing that discovers a forgotten
   version bump — either publishes the wrong number or fails with a registry error far less clear
   about what to do next.
3. **`dist/` and `custom-elements.json` are rebuilt in the release job itself**, not assumed
   current from whatever a previous CI run or a local checkout left behind — both are gitignored
   build artifacts (see ADR 14 and `components/README.md`'s "Autodocs" section), and a release
   built from a stale one would ship exactly that.
4. **Classic token auth (`NPM_TOKEN`, an npm "Automation" access token added as a repository
   secret), not npm's newer OIDC-based Trusted Publishing.** Trusted Publishing is configured from
   a package's own settings page on npmjs.com, which cannot exist before the package does — a
   brand-new, never-published scope has no settings page to attach a trusted publisher to. It
   remains a reasonable thing to switch to after the first release exists, named here rather than
   silently left for someone to wonder why it wasn't used.
5. **`--provenance` is used anyway.** Provenance attestation is unrelated to Trusted Publishing —
   it only needs `id-token: write` permission, which costs nothing extra once granted for the
   release's own OIDC token, and it is a real, free supply-chain signal (a verifiable link from
   the published package back to this exact workflow run and commit) with no dependency on how
   the registry publish itself is authenticated.
6. **The GitHub release's notes are `--generate-notes`, not a hand-written changelog file.** This
   repo has no `CHANGELOG.md`; the prose it already keeps (`docs/field-notes.md`,
   `docs/design-decisions.md`-style trails in its origin app) is aimed at a contributor explaining
   a judgment call, not at a consumer deciding whether to upgrade. GitHub's own
   commits/PRs-since-last-tag summary is the right size for that question without inventing and
   then maintaining a second log of the same information by hand.

## Consequences

A maintainer can now cut a real, versioned, semver-visible release with two commands (bump the
version, push a tag) instead of a manual `npm publish` from a laptop running whatever `dist/`
happened to be built last. This ADR does not itself make the first release — `NPM_TOKEN` still has
to be created on npmjs.com and added as a repository secret by someone with publish rights to the
`@rubyforgood` org, which is outside what a workflow file can do. Until that secret exists, pushing
a tag runs the workflow and fails cleanly at the `npm publish` step, not silently.

**Found along the way, fixed as part of this ADR, not deferred:** `package.json`'s `files` array
never listed `custom-elements.json`, even though the same file's top-level `customElements` field
names it — any real `npm publish` before this fix would have shipped a package whose own manifest
pointed at a file that wasn't there. `components/README.md`'s "Autodocs" section had already
named the manifest as gitignored-and-regenerated for Storybook's sake; nobody had asked what
happens to it in a package that gets published rather than only built locally, because until now
nothing did.

This does not resolve the other named gap from the same question that prompted this ADR — the
audit suite's portability proven for roughly half its scripts, and the component layer's only
real-world consumer still being this project's own origin app, Human Essentials. Publishing to
npm makes `@rubyforgood/design-system@0.1.0` installable; it does not make it proven on a second
app. That is deliberately separate, open work.
