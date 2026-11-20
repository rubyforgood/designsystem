// Config for `@custom-elements-manifest/analyzer` (the `npm run analyze` script).
//
// `--litelement`'s plain-`static properties`-object support reads JSDoc for a description but
// does not honour an `@ignore` tag on an internal `{ state: true }` entry the way it does on a
// constructor-assigned instance field — confirmed empirically while piloting this on
// button.js/field.js: `_hasActions`/`_draft`/etc. still showed up, undocumented, in the raw
// manifest. Rather than rely on a JSDoc tag with known, position-dependent gaps, this plugin
// strips any member whose name starts with `_` after analysis, the same "private by convention"
// rule the rest of this codebase already uses for internal Lit state.
const stripPrivateMembers = {
  name: "strip-private-members",
  packageLinkPhase({ customElementsManifest }) {
    for (const mod of customElementsManifest.modules ?? []) {
      for (const decl of mod.declarations ?? []) {
        // Lit's `{ state: true }` properties emit both a `members` field entry *and* a separate
        // top-level `attributes` entry for the same property — found by inspecting Storybook's
        // own actual args-table output, which still showed `_draft` after `members` alone was
        // filtered. Both need stripping, or the attributes table leaks it back in.
        if (decl.members) decl.members = decl.members.filter((m) => !m.name?.startsWith("_"));
        if (decl.attributes) decl.attributes = decl.attributes.filter((a) => !a.name?.startsWith("_"));
      }
    }
  },
};

export default {
  globs: ["components/*.js"],
  exclude: ["components/*.stories.js"],
  litelement: true,
  plugins: [stripPrivateMembers],
};
