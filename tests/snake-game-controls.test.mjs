import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("lays out snake controls in a WASD-style cross", async () => {
  const css = await readFile(
    new URL("../src/theme/global.css", import.meta.url),
    "utf8",
  );

  assert.match(css, /\.snake-controls button:first-child\s*\{\s*grid-column:\s*2;\s*\}/);
  assert.match(css, /\.snake-controls \.snake-reset\s*\{\s*grid-column:\s*1\s*\/\s*-1;\s*\}/);
});
