export interface LanguageOption {
  id: string;
  label: string;
  extensions: string[];
}

export const LANGUAGES: LanguageOption[] = [
  {
    id: "plaintext",
    label: "Plain Text",
    extensions: [".txt"],
  },
  {
    id: "javascript",
    label: "JavaScript",
    extensions: [".js", ".mjs", ".cjs"],
  },
  {
    id: "typescript",
    label: "TypeScript",
    extensions: [".ts"],
  },
  {
    id: "javascriptreact",
    label: "JavaScript React",
    extensions: [".jsx"],
  },
  {
    id: "typescriptreact",
    label: "TypeScript React",
    extensions: [".tsx"],
  },
  {
    id: "json",
    label: "JSON",
    extensions: [".json"],
  },
  {
    id: "html",
    label: "HTML",
    extensions: [".html", ".htm"],
  },
  {
    id: "css",
    label: "CSS",
    extensions: [".css"],
  },
  {
    id: "scss",
    label: "SCSS",
    extensions: [".scss"],
  },
  {
    id: "python",
    label: "Python",
    extensions: [".py"],
  },
  {
    id: "java",
    label: "Java",
    extensions: [".java"],
  },
  {
    id: "c",
    label: "C",
    extensions: [".c"],
  },
  {
    id: "cpp",
    label: "C++",
    extensions: [
      ".cpp",
      ".cc",
      ".cxx",
      ".hpp",
      ".h",
    ],
  },
  {
    id: "csharp",
    label: "C#",
    extensions: [".cs"],
  },
  {
    id: "go",
    label: "Go",
    extensions: [".go"],
  },
  {
    id: "rust",
    label: "Rust",
    extensions: [".rs"],
  },
  {
    id: "php",
    label: "PHP",
    extensions: [".php"],
  },
  {
    id: "ruby",
    label: "Ruby",
    extensions: [".rb"],
  },
  {
    id: "sql",
    label: "SQL",
    extensions: [".sql"],
  },
  {
    id: "yaml",
    label: "YAML",
    extensions: [".yml", ".yaml"],
  },
  {
    id: "xml",
    label: "XML",
    extensions: [".xml"],
  },
  {
    id: "shell",
    label: "Shell",
    extensions: [".sh", ".bash"],
  },
];

export function detectLanguage(
  filename: string,
): string {
  const lower =
    filename.toLowerCase();

  const language =
    LANGUAGES.find((item) =>
      item.extensions.some(
        (extension) =>
          lower.endsWith(extension),
      ),
    );

  return (
    language?.id ??
    "plaintext"
  );
}