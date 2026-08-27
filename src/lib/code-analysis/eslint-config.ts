import type { Linter } from "eslint";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

const sonarRules: Record<string, Linter.RuleEntry> =
  Object.fromEntries(
    Object.keys(sonarjs.rules ?? {}).map((ruleName) => [
      `sonarjs/${ruleName}`,
      "warn",
    ]),
  );

const typeScriptRules: Record<
  string,
  Linter.RuleEntry
> = {
  "@typescript-eslint/no-explicit-any": "warn",

  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],

  "@typescript-eslint/no-non-null-assertion": "warn",

  "@typescript-eslint/no-inferrable-types": "warn",

  "@typescript-eslint/no-duplicate-enum-values": "warn",

  "@typescript-eslint/no-empty-object-type": "warn",

  "@typescript-eslint/no-extra-non-null-assertion": "warn",

  "@typescript-eslint/no-misused-new": "warn",

  "@typescript-eslint/array-type": "warn",

  "@typescript-eslint/consistent-type-assertions": "warn",

  "@typescript-eslint/consistent-type-definitions": [
    "warn",
    "interface",
  ],

  "@typescript-eslint/consistent-type-imports": "warn",

  "@typescript-eslint/method-signature-style": "warn",

  "@typescript-eslint/prefer-as-const": "warn",

  "@typescript-eslint/prefer-enum-initializers": "warn",

  "@typescript-eslint/prefer-for-of": "warn",

  "@typescript-eslint/prefer-function-type": "warn",

  "@typescript-eslint/prefer-namespace-keyword": "warn",

  "@typescript-eslint/prefer-literal-enum-member": "warn",
};

const generalRules: Record<
  string,
  Linter.RuleEntry
> = {
  "no-console": "warn",
  "no-debugger": "warn",
  "no-eval": "error",
  eqeqeq: "warn",
  "prefer-const": "warn",
  "no-var": "warn",
  "no-duplicate-imports": "warn",

  "no-unreachable": "error",
  "no-constant-condition": "warn",
  "no-self-assign": "warn",
  "no-self-compare": "warn",
  "no-throw-literal": "warn",
  "no-new-func": "error",
  "no-implied-eval": "error",
  "no-useless-return": "warn",
  "no-useless-concat": "warn",
  "no-useless-escape": "warn",
  "no-case-declarations": "warn",
  "no-compare-neg-zero": "warn",
  "no-cond-assign": "warn",
  "no-dupe-else-if": "error",
  "no-duplicate-case": "error",
  "no-empty": "warn",
  "no-extra-boolean-cast": "warn",
  "no-fallthrough": "warn",
  "no-irregular-whitespace": "warn",
  "no-loss-of-precision": "error",
  "no-misleading-character-class": "warn",
  "no-prototype-builtins": "warn",
  "no-regex-spaces": "warn",
  "no-sparse-arrays": "warn",
  "no-template-curly-in-string": "warn",
  "no-unmodified-loop-condition": "warn",
  "no-unreachable-loop": "warn",
  "no-unsafe-finally": "warn",
  "no-unsafe-negation": "warn",
  "no-unsafe-optional-chaining": "warn",
  "no-unused-expressions": "warn",
  "no-useless-call": "warn",
  "no-useless-catch": "warn",
  "no-useless-computed-key": "warn",
  "no-useless-rename": "warn",
  "require-yield": "warn",
  "use-isnan": "warn",
  "valid-typeof": "error",
};

export const codeAnalysisConfig =
  [
    // ==========================================
    // JavaScript / JSX
    // ==========================================
    {
      files: ["**/*.{js,jsx}"],

      plugins: {
        sonarjs,
      },

      rules: {
        ...sonarRules,
        ...generalRules,
      },
    },

    // ==========================================
    // TypeScript / TSX
    // ==========================================
    {
      files: ["**/*.{ts,tsx}"],

      plugins: {
        sonarjs,
        "@typescript-eslint": tseslint.plugin,
      },

      languageOptions: {
        parser: tseslint.parser,
      },

      rules: {
        ...sonarRules,
        ...generalRules,
        ...typeScriptRules,
      },
    },
  ] as unknown as Linter.Config[];