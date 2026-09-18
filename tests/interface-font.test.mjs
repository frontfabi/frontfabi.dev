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
    /a,\nbutton,\ninput,\nselect,\ntextarea \{\n  font-family: "Pixel Sport", monospace;/,
  );
  assert.ok(existsSync(new URL("public/fonts/PixelSport-Regular.ttf", projectRoot)));
  assert.ok(existsSync(new URL("public/fonts/PixelSport-LICENSE.txt", projectRoot)));
});
