import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses the dock as the single mobile navigation with game access", async () => {
  const [desktop, css] = await Promise.all([
    readFile(new URL("../src/components/Desktop/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/theme/global.css", import.meta.url), "utf8"),
  ]);

  assert.match(desktop, /className="mobile-dock-game"/);
  assert.match(desktop, /onClick=\{\(\) => launch\("game"\)\}/);
  assert.match(desktop, /className="dock-settings"/);
  assert.match(css, /\.desktop-icons\s*\{\s*display:\s*none;\s*\}/);
  assert.match(css, /\.dock \.mobile-dock-game\s*\{\s*display:\s*flex;/);
  assert.match(css, /\.dock \.dock-settings\s*\{\s*display:\s*none;/);
});
