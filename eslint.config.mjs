import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored React Bits components (GlowCursor, PixelCard), kept as their author wrote them.
    // Their WebGL helper named `use` and render-time settings refs trip the React Compiler rules
    // but work as intended (this app doesn't enable the React Compiler).
    "components/reactbits/**",
  ]),
]);

export default eslintConfig;
