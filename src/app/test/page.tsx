"use client";

import { useState } from "react";

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);

  return Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export default function AESGCMTool() {
  const [encryptedText, setEncryptedText] =
    useState("");

  const [iv, setIv] = useState("");
  const [ciphertext, setCiphertext] =
    useState("");
  const [authTag, setAuthTag] =
    useState("");

  const [error, setError] =
    useState("");

  const splitEncryptedText = () => {
    setError("");
    setIv("");
    setCiphertext("");
    setAuthTag("");

    try {
      if (!encryptedText.trim()) {
        setError("Enter encrypted text.");
        return;
      }

      const encryptedBytes =
        base64ToBytes(
          encryptedText.trim()
        );

      /*
       * AES-GCM standard/recommended IV:
       * 12 bytes = 96 bits
       */
      const IV_LENGTH = 12;

      /*
       * Authentication tag:
       * 128 bits = 16 bytes
       */
      const AUTH_TAG_LENGTH = 16;

      /*
       * Minimum:
       *
       * IV (12)
       * +
       * Auth Tag (16)
       *
       * = 28 bytes
       */
      if (
        encryptedBytes.length <=
        IV_LENGTH + AUTH_TAG_LENGTH
      ) {
        throw new Error(
          "Encrypted payload is too short."
        );
      }

      /*
       * -------------------------
       * 1. IV / NONCE
       * -------------------------
       *
       * First 12 bytes
       */
      const ivBytes =
        encryptedBytes.slice(
          0,
          IV_LENGTH
        );

      /*
       * -------------------------
       * 2. AUTH TAG
       * -------------------------
       *
       * Last 16 bytes
       */
      const authTagBytes =
        encryptedBytes.slice(
          encryptedBytes.length -
            AUTH_TAG_LENGTH
        );

      /*
       * -------------------------
       * 3. CIPHERTEXT
       * -------------------------
       *
       * Everything between
       * IV and Auth Tag
       */
      const ciphertextBytes =
        encryptedBytes.slice(
          IV_LENGTH,
          encryptedBytes.length -
            AUTH_TAG_LENGTH
        );

      /*
       * Convert to Base64
       */
      setIv(
        bytesToBase64(ivBytes)
      );

      setCiphertext(
        bytesToBase64(
          ciphertextBytes
        )
      );

      setAuthTag(
        bytesToBase64(
          authTagBytes
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid encrypted payload."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#08090c] p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-semibold">
          AES-GCM Payload Splitter
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Split IV, ciphertext and authentication
          tag from a Base64 AES-GCM payload.
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-xs text-neutral-500">
            Encrypted Payload
          </label>

          <textarea
            value={encryptedText}
            onChange={(e) => {
              setEncryptedText(
                e.target.value
              );

              setError("");
            }}
            placeholder="Paste Base64 encrypted payload..."
            className="
              h-36
              w-full
              resize-none
              rounded-xl
              border border-white/[0.08]
              bg-black/30
              p-4
              font-mono
              text-sm
              text-emerald-300
              outline-none
              placeholder:text-neutral-700
              focus:border-violet-400/30
            "
          />
        </div>

        <button
          onClick={splitEncryptedText}
          className="
            mt-4
            rounded-xl
            bg-violet-500
            px-5
            py-3
            text-sm
            font-medium
            hover:bg-violet-400
          "
        >
          Split AES-GCM
        </button>

        {error && (
          <div
            className="
              mt-4
              rounded-xl
              border border-red-400/10
              bg-red-400/[0.04]
              p-3
              text-xs
              text-red-300
            "
          >
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Output
            label="IV / Nonce"
            value={iv}
          />

          <Output
            label="Ciphertext"
            value={ciphertext}
          />

          <Output
            label="Authentication Tag"
            value={authTag}
          />
        </div>
      </div>
    </main>
  );
}

function Output({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-neutral-500">
        {label}
      </label>

      <div
        className="
          min-h-[48px]
          rounded-xl
          border border-white/[0.07]
          bg-black/30
          p-4
        "
      >
        <code className="block break-all font-mono text-xs text-emerald-300">
          {value || "—"}
        </code>
      </div>
    </div>
  );
}