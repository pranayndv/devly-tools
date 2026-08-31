"use client";

import { useState } from "react";

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.trim();

  // Convert URL-safe Base64 if necessary
  const base64 = normalized
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  const binary = atob(padded);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function normalizeKey(value: string): Uint8Array {
  const trimmed = value.trim();

  /*
   * First try Base64.
   *
   * This supports keys like:
   * 5NHt4yrm0S+Dh...
   */
  try {
    const bytes = base64ToBytes(trimmed);

    if (
      bytes.length === 16 ||
      bytes.length === 24 ||
      bytes.length === 32
    ) {
      return bytes;
    }
  } catch {
    // Not Base64, continue below.
  }

  /*
   * Otherwise treat the key as UTF-8.
   *
   * Valid AES key sizes:
   * 16 bytes = AES-128
   * 24 bytes = AES-192
   * 32 bytes = AES-256
   */
  return new TextEncoder().encode(trimmed);
}

export default function AESGCMDecryptor() {
  const [key, setKey] = useState("");
  const [encryptedText, setEncryptedText] = useState("");

  const [decryptedText, setDecryptedText] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const decrypt = async () => {
    setError("");
    setDecryptedText("");

    if (!key.trim()) {
      setError("Enter the decryption key.");
      return;
    }

    if (!encryptedText.trim()) {
      setError("Enter the encrypted payload.");
      return;
    }

    setLoading(true);

    try {
      /*
       * ------------------------------------
       * 1. Decode encrypted payload
       * ------------------------------------
       *
       * Format produced by your backend:
       *
       * IV (12 bytes)
       * +
       * Ciphertext
       * +
       * Authentication Tag (16 bytes)
       *
       * Everything is Base64 encoded.
       */
      const combinedData =
        base64ToBytes(encryptedText);

      /*
       * AES-GCM uses a 12-byte IV
       * in your implementation.
       */
      const IV_LENGTH = 12;

      /*
       * GCM authentication tag is
       * 128 bits = 16 bytes.
       */
      const AUTH_TAG_LENGTH = 16;

      if (
        combinedData.length <=
        IV_LENGTH + AUTH_TAG_LENGTH
      ) {
        throw new Error(
          "Encrypted payload is too short."
        );
      }

      /*
       * ------------------------------------
       * 2. Extract IV
       * ------------------------------------
       */
      const iv = combinedData.slice(
        0,
        IV_LENGTH
      );

      /*
       * ------------------------------------
       * 3. Extract ciphertext + auth tag
       * ------------------------------------
       *
       * Web Crypto expects the GCM
       * authentication tag to remain
       * attached to the ciphertext.
       */
      const encryptedData =
        combinedData.slice(IV_LENGTH);

      /*
       * ------------------------------------
       * 4. Decode AES key
       * ------------------------------------
       */
      const keyBytes = normalizeKey(key);

      if (
        keyBytes.length !== 16 &&
        keyBytes.length !== 24 &&
        keyBytes.length !== 32
      ) {
        throw new Error(
          "Invalid AES key. Use a 16, 24, or 32-byte key."
        );
      }

      /*
       * ------------------------------------
       * 5. Import AES key
       * ------------------------------------
       */
      const cryptoKey =
        await crypto.subtle.importKey(
          "raw",
          keyBytes.buffer.slice(
            keyBytes.byteOffset,
            keyBytes.byteOffset +
              keyBytes.byteLength
          ) as ArrayBuffer,
          {
            name: "AES-GCM",
          },
          false,
          ["decrypt"]
        );

      /*
       * ------------------------------------
       * 6. Decrypt
       * ------------------------------------
       *
       * Important:
       *
       * encryptedData =
       *
       * ciphertext + authentication tag
       *
       * Web Crypto validates the tag
       * automatically.
       */
      const decryptedBuffer =
        await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: iv.buffer.slice(
              iv.byteOffset,
              iv.byteOffset + iv.byteLength
            ) as ArrayBuffer,
            tagLength: 128,
          },
          cryptoKey,
          encryptedData.buffer.slice(
            encryptedData.byteOffset,
            encryptedData.byteOffset +
              encryptedData.byteLength
          ) as ArrayBuffer
        );

      /*
       * ------------------------------------
       * 7. Convert bytes to text
       * ------------------------------------
       */
      const plaintext =
        new TextDecoder().decode(
          decryptedBuffer
        );

      setDecryptedText(plaintext);
    } catch (err) {
      console.error(err);

      setError(
        "Decryption failed. Check the key and encrypted payload."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setKey("");
    setEncryptedText("");
    setDecryptedText("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#08090c] px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                AES-GCM Decrypter
              </h1>

              <p className="mt-1 text-sm text-neutral-500">
                Decrypt a Base64 AES-GCM payload
                using your secret key.
              </p>
            </div>

            <button
              type="button"
              onClick={clearAll}
              className="
                rounded-lg
                border border-white/[0.08]
                bg-white/[0.03]
                px-3
                py-2
                text-xs
                text-neutral-400
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              Clear
            </button>
          </div>
        </div>

        {/* Info */}

        <div
          className="
            mb-5
            rounded-xl
            border border-violet-400/10
            bg-violet-400/[0.04]
            px-4
            py-3
          "
        >
          <div className="flex gap-3">
            <div className="mt-0.5 text-violet-400">
              AES-GCM
            </div>

            <div>
              <p className="text-sm font-medium text-violet-200">
                Automatic IV handling
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-500">
                The first 12 bytes of the encrypted
                payload are automatically used as the
                IV. The remaining data contains the
                ciphertext and authentication tag.
              </p>
            </div>
          </div>
        </div>

        {/* Key */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border border-white/[0.08]
            bg-[#0b0c10]
          "
        >
          <div
            className="
              border-b
              border-white/[0.06]
              bg-white/[0.025]
              px-4
              py-3
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-white">
                  Decryption Key
                </h2>

                <p className="mt-0.5 text-[11px] text-neutral-600">
                  Base64 or raw UTF-8 AES key
                </p>
              </div>

              <span className="rounded-md bg-emerald-400/10 px-2 py-1 font-mono text-[10px] text-emerald-400">
                AES-GCM
              </span>
            </div>
          </div>

          <div className="p-4">
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError("");
              }}
              placeholder="Enter AES decryption key..."
              autoComplete="off"
              className="
                w-full
                rounded-xl
                border border-white/[0.08]
                bg-black/30
                px-4
                py-3
                font-mono
                text-sm
                text-emerald-300
                outline-none
                placeholder:text-neutral-700
                focus:border-violet-400/40
                focus:ring-1
                focus:ring-violet-400/20
              "
            />
          </div>
        </section>

        {/* Encrypted payload */}

        <section
          className="
            mt-4
            overflow-hidden
            rounded-2xl
            border border-white/[0.08]
            bg-[#0b0c10]
          "
        >
          <div
            className="
              border-b
              border-white/[0.06]
              bg-white/[0.025]
              px-4
              py-3
            "
          >
            <h2 className="text-sm font-medium text-white">
              Encrypted Payload
            </h2>

            <p className="mt-0.5 text-[11px] text-neutral-600">
              Base64 encoded: IV + ciphertext +
              authentication tag
            </p>
          </div>

          <div className="p-4">
            <textarea
              value={encryptedText}
              onChange={(e) => {
                setEncryptedText(
                  e.target.value
                );
                setError("");
              }}
              placeholder="Paste encrypted Base64 payload..."
              spellCheck={false}
              className="
                h-40
                w-full
                resize-none
                rounded-xl
                border border-white/[0.08]
                bg-black/30
                p-4
                font-mono
                text-xs
                leading-6
                text-cyan-300
                outline-none
                placeholder:text-neutral-700
                focus:border-violet-400/40
                focus:ring-1
                focus:ring-violet-400/20
              "
            />
          </div>
        </section>

        {/* Error */}

        {error && (
          <div
            className="
              mt-4
              rounded-xl
              border border-red-400/10
              bg-red-400/[0.04]
              px-4
              py-3
              text-xs
              text-red-300
            "
          >
            <span className="font-medium">
              Decryption error:
            </span>{" "}
            {error}
          </div>
        )}

        {/* Button */}

        <button
          type="button"
          onClick={decrypt}
          disabled={loading}
          className="
            mt-5
            w-full
            rounded-xl
            bg-violet-500
            px-5
            py-3
            text-sm
            font-medium
            text-white
            shadow-lg
            shadow-violet-500/10
            transition
            hover:bg-violet-400
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Decrypting..."
            : "Decrypt Payload"}
        </button>

        {/* Result */}

        <section
          className="
            mt-5
            overflow-hidden
            rounded-2xl
            border border-white/[0.08]
            bg-[#0b0c10]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-white/[0.06]
              bg-white/[0.025]
              px-4
              py-3
            "
          >
            <div>
              <h2 className="text-sm font-medium text-white">
                Decrypted Payload
              </h2>

              <p className="mt-0.5 text-[11px] text-neutral-600">
                Plaintext returned by AES-GCM
              </p>
            </div>

            {decryptedText && (
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    decryptedText
                  )
                }
                className="
                  rounded-lg
                  border border-white/[0.08]
                  px-3
                  py-1.5
                  text-[11px]
                  text-neutral-400
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                Copy
              </button>
            )}
          </div>

          <div className="min-h-[140px] p-4">
            {decryptedText ? (
              <pre
                className="
                  whitespace-pre-wrap
                  break-words
                  font-mono
                  text-sm
                  leading-6
                  text-emerald-300
                "
              >
                {decryptedText}
              </pre>
            ) : (
              <div className="flex min-h-[108px] items-center justify-center text-xs text-neutral-700">
                Decrypted payload will appear here
              </div>
            )}
          </div>
        </section>

        {/* Format */}

        <div
          className="
            mt-5
            rounded-xl
            border border-white/[0.06]
            bg-white/[0.015]
            p-4
          "
        >
          <p className="mb-3 text-xs font-medium text-neutral-400">
            Expected payload format
          </p>

          <div className="overflow-x-auto rounded-lg bg-black/30 p-3">
            <code className="whitespace-nowrap font-mono text-xs">
              <span className="text-violet-400">
                IV
              </span>

              <span className="text-neutral-600">
                {" + "}
              </span>

              <span className="text-cyan-400">
                Ciphertext
              </span>

              <span className="text-neutral-600">
                {" + "}
              </span>

              <span className="text-amber-400">
                Auth Tag
              </span>

              <span className="text-neutral-600">
                {" → "}
              </span>

              <span className="text-emerald-400">
                Base64
              </span>
            </code>
          </div>

          <div className="mt-3 grid gap-2 text-[11px] text-neutral-600 sm:grid-cols-3">
            <span>
              IV:{" "}
              <strong className="text-neutral-400">
                12 bytes
              </strong>
            </span>

            <span>
              Auth Tag:{" "}
              <strong className="text-neutral-400">
                16 bytes
              </strong>
            </span>

            <span>
              Padding:{" "}
              <strong className="text-neutral-400">
                None
              </strong>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}