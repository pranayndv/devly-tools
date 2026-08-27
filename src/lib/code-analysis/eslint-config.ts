import type { Linter } from "eslint";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export const codeAnalysisConfig: Linter.Config[] = [
  {
    files: [
      "**/*.{js,jsx,ts,tsx}",
    ],

    plugins: {
      sonarjs,
      "@typescript-eslint":
        tseslint.plugin,
    },

    languageOptions: {
      parser: tseslint.parser,
    },

    rules: {
      // =========================
      // SonarJS
      // =========================

      "sonarjs/no-duplicate-string":
        "warn",

      "sonarjs/no-identical-functions":
        "warn",

      "sonarjs/no-nested-switch":
        "warn",

      "sonarjs/no-small-switch":
        "warn",

      "sonarjs/no-all-duplicated-branches":
        "warn",

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
];