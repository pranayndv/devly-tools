"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Check,
  Code2,
  Copy,
  FileJson,
  Sparkles,
  Trash2,
  WandSparkles,
  XCircle,
} from "lucide-react";

const DEFAULT_JSON = `{
  "name": "drew",
  "age": 25,
  "email": "drew@example.com",
  "active": true,
  "address": {
    "city": "goa",
    "country": "India"
  },
  "skills": [
    "React",
    "Next.js",
    "Node.js"
  ]
}`;

function cleanJsonValues(value: unknown): unknown {
  // Array
  if (Array.isArray(value)) {
    return value.map((item) =>
      cleanJsonValues(item)
    );
  }

  // Object
  if (
    value !== null &&
    typeof value === "object"
  ) {
    const cleaned: Record<string, unknown> = {};

    for (const [key, childValue] of Object.entries(
      value
    )) {
      cleaned[key] =
        cleanJsonValues(childValue);
    }

    return cleaned;
  }

  // String
  if (typeof value === "string") {
    return "";
  }

  // Number
  if (typeof value === "number") {
    return 0;
  }

  // Boolean
  if (typeof value === "boolean") {
    return false;
  }

  // null
  if (value === null) {
    return null;
  }

  return value;
}

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

  padding: {
    top: 14,
    bottom: 14,
  },

  scrollbar: {
    vertical: "auto" as const,
    horizontal: "hidden" as const,
    verticalScrollbarSize: 6,
  },

  overviewRulerLanes: 0,

  tabSize: 2,

  renderLineHighlight: "none" as const,

  formatOnPaste: false,

  formatOnType: false,
};

export default function Home() {
  /*
   * INPUT EDITOR STATE
   */
  const [jsonValue, setJsonValue] = useState(DEFAULT_JSON);

  /*
   * OUTPUT EDITOR STATE
   */
  const [cleanedJson, setCleanedJson] = useState("");

  /*
   * ERROR
   */
  const [error, setError] = useState("");

  /*
   * COPY STATUS
   */
  const [copied, setCopied] = useState(false);

  /* =====================================================
     CLEAN VALUES
     ===================================================== */

  const handleClean = () => {
    if (!jsonValue.trim()) {
      setError("JSON input is empty.");
      setCleanedJson("");
      return;
    }

    try {
      const parsed = JSON.parse(jsonValue);

      const cleaned = cleanJsonValues(parsed);

      const output = JSON.stringify(cleaned, null, 2);

      setCleanedJson(output);
      setError("");
      setCopied(false);
    } catch (err) {
      console.error(err);

      setError(
        "Invalid JSON. Please check your JSON syntax."
      );

      setCleanedJson("");
    }
  };

  /* =====================================================
     FORMAT
     ===================================================== */

  const handleFormat = () => {
    if (!jsonValue.trim()) {
      setError("JSON input is empty.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonValue);

      const formatted = JSON.stringify(
        parsed,
        null,
        2
      );

      setJsonValue(formatted);

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        "Invalid JSON. Cannot format the input."
      );
    }
  };

  /* =====================================================
     COPY
     ===================================================== */

  const handleCopy = async () => {
    if (!cleanedJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        cleanedJson
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error(err);

      setError("Failed to copy JSON.");
    }
  };

  /* =====================================================
     CLEAR
     ===================================================== */

  const handleClear = () => {
    setJsonValue("");

    setCleanedJson("");

    setError("");

    setCopied(false);
  };


  return (
    <main className="h-dvh overflow-hidden bg-[#07070a] text-white">
      {/* Background */}

           {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[110px]" />

        <div className="absolute right-[-120px] top-[10%] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div
          className="
            absolute inset-0
            opacity-[0.025]
            [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)]
            [background-size:40px_40px]
          "
        />
      </div>

      <div
        className="
          relative
          mx-auto
          flex
          h-full
          max-w-[1450px]
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

          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-white">
              JSON
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
              Cleaner
            </span>
          </h1>
        </header>



        {/* =================================================
            EDITOR AREA
            ================================================= */}

        <div
          className="
            grid
            min-h-0
            flex-1
            grid-cols-1
            gap-3
            xl:grid-cols-2
          "
        >
          {/* =================================================
              INPUT
              ================================================= */}

          <div
            className="
              flex
              min-h-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#08080a]
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
                border-white/[0.07]
                bg-white/[0.025]
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
                    bg-cyan-400/10
                    text-cyan-300
                  "
                >
                  <FileJson size={13} />
                </div>

                <div>
                  <div className="text-[11px] font-semibold">
                    Input JSON
                  </div>

                  <div className="text-[9px] text-neutral-600">
                    Editable
                  </div>
                </div>
              </div>

              <span
                className="
                  rounded-full
                  border
                  border-white/[0.07]
                  px-2
                  py-1
                  text-[8px]
                  text-neutral-600
                "
              >
                INPUT
              </span>
            </div>

            {/* IMPORTANT:
                This container must have flex-1 + min-h-0
            */}

            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                width="100%"
                language="json"
                theme="json-premium"
                value={jsonValue}
                onChange={(value) => {
                  setJsonValue(value ?? "");

                  if (error) {
                    setError("");
                  }
                }}
              beforeMount={(monaco) => {
                  monaco.editor.defineTheme("json-premium", {
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
                options={{
                  ...editorOptions,

                  /*
                   * VERY IMPORTANT
                   *
                   * Do not set readOnly here.
                   */

                  readOnly: false,

                  domReadOnly: false,

                  readOnlyMessage: {
                    value: "",
                  },
                }}
              />
            </div>

            {/* Footer */}

            <div
              className="
                flex
                h-9
                shrink-0
                items-center
                justify-between
                border-t
                border-white/[0.06]
                px-3
                text-[9px]
              "
            >
              <span className="text-neutral-600">
                JSON
              </span>

              <span className="text-neutral-700">
                {jsonValue.length} chars
              </span>
            </div>
          </div>

          {/* =================================================
              OUTPUT
              ================================================= */}

          <div
            className="
              flex
              min-h-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#08080a]
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
                border-white/[0.07]
                bg-white/[0.025]
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
                    bg-violet-400/10
                    text-violet-300
                  "
                >
                  <WandSparkles size={13} />
                </div>

                <div>
                  <div className="text-[11px] font-semibold">
                    Clean JSON
                  </div>

                  <div className="text-[9px] text-neutral-600">
                    Generated output
                  </div>
                </div>
              </div>

              <span
                className="
                  rounded-full
                  border
                  border-white/[0.07]
                  px-2
                  py-1
                  text-[8px]
                  text-neutral-600
                "
              >
                OUTPUT
              </span>
            </div>

            {/* Output editor */}

            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                width="100%"
                language="json"
                theme="json-premium"
                value={cleanedJson}
                              beforeMount={(monaco) => {
                  monaco.editor.defineTheme("json-premium", {
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
                options={{
                  ...editorOptions,

                  /*
                   * Output is read-only.
                   */
                  readOnly: true,

                  domReadOnly: true,
                }}
              />
            </div>

            {/* Buttons */}

            <div
              className="
                flex
                h-12
                shrink-0
                gap-2
                border-t
                border-white/[0.06]
                p-1.5
              "
            >
              {/* CLEAN */}

              <button
                onClick={handleClean}
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-violet-400/20
                  bg-gradient-to-r
                  from-violet-500/10
                  to-cyan-500/10
                  text-[10px]
                  font-medium
                  text-violet-200
                  transition
                  hover:border-violet-400/40
                  hover:from-violet-500/20
                  hover:to-cyan-500/20
                  hover:text-white
                "
              >
                <WandSparkles
                  size={13}
                  className="text-violet-400"
                />

                Clean Values
              </button>

              {/* FORMAT */}

              <button
                onClick={handleFormat}
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-3
                  text-[10px]
                  text-neutral-400
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                <Code2 size={13} />

                Format
              </button>

              {/* COPY */}

              <button
                onClick={handleCopy}
                disabled={!cleanedJson}
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-3
                  text-[10px]
                  text-neutral-400
                  hover:bg-white/[0.06]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                {copied ? (
                  <>
                    <Check
                      size={13}
                      className="text-emerald-400"
                    />

                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} />

                    Copy
                  </>
                )}
              </button>

              {/* CLEAR */}

              <button
                onClick={handleClear}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-3
                  text-neutral-500
                  hover:border-red-400/20
                  hover:bg-red-400/5
                  hover:text-red-300
                "
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
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
              gap-2
              rounded-lg
              border
              border-red-400/10
              bg-red-500/[0.04]
              px-3
              py-2
              text-[10px]
              text-red-300
            "
          >
            <XCircle size={13} />

            {error}
          </div>
        )}

        {/* Footer */}

        <footer
          className="
            flex
            h-7
            shrink-0
            items-center
            justify-between
            text-[9px]
            text-neutral-700
          "
        >
          <span>JSON Value Cleaner</span>

          <span>Keys preserved • Values cleared</span>
        </footer>
      </div>
    </main>
  );
}