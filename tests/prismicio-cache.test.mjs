import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("refreshes published Prismic content even if the webhook is unavailable", async () => {
  const source = await readFile(
    new URL("../src/prismicio.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /next:\s*\{\s*tags:\s*\["prismic"\],\s*revalidate:\s*60\s*\}/);
  assert.doesNotMatch(source, /cache:\s*"force-cache"/);
});
