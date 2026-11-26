import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

// Read the single joke line (strip one trailing newline only).
const raw = readFileSync(new URL("./one-line.txt", import.meta.url), "utf8");
const line = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

function fail(reason: string): never {
  console.error(`FAIL: ${reason}`);
  process.exit(1);
}

// Count characters as code points, not UTF-16 units, so the 200 cap is
// honest for emoji and other non-BMP characters.
const charCount = [...line].length;

// 1. Must not be empty or only whitespace.
if (line.trim().length === 0) fail("empty line");
// 2. At most 200 characters, per the bounty cap.
if (charCount > 200) fail(`${charCount}/200 characters`);
// 3. Exactly one line: no embedded newline or carriage return.
if (line.includes("\n") || line.includes("\r")) fail("not a single line");
// 4. No leading or trailing space.
if (line !== line.trim()) fail("leading or trailing space");
// 5. Must end with terminal punctuation.
if (!/[.!?]$/.test(line)) fail("line must end with terminal punctuation");
// 6. No doubled spaces inside the line.
if (line.includes("  ")) fail("double space inside line");
// 7. No other control characters: a one-liner must be printable text.
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(line)) fail("control character inside line");

// The sealed scorer reads /output/entry.txt (program/v1 harness): write the
// validated line there and keep the stdout copy for humans.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, line, "utf8");

console.log(line);
console.log(`OK: ${charCount}/200 characters, single line.`);
