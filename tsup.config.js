import { defineConfig } from "tsup";

// Every component ships two ways (see README's "Using the components" / components/README.md):
//
//   dist/components/<name>.js   — plain ESM, `lit` external. For npm consumers; multiple
//                                 components share one copy of `lit` instead of each bundling it.
//   dist/standalone/<name>.js   — `lit` bundled in. Copy this single file into a project with no
//                                 package manager at all, mirroring bin/design/'s existing
//                                 "copy the audit file in" distribution pattern (see root README).
export default defineConfig([
  {
    name: "components",
    entry: { button: "components/button.js" },
    outDir: "dist/components",
    format: ["esm"],
    external: ["lit"],
    dts: false,
    sourcemap: true,
    clean: true,
  },
  {
    name: "standalone",
    entry: { button: "components/button.js" },
    outDir: "dist/standalone",
    format: ["esm"],
    noExternal: ["lit"],
    dts: false,
    sourcemap: true,
    clean: true,
  },
]);
