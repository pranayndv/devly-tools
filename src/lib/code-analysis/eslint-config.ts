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

      "@typescript-eslint/no-non-null-assertion":
        "warn",

      "@typescript-eslint/no-inferrable-types":
        "warn",

      "@typescript-eslint/no-duplicate-enum-values":
        "warn",

      "@typescript-eslint/no-empty-object-type":
        "warn",

      "@typescript-eslint/no-extra-non-null-assertion":
        "warn",

      "@typescript-eslint/array-type":
        "warn",

      "@typescript-eslint/consistent-type-assertions":
        "warn",

      "@typescript-eslint/consistent-type-definitions": [
        "warn",
        "interface",
      ],

      "@typescript-eslint/consistent-type-imports":
        "warn",

      "@typescript-eslint/prefer-as-const":
        "warn",

      "@typescript-eslint/prefer-enum-initializers":
        "warn",

      "@typescript-eslint/prefer-for-of":
        "warn",

      "@typescript-eslint/prefer-function-type":
        "warn",

      "@typescript-eslint/prefer-literal-enum-member":
        "warn",

      // =========================
      // Regex
      // =========================

      "no-invalid-regexp":
        "warn",

      "no-regex-spaces":
        "warn",

      "no-useless-escape":
        "warn",

      // =========================
      // Replace / String
      // =========================


      "no-useless-concat":
        "warn",

      "no-template-curly-in-string":
        "warn",
      // =========================
      // Negation / Conditions
      // =========================

      "no-unsafe-negation":
        "warn",

      "no-unsafe-optional-chaining":
        "warn",

      "eqeqeq":
        "warn",

      // =========================
      // JavaScript / TypeScript
      // =========================

      "no-console":
        "warn",

      "no-debugger":
        "warn",

      "no-eval":
        "error",

      "prefer-const":
        "warn",

      "no-var":
        "warn",

      "no-duplicate-imports":
        "warn",

      "no-unreachable":
        "error",

      "no-constant-condition":
        "warn",

      "no-self-assign":
        "warn",

      "no-self-compare":
        "warn",

      "no-throw-literal":
        "warn",

      "no-new-func":
        "error",

      "no-implied-eval":
        "error",

      "no-useless-return":
        "warn",

      "no-case-declarations":
        "warn",

      "no-compare-neg-zero":
        "warn",

      "no-cond-assign":
        "warn",

      "no-dupe-else-if":
        "error",

      "no-duplicate-case":
        "error",

      "no-empty":
        "warn",

      "no-extra-boolean-cast":
        "warn",

      "no-fallthrough":
        "warn",

      "no-irregular-whitespace":
        "warn",

      "no-loss-of-precision":
        "error",

      "no-prototype-builtins":
        "warn",

      "no-sparse-arrays":
        "warn",

      "no-unmodified-loop-condition":
        "warn",

      "no-unreachable-loop":
        "warn",

      "no-unsafe-finally":
        "warn",

      "no-unused-expressions":
        "warn",

      "no-useless-call":
        "warn",

      "no-useless-catch":
        "warn",

      "no-useless-computed-key":
        "warn",

      "no-useless-rename":
        "warn",

      "require-yield":
        "warn",

      "use-isnan":
        "warn",

      "valid-typeof":
        "error",
    },
  },
];