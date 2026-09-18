import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("404 screen keeps recovery actions and motion-safe system failure cues", async () => {
  const [screen, css] = await Promise.all([
    readFile(new URL("../src/app/not-found.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/theme/global.css", import.meta.url), "utf8"),
  ]);

  assert.match(screen, /FATAL ERROR 0x404/);
  assert.match(screen, /A página que você procurou não existe ou foi movida\./);
  assert.match(screen, /KERNEL PANIC/);
  assert.match(screen, /NotFoundStatus/);
  assert.match(screen, /href="\/"/);
  assert.match(css, /\.not-found-marquee/);
  assert.match(css, /\.not-found-glitch/);
  assert.match(css, /\.not-found-panic p\s*\{[\s\S]*font-family: "Born2bSporty FS"/);
  assert.match(screen, /not-found-attention/);
  assert.match(css, /@keyframes not-found-attention/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(
    css,
    /\.not-found-glitch::before,\n  \.not-found-glitch::after \{\n    display: none;/,
  );
});

test("404 status feed rotates harmless simulated system errors", async () => {
  const status = await readFile(
    new URL("../src/components/NotFoundStatus/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(status, /"use client"/);
  assert.match(status, /Math\.random/);
  assert.match(status, /aria-label="Status do sistema"/);
});
