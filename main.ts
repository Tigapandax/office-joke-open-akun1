import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const MAX_CHARS = 200;
const MIN_CHARS = 20;
const MIN_WORDS = 4;

const raw = readFileSync(new URL("./one-line.txt", import.meta.url), "utf8");
const line = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

// Count in code points so an astral-plane character counts once, not twice.
const chars = [...line];
const words = line.split(/\s+/).filter(Boolean);

const failures: string[] = [];
const reject = (message: string) => failures.push(message);

if (line.trim().length === 0) reject("line is empty");
if (chars.length > MAX_CHARS)
  reject(`line is ${chars.length} characters, over the ${MAX_CHARS} cap`);
if (chars.length < MIN_CHARS)
  reject(`line is only ${chars.length} characters, too short to be a joke`);
if (words.length < MIN_WORDS)
  reject(`line has only ${words.length} words, need at least ${MIN_WORDS}`);
if (line.includes("\n") || line.includes("\r"))
  reject("line spans more than one line");
if (line !== line.trim()) reject("line has a leading or trailing space");
if (!/[.!?]$/.test(line)) reject("line does not end with terminal punctuation");
if (line.includes("  ")) reject("line has a doubled space");
if (line.includes("\t")) reject("line has a tab character");
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(line))
  reject("line has a control character");

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}

// The sealed scorer reads /output/entry.txt (program/v1 harness), never
// stdout: write the validated line there and keep the stdout copy for humans.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, line, "utf8");

console.log(line);
console.log(`OK: ${chars.length}/${MAX_CHARS} characters, ${words.length} words, single line.`);
