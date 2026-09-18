import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("resets the game by invoking its factory instead of passing it to React's setter", async () => {
  const component = await readFile(
    new URL("../src/components/SnakeGame/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(component, /onClick=\{\(\) => setGame\(\(\) => createGame\(\)\)\}/);
  assert.match(component, /className="snake-game-over"/);
  assert.match(component, /role="alert"/);
});
