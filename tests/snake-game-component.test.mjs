import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("offers restart only from the game-over panel", async () => {
  const component = await readFile(
    new URL("../src/components/SnakeGame/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(component, /className="snake-reset"/);
  assert.match(component, /className="snake-game-over"[\s\S]*className="snake-reset"/);
  assert.match(component, /<div className="snake-game-header">\s*<span>score: \{game.score\}<\/span>\s*<span>game.py<\/span>\s*<\/div>/);
  assert.doesNotMatch(component, /<div className="snake-controls"[\s\S]*className="snake-reset"/);
  assert.match(component, /className="snake-game-over"/);
  assert.match(component, /role="alert"/);
});
