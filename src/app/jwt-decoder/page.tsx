"use client";

import { useCallback, useMemo, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import {
  Check,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Code2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";

type JwtParts = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

type DecodeResult = {
  parts: JwtParts | null;
  error: string | null;
};

const DEFAULT_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const ALGORITHMS = [
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
];

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

  const padded =
    normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  const binary = atob(padded);

  const bytes = Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

function decodeJwt(token: string): DecodeResult {
  const cleanToken = token.trim();

  if (!cleanToken) {
    return {
      parts: null,
      error: null,
    };
  }

  const sections = cleanToken.split(".");

  if (sections.length !== 3) {
    return {
      parts: null,
      error: "A JWT must contain exactly three parts.",
    };
  }

  try {
    const header = JSON.parse(decodeBase64Url(sections[0]));
    const payload = JSON.parse(decodeBase64Url(sections[1]));

    if (
      typeof header !== "object" ||
      header === null ||
      Array.isArray(header)
    ) {
      throw new Error();
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new Error();
    }

    return {
      parts: {
        header,
        payload,
        signature: sections[2],
      },
      error: null,
    };
  } catch {
    return {
      parts: null,
      error: "Unable to decode JWT. Check that the token is valid.",
    };
  }
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function Home() {
  const [jwt, setJwt] = useState(DEFAULT_JWT);
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);

  const decoded = useMemo(() => decodeJwt(jwt), [jwt]);

  const algorithm =
    typeof decoded.parts?.header?.alg === "string"
      ? decoded.parts.header.alg
      : "HS256";

  const copyJwt = useCallback(async () => {
    if (!jwt.trim()) return;

    await navigator.clipboard.writeText(jwt);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1600);
  }, [jwt]);

  const clearJwt = () => {
    setJwt("");
    setSecret("");
    setCopied(false);
  };

  const handleJwtMount: OnMount = (editor) => {
    editor.focus();
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-[#07070a] text-white">
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

      {/* CONTENT */}

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        {/* HEADER */}
                    <h1 className="text-xl font-bold tracking-tight mb-3">
            <span className="text-white">
              JWT
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
              Decoder
            </span>
          </h1>

        {/* MAIN GRID */}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[32%_1fr]">
          {/* ================================================= */}
          {/* LEFT JWT */}
          {/* ================================================= */}

          <section
            className="
              flex min-h-0 flex-col overflow-hidden
              rounded-2xl
              border border-white/[0.08]
              bg-white/[0.025]
              shadow-[0_20px_80px_rgba(0,0,0,.35)]
              backdrop-blur-2xl
            "
          >
            {/* HEADER */}

            <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.07] bg-white/[0.025] px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/10 text-red-300">
                  <Code2 size={14} />
                </div>

                <div>
                  <div className="text-xs font-semibold text-white">
                    JWT Token
                  </div>
                </div>
              </div>

              <button
                type="button"
                title="JWT information"
                className="
                  flex h-6 w-6 items-center justify-center
                  rounded-lg border border-white/[0.06]
                  text-neutral-500
                  transition
                  hover:border-white/10
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <CircleHelp size={14} />
              </button>
            </div>

            {/* EDITOR */}

            <div className="min-h-0 flex-1 bg-[#08080a] px-5">
              <Editor
                height="100%"
                language="jwt"
                theme="jwt-premium"
                value={jwt}
                onChange={(value) => setJwt(value ?? "")}
                onMount={handleJwtMount}
                beforeMount={(monaco) => {
                  monaco.languages.register({
                    id: "jwt",
                  });

                  monaco.languages.setMonarchTokensProvider("jwt", {
                    tokenizer: {
                      root: [
                        [
                          /^[^.]+(?=\.)/,
                          {
                            token: "jwt-header",
                          },
                        ],
                        [
                          /(?<=\.)[^.]+(?=\.)/,
                          {
                            token: "jwt-payload",
                          },
                        ],
                        [
                          /(?<=\.)[^.]+$/,
                          {
                            token: "jwt-signature",
                          },
                        ],
                        [/\./, "jwt-dot"],
                      ],
                    },
                  });

                  monaco.editor.defineTheme("jwt-premium", {
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
                  minimap: {
                    enabled: false,
                  },

                  lineNumbers: "off",
                  glyphMargin: false,
                  folding: false,

                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 0,

                  wordWrap: "on",
                  wrappingIndent: "none",

                  scrollBeyondLastLine: false,

                  automaticLayout: true,

                  fontSize: 13,

                  fontFamily:
                    "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",

                  fontLigatures: true,

                  renderLineHighlight: "none",

                  padding: {
                    top: 18,
                    bottom: 18,
                  },

                  scrollbar: {
                    vertical: "auto",
                    horizontal: "hidden",
                    verticalScrollbarSize: 6,
                  },

                  overviewRulerLanes: 0,
                }}
              />
            </div>

            {/* LEGEND */}

            <div className="flex shrink-0 items-center gap-5 border-t border-white/[0.05] bg-black/20 px-4 py-2">
              <Legend
                color="bg-rose-400"
                label="Header"
              />

              <Legend
                color="bg-violet-400"
                label="Payload"
              />

              <Legend
                color="bg-emerald-400"
                label="Signature"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex shrink-0 gap-2 border-t border-white/[0.07] bg-white/[0.015] p-2.5">
              <button
                type="button"
                onClick={copyJwt}
                disabled={!jwt.trim()}
                className="
                  group flex h-9 flex-1 items-center justify-center
                  gap-2 rounded-lg
                  border border-violet-400/20
                  bg-gradient-to-r from-violet-500/10 to-cyan-500/10
                  text-xs font-medium text-violet-200
                  transition-all
                  hover:border-violet-400/40
                  hover:from-violet-500/20
                  hover:to-cyan-500/20
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard
                      size={14}
                      className="text-violet-400"
                    />
                    Copy JWT
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={clearJwt}
                disabled={!jwt.trim()}
                className="
                  flex h-9 items-center justify-center
                  gap-2 rounded-lg
                  border border-white/[0.08]
                  bg-white/[0.025]
                  px-4 text-xs text-neutral-400
                  transition
                  hover:border-white/[0.14]
                  hover:bg-white/[0.06]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                <Trash2 size={13} />
                Clear
              </button>
            </div>
          </section>

          {/* ================================================= */}
          {/* RIGHT */}
          {/* ================================================= */}

          <section
            className="
              flex min-h-0 flex-col overflow-hidden
              rounded-2xl
              border border-white/[0.08]
              bg-white/[0.025]
              shadow-[0_20px_80px_rgba(0,0,0,.35)]
              backdrop-blur-2xl
            "
          >
            {/* HEADER */}

            <JsonSection
              title="Header"
              subtitle="JWT metadata"
              icon={
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300">
                  <Code2 size={13} />
                </div>
              }
              content={
                decoded.parts
                  ? formatJson(decoded.parts.header)
                  : "{\n  // Waiting for a valid JWT\n}"
              }
              toolbar={<AlgorithmSelect algorithm={algorithm} />}
              className="h-[145px] shrink-0"
            />

            {/* PAYLOAD */}

            <JsonSection
              title="Payload"
              subtitle="Token claims"
              icon={
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <Code2 size={13} />
                </div>
              }
              content={
                decoded.parts
                  ? formatJson(decoded.parts.payload)
                  : "{\n  // Waiting for a valid JWT\n}"
              }
              className="h-[175px] shrink-0"
            />

            {/* SIGNING KEY */}

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-white/[0.025] px-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                    <KeyRound size={13} />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white">
                      Signing Key
                    </div>

                    <div className="text-[9px] text-neutral-600">
                      SIGNATURE VERIFICATION
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-yellow-400/10 bg-yellow-400/5 px-2 py-1 text-[9px] text-yellow-300/80">
                  <LockKeyhole size={10} />
                  Optional
                </div>
              </div>

              <div className="min-h-0 flex-1 bg-[#08080a] px-5 py-4 sm:px-6">
                <div className="font-mono text-xs leading-6">
                  <div className="text-slate-300">
                    <span className="text-cyan-300">
                      HMACSHA256
                    </span>

                    <span className="text-slate-500">(</span>
                  </div>

                  <div className="pl-7">
                    <span className="text-violet-300">
                      base64UrlEncode
                    </span>

                    <span className="text-slate-500">
                      (header){" "}
                    </span>

                    <span className="text-pink-400">+</span>

                    <span className="text-amber-300">
                      {" "}
                      &quot;.&quot;{" "}
                    </span>

                    <span className="text-pink-400">+</span>
                  </div>

                  <div className="pl-7">
                    <span className="text-violet-300">
                      base64UrlEncode
                    </span>

                    <span className="text-slate-500">
                      (payload),
                    </span>
                  </div>

                  <div className="my-1.5 pl-5">
                    <div className="relative">
                      <input
                        type="password"
                        value={secret}
                        onChange={(event) =>
                          setSecret(event.target.value)
                        }
                        placeholder="Enter your 256-bit secret key..."
                        spellCheck={false}
                        className="
                          h-9 w-full rounded-lg
                          border border-cyan-400/10
                          bg-black/50
                          px-3
                          font-mono text-xs
                          text-cyan-300
                          outline-none
                          placeholder:text-neutral-700
                          transition
                          focus:border-cyan-400/30
                          focus:bg-cyan-400/[0.02]
                          focus:ring-2
                          focus:ring-cyan-400/[0.04]
                        "
                      />

                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <KeyRound
                          size={13}
                          className="text-neutral-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-500">)</div>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/10 bg-amber-400/[0.025] p-2.5">
                  <TriangleAlert
                    size={13}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div>
                    <div className="text-[10px] font-medium text-amber-300">
                      Signature verification
                    </div>

                    <div className="mt-0.5 text-[9px] leading-4 text-neutral-600">
                      Decoding reveals the token contents but
                      does not verify that the signature is valid.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>

        {/* ERROR */}

        {decoded.error && (
          <div className="mt-2 flex shrink-0 items-center gap-2 rounded-lg border border-red-400/10 bg-red-500/[0.04] px-3 py-2 text-[10px] text-red-300">
            <TriangleAlert size={14} />
            <span>{decoded.error}</span>
          </div>
        )}
      </div>
    </main>
  );
}

/* ================================================= */
/* JSON SECTION                                      */
/* ================================================= */

function JsonSection({
  title,
  subtitle,
  icon,
  content,
  toolbar,
  className = "",
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: string;
  toolbar?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col border-b border-white/[0.07] ${className}`}
    >
      {/* HEADER */}

      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-white/[0.025] px-4">
        <div className="flex items-center gap-2.5">
          {icon}

          <div>
            <div className="text-xs font-semibold text-white">
              {title}
            </div>

            <div className="text-[9px] text-neutral-600">
              {subtitle}
            </div>
          </div>
        </div>

        {toolbar}
      </div>

      {/* EDITOR */}

      <div className="min-h-0 flex-1 bg-[#08080a] px-5">
        <Editor
          height="100%"
          language="json"
          theme="jwt-json"
          value={content}
          options={{
            readOnly: true,

            minimap: {
              enabled: false,
            },

            lineNumbers: "off",
            glyphMargin: false,
            folding: false,

            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,

            padding: {
              top: 12,
              bottom: 12,
            },

            scrollBeyondLastLine: false,

            automaticLayout: true,

            fontSize: 12,

            fontFamily:
              "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",

            fontLigatures: true,

            renderLineHighlight: "none",

            scrollbar: {
              vertical: "auto",
              horizontal: "hidden",
              verticalScrollbarSize: 5,
            },

            overviewRulerLanes: 0,
          }}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme("jwt-json", {
              base: "vs-dark",
              inherit: true,

              rules: [
                {
                  token: "string.key.json",
                  foreground: "7DD3FC",
                },
                {
                  token: "string.value.json",
                  foreground: "86EFAC",
                },
                {
                  token: "number",
                  foreground: "FBBF24",
                },
                {
                  token: "keyword",
                  foreground: "C084FC",
                },
                {
                  token: "delimiter.bracket",
                  foreground: "94A3B8",
                },
                {
                  token: "delimiter.array",
                  foreground: "94A3B8",
                },
                {
                  token: "delimiter.comma",
                  foreground: "64748B",
                },
                {
                  token: "delimiter.colon",
                  foreground: "64748B",
                },
              ],

              colors: {
                "editor.background": "#08080A",
                "editor.foreground": "#CBD5E1",
                "editorCursor.foreground": "#FFFFFF",
                "editor.selectionBackground": "#FFFFFF10",
                "editor.lineHighlightBackground": "#FFFFFF03",
                "editorLineNumber.foreground": "#3F3F46",
              },
            });
          }}
        />
      </div>
    </section>
  );
}

/* ================================================= */
/* ALGORITHM                                        */
/* ================================================= */

function AlgorithmSelect({
  algorithm,
}: Readonly<{
  algorithm: string;
}>) {
  return (
    <div className="relative">
      <select
        value={algorithm}
        onChange={() => {}}
        className="
          h-7 appearance-none
          rounded-lg
          border border-violet-400/20
          bg-violet-400/[0.06]
          pl-2.5 pr-7
          text-[10px]
          font-semibold
          text-violet-300
          outline-none
          transition
          hover:border-violet-400/40
          focus:border-violet-400/40
        "
      >
        {ALGORITHMS.map((item) => (
          <option
            key={item}
            value={item}
            className="bg-[#111114] text-white"
          >
            {item}
          </option>
        ))}
      </select>

      <ChevronDown
        size={11}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-violet-400"
      />
    </div>
  );
}

/* ================================================= */
/* LEGEND                                           */
/* ================================================= */

function Legend({
  color,
  label,
}: Readonly<{
  color: string;
  label: string;
}>) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-neutral-600">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />

      <span>{label}</span>
    </div>
  );
}