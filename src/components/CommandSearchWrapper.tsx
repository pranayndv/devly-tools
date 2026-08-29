"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export type CommandItem = {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
  icon?: ReactNode;
  onSelect?: () => void;
};

type CommandSearchWrapperProps = {
  children: ReactNode;
  commands?: CommandItem[];
};

const defaultCommands: CommandItem[] = [
          {
    id: "code-comparer",
    title: "Code Comparer",
    description: "Compare original and modified code",
    keywords: [
      "code",
      "comparer",
      "formater",
      "sonar",
    ],
  },
      {
    id: "json-cleaner",
    title: "JSON Cleaner",
    description: "Clean and format JSON values",
    keywords: [
      "json",
      "formatter",
      "cleaner",
      "format",
    ],
  },

  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and inspect JWT tokens",
    keywords: [
      "jwt",
      "token",
      "decode",
      "authentication",
    ],
  },
  {
    id: "rgx-generator",
    title: "Regex Creator",
    description: "Create and test regular expressions",
    keywords: [
      "regex",
      "regular expression",
      "pattern",
      "regexp",
    ],
  }
];

export default function CommandSearchWrapper({
  children,
  commands = defaultCommands,
}: CommandSearchWrapperProps) {
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");

  const [selectedIndex, setSelectedIndex] =
    useState(0);

    const router = useRouter()
  /*
   * ============================================
   * CTRL + P / CMD + P
   * ============================================
   */

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.ctrlKey &&
      event.key.toLowerCase() === "p"
    ) {
      event.preventDefault();
      event.stopPropagation();

      setOpen(true);
      setQuery("");
      setSelectedIndex(0);
    }

    if (
      event.metaKey &&
      event.key.toLowerCase() === "p"
    ) {
      event.preventDefault();
      event.stopPropagation();

      setOpen(true);
      setQuery("");
      setSelectedIndex(0);
    }

    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
      setSelectedIndex(0);
    }
  };

  window.addEventListener(
    "keydown",
    handleKeyDown,
    true // capture phase
  );

  return () => {
    window.removeEventListener(
      "keydown",
      handleKeyDown,
      true
    );
  };
}, []);

  /*
   * ============================================
   * FILTER COMMANDS
   * ============================================
   */

  const filteredCommands = useMemo(() => {
    const value = query
      .trim()
      .toLowerCase();

    if (!value) {
      return commands;
    }

    return commands.filter((command) => {
      const searchableText = [
        command.title,
        command.description ?? "",
        ...(command.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [commands, query]);

  /*
   * ============================================
   * SELECT COMMAND
   * ============================================
   */

const selectCommand = (command: CommandItem) => {
  // Close command palette
  setOpen(false);
  setQuery("");
  setSelectedIndex(0);

  // Redirect
  router.push(`/${command.id}`);
};
  /*
   * ============================================
   * KEYBOARD NAVIGATION
   * ============================================
   */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.min(
          current + 1,
          Math.max(
            filteredCommands.length - 1,
            0
          )
        )
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.max(current - 1, 0)
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const command =
        filteredCommands[selectedIndex];

      if (command) {
        selectCommand(command);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      setOpen(false);
      setQuery("");
      setSelectedIndex(0);
    }
  };

  return (
    <>
      {children}

      {open && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-start
            justify-center
            bg-black/60
            px-4
            pt-[12vh]
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
              setQuery("");
              setSelectedIndex(0);
            }
          }}
        >
          <div
            className="
              w-full
              max-w-[620px]
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.10]
              bg-[#111318]
              shadow-[0_30px_100px_rgba(0,0,0,0.65)]
            "
          >
            {/* Search */}

            <div
              className="
                flex
                h-14
                items-center
                gap-3
                border-b
                border-white/[0.07]
                px-4
              "
            >
              <Search
                size={17}
                className="text-violet-400"
              />

              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(
                    event.target.value
                  );

                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search Devly..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-neutral-600
                "
              />

              <kbd
                className="
                  rounded-md
                  border
                  border-white/[0.08]
                  bg-white/[0.04]
                  px-2
                  py-1
                  text-[9px]
                  text-neutral-500
                "
              >
                ESC
              </kbd>
            </div>

            {/* Commands */}

            <div
              className="
                max-h-[420px]
                overflow-y-auto
                p-2
              "
            >
              {filteredCommands.length > 0 ? (
                <>
                  <div
                    className="
                      px-2
                      pb-2
                      pt-1
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-wider
                      text-neutral-600
                    "
                  >
                    Tools
                  </div>

                  {filteredCommands.map(
                    (
                      command,
                      index
                    ) => {
                      const selected =
                        index ===
                        selectedIndex;

                      return (
                        <button
                          key={command.id}
                          type="button"
                          onMouseEnter={() =>
                            setSelectedIndex(
                              index
                            )
                          }
                          onClick={() =>{
                            selectCommand(
                              command
                            )
                         } }
                          className={`
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-left
                            transition
                            ${
                              selected
                                ? "bg-violet-500/10"
                                : "hover:bg-white/[0.04]"
                            }
                          `}
                        >
                          <div
                            className={`
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              ${
                                selected
                                  ? "bg-violet-400/10 text-violet-300"
                                  : "bg-white/[0.04] text-neutral-500"
                              }
                            `}
                          >
                            {command.icon ?? (
                              <Search
                                size={14}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className={`
                                text-[11px]
                                font-medium
                                ${
                                  selected
                                    ? "text-white"
                                    : "text-neutral-300"
                                }
                              `}
                            >
                              {
                                command.title
                              }
                            </div>

                            {command.description && (
                              <div
                                className="
                                  mt-0.5
                                  truncate
                                  text-[9px]
                                  text-neutral-600
                                "
                              >
                                {
                                  command.description
                                }
                              </div>
                            )}
                          </div>

                          <ChevronRight
                            size={13}
                            className={`
                              shrink-0
                              ${
                                selected
                                  ? "text-violet-400"
                                  : "text-neutral-700"
                              }
                            `}
                          />
                        </button>
                      );
                    }
                  )}
                </>
              ) : (
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    py-12
                  "
                >
                  <Search
                    size={20}
                    className="mb-3 text-neutral-700"
                  />

                  <div className="text-[11px] text-neutral-400">
                    No tools found
                  </div>

                  <div className="mt-1 text-[9px] text-neutral-700">
                    Try another search
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}

            <div
              className="
                flex
                h-9
                items-center
                justify-between
                border-t
                border-white/[0.06]
                px-3
              "
            >
              <div
                className="
                  flex
                  gap-3
                  text-[8px]
                  text-neutral-700
                "
              >
                <span>
                  ↑ ↓ Navigate
                </span>

                <span>
                  Enter Select
                </span>
              </div>

              <span className="text-[8px] text-neutral-700">
                {filteredCommands.length} tools
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}