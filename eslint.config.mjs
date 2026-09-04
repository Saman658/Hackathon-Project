import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      "analyze-images.cjs",
      "analyze-layout.cjs",
      "analyze-layout2.cjs",
      "resize-categories.cjs",
      "split-reference.cjs",
      "test-rls2.mjs",
      "scripts/_tmp_compare.mjs",
      "scripts/_tmp_img_meta.cjs",
      "scripts/check-deleted.ts",
      "scripts/inspect-db.js",
      "scripts/test-scroll4.ts",
      "scripts/tmp-scrape.js",
      "scripts/verify-categories.ts",
      "scripts/verify-live-logins.mjs",
    ],
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
