"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UnlockKeyhole,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type AESMode = "GCM" | "CBC" | "CTR" | "ECB";

type Encoding = "text" | "hex" | "base64";

type OutputFormat = "utf8" | "hex" | "base64";

/* =========================================================
   CONSTANTS
========================================================= */

const MODES: AESMode[] = [
  "GCM",
  "CBC",
  "CTR",
  "ECB",
];

const ENCODINGS: Encoding[] = [
  "text",
  "hex",
  "base64",
];

/* =========================================================
   PARSE INPUT
========================================================= */

function parseBytes(
  value: string,
  encoding: Encoding
): Uint8Array {
  if (encoding === "text") {
    return new TextEncoder().encode(value);
  }

  if (encoding === "hex") {
    const clean = value
      .trim()
      .replace(/\s+/g, "");

    if (!clean) {
      return new Uint8Array();
    }

    if (!/^[0-9a-fA-F]+$/.test(clean)) {
      throw new Error(
        "Invalid hexadecimal value."
      );
    }

    if (clean.length % 2 !== 0) {
      throw new Error(
        "Hex value must contain an even number of characters."
      );
    }

    const bytes = new Uint8Array(
      clean.length / 2
    );

    for (
      let i = 0;
      i < clean.length;
      i += 2
    ) {
      bytes[i / 2] = parseInt(
        clean.substring(i, i + 2),
        16
      );
    }

    return bytes;
  }

  try {
    const clean = value
      .trim()
      .replace(/\s+/g, "");

    if (!clean) {
      return new Uint8Array();
    }

    const binary = atob(clean);

    const bytes = new Uint8Array(
      binary.length
    );

    for (
      let i = 0;
      i < binary.length;
      i++
    ) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  } catch {
    throw new Error(
      "Invalid Base64 value."
    );
  }
}

/* =========================================================
   UINT8ARRAY → WORD ARRAY
========================================================= */

function bytesToWordArray(
  bytes: Uint8Array
): CryptoJS.lib.WordArray {
  const words: number[] = [];

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    words[i >>> 2] =
      (words[i >>> 2] || 0) |
      (bytes[i] <<
        (24 - (i % 4) * 8));
  }

  return CryptoJS.lib.WordArray.create(
    words,
    bytes.length
  );
}

/* =========================================================
   WORD ARRAY → UINT8ARRAY
========================================================= */

function wordArrayToBytes(
  wordArray: CryptoJS.lib.WordArray
): Uint8Array {
  const { words, sigBytes } =
    wordArray;

  const bytes = new Uint8Array(
    sigBytes
  );

  for (let i = 0; i < sigBytes; i++) {
    bytes[i] =
      (words[i >>> 2] >>>
        (24 - (i % 4) * 8)) &
      0xff;
  }

  return bytes;
}

/* =========================================================
   OUTPUT FORMAT
========================================================= */

function formatOutput(
  bytes: Uint8Array,
  format: OutputFormat
): string {
  if (format === "hex") {
    return Array.from(bytes)
      .map((byte) =>
        byte.toString(16).padStart(2, "0")
      )
      .join("");
  }

  if (format === "base64") {
    let binary = "";

    const chunkSize = 0x8000;

    for (
      let i = 0;
      i < bytes.length;
      i += chunkSize
    ) {
      binary += String.fromCharCode(
        ...bytes.subarray(
          i,
          Math.min(
            i + chunkSize,
            bytes.length
          )
        )
      );
    }

    return btoa(binary);
  }

  try {
    return new TextDecoder(
      "utf-8",
      {
        fatal: true,
      }
    ).decode(bytes);
  } catch {
    throw new Error(
      "Decrypted data is not valid UTF-8. Try HEX or Base64 output."
    );
  }
}

/* =========================================================
   VALIDATE AES KEY
========================================================= */

function validateKey(
  key: Uint8Array
): string {
  if (key.length === 16) {
    return "AES-128";
  }

  if (key.length === 24) {
    return "AES-192";
  }

  if (key.length === 32) {
    return "AES-256";
  }

  throw new Error(
    "AES key must be exactly 16, 24, or 32 bytes (128, 192, or 256 bits)."
  );
}

/* =========================================================
   AES-GCM
   WEB CRYPTO API
========================================================= */

async function decryptGCM({
  ciphertext,
  key,
  nonce,
  tag,
}: {
  ciphertext: Uint8Array;
  key: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
}): Promise<Uint8Array> {
  validateKey(key);

  if (nonce.length !== 12 && nonce.length !== 16) {
    throw new Error(
      "AES-GCM nonce should normally be 12 bytes."
    );
  }

  if (
    tag.length !== 16 &&
    tag.length !== 12 &&
    tag.length !== 8
  ) {
    throw new Error(
      "GCM authentication tag must be 8, 12, or 16 bytes."
    );
  }

  /*
   * Create a new ArrayBuffer-backed Uint8Array.
   *
   * This avoids the TypeScript 6
   * ArrayBufferLike vs ArrayBuffer problem.
   */
  const encrypted = new Uint8Array(
    ciphertext.length + tag.length
  );

  encrypted.set(ciphertext, 0);
  encrypted.set(tag, ciphertext.length);

  /*
   * Force actual ArrayBuffer instances.
   */
  const keyBuffer = new Uint8Array(key).buffer;

  const nonceBuffer =
    new Uint8Array(nonce).buffer;

  const encryptedBuffer =
    new Uint8Array(encrypted).buffer;

  try {
    const cryptoKey =
      await window.crypto.subtle.importKey(
        "raw",
        keyBuffer,
        {
          name: "AES-GCM",
        },
        false,
        ["decrypt"]
      );

    const decrypted =
      await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: nonceBuffer,
          tagLength: tag.length * 8,
        },
        cryptoKey,
        encryptedBuffer
      );

    return new Uint8Array(decrypted);
  } catch {
    throw new Error(
      "GCM authentication failed. Check the key, nonce, ciphertext and authentication tag."
    );
  }
}

/* =========================================================
   AES-CBC / CTR / ECB
   CRYPTOJS
========================================================= */

function decryptCryptoJS({
  ciphertext,
  key,
  iv,
  mode,
}: {
  ciphertext: Uint8Array;
  key: Uint8Array;
  iv?: Uint8Array;
  mode: Exclude<AESMode, "GCM">;
}): Uint8Array {
  validateKey(key);

  const keyWordArray =
    bytesToWordArray(key);

  const ciphertextWordArray =
    bytesToWordArray(ciphertext);

  const cipherParams =
    CryptoJS.lib.CipherParams.create({
      ciphertext:
        ciphertextWordArray,
    });

  /* ===============================================
     ECB
  =============================================== */

  if (mode === "ECB") {
    const decrypted =
      CryptoJS.AES.decrypt(
        cipherParams,
        keyWordArray,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

    return wordArrayToBytes(
      decrypted
    );
  }

  /* ===============================================
     IV
  =============================================== */

  if (!iv || iv.length !== 16) {
    throw new Error(
      `AES-${mode} requires a 16-byte IV.`
    );
  }

  const ivWordArray =
    bytesToWordArray(iv);

  /* ===============================================
     CBC
  =============================================== */

  if (mode === "CBC") {
    const decrypted =
      CryptoJS.AES.decrypt(
        cipherParams,
        keyWordArray,
        {
          iv: ivWordArray,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

    return wordArrayToBytes(
      decrypted
    );
  }

  /* ===============================================
     CTR
  =============================================== */

  const decrypted =
    CryptoJS.AES.decrypt(
      cipherParams,
      keyWordArray,
      {
        iv: ivWordArray,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding,
      }
    );

  return wordArrayToBytes(
    decrypted
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AESDecrypterPage() {
  const [mode, setMode] =
    useState<AESMode>("GCM");

  const [key, setKey] = useState("");

  const [iv, setIv] = useState("");

  const [ciphertext, setCiphertext] =
    useState("");

  const [authTag, setAuthTag] =
    useState("");

  const [keyEncoding, setKeyEncoding] =
    useState<Encoding>("text");

  const [ivEncoding, setIvEncoding] =
    useState<Encoding>("text");

  const [
    ciphertextEncoding,
    setCiphertextEncoding,
  ] = useState<Encoding>("base64");

  const [
    authTagEncoding,
    setAuthTagEncoding,
  ] = useState<Encoding>("base64");

  const [outputFormat, setOutputFormat] =
    useState<OutputFormat>("utf8");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [showKey, setShowKey] =
    useState(false);

  const [showIv, setShowIv] =
    useState(false);

  const [showTag, setShowTag] =
    useState(false);

  /* =======================================================
     DECRYPT
  ======================================================= */

  const handleDecrypt = async () => {
    setError("");
    setOutput("");
    setCopied(false);

    if (!key.trim()) {
      setError(
        "Enter your AES secret key."
      );
      return;
    }

    if (!ciphertext.trim()) {
      setError(
        "Enter your encrypted ciphertext."
      );
      return;
    }

    if (
      mode !== "ECB" &&
      !iv.trim()
    ) {
      setError(
        `Enter an IV / nonce for AES-${mode}.`
      );
      return;
    }

    if (
      mode === "GCM" &&
      !authTag.trim()
    ) {
      setError(
        "Enter the GCM authentication tag."
      );
      return;
    }

    try {
      setLoading(true);

      /* -----------------------------------------------
         Parse values
      ------------------------------------------------ */

      const keyBytes = parseBytes(
        key,
        keyEncoding
      );

      const ciphertextBytes =
        parseBytes(
          ciphertext,
          ciphertextEncoding
        );

      const ivBytes =
        mode !== "ECB"
          ? parseBytes(
              iv,
              ivEncoding
            )
          : undefined;

      /* -----------------------------------------------
         GCM
      ------------------------------------------------ */

      if (mode === "GCM") {
        const tagBytes = parseBytes(
          authTag,
          authTagEncoding
        );

        const decrypted =
          await decryptGCM({
            ciphertext:
              ciphertextBytes,
            key: keyBytes,
            nonce: ivBytes!,
            tag: tagBytes,
          });

        const result = formatOutput(
          decrypted,
          outputFormat
        );

        setOutput(result);

        return;
      }

      /* -----------------------------------------------
         CBC / CTR / ECB
      ------------------------------------------------ */

      const decrypted =
        decryptCryptoJS({
          ciphertext:
            ciphertextBytes,
          key: keyBytes,
          iv: ivBytes,
          mode,
        });

      const result = formatOutput(
        decrypted,
        outputFormat
      );

      setOutput(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to decrypt the data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const handleClear = () => {
    setKey("");
    setIv("");
    setCiphertext("");
    setAuthTag("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  /* =======================================================
     COPY
  ======================================================= */

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(
        output
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setError(
        "Unable to copy output."
      );
    }
  };

  /* =======================================================
     MODE DESCRIPTION
  ======================================================= */

  const modeDescription = {
    GCM: "Authenticated encryption. Requires a nonce and authentication tag.",
    CBC: "Common block mode. Uses a 16-byte IV and PKCS7 padding.",
    CTR: "Stream-like mode. Uses a 16-byte counter/IV.",
    ECB: "Simple block mode. No IV required.",
  }[mode];

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <div className="mx-auto max-w-7xl px-5 py-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-violet-400/10
                bg-violet-400/[0.07]
                text-violet-300
              "
            >
              <UnlockKeyhole size={18} />
            </div>

            <div>
              <h1 className="text-sm font-semibold">
                AES Decrypter
              </h1>

              <p className="mt-0.5 text-[10px] text-neutral-600">
                Decrypt AES encrypted data
                directly in your browser
              </p>
            </div>
          </div>

          <div
            className="
              hidden items-center gap-2
              rounded-lg
              border border-emerald-400/10
              bg-emerald-400/[0.04]
              px-3 py-2
              text-[9px]
              text-emerald-300/70
              sm:flex
            "
          >
            <ShieldCheck size={13} />
            Local processing
          </div>
        </header>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* =================================================
              INPUT PANEL
          ================================================= */}

          <section
            className="
              rounded-2xl
              border border-white/[0.07]
              bg-white/[0.02]
              p-4
            "
          >
            {/* AES MODE */}

            <div>
              <label className="mb-2 block text-[10px] font-medium text-neutral-500">
                Encryption Mode
              </label>

              <div className="grid grid-cols-4 gap-2">
                {MODES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setError("");
                    }}
                    className={`
                      rounded-lg
                      border
                      px-2 py-2
                      text-[9px]
                      font-medium
                      transition
                      ${
                        mode === item
                          ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
                          : "border-white/[0.06] bg-white/[0.02] text-neutral-500 hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[8px] leading-4 text-neutral-700">
                {modeDescription}
              </p>
            </div>

            {/* KEY */}

            <InputField
              label="Secret Key"
              value={key}
              onChange={(value) => {
                setKey(value);
                setError("");
              }}
              encoding={keyEncoding}
              onEncodingChange={
                setKeyEncoding
              }
              placeholder="Enter your AES key..."
              type={
                showKey
                  ? "text"
                  : "password"
              }
              action={
                <button
                  type="button"
                  onClick={() =>
                    setShowKey(
                      (value) => !value
                    )
                  }
                  className="
                    text-neutral-600
                    transition
                    hover:text-neutral-300
                  "
                >
                  {showKey ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              }
            />

            {/* IV / NONCE */}

            {mode !== "ECB" && (
              <InputField
                label={
                  mode === "GCM"
                    ? "Nonce / IV"
                    : "Initialization Vector (IV)"
                }
                value={iv}
                onChange={(value) => {
                  setIv(value);
                  setError("");
                }}
                encoding={ivEncoding}
                onEncodingChange={
                  setIvEncoding
                }
                placeholder={
                  mode === "GCM"
                    ? "Usually 12 bytes..."
                    : "Exactly 16 bytes..."
                }
                type={
                  showIv
                    ? "text"
                    : "password"
                }
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setShowIv(
                        (value) => !value
                      )
                    }
                    className="
                      text-neutral-600
                      transition
                      hover:text-neutral-300
                    "
                  >
                    {showIv ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                }
              />
            )}

            {/* GCM TAG */}

            {mode === "GCM" && (
              <InputField
                label="Authentication Tag"
                value={authTag}
                onChange={(value) => {
                  setAuthTag(value);
                  setError("");
                }}
                encoding={
                  authTagEncoding
                }
                onEncodingChange={
                  setAuthTagEncoding
                }
                placeholder="Usually 16 bytes..."
                type={
                  showTag
                    ? "text"
                    : "password"
                }
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setShowTag(
                        (value) => !value
                      )
                    }
                    className="
                      text-neutral-600
                      transition
                      hover:text-neutral-300
                    "
                  >
                    {showTag ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                }
              />
            )}

            {/* CIPHERTEXT */}

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[10px] font-medium text-neutral-500">
                  Ciphertext
                </label>

                <EncodingSelect
                  value={
                    ciphertextEncoding
                  }
                  onChange={
                    setCiphertextEncoding
                  }
                />
              </div>

              <textarea
                value={ciphertext}
                onChange={(event) => {
                  setCiphertext(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="Paste encrypted data here..."
                spellCheck={false}
                className="
                  h-36 w-full resize-none
                  rounded-xl
                  border border-white/[0.07]
                  bg-black/20
                  p-3
                  font-mono
                  text-[11px]
                  leading-5
                  text-neutral-300
                  outline-none
                  placeholder:text-neutral-700
                  focus:border-violet-400/20
                "
              />
            </div>

            {/* ACTIONS */}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleDecrypt}
                disabled={loading}
                className="
                  flex flex-1
                  items-center justify-center
                  gap-2
                  rounded-xl
                  bg-violet-500
                  px-4 py-2.5
                  text-[10px]
                  font-medium
                  text-white
                  transition
                  hover:bg-violet-400
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <UnlockKeyhole size={14} />

                {loading
                  ? "Decrypting..."
                  : "Decrypt"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="
                  flex items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border border-white/[0.07]
                  bg-white/[0.02]
                  px-4
                  text-[10px]
                  text-neutral-500
                  transition
                  hover:bg-white/[0.05]
                  hover:text-neutral-300
                "
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  mt-4 flex items-start gap-2
                  rounded-xl
                  border border-red-400/10
                  bg-red-400/[0.04]
                  p-3
                  text-[10px]
                  leading-5
                  text-red-300/80
                "
              >
                <AlertCircle
                  size={14}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}
          </section>

          {/* =================================================
              OUTPUT PANEL
          ================================================= */}

          <section
            className="
              flex min-h-[500px]
              flex-col
              rounded-2xl
              border border-white/[0.07]
              bg-white/[0.02]
            "
          >
            <div
              className="
                flex items-center
                justify-between
                border-b border-white/[0.06]
                px-4 py-3
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    bg-emerald-400/[0.07]
                    text-emerald-300
                  "
                >
                  <Check size={13} />
                </div>

                <span className="text-[10px] font-medium text-neutral-400">
                  Decrypted Output
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={outputFormat}
                  onChange={(event) =>
                    setOutputFormat(
                      event.target
                        .value as OutputFormat
                    )
                  }
                  className="
                    rounded-lg
                    border border-white/[0.06]
                    bg-[#111318]
                    px-2 py-1.5
                    text-[9px]
                    text-neutral-500
                    outline-none
                  "
                >
                  <option value="utf8">
                    UTF-8
                  </option>

                  <option value="hex">
                    HEX
                  </option>

                  <option value="base64">
                    Base64
                  </option>
                </select>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!output}
                  className="
                    flex items-center
                    gap-1.5
                    rounded-lg
                    border border-white/[0.06]
                    bg-white/[0.02]
                    px-2.5 py-1.5
                    text-[9px]
                    text-neutral-500
                    transition
                    hover:bg-white/[0.05]
                    disabled:opacity-30
                  "
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={output}
              readOnly
              spellCheck={false}
              placeholder="Your decrypted data will appear here..."
              className="
                min-h-0 flex-1
                resize-none
                bg-transparent
                p-4
                font-mono
                text-[11px]
                leading-5
                text-emerald-300/80
                outline-none
                placeholder:text-neutral-700
              "
            />

            <div
              className="
                flex items-center gap-2
                border-t border-white/[0.06]
                px-4 py-2.5
                text-[8px]
                text-neutral-700
              "
            >
              <ShieldCheck size={11} />

              Decryption happens entirely
              inside your browser.
            </div>
          </section>
        </div>

        {/* =================================================
            INFO CARDS
        ================================================= */}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <InfoCard
            icon={<KeyRound size={14} />}
            title="AES Key"
            text="Use a 128, 192 or 256-bit raw key."
          />

          <InfoCard
            icon={<RotateCcw size={14} />}
            title={
              mode === "GCM"
                ? "GCM Nonce"
                : "Initialization Vector"
            }
            text={
              mode === "GCM"
                ? "A 12-byte nonce is recommended."
                : mode === "ECB"
                  ? "ECB does not require an IV."
                  : "CBC and CTR require 16 bytes."
            }
          />

          <InfoCard
            icon={<ShieldCheck size={14} />}
            title="Private"
            text="No encrypted data is sent to a server."
          />
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  onChange,
  encoding,
  onEncodingChange,
  placeholder,
  type = "text",
  action,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  encoding: Encoding;
  onEncodingChange: (
    value: Encoding
  ) => void;
  placeholder: string;
  type?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10px] font-medium text-neutral-500">
          {label}
        </label>

        <EncodingSelect
          value={encoding}
          onChange={onEncodingChange}
        />
      </div>

      <div
        className="
          flex items-center
          rounded-xl
          border border-white/[0.07]
          bg-black/20
          focus-within:border-violet-400/20
        "
      >
        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          spellCheck={false}
          className="
            min-w-0 flex-1
            bg-transparent
            px-3 py-2.5
            font-mono
            text-[11px]
            text-neutral-300
            outline-none
            placeholder:text-neutral-700
          "
        />

        {action && (
          <div className="pr-3">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ENCODING SELECT
========================================================= */

function EncodingSelect({
  value,
  onChange,
}: {
  value: Encoding;
  onChange: (
    value: Encoding
  ) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value as Encoding
        )
      }
      className="
        rounded-md
        border border-white/[0.06]
        bg-[#111318]
        px-2 py-1
        text-[8px]
        text-neutral-600
        outline-none
      "
    >
      {ENCODINGS.map((encoding) => (
        <option
          key={encoding}
          value={encoding}
        >
          {encoding === "base64"
            ? "Base64"
            : encoding === "hex"
              ? "HEX"
              : "Text"}
        </option>
      ))}
    </select>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-xl
        border border-white/[0.06]
        bg-white/[0.02]
        p-3
      "
    >
      <div
        className="
          flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-lg
          bg-white/[0.04]
          text-neutral-500
        "
      >
        {icon}
      </div>

      <div>
        <div className="text-[9px] font-medium text-neutral-400">
          {title}
        </div>

        <div className="mt-0.5 text-[8px] leading-4 text-neutral-700">
          {text}
        </div>
      </div>
    </div>
  );
}