import type { Linter } from "eslint";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";
import tailwindcss from "eslint-plugin-tailwindcss";

const sonarRules: Record<string, Linter.RuleEntry> = {
  "sonarjs/no-all-duplicated-branches": "warn",
  "sonarjs/no-duplicate-string": "warn",
  "sonarjs/no-identical-functions": "warn",
  "sonarjs/no-nested-switch": "warn",
  "sonarjs/no-small-switch": "warn",
  "sonarjs/cognitive-complexity": ["warn", 15],
  "sonarjs/max-switch-cases": ["warn", 30],
  "sonarjs/no-collapsible-if": "warn",
  "sonarjs/no-collection-size-mischeck": "warn",
  "sonarjs/no-duplicated-branches": "warn",
  "sonarjs/no-element-overwrite": "warn",
  "sonarjs/no-empty-collection": "warn",
  "sonarjs/no-extra-arguments": "warn",
  "sonarjs/no-gratuitous-expressions": "warn",
  "sonarjs/no-identical-conditions": "warn",
  "sonarjs/no-ignored-return": "warn",
  "sonarjs/no-incomplete-assertion": "warn",
  "sonarjs/no-inconsistent-returns": "warn",
  "sonarjs/no-invalid-regexp": "warn",
  "sonarjs/no-invariant-returns": "warn",
  "sonarjs/no-misleading-array-reverse": "warn",
  "sonarjs/no-misleading-character-class": "warn",
  "sonarjs/no-nested-template-literals": "warn",
  "sonarjs/no-redundant-assignments": "warn",
  "sonarjs/no-redundant-optional": "warn",
  "sonarjs/no-redundant-parentheses": "warn",
  "sonarjs/no-redundant-type-constituents": "warn",
  "sonarjs/no-reference-error": "warn",
  "sonarjs/no-similar-functions": "warn",
  "sonarjs/no-single-iteration": "warn",
  "sonarjs/no-skipped-tests": "warn",
  "sonarjs/no-tabindex": "warn",
  "sonarjs/no-template-curly-in-string": "warn",
  "sonarjs/no-try-promise": "warn",
  "sonarjs/no-undefined-argument": "warn",
  "sonarjs/no-unthrown-error": "warn",
  "sonarjs/no-useless-intersection": "warn",
  "sonarjs/no-useless-react-setstate": "warn",
  "sonarjs/no-variable-usage-before-declaration": "warn",
  "sonarjs/prefer-immediate-return": "warn",
  "sonarjs/prefer-object-literal": "warn",
  "sonarjs/prefer-regexp-exec": "warn",
  "sonarjs/prefer-single-boolean-return": "warn",
  "sonarjs/slow-regex": "warn",
  "sonarjs/too-many-break-or-continue-in-loop": "warn",
  "sonarjs/unused-import": "warn",
};

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

  "@typescript-eslint/no-non-null-assertion":
    "warn",

  "@typescript-eslint/no-inferrable-types":
    "warn",

  "@typescript-eslint/no-duplicate-enum-values":
    "warn",

  "@typescript-eslint/no-duplicate-type-constituents":
    "warn",

  "@typescript-eslint/no-empty-object-type":
    "warn",

  "@typescript-eslint/no-extra-non-null-assertion":
    "warn",

  "@typescript-eslint/no-misused-new":
    "warn",

  "@typescript-eslint/no-redundant-type-constituents":
    "warn",

  "@typescript-eslint/array-type":
    "warn",

  "@typescript-eslint/consistent-type-assertions":
    "warn",

  "@typescript-eslint/consistent-type-definitions":
    ["warn", "interface"],

  "@typescript-eslint/consistent-type-imports":
    "warn",

  "@typescript-eslint/method-signature-style":
    "warn",

  "@typescript-eslint/prefer-as-const":
    "warn",

  "@typescript-eslint/prefer-enum-initializers":
    "warn",

  "@typescript-eslint/prefer-for-of":
    "warn",

  "@typescript-eslint/prefer-function-type":
    "warn",

  "@typescript-eslint/prefer-namespace-keyword":
    "warn",

  "@typescript-eslint/prefer-literal-enum-member":
    "warn",
};

const generalRules: Record<
  string,
  Linter.RuleEntry
> = {
  "no-console": "warn",
  "no-debugger": "warn",
  "no-eval": "error",
  "eqeqeq": "warn",
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

const tailwindRules: Record<
  string,
  Linter.RuleEntry
> = {
  "tailwindcss/classnames-order": "warn",

  "tailwindcss/no-contradicting-classname":
    "warn",

  "tailwindcss/no-custom-classname":
    "off",

  "tailwindcss/enforces-negative-arbitrary-values":
    "warn",

  "tailwindcss/migration-from-tailwind-2":
    "off",
};

/*
 * IMPORTANT
 *
 * The plugins have slightly different ESLint type
 * definitions depending on their installed versions.
 *
 * We deliberately cast the final configuration at
 * the ESLint boundary instead of allowing TypeScript
 * to infer a union of incompatible plugin types.
 */

export const codeAnalysisConfig =
  [
    ...tseslint.configs.recommended,

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
        ...sonarRules,
        ...typeScriptRules,
        ...generalRules,
      },
    },

    {
      files: [
        "**/*.{html,htm,js,jsx,ts,tsx}",
      ],

      plugins: {
        tailwindcss,
      },

      rules: {
        ...tailwindRules,
      },
    },
  ] as unknown as Linter.Config[];