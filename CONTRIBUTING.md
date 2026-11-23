# Contributing

Ruby For Good's design system is shared by several apps, so a change here can land in someone
else's app. These rules keep that safe. Read [README.md](README.md) first for what's here.

## Ways to contribute

- **Report a problem.** Open an issue. The most useful report says which rule or component, which
  app, and what you saw. A screenshot or a failing audit is the best evidence.
- **Correct a rule.** If [`design.md`](design.md) is wrong, or says something your app can't
  follow, open an issue or a pull request against it. Don't work around it quietly in your app: if
  it's wrong for you, it's probably wrong for someone else too.
- **Add or change a component, token or audit.** Open a pull request, following the rules below.

## Rules for a pull request

1. **Change `design.md` in the same pull request** as any change to the UI it describes. The
   spec comes first: a component that does something `design.md` doesn't describe is a gap in the
   spec, so write the rule down too.
2. **Tag every new rule** in `design.md` as **Portable** (holds on any app) or **Local** (this
   system's default answer). See
   [`docs/portability/design-md-tagging.md`](docs/portability/design-md-tagging.md).
3. **Components use tokens only**, never a hard-coded colour, size or font. Each component needs a
   Storybook story, and the story must pass the accessibility check (`npm run storybook`).
4. **Back up a claim with a measurement.** If a doc says something passes, or gives a number,
   it should be something you ran, with the date. If an audit passes, check that it would also
   fail on a broken page. The `audit-suite` and `evidence-discipline` skills in
   [`plugin/skills/`](plugin/skills/) explain how.
5. **Changing a skill?** Edit it in `plugin/skills/` (`.claude/skills` is a link to that folder)
   and bump `version` in `plugin/.claude-plugin/plugin.json`. Installed copies only update when
   that version changes.
6. **CI must pass** (`.github/workflows/checks.yml`): syntax checks, the seam check, the doc-link
   and citation audits, the components and Storybook builds, the accessibility and keyboard audits
   against the stories, and the reference-app known-outcomes harness.
7. **Say whether it's a breaking change** in the pull request description (see below).

## Versioning while we're on 0.x

*Draft policy. Not yet agreed; edit it here when it is.*

The package follows [semantic versioning](https://semver.org) and is still pre-1.0. On 0.x:

- **A minor release (0.1 → 0.2) may break things.** Examples: a renamed or removed attribute,
  slot, token or adapter export, or a component that looks noticeably different.
- **A patch release (0.1.0 → 0.1.1) never breaks things.** It's for bug fixes, accessibility
  fixes and new features that need no change from the app.
- **Every breaking change is listed** in that version's release notes, with what to change in the
  app. The [GitHub releases](https://github.com/rubyforgood/designsystem/releases) are the
  changelog. `docs/changelog.md` is Human Essentials' own history, not this package's.
- **Deprecate before removing, when it's cheap to.** If a renamed attribute, slot or token can
  keep working, leave the old name working for one more minor release and log a console warning
  naming its replacement. Remove it in the release after that. Apps then upgrade first and fix
  the warnings in their own time, rather than having both land on the same day. Where keeping the
  old behaviour would be costly or confusing, skip this and say so in the release notes.
- **Tell adopting apps before a breaking release ships**, not only in its release notes. Open an
  issue on each adopting app's repo, or post in its channel, saying what will change and in which
  version.
- **Apps pin an exact version**, as the README's Rails steps do, so nobody gets a breaking
  change without choosing to upgrade.

Version 1.0 means the components' attributes and the token names are stable. That should wait
until at least two apps besides Human Essentials are using the package.

## Releasing

Push a `vX.Y.Z` tag that matches the version in `package.json`. The
[release workflow](.github/workflows/release.yml) builds and publishes to npm. See
[ADR 15](docs/architecture/decisions/0015-publish-to-npm-via-a-tag-triggered-release-workflow.md).
