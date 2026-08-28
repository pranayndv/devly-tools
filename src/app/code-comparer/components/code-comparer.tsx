"use client";

import {
  Check,
  ChevronDown,
  Copy,
  FileCode2,
  FileDiff,
  FolderOpen,
  RefreshCw,
  ScanSearch,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type * as Monaco from "monaco-editor";
import { detectLanguage, LANGUAGES } from "@/lib/languages";

type Side = "original" | "modified";
type ChangeType = "added" | "removed" | "modified";
type SonarSeverity = "error" | "warning" | "info";

type SonarSuggestion = {
  message: string;
  desc?: string;
  output?: string;
  range?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
};

type SonarIssue = {
  id: string;
  rule: string;
  message: string;
  severity: SonarSeverity;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  fixable: boolean;
  suggestions?: SonarSuggestion[];
};

type AnalysisResponse = {
  success: boolean;
  issues?: SonarIssue[];
  fixedCode?: string;
  error?: string;
};

function ChangeRow({
  type,
  label,
  value,
}: Readonly<{
  type: ChangeType;
  label: string;
  value: number;
}>) {
  const styles = {
    added: {
      dot: "bg-emerald-400",
      text: "text-emerald-400",
    },
    removed: {
      dot: "bg-red-400",
      text: "text-red-400",
    },
    modified: {
      dot: "bg-amber-400",
      text: "text-amber-400",
    },
  }[type];

  return (
    <div className="flex h-7 items-center gap-1.5 rounded-md border border-[#25282e] bg-[#111318] px-2.5">
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      <span className="text-[9px] text-zinc-500">{label}</span>
      <span className={`min-w-4.5 text-center text-[10px] font-semibold ${styles.text}`}>
        {value}
      </span>
    </div>
  );
}

function getStatistics(
  original: string,
  modified: string,
  ignoreWhitespace: boolean,
) {
  const oldLines = original.replaceAll("\r\n", "\n").split("\n");
  const newLines = modified.replaceAll("\r\n", "\n").split("\n");

  const normalize = (line: string) =>
    ignoreWhitespace ? line.replace(/\s+/g, "") : line;

  const old = oldLines.map(normalize);
  const next = newLines.map(normalize);

  const n = old.length;
  const m = next.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] =
        old[i] === next[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  let additions = 0;
  let deletions = 0;

  while (i < n && j < m) {
    if (old[i] === next[j]) {
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      deletions += 1;
      i += 1;
    } else {
      additions += 1;
      j += 1;
    }
  }

  deletions += n - i;
  additions += m - j;

  const modifications = Math.min(additions, deletions);

  return {
    additions: additions - modifications,
    deletions: deletions - modifications,
    modifications,
  };
}

function severityClass(severity: SonarSeverity) {
  if (severity === "error") return "bg-red-400";
  if (severity === "warning") return "bg-amber-400";
  return "bg-blue-400";
}

export default function CodeComparer() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [language, setLanguage] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied] = useState<Side | null>(null);
  const [activeSide, setActiveSide] = useState<Side>("modified");

  const [sonarOpen, setSonarOpen] = useState(false);
  const [sonarSide, setSonarSide] = useState<Side>("modified");
  const [sonarIssues, setSonarIssues] = useState<SonarIssue[]>([]);
  const [sonarAnalyzing, setSonarAnalyzing] = useState(false);
  const [sonarError, setSonarError] = useState<string | null>(null);

  const diffEditorRef =
    useRef<Monaco.editor.IStandaloneDiffEditor | null>(null);
  const originalEditorRef =
    useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const modifiedEditorRef =
    useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const originalFileInput = useRef<HTMLInputElement | null>(null);
  const modifiedFileInput = useRef<HTMLInputElement | null>(null);
  const listenersRef = useRef<Monaco.IDisposable[]>([]);
  const syncLockRef = useRef(false);
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statistics = useMemo(
    () => getStatistics(original, modified, ignoreWhitespace),
    [original, modified, ignoreWhitespace],
  );

  const sonarCount = sonarIssues.length;
  const sonarErrors = sonarIssues.filter((item) => item.severity === "error").length;
  const sonarWarnings = sonarIssues.filter((item) => item.severity === "warning").length;

  useEffect(() => {
    return () => {
      listenersRef.current.forEach((listener) => listener.dispose());
      listenersRef.current = [];

      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  function clearSonarMarkers(
    editor: Monaco.editor.IStandaloneCodeEditor | null,
  ) {
    const monaco = (globalThis as typeof globalThis & {
      __devlyMonaco?: typeof Monaco;
    }).__devlyMonaco;

    const model = editor?.getModel();

    if (!monaco || !model) return;

    monaco.editor.setModelMarkers(model, "devly-sonar", []);
  }

  function applySonarMarkers(
    editor: Monaco.editor.IStandaloneCodeEditor,
    issues: SonarIssue[],
    monaco: typeof Monaco,
  ) {
    const model = editor.getModel();

    if (!model) return;

    monaco.editor.setModelMarkers(
      model,
      "devly-sonar",
      issues.map((issue) => ({
        startLineNumber: issue.startLineNumber,
        startColumn: issue.startColumn,
        endLineNumber: issue.endLineNumber,
        endColumn: issue.endColumn,
        message: `${issue.message}\n\nRule: ${issue.rule}`,
        severity:
          issue.severity === "error"
            ? monaco.MarkerSeverity.Error
            : issue.severity === "warning"
              ? monaco.MarkerSeverity.Warning
              : monaco.MarkerSeverity.Info,
        code: issue.rule,
        source: "SonarJS / ESLint",
      })),
    );
  }

  async function analyzeCode(
    code: string,
    currentLanguage: string,
    fix = false,
  ): Promise<AnalysisResponse> {
    const response = await fetch(process.env.NEXT_PUBLIC_APP_URL+"/api/code-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        language: currentLanguage,
        fix,
      }),
    });

    const data = (await response.json()) as AnalysisResponse;

    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Code analysis failed.");
    }

    return data;
  }

  async function analyzeEditor(
    side: Side,
    fix = false,
  ) {
    const editor =
      side === "original"
        ? originalEditorRef.current
        : modifiedEditorRef.current;

    if (!editor) return;

    const model = editor.getModel();

    if (!model) return;

    const monaco = (globalThis as typeof globalThis & {
      __devlyMonaco?: typeof Monaco;
    }).__devlyMonaco;

    if (!monaco) return;

    setSonarAnalyzing(true);
    setSonarSide(side);
    setSonarOpen(true);
    setSonarError(null);

    try {
      const result = await analyzeCode(
        model.getValue(),
        language,
        fix,
      );

      const issues = result.issues ?? [];

      if (fix && result.fixedCode !== undefined) {
        const currentCode = model.getValue();

        if (result.fixedCode !== currentCode) {
          syncLockRef.current = true;
          model.setValue(result.fixedCode);

          if (side === "original") {
            setOriginal(result.fixedCode);
          } else {
            setModified(result.fixedCode);
          }

          window.setTimeout(() => {
            syncLockRef.current = false;
          }, 0);
        }
      }

      setSonarIssues(issues);
      applySonarMarkers(editor, issues, monaco);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Code analysis failed.";

      setSonarError(message);
      setSonarIssues([]);
      clearSonarMarkers(editor);
    } finally {
      setSonarAnalyzing(false);
    }
  }

  function scheduleAnalysis(side: Side) {
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
    }

    analysisTimerRef.current = setTimeout(() => {
      void analyzeEditor(side);
    }, 800);
  }

const handleEditorMount: DiffOnMount = (editor) => {
    diffEditorRef.current = editor;

    const originalEditor = editor.getOriginalEditor();
    const modifiedEditor = editor.getModifiedEditor();
    

    originalEditorRef.current = originalEditor;
    modifiedEditorRef.current = modifiedEditor;

    originalEditor.updateOptions({ readOnly: false });
    modifiedEditor.updateOptions({ readOnly: false });

    const originalModel = originalEditor.getModel();
    const modifiedModel = modifiedEditor.getModel();

    if (originalModel) {
      listenersRef.current.push(
        originalModel.onDidChangeContent(() => {
          if (syncLockRef.current) return;

          const value = originalModel.getValue();
          setOriginal(value);
          clearSonarMarkers(originalEditor);
          setSonarIssues([]);
          scheduleAnalysis("original");
        }),
      );
    }

    if (modifiedModel) {
      listenersRef.current.push(
        modifiedModel.onDidChangeContent(() => {
          if (syncLockRef.current) return;

          const value = modifiedModel.getValue();
          setModified(value);
          clearSonarMarkers(modifiedEditor);
          setSonarIssues([]);
          scheduleAnalysis("modified");
        }),
      );
    }

    listenersRef.current.push(
      originalEditor.onDidFocusEditorText(() => {
        setActiveSide("original");
      }),
      modifiedEditor.onDidFocusEditorText(() => {
        setActiveSide("modified");
      }),
    );
  };

  async function handleCopy(side: Side) {
    const value = side === "original" ? original : modified;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(side);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  }

  function handleSwap() {
    const originalModel = originalEditorRef.current?.getModel();
    const modifiedModel = modifiedEditorRef.current?.getModel();

    const currentOriginal = originalModel?.getValue() ?? original;
    const currentModified = modifiedModel?.getValue() ?? modified;

    syncLockRef.current = true;

    if (originalModel && modifiedModel) {
      originalModel.setValue(currentModified);
      modifiedModel.setValue(currentOriginal);
    }

    setOriginal(currentModified);
    setModified(currentOriginal);
    setActiveSide("modified");
    setSonarIssues([]);

    if (originalEditorRef.current) {
      clearSonarMarkers(originalEditorRef.current);
    }

    if (modifiedEditorRef.current) {
      clearSonarMarkers(modifiedEditorRef.current);
    }

    window.setTimeout(() => {
      syncLockRef.current = false;
    }, 0);
  }

  function handleClear() {
    syncLockRef.current = true;

    originalEditorRef.current?.getModel()?.setValue("");
    modifiedEditorRef.current?.getModel()?.setValue("");

    setOriginal("");
    setModified("");
    setSonarIssues([]);
    setSonarError(null);

    clearSonarMarkers(originalEditorRef.current);
    clearSonarMarkers(modifiedEditorRef.current);

    window.setTimeout(() => {
      syncLockRef.current = false;
    }, 0);
  }

  function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
    side: Side,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const content =
        typeof reader.result === "string"
          ? reader.result
          : "";

      syncLockRef.current = true;

      if (side === "original") {
        originalEditorRef.current
          ?.getModel()
          ?.setValue(content);

        setOriginal(content);
      } else {
        modifiedEditorRef.current
          ?.getModel()
          ?.setValue(content);

        setModified(content);
      }

      setLanguage(detectLanguage(file.name));
      setActiveSide(side);
      setSonarIssues([]);
      setSonarError(null);

      clearSonarMarkers(
        side === "original"
          ? originalEditorRef.current
          : modifiedEditorRef.current,
      );

      window.setTimeout(() => {
        syncLockRef.current = false;
        void analyzeEditor(side);
      }, 0);
    };

    reader.readAsText(file);
  }

  function handleSonarClick() {
    const side = activeSide;
    setSonarSide(side);
    setSonarOpen(true);
    void analyzeEditor(side);
  }

  function handleIssueClick(issue: SonarIssue) {
    const editor =
      sonarSide === "original"
        ? originalEditorRef.current
        : modifiedEditorRef.current;

    if (!editor) return;

    editor.revealLineInCenter(issue.startLineNumber);
    editor.setPosition({
      lineNumber: issue.startLineNumber,
      column: issue.startColumn,
    });
    editor.focus();
  }

  async function handleFixIssue(
    issue: SonarIssue,
  ) {
    const suggestion = issue.suggestions?.[0];

    if (!suggestion?.range || suggestion.output === undefined) {
      await analyzeEditor(sonarSide, true);
      return;
    }

    const editor =
      sonarSide === "original"
        ? originalEditorRef.current
        : modifiedEditorRef.current;

    if (!editor) return;

    const model = editor.getModel();

    if (!model) return;

    syncLockRef.current = true;

    model.pushEditOperations(
      [],
      [
        {
          range: suggestion.range,
          text: suggestion.output,
        },
      ],
      () => null,
    );

    const value = model.getValue();

    if (sonarSide === "original") {
      setOriginal(value);
    } else {
      setModified(value);
    }

    window.setTimeout(() => {
      syncLockRef.current = false;
      void analyzeEditor(sonarSide);
    }, 0);
  }

  const editorOptions: Monaco.editor.IStandaloneDiffEditorConstructionOptions = {
    readOnly: false,
    originalEditable: true,

    renderSideBySide: true,
    renderIndicators: true,
    renderOverviewRuler: true,
    renderMarginRevertIcon: false,
    enableSplitViewResizing: true,

    ignoreTrimWhitespace: ignoreWhitespace,

    automaticLayout: true,

    minimap: {
      enabled: false,
    },

    fontSize: 13,
    lineHeight: 21,
    fontFamily:
      "'JetBrains Mono', Consolas, 'Courier New', monospace",

    padding: {
      top: 12,
      bottom: 12,
    },

    scrollBeyondLastLine: false,
    wordWrap: "off",
    smoothScrolling: true,

    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",

    bracketPairColorization: {
      enabled: true,
    },

    renderWhitespace: "selection",

    folding: true,
    foldingHighlight: true,
    showFoldingControls: "mouseover",

    lineNumbers: "on",
    lineNumbersMinChars: 3,

    contextmenu: true,
    glyphMargin: true,
    links: true,
    mouseWheelZoom: true,

    stickyScroll: {
      enabled: false,
    },

    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      useShadows: false,
    },

    guides: {
      indentation: true,
      bracketPairs: true,
    },

    renderValidationDecorations: "off",
  };

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-[#08090b] text-zinc-100">
      <header className="relative z-20 flex h-15 shrink-0 items-center justify-between border-b border-[#24272d] bg-[#0c0e11] px-4">
        <div className="flex min-w-0 items-center gap-3">

                    <h1 className="text-xl font-bold tracking-tight">
            <span className="text-white">
              CODE
            </span>{" "}
            <span
              className="
                bg-gradient-to-r
                from-violet-400
                via-fuchsia-400
                to-cyan-400
                bg-clip-text
                text-transparent
              "
            >
              Camparer
            </span>
          </h1>
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 lg:flex">
          <ChangeRow
            type="added"
            label="Additions"
            value={statistics.additions}
          />

          <ChangeRow
            type="removed"
            label="Deletions"
            value={statistics.deletions}
          />

          <ChangeRow
            type="modified"
            label="Modified"
            value={statistics.modifications}
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleSonarClick}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2 text-[10px] transition ${
              sonarOpen
                ? "bg-violet-500/10 text-violet-300"
                : "text-zinc-500 hover:bg-[#171a1f] hover:text-zinc-200"
            }`}
            title="Analyze active editor with SonarJS / ESLint"
          >
            <ScanSearch size={14} />
            <span className="hidden md:block">
              Sonar
            </span>

            {sonarCount > 0 && (
              <span className="rounded-full bg-violet-500/15 px-1.5 text-[8px] text-violet-300">
                {sonarCount}
              </span>
            )}
          </button>

          <div className="relative mr-1">
            <select
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
                setSonarIssues([]);
              }}
              className="h-8 max-w-31.25 appearance-none rounded-lg border border-[#282c32] bg-[#111419] pl-3 pr-8 text-[10px] text-zinc-400 outline-none transition hover:border-[#383d46] focus:border-violet-500/40"
            >
              {LANGUAGES.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  className="bg-[#111419]"
                >
                  {item.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setSettingsOpen((value) => !value)
            }
            className={`grid h-8 w-8 place-items-center rounded-lg transition ${
              settingsOpen
                ? "bg-[#191c22] text-zinc-100"
                : "text-zinc-500 hover:bg-[#171a1f] hover:text-zinc-200"
            }`}
            title="Comparison settings"
          >
            <Settings2 size={15} />
          </button>

          <button
            type="button"
            onClick={handleSwap}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[10px] text-zinc-500 transition hover:bg-[#171a1f] hover:text-zinc-200"
            title="Swap current code"
          >
            <RefreshCw size={14} />
            <span className="hidden md:block">
              Swap
            </span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[10px] text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
            title="Clear both editors"
          >
            <Trash2 size={14} />
            <span className="hidden md:block">
              Clear
            </span>
          </button>
        </div>
      </header>

      {settingsOpen && (
        <>
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />

          <div className="absolute right-4 top-17 z-40 w-64 rounded-xl border border-[#2a2e35] bg-[#111318] p-2 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                Comparison
              </span>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-zinc-600 transition hover:text-zinc-300"
              >
                <X size={13} />
              </button>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-[10px] text-zinc-400 transition hover:bg-[#191c21]">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(event) =>
                  setIgnoreWhitespace(event.target.checked)
                }
                className="accent-violet-500"
              />
              Ignore whitespace
            </label>

            <div className="mt-1 rounded-lg border border-[#202329] bg-[#0d0f13] px-2.5 py-2 text-[9px] leading-4 text-zinc-600">
              SonarJS / ESLint analysis is enabled for JavaScript and TypeScript.
            </div>
          </div>
        </>
      )}

      <section className="min-h-0 flex-1 p-2 sm:p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#282c32] bg-[#0c0e11] shadow-2xl shadow-black/20">
          <div className="grid h-11 shrink-0 grid-cols-2 border-b border-[#282c32] bg-[#101216]">
            <div
              className={`flex min-w-0 items-center justify-between border-r border-[#282c32] px-2.5 sm:px-3 ${
                activeSide === "original"
                  ? "bg-blue-400/2.5"
                  : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />

                <span className="truncate text-[11px] font-semibold text-zinc-300">
                  Original
                </span>

                <span className="hidden rounded-md border border-blue-400/10 bg-blue-400/5 px-1.5 py-0.5 text-[8px] text-blue-300/60 sm:inline">
                  Editable
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() =>
                    originalFileInput.current?.click()
                  }
                  className="grid h-7 w-7 place-items-center rounded-md text-zinc-600 transition hover:bg-[#1a1d22] hover:text-zinc-200"
                  title="Open original file"
                >
                  <FolderOpen size={14} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy("original")
                  }
                  className="grid h-7 w-7 place-items-center rounded-md text-zinc-600 transition hover:bg-[#1a1d22] hover:text-zinc-200"
                  title="Copy original"
                >
                  {copied === "original" ? (
                    <Check
                      size={14}
                      className="text-emerald-400"
                    />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>

                <input
                  ref={originalFileInput}
                  type="file"
                  hidden
                  onChange={(event) =>
                    handleFileSelected(
                      event,
                      "original",
                    )
                  }
                />
              </div>
            </div>

            <div
              className={`flex min-w-0 items-center justify-between px-2.5 sm:px-3 ${
                activeSide === "modified"
                  ? "bg-emerald-400/2.5"
                  : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />

                <span className="truncate text-[11px] font-semibold text-zinc-300">
                  Modified
                </span>

                <span className="hidden rounded-md border border-emerald-400/10 bg-emerald-400/5 px-1.5 py-0.5 text-[8px] text-emerald-300/60 sm:inline">
                  Editable
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() =>
                    modifiedFileInput.current?.click()
                  }
                  className="grid h-7 w-7 place-items-center rounded-md text-zinc-600 transition hover:bg-[#1a1d22] hover:text-zinc-200"
                  title="Open modified file"
                >
                  <FolderOpen size={14} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy("modified")
                  }
                  className="grid h-7 w-7 place-items-center rounded-md text-zinc-600 transition hover:bg-[#1a1d22] hover:text-zinc-200"
                  title="Copy modified"
                >
                  {copied === "modified" ? (
                    <Check
                      size={14}
                      className="text-emerald-400"
                    />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>

                <input
                  ref={modifiedFileInput}
                  type="file"
                  hidden
                  onChange={(event) =>
                    handleFileSelected(
                      event,
                      "modified",
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <DiffEditor
              original={original}
              modified={modified}
              language={language}
              theme="code-premium"
                                            beforeMount={(monaco) => {
                  monaco.editor.defineTheme("code-premium", {
                    base: "vs-dark",
                    inherit: true,

                    rules: [
                      {
                        token: "jwt-header",
                        foreground: "FF6B81",
                      },
                      {
                        token: "jwt-payload",
                        foreground: "A78BFA",
                      },
                      {
                        token: "jwt-signature",
                        foreground: "34D399",
                      },
                      {
                        token: "jwt-dot",
                        foreground: "64748B",
                      },
                    ],

                    colors: {
                      "editor.background": "#08080A",
                      "editor.foreground": "#CBD5E1",
                      "editorCursor.foreground": "#FFFFFF",
                      "editor.selectionBackground": "#FFFFFF12",
                      "editor.lineHighlightBackground": "#FFFFFF03",
                      "editorLineNumber.foreground": "#3F3F46",
                      "editorIndentGuide.background": "#FFFFFF05",
                      "editorIndentGuide.activeBackground": "#FFFFFF08",
                    },
                  });
}}
              onMount={handleEditorMount}
              options={editorOptions}
              loading={
                <div className="flex h-full items-center justify-center bg-[#0c0e11] text-[10px] text-zinc-600">
                  Loading editor...
                </div>
              }
            />
          </div>

          {sonarOpen && (
            <aside className="max-h-64 shrink-0 overflow-hidden border-t border-[#282c32] bg-[#0d0f13]">
              <div className="flex h-9 items-center justify-between border-b border-[#202329] px-3">
                <div className="flex items-center gap-2">
                  <ScanSearch
                    size={13}
                    className="text-violet-400"
                  />

                  <span className="text-[10px] font-semibold text-zinc-300">
                    SonarJS / ESLint
                  </span>

                  <span className="text-[8px] text-zinc-600">
                    {sonarSide}
                  </span>

                  {sonarErrors > 0 && (
                    <span className="rounded bg-red-400/10 px-1.5 py-0.5 text-[8px] text-red-300">
                      {sonarErrors} errors
                    </span>
                  )}

                  {sonarWarnings > 0 && (
                    <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[8px] text-amber-300">
                      {sonarWarnings} warnings
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      void analyzeEditor(sonarSide)
                    }
                    disabled={sonarAnalyzing}
                    className="grid h-6 w-6 place-items-center rounded-md text-zinc-600 transition hover:bg-[#191c21] hover:text-zinc-300 disabled:opacity-30"
                    title="Run analysis again"
                  >
                    <RefreshCw
                      size={11}
                      className={
                        sonarAnalyzing
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSonarOpen(false)
                    }
                    className="grid h-6 w-6 place-items-center rounded-md text-zinc-600 transition hover:bg-[#191c21] hover:text-zinc-300"
                    title="Close Sonar panel"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div className="max-h-55 overflow-y-auto">
                {sonarError && (
                  <div className="border-b border-red-500/10 bg-red-500/5 px-3 py-2 text-[9px] text-red-300">
                    {sonarError}
                  </div>
                )}

                {sonarAnalyzing && (
                  <div className="flex items-center gap-2 px-3 py-3 text-[9px] text-zinc-600">
                    <RefreshCw
                      size={11}
                      className="animate-spin"
                    />
                    Analyzing code...
                  </div>
                )}

                {!sonarAnalyzing &&
                  !sonarError &&
                  sonarIssues.length === 0 && (
                    <div className="flex items-center gap-2 px-3 py-4 text-[9px] text-emerald-400/70">
                      <Check size={12} />
                      No SonarJS / ESLint issues found.
                    </div>
                  )}

                {sonarIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border-b border-[#181b20]"
                  >
                    <div className="flex items-start gap-2 px-3 py-2">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${severityClass(
                          issue.severity,
                        )}`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleIssueClick(issue)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-[9px] leading-4 text-zinc-300">
                          {issue.message}
                        </span>

                        <span className="mt-0.5 block text-[8px] text-zinc-600">
                          {issue.rule}
                          {" · Line "}
                          {issue.startLineNumber}
                          {":"}
                          {issue.startColumn}
                        </span>
                      </button>

                      {(issue.fixable ||
                        issue.suggestions?.length) && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleFixIssue(
                              issue,
                            )
                          }
                          className="shrink-0 rounded-md bg-violet-500/10 px-2 py-1 text-[8px] text-violet-300 transition hover:bg-violet-500/20"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          <div className="flex h-7 shrink-0 items-center justify-between border-t border-[#24272d] bg-[#0b0d10] px-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex shrink-0 items-center gap-1.5 text-[8px] text-zinc-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Both editable
              </span>

              <span className="hidden truncate text-[8px] text-zinc-700 sm:block">
                Changes update automatically
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-[8px] text-zinc-700">
              <FileCode2 size={11} />
              <span>{language}</span>
              <span>•</span>
              <span>
                {original.split("\n").length} /{" "}
                {modified.split("\n").length} lines
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}