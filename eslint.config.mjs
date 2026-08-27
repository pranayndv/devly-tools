import {
  defineConfig,
  globalIgnores,
} from "eslint/config";

import nextVitals from
  "eslint-config-next/core-web-vitals";

import nextTs from
  "eslint-config-next/typescript";

import sonarjs from
  "eslint-plugin-sonarjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      sonarjs,
    },

    rules: {
      // =========================
      // SonarJS
      // =========================

      ...sonarjs.configs.recommended.rules,

      // =========================
      // TypeScript
      // =========================

      "@typescript-eslint/no-explicit-any":
        "warn",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // =========================
      // JavaScript / TypeScript
      // =========================

      "no-console":
        "warn",

      "no-debugger":
        "warn",

      "no-eval":
        "error",

      "eqeqeq":
        "warn",

      "prefer-const":
        "warn",

      "no-var":
        "warn",

      "no-duplicate-imports":
        "warn",
    },
  },

  // =========================
  // Global ignores
  // =========================

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    "node_modules/**",
  ]),
]);

export default eslintConfig;