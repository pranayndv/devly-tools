import { ESLint, Linter } from "eslint";
import { NextRequest, NextResponse } from "next/server";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export const runtime = "nodejs";

type RequestBody = {
  code: string;
  language: string;
  fix?: boolean;
};

const LANGUAGE_FILES: Record<string, string> = {
  typescript: "devly-code.ts",
  typescriptreact: "devly-code.tsx",
  javascript: "devly-code.js",
  javascriptreact: "devly-code.jsx",
};

function severity(
  value: number,
): "error" | "warning" | "info" {
  if (value === 2) return "error";
  if (value === 1) return "warning";
  return "info";
}

function getLineColumn(
  source: string,
  offset: number,
) {
  const safeOffset = Math.max(
    0,
    Math.min(offset, source.length),
  );

  const before = source.slice(
    0,
    safeOffset,
  );

  const lines = before.split(/\r?\n/);

  const lastLine = lines.at(-1) ?? "";

  return {
    line: lines.length,
    column: lastLine.length + 1,
  };
}

function createESLint(
  language: string,
  fix: boolean,
) {
  const isTypeScript =
    language === "typescript" ||
    language === "typescriptreact";

  const rules = {
    "sonarjs/no-all-duplicated-branches":
      "warn",

    "sonarjs/no-duplicate-string":
      "warn",

    "sonarjs/no-identical-functions":
      "warn",

    "sonarjs/no-nested-switch":
      "warn",

    "sonarjs/no-small-switch":
      "warn",

    "consistent-return":
      "warn",
  } satisfies Linter.RulesRecord;

  const config: Linter.Config[] = [
    {
      files: [
        isTypeScript
          ? "**/*.{ts,tsx}"
          : "**/*.{js,jsx}",
      ],

      plugins: {
        sonarjs,
      },

      rules,
    },
  ];

  if (isTypeScript) {
    config.push({
      files: ["**/*.{ts,tsx}"],

      plugins: {
        "@typescript-eslint":
          tseslint.plugin,
      },

      languageOptions: {
        parser: tseslint.parser,
      },
    });
  }

  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
    fix,
  });
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as RequestBody;

    if (
      typeof body.code !== "string" ||
      typeof body.language !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid analysis request.",
        },
        {
          status: 400,
        },
      );
    }

    const filePath =
      LANGUAGE_FILES[
        body.language
      ];

    /*
     * ESLint is only used for JS/TS
     * related languages.
     */
    if (!filePath) {
      return NextResponse.json({
        success: true,
        issues: [],
        fixedCode: body.code,
        errorCount: 0,
        warningCount: 0,
      });
    }

    const eslint = createESLint(
      body.language,
      Boolean(body.fix),
    );

    const results =
      await eslint.lintText(
        body.code,
        {
          filePath,
        },
      );

    const result = results[0];

    if (!result) {
      return NextResponse.json({
        success: true,
        issues: [],
        fixedCode: body.code,
        errorCount: 0,
        warningCount: 0,
      });
    }

    const source =
      result.source ?? body.code;

    const issues =
      result.messages.map(
        (message, index) => {
          const suggestions =
            message.suggestions
              ?.filter(
                (suggestion) =>
                  Boolean(
                    suggestion.fix,
                  ),
              )
              .map((suggestion) => {
                if (!suggestion.fix) {
                  return null;
                }

                const start =
                  getLineColumn(
                    source,
                    suggestion.fix
                      .range[0],
                  );

                const end =
                  getLineColumn(
                    source,
                    suggestion.fix
                      .range[1],
                  );

                return {
                  message:
                    suggestion.desc ??
                    suggestion.messageId,

                  desc:
                    suggestion.desc ??
                    suggestion.messageId,

                  output:
                    suggestion.fix.text,

                  range: {
                    startLineNumber:
                      start.line,

                    startColumn:
                      start.column,

                    endLineNumber:
                      end.line,

                    endColumn:
                      end.column,
                  },
                };
              })
              .filter(
                (
                  suggestion,
                ): suggestion is NonNullable<
                  typeof suggestion
                > =>
                  suggestion !== null,
              ) ?? [];

          return {
            id: [
              message.ruleId ??
                "unknown",

              message.line ??
                1,

              message.column ??
                1,

              index,
            ].join("-"),

            rule:
              message.ruleId ??
              "unknown",

            message:
              message.message,

            severity:
              severity(
                message.severity,
              ),

            startLineNumber:
              message.line ?? 1,

            startColumn:
              message.column ?? 1,

            endLineNumber:
              message.endLine ??
              message.line ??
              1,

            endColumn:
              message.endColumn ??
              (message.column
                ? message.column + 1
                : 2),

            fixable:
              Boolean(message.fix),

            suggestions,
          };
        },
      );

    return NextResponse.json({
      success: true,

      issues,

      fixedCode:
        result.output ??
        body.code,

      errorCount:
        result.errorCount,

      warningCount:
        result.warningCount,
    });
  } catch (error) {
    console.error(
      "Devly code analysis failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Code analysis failed.",
      },
      {
        status: 500,
      },
    );
  }
}