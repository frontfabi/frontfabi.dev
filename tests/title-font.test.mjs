import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const projectRoot = new URL("..", import.meta.url);

test("uses Born2bSporty FS for display and interface text", () => {
  const css = readFileSync(new URL("src/theme/global.css", projectRoot), "utf8");

  assert.match(css, /font-family: "Born2bSporty FS";/);
  assert.match(css, /font-family: "Born2bSporty FS", monospace;/);
  assert.ok(existsSync(new URL("public/fonts/Born2bSportyFS.otf", projectRoot)));
  assert.ok(existsSync(new URL("public/fonts/Born2bSportyFS-LICENSE.txt", projectRoot)));
});
