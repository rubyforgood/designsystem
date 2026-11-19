import { defineConfig } from "tsup";

// Every component ships two ways (see README's "Using the components" / components/README.md):
//
//   dist/components/<name>.js   — plain ESM, `lit` external. For npm consumers; multiple
//                                 components share one copy of `lit` instead of each bundling it.
//   dist/standalone/<name>.js   — `lit` bundled in. Copy this single file into a project with no
//                                 package manager at all, mirroring bin/design/'s existing
//                                 "copy the audit file in" distribution pattern (see root README).
const ENTRY = {
  button: "components/button.js",
  "status-pill": "components/status-pill.js",
  "icon-tile": "components/icon-tile.js",
  avatar: "components/avatar.js",
  card: "components/card.js",
  "flash-message": "components/flash-message.js",
  "page-header": "components/page-header.js",
  tabs: "components/tabs.js",
  "page-tabs": "components/page-tabs.js",
  modal: "components/modal.js",
  popover: "components/popover.js",
  field: "components/field.js",
  "error-summary": "components/error-summary.js",
  table: "components/table.js",
  "date-range-picker": "components/date-range-picker.js",
};

export default defineConfig([
  {
    name: "components",
    entry: ENTRY,
    outDir: "dist/components",
    format: ["esm"],
    external: ["lit", "@floating-ui/dom"],
    dts: false,
    sourcemap: true,
    clean: true,
  },
  {
    name: "standalone",
    entry: ENTRY,
    outDir: "dist/standalone",
    format: ["esm"],
    noExternal: ["lit", "@floating-ui/dom"],
    // Each standalone file must be genuinely self-contained — that's the whole point of this
    // mode (copy one file, no resolution). Without this, esbuild shares a `lit` chunk across
    // entries, silently turning "one file" into "one file plus a chunk it imports."
    splitting: false,
    dts: false,
    sourcemap: true,
    clean: true,
  },
]);
