"use client";

import { useState } from "react";

export default function AESGCMValueExtractor() {
  const [encryptedText, setEncryptedText] = useState("");

  const [iv, setIv] = useState("");
  const [authTag, setAuthTag] = useState("");
  const [ciphertext, setCiphertext] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const extractValues = () => {
    setError("");
    setIv("");
    setAuthTag("");
    setCiphertext("");
    setCopied("");

    const value = encryptedText
      .replace(/\s+/g, "")
      .trim();

    if (!value) {
      setError("Please enter an encrypted payload.");
      return;
    }

    /*
     * Find only the first two @ characters.
     *
     * We intentionally DON'T use:
     *
     * value.split("@")
     *
     * because the ciphertext may contain @.
     *
     * Expected:
     *
     * IV@AUTH_TAG@CIPHERTEXT
     *
     * Result:
     *
     * IV          -> first section
     * AUTH_TAG    -> second section
     * CIPHERTEXT  -> everything after second @
     */

    const firstSeparator = value.indexOf("@");

    if (firstSeparator === -1) {
      setError(
        "Invalid payload. Expected IV@AuthTag@Ciphertext."
      );
      return;
    }

    const secondSeparator = value.indexOf(
      "@",
      firstSeparator + 1
    );

    if (secondSeparator === -1) {
      setError(
        "Invalid payload. Expected IV@AuthTag@Ciphertext."
      );
      return;
    }

    const extractedIv = value.slice(
      0,
      firstSeparator
    );

    const extractedAuthTag = value.slice(
      firstSeparator + 1,
      secondSeparator
    );

    const extractedCiphertext = value.slice(
      secondSeparator + 1
    );

    if (!extractedIv) {
      setError("Nonce / IV is empty.");
      return;
    }

    if (!extractedAuthTag) {
      setError("Authentication Tag is empty.");
      return;
    }

    if (!extractedCiphertext) {
      setError("Ciphertext is empty.");
      return;
    }

    setIv(extractedIv);
    setAuthTag(extractedAuthTag);
    setCiphertext(extractedCiphertext);
  };

  const clearAll = () => {
    setEncryptedText("");
    setIv("");
    setAuthTag("");
    setCiphertext("");
    setError("");
    setCopied("");
  };

  const copyValue = async (
    value: string,
    type: string
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch {
      setError("Unable to copy value.");
    }
  };

  return (
    <main className="min-h-screen bg-[#08090c] p-4 text-white md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              AES-GCM Value Extractor
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Extract the Nonce / IV, Authentication Tag
              and Ciphertext from an encrypted payload.
            </p>
          </div>

          {(encryptedText ||
            iv ||
            authTag ||
            ciphertext) && (
            <button
              type="button"
              onClick={clearAll}
              className="
                rounded-lg
                border
                border-white/[0.08]
                px-3
                py-1.5
                text-xs
                text-neutral-500
                transition
                hover:bg-white/[0.04]
                hover:text-white
              "
            >
              Clear
            </button>
          )}
        </div>

        {/* MAIN CARD */}

        <div
          className="
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#0b0c10]
            p-5
          "
        >

          {/* INPUT */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400">
                Encrypted Payload
              </label>

              <span className="text-[10px] text-neutral-600">
                IV @ Auth Tag @ Ciphertext
              </span>
            </div>

            <textarea
              value={encryptedText}
              onChange={(e) => {
                setEncryptedText(e.target.value);
                setError("");
              }}
              spellCheck={false}
              placeholder="Paste encrypted payload here..."
              className="
                h-44
                w-full
                resize-none
                rounded-xl
                border
                border-white/[0.08]
                bg-[#08090c]
                p-4
                font-mono
                text-xs
                leading-6
                text-emerald-300
                outline-none
                placeholder:text-neutral-700
                focus:border-violet-400/40
                focus:ring-1
                focus:ring-violet-400/10
              "
            />
          </div>

          {/* ACTION */}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={extractValues}
              className="
                rounded-xl
                bg-violet-500
                px-6
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-violet-400
                active:scale-[0.98]
              "
            >
              Extract Values
            </button>

            <span className="text-[10px] text-neutral-600">
              No decryption performed
            </span>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-400/10
                bg-red-400/[0.04]
                px-4
                py-3
                text-xs
                text-red-300
              "
            >
              {error}
            </div>
          )}

          {/* OUTPUT */}

          {(iv || authTag || ciphertext) && (
            <div className="mt-7 space-y-4">

              {/* IV */}

              <Output
                number="01"
                label="Nonce / IV"
                description="Initialization vector / nonce"
                value={iv}
                copied={copied === "iv"}
                onCopy={() =>
                  copyValue(iv, "iv")
                }
              />

              {/* AUTH TAG */}

              <Output
                number="02"
                label="Authentication Tag"
                description="GCM authentication tag"
                value={authTag}
                copied={copied === "authTag"}
                onCopy={() =>
                  copyValue(
                    authTag,
                    "authTag"
                  )
                }
              />

              {/* CIPHERTEXT */}

              <Output
                number="03"
                label="Ciphertext"
                description="Encrypted data"
                value={ciphertext}
                copied={copied === "ciphertext"}
                onCopy={() =>
                  copyValue(
                    ciphertext,
                    "ciphertext"
                  )
                }
              />

            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   OUTPUT COMPONENT
========================================================= */

function Output({
  number,
  label,
  description,
  value,
  copied,
  onCopy,
}: {
  number: string;
  label: string;
  description: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-white/[0.07]
        bg-[#08090c]
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-white/[0.06]
          px-4
          py-3
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-violet-500/[0.08]
              text-[10px]
              font-semibold
              text-violet-400
            "
          >
            {number}
          </div>

          <div>
            <div className="text-xs font-medium text-neutral-300">
              {label}
            </div>

            <div className="mt-0.5 text-[10px] text-neutral-600">
              {description}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="
            rounded-lg
            border
            border-white/[0.06]
            px-3
            py-1.5
            text-[10px]
            text-neutral-500
            transition
            hover:bg-white/[0.04]
            hover:text-white
          "
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* VALUE */}

      <div className="p-4">
        <code
          className="
            block
            max-h-52
            overflow-auto
            break-all
            whitespace-pre-wrap
            font-mono
            text-xs
            leading-6
            text-emerald-300
          "
        >
          {value || "—"}
        </code>
      </div>
    </div>
  );
}