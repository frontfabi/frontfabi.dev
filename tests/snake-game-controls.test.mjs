import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("lays out snake controls in a WASD-style cross", async () => {
  const css = await readFile(
    new URL("../src/theme/global.css", import.meta.url),
    "utf8",
  );

  assert.match(css, /\.snake-controls button:first-child\s*\{\s*grid-column:\s*2;\s*\}/);
  assert.match(
    css,
    /\.snake-controls button:nth-child\(2\)\s*\{\s*grid-column:\s*1;\s*grid-row:\s*2;\s*\}/,
  );
  assert.match(
    css,
    /\.snake-controls button:nth-child\(3\)\s*\{\s*grid-column:\s*2;\s*grid-row:\s*2;\s*\}/,
  );
  assert.match(
    css,
    /\.snake-controls button:nth-child\(4\)\s*\{\s*grid-column:\s*3;\s*grid-row:\s*2;\s*\}/,
  );
  assert.doesNotMatch(css, /\.snake-controls \.snake-reset/);
  assert.match(css, /\.snake-game-over \.snake-reset\s*\{/);
  assert.doesNotMatch(css, /\.snake-game-header \.snake-reset/);
});
