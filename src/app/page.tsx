import Link from "next/link";
import {
  Braces,
  Code2,
  FileJson,
  KeyRound,
  Regex,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    title: "Code Comparer",
    description: "Compare two pieces of code and find differences.",
    href: "/code-comparer",
    icon: Code2,
  },
  {
    title: "JSON Cleaner",
    description: "Clean, format and simplify JSON values.",
    href: "/json-cleaner",
    icon: FileJson,
  },
  {
    title: "JWT Decoder",
    description: "Decode JWT headers, payloads and signatures.",
    href: "/jwt-decoder",
    icon: KeyRound,
  },
  {
    title: "Regex Creator",
    description: "Create, test and understand regular expressions.",
    href: "/rgx-generator",
    icon: Regex,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-500/[0.07] blur-[120px]" />

        <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-blue-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        {/* Header */}

        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Braces size={17} />
            </div>

            <span className="text-sm font-semibold tracking-tight">
              Devly
            </span>
          </Link>

          <div className="text-[10px] text-neutral-600">
            Developer Tools
          </div>
        </header>

        {/* Hero */}

        <section className="mx-auto max-w-3xl py-28 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Simple tools for developers
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Developer tools,
            <span className="text-violet-400">
              {" "}
              without the clutter.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-neutral-500">
            A collection of fast, simple and
            privacy-friendly tools for everyday
            development work.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-[10px] text-neutral-500">
              Press
              <kbd className="ml-2 text-neutral-300">
                Ctrl P
              </kbd>
            </span>

            <span className="text-[10px] text-neutral-700">
              to search tools
            </span>
          </div>
        </section>

        {/* Tools */}

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-medium text-neutral-200">
                Developer Tools
              </h2>

              <p className="mt-1 text-[10px] text-neutral-600">
                Pick a tool and start working.
              </p>
            </div>

            <span className="text-[9px] text-neutral-700">
              {tools.length} tools
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="
                    group
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
                    p-4
                    transition
                    hover:border-violet-400/20
                    hover:bg-violet-400/[0.035]
                  "
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-white/[0.04]
                        text-neutral-500
                        transition
                        group-hover:bg-violet-400/10
                        group-hover:text-violet-300
                      "
                    >
                      <Icon size={17} />
                    </div>

                    <ArrowRight
                      size={14}
                      className="
                        text-neutral-700
                        transition
                        group-hover:translate-x-0.5
                        group-hover:text-violet-400
                      "
                    />
                  </div>

                  <h3 className="mt-4 text-[11px] font-medium text-neutral-200">
                    {tool.title}
                  </h3>

                  <p className="mt-1.5 text-[9px] leading-4 text-neutral-600">
                    {tool.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}

        <footer className="mt-20 border-t border-white/[0.06] pt-6">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-neutral-700">
              Devly
            </span>

            <span className="text-[9px] text-neutral-700">
              Built for developers
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}