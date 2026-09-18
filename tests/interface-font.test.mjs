import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const projectRoot = new URL("..", import.meta.url);

test("uses Pixel Sport for interactive interface elements", () => {
  const css = readFileSync(
    new URL("src/theme/global.css", projectRoot),
    "utf8",
  );

  assert.match(css, /font-family: "Pixel Sport";/);
  assert.match(
    css,
    /a,\nbutton \{\n  font-family: "Pixel Sport", monospace;/,
  );
  assert.match(
    css,
    /input,\nselect,\ntextarea \{\n  font-family: "Pixel Sport", monospace;/,
  );
  assert.ok(existsSync(new URL("public/fonts/PixelSport-Regular.ttf", projectRoot)));
  assert.ok(existsSync(new URL("public/fonts/PixelSport-LICENSE.txt", projectRoot)));
});

test("uses the requested interface font sizes", () => {
  const css = readFileSync(
    new URL("src/theme/global.css", projectRoot),
    "utf8",
  );

  assert.match(
    css,
    /a,\nbutton \{\n  font-family: "Pixel Sport", monospace;\n  font-size: 16px;/,
  );
  assert.match(
    css,
    /\.system-menus button,\n\.dropdown button,\n\.window-sidebar \{\n  font-family: "Pixel Sport", monospace;\n  font-size: 14px;/,
  );
});
