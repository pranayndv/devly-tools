import { diffLines } from "diff";

export interface DiffStatistics {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
  totalChanges: number;
}

export interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

function normalizeLine(
  line: string,
  options: DiffOptions,
) {
  let result = line;

  if (options.ignoreWhitespace) {
    result = result
      .replace(/\s+/g, " ")
      .trim();
  }

  if (options.ignoreCase) {
    result = result.toLowerCase();
  }

  return result;
}

function normalizeText(
  text: string,
  options: DiffOptions,
) {
  return text
    .split("\n")
    .map((line) =>
      normalizeLine(line, options),
    )
    .join("\n");
}

export function calculateDiffStatistics(
  original: string,
  modified: string,
  options: DiffOptions,
): DiffStatistics {
  const left = normalizeText(
    original,
    options,
  );

  const right = normalizeText(
    modified,
    options,
  );

  if (left === right) {
    return {
      additions: 0,
      deletions: 0,
      modifications: 0,
      unchanged: original.split("\n")
        .length,
      totalChanges: 0,
    };
  }

  const changes = diffLines(
    left,
    right,
  );

  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  let modifications = 0;

  for (
    let i = 0;
    i < changes.length;
    i++
  ) {
    const current = changes[i];
    const next = changes[i + 1];

    const count =
      current.count ?? 0;

    if (current.removed) {
      if (next?.added) {
        deletions += count;
      } else {
        deletions += count;
      }

      continue;
    }

    if (current.added) {
      if (next?.removed) {
        modifications += count;
      } else {
        additions += count;
      }

      continue;
    }

    unchanged += count;
  }

  return {
    additions,
    deletions,
    modifications,
    unchanged,
    totalChanges:
      additions +
      deletions +
      modifications,
  };
}