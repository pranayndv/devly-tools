"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  FileText,
  FlaskConical,
  Hash,
  Info,
  Link,
  Mail,
  Phone,
  Play,
  RotateCcw,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
   ========================================================= */

type RegexMatch = {
  index: number;
  text: string;
  groups: string[];
};

type Preset = {
  name: string;
  description: string;
  icon: React.ReactNode;
  pattern: string;
};

/* =========================================================
   PRESETS
   ========================================================= */

const PRESETS: Preset[] = [
  {
    name: "Email",
    description: "Find email addresses",
    icon: <Mail size={13} />,
    pattern: String.raw`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`,
  },

  {
    name: "Phone",
    description: "Find phone numbers",
    icon: <Phone size={13} />,
    pattern: String.raw`\+?[0-9]{10,15}`,
  },

  {
    name: "URL",
    description: "Find web addresses",
    icon: <Link size={13} />,
    pattern: String.raw`https?:\/\/[^\s]+`,
  },

  {
    name: "Number",
    description: "Find numbers",
    icon: <Hash size={13} />,
    pattern: String.raw`\d+`,
  },

  {
    name: "Username",
    description: "Letters, numbers and _",
    icon: <User size={13} />,
    pattern: String.raw`[a-zA-Z0-9_]+`,
  },
];

/* =========================================================
   BEGINNER BUILDING BLOCKS
   ========================================================= */

const BUILDING_BLOCKS = [
  {
    label: "Digit",
    value: String.raw`\d`,
    description: "Any number from 0 to 9",
  },

  {
    label: "Letter",
    value: "[a-zA-Z]",
    description: "Any English letter",
  },

  {
    label: "Word",
    value: String.raw`\w`,
    description: "Letter, number or underscore",
  },

  {
    label: "Space",
    value: String.raw`\s`,
    description: "A whitespace character",
  },

  {
    label: "Any",
    value: ".",
    description: "Almost any character",
  },

  {
    label: "Start",
    value: "^",
    description: "Start of the text",
  },

  {
    label: "End",
    value: "$",
    description: "End of the text",
  },

  {
    label: "One+",
    value: "+",
    description: "One or more times",
  },

  {
    label: "Zero+",
    value: "*",
    description: "Zero or more times",
  },

  {
    label: "Optional",
    value: "?",
    description: "Zero or one time",
  },
];

/* =========================================================
   DEFAULT VALUES
   ========================================================= */

const DEFAULT_PATTERN = String.raw`\d+`;

const DEFAULT_TEST_TEXT = `My order numbers are 12345, 67890 and 42.
Please contact us at support@example.com.
Another number is 987654.`;

/* =========================================================
   MONACO OPTIONS
   ========================================================= */

const editorOptions = {
  minimap: {
    enabled: false,
  },

  lineNumbers: "on" as const,

  lineNumbersMinChars: 3,

  glyphMargin: false,

  folding: true,

  wordWrap: "on" as const,

  scrollBeyondLastLine: false,

  automaticLayout: true,

  fontSize: 13,

  fontFamily:
    "'JetBrains Mono', Consolas, 'Courier New', monospace",

  fontLigatures: true,

  padding: {
    top: 12,
    bottom: 12,
  },

  scrollbar: {
    vertical: "auto" as const,
    horizontal: "hidden" as const,
    verticalScrollbarSize: 6,
  },

  overviewRulerLanes: 0,

  renderLineHighlight: "none" as const,

  tabSize: 2,

  formatOnPaste: false,

  formatOnType: false,
};

/* =========================================================
   MAIN
   ========================================================= */

export default function Home() {
  const [pattern, setPattern] =
    useState(DEFAULT_PATTERN);

  const [testText, setTestText] =
    useState(DEFAULT_TEST_TEXT);

  const [flags, setFlags] = useState("g");

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  /*
   * Used to force a fresh test when the user clicks Test.
   */
  const [testVersion, setTestVersion] = useState(0);

  /* =======================================================
     BUILD REGEX
     ======================================================= */

const regexResult = useMemo(() => {
  try {
    const regex = new RegExp(pattern, flags);

    const matches: RegexMatch[] = [];

    if (flags.includes("g")) {
      let match: RegExpExecArray | null;

      while ((match = regex.exec(testText)) !== null) {
        matches.push({
          index: match.index,
          text: match[0],
          groups: match.slice(1),
        });

        // Prevent infinite loop for empty matches
        if (match[0] === "") {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(testText);

      if (match) {
        matches.push({
          index: match.index,
          text: match[0],
          groups: match.slice(1),
        });
      }
    }

    return {
      valid: true,
      matches,
      error: "",
    };
  } catch (err) {
    return {
      valid: false,
      matches: [] as RegexMatch[],
      error:
        err instanceof Error
          ? err.message
          : "Invalid regular expression.",
    };
  }
}, [pattern, flags, testText]);

  /* =======================================================
     INSERT BUILDING BLOCK
     ======================================================= */

  const addBlock = (value: string) => {
    setPattern((current) => current + value);

    setError("");
  };

  /* =======================================================
     PRESET
     ======================================================= */

  const handlePreset  = (preset: Preset) => {
    setPattern(preset.pattern);

    setError("");

    setTestVersion((value) => value + 1);
  };

  /* =======================================================
     TEST
     ======================================================= */

  const handleTest = () => {
    try {
      new RegExp(pattern, flags);

      setError("");

      setTestVersion((value) => value + 1);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid regular expression.");
      }
    }
  };

  /* =======================================================
     COPY
     ======================================================= */

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `/${pattern}/${flags}`
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setError("Unable to copy regex.");
    }
  };

  /* =======================================================
     RESET
     ======================================================= */

  const handleReset = () => {
    setPattern(DEFAULT_PATTERN);

    setTestText(DEFAULT_TEST_TEXT);

    setFlags("g");

    setError("");

    setTestVersion((value) => value + 1);
  };


  /* =======================================================
     EXPLANATION
     ======================================================= */

  const explanation = getRegexExplanation(pattern);

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main
      className="
        h-dvh
        overflow-hidden
        bg-[#08090c]
        text-white
      "
    >
      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="
            absolute
            -left-40
            -top-40
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-600/[0.055]
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-20
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-500/[0.045]
            blur-[140px]
          "
        />
      </div>

      {/* =================================================
          CONTENT
          ================================================= */}

      <div
        className="
          relative
          mx-auto
          flex
          h-full
          max-w-[1500px]
          flex-col
          px-4
          py-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <header className="mb-3 shrink-0">
          <div className="flex items-end justify-between">
            <div>
              <h1
                className="
                  text-xl
                  font-bold
                  tracking-[-0.8px]
                  sm:text-xl
                "
              >
                <span className="text-white">
                  Regex
                </span>{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-violet-400
                    via-fuchsia-400
                    to-blue-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  Creator
                </span>{" "}
                <span className="text-neutral-500">
                  &
                </span>{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-blue-400
                    to-cyan-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  Tester
                </span>
              </h1>

            </div>

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-full
                border
                border-white/[0.07]
                bg-white/[0.02]
                px-3
                py-1.5
                text-[9px]
                text-neutral-500
                sm:flex
              "
            >
              <Zap size={10} />

              Beginner Friendly
            </div>
          </div>
        </header>

        {/* =================================================
            MAIN
            ================================================= */}

        <div
          className="
            grid
            min-h-0
            flex-1
            grid-cols-1
            gap-3
            xl:grid-cols-[280px_minmax(0,1fr)]
          "
        >
          {/* =================================================
              LEFT SIDEBAR
              ================================================= */}

          <aside
            className="
              hidden
              min-h-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#0d0f13]
              xl:flex
            "
          >
            {/* Sidebar header */}

            <div
              className="
                shrink-0
                border-b
                border-white/[0.06]
                px-3
                py-3
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-violet-400/10
                    text-violet-300
                  "
                >
                  <Sparkles size={14} />
                </div>

                <div>
                  <div className="text-[11px] font-semibold">
                    Quick Start
                  </div>

                  <div className="text-[9px] text-neutral-600">
                    Building blocks
                  </div>
                </div>
              </div>
            </div>

            {/* Building blocks */}

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <div className="mb-2 px-1 text-[9px] font-medium uppercase tracking-wider text-neutral-600">
                Common symbols
              </div>

              <div className="space-y-1">
                {BUILDING_BLOCKS.map(
                  (block) => (
                    <button
                      key={block.label}
                      onClick={() =>
                        addBlock(block.value)
                      }
                      title={block.description}
                      className="
                        group
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-transparent
                        px-2
                        py-2
                        text-left
                        transition
                        hover:border-white/[0.07]
                        hover:bg-white/[0.035]
                      "
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="
                            min-w-[42px]
                            rounded
                            bg-black/30
                            px-1.5
                            py-1
                            text-center
                            font-mono
                            text-[10px]
                            text-violet-300
                          "
                        >
                          {block.value}
                        </span>

                        <span className="text-[10px] text-neutral-400 group-hover:text-white">
                          {block.label}
                        </span>
                      </div>

                      <ChevronRight
                        size={11}
                        className="
                          text-neutral-700
                          group-hover:text-neutral-400
                        "
                      />
                    </button>
                  )
                )}
              </div>

              {/* Presets */}

              <div className="mb-2 mt-4 px-1 text-[9px] font-medium uppercase tracking-wider text-neutral-600">
                Ready-made patterns
              </div>

              <div className="space-y-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      handlePreset (preset)
                    }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-transparent
                      px-2
                      py-2
                      text-left
                      hover:border-white/[0.07]
                      hover:bg-white/[0.035]
                    "
                  >
                    <span className="text-neutral-600 group-hover:text-violet-400">
                      {preset.icon}
                    </span>

                    <div className="min-w-0">
                      <div className="text-[10px] text-neutral-400 group-hover:text-white">
                        {preset.name}
                      </div>

                      <div className="truncate text-[8px] text-neutral-700">
                        {preset.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* =================================================
              MAIN WORKSPACE
              ================================================= */}

          <section
            className="
              flex
              min-h-0
              flex-col
              gap-3
            "
          >
            {/* =================================================
                REGEX BUILDER
                ================================================= */}

            <div
              className="
                flex
                min-h-0
                flex-[0.8]
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0d0f13]
              "
            >
              {/* Header */}

              <div
                className="
                  flex
                  h-11
                  shrink-0
                  items-center
                  justify-between
                  border-b
                  border-white/[0.06]
                  bg-white/[0.015]
                  px-3
                "
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-lg
                      bg-violet-400/10
                      text-violet-300
                    "
                  >
                    <Code2 size={13} />
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold">
                      Regex Pattern
                    </div>

                    <div className="text-[9px] text-neutral-600">
                      Write or build your pattern
                    </div>
                  </div>
                </div>

                <div
                  className={`
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-2
                    py-1
                    text-[8px]
                    ${
                      regexResult.valid
                        ? "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300"
                        : "border-red-400/15 bg-red-400/[0.04] text-red-300"
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${
                        regexResult.valid
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }
                    `}
                  />

                  {regexResult.valid
                    ? "Valid"
                    : "Invalid"}
                </div>
              </div>

              {/* Pattern editor */}

              <div className="min-h-0 flex-1">
                <Editor
                  height="100%"
                  width="100%"
                  language="plaintext"
                  theme="json-premium"
                  value={pattern}
                  onChange={(value) => {
                    setPattern(value ?? "");
                    setError("");
                  }}
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme(
                      "json-premium",
                      {
                        base: "vs-dark",
                        inherit: true,

                        rules: [
                          {
                            token: "string",
                            foreground:
                              "A78BFA",
                          },
                        ],

                        colors: {
                          "editor.background":
                            "#0D0F13",

                          "editor.foreground":
                            "#CBD5E1",

                          "editorCursor.foreground":
                            "#A78BFA",

                          "editor.selectionBackground":
                            "#8B5CF630",

                          "editor.lineHighlightBackground":
                            "#FFFFFF03",

                          "editorLineNumber.foreground":
                            "#3F4450",

                          "editorLineNumber.activeForeground":
                            "#8B93A1",

                          "editorIndentGuide.background":
                            "#FFFFFF05",

                          "editorIndentGuide.activeBackground":
                            "#FFFFFF0A",

                          "editorBracketMatch.background":
                            "#8B5CF615",

                          "editorBracketMatch.border":
                            "#8B5CF635",

                          "editorGutter.background":
                            "#0D0F13",
                        },
                      }
                    );
                  }}
                  options={{
                    ...editorOptions,

                    lineNumbers: "off",

                    wordWrap: "off",

                    fontSize: 16,

                    padding: {
                      top: 18,
                      bottom: 18,
                    },
                  }}
                />
              </div>

              {/* Regex toolbar */}

              <div
                className="
                  flex
                  min-h-[42px]
                  shrink-0
                  flex-wrap
                  items-center
                  gap-1.5
                  border-t
                  border-white/[0.06]
                  bg-black/10
                  px-2
                  py-1.5
                "
              >
                <span className="mr-1 text-[9px] text-neutral-600">
                  Flags:
                </span>

                {[
                  {
                    flag: "g",
                    label: "Global",
                  },
                  {
                    flag: "i",
                    label: "Ignore case",
                  },
                  {
                    flag: "m",
                    label: "Multiline",
                  },
                  {
                    flag: "s",
                    label: "Dot all",
                  },
                ].map((item) => {
                  const active =
                    flags.includes(
                      item.flag
                    );

                  return (
                    <button
                      key={item.flag}
                      title={item.label}
                      onClick={() => {
                        setFlags((current) =>
                          active
                            ? current.replace(
                                item.flag,
                                ""
                              )
                            : current +
                              item.flag
                        );
                      }}
                      className={`
                        rounded-md
                        border
                        px-2
                        py-1
                        font-mono
                        text-[9px]
                        transition
                        ${
                          active
                            ? "border-violet-400/30 bg-violet-400/10 text-violet-300"
                            : "border-white/[0.06] bg-white/[0.02] text-neutral-600 hover:text-neutral-300"
                        }
                      `}
                    >
                      {item.flag}
                    </button>
                  );
                })}

                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={handleReset}
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-md
                      px-2
                      py-1
                      text-[9px]
                      text-neutral-600
                      hover:bg-white/[0.04]
                      hover:text-white
                    "
                  >
                    <RotateCcw size={11} />

                    Reset
                  </button>

                  <button
                    onClick={handleCopy}
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-md
                      border
                      border-white/[0.07]
                      bg-white/[0.025]
                      px-2.5
                      py-1
                      text-[9px]
                      text-neutral-400
                      hover:bg-white/[0.06]
                      hover:text-white
                    "
                  >
                    {copied ? (
                      <Check
                        size={11}
                        className="text-emerald-400"
                      />
                    ) : (
                      <Copy size={11} />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>

                  <button
                    onClick={handleTest}
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-md
                      bg-violet-500
                      px-3
                      py-1.5
                      text-[9px]
                      font-medium
                      text-white
                      shadow-[0_0_20px_rgba(139,92,246,.15)]
                      hover:bg-violet-400
                    "
                  >
                    <Play size={10} />

                    Test Regex
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                BOTTOM
                ================================================= */}

            <div
              className="
                grid
                min-h-0
                flex-1
                grid-cols-1
                gap-3
                lg:grid-cols-[minmax(0,1fr)_300px]
              "
            >
              {/* =================================================
                  TEST TEXT
                  ================================================= */}

              <div
                className="
                  flex
                  min-h-0
                  flex-col
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-[#0d0f13]
                "
              >
                {/* Header */}

                <div
                  className="
                    flex
                    h-11
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-white/[0.06]
                    px-3
                  "
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-400/10
                        text-blue-300
                      "
                    >
                      <FileText size={13} />
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold">
                        Test Text
                      </div>

                      <div className="text-[9px] text-neutral-600">
                        Enter text to test
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-white/[0.06]
                      px-2
                      py-1
                      text-[8px]
                      text-neutral-600
                    "
                  >
                    <FlaskConical size={10} />

                    {regexResult.matches.length}{" "}
                    match
                    {regexResult.matches.length !==
                    1
                      ? "es"
                      : ""}
                  </div>
                </div>

                {/* Test editor */}

                <div className="min-h-0 flex-1">
                  <Editor
                    height="100%"
                    width="100%"
                    language="plaintext"
                    theme="json-premium"
                    value={testText}
                    onChange={(value) => {
                      setTestText(value ?? "");
                    }}
                    options={{
                      ...editorOptions,

                      lineNumbers: "on",

                      fontSize: 12,
                    }}
                  />
                </div>

                {/* Result */}

                <div
                  className="
                    max-h-[95px]
                    shrink-0
                    overflow-auto
                    border-t
                    border-white/[0.06]
                    bg-black/10
                    px-3
                    py-2
                  "
                >
                  <div className="mb-1.5 flex items-center gap-1.5 text-[9px] text-neutral-600">
                    <Zap
                      size={10}
                      className="text-emerald-400"
                    />

                    Matches
                  </div>

                  {regexResult.matches.length >
                  0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {regexResult.matches.map(
                        (match, index) => (
                          <span
                            key={index}
                            className="
                              rounded-md
                              border
                              border-violet-400/15
                              bg-violet-400/[0.05]
                              px-2
                              py-1
                              font-mono
                              text-[9px]
                              text-violet-300
                            "
                          >
                            {match.text}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-neutral-700">
                      No matches found.
                    </span>
                  )}
                </div>
              </div>

              {/* =================================================
                  EXPLANATION
                  ================================================= */}

              <div
                className="
                  flex
                  min-h-0
                  flex-col
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-[#0d0f13]
                "
              >
                {/* Header */}

                <div
                  className="
                    flex
                    h-11
                    shrink-0
                    items-center
                    gap-2
                    border-b
                    border-white/[0.06]
                    px-3
                  "
                >
                  <div
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-lg
                      bg-amber-400/10
                      text-amber-300
                    "
                  >
                    <CircleHelp size={13} />
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold">
                      What does it mean?
                    </div>

                    <div className="text-[9px] text-neutral-600">
                      Simple explanation
                    </div>
                  </div>
                </div>

                {/* Explanation */}

                <div className="min-h-0 flex-1 overflow-auto p-3">
                  <div
                    className="
                      mb-3
                      rounded-xl
                      border
                      border-violet-400/10
                      bg-violet-400/[0.035]
                      p-3
                    "
                  >
                    <div className="mb-2 text-[9px] font-medium uppercase tracking-wider text-violet-400">
                      Your pattern
                    </div>

                    <code
                      className="
                        break-all
                        font-mono
                        text-[11px]
                        text-violet-200
                      "
                    >
                      /{pattern}/{flags}
                    </code>
                  </div>

                  <div className="space-y-2">
                    {explanation.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="
                            flex
                            gap-2
                            rounded-lg
                            border
                            border-white/[0.045]
                            bg-white/[0.015]
                            p-2.5
                          "
                        >
                          <span
                            className="
                              flex
                              h-5
                              w-5
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              bg-white/[0.04]
                              font-mono
                              text-[9px]
                              text-cyan-300
                            "
                          >
                            {item.symbol}
                          </span>

                          <div>
                            <div className="text-[10px] font-medium text-neutral-300">
                              {item.title}
                            </div>

                            <div className="mt-0.5 text-[9px] leading-relaxed text-neutral-600">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Result summary */}

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-emerald-400/10
                      bg-emerald-400/[0.025]
                      px-3
                      py-2.5
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Info
                        size={12}
                        className="text-emerald-400"
                      />

                      <span className="text-[9px] text-neutral-500">
                        Test result
                      </span>
                    </div>

                    <span className="text-[10px] font-medium text-emerald-300">
                      {regexResult.matches.length}{" "}
                      match
                      {regexResult.matches.length !==
                      1
                        ? "es"
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div
            className="
              mt-2
              flex
              shrink-0
              items-center
              justify-between
              rounded-lg
              border
              border-red-400/10
              bg-red-400/[0.04]
              px-3
              py-2
              text-[9px]
              text-red-300
            "
          >
            <div className="flex items-center gap-2">
              <X size={12} />

              {error}
            </div>

            <button
              onClick={() => setError("")}
              className="text-red-400/50 hover:text-red-300"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer
          className="
            flex
            h-7
            shrink-0
            items-center
            justify-between
            text-[8px]
            text-neutral-700
          "
        >
          <span>
            Regex Creator & Tester
          </span>

          <span>
            JavaScript Regular Expressions
          </span>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   REGEX EXPLANATION
   ========================================================= */

function getRegexExplanation(
  pattern: string
): {
  symbol: string;
  title: string;
  description: string;
}[] {
  const result: {
    symbol: string;
    title: string;
    description: string;
  }[] = [];

  if (pattern.includes("\\d")) {
    result.push({
      symbol: "\\d",
      title: "Digit",
      description:
        "Matches any number from 0 to 9.",
    });
  }

  if (pattern.includes("\\w")) {
    result.push({
      symbol: "\\w",
      title: "Word character",
      description:
        "Matches a letter, number, or underscore.",
    });
  }

  if (pattern.includes("\\s")) {
    result.push({
      symbol: "\\s",
      title: "Whitespace",
      description:
        "Matches a space, tab, or other whitespace character.",
    });
  }

  if (pattern.includes(".")) {
    result.push({
      symbol: ".",
      title: "Any character",
      description:
        "Matches almost any single character.",
    });
  }

  if (pattern.includes("+")) {
    result.push({
      symbol: "+",
      title: "One or more",
      description:
        "The previous item must appear at least once.",
    });
  }

  if (pattern.includes("*")) {
    result.push({
      symbol: "*",
      title: "Zero or more",
      description:
        "The previous item can appear zero or more times.",
    });
  }

  if (pattern.includes("?")) {
    result.push({
      symbol: "?",
      title: "Optional",
      description:
        "The previous item can appear zero or one time.",
    });
  }

  if (pattern.includes("^")) {
    result.push({
      symbol: "^",
      title: "Start",
      description:
        "Requires the match to start at the beginning of the text.",
    });
  }

  if (pattern.includes("$")) {
    result.push({
      symbol: "$",
      title: "End",
      description:
        "Requires the match to finish at the end of the text.",
    });
  }

  if (
    pattern.includes("[") &&
    pattern.includes("]")
  ) {
    result.push({
      symbol: "[]",
      title: "Character set",
      description:
        "Matches one character from the characters inside the brackets.",
    });
  }

  if (
    pattern.includes("(") &&
    pattern.includes(")")
  ) {
    result.push({
      symbol: "()",
      title: "Group",
      description:
        "Groups parts of the pattern together and can create a capture group.",
    });
  }

  if (result.length === 0) {
    result.push({
      symbol: ".*",
      title: "Start building",
      description:
        "Use the quick-start buttons to add common regex symbols.",
    });
  }

  return result;
}