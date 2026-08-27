import { ESLint } from "eslint";
import { NextRequest, NextResponse } from "next/server";

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
          error: "Invalid analysis request.",
        },
        { status: 400 },
      );
    }

    const filePath =
      LANGUAGE_FILES[body.language];

    if (!filePath) {
      return NextResponse.json({
        success: true,
        issues: [],
        fixedCode: body.code,
      });
    }

    const eslint = new ESLint({
      overrideConfigFile: "eslint.config.mjs",
      fix: Boolean(body.fix),
    });

    const results = await eslint.lintText(
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
      });
    }

    const issues = result.messages.map(
      (message, index) => ({
        id: [
          message.ruleId ?? "unknown",
          message.line ?? 1,
          message.column ?? 1,
          index,
        ].join("-"),

        rule:
          message.ruleId ??
          "unknown",

        message:
          message.message,

        severity:
          severity(message.severity),

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

        suggestions:
          message.suggestions?.map(
            (suggestion) => ({
              message:
                suggestion.message,

              desc:
                suggestion.desc,

              output:
                suggestion.fix.text,

              range: {
                startLineNumber:
                  result.source
                    ? getLineColumn(
                        result.source,
                        suggestion.fix.range[0],
                      ).line
                    : message.line ?? 1,

                startColumn:
                  result.source
                    ? getLineColumn(
                        result.source,
                        suggestion.fix.range[0],
                      ).column
                    : message.column ?? 1,

                endLineNumber:
                  result.source
                    ? getLineColumn(
                        result.source,
                        suggestion.fix.range[1],
                      ).line
                    : message.endLine ??
                      message.line ??
                      1,

                endColumn:
                  result.source
                    ? getLineColumn(
                        result.source,
                        suggestion.fix.range[1],
                      ).column
                    : message.endColumn ??
                      (message.column
                        ? message.column + 1
                        : 2),
              },
            }),
          ),
      }),
    );

    return NextResponse.json({
      success: true,
      issues,
      fixedCode:
        result.output ?? body.code,
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
      { status: 500 },
    );
  }
}

function getLineColumn(
  source: string,
  offset: number,
) {
  const safeOffset = Math.max(
    0,
    Math.min(offset, source.length),
  );

  const before =
    source.slice(0, safeOffset);

  const lines =
    before.split(/\r?\n/);

  return {
    line: lines.length,
    column:
      lines[lines.length - 1].length + 1,
  };
}